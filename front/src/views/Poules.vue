<template>
    <div id="poules">
        <img src="../assets/dice-6.svg" id="dice" @click="sendRand()" v-show="diceVisible && !poule"/>
        <!-- Table wich grows when teams pick a number -->
        <div v-for="(p, index) in poules" :key="index">
            <div v-if="p.length >= 1">
                <h2> Poule {{ String.fromCharCode(index + 65) }} </h2>
                <v-data-table
                    :headers="headers"
                    hide-actions
                    :total-items="p.length"
                    :items="p"
                    class="elevation-1" dark>
                    <template slot="items" slot-scope="props">
                        <td class="text-xs-left">{{ props.item.name }}</td>
                        <td class="text-xs-left">{{ props.item.randnum }}</td>
                    </template>
                </v-data-table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'poules',
    props: ['poule'],
    data() {
        return {
            headers: [{text: 'Nom d\'équipe', value: 'name', sortable: false}, {text: 'Nombre tiré', value: 'randnum', sortable: false}]
        }
    },
    computed: {
        sorted () {
            return this.$store.state.poulesValue.slice(0).sort(({randnum: a}, {randnum: b}) => a-b)
        },
        poules () {
            let copy = this.sorted.slice(0)
            if(this.$store.state.customPoules) {
                const poules = []
                this.$store.state.descPoules.forEach(pouledesc => {
                    const poule = []
                    pouledesc.forEach(t => {
                        let team = this.$store.state.poulesValue.find(({name}) => name === t)
                        if(team) poule.push(team)
                    })
                    poules.push(poule)
                })
                console.log(poules)
                return this.poule ? poules.map((e, i) => i === this.poule-1 ? e : []) : poules
            }
            const poules = []
            this.$store.state.poulesConfig.forEach(n => {
                poules.push(copy.splice(0, n))
            })
            return this.poule ? poules.map((e, i) => i === this.poule-1 ? e : []) : poules
        },
        diceVisible () {
            return !this.$store.state.poulesValue.find(e => e.name === this.$store.state.trigram)
        }
    },
    methods: {
        sendRand () {
            // The server will take care of this
            // this.diceVisible = false
            this.$socket.emit('poulesDice', Math.floor(Math.random() * 100))
        }
    },
    mounted () {
        this.$store.dispatch('returnHomeIfNecessary')
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
