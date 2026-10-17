Information techniques
- le projet est hébergé dans WSL
  - nodejs est installé via brew, dispo ici : /home/linuxbrew/.linuxbrew/bin/node
  - npm est installé via brew, dispo ici : /home/linuxbrew/.linuxbrew/bin/npm
- le projet est développé avec IntelliJ IDEA

Règles de contribution
- commente le code en anglais, seulement si le code n'est pas explicite
- quand tu ajoutes une feature, met à jour le CHANGELOG.md
- si tu ajoutes un nouveau type de block, documente le dans le README.md
- quand tu ajoutes ou modifie du code, execute ces commandes pour vérifier que tout va bien et corrige si besoin
  - npm test
  - npm run lint
  - npm run type-check
- rebuild l'extension pour que les changements soient pris en compte: npm run build:extension
