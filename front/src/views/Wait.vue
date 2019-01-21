<template>
    <div id="wait">
        <p v-for="team in connected" :key="team.name">{{team.name}}</p>
    </div>
</template>

<script>
export default {
    data() {
        return {

        }
    }
}
</script>
