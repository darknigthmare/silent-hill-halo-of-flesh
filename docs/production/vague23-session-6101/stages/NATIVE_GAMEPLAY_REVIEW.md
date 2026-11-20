# Vague23 — Revue des stages dans le moteur natif

Les quatre arènes importées passent la QA native : **4 processus terminés avec le code 0, 46 contrôles par arène, soit 184 exécutions d’assertions**, sans erreur. Les quatre captures 1280 × 720 ont été ouvertes et inspectées. Ces nombres concernent des contrôles répétés par arène ; ils ne représentent pas 184 tests distincts.

Les preuves détaillées sont dans [native-gameplay-visual-review.json](native-gameplay-visual-review.json) et les dossiers de cas ci-dessous. La livraison figée et ses huit PNG sont inchangés ; les copies actives correspondent octet pour octet aux candidats natifs.

## Observations visuelles

| Arène | Appuis et premier plan | Perspective et limite principale | Capture |
| --- | --- | --- | --- |
| Fire | Pieds visibles sur les plaques continues ; montants métalliques sur les bords, sans recouvrement des acteurs. | Lecture latérale claire ; éclairage chaud et grille peints dans le fond fixe. | [Capture](../qa-native/cases/book_fire/book_fire.png) |
| Earth | Appuis visibles sur la roche continue ; encadrement rocheux périphérique. | Fond vertical lisible, surface dense ; largeur et profondeur reconstruites depuis la préversion E3. | [Capture](../qa-native/cases/book_earth/book_earth.png) |
| Blood | Surface rouge opaque sous les pieds ; divisions de grille en arrière, petits fragments proches aux angles. | Un léger surplomb subsiste et se voit davantage que dans les autres arènes. Les diagonales du sol ne certifient pas une caméra latérale originale. | [Capture](../qa-native/cases/book_blood/book_blood.png) |
| Water | Pieds visibles devant le dallage sous l’eau ; montants carrelés aux extrémités. | Eau et reflets statiques ; ni immersion des pieds ni physique liquide attestées. | [Capture](../qa-native/cases/book_water/book_water.png) |

## Ce que le moteur a vérifié

Le harness fait progresser l’introduction ordinaire jusqu’au combat et appelle le vrai `FightEngine.update/render`. Les deux plans du stage et les deux sprites de combat existants sont effectivement dessinés. Il envoie ensuite les commandes droite et gauche aux callbacks originaux de `InputState`, sans injecter d’état d’acteur. Chaque commande est maintenue 18 ticks et déplace P1 de 63,9 px ; le fond reste fixe, tandis que le premier plan se décale de ∓0,3834 px selon la formule attendue. Le retour au repos est constaté à la frame 285, avec `grounded=true`, `y=594` et `x≈310`.

Les captures sont prises à la frame 229, avant les deux séquences de déplacement. L’observation du déplacement et de la parallaxe provient des états moteur et des traces de rendu consignés dans les rapports ; aucune revue vidéo n’est revendiquée.

| Cas | Rapport | Journal | Observation du processus |
| --- | --- | --- | --- |
| `book_fire` | [report.json](../qa-native/cases/book_fire/report.json) | [process.txt](../qa-native/cases/book_fire/process.txt) | [process-observation.json](../qa-native/cases/book_fire/process-observation.json) |
| `book_earth` | [report.json](../qa-native/cases/book_earth/report.json) | [process.txt](../qa-native/cases/book_earth/process.txt) | [process-observation.json](../qa-native/cases/book_earth/process-observation.json) |
| `book_blood` | [report.json](../qa-native/cases/book_blood/report.json) | [process.txt](../qa-native/cases/book_blood/process.txt) | [process-observation.json](../qa-native/cases/book_blood/process-observation.json) |
| `book_water` | [report.json](../qa-native/cases/book_water/report.json) | [process.txt](../qa-native/cases/book_water/process.txt) | [process-observation.json](../qa-native/cases/book_water/process-observation.json) |

## Portée et statut

Cette exécution concerne le Canvas natif à 1280 × 720. Elle ne valide pas le navigateur, HTTP, le DOM/CSS, le service worker, les autres résolutions ni toutes les limites de caméra. Le contact visuel au sol est examiné sur les deux poses idle capturées ; les déplacements automatisés ne remplacent pas une revue de toutes les poses animées.

Chaque arène reste un **candidat de fidélité non vérifiée**. Fire est guidé par la capture PS Vita de lancement US du 16 octobre 2012. Earth, Blood et Water sont guidés par les captures PS Vita E3 du 6 juin 2012, donc par une préversion. Le retrait des personnages originaux, l’élargissement du couloir et la reconstitution des zones cachées empêchent toute revendication 1:1. Les deux plans restent statiques ; leur légère parallaxe n’est pas une animation originale.

Le champ `scene` garde la sous-scène documentée de chaque livraison, tandis que `runtimeSceneId` reste `null`. Aucune politique runtime, géométrie de combat, source centrale, image active ou livraison n’a été modifiée pendant cette revue.

## Traçabilité

- Harness exécuté : `docs/production/vague23/qa-stages-native.mjs`.
- SHA256 du harness : `5e4cee0ced1cb66ce3ab5b7ceb1d46e82057bfad275ccd973f0cb10b39b047d2`.
- [Copie conservée du harness](../qa-native/executed/qa-stages-native-5e4cee0ced1c.mjs).
- Livraison figée : `32e6bb58c9e9f862323e27d146bb4be3496e1b26c362f4801a0bdd846701ffcd`.
- Chaque observation de processus conserve la commande, le code retour, les horaires et les SHA256 du rapport et du journal ; chaque rapport conserve les SHA256 des captures et des sources.

La revue de génération et de comparaison aux références reste dans [native-visual-review.json](native-visual-review.json). Le présent document ajoute les observations réelles après intégration sans modifier ce contrat de livraison.
