# Vague 23 — six décors manquants livrés

## Périmètre et statut

Ce dossier livre **6 décors, chacun composé de 2 images indépendantes : un fond opaque et un premier plan à alpha véritable**, soit **12 PNG natifs et 14 729 935 octets**. La génération a utilisé l’outil intégré imagegen, une image par appel. Les pixels sont conservés tels que générés : aucune retouche, découpe, recoloration, correction d’alpha ou mise à l’échelle après génération.

Ces décors sont des **candidats statiques de mise en scène versus**, avec origine et limites documentées. La caméra latérale, la largeur de l’arène et les éléments occultés dans les captures ne sont pas certifiés 1:1. La présence d’un bitmap ne valide ni animation, ni comportement, ni collision, ni fatalité. La QA moteur et navigateur appartient au lot d’intégration principal.

La base auditée est le commit `cffb58bbcb78c2bdb1381965ea0efb3e5fb54994` de la PR 6. À cette base, les six IDs existaient, étaient absents des bitmaps actifs et n’étaient pas bloqués. Aucun `referencePolicy.sceneId` n’était imposé pour ces six IDs ; les sous-scènes ci-dessous précisent la vue retenue sans remplacer un contrat de scène existant.

## Livraisons à importer

| Fichier | Décors | PNG | Octets |
| --- | --- | ---: | ---: |
| `delivery-part1.json` | `ebisugaoka`, `book_fire` | 4 | 5 221 036 |
| `delivery-part2.json` | `book_earth` | 2 | 2 531 075 |
| `delivery-part3.json` | `book_water` | 2 | 2 464 235 |
| `delivery-part4.json` | `arcade_city`, `book_blood` | 4 | 4 513 589 |
| **Total** | **6** | **12** | **14 729 935** |

Chaque livraison contient `stages[]`, `assets[]`, les prompts intégraux, les URLs de référence, les copies de référence inspectées, les dimensions, les SHA-256 des fichiers et des pixels, les plages alpha, le contrôle des zones centrales et le périmètre de la scène. Les destinations `assets/stages/` portent un suffixe de contenu SHA-256. Les PNG sources sont également conservés dans ce dossier. L’import est confié à `docs/production/vague23/integrate-stage-deliveries.mjs` par le responsable principal ; l’auteur de ce dossier n’a modifié ni manifest partagé, ni moteur, ni branche Git.

## Scènes retenues

| ID | Sous-scène | Version et phase | Repères visuels conservés |
| --- | --- | --- | --- |
| `ebisugaoka` | `fogworld-corner-shop-main-street` | Silent Hill f, Fog World normal uniquement | Même boutique d’angle sur deux captures PlayStation : bois sombre, tuiles, fenêtres à croisillons, enseigne usée, banc, boîte postale rouge, fils électriques. |
| `book_fire` | `fire-zone-launch20121016-workbench-room` | Book of Memories PS Vita, images de lancement du 16 octobre 2012 | Établi à tiroirs, petite table, panneaux de fer, grilles et lueur chaude sous le sol. |
| `book_earth` | `earth-gallery-e3-20120606-view37` | **Préversion E3 du 6 juin 2012**, conforme à la policy existante | Soutènement de bois sur roche, porte sombre, planches, récipients et sol terreux olive. |
| `book_water` | `water-rooftop-dlc-gallery20130315-view37` | Capture de jeu promotionnelle DLC après sortie | Toit technique, grilles à croisillons, portes métalliques, ventilations coiffées, béton gris-bleu. |
| `arcade_city` | `city-jacks-inn-fog-forecourt-opening` | The Arcade, début de City / Jack’s Inn, phase normale | Entrée couverte rectangulaire, supports de béton, enseigne illisible, jardinière, poteau et brume dense. |
| `book_blood` | `blood-platform-e3-20120606-view22` | **Préversion E3 du 6 juin 2012**, conforme à la surface de plateforme prévue | Porte rectangulaire nervurée, disque intégré, plateforme rouge-brun solide, supports et vide visible. |

### Ebisugaoka

La [page officielle PlayStation](https://www.playstation.com/en-us/games/silent-hill-f/) fournit les deux vues de la même façade. La [vue Fog World](https://gmedia.playstation.com/is/image/SIEPDC/silent-hill-f-slider-fogworld-02-16sep25?wid=1920&fmt=jpeg) fixe l’architecture ; la [seconde vue](https://gmedia.playstation.com/is/image/SIEPDC/silent-hill-f-screenshot-05-ps5-11mar25?wid=1920&fmt=jpeg) clarifie le devant de boutique. Aucun état floral, sanctuaire ou résidence Shimizu n’est fusionné. La policy versus de transition déjà existante est laissée au moteur ; ce lot ne produit que l’art normal.

### Fire

La [capture de lancement 01](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20121016_01.jpg) fixe la pièce. La [capture 02](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20121016_02.jpg) est une comparaison de matériaux, pas une deuxième pièce à fusionner. Le [portfolio de Ranko Prozo](https://www.rankoprozo.com/portfolio-1/silent-hill-book-of-memories) apporte une vue plus nette du kit Fire World. Cette vue d’artiste ne prouve pas que son propre agencement ait été livré tel quel dans le jeu. Le stand de tir de l’autre image Fire a été exclu.

### Earth et Blood

Leurs policies demandent déjà la préversion du 6 juin 2012. Les références principales sont [Earth 37](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_37_earth_world.jpg) et [Blood 22](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_22_blood_world.jpg), identifiées dans la [galerie des captures](https://www.silenthillmemories.net/sh_book_of_memories/screenshots_en.htm). Le statut de préversion est explicite dans les livraisons. Pour Blood, la teinte rouge ne prouve pas la liquidité : la surface est donc représentée comme une matière solide, sans écoulement, éclaboussure ni nouvel effet. Les éléments du jeu commercial ne sont pas mélangés à ces deux vues.

### Water

La [capture de jeu 37](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20130115_37.jpg) fixe la salle de toit. La galerie est étiquetée **15 mars 2013**, tandis que le nom du fichier contient `20130115` ; cette divergence est conservée telle quelle. L’image Water World du [portfolio de l’artiste](https://www.rankoprozo.com/portfolio-1/silent-hill-book-of-memories) corrobore l’identité et les matériaux. Ses immeubles de fond, caisses et bâches ne sont pas importés dans la pièce de la capture principale. Le nom Water n’autorise pas à inventer une salle inondée, un bassin ou des runes.

### City / Jack’s Inn

Les [images Konami Europe 2010-03](https://www.silenthillmemories.net/sh_arcade/screens/pics/sh_arcade_20100221_03.jpg) et [promotionnelle 2007-02](https://www.silenthillmemories.net/sh_arcade/screens/pics/sh_arcade_02.jpg) montrent le même porche au début du parcours. Elles sont archivées dans la [galerie The Arcade](https://www.silenthillmemories.net/sh_arcade/screens_en.htm). Le [parcours Town](https://silenthill.fandom.com/wiki/Silent_Hill%3A_The_Arcade/1-1_Town) documente le départ à Jack’s Inn. La scène est volontairement limitée à cette entrée et au brouillard visible : pas de motel complet ou de quartier reconstitué hors champ.

## Vérification des PNG

Toutes les références utilisées et toutes les sorties retenues ont été inspectées visuellement. Les contrôles automatiques lisent les fichiers natifs avec Pillow ; ils ne modifient aucun pixel.

- Les six fonds ont une plage alpha de **255–255**.
- Les six premiers plans ont une plage alpha de **0–255**.
- Les bandes centrales `x=7–93 %`, sur toute la hauteur, ont un alpha maximal de **1/255**. La même limite est vérifiée pour la bande des pieds `y=72–95 %`. Pour Water, cette bande a un alpha maximal de zéro.
- Les décors excluent personnages, monstres, armes, HUD, objets de collecte, surbrillances et particules de combat.
- Les images sont des plans statiques indépendants ; le premier plan reçoit seulement la parallaxe horizontale prévue par le schéma de livraison.

| Décor | Fond natif | Premier plan natif | Pixels du premier plan exactement transparents |
| --- | --- | --- | ---: |
| Ebisugaoka | 1672 × 941 | 1672 × 941 | 96,02 % |
| Fire | 1672 × 941 | 1672 × 941 | 94,50 % |
| Earth | 1672 × 941 | 1672 × 941 | 94,60 % |
| Water | 1672 × 941 | 1672 × 941 | 94,39 % |
| City | 1672 × 941 | 1671 × 941 | 96,58 % |
| Blood | 1672 × 941 | 1672 × 940 | 95,47 % |

Les deux écarts natifs d’un pixel sont déclarés dans les frames, sans redimensionnement pour les masquer. Ce sont des images proches du ratio 16:9, pas des images UHD certifiées. La lisibilité avec combattants, le rendu de `fit: cover` et la tenue du sol sont à vérifier lors de l’intégration moteur.

## Exclusions documentées

`rejected-candidates.json` enregistre une sortie de corridor initialement envisagée pour `arcade_hospital`. La capture 2010-09 établit ses matériaux, mais son identification comme Brookhaven Stage 1 Area 2, étage et phase normale n’est pas suffisamment certaine. Cette génération est **absente de toutes les livraisons**, sans premier plan et sans transfert vers un autre stage. Sa référence et son hash sont conservés pour éviter de la réintroduire par erreur.

`book_light` et `book_steel` restent à produire : leurs zones sont documentées, mais aucune salle précise suffisamment étayée n’a été retenue dans cette passe. Une miniature vidéo, un nom de zone ou un concept d’artiste ne suffit pas à certifier une pièce entière. Les scènes déjà reportées pour absence de géométrie ou de phase identifiable n’ont pas été improvisées.

## Reproduction et audit

Les fichiers `prompts-*.json` conservent les prompts complets et le rôle des entrées. `config-part*.json` définit chaque livraison. `assemble_delivery.py` ne génère pas d’images : il copie les PNG natifs, vérifie alpha/dimensions/hash et assemble les JSON. Les copies sources nécessaires sont sous `references/`. `production-summary.json` donne les totaux et le résultat de validation des douze fichiers, sans modifier l’état du jeu.

