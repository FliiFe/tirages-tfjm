import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        connectedTeams: [],
        connected: false,
        total: 0,
        poulesConfig: [],
        poulesValue: [],
        spectator: true,
    },
    mutations: {
        SOCKET_CONNECTED (state, connectedTeams) {
            state.connectedTeams = connectedTeams;
        },
        SOCKET_TOTAL (state, total) {
            state.total = total;
        },
        connected (state, connected) {
            state.connected = connected;
        },
        SOCKET_POULESCONFIG (state, poulesConfig) {
            state.poulesConfig = poulesConfig
        },
        SOCKET_POULESVALUE (state, poulesValue) {
            state.poulesValue = poulesValue;
        },
        SOCKET_CONNECTEDSTATUS (state, connected) {
            state.connected = connected;
            if (!router.currentRoute.path.includes('spectate')) router.push('/')
        },
        setSpectator (state, spectator) {
            state.spectator = spectator
        }
    },
    actions: {
        socket_poules () {
            router.push('/poules')
        },
        returnHomeIfNecessary (store) {
           if(!store.state.connected) router.push('/')
        },
        socket_tirage (_, poule) {
            router.push('/tirage/' + poule);
        }
    },
    strict: true
})
