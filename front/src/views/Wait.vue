<template>
    <div id="wait" class="headline">
        Équipes connectées: {{$store.state.connectedTeams.length}}/{{$store.state.total}}
        <v-progress-linear :value="100 * $store.state.connectedTeams.length/$store.state.total" color="white"></v-progress-linear>
    </div>
</template>

<script>
export default {
    name: 'wait',
    mounted () {
        this.$store.dispatch('returnHomeIfNecessary');
        if(this.$store.state.connectedTeams.length === this.$store.state.total) this.$router.replace('/poules')
    }
}
</script>
