<template>
  <div id="app">
    <img id="logo" alt="Logo TFJM" src="./assets/logo.svg">
    <router-view/>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');

body, #app {
  font-family: 'Roboto', sans-serif;
  text-align: center;
  color: #fafafa;
  background: #1c1c1c;
}
#app {
    margin-top: 100px;
}

#logo {
    width: 300px;
    margin-bottom: 100px;
}
</style>
