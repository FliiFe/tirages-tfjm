<template>
    <div id="tirage">
        <poules :poule="poule"></poules>
    </div>
</template>

<script>
import Poules from './Poules.vue';

export default {
    name: 'tirage',
    props: ['poule'],
    computed: {
        pouleLetter () {
            // console.log(this.poule, this.poule + 65)
            return String.fromCharCode(parseInt(this.poule) + 64);
        }
    },
    components: {
        Poules
    }
}
</script>

<style scoped>
h2 {
    font-weight: normal;
}
</style>
