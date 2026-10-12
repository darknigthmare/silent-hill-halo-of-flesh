# QA v0.8.1 — 12 octobre 2026

## Exécution moteur

`npm test` : **109/109**, zéro échec, zéro test ignoré. Baseline récupérée : 79 tests ; ajout : 30. Vérification/build : **15 modules JS, 9 HTML, 44 fichiers statiques**.

Nouvelles régressions : corps petits/larges, échelle unique, accroupissement, origine des projectiles, sol/vol, esquive directionnelle, collisions de corps et limites, géométrie des 29 dangers, bord unique, fissure localisée, anneau, saut de racines, trajet mobile train/chariot, coup unique, interruption, fin du chrono, filtrage des props et animations, Lakeview, toit de Brookhaven, espace intérieur, mouvement réduit, animation désactivée et absence de duplication des props.

## Rendu Canvas réel, limité

8 captures du code v0.8.1 produites via Chromium dans une page vierge en mémoire, sans navigation ni requête réseau. 0 exception relevée pendant ce rendu ; 0 requête réseau. Rapport brut : `tests/canvas-v081/canvas-report.json` (paquet QA). Vérification visuelle manuelle des rendus Brookhaven et chariot effectuée : style procédural de prototype, ne pas l'étiqueter « reproduction 1:1 ».

Cette vérification exécute le vrai renderer, mais injecte des états de combat pour montrer les cas. Ce n'est pas une partie jouée au clavier/manette, ni un contrôle du DOM de tous les menus.

## Navigation bloquée — NON validée

La tentative `qa:browser` a lancé Chromium, puis le premier accès à `http://127.0.0.1:4173/` a échoué : **`net::ERR_BLOCKED_BY_ADMINISTRATOR`**. Aucun contournement de la politique n'a été appliqué. Les parcours de menu, mobile, PWA et service worker ne sont pas considérés réussis. Les anciens rapports navigateur des versions précédentes restent historiques.

## Reproduction

- Node >=20 : `npm test`, puis `npm start` sur un poste autorisant l'accès au serveur local.
- `npm install` puis `npm run qa:browser` pour le parcours navigateur ; `QA_PLAYWRIGHT_MODULE` peut désigner un module Playwright déjà installé.
- Python Playwright et Chromium local : `python scripts/canvas-qa-v081.py` pour le rendu isolé sans réseau.

## Publication

L'état GitHub/Vercel/Drive est consigné séparément dans le rapport de livraison après les retours des services, pas déduit des tests locaux.
