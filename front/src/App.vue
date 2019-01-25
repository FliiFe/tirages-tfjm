<template>
    <div id="app">
        <img id="logo" alt="Logo TFJM" src="./assets/logo.svg">
        <transition name="fade" mode="out-in">
        <router-view/>
        </transition>
    </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');

body, #app {
    font-family: 'Roboto', sans-serif;
    text-align: center;
    color: #fafafa;
    background: #1c1c1c;
    font-size: 16px;
}
#app {
    max-width: 600px;
    margin: 0 auto;
    margin-top: 100px;
}

#logo {
    width: 300px;
    margin-bottom: 100px;
}

.fade-enter-active, .fade-leave-active {
    transition: opacity .3s ease;
}
.fade-enter, .fade-leave-to {
    opacity: 0;
}
</style>

