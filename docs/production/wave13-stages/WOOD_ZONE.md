# Wood Zone · Silent Hill: Book of Memories

La clairière terreuse bordée de pierres occupe la zone jouable. La souche, placée sur la lisière gauche, forme le second plan de parallaxe. Le catalogue rattache cette vue à l’arène du Wood Guardian. La disposition et le cadrage latéral sont des adaptations pour le versus.

## Références

- `EXT21` et `EXT9_BOM_WOOD_VIEW_06_20261026` figurent dans la fiche du lieu `book_wood`, source `bom`. Le repère de la galerie Vita datée du 16 octobre 2012 est la [capture 06](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20121016_06.jpg). La source du cadrage est la description consignée dans cette fiche. Une comparaison directe entre le rendu et la capture reste à faire.
- Les deux PNG ont été dessinés par génération d’image pour ce projet. La composition conserve les matériaux, les rochers et les branches nues décrits dans le catalogue. La fidélité géométrique et les proportions du jeu Vita restent à vérifier.

## Ressources intégrées

| Plan | PNG | Dimensions | Taille en octets |
| --- | --- | --- | ---: |
| Fond de la clairière | [wood-clearing](../../../assets/stages/book_wood.wood-clearing.badc47213490.png) | 1672 × 941 | 2586365 |
| Souche détourée | [bare-bough](../../../assets/stages/book_wood.bare-bough.58fbcd47b401.png) | 1199 × 1312 | 648447 |

Le fond est opaque. La souche a un canal alpha natif. Chaque plan contient une seule image. Le moteur utilise le mouvement horizontal des combattants pour déplacer la souche.

## Contrôle de rendu

Les images ont été inspectées et leur taille, dimensions et empreinte SHA-256 ont été vérifiées. Les fonctions de production `stageBitmapFor`, `stageBitmapFrames` et `drawStageBitmaps` ont été exécutées avec la fiche réelle `book_wood` et le nouveau registre. Le contrôle enregistre les appels de dessin sur un canevas logique de 1 280 × 720, avec les ressources marquées disponibles. Les trois positions ont chacune sélectionné et dessiné les deux plans.

| Panoramique | Abscisse du fond (px) | Abscisse de la souche (px) |
| ---: | ---: | ---: |
| -1 | 0 | 83,78 |
| 0 | 0 | 55,62 |
| 1 | 0 | 27,46 |

Le déplacement mesuré entre les deux extrêmes est de **56,32 px** pour la souche. Le fond conserve sa position. Le décodage et le passage en duel dans un navigateur restent à vérifier.
