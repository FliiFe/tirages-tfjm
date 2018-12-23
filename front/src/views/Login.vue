<template>
    <div class="login">
        <v-text-field label="Trigramme" outline dark color="#fafafa" counter="3" mask="AAA" v-model="trigram" :error="error"></v-text-field>
        <v-btn large outline dark @click="login" :disabled="trigram.length !== 3 || loading" :loading="loading">Rejoindre
            <v-icon right dark>arrow_forward</v-icon></v-btn>
    </div>
</template>

<script>
export default {
    name: 'login',
    data() {
        return {
            trigram : '',
            loading: false,
            error: false,
        }
    },
    methods: {
        login() {
            this.loading = true;
            this.$socket.emit('login', this.trigram);
        }
    },
    sockets: {
        login(result) {
            this.loading = false;
            this.error = !result;
            if(result) this.$router.push('/wait') // waiting room, wait for all the teams to be there
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
