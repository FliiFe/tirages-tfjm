<p align="center">
  <img src=./front/src/assets/logo_dark.svg width="400">
</p>

# Tirage des problèmes

Ce repo contient le site de tirage au sort des problèmes pour le <img src=./front/src/assets/logo_dark.svg height=17>.

## Installation et configuration

La mise en ligne se fait avec une image docker. Il y a deux choses à modifier avant de compiler l'image: les variables d'environnement `ORGA_PWD` et `TOURNOIS`

```Dockerfile
ENV OGRA_PWD orga # le mot de passe organisateur
ENV TOURNOIS lille,lyon,nancy,paris-1,paris-2,rennes,toulouse,tours #La liste des villes, sans espace ni majuscules
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

## Gestion des mots de passe

Chaque équipe dispose d'un mot de passe (généré pour l'édition 2019, récupéré depuis le site d'inscription pour les éditions ultérieures). Le site de tirage accepte les mots de passe sous la forme d'un fichier `json` sous la forme

```json
{
    "PAU": "havefun",
    "ACO": "pretpourlitym",
    "TDE": "meilleureequipe"
}
```

Le fichier doit être fourni lors de la configuration du tournoi via la page `/orga` (dans la section **Mots de passe**)

## À faire

- [ ] Gérer les poules à 5 équipes
- [x] Générer des mots de passes uniques à chaque équipe
