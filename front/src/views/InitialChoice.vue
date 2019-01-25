<template>
  <div class="about">
    <v-btn @click="$store.commit('setSpectator', true)" large dark outline to="/spectate">Spectateur</v-btn>
    <v-btn @click="$store.commit('setSpectator', false)" large dark outline to="/login">Capitaine d'équipe</v-btn>
  </div>
</template>
