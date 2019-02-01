<template>
    <div id="spectate">
        <wait v-if="waiting"></wait>
        <div v-else>
            <div v-for="p in $store.state.poulesConfig.length" :key="p">
                <poules :poule="p"></poules>
                <tirage v-if="tirage" :poule="p" :spectate="true"></tirage>
            </div>
        </div>
    </div>
</template>

<script>
import Poules from './Poules.vue'
import Tirage from './Tirage.vue'
import Wait from './Wait.vue'

export default {
    name: 'spectate',
    components: {
        Wait, Poules, Tirage
    },
    computed: {
        waiting () {
            return this.$store.state.connectedTeams.length < this.$store.state.total;
        },
        tirage () {
            return this.$store.state.poulesValue.length === this.$store.state.total;
        }
    }
}
</script>
