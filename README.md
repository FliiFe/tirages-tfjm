<p align="center">
  <img src=./front/src/assets/logo_dark.svg width="400">
</p>

# Tirage des problèmes

Ce repo contient le site de tirage au sort des problèmes pour le <img src=./front/src/assets/logo_dark.svg height=17>.


## Installation et configuration

La mise en ligne se fait avec une image docker. Il suffit de modifier les variables d'environnement secrètes dans le `Dockerfile` (sauf si elles sont définies au lancement du container), et de build le Dockerfile.
En suite, l'image sert le site sur le port `8081`.

La configuration initiale se fait dans le fichier `./back/config.json`, qui contient les équipes présentes, le nombre de problèmes, les configurations de poules et le port d'écoute du backend. Les trois premières valeurs peuvent aussi être modifiées via la page `/orga` (le mot de passe est celui définit dans le `Dockerfile`)

## À faire

- [ ] Gérer les poules à 5 équipes
- [ ] Générer des mots de passes uniques à chaque équipe
