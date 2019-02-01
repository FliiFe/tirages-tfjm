import Vue from 'vue'
import Vuex from 'vuex'
import router from './router'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        connectedTeams: [],
        connected: false,
        trigram: '',
        total: 0,
        poulesConfig: [],
        poulesValue: [],
        spectator: true,
        problemes: 0,
        poulesDone: false,
        // Objet vide avec cinq poules par défaut pour éviter les erreurs dans la console.
        tirages: { 1: {}, 2: {}, 3: {}, 4: {}, 5: {} },
    },
    mutations: {
        SOCKET_CONNECTED(state, connectedTeams) {
            state.connectedTeams = connectedTeams;
        },
        SOCKET_TOTAL(state, total) {
            state.total = total;
        },
        connected(state, { connected, trigram }) {
            state.connected = connected;
            state.trigram = trigram;
        },
        SOCKET_POULESCONFIG(state, poulesConfig) {
            state.poulesConfig = poulesConfig
        },
        SOCKET_POULESVALUE(state, poulesValue) {
            state.poulesValue = poulesValue;
        },
        SOCKET_CONNECTEDSTATUS(state, connected) {
            if (!connected) {
                state.trigram = '';
                state.poulesDone = false;
            }
            state.connected = connected;
            if (!router.currentRoute.path.includes('spectate')) router.replace('/')
        },
        setSpectator(state, spectator) {
            state.spectator = spectator
        },
        SOCKET_PROBLEMES(state, problemes) {
            state.problemes = problemes;
        },
        poulesDone(state) {
            state.poulesDone = true;
        },
        SOCKET_TIRAGES(state, tirages) {
            state.tirages = tirages;
        }
    },
    actions: {
        socket_poules() {
            router.replace('/poules')
        },
        returnHomeIfNecessary(store) {
            if (store.state.spectator) return;
            if (!store.state.connected) router.replace('/')
        },
        socket_tirage({ commit }, poule) {
            router.replace('/tirage/' + poule);
            commit('poulesDone', true);
        },
        socket_end() {
            router.replace('/spectate')
        }
    },
    strict: true
})
