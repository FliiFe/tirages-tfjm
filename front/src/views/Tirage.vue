<template>
    <div id="tirage">
        <!-- <poules :poule="poule"></poules> -->
        <h2 v-show="!spectate">Tirage de la poule {{pouleLetter}}</h2>
        <v-data-table
            :headers="headers"
            :items="$store.state.tirages[poule].pb"
            class="elevation-1 gap"
            hide-actions
            dark>
            <template slot="items" slot-scope="props">
                <td><span :class="$store.state.tirages[poule].team === props.item.name ? 'green--text text--accent-2' : ''">{{ props.item.name }}</span></td>
                <td v-for="p in $store.state.problemes" :key="p">
                    <v-icon dark
                            :color="props.item['p' + p] === -1 ? 'deep-orange' : props.item['p' + p] === 1 ? 'green accent-2' : $store.state.tirages[poule].team === props.item.name ? 'white' : 'grey'"
                            class="checkbox">
                        {{props.item['p' + p] === 1 ? 'done': props.item['p' + p] === -1 ? 'close' : props.item['p' + p] === -2 ? 'radio_button_checked' : 'radio_button_unchecked'}}
                    </v-icon>
                </td>
            </template>
        </v-data-table>
        <!-- Si c'est à l'équipe de tirer -->
        <div v-if="!spectate && $store.state.tirages[poule].team === $store.state.trigram && !dialog && !hasPendingProblem">
            <em>Cliquez sur le dé pour tirer un problème</em>
            <img src="../assets/dice-6.svg" id="dice" @click="pickProblem()"/>
        </div>
        <div v-else-if="$store.state.tirages[poule].team.length >= 1">
            <em>L'équipe <b>{{ $store.state.tirages[poule].team }}</b> tire un problème</em>
        </div>
        <v-dialog v-model="dialog" persistent max-width="290">
            <!-- <v-btn slot="activator" color="primary" dark>Open Dialog</v-btn> -->
            <v-card>
                <v-card-title class="headline">Choisir ce problème ?</v-card-title>
                <v-card-text>
                    Vous avez tiré le problème 
                    <div class="problem">{{ pb }}</div>
                    <div v-if="$store.state.problemes - 5 - refus.length >= 0">
                        Il vous reste <span class="red--text">{{$store.state.problemes - 5 - refus.length}} refus</span>
                    </div>
                    <div v-else>
                        <span class="red--text">Vous avez {{-$store.state.problemes + 5 + refus.length}} pénalité{{-$store.state.problemes + 5 + refus.length == 1 ? '' : 's'}}</span>
                    </div>
                    <!-- TODO: meme pb -->
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="red darken-1" flat @click="reject()">Refuser</v-btn>
                    <v-btn color="green darken-1" flat @click="accept()">Accepter</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    name: 'tirage',
    props: ['poule', 'spectate'],
    data() {
        return {
            headers: [
                {
                    text: 'Équipe',
                    sortable: false,
                    value: 'name'
                },
                // Il faut une colonne par problème
                ...[...new Array(this.$store.state.problemes)].map((_, p) => ({
                    sortable: false,
                    text: 'P' + (p + 1),
                    value: 'p' + (p + 1)
                }))
            ],
            dialog: false,
            pb: 0,
        };
    },
    computed: {
        // Retourne la lettre correspondant à la n-ième poule
        pouleLetter() {
            return String.fromCharCode(parseInt(this.poule) + 64);
        },
        hasPendingProblem() {
            let haspending = false;
            this.$store.state.tirages[this.poule].pb.forEach(team => {
                for (let p = 1; p <= this.$store.state.problemes; p++) {
                    if(team['p' + p] === -2) haspending = p;
                }
            });
            return haspending;
        },
        refus() {
            return this.$store.state.trigram ? this.$store.state.tirages[this.poule].pb.find(t => t.name === this.$store.state.trigram).refused : [];
        }
    },
    methods: {
        // Informe le serveur qu'on tire un problème
        pickProblem() {
            this.$socket.emit('pickProblem');
        },
        accept() {
            this.dialog = false;
            this.$socket.emit('acceptProblem', {ans: true, pb: this.pb});
        },
        reject() {
            this.dialog = false;
            this.$socket.emit('acceptProblem', {ans: false, pb: this.pb});
        }
    },
    sockets: {
        // Le serveur a tiré le problème
        problemPicked({team, pb}) {
            if(this.spectate === true) return;
            if(team !== this.$store.state.trigram) return;
            this.dialog = true;
            this.pb = pb;
        }
    },
    mounted () {
        // TODO: open dialog if problem pending
        // if(this.hasPendingProblem) this.dialog = true;
    }
};
</script>

<style scoped>
h2 {
    font-weight: normal;
}

table.v-table tbody td:not(:first-child) {
    padding: 0 10px;
}

.gap {
    margin-top: 50px;
    margin-bottom: 50px;
}

#dice {
    width: 60px;
    height: 60px;
    transition: all 0.3s;
    cursor: pointer;
    display: block;
    margin: 10px auto;
}

#dice:hover {
    transform: scale(1.5);
}
.problem {
    font-size: 40px;
}
</style>
