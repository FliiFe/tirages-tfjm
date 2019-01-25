import Vue from 'vue'
import Router from 'vue-router'
import InitialChoice from './views/InitialChoice.vue'
import Login from './views/Login.vue'
import Wait from './views/Wait.vue'
import Poules from './views/Poules.vue'
import Spectate from './views/Spectate.vue';
import Tirage from './views/Tirage.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'initial-choice',
            component: InitialChoice
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/wait',
            name: 'wait',
            component: Wait
        },
        {
            path: '/poules',
            name: 'poules',
            component: Poules
        },
        {
            path: '/spectate',
            name: 'spectate',
            component: Spectate
        },
        {
            path: '/tirage/:poule',
            name: 'tirage',
            component: Tirage,
            props: true
        }
    ]
})
