---
name: prepare-delivery
description: cette skill décrit comment livrer ou préparer la livraison d'une nouvelle version
---

Si je te demande de liver la version x.y.z, tu dois :
- mettre à jour les dépendances (cf. skill dédiée update-dependencies)
- mettre à jour la version du package.json
- mettre à jour le CHANGELOG.md en remplaçant [Unreleased] par [x.y.z] - yyyy-mm-dd (avec yyyy-mm-dd la date du jour)
- lancer une npm install (pour mettre à jour le package-lock.json)
- lancer les tests, le lint et le type-check pour vérifier que tout va bien
- lancer une npm run build:extension (pour rebuild l'extension)
- faire un commit avec le message "delivery x.y.z"
- tagger le commit de delivery avec le tag "vx.y.z" (note le v devant la version, c'est important pour la CI de github)
- ne push rien, je m'en occupe aprés vérification