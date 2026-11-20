# Nouveaux sprites de sélection et de combat

Le jeu dispose de **181 fiches illustrées sur 230**. Ce lot ajoute 7 premières illustrations et 13 poses de combat latérales. Il reste 49 fiches sans image.

| Personnage | Édition | Sélection | Combat |
| --- | --- | --- | --- |
| Snarler | SILENT HILL: ASCENSION | [1536 × 1024 PNG](../../assets/sprites/ascension_snarler_180.88e712963625.png) | [1774 × 887 PNG](../../assets/sprites/ascension_snarler_180.216c2e6ba960.png) |
| Eileen Head | SILENT HILL 4: THE ROOM | [1254 × 1254 PNG](../../assets/sprites/sh4_eileen_head_073.66bb06b246a6.png) | Sélection seule |
| Wanderer | SILENT HILL: ASCENSION | [1024 × 1536 PNG](../../assets/sprites/ascension_wanderer_178.488439c222a8.png) | [1024 × 1536 PNG](../../assets/sprites/ascension_wanderer_178.3da19262874e.png) |
| Creeper — Arcade | SILENT HILL: THE ARCADE | [1536 × 1024 PNG](../../assets/sprites/arcade_creeper_arcade.e4c2182692b5.png) | [2172 × 724 PNG](../../assets/sprites/arcade_creeper_arcade.306efcaf78b8.png) |
| Toadstool — Arcade | SILENT HILL: THE ARCADE | [1312 × 1199 PNG](../../assets/sprites/arcade_toadstool_arcade.6e616bb88c7c.png) | Sélection seule |
| Wood Guardian | SILENT HILL: BOOK OF MEMORIES | [1113 × 1414 PNG](../../assets/sprites/bom_wood_guardian_138.22940f0abe70.png) | [1536 × 1024 PNG](../../assets/sprites/bom_wood_guardian_138.dce588da250b.png) |
| The Collector | SILENT HILL: ASCENSION | [1024 × 1536 PNG](../../assets/sprites/ascension_the_collector_183.55a90d583450.png) | Sélection seule |
| Hanged Scratcher | SILENT HILL | Portrait antérieur | [1774 × 887 PNG](../../assets/sprites/sh1_hanged_scratcher_011.499200e206d4.png) |
| Sniffer Dog — Male | SILENT HILL 4: THE ROOM | Portrait antérieur | [1475 × 1066 PNG](../../assets/sprites/sh4_sniffer_dog_male_053.4af1facfd8a4.png) |
| Schism | SILENT HILL: HOMECOMING | Portrait antérieur | [1322 × 1190 PNG](../../assets/sprites/homecoming_schism_089.40895822f98f.png) |
| Pendulum | SILENT HILL 3 | Portrait antérieur | [1199 × 1312 PNG](../../assets/sprites/sh3_pendulum_039.97153b22d0bc.png) |
| Insane Cancer | SILENT HILL 3 | Portrait antérieur | [1076 × 1462 PNG](../../assets/sprites/sh3_insane_cancer_041.c977f8bce191.png) |
| Carrion | SILENT HILL: ORIGINS | Portrait antérieur | [1254 × 1254 PNG](../../assets/sprites/origins_carrion_076.cc08ebd145bb.png) |
| Twinfeeler | SILENT HILL | Portrait antérieur | [2172 × 724 PNG](../../assets/sprites/sh1_twinfeeler_015.510c783296c3.png) |
| Red Pyramid Thing — Spear | SILENT HILL 2 | Portrait antérieur | [1536 × 1024 PNG](../../assets/sprites/sh2_red_pyramid_thing_spear_030.797d28258adf.png) |
| Numb Body — Large | SILENT HILL 3 | Portrait antérieur | [1536 × 1024 PNG](../../assets/sprites/sh3_numb_body_large_038.764b1384ab07.png) |

## Sources et cadrage

Les [sources visuelles archivées](wave4-references/) identifient chaque édition. Pour le Snarler, les sculptures d’Amilcar Fong établissent la forme et le concept en couleur complète les vues grises. Les scènes de Genvid et les images de *Please, Come Home* documentent la silhouette du Wanderer. Les couleurs sous lumière neutre et le tracé de chaque lien demeurent interprétatifs.

La chambre de l’hôpital de *Silent Hill 4* montre le visage et le menton d’Eileen, avec le haut des cheveux perdu dans l’ombre. Le sprite reprend cette limite visible. Les captures de la borne Arcade distinguent les élytres, les antennes et les appuis du Creeper. Une partie de ses pattes lointaines se superpose dans la vue de côté.

La [revue des tentatives](sprite-wave4-generation-2026-11-18.json) distingue les premières poses de Carrion, Pendulum et Insane Cancer de leurs versions latérales retenues. La tentative du Grey Child du film de 2006 a été refusée. Aucun fichier n’a été livré pour cet essai.

Pour le Toadstool, les captures de la borne montrent la touffe brune du sommet des bulbes aux points de contact des tiges avec le sol. Pour le Wood Guardian, les captures sur PS Vita distinguent la forme déracinée de ses petites pousses. La profondeur du profil repose sur les vues obliques du jeu. Dans le chapitre 21 d’Ascension, le plan large du Collector à 35 min 59 s fixe la silhouette. Deux plans à 37 min 48 s et 37 min 49 s révèlent le torse et les pieds. Les pointes du sceptre et la gravure du sceau restent interprétées. Deux captures du combat final du jeu de 2001 confirment la lance de Red Pyramid Thing. Le nouveau profil montre les deux extrémités de la hampe et les deux bottes.

## Vérification dans le jeu

Les contrôles avec le moteur Canvas ont vérifié 280 assertions, 14 duels et 32 rendus de portraits. Le jeu conserve 247 anciens PNG octet pour octet et les 174 portraits déjà affectés. Les 20 nouveaux fichiers correspondent aux empreintes du [journal d’import](sprite-wave4-imports-2026-11-18.json).

Le test complet a réussi avec 1256 tests et zéro échec. [Journal des tests](qa-sprite-wave4-2026-11-18/npm-test.log.gz) · [Captures et contrôles visuels](qa-sprite-wave4-2026-11-18/)

Le catalogue totalise 267 PNG, 47 vues latérales de combat et 129 vues de combat historiques à examiner. Les nouveaux sprites sont des poses fixes. Aucune de ces reconstitutions n’est certifiée 1:1. [Inventaire des 49 fiches encore sans image](sprite-status-wave4-2026-11-18.json)

Les 111 tests Python de la chaîne graphique ont réussi. [Journal Python](qa-sprite-wave4-2026-11-18/python-art-tests.log.gz)

Le contrôle HTTP du premier sous-lot avait tiré au hasard un parcours de boss entièrement illustré. Le scénario de régression utilise désormais une chronique dont le premier adversaire est illustré et un adversaire ultérieur est sans sprite. Il vérifie le message d’indisponibilité, l’absence de combat lancé et les octets de la sauvegarde précédente. Les résultats de ce contrôle navigateur sont suivis sur la [PR nº 6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6/checks).
