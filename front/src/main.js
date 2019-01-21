import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
    debug: process.env.NODE_ENV === 'development',
    connection: process.env.REMOTE_SOCKET || 'http://localhost:8081'
}))

Vue.use(Vuetify)

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
