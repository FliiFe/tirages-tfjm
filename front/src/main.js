import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueSocketio from 'vue-socket.io-extended';
import io from 'socket.io-client';
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont'

Vue.config.productionTip = false;

Vue.use(Vuetify);

router.beforeEach((to, _, next) => {
    if(to.path === '/') {
        store.commit('connected', {connected: false, trigram: ''})
        socket.disconnect();
        socket.connect();
    }
    next();
});

const socket = io('http://localhost:8081');

Vue.use(VueSocketio, socket, { store });

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');
