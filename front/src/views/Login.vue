<template>
    <div class="login">
        <v-text-field
            label="Trigramme"
            outline dark counter="3"
            mask="AAA" v-model="trigram"
            hint="Le trigramme est l'identifiant de votre équipe">
        </v-text-field>
        <v-text-field
            label="Mot de passe"
            :append-icon="showpwd ? 'visibility_off' : 'visibility'"
            outline dark
            v-model="password"
            :type="showpwd ? 'text' : 'password'"
            @click:append="showpwd = !showpwd"
            hint="Vous avez reçu ce mot de passe par mail">
        </v-text-field>
        <v-btn large outline dark @click="login" :disabled="(trigram.length !== 3 || password.length < 5) || loading" :loading="loading">Rejoindre
            <v-icon right dark>arrow_forward</v-icon>
        </v-btn>
        <v-snackbar bottom :timeout="6000" v-model="error">Trigramme ou mot de passe invalide <v-btn dark flat @click="error = false">Fermer</v-btn></v-snackbar>
    </div>
</template>

<script>
export default {
    name: 'login',
    data () {
        return {
            trigram: '',
            password: '',
            loading: false,
            error: false,
            showpwd: false
        }
    },
    methods: {
        login () {
            this.loading = true
            this.$socket.emit('login', { trigram: this.trigram, password: this.password })
        }
    },
    sockets: {
        login ({ trigram, success }) {
            this.loading = false
            this.error = !success
            if (success) this.$router.push('/wait') // waiting room, wait for all the teams to be there
        }
    }
}
</script>

<style>
.login {
    width: 300px;
    margin: 0 auto;
}
</style>
