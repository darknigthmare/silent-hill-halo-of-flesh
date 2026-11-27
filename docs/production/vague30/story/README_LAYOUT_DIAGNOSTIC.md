# Vague 30 — diagnostic de la sélection du récit

Date : 25 novembre 2026. **Statut : correctif CSS et instrumentation préparés ; nouvelle validation HTTP attendue.** Cette note conserve l’échec observé et décrit la preuve à recueillir. Elle ne présente aucune capture après correction comme déjà produite.

## Échec réellement observé

Le [run 45665807964, job 139387506757](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45665807964/job/139387506757) teste le commit `72819ebb5139a45ce974bc0719802e87f1b519cc`. À 17:41:12 UTC, le clic normal sur `.fighter-card[data-id="bom_air_screamer_121"]` expire après 30 000 ms. Playwright considère la carte visible et stable, mais relève des interceptions du pointeur par `.pager`, `#selectScreen`, `.roster-wrap` et `.center`.

Cet échec arrive après le lancement du récit Air Screamer SH1, le retour par « Sélection » et l’application des filtres BoM / Air Screamer. Il précède les assertions sur le nouveau propriétaire et la reprise du parcours. Le rapport récit s’arrête à **sept contrôles et deux captures** ; il ne prouve donc pas que le changement de propriétaire fonctionne de bout en bout.

L’artifact partiel est `15048770391`. Le ZIP téléchargé par root contient 32 993 065 octets, SHA-256 `a113df8fd670e601a6378ebd575d62bcdc5fecf0c79288678541d7edf75e9e04`. Les autres suites de ce run ont réussi : poses 114 contrôles, projectiles 138, décors 37. Ces succès n’annulent pas l’échec du parcours récit. Les résultats Node/Python restent également distincts de cette interaction navigateur.

## Mécanisme identifié dans les règles de mise en page

Le [HTML de sélection](../../../../modules/unified-versus.html) place les bandeaux avant `.select-body`. Le code de [versus.js](../../../../src/versus.js) insère `#modePanel` immédiatement après `#runCheckpoint`, donc lui aussi avant les portraits et le roster. L’illustration d’introduction reste présente pendant le filtrage : P1 ne change qu’après le clic sur la carte.

Dans les [règles précédentes](../../../../modules/versus.css), l’écran de bureau a une hauteur liée au viewport et fonctionne en colonne flex. Le panneau narratif conserve son image entière, pouvant atteindre environ 405 px de haut à 720 px de large, plus ses textes et sa liste de rencontres. Le retour à la sélection ajoute la hauteur du bandeau de reprise.

En revanche, `.select-body` et `.roster-wrap` autorisaient une hauteur minimale nulle. Le roster pouvait donc perdre sa zone visible alors que les cartes gardaient une hauteur minimale de 132 px. Son conteneur `overflow:hidden` pouvait couper ces cartes et laisser le centre ou la pagination recevoir le pointeur. Le défilement de `.center` ne garantit pas à lui seul une hauteur utilisable au viewport du roster.

Ce mécanisme est établi par la relation entre les règles et le chemin DOM. **Aucune mesure DOM ni capture complète de l’ancien état défaillant n’a été récupérée.** Le lanceur Chromium présent localement pointe vers un binaire absent ; la tentative de diagnostic local s’est arrêtée avant de créer une page. Les nouvelles mesures doivent donc provenir de la CI, sans inventer une comparaison visuelle avant/après déjà exécutée.

## Correction bornée au bureau

Le correctif ajoute exclusivement un bloc `@media(min-width:801px)` :

| Élément | Contrainte ajoutée | Effet attendu |
| --- | --- | --- |
| `#selectScreen` | `overflow-y:auto` | Les panneaux et la sélection peuvent dépasser le viewport et être parcourus verticalement. |
| Les `aside` directs de l’écran | `flex-shrink:0` | Les bandeaux et le panneau narratif conservent leur place. |
| `.select-body` | `flex:1 0 620px; min-height:620px` | Les portraits, la sélection et les commandes disposent d’une hauteur de travail. |
| `.roster-wrap` | `flex:1 0 190px; min-height:190px` | Une carte de 132 px, son filtre et les espacements disposent d’une zone visible. |

L’illustration garde sa source, son ratio et son affichage entier par `object-fit:contain`. Le défilement permet de consulter l’image puis les commandes. Les règles à 800 px et moins restent inchangées ; cette portée CSS ne vaut pas nouvelle validation mobile. Aucun `pointer-events:none`, clic forcé, remplacement de DOM du jeu ou déplacement artificiel d’acteur n’est utilisé. Les styles du combat ne sont pas modifiés.

## Instrumentation passive de la prochaine exécution

Le [harness du récit](qa-http.mjs) conserve le parcours par les commandes normales et ajoute `layoutSnapshots` au rapport :

- `before-owner-switch-scroll` : après application des filtres.
- `before-owner-switch-click` : après `scrollIntoViewIfNeeded()`, qui effectue un défilement normal vers la carte.
- `after-owner-switch-click` : après le clic ordinaire sur BoM.
- `failure` : si une exception survient et que la page reste disponible.

Chaque relevé contient les rectangles, dimensions clientes, dimensions de contenu, positions de défilement, règles flex/overflow et résultats de `elementFromPoint`. Il couvre l’écran, le panneau, l’image, le checkpoint, la grille principale, le centre, les filtres, le roster, la carte cible, la pagination et les réglages. L’intersection visible de chaque élément est calculée en tenant compte du viewport et des ancêtres qui coupent ou font défiler leur contenu. Ces mesures ne modifient pas le DOM.

`owner-switch-layout.png` ajoute une capture réelle du viewport juste avant le clic, après les filtres et le défilement. En cas d’exception, `failure-viewport.png` conserve également l’écran observé ; une erreur de diagnostic est consignée séparément et ne remplace pas l’échec initial. Les trois captures de récit précédemment prévues restent dans le harness. Le rapport contient donc une capture de viewport supplémentaire si cette étape est atteinte.

Les mesures « avant » et « après » décrivent le clic dans la nouvelle exécution. Elles ne sont pas présentées comme les dimensions de l’ancienne CSS et de la nouvelle CSS.

## Conditions de clôture

La prochaine CI doit confirmer que le clic normal atteint BoM, que le panneau affiche sa propre route sans image SH1, que le parcours SH1 demeure intact et que le bouton de reprise restaure son propriétaire, sa file, ses arènes et son index. La capture et les mesures doivent montrer un roster d’au moins 190 px et une `.select-body` d’au moins 620 px dans ce viewport de bureau, avec la carte accessible au pointeur. Toute nouvelle interception ou zone coupée restera un échec à examiner.

Le changement de contexte dans `versus.js` garde `state.run` et la sauvegarde pour la reprise explicite ; il ne réécrit pas les rencontres et ne modifie pas `startFight` ou `createRun`.

Root a relevé `CACHE_REVISION` dans [service-worker.js](../../../../service-worker.js) à `wave30-story-selection-20261125` pour distribuer la correction dans une nouvelle révision de cache. **Le harness bloque les service workers : il ne certifie ni la mise à jour d’un cache existant ni le fonctionnement hors ligne.** Les 27 tests ciblés cache/récit annoncés après ce changement restent des tests distincts de cette preuve navigateur attendue.

La conclusion illustrée demeure contrôlée dans un composant isolé. Cette passe ne joue pas les quatre combats du récit jusqu’à leur terme et ne certifie aucune fidélité 1:1.
