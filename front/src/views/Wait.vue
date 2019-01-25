<template>
    <div id="wait">
        Équipes connectées: {{$store.state.connectedTeams.length}}/{{$store.state.total}}
    </div>
</template>

<script>
export default {
    name: 'wait',
    mounted () {
        this.$store.dispatch('returnHomeIfNecessary');
        if(this.$store.state.connectedTeams.length === this.$store.state.total) this.$router.push('/poules')
    }
}
</script>
