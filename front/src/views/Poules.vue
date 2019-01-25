<template>
    <div id="poules">
        <img src="../assets/dice-6.svg" id="dice" @click="sendRand()" v-show="diceVisible"/>
        <!-- Table wich grows when teams pick a number -->
        <div v-for="(p, index) in $store.state.poulesConfig" :key="index" v-if="sorted.length >= index*3 + 1">
            <h2> Poule {{ String.fromCharCode(index + 65) }} </h2>
            <v-data-table
                :headers="headers"
                hide-actions
                :total-items="p"
                :items="sorted.slice(3*index, 3*index + 3)"
                class="elevation-1" dark>
                <template slot="items" slot-scope="props">
                    <td class="text-xs-left">{{ props.item.name }}</td>
                    <td class="text-xs-left">{{ props.item.randnum }}</td>
                </template>
            </v-data-table>
        </div>
    </div>
</template>

<script>
export default {
    name: 'poules',
    data() {
        return {
            headers: [{text: 'Nom d\'équipe', value: 'name', sortable: false}, {text: 'Nombre tiré', value: 'randnum', sortable: false}],
            diceVisible: true
        }
    },
    computed: {
        sorted () {
            return this.$store.state.poulesValue.slice(0).sort(({randnum: a}, {randnum: b}) => a-b)
        }
    },
    methods: {
        sendRand () {
            this.diceVisible = false;
            this.$socket.emit('poulesDice', Math.floor(Math.random() * 100))
        }
    },
    mounted () {
        this.$store.dispatch('returnHomeIfNecessary');
    }
}
</script>

<style scoped>
h2 {
    margin-top: 16px;
    margin-bottom: 16px;
    font-weight: normal;
    color: white;
}

#dice {
    width: 60px;
    height: 60px;
    transition: all 0.3s;
    cursor: pointer;
}

#dice:hover {
    transform: scale(1.5);
}
</style>
