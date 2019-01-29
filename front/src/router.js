import Vue from 'vue'
import Router from 'vue-router'
import InitialChoice from './views/InitialChoice.vue'

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
            path: '/home',
            redirect: '/'
        },
        {
            path: '/login',
            name: 'login',
            component: () => import(/* webpack  : "login" */ './views/Login.vue')
        },
        {
            path: '/wait',
            name: 'wait',
            component: () => import(/* webpackChunkName: "wait" */ './views/Wait.vue')
        },
        {
            path: '/poules',
            name: 'poules',
            component: () => import(/* webpackChunkName: "poules" */ './views/Poules.vue')
        },
        {
            path: '/spectate',
            name: 'spectate',
            component: () => import(/* webpackChunkName: "spectate" */ './views/Spectate.vue')
        },
        {
            path: '/tirage/:poule',
            name: 'tirage',
            component: () => import(/* webpack  : "tirage" */ './views/Tirage.vue'),
            props: true
        }
    ]
})
