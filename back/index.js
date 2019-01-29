const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
import log from 'npmlog';

import { teams, passwordChecker, poulesConfig, port, problemes } from './config.js';

// Teams connectées, avec leur socketid
let connectedTeams = [];
// Valeurs tirées par les équipes pour former les poules
let poulesValue = [];
// Array qui contiendra les poules
let poules = [];
// Tableau des tirages par équipe
let tirages = {};

log.info('config', 'teams: %s', teams.join(', '));
// log.info('config', 'teamPassword: %s', passwordChecker);
log.info('config', 'poules: %s', poulesConfig.join(' '));

app.get('/', (_, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    log.info('socket', 'Nouvelle connexion');
    socket.emit('total', teams.length);
    socket.emit('poulesConfig', poulesConfig);
    socket.emit('problemes', problemes);
    socket.emit('connectedstatus', false);

    socket.on('disconnect', () => {
        log.info('socket', 'Socket déconnectée');
        connectedTeams = connectedTeams.filter(e => socket.id !== e.socketid);
        log.info('connected', `Équipes connectées: ${connectedTeams.length ? connectedTeams.map(e => e.name)
            .join(' ') : 'aucune'}`);
        io.emit('connected', connectedTeams.map(({ name }) => name));
    });
    socket.on('login', ({ trigram, password }) => {
        if (trigram && trigram.length !== 3 && trigram.match(/[^A-Z]/g) !== null) {
            log.info('login', 'Trigramme invalide reçu:', trigram);
            socket.emit('login', false);
        }
        if (!password) {
            log.info('login', 'Aucun mot de passe reçu');
        }
        if (teams.includes(trigram)
            && passwordChecker(password, trigram)
            && !connectedTeams.some(e => e.name === trigram)) {
            log.info('login', 'Connexion acceptée:', trigram);
            socket.emit('login', { trigram, success: true });
            socket.join(trigram);
            socket.join('teams');
            connectedTeams.push({ name: trigram, socketid: socket.id });
            io.to('teams').emit('connected', connectedTeams.map(({ name }) => name));
            log.info('connected', `Équipes connectées: ${connectedTeams.map(e => e.name).join(' ')}`);
            if (poules.length > 0) {
                let poule = poules.findIndex(p => p.includes(trigram)) + 1;
                log.info('login', 'Redirection de %s vers la page de tirage de la poule %s', trigram, poule);
                socket.emit('tirage', poule);
            } else if (connectedTeams.length === teams.length) {
                io.to('teams').emit('poules');
                log.notice('login', 'Toutes les équipes sont connectées');
            }
        } else {
            log.info('login', 'Refus de connexion pour %s (mot de passe: %s)', trigram, password);
            socket.emit('login', { trigram, success: false });
        }
    });
    socket.on('poulesDice', () => {
        // Random côté serveur, pour éviter la triche
        const value = Math.floor(Math.random() * 100);
        if (!isConnectedTeam(socket)) return log.info('poules', 'rejeté: %s (équipe inconnue)', value);
        const name = getNameFromSocketId(socket.id);
        poulesValue.push({ name, randnum: value });
        poulesValue.sort(({ randnum: a }, { randnum: b }) => a - b);
        io.emit('poulesValue', poulesValue);
        log.info('poules', 'L\'équipe %s a tiré %s', getNameFromSocketId(socket.id), value);
        log.info('poules', 'poulesValue:', poulesValue);
        // Toutes les équipes ont tiré leur nombre
        if (poulesValue.length === teams.length) {
            let poulesCopy = poulesValue.slice(0);
            poulesConfig.forEach(el =>
                poules.push(poulesCopy.splice(0, el).map(({ name }) => name)));
            log.notice('poules', 'Fin du choix des poules. Résultats: %j', poules);
            tirages = getTirageObject(poules);
            // On prévient le frontend des équipes de passer au tirage de leur poule
            setTimeout(() => {
                poules.forEach((teams, poule) => {
                    teams.forEach(team => io.to(team).emit('tirage', poule + 1));
                });
            }, 2000);
        }
    });
    socket.on('pickProblem', () => {
        if(!isConnectedTeam(socket)) return log.info('tirage', 'rejet d\'un tirage');
        const team = getNameFromSocketId(socket.id);
        const poule = poules.findIndex(p => p.includes(team)) + 1;
        log.info('tirage', 'Tirage pour l\'équipe %s, en poule %s', team, poule);
        const pbs = availProblems(poule);
        const pb = pbs[Math.floor(Math.random() * pbs.length)];
        io.emit('problemPicked', {team, pb});
        changePbStatus(poule, team, pb, -2);
    });
});

http.listen(port, () => {
    log.info('http', 'Listening on *:' + port);
});

/**
 * Vérifie qu'une équipe est actuellement connectée
 *
 * @param {SocketIO.Socket} socket socket à vérifier
 * @returns {boolean} true si connecté, false sinon
 */
const isConnectedTeam = socket => Object.keys(socket.rooms).includes('teams');

/**
 * Récupère le trigramme d'une équipe à partir de l'id socketio
 *
 * @param {String} socketid
 * @returns {String} trigramme
 */
const getNameFromSocketId = socketid => connectedTeams.find(e => e.socketid === socketid).name;
/**
 * Génère un objet pour les tirages à partir des poules formées
 *
 * @param {Array} poules matrice de noms d'équipe: chaque ligne correspond à une poule
 * @returns {Object} objet tirage
 */
const getTirageObject = poules => {
    let tiragesObject = {};
    poules.forEach((poule, i) => {
        tiragesObject[i + 1] = {
            pb: poule.map(team => {
                const obj = {
                    name: team,
                };
                for (let p = 1; p <= problemes; p++) {
                    // 0 par défaut, -2 en attente, -1 refusé, 1 accpeté
                    obj['p' + p] = 0;
                }
                return obj;
            }),
            team: poule[0]
        };
    });
    return tiragesObject;
};

/**
 * Retourne les problèmes disponibles sur une poule donnée
 *
 * @param {Number} poule
 * @returns {Array} Tableau de problèmes disponibles
 */
const availProblems = poule => {
    let taken = [];
    tirages[poule].pb.forEach(team => {
        Object.keys(team).filter(key => key.match(/p\d+/)).forEach(pkey => {
            if(team[pkey] === 1) taken.push(parseInt(pkey.slice(1)));
        });
    });
    return [...new Array(problemes)].map((_, i) => i+1).filter(n => !taken.includes(n));
};

/**
 * Met à jour le statut d'un problème
 *
 * @param {Number} poule
 * @param {String} team
 * @param {Number} pb
 * @param {Number} status -2, -1, 0, 1
 */
const changePbStatus = (poule, team, pb, status) => {
    const index = tirages[poule].pb.findIndex(o => o.name === team);
    tirages[poule].pb[index]['p' + pb] = status;
};

setInterval(() => {
    io.emit('poulesValue', poulesValue);
    io.emit('connected', connectedTeams.map(({ name }) => name));
    io.emit('tirages', tirages);
}, 5000);
