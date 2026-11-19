# Vague 22 — personnages, groupe A

Le lot livre **10 vues latérales dédiées** : **7 vues pour des profils déjà admissibles au combat** et **3 vues de référence hors duel** pour les Raw Shock. Les 10 portraits antérieurs restent distincts. Aucun personnage de moteur supplémentaire, portrait nouveau ou clip animé nouveau n’est créé. La fidélité reste `unverified` ; aucune certification 1:1 ou UHD n’est attribuée.

Le périmètre examiné comprend 22 profils `legacy-unreviewed` et 6 profils dont le portrait et la vue manquaient. Les 6 absences prioritaires ont un refus antérieur direct ou de famille ; elles n’ont reçu **aucun appel de génération** pendant cette vague. Le détail des 28 décisions figure dans `selection-decisions.json`, avec les preuves historiques dans `historical-block-evidence.json`.

## Livraison

`delivery.json` contient les 10 fichiers retenus avec leurs chemins candidats et cibles, SHA256, dimensions natives, limites alpha, calibrages proposés, prompts complets et références URL/SHA. Chaque sortie garde les octets d’origine d’imagegen. Les candidats sont des liens physiques vers ces sorties quand le système de fichiers le permet. Aucune retouche, suppression de fond ou mise à l’échelle du PNG livré n’a été réalisée.

| Profil exact | Œuvre / édition | Usage préservé | PNG natif |
| --- | --- | --- | --- |
| `sh1_grey_child_005` | Silent Hill, 1999, Grey Child des éditions japonaises/nord-américaines | Vue de combat ; pas Mumbler PAL | 1254×1254 |
| `homecoming_sepulcher_093` | Homecoming, 2008 | Boss stationnaire, configuration verticale | 1254×1254 |
| `origins_memory_of_helen_grady_082` | Origins, 2007 | Boss stationnaire, corps enveloppé et dispositif | 1254×1254 |
| `sh4_bottom_065` | The Room, 2004 | Vue de combat, deux grands bras et trois masses de tête | 1254×1254 |
| `homecoming_asphyxia_096` | Homecoming, 2008 | Profil à corps composé, arrière entier | 1536×1024 |
| `shattered_raw_shock_feminine_100` | Shattered Memories, Wii, 2009 | Référence de poursuite ; `combatEnabled=false` | 1060×1484 |
| `shattered_raw_shock_abstract_102` | Shattered Memories, Wii, 2009 | Référence de poursuite ; `combatEnabled=false` | 1024×1536 |
| `shattered_raw_shock_atrophied_103` | Shattered Memories, Wii, 2009 | Référence de poursuite ; `combatEnabled=false` | 1024×1536 |
| `sh2_twin_pyramid_heads_031` | Silent Hill 2 original, 2001 | Un profil moteur collectif, deux corps dans une image | 1536×1024 |
| `sh4_one_truth_070` | The Room, 2004 | Une cible attachée au cadre ; stationnaire | 1105×1424 |

Les quatre fichiers `delivery-part1.json` à `delivery-part4.json` ferment les sous-lots successifs. `delivery-final-provisional-eight.json` fige les huit premières vues avant les deux extensions ; son SHA256 est `e70ab69234e77e6b2e08bc297d71c090d402e68310100cd1ba99c019a4695fb6`. Ce fichier et son rapport natif initial n’ont pas été réécrits pour les extensions.

## Sources et limites de reconstruction

Les fichiers `reference-downloads-1.json` à `reference-downloads-3.json` consignent les URL, statuts HTTP, dimensions et empreintes des références conservées dans `references/`. Les références effectivement fournies à chaque appel sont indiquées dans son manifeste. Les descriptions textuelles complètent les captures ; elles ne servent pas à inventer des attaches ou des côtés cachés réputés mesurés.

Les sources comprennent le [rendu Grey Child de SH1](https://www.silenthillmemories.net/sh1/creatures/grey_child.png), le [rendu Sepulcher de Homecoming](https://www.silenthillmemories.net/sh5/arts/pics/shh_render_20_sepulcher.png), le [modèle Helen d’Origins](https://www.silenthillmemories.net/sh0/arts/pics/sh0_art_creature_09_momma.jpg), le [modèle Bottom](https://www.silenthillmemories.net/sh4/arts/pics/sh4_art_cre_23_bottom.jpg), les [variations commerciales de Shattered Memories](https://www.silenthillmemories.net/sh_shattered_memories/variations_en.htm), la [capture du duo SH2](https://www.silenthillmemories.net/sh2/walkthrough/sh2_w13_boss_5a_pyramid_head_duo.jpg), et le [rendu One Truth](https://www.silenthillmemories.net/sh4/arts/pics/sh4_art_cre_24_one_truth.jpg). Les URL exactes de chaque image utilisée et leur SHA sont dans les manifestes ; ces liens de lecture ne remplacent pas ces preuves par fichier.

Les trois Raw Shock utilisent les morphologies commerciales visibles dans les captures Wii, avec un état précis retenu pour chaque variante. Les portraits antérieurs provenant de concepts quadrupèdes restent conservés comme documents distincts. Le nouveau profil fixe une seule pose ; il ne reproduit pas une transformation ni une animation de poursuite. Les réglages de rôle du prototype demeurent inchangés.

Pour Twin Pyramid Heads, le PNG rassemble deux corps distincts et deux lances entières. Le profil moteur reste unique. L’écart de taille et de hauteur entre les deux corps représente la profondeur de la composition ; il n’établit pas deux trajectoires autonomes ni une mesure du sol original. Pour One Truth, une seule cible et sa propre bordure sont livrées. Le rendu source de 197×254 px et la capture de salle de 250×176 px ne suffisent pas à certifier la profondeur arrière, le rail complet ou les douze cibles du puzzle.

Les ancrages sont des propositions de présentation : axe du bassin ou du support, indépendant de l’arme, avec le bas de l’appui propre comme ligne de référence. Le `bodyHeight` est défini par profil ; pour les assemblages stationnaires, il inclut le dispositif visible selon la convention existante. Ce ne sont pas des mesures de hitbox ou de hauteur canonique. Le côté opposé est un miroir du moteur, pas un second modèle documenté.

## Contrôle des images

Les quatre `raster-audit-batch*.json` donnent les dimensions, SHA du fichier et des pixels RGBA, extrema alpha, fractions transparentes et limites à différents seuils. Le seuil de présentation principal est alpha ≥32 ; les marges à alpha ≥8 sont également conservées. Des traces très faibles à alpha 1 peuvent atteindre une bordure sans appartenir à la silhouette utile.

Chaque rendu a été inspecté visuellement, puis composé sur un damier dans `qa/`. Les aperçus de QA seuls sont mis à l’échelle ; les PNG candidats restent natifs. Les RGB parfois visibles sous des pixels totalement transparents dans un afficheur brut ne sont pas interprétés comme un halo sans contrôle de la composition alpha réelle.

Les marges ne sont pas toutes celles demandées dans les prompts. Les deux extensions ont des marges minimales à alpha ≥32 de 28 px pour le duo et de 26 px pour One Truth. Les silhouettes et accessoires sont entiers, mais les 8 % demandés ne sont pas atteints ; cette limite figure explicitement dans `selected[].limits`.

Douze appels ont produit dix sorties retenues et deux variantes archivées : la première version d’Helen, dont le voile était trop opaque, et la première version d’Abstract, dont les espaces entre segments restaient fermés. Les corrections ont été faites par imagegen et sont traçables dans les prompts. Les deux variantes ne sont pas proposées à l’import.

## Revue native et portée des vérifications

`native-visual-review.json` conserve la première revue des cinq profils de combat. `native-visual-review-eight.json` ajoute les trois Raw Shock : **8 profils et 16 captures inspectés**, dont 10 captures de duel et 6 d’atelier. Les rapports existants référencés totalisent 448 contrôles. Aucun test n’a été relancé par le relecteur ; les empreintes des captures et rapports permettent de rattacher chaque observation à son image.

Les trois Raw Shock ont zéro duel. Leurs contrôles utilisent `drawRasterMonster` dans l’atelier. Les cinq autres profils utilisent les captures Canvas natives produites par le harness du moteur. Ces preuves ne sont pas un test Chromium : aucune validation DOM/CSS, HTTP ou livraison réelle des touches au navigateur n’est revendiquée.

Les captures natives des deux extensions seront consignées dans une revue finale distincte après l’import du parent. La revue des huit premières vues demeure autonome et inchangée.

## Reports conservés

Air Screamer garde son clip animé existant. Stalker et Remnant restent reportés faute de vues natives assez précises pour établir leur géométrie exacte. Maria finale reste dans la famille du refus Mary ; aucun nouvel essai n’est réalisé sous cette autre identité. Les huit présences non combattantes ou obstacles environnementaux examinés conservent leur rôle.

Incubus, Mannequin Ambusher, Spider Mannequin, Mary finale et les deux formes d’Amnion restent manquants : les refus historiques et les lacunes de références sont consignés, sans nouvelle tentative. Les sources exactes des erreurs antérieures sont conservées avec le SHA de leur document ; ce sont des archives de précédentes vagues, pas des appels de cette vague.

Les petits scripts Python/JavaScript présents dans ce dossier sont les traces d’exécution de cette session et comportent ses chemins absolus. Ils écrivent uniquement les livraisons ou aperçus de QA isolés. Le dépôt, ses données, son moteur, son classeur, ses portraits et ses animations n’ont pas été modifiés par cet agent ; l’import et la publication restent gérés par le parent.
