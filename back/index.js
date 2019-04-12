import express from 'express'
import log from 'npmlog'
import path from 'path'
import basicAuth from 'express-basic-auth'
import bodyParser from 'body-parser'
import fs from 'fs'

log.on('log', ({ level, prefix, message }) => {
    fs.appendFile('output.log', `${level} ${prefix} ${message}\n`, e => {
        if (e) console.trace(e)
    })
})

fs.unlink('output.log', e => { if (e) console.trace(e) })

const app = express()
const http = require('http').Server(app)

const port = parseInt(process.argv[2]) || 8081
const tournoi = process.argv[3] || 'front'
const io = require('socket.io')(http, { path: '/' + tournoi + '/socket.io' })

let teams = []
let poulesConfig = []
let problemes = 8
let passwords = {}
let tour2 = false
let tour2exclusion = {}
// Teams connectées, avec leur socketid
let connectedTeams = []
// Valeurs tirées par les équipes pour former les poules
let poulesValue = []
// Array qui contiendra les poules
let poules = []
// Tableau des tirages par équipe
let tirages = {}
poulesConfig.forEach((_, i) => tirages[i + 1] = {})

log.info('tirage', 'Démarrage du serveur.')
log.info('config', 'tournoi: %s', tournoi)

// Allow CORS for testing purposes
// app.use((_, res, next) => {
//     res.header('Access-Control-Allow-Origin', '*')
//     next()
// })

app.use('/' + tournoi, express.static('../' + tournoi + '/dist'))
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/' + tournoi + '/orga', basicAuth({ challenge: true, users: { orga: process.env.ORGA_PWD || 'orga' } }))

app.use('/' + tournoi + '/orga/data.json', (_, res) => {
    res.send(JSON.stringify({ teams, poulesConfig, problemes, passwords, tournoi, tour2, tour2exclusion }))
})

app.use('/' + tournoi + '/orga/log', (_, res) => {
    res.sendFile(path.resolve('./output.log'))
})

app.use('/' + tournoi + '/orga/submit', (req, res) => {
    if (req.body.teams && req.body.problemes && req.body.poulesConfig) {
        updateConfig(req.body)
        res.send('OK')
    } else {
        res.status(400).send('Failed.')
        log.info('info', req.body)
    }
})

app.use('/' + tournoi + '/orga/', express.static('../orga/dist'))

app.get('/' + tournoi + '/*', (_, response) => response.sendFile(path.resolve('../' + tournoi + '/dist/index.html')))

io.on('connection', socket => {
    log.info('socket', 'Nouvelle connexion')
    socket.emit('total', teams.length)
    socket.emit('poulesConfig', poulesConfig)
    socket.emit('problemes', problemes)
    socket.emit('connectedstatus', false)

    socket.on('disconnect', () => {
        log.info('socket', 'Socket déconnectée')
        connectedTeams = connectedTeams.filter(e => socket.id !== e.socketid)
        log.info('connected', `Équipes connectées: ${connectedTeams.length ? connectedTeams.map(e => e.name)
            .join(' ') : 'aucune'}`)
        io.emit('connected', connectedTeams.map(({ name }) => name))
    })
    socket.on('login', ({ trigram, password }) => {
        if (trigram && trigram.length !== 3 && trigram.match(/[^A-Z]/g) !== null) {
            log.info('login', 'Trigramme invalide reçu:', trigram)
            socket.emit('login', false)
        }
        if (!password) {
            log.info('login', 'Aucun mot de passe reçu')
        }
        if (teams.includes(trigram)
            && passwordChecker(password, trigram)
            && !connectedTeams.some(e => e.name === trigram)) {
            log.info('login', 'Connexion acceptée:', trigram)
            socket.emit('login', { trigram, success: true })
            socket.join(trigram)
            socket.join('teams')
            connectedTeams.push({ name: trigram, socketid: socket.id })
            io.to('teams').emit('connected', connectedTeams.map(({ name }) => name))
            log.info('connected', `Équipes connectées: ${connectedTeams.map(e => e.name).join(' ')}`)
            if (poules.length > 0) {
                let poule = poules.findIndex(p => p.includes(trigram)) + 1
                log.info('login', 'Redirection de %s vers la page de tirage de la poule %s', trigram, poule)
                socket.emit('tirage', poule)
            } else if (connectedTeams.length === teams.length) {
                io.to('teams').emit('poules')
                log.notice('login', 'Toutes les équipes sont connectées')
            }
        } else {
            log.info('login', 'Refus de connexion pour %s (mot de passe: %s)', trigram, password)
            socket.emit('login', { trigram, success: false })
        }
    })
    socket.on('poulesDice', () => {
        // Random côté serveur, pour éviter la triche
        const value = Math.floor(Math.random() * 100)
        if (!isConnectedTeam(socket)) return log.info('poules', 'rejeté: %s (équipe inconnue)', value)
        const name = getNameFromSocketId(socket.id)
        poulesValue.push({ name, randnum: value })
        poulesValue.sort(({ randnum: a }, { randnum: b }) => a - b)
        io.emit('poulesValue', poulesValue)
        log.info('poules', 'L\'équipe %s a tiré %s', getNameFromSocketId(socket.id), value)
        log.info('poules', 'poulesValue:', poulesValue)
        // Toutes les équipes ont tiré leur nombre
        if (poulesValue.length === teams.length) {
            let poulesCopy = poulesValue.slice(0)
            poulesConfig.forEach(el =>
                poules.push(poulesCopy.splice(0, el).map(({ name }) => name)))
            log.notice('poules', 'Fin du choix des poules. Résultats: %j', poules)
            tirages = getTirageObject(poules)
            io.emit('tirages', tirages)
            // On prévient le frontend des équipes de passer au tirage de leur poule
            setTimeout(() => {
                poules.forEach((teams, poule) => {
                    teams.forEach(team => io.to(team).emit('tirage', poule + 1))
                })
            }, 2000)
        }
    })
    socket.on('pickProblem', () => {
        // TODO: Poule de 5 ?
        if (!isConnectedTeam(socket)) return log.info('tirage', 'rejet d\'un tirage')
        const team = getNameFromSocketId(socket.id)
        const poule = poules.findIndex(p => p.includes(team)) + 1
        log.info('tirage', 'Tirage pour l\'équipe %s, en poule %s', team, poule)
        // On enlève l'éventuel problème du tour 1. Note: on utilise != et pas !== pour la coercion de type (tour2exclusion[team] est un String)
        const pbs = tour2 ? availProblems(poule).filter(p => p != tour2exclusion[team]) : availProblems(poule)
        log.info('tirage', 'Problèmes disponibles: %s', pbs.join(', '))
        const pb = pbs[Math.floor(Math.random() * pbs.length)]
        io.emit('problemPicked', { team, pb })
        changePbStatus(poule, team, pb, -2)
        io.emit('tirages', tirages)
    })
    socket.on('acceptProblem', ({ ans, pb }) => {
        if (!isConnectedTeam(socket)) return log.info('tirage', 'rejet d\'un problème')
        const team = getNameFromSocketId(socket.id)
        const poule = poules.findIndex(p => p.includes(team)) + 1
        const pbRefused = hasPbBeenRefused(poule, team, pb)
        log.info('tirage', 'Réponse du problème %s pour l\'équipe %s dans la poule %s, ', pb, team, poule, ans ? 'accepté' : 'refusé')

        if (getPbStatus(poule, team, pb) !== -2)
            return log.info('tirage', 'rejet d\'un problème qui n\'étais pas en attente')

        log.info('tirage', 'Changement du statut du problème: %s', pb)
        changePbStatus(poule, team, pb, ans ? 1 : -1)
        if (ans) {
            tirages[poule].poule = tirages[poule].poule.filter(t => t !== team)
        }

        if (tirages[poule].poule.length === 0) {
            log.notice('tirage', 'Fin du tirage pour la poule %s', String.fromCharCode(poule + 64))
            poules[poule - 1].forEach(t => io.to(t).emit('end'))
            tirages[poule].team = ''
        } else if (ans || !pbRefused) {
            tirages[poule].poule.push(tirages[poule].poule.shift())
            tirages[poule].team = tirages[poule].poule[0]
        }

        io.emit('tirages', tirages)
    })
})

http.listen(port, '0.0.0.0', () => {
    log.info('http', 'Listening on *:' + port)
})

/**
 * Fonction qui vérifie le mot de passe d'une équipe
 *
 * @param {String} password mot de passe à vérifier
 * @param {String} team trigramme de l'équipe
 * @returns {boolean} true si le mot de passe est bon, false sinon
 */
const passwordChecker = (password, team) => passwords[team] === password

/**
 * Vérifie qu'une équipe est actuellement connectée
 *
 * @param {SocketIO.Socket} socket socket à vérifier
 * @returns {boolean} true si connecté, false sinon
 */
const isConnectedTeam = socket => Object.keys(socket.rooms).includes('teams')

/**
 * Récupère le trigramme d'une équipe à partir de l'id socketio
 *
 * @param {String} socketid
 * @returns {String} trigramme
 */
const getNameFromSocketId = socketid => connectedTeams.find(e => e.socketid === socketid).name
/**
 * Génère un objet pour les tirages à partir des poules formées
 *
 * @param {Array} poules matrice de noms d'équipe: chaque ligne correspond à une poule
 * @returns {Object} objet tirage
 */
const getTirageObject = poules => {
    let tiragesObject = {}
    poules.forEach((poule, i) => {
        tiragesObject[i + 1] = {
            pb: poule.map(team => {
                const obj = {
                    name: team,
                    refused: [],
                }
                for (let p = 1; p <= problemes; p++) {
                    // 0 par défaut, -2 en attente, -1 refusé, 1 accpeté
                    obj['p' + p] = 0
                }
                return obj
            }),
            team: poule[0],
            poule,
        }
    })
    return tiragesObject
}


/**
 * Compte le nombre d'occurrences de `el` dans `arr`
 *
 * @param {Array} arr liste d'éléments
 * @param el élément à compter
 * @returns {Number} nombre d'occurences
 */
const count = (arr, el) => arr.reduce((a, v) => v == el ? a + 1 : a, 0)

/**
 * Retourne les problèmes disponibles sur une poule donnée
 *
 * @param {Number} poule
 * @returns {Array} Tableau de problèmes disponibles
 */
const availProblems = poule => {
    let taken = []
    tirages[poule].pb.forEach(team => {
        Object.keys(team).filter(key => key.match(/p\d+/)).forEach(pkey => {
            if (team[pkey] === 1) taken.push(parseInt(pkey.slice(1)))
        })
    })
    const pblist = [...new Array(problemes)].map((_, i) => i + 1)
    if (tirages[poule].pb.length === 5) {
        log.info('tirage', 'Les problemes déjà tirés sont: %s', taken.join(', '))
        if (!pblist.some(p => count(taken, p) >= 2)) {
            // console.log('pas encore 2 pb identiques')
            return pblist.filter(n => count(taken, n) <= 1)
        }
    }
    return pblist.filter(n => !taken.includes(n))
}

/**
 * Met à jour le statut d'un problème
 *
 * @param {Number} poule
 * @param {String} team
 * @param {Number} pb
 * @param {Number} status -2, -1, 0, 1
 */
const changePbStatus = (poule, team, pb, status) => {
    const index = tirages[poule].pb.findIndex(o => o.name === team)
    tirages[poule].pb[index]['p' + pb] = status
    if (status === -1
        && !tirages[poule].pb[index].refused.includes(pb)) tirages[poule].pb[index].refused.push(pb)
}

/**
 * Obtient le statut d'un problème
 *
 * @param {Number} poule
 * @param {String} team
 * @param {Number} pb
 * @returns {Number} statut du problème
 */
const getPbStatus = (poule, team, pb) => {
    const index = tirages[poule].pb.findIndex(o => o.name === team)
    return tirages[poule].pb[index]['p' + pb]
}

/**
 * Permet de savoir si une équipe a déjà refusé un problème
 *
 * @param {Number} poule
 * @param {String} team
 * @param {Number} pb
 * @returns {Boolean}
 */
const hasPbBeenRefused = (poule, team, pb) => {
    const index = tirages[poule].pb.findIndex(o => o.name === team)
    return tirages[poule].pb[index].refused.includes(pb)
}

/**
 * Envoie les objets au client
 */
const updateClientsObject = () => {
    io.emit('poulesValue', poulesValue)
    io.emit('connected', connectedTeams.map(({ name }) => name))
    io.emit('tirages', tirages)
    io.emit('problemes', problemes)
    io.emit('total', teams.length)
    io.emit('poulesConfig', poulesConfig)
}

/**
 * Met à jour la config du serveur
 *
 * @param {Object} config Objet de config
 */
const updateConfig = (config) => {
    restartTirage()
    log.warn('config', 'Changement de la configuration !!')
    log.warn('config', 'Les équipes sont maintenant %s', config.teams.join(', '))
    log.warn('config', 'Il y a %s problèmes pour le tirage', config.problemes)
    log.warn('config', 'Configuration des poules: ', config.poulesConfig)
    if (config.passwords) log.warn('config', 'Mots de passes:', config.passwords)
    teams = config.teams
    problemes = config.problemes
    if (config.passwords) passwords = config.passwords
    poulesConfig = config.poulesConfig
    poulesConfig.forEach((_, i) => tirages[i + 1] = {})
    tour2 = !!config.tour2
    tour2exclusion = config.tour2exclusion
}

/**
 * Redémarre le tirage en cours
 *
 */
const restartTirage = () => {
    connectedTeams = []
    poulesValue = []
    poules = []
    tirages = {}
    updateClientsObject()
}

// Met à jour les objets côté client
setInterval(updateClientsObject, 5000)
