<template>
  <div id="app">
    <h2>Équipes</h2>
    <div class="tour2"><input type="checkbox" v-model="tour2" /> Tirage du second tour</div>
    <input
      type="text"
      placeholder="Ajouter une équipe (trigramme)"
      @keyup.enter="addTeam($event.target.value); $event.target.value = ''"
      maxlength="3"
    >
    <ul>
      <li v-for="team in teams" :key="team">
        <button @click="delTeam(team)">×</button>
        {{team}}
        <input type="number" min=1 placeholder="Problème du tour 1" :max="problemes" v-model="tour2exclusion[team]" v-if="tour2" class="exclusion">
      </li>
    </ul>
    <h2>Poules</h2>
    <div class="customPoules"><input type="checkbox" v-model="customPoules" /> Forcer la répartition des poules</div>
    <div v-if="customPoules">
        Entrez les poules au format <pre>ABC,DEF,GHI<span class="semi">;</span>JKL,MNO,PQR<span class=semi>;</span>...</pre>
        <input type="text" placeholder="Description des poules" v-model="descPoules" />
    </div>
    <div v-else>
    <input
      type="number"
      placeholder="Ajouter une poule (nombre d'équipes)"
      @keyup.enter="addPoule($event.target.value); $event.target.value = ''"
      max="5"
      min="3"
    >
    <ul>
      <li v-for="(poule, i) in poulesConfig" :key="i">
        <button @click="delPoule(poule)">×</button>
        Poule {{alphabet[i]}}: {{poule}} équipes
      </li>
    </ul>
    </div>
    <h2>Problèmes</h2>
    <input type="number" v-model="problemes">
    <h2>Mots de passe</h2>Envoyer le fichier de mots de passes:
    <input type="file" @change="passUpdate($event)">
    <br>
    <button @click="send()" class="submitbutton">Envoyer et redémarrer le tirage en cours</button>
    <a target="blank" href="../" class="tirage">Voir le déroulement du tirage</a>
    <a target="blank" href="result.xlsx" class="tirage">Résultats dans une feuille de calcul</a>
    <a target="blank" href="result.json" class="tirage">Résultats au format json</a>
  </div>
</template>

<script>
export default {
    name: 'app',
    data() {
        return {
            teams: ['PAU', 'TRE', 'BER'],
            poulesConfig: [3],
            problemes: 8,
            passwords: {
                PAU: 'paupwd',
                BER: 'berpwd',
                TRE: 'trepwd'
            },
            alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            tournoi: '',
            tour2: false,
            tour2exclusion: {},
            customPoules: false,
            descPoules: ''
        };
    },
    mounted() {
        fetch('./data.json')
            .then(r => r.json())
            .then(({ teams, poulesConfig, problemes, passwords, tournoi, tour2, tour2exclusion }) => {
                this.teams = teams;
                this.poulesConfig = poulesConfig;
                this.problemes = problemes;
                this.passwords = passwords;
                this.tournoi = tournoi === 'front' ? 'dev' : tournoi
                this.tour2 = tour2
                this.tour2exclusion = tour2exclusion
            })
            .catch(() => {
                alert("Une erreur s'est produite. Merci de recharger la page.");
            });
    },
    methods: {
        delTeam(team) {
            this.teams = this.teams.filter(t => t !== team);
            this.teamsUpdated();
        },
        addTeam(team) {
            if (!this.teams.includes(team.toUpperCase())) {
                this.teams.push(team.toUpperCase());
                this.teamsUpdated();
            }
        },
        addPoule(poule) {
            this.poulesConfig.push(poule);
        },
        delPoule(poule) {
            this.poulesConfig.splice(this.poulesConfig.indexOf(poule), 1);
        },
        teamsUpdated() {
            let nteams = this.teams.length;
            if (nteams >= 3) {
                if (nteams % 3 == 0) {
                    this.poulesConfig = '3'
                        .repeat(Math.floor(nteams / 3))
                        .split('');
                } else if (nteams % 3 == 1){
                    this.poulesConfig = '3'
                        .repeat(Math.floor(nteams / 3) - 1)
                        .split('')
                        .concat([4]);
                } else {
                    this.poulesConfig = nteams === 5 ? [5] : '3'
                        .repeat(Math.floor(nteams / 3) - 2)
                        .split('')
                        .concat([4, 4]);
                }
            }
        },
        passUpdate(evt) {
            let file = evt.target.files[0];
            let reader = new FileReader();
            reader.onload = e => (this.passwords = JSON.parse(e.target.result));
            reader.readAsText(file);
        },
        send() {
            let failed = false
            let descPoules = this.descPoules.replace(/[^A-Za-z,;]/g, '').toUpperCase().split(';').map(e => e.split(','))
            let flatDesc = descPoules.reduce((a, v) => [...a, ...v])
            console.log(descPoules, this.teams)
            if(this.customPoules) {
                this.poulesConfig = descPoules.map(e => e.length)
                if(!flatDesc.every(t => this.teams.includes(t))) {
                    alert('La description des poules contient une équipe inconnue')
                }
                if(descPoules.map(e => e.length).reduce((a,v)=>a+v) !== this.teams.length) {
                    alert('La description des poules ne contient pas le bon nombre d\'équipes')
                }
                if(!this.teams.every(t => flatDesc.includes(t))) {
                    alert('La description n\'inclus pas toutes les équipes.')
                }
            }
            if(this.tour2 && !this.teams.every(t => this.tour2exclusion[t] > 0)) {
                alert('Tous les problèmes du tour 1 doivent être définis pour commencer le tour 2')
                failed = true
            }
            if(this.poulesConfig.reduce((a, v) => a + parseInt(v), 0) != this.teams.length) {
                alert('La configuration des poules ne correspond pas au nombre d\'équipes')
                failed = true
            }
            if(!this.teams.every(t => t.length === 3)) {
                alert('Toutes les trigrammes doivent contenir exactement trois lettres')
                failed = true
            }
            if(!this.teams.every(t => this.passwords[t] && this.passwords[t].length > 0)) {
                alert('La liste des mots de passe est incomplète.')
                failed = true
            }
            if (failed) return
            fetch('./submit', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    problemes: parseInt(this.problemes),
                    poulesConfig: this.poulesConfig.map(e => parseInt(e)),
                    teams: this.teams,
                    passwords: this.passwords,
                    tour2: this.tour2,
                    tour2exclusion: this.tour2exclusion,
                    descPoules,
                    customPoules: this.customPoules
                })
            }).then(() => {
                alert('Envoyé avec succès')
            }).catch(() => {
                alert('Erreur lors de l\'envoi.')
            });
        }
    }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto');
html,body {
    background: #1f1f1f;
    color: white;
    font-family: Roboto;
}

#app {
    display: block;
    margin: 0 auto;
    width: 600px;
}

input[type=number], input[type=text] {
    font-family: Roboto;
    font-size: 16px;
    width: 600px;
    background: #1f1f1f;
    border: 1px solid white;
    border-radius: 2px;
    color: white;
    padding: 16px;
}

h2 {
    font-weight: normal;
    font-size: 30px;
}

li {
    margin: 10px auto;
}

li > button, .submitbutton, a.tirage {
    font-family: Roboto;
    font-size: 16px;
    background: #1f1f1f;
    color: white;
    border: 1px solid white;
    border-radius: 2px;
    padding: 8px 12px;
    margin-right: 20px;
    transition-property: background;
    transition-duration: 200ms;
}

li > button:hover, .submitbutton:hover, a.tirage:hover {
    background: #3f3f3f;
}

.submitbutton, a.tirage {
    display:block;
    margin: 0 auto;
    text-transform: uppercase;
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 16px;
    text-align: center;
    font-family: Roboto;
    font-size: 16px;
    text-decoration: none;
    width: fit-content;
}

input.exclusion {
    font-family: Roboto;
    font-size: 16px;
    display: inline-block;
    margin-left: 50px;
    width: 200px;
}

.semi {
    color: red;
}
</style>
