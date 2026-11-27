# Vague 31 — QA visuelle native

**270 contrôles automatisés réussis**, avec **14 captures du jeu** : douze vues d’action/récupération pour trois personnages dans les deux orientations, puis deux vues des nouveaux décors. Une quinzième image est un diagnostic de transparence de Nurse sur fond sombre.

Cette vérification exécute le vrai `FightEngine` et son rendu Canvas. **Aucun navigateur ni test HTTP n’a été exécuté.** Le fichier `/usr/bin/chromium` est un wrapper et le binaire attendu `/usr/lib/chromium/chromium` est absent dans cet environnement.

## Résultat et portée

| Section | Cas | Captures | Contrôles | Résultat |
| --- | ---: | ---: | ---: | --- |
| Personnages | 6 | 12 de combat + 1 diagnostic | 178 | Commande, pose active, orientation, appuis et retour idle validés. |
| Décors | 2 | 2 de combat | 92 | Plans exacts, HUD du lieu, parallaxe et retour idle validés. |

Les captures ont été inspectées individuellement. Les silhouettes, leur cadrage et le détourage nettoyé de Nurse sont acceptables comme candidats statiques.

**Deux points visuels restent ouverts :** le projectile lumineux existant de Walter et celui d’Eddie apparaissent sous le canon de leurs nouvelles poses. L’écart visuel est approximativement de 40 pixels pour Walter et 60 pixels pour Eddie sur le canevas 1280 × 720. Les deux orientations reproduisent ce décalage. Le moteur utilise actuellement une origine fondée sur la boîte de l’acteur ; ce banc ne change ni cette origine ni les projectiles. La réussite automatisée ne vaut donc pas validation du raccord arme/projectile ou de la fidélité 1:1.

## Rapports et preuves

- `report.json` : index des sections, contrôles, captures et points ouverts.
- `characters-report.json` : six duels, commandes effectivement acceptées, états observés, poses peintes, géométrie et empreintes.
- `stages-report.json` : deux matchs ordinaires, plans dessinés, terrain affiché et déplacements de parallaxe.
- `characters-visual-review.json` : revue des douze vues personnages et de la plaque sombre ; défauts de raccord explicités.
- `stages-visual-review.json` : revue des deux vues finales des décors.
- `stages-neutral-terrain-attempt/` : premier essai conservé. Il affichait le libellé BÉTON SEC parce que le banc désactivait la présentation du terrain.

Les captures finales des décors utilisent `stageTerrain: true`. Leur politique `terrainRules: false` maintient les coefficients neutres, tandis que le HUD affiche bien **SEUIL DU MIROIR DE SOINS** et **PLANCHER DE WISH HOUSE**. Aucun appui au plafond n’est activé.

## Déclenchement des personnages

| Personnage | Clip demandé | Route d’entrée | Captures finales |
| --- | --- | --- | --- |
| Man with the Coat, SH4 | `neutralSpecial` | Action `special`, sans direction | `sh4_man_with_the_coat_067-*-action-active.png` et `*-recovered-idle.png` |
| Eddie Dombrowski, SH2 | `neutralSpecial` | Action `special`, sans direction | `sh2_eddie_dombrowski_032-*-action-active.png` et `*-recovered-idle.png` |
| Nurse — Revolver, SH3 | `neutralLight` | Action `light`, sans direction | `sh3_nurse_revolver_044-*-action-active.png` et `*-recovered-idle.png` |

Chaque personnage est testé en P1 puis en P2, dans deux matchs distincts. Les introductions s’achèvent par les mises à jour normales du moteur. Le banc remet les événements aux callbacks `keydown` et `keyup` originaux enregistrés par `InputState`, avec les touches lues dans `engine.bindings`. Il n’écrit pas dans `actor`, `attack`, `state`, `held`, les positions, les orientations, les points de vie ou les horloges.

La capture active est prise lorsque l’attaque réelle se trouve dans sa fenêtre active. La seconde capture attend la disparition de l’attaque et le retour naturel à l’idle initial, sur le sol. Le nouvel asset est observé par un relevé passif du `drawImage` réel ; aucun portrait n’est substitué au personnage.

## Contrôle de Nurse sur fond sombre

Le fichier final examiné est :

`assets/sprites/sh3_nurse_revolver_044.40ad802a6ec2.png`

SHA-256 :

`40ad802a6ec2f8065c0188b10fcfb39e68de4660812af4a995b09d87d3563bce`

Les deux orientations d’action et d’idle ont été inspectées sur Midwich Nightmare. La plaque `nurse-alpha-dark-native.png` affiche en plus les pixels originaux à l’échelle native sur un fond uniforme `#080808`. C’est un diagnostic séparé, pas une capture du jeu.

| Zone mesurée | Alpha maximal | Pixels alpha > 8 |
| --- | ---: | ---: |
| Au-dessus du rectangle `visibleBounds` | 7 | 0 |
| Hors du rectangle `framingBounds` | 1 | 0 |

Aucun voile gris étendu n’est perceptible dans ces images. Des pixels résiduels très peu opaques subsistent. Les mesures portent sur des rectangles de cadrage, pas sur une segmentation sémantique de tout le contour.

## Adaptateurs natifs et limites

Le banc réutilise les conventions de `scripts/qa-sprite-candidates-native.mjs` et des vérifications natives personnages/décors de la vague 28.

L’adaptation de l’environnement fournit un stockage en mémoire, l’enregistrement d’événements, des gamepads vides et un document minimal. `requestAnimationFrame` ne crée pas de boucle de navigateur ; les mises à jour logiques sont avancées manuellement, sans affectation directe des compteurs du moteur.

Les PNG locaux sont vérifiés contre leur taille et leur SHA-256 déclarés. `sharp` normalise leur encodage uniquement en mémoire pour le décodeur natif ; chaque octet RGBA décodé avant/après est comparé. Les fichiers source restent inchangés. Le cache utilise ensuite les images de `@napi-rs/canvas` et le moteur dessine normalement.

Les hashes du moteur, des renderers, des entrées testées et de tous les PNG chargés sont contrôlés. Les empreintes globales des catalogues sont également consignées ; des imports parallèles sans rapport peuvent les modifier, mais les entrées réellement testées doivent rester identiques.

Cette QA ne couvre pas le DOM/CSS, la livraison HTTP, le clavier physique, les service workers ou le fonctionnement hors ligne. Elle ne constitue pas non plus une matrice exhaustive de dégâts, de garde, de collision et de finishers. Une pose statique reste une pose statique : aucun mouvement, cadence source ou certification de fidélité 1:1 n’est revendiqué.

## Reproduction

Le harness est `../qa-native.mjs`. Il refuse d’écraser un rapport de section existant. Pour une nouvelle exécution, choisir un nouveau dossier de sortie :

```sh
node --expose-gc docs/production/vague31/qa-native.mjs --only=stages --out=docs/production/vague31/qa-native-new
node --expose-gc docs/production/vague31/qa-native.mjs --only=characters --out=docs/production/vague31/qa-native-new
```

Les dépendances facultatives `@napi-rs/canvas` et `sharp` sont résolues localement ou via `HALO_QA_NODE_MODULES` / `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Aucune installation ni modification du manifeste des dépendances n’a été nécessaire.
