# Vague 31 — deux arènes candidates sourcées

**Quatre plans indépendants sont livrés : deux fonds opaques et deux premiers plans avec alpha natif.** Ils restent des adaptations candidates, avec `fidelity: unverified`. L’identité du lieu et la phase sont étayées ; la géométrie, la caméra et les microtextures ne sont pas certifiées 1:1.

Production et inspection : 27 novembre 2026. Génération avec l’outil intégré `image_gen.imagegen`, une image par appel. Aucun montage de plusieurs vues n’est livré comme plan de jeu. Les PNG n’ont été ni recadrés ni retouchés après génération.

## Scènes retenues

| ID de l’arène | Œuvre | Scène et phase précises | ID de scène |
| --- | --- | --- | --- |
| `wish_house` | Silent Hill 4: The Room | Intérieur intact de Wish House au premier passage du Monde de la forêt, coin du fragment de texte sacré et porte voisine. | `sh4-first-visit-scripture-corner` |
| `cedar_grove` | Silent Hill: Origins | Female Treatment, 2F, pièce normale avant utilisation du miroir, premier chapitre de la séquence observée. | `female-treatment-mirror` |

Wish House ne mélange pas cette première visite avec le retour dans les ruines. Cedar Grove ne mélange ni la salle d’hydrothérapie, ni le couloir du sanitarium, ni la séquence tardive de Helen/Momma avec la pièce de soins retenue. Le reflet verdâtre présent dans les captures reste limité au miroir.

Le terme technique `fixed-normal` recommandé pour Wish House signifie ici que l’image reste dans une phase fixe. Il ne qualifie pas le Monde de la forêt de réalité ordinaire.

## Fichiers produits

| Plan | Format | Octets | SHA-256 |
| --- | --- | ---: | --- |
| `wish_house.bg-first-visit-scripture.png` | 1672 × 941, RGB opaque | 2 549 969 | `8f7ee32e602fb37e95c0de23779b9468e356cb1182e5bc1eb850d5391f40c5bd` |
| `wish_house.near-closed-book.png` | 1672 × 941, RGBA | 108 834 | `d6120699d81ae8a19dcc2559a362b36f8f66d49d56a7e73c07ff4ae545008e86` |
| `cedar_grove.bg-female-treatment.png` | 1672 × 941, RGB opaque | 2 841 635 | `59e0c4138ef4bb886172820d3102aebf85be5b7a2c2a9ac3c8eef7942c2745ab` |
| `cedar_grove.near-privacy-curtain.png` | 1672 × 941, RGBA | 278 390 | `f61def0b802a0c585c91f073204ec7a19511368a683090c05e8fad5d33cb2d91` |

Total des quatre plans : **5 778 828 octets**. Les sept images du dossier `references/` sont des captures sources non retouchées ; elles ne sont pas des plans générés ni des assets à charger en combat.

Les quatre fichiers `*.prompt.txt` consignent les prompts et le rôle des références. `provenance.json` relie chaque plan à sa scène, sa phase, ses captures et ses limites. `sources.json` fournit les URL exactes, les pages et temps observés. `measurements.json` contient dimensions, poids, hashes et mesures alpha.

## Sources réellement observées

### Wish House

Le [guide officiel Piggyback, extrait français](https://www.piggyback.com/fr/wp-content/uploads/sites/3/2020/04/SH4_F_SamplePages.pdf), page imprimée 46, page PDF 5, figure 08, confirme le premier passage et le coin intérieur retenu. Il est identifié par `V31_SH4_WISH_GUIDE_P46`.

Deux captures de jeu ont été inspectées puis utilisées comme références visuelles :

- [Coin du Holy Scripture Scrap A](https://www.silenthillmemories.net/sh4/walkthrough/pics/03_memo_05_holy_scripture_scrap_a.jpg), `V31_SH4_WISH_INTERIOR_SCRIPTURE` : meuble incliné drapé de rouge, livres et papiers, suspension opaline, lambris, plancher.
- [Porte et Source Placard](https://www.silenthillmemories.net/sh4/walkthrough/pics/03_source_placard.jpg), `V31_SH4_WISH_DOOR` : porte voisine et continuité du même intérieur.

Le [walkthrough du premier Monde de la forêt](https://www.silenthillmemories.net/sh4/walkthrough_03_forest_world_en.htm) correspond à l’ID déjà présent `CL_SH4_03_FOREST_WORLD`. La référence du second passage ne doit pas servir à ajouter des ruines, une fosse ou un rituel à cette scène.

### Cedar Grove

La séquence originale identifiée est [Otherworld Shifts at Cedar Grove Sanitarium](https://www.youtube.com/watch?v=bPFHA7qshe0), chapitre **00:00 — Female Treatment 2F**, ID `V31_ORIGINS_CEDAR_MIRROR_SEQUENCE`. Son titre, sa description, ses chapitres et son storyboard public ont été observés.

Les captures détaillées ont été extraites de [la copie publique de cette séquence](https://rutube.ru/video/4302e74998f2355b51e8c4be5f7dbd72/), ID `V31_ORIGINS_CEDAR_MIRROR_COPY`, aux temps **00:10, 00:12, 00:15, 00:18 et 00:20**. La copie présente le même découpage ; le premier segment montre la pièce avant la traversée. Les images ont été décodées à leur résolution disponible de 640 × 360, sans agrandissement ni retouche.

Les images à 10, 15 et 18 secondes ont guidé le fond. Celle à 15 secondes a guidé la matière du rideau de premier plan. Les vues à 12 et 20 secondes ont servi de vérification complémentaire.

Le [guide officiel Origins](https://www.silenthillmemories.net/publications/guides/silent_hill_origins_official_strategy_guide.pdf), page imprimée 47, page PDF 48, section Hydro-Key Therapy, situe le miroir de Female Treatment : `V31_ORIGINS_CEDAR_GUIDE_P47`. Son image de la salle est déjà en monde altéré ; elle n’a donc pas servi de référence visuelle au fond normal. Les photos de baignoire de la même page concernent Hydrotherapy et ont été exclues.

Aucun PDF complet et aucune vidéo n’est inclus dans ce dossier.

## Fidélité et écarts documentés

### Wish House

Les principaux éléments observés sont conservés : même famille de matériaux, suspension arrondie, meuble incliné, tapis rouge bordé, livres et porte. Henry a été retiré. La caméra a été abaissée et la pièce élargie pour fournir une bande de combat horizontale ; les positions et distances ne reproduisent donc pas un relevé métrique.

Le livre de premier plan reprend un petit livre fermé visible au sol et le place dans la marge inférieure droite. Le fond conserve d’autres petits livres. Ce dédoublement de motif est une adaptation graphique et n’introduit pas un nouvel objet narratif. Les petits éléments pâles près du meuble restent trop peu lisibles pour leur attribuer une identité ou une fonction particulière.

### Cedar Grove

Les deux lits étroits, les rideaux écrus, le carrelage, les murs usés, le double lavabo, le miroir et la porte sont observés dans la séquence. Travis et son reflet ont été retirés. Plusieurs cadrages du même local ont été réunis dans une composition frontale ; l’écartement des meubles, les textures fines, le détail du reflet et l’éclairage sont reconstruits.

Le premier plan reprend le bord du rideau existant à gauche. Il n’ajoute pas un troisième lit. Sa largeur réelle dépasse légèrement la consigne initiale : le sujet visible occupe environ 9,2 % de la largeur, contre 5 à 7 % demandés. Ce bord doit être vérifié lors de la revue en combat, particulièrement près de la limite gauche.

### Limites communes

La plateforme, la région, le build et les réglages des captures de jeu ne sont pas établis. Il ne faut donc pas présenter les images Cedar comme spécifiquement PSP ou PS2, ni attribuer une édition technique précise aux captures SH4. Les titres et les phases sont identifiés ; les microtextures au-delà des captures disponibles sont interprétées.

Ces plans n’établissent aucune animation source, transition automatique, collision, prise au plafond, fatalité, projectile ou danger. Le contrat recommandé conserve `ceiling: false` pour les deux scènes, sans événement ni danger supplémentaire. Le plafond peint reste décoratif.

## Contrôle structurel et alpha

Les quatre PNG se décodent et leurs dimensions sont compatibles avec les assets existants. Leurs empreintes ont été calculées sur les octets originaux.

| Premier plan | Pixels alpha > 8 | Part du canevas | Boîte visible, borne droite/basse exclue | Zone centrale de 60 % |
| --- | ---: | ---: | --- | --- |
| Livre Wish House | 22 388 | 1,423 % | x 1350–1641, y 807–926 | alpha 0 à 1 |
| Rideau Cedar Grove | 106 434 | 6,765 % | x 0–154, y 0–783 | alpha 0 à 1 |

Les deux images ont un vrai alpha couvrant 0 à 255. Quelques pixels isolés d’alpha 1 subsistent hors du sujet ; ils sont consignés et l’alpha généré a été conservé. Aucun pixel d’alpha supérieur à 1 n’apparaît dans les 60 % centraux.

Le présent dossier valide le décodage, les métadonnées, la provenance et la lecture visuelle des images. Le chargement du manifeste, le rendu des combattants, la parallaxe et le maintien du contrat de gameplay relèvent de la QA d’intégration. Même après cette validation technique, les assets doivent rester **candidats / fidélité non vérifiée** tant que la revue 1:1 n’est pas terminée.
