<template>
  <div id="app">
    <h2>Équipes</h2>
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
      </li>
    </ul>
    <h2>Poules</h2>
    <input
      type="number"
      placeholder="Ajouter une poule (nombre d'équipes)"
      @keyup.enter="addPoule($event.target.value); $event.target.value = ''"
      max="4"
      min="3"
    >
    <ul>
      <li v-for="(poule, i) in poulesConfig" :key="i">
        <button @click="delPoule(poule)">×</button>
        Poule {{alphabet[i]}}: {{poule}} équipes
      </li>
    </ul>
    <h2>Problèmes</h2>
    <input type="number" v-model="problemes">
    <h2>Mots de passe</h2>Envoyer le fichier de mots de passes:
    <input type="file" @change="passUpdate($event)">
    <br>
    <button @click="send()">Envoyer et redémarrer le tirage en cours</button>
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
            alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        };
    },
    mounted() {
        fetch('http://localhost:8081/orga/data.json')
            .then(r => r.json())
            .then(({ teams, poulesConfig, problemes, passwords }) => {
                this.teams = teams;
                this.poulesConfig = poulesConfig;
                this.problemes = problemes;
                this.passwords = passwords;
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
                } else {
                    this.poulesConfig = '3'
                        .repeat(Math.floor(nteams / 3) - 1)
                        .split('')
                        .concat([4]);
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
            fetch('/orga/submit', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    problemes: parseInt(this.problemes),
                    poulesConfig: this.poulesConfig.map(e => parseInt(e)),
                    teams: this.teams,
                    passwords: this.passwords
                })
            });
        }
    }
};
</script>
