<template>
  <div class="login">
    <v-text-field label="Trigramme" outline dark color="#fafafa" counter="3" mask="AAA"></v-text-field>
    <v-btn large outline dark>Rejoindre
      <v-icon right dark>arrow_forward</v-icon></v-btn>
  </div>
</template>

<script>
export default {
  name: 'login',
  components: {
  }
}
</script>

<style>
.login {
    width: 300px;
    margin: 0 auto;
}
</style>
