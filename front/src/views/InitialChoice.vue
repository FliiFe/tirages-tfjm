<template>
  <div class="about">
    <p class="title" v-if="tournoi !== 'finale'">
      Tirage du tournoi de
      <span class="tournoi">{{tournoi.replace('-', ' ')}}</span>
    </p>
    <p class="title" v-else>Tirage de la finale</p>
    <v-btn @click="$store.commit('setSpectator', true)" large dark outline to="/spectate">Spectateur</v-btn>
    <v-btn
      @click="$store.commit('setSpectator', false)"
      large
      dark
      outline
      to="/login"
    >Capitaine d'équipe</v-btn>
  </div>
</template>

<script>
export default {
    name: 'initial-choice',
    data() {
        return {
            tournoi:
                process.env.VUE_APP_TOURNOI == 'front'
                    ? 'dev'
                    : process.env.VUE_APP_TOURNOI
        };
    }
};
</script>

<style scoped>
.tournoi {
    font-style: italic;
    text-transform: capitalize;
}

.title {
    margin-top: 0px;
    margin-bottom: 25px;
}
</style>
