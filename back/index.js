const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
import log from 'npmlog';

const { teams, passwordChecker, poulesConfig } = require('./config.js');

let connectedTeams = [];
let poulesValue = [];
let poules = [];

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
    socket.emit('connectedstatus', false);

    socket.on('disconnect', () => {
        log.info('socket', 'Socket déconnectée');
        connectedTeams = connectedTeams.filter(e => socket.id == e.socketid);
        log.info('connected', `Équipes connectées: ${connectedTeams.length ? connectedTeams.map(e => e.name).join(' ') : 'none'}`);
        io.emit('connected', connectedTeams.map(({name}) => name));
    });
    socket.on('login', ({ trigram, password }) => {
        if (trigram && trigram.length !== 3 && trigram.match(/[^A-Z]/g) !== null) {
            log.info('login', 'Trigramme invalide reçu:', trigram);
            socket.emit('login', false);
        }
        if (!password) {
            log.info('login', 'Aucun mot de passe reçu');
        }
        if (teams.includes(trigram) && passwordChecker(password, trigram) && !connectedTeams.some(e => e.name === trigram)) {
            log.info('login', 'Connexion acceptée:', trigram);
            socket.emit('login', { trigram, success: true });
            socket.join('teams');
            connectedTeams.push({ name: trigram, socketid: socket.id });
            io.to('teams').emit('connected', connectedTeams.map(({name}) => name));
            log.info('connected', `Équipes connectées: ${connectedTeams.map(e => e.name).join(' ')}`);
            if(connectedTeams.length === teams.length) {
                io.to('teams').emit('poules');
                log.notice('login', 'Toutes les équipes sont connectées');
            }
        } else {
            log.info('login', 'Refus de connexion pour %s (mot de passe: %s)', trigram, password);
            socket.emit('login', { trigram, success: false });
        }
    });
    socket.on('poulesDice', () => {
        // Random côté serveur, pour éviter les tricheries
        const value = Math.floor(Math.random() * 100);
        if(!isConnectedTeam(socket)) return log.info('poules', 'rejeté: %s (équipe inconnue)', value);
        const name = getNameFromSocketId(socket.id);
        poulesValue.push({name, randnum: value});
        poulesValue.sort(({randnum: a}, {randnum: b}) => a-b);
        io.emit('poulesValue', poulesValue);
        log.info('poules', 'L\'équipe %s a tiré %s', getNameFromSocketId(socket.id), value);
        log.info('poules', 'poulesValue:', poulesValue);
        // Toutes les équipes ont tiré leur nombre
        if (poulesValue.length === teams.length) {
            setTimeout(() => io.to('teams').emit('tirage'), 2000);
            let poulesCopy = poulesValue.slice(0);
            poulesConfig.forEach(el => poules.push(poulesCopy.splice(0, el).map(({name}) => ({name, socketid: getSocketIdFromName(name)}))));
            log.notice('poules', 'Fin du choix des poules. Les poules sont: %j', poules);
        }
    });
});

http.listen(8081, () => {
    log.info('http', 'Listening on *:8081');
});

const isConnectedTeam = socket => Object.keys(socket.rooms).includes('teams');
const getNameFromSocketId = socketid => connectedTeams.find(e => e.socketid === socketid).name;
const getSocketIdFromName = name => connectedTeams.find(e => e.name === name).socketid;

setInterval(() => {
    io.emit('poulesValue', poulesValue);
    io.emit('connected', connectedTeams.map(({name}) => name));
}, 5000);
