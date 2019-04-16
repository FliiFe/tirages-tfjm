<p align="center">
  <img src=./front/src/assets/logo_dark.svg width="400">
</p>

# Tirage des problèmes

Ce repo contient le site de tirage au sort des problèmes pour le <img src=./front/src/assets/logo_dark.svg height=18>.

## Installation et configuration

La mise en ligne se fait avec une image docker. Il y a deux choses à modifier avant de compiler l'image: les variables d'environnement `ORGA_PWD` et `TOURNOIS`

```Dockerfile
# Le mot de passe organisateur
ENV OGRA_PWD orga
# La liste des villes, sans espace ni majuscules
ENV TOURNOIS lille,lyon,nancy,paris-1,paris-2,rennes,toulouse,tours
```

La première variable peut être définie au runtime, mais la seconde doit impérativement être correctement définie au buildtime.

L'image se build avec

```bash
docker build . -t tfjm/tirages # Ou n'importe quel autre nom d'image
```

L'image sert le site sur le port `8080`. Pour la lancer en ligne de commande,

```bash
docker run -p 8080:8080 tjfm/tirages # Le nom doit correspondre à celui du build
```

Une fois l'image lancée, la page d'accueil permet d'accéder à chaque tirage dans `/<tournoi>/` (par exemple, `paris-1`). La configuration de chaque tournoi se fait dans la page `/<tournoi>/orga/` (par exemple, `/lille/orga/`). Sur cette page, on peut configurer le nombre de poules, les équipes présentes, le nombre de problèmes et les mots de passe de chaque équipe (voir ci-dessous pour la configuration des mots de passes).

## Page de configuration

La page de configuration est composée de *quatre* sections:

- **Équipes**
- **Poules**
- **Problèmes**
- **Mots de passe**

Dans la section **Équipes**, il est possible d'ajouter et enlever des équipes par leur trigramme, et si le tirage correspond au tour 2, une case à cocher permet de renseigner les problèmes tirés par chaque équipe au tour 1 (problèmes que les équipes ne pourrons plus tirer).

Dans la section **Poules**, il est possible d'éditer la configuration des poules. **_Cependant, la page se charge de calculer automatiquement la configuration la plus probable_**. Ne la modifiez donc qu'en cas de besoin exceptionnel.

La section **Problèmes** ne contient qu'un champ, le nombre de problème à tirer.

La section **Mots de passe** permet d'envoyer un fichier de mots de passe, comme décrit ci-dessous.

## Gestion des mots de passe

Chaque équipe dispose d'un mot de passe (généré pour l'édition 2019, récupéré depuis le site d'inscription pour les éditions ultérieures). Le site de tirage accepte les mots de passe sous la forme d'un fichier `json` sous la forme

```json
{
    "PAU": "havefun",
    "ACO": "pretpourlitym",
    "TDE": "meilleureequipe"
}
```

Le fichier doit être fourni lors de la configuration du tournoi via la page `/<tournoi>/orga` (dans la section **Mots de passe**)

## Logs

Les logs sont disponibles sur la page `/<tournoi>/orga/log` (requiert l'authentification organisateur, peut contenir des données sensibles)

## Exporter les résultats

Depuis la page organisateur, il y a deux boutons: l'un pour exporter au format `json` et l'autre au format `xlsx`. Ce dernier peut être ouvert par Google Sheets/Libre Office/Excel, et est donc le plus pratique pour obtenir les résultats. Le format `json` permet d'exporter les valeurs du serveur dans leur format natif. Par conséquent, il est recommandé de télécharger un exemplaire des données en `json` ainsi qu'un exemplaire en `xlsx` (en cas de problème avec le second format, le premier format permet de récupérer les informations)

**N'exportez le résultat du tirage qu'à la fin du tirage !** Exporter avant peut provoquer des erreurs. Pour connaitre l'avancée du tirage, rendez-vous sur la page spectateur avec le bouton *Voir le déroulement du tirage*.

<p align="center">
    <img src=./screenshots/ex-spreadsheet.png />
</p>
<p align="center">
    Exemple de feuille Excel exportée
</p>
