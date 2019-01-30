<template>
    <div id="app">
        <v-breadcrumbs :items="navitems" dark id="breadcrumbs">
            <v-icon slot="divider">chevron_right</v-icon>
        </v-breadcrumbs>

        <img id="logo" alt="Logo TFJM" src="./assets/logo.svg">
        <transition name="fade" mode="out-in">
        <router-view></router-view>
        </transition>
    </div>
</template>

<script>
export default {
    name: 'app',
    computed: {
        navitems () {
            if(this.$store.state.spectator) {
                return [
                    {
                        text: 'Accueil',
                        disabled: false,
                        to: '/home',
                        replace: true
                    },
                    {
                        text: 'Spectateur',
                        disabled: !this.$route.path.includes('spectate')
                    }
                ];
            } else {
                return [
                    {
                        text: 'Accueil',
                        disabled: false,
                        to: '/home',
                        replace: true
                    },
                    {
                        text: 'Connexion',
                        disabled: !(this.$route.path.includes('login') || this.$store.state.connected)
                    },
                    {
                        text: 'Formation des poules',
                        disabled: !(this.$route.path.includes('poules') || this.$route.path.includes('tirage') || this.$route.path.includes('spectate'))
                    },
                    {
                        text: 'Tirage des problèmes',
                        disabled: !(this.$store.state.poulesDone && this.$store.state.connected)
                    },
                    {
                        text: 'Bilan',
                        disabled: !this.$route.path.includes('spectate')
                    }
                ];
            }
        }
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900');

body,
#app {
    font-family: 'Roboto', sans-serif;
    text-align: center;
    color: #fafafa;
    background: #1c1c1c;
    font-size: 16px;

    max-width: 600px;
    margin: 0 auto;
}

#logo {
    width: 300px;
    margin: 0 auto;
    margin-bottom: 100px;
    margin-top: 80px;
    display: block;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
    opacity: 0;
}

#breadcrumbs {
    margin-top: 16px;
    justify-content: center;
}

a:visited, a {
    color: #fafafa;
}
</style>

