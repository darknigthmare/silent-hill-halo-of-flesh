# Vague 33 — quatre poses supplémentaires intégrées

Ce sous-lot apporte quatre des huit poses fixes intégrées en vague 33. Les PNG ont été produits avec l’outil intégré `image_gen.imagegen`, inspectés individuellement puis importés dans le registre et le manifeste du lot principal. Une créature par image, vue latérale droite, transparence conservée, aucune retouche des pixels après génération.

| Propriétaire exact | Pose | Base de l’action | État |
|---|---|---|---|
| `sh1_night_flutter_002` — SH1 original | `walk` | Déplacement au sol attesté ; ailes repliées selon le modèle source | Pose fixe intégrée, fidélité non vérifiée |
| `sh1_night_flutter_002` — SH1 original | `neutralLight` | Contact frontal au sol ; `StandBiteAttack` cité dans la recherche existante et nommé « Morsure au sol » par le moteur | Pose fixe intégrée, fidélité non vérifiée |
| `sh3_numb_body_medium` — SH3 original | `walk` | Déplacement bipède ; deux jambes, aucun bras | Pose fixe intégrée, fidélité non vérifiée |
| `sh3_numb_body_medium` — SH3 original | `neutralSpecial` | Petit bond suivi d’un heurt frontal, sans bras ni projectile | Pose fixe intégrée, fidélité non vérifiée |

Les commandes d’attaque sont activées dans `createCombatProfile`. Leurs durées, portées, poses exactes et ancrages restent une adaptation versus. Aucune frame du jeu original n’a été extraite. Le modèle Numb Body de référence établit l’anatomie de la famille ; la taille Medium est décrite dans un guide secondaire, mais ses dimensions exactes ne sont pas mesurées.

## Fichiers et métriques

- [import-plan.json](import-plan.json) décrit les chemins actifs, empreintes, indices et ancrages retenus après import.
- `prompts.json` conserve les quatre requêtes et le rôle des images jointes. `generation-results-initial.json` et `generation-results.json` relient les sorties originales aux fichiers retenus.
- `measurements.json` conserve les mesures natives et la revue des contours. `baseline-owners.json` décrit les propriétaires avant import.
- [provenance.json](provenance.json) distingue modèles archivés, guides secondaires, recherche antérieure et continuité des images du projet. Ses mentions de travail non intégré décrivent la livraison initiale, avant l’intégration du lot principal.

Dans le plan courant, `transparentFraction` compte les pixels à alpha < 16 et `pixelSHA256` neutralise le RGB sous alpha nul, conformément à l’importeur. Les mesures initiales restent séparées dans `nativeZeroAlphaFraction` et `nativeDecodedPixelSHA256`. Le SHA256 du fichier vérifie les octets du PNG ; une différence entre les deux protocoles de mesure des pixels ne signale pas une modification de ce fichier.

## Contrôles de production déjà effectués

Les quatre sorties mesurent **1536 × 1024**. La revue initiale des images et de leurs compositions alpha a contrôlé les sujets complets et leurs extrémités. Night Flutter conserve ses ailes repliées et sa tête couverte de vers ; Numb Body conserve son tronc sans bras et ses deux jambes. Aucun profil Small, Large, Arcade ou Air Screamer n’est substitué à ces propriétaires.

Les aperçus initiaux de l’outil montraient un halo coloré. La mesure sépare la faible frange alpha de 1 à 15 ; les compositions Canvas sur blanc et bleu gris n’ont pas montré de halo diffus ni de rectangle opaque perceptible. Ces contrôles concernent les contours des PNG. Ils ne constituent pas une validation finale de leur rendu en combat.

## Calibration courante et limites

Night Flutter `walk` et `neutralLight` utilisent l’appui inférieur mesuré et conservent `bodyHeight: 0.93`. Leur canevas **1536 × 1024** diffère de l’ancien idle **1448 × 1086** : à profil corporel égal, le facteur monde/pixel augmente d’environ **6,05 %**. La silhouette visible reste proche en hauteur, mais ni ce cadrage ni ce réglage ne certifient une échelle source 1:1.

Numb Body `walk` place son appui à y = 918 sur 1024. Pour `neutralSpecial`, `anchorY: 1` représente un support virtuel sous les pieds levés ; le moteur applique déjà le déplacement vertical du petit bond. La recette finale conserve son dessin en action et son retour au repos dans les deux orientations. Elle ne certifie pas la géométrie de collision du jeu source.

L’ancien idle Medium avait `anchorY: 1`, alors que son appui visible se termine à y = 903. Le registre courant utilise **`903/1024`**, sans changer le PNG ni `bodyHeight`. La [fiche d’appui](../idle-anchor-correction.json) conserve le décalage observé avant correction. Cette revue documentaire ne déclare pas la QA après correction réussie.

**Fidélité : `unverified`. Animations ajoutées : zéro.** Ces quatre poses ne constituent ni un cycle de marche, ni une attaque complète chronométrée, ni une vue opposée indépendante. La [recette finale des huit poses](../qa/characters/report.json) réussit 391 contrôles et conserve 32 captures, toutes inspectées. Les deux orientations sont celles du miroir du moteur, sans seconde vue source indépendante.
