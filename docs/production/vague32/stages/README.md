# Vague 32 — antichambre de Green Lion et entrée Lighthouse

Deux arènes auparavant sans bitmap reçoivent chacune un fond opaque et un premier plan à transparence réelle : **quatre PNG distincts, intégrés comme candidats à fidélité non vérifiée**. Les quatre générations sont conservées à leur définition native de 1672 × 941 pixels, sans retouche, découpage ou réencodage après génération. Les fichiers du moteur sont des copies identiques à empreinte SHA-256 dans `assets/stages`.

## Scènes retenues

| ID stable | Scène précise | Référence inspectée | Limite narrative |
| --- | --- | --- | --- |
| `antique_shop` | Antichambre du culte après le tunnel de Green Lion ; scène `green-lion-inner-passage` | Guide officiel imprimé p. 121, puis vues natives à 3:13:40, 3:14:20 et 3:14:30 | Avant la cinématique finale. Ni boutique SH1, ni corps rituel, ni salle de cinématique ou rêve de boss. |
| `lighthouse_sm` | Porche extérieur du Lighthouse Counseling Center ; scène `shm-clinic-entrance-before-therapy` | Vues natives à 2:37:40 et 2:37:50, parcours du dernier chapitre | Après l’échange du rivage et avant de franchir la porte. Le lac, une tour de phare, le hall et la scène de thérapie restent distincts. |

Le [guide officiel Origins](https://www.silenthillmemories.net/publications/guides/silent_hill_origins_official_strategy_guide.pdf) permet d’identifier l’antichambre, son autel et le chemin rouge, puis de séparer la pièce suivante. Les [vues de jeu Origins](https://www.youtube.com/watch?v=pB2hL5hwNvQ) constituent les références visuelles des motifs de ce décor. La plateforme, la région et le build de cette vidéo ne sont pas établis ; le titre « 4K/60fps » ne désigne pas une édition officielle et ne décrit pas les vignettes utilisées.

Le [parcours Shattered Memories](https://www.silenthillmemories.net/sh_shattered_memories/walkthrough_14_the_orpheus_boat_and_lighthouse_en.htm) situe l’entrée de clinique après la séquence du lac. La [vidéo de jeu](https://www.youtube.com/watch?v=2Ekz2eUCIbU) déclare une version US PlayStation Portable ; ce renseignement vient de sa description, sans établissement indépendant du build, du matériel ou des réglages.

Les cellules des storyboards publics ont été recadrées à leur taille native de 320 × 180 ou 318 × 180 pixels, sans agrandissement ni correction d’exposition. La planche de contexte et chaque recadrage utilisé sont archivés dans `references/`. Le hall Lighthouse a été inspecté pour vérifier la séparation des plans et n’a pas servi à générer l’extérieur.

## Ce qui a été produit

| Arène | Fond | Plan proche | Intégration |
| --- | --- | --- | --- |
| Green Lion | Maçonnerie sombre, autel vide et drapé rouge, court passage grillagé | Petit bord de grille au coin inférieur gauche | 2 images fixes, parallaxe du plan proche à 0,006 |
| Lighthouse | Façade basse, porche à piliers, porte de bois, plaque et sol enneigé | Bord de neige au coin inférieur droit | 2 images fixes, parallaxe du plan proche à 0,006 |

La plaque native porte davantage de texte que le candidat. **Seul « LIGHTHOUSE » reste lisible dans l’image générée** ; les petites mentions ne sont pas reproduites fidèlement. Le fronton, les arbres latéraux, les moulures, les proportions des pièces et les microtextures sont reconstruits. La caméra frontale et la largeur nécessaire au combat s’écartent des cadrages sources. Ces limites empêchent toute certification 1:1.

Les premiers plans utilisent un canal alpha réel et conservent plus de 98 % de pixels entièrement transparents. Des pixels isolés d’alpha 1/255 existent hors des motifs ; ils sont conservés sans retouche et consignés dans `measurements.json`. Au seuil alpha supérieur à 8, le bord de grille occupe 406 × 68 pixels et celui de neige 519 × 90 pixels, exclusivement aux marges inférieures. Le centre reste à un alpha maximum de 1/255. Ces étendues dépassent les dimensions visées par les prompts, sans obstacle haut dans la zone de combat.

## Règles du moteur et propositions historiques

Les images ne créent aucun danger, événement, appui de plafond, Dénouement automatique, glissade ou transition. `geometry.ceiling` vaut explicitement `false`, les règles de terrain sont neutres, les animations génériques sont désactivées et les deux scènes restent fixes. La neige et les flammes peintes ne constituent pas des animations sources. La parallaxe traduit uniquement le mouvement de caméra du versus.

Les quatre propositions antérieures de chaque arène sont conservées dans la recherche. Pour Green Lion, les trois prototypes de lot11 — poussière, ombre du Flauros abstrait et lueur de mur — sont masqués par le nouveau fond fixe, signalés comme historiques et maintenus en attente. Un appel ancien ou injecté ne peut pas les repeindre. Les propositions composites Lighthouse de faisceau, eau et raccord thérapeutique sont explicitement exclues de la scène d’entrée. Aucune de ces lignes n’est reclassée comme animation livrée.

## Traçabilité et vérification

- `sources.json` : URLs, pages, temps, recadrages, observations, empreintes et limites des sources.
- `provenance.json` : quatre appels indépendants à la génération intégrée, fichiers originaux, références passées à chaque appel, adaptations et exclusions.
- `*.prompt.txt` : texte exact de chaque génération.
- `measurements.json` : tailles, modes RGB/RGBA, empreintes et mesures alpha des originaux.
- `import-plan.json` : les quatre chemins versionnés du moteur et leurs propriétaires.
- `tests/stage-wave32.test.mjs` : sélection de scène, refus des emprunts et phases incompatibles, pistes historiques masquées, règles neutres et intégrité des PNG.
- `unit-test-report.json` : 36 tests ciblés réussis, sans échec ni test ignoré.
- `qa-native.mjs` : adaptateur Canvas natif et moteur réel ; déplacements gauche/droite et parallaxe mesurés sans assignation d’état.
- `qa-native/report.json` et `qa-native/visual-review.json` : 93 contrôles réussis, deux captures relues.
- `qa-http.mjs` : lancement des deux arènes par les contrôles ordinaires de l’application, décodage et dessin des PNG originaux, inspection en lecture seule du moteur réel. Aucun état d’acteur ou pixel substitué.

Commande de vérification native après reconstruction des catalogues et du build :

```sh
node docs/production/vague32/stages/qa-http.mjs --stages=antique_shop,lighthouse_sm --out=docs/production/vague32/stages/qa-native --build=dist
```

La réussite technique de cette vérification confirme le chargement et les restrictions du moteur ; elle ne certifie pas la fidélité visuelle ou les mouvements du jeu source.

## Résultat observé

Les **36 tests ciblés** et les **93 contrôles natifs** passent. Les deux captures du moteur réel ont été ouvertes et relues : cadrage complet des combattants, pieds dégagés, premiers plans confinés aux marges basses et libellés de scène corrects. La parallaxe suit les déplacements naturels dans les deux sens ; aucune position ou horloge d’acteur n’a été assignée par le test.

La tentative HTTP sur le build `dist` a confirmé le démarrage du serveur, puis a été bloquée au lancement du navigateur par l’absence du binaire Chromium `headless_shell-1234`. Elle a produit **zéro capture navigateur**. L’échec exact est conservé dans `qa-http-attempt/report.json`. Le harnais HTTP est prêt pour un environnement qui fournit Chromium ; le résultat natif ne remplace pas cette validation navigateur.
