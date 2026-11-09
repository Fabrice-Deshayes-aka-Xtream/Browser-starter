---
name: update-dependencies
description: cette skill décrit comment mettre à jour les dépendances npm et github CI
---

Si je te demande de mettre à jour les dépendances, tu dois :
- verifier si des dépendances NPM peuvent être mise à jour (npm outdated), et si oui, les mettre à jour dans le package.json
- lancer les tests, le lint et le type-check pour vérifier que tout va bien
- vérifier également les versions dans fichiers de la CI github (fichiers .github/workflows/*.yml) et les mettre à jour si nécessaire
- mettre à jour le changelog (sur la version [Unreleased]) pour indiquer toutes les dépendances qui ont été mises à jour

Exemple de mise à jour du changelog pour une dépendance npm (indiquer (dev) pour les dépendances de dev) :

### Changed

- Updated dependencies:
    - `vue` 3.5.44 → 3.5.45
    - `vue-i18n` 11.4.17 → 11.4.18
    - `@playwright/test` 1.64.1 → 1.65.0 (dev)
    - `@types/node` 24.19.2 → 26.6.6 (dev)
