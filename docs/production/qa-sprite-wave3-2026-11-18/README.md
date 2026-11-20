# Contrôle visuel des sprites du 18 novembre 2026, vague 3

**95 contrôles réussis sur 95.** Quatre duels ont exercé les deux emplacements de combat et douze portraits ont été rendus dans les deux orientations des six personnages. La revue visuelle couvre les quatre captures finales `tick120` et les douze portraits, soit seize images.

| Personnage | Observation à l’échelle du jeu |
|---|---|
| Feral, Homecoming | Gueule, quatre pattes et queue entières. Appui au sol à moins de 0,001 px. |
| Needler, Homecoming | Tête suspendue et quatre extrémités tranchantes entières. Appui au sol à moins de 0,001 px. |
| Night Flutter, Silent Hill | Tête, deux ailes repliées et pieds entiers. Appui au sol à moins de 0,001 px. |
| Floatstinger, Silent Hill | Antennes, ailes et dard entiers. La pointe la plus basse reste à 35,44 px au-dessus du sol dans les deux emplacements. |
| Bubble Head Nurse, Return to Silent Hill | Masque, petite pointe crochue, deux mains et chaussures visibles dans les deux portraits. |
| Creeper, Return to Silent Hill | Carapace et six pattes entières dans les deux portraits. |

Les quatre combattants font face à leur adversaire. Les contours se composent proprement sur le décor et aucun recalage n’est recommandé. Les quatre captures initiales `tick0` accompagnent les captures finales pour repérer l’entrée en garde.

Les combats emploient quatre PNG latéraux dédiés. Le menu de sélection rend les anciens portraits de ces combattants et les deux nouvelles images du film à partir de leur chemin exact dans le manifeste. Pour les deux créatures du film, `spriteStatus` indique `selection-only`, `combatSpriteFor` renvoie `null` et le rôle documenté reste `unverified`. Les deux passages confirment les mêmes empreintes du registre et du manifeste.

| Passage | Contrôles | Captures inspectées |
|---|---:|---|
| [FightEngine et gardes](main/report.json) | 75 | 4 duels et 8 portraits. [Revue visuelle](main/visual-review.json) |
| [Sélections du film](selection/report.json) | 20 | 4 portraits. [Revue visuelle](selection/visual-review.json) |

[Résumé structuré](summary.json) · [Feral contre Needler](main/duel-homecoming_feral_086--homecoming_needler_088-tick120.png) · [Night Flutter contre Floatstinger](main/duel-sh1_night_flutter_002--sh1_floatstinger_016-tick120.png) · [Portrait de l’infirmière](selection/selection-film_bubble_head_nurse_return_to_silent_hill-right.png) · [Portrait du Creeper](selection/selection-film_creeper_return_to_silent_hill-right.png)

## Reproduire les rendus

Depuis la racine du dépôt, avec Node, `@napi-rs/canvas` et `sharp`, choisir de nouveaux dossiers de sortie pour préserver les captures du passage initial.

```sh
node scripts/qa-sprite-candidates-native.mjs \
  --pairs=homecoming_feral_086:homecoming_needler_088,sh1_night_flutter_002:sh1_floatstinger_016 \
  --out=qa-local-wave3/main --label=sprite-wave3
node docs/production/qa-sprite-wave3-2026-11-18/selection/verify-selection.mjs \
  --out=qa-local-wave3/selection \
  film_bubble_head_nurse_return_to_silent_hill film_creeper_return_to_silent_hill
```

Le premier passage utilise le moteur de combat et le serveur source. Le second exécute `paintRasterPortrait` avec les octets locaux vérifiés et un cache natif préchargé. La vérification porte sur la pose fixe, le cadrage, la transparence et le chemin de l’image. Le côté opposé provient du miroir du moteur. Les interactions du navigateur, les animations et la fidélité de détail aux modèles d’origine demandent des validations distinctes.
