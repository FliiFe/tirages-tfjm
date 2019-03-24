<template>
    <div id="wait" class="headline">
        Équipes connectées: {{$store.state.connectedTeams.length}}/{{$store.state.total}} <br>
        <em>{{this.$store.state.connectedTeams.join(', ')}}</em>
        <v-progress-linear :value="100 * $store.state.connectedTeams.length/$store.state.total" color="white"></v-progress-linear>
    </div>
</template>

<script>
export default {
    name: 'wait',
    mounted () {
        if(this.$store.state.spectator) return;
        this.$store.dispatch('returnHomeIfNecessary')
        if(this.$store.state.connectedTeams.length === this.$store.state.total) this.$router.replace('/poules')
    }
}
</script>
