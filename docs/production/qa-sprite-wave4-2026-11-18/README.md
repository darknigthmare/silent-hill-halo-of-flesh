# Contrôle visuel des sprites du 18 novembre 2026, vague 4

**280 contrôles réussis sur 280.** Les 13 profils qui ont reçu une nouvelle vue latérale ont été rendus dans les deux emplacements de combat. La revue visuelle couvre les 14 captures après 120 ticks et les 32 rendus de sélection des 16 profils. Les captures à l’entrée en garde accompagnent chaque duel. [Synthèse structurée](summary.json)

| Passage | Contrôles réussis | Rendus inspectés |
|---|---:|---|
| [Premier sous-lot](core/visual-review.json) | 172 | 10 duels et 18 portraits |
| [Eileen Head](selection-core/visual-review.json) | 11 | 2 portraits de la manifestation fixe |
| [Second sous-lot](additional/visual-review.json) | 75 | 4 duels et 8 portraits |
| [Toadstool Arcade](selection-additional/visual-review.json) | 11 | 2 portraits du groupe de tiges |
| [The Collector](selection-collector/visual-review.json) | 11 | 2 portraits du non-combattant |

Dans le premier sous-lot, la pointe inférieure du Pendulum reste à 30,54 px au-dessus du sol dans les deux emplacements. Les huit silhouettes terrestres reposent sur le sol à moins de 0,001 px. Dans le second sous-lot, les quatre profils ont un écart d’appui inférieur à 0,30 px. À environ 35 px de haut en duel, Twinfeeler et Creeper Arcade montrent leur silhouette entière. Leurs détails les plus fins se lisent mieux en sélection. [Premières mesures](core/report.json) · [Mesures du second sous-lot](additional/report.json)

La capture de Numb Body grand face à Wood Guardian montre leurs deux silhouettes en entier, jusqu’aux griffes et aux racines du gardien. La vue de Red Pyramid Thing à la lance conserve les deux extrémités de l’arme en garde. Les portraits d’Eileen et de Toadstool se chargent avec leur propre image alors que le moteur leur retourne une vue de combat absente. [Numb Body grand et Wood Guardian](additional/duel-sh3_numb_body_large_038--bom_wood_guardian_138-tick120.png) · [Red Pyramid Thing et Twinfeeler](additional/duel-sh2_red_pyramid_thing_spear_030--sh1_twinfeeler_015-tick120.png) · [Eileen](selection-core/selection-sh4_eileen_head_073-right.png) · [Toadstool](selection-additional/selection-arcade_toadstool_arcade-right.png)

Au deuxième point de contrôle, un passage complémentaire a répété Creeper Arcade contre Carrion dans les deux ordres. Ses 39 contrôles ont réussi. Les deux portraits de Creeper obtenus à cette occasion correspondent octet par octet à ceux du premier passage, conservés dans `core/`. [Rapport natif du passage répété](creeper-recheck/native-report.json) · [Empreintes des deux portraits](creeper-recheck/visual-review.json)

The Collector a été contrôlé au troisième point de contrôle, avec 181 profils illustrés et 47 vues latérales dédiées. Ses deux pieds, sa couronne et les deux extrémités de son sceptre sont visibles dans les deux orientations. Son rôle non combattant et sa sélection seule sont confirmés. Les empreintes du registre et du manifeste concordent avant et après les rendus. [Portrait du Collector](selection-collector/selection-ascension_the_collector_183-right.png) · [Rapport du troisième passage](selection-collector/report.json)

## Reproduire les contrôles

Depuis la racine du dépôt, utiliser Node avec `@napi-rs/canvas` et `sharp`. Choisir des dossiers de sortie neufs.

```sh
node scripts/qa-sprite-candidates-native.mjs --pairs=sh1_hanged_scratcher_011:homecoming_schism_089,sh4_sniffer_dog_male_053:ascension_snarler_180,sh3_pendulum_039:sh3_insane_cancer_041,origins_carrion_076:arcade_creeper_arcade,ascension_wanderer_178:ascension_snarler_180 --out=qa-local-wave4/core --label=sprite-wave4-core --port=4250
node docs/production/qa-sprite-wave3-2026-11-18/selection/verify-selection.mjs --out=qa-local-wave4/selection-core sh4_eileen_head_073
node scripts/qa-sprite-candidates-native.mjs --pairs=sh1_twinfeeler_015:sh2_red_pyramid_thing_spear_030,sh3_numb_body_large_038:bom_wood_guardian_138 --out=qa-local-wave4/additional --label=sprite-wave4-additional --port=4251
node docs/production/qa-sprite-wave3-2026-11-18/selection/verify-selection.mjs --out=qa-local-wave4/selection-additional arcade_toadstool_arcade
node docs/production/qa-sprite-wave3-2026-11-18/selection/verify-selection.mjs --out=qa-local-wave4/selection-collector ascension_the_collector_183
node scripts/qa-sprite-candidates-native.mjs --pairs=arcade_creeper_arcade:origins_carrion_076 --out=qa-local-wave4/creeper-repeat --label=sprite-wave4-creeper-recheck --port=4252
```

Le moteur charge les images de combat par HTTP et les dessine sur un Canvas natif. Les contrôles de sélection seule décodent les PNG locaux avec le peintre de portraits du jeu. Le sens opposé provient du miroir de présentation. Le navigateur, les attaques animées et la fidélité exacte aux œuvres d’origine relèvent de validations distinctes.
