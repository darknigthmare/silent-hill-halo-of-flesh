# Reprise des sprites — 17 novembre 2026

**Point de départ :** PR #6, branche `art/missing-fullbody-20261117`, commit `c68a1a97f1680a38613ac92f00524b00c245df89`. Cette reprise ajoute **7 PNG**, **3 profils illustrés supplémentaires** et **4 idles de combat distincts de la sélection**.

**État vérifié du registre : 166 profils illustrés sur 230 ; 64 sans image.** Les images de ce lot sont des poses fixes. Aucun nouveau clip animé, aucune UHD native ni fidélité 1:1 certifiée ne sont comptés.

## Images ajoutées

| Profil | Usage | PNG | Dimensions natives |
|---|---|---|---|
| Pyramid Head — Great Knife (SH2 original) | Combat latéral, vers la droite | [PNG](../../assets/sprites/sh2_red_pyramid_thing_great_knife_029.d21437cdebf4.png) | 1086 × 1448 |
| Fighter (Ascension) | Sélection en pied | [PNG](../../assets/sprites/ascension_fighter_179.429d47545e50.png) | 1024 × 1536 |
| Fighter (Ascension) | Combat latéral, vers la droite | [PNG](../../assets/sprites/ascension_fighter_179.f4cf31409885.png) | 1024 × 1536 |
| Mama (Arcade) | Sélection en pied | [PNG](../../assets/sprites/arcade_mama_117.10d203f5fa42.png) | 1193 × 1318 |
| Mama (Arcade) | Combat latéral, vers la droite | [PNG](../../assets/sprites/arcade_mama_117.fcc669873d67.png) | 1536 × 1024 |
| Split Worm (Arcade) | Sélection en pied | [PNG](../../assets/sprites/arcade_split_worm_arcade.2f1eea0ab83a.png) | 1774 × 887 |
| Split Worm (Arcade) | Combat latéral, vers la droite | [PNG](../../assets/sprites/arcade_split_worm_arcade.64f373c1ec8a.png) | 2172 × 724 |

Pour chaque nouveau profil, le portrait conserve le premier PNG et le clip `idle` ne sélectionne que le second. Pyramid Head conserve exactement son portrait antérieur, sa première frame et sa provenance ; une nouvelle frame latérale lui est ajoutée. Le miroir gauche/droite relève du rendu du jeu, sans image inverse indépendante.

## Références contrôlées

- **Fighter — Ascension :** [portfolio primaire de Rodion Vlasov](https://rodionvlasov.artstation.com/projects/w0lOkX), [turntable identifié](https://www.youtube.com/watch?v=7DhwVu6in1I), vues entières `maxres2.jpg` et `maxres3.jpg`. La combinaison fermée est conservée ; les études anatomiques sous la tenue ne sont pas utilisées.
- **Mama — Arcade :** [modèle nominatif de cette édition](https://models.spriters-resource.com/arcade/silenthillthearcade/asset/340932/), inspecté sous quatre angles. Les membres longs, les pointes et les jambes sans pieds humains sont conservés.
- **Split Worm — Arcade :** [modèle nominatif de cette édition](https://models.spriters-resource.com/arcade/silenthillthearcade/asset/340934/), inspecté de face, de côté, de dos et de trois quarts. La queue, le ventre bas et les valves buccales guident la reconstruction.
- **Pyramid Head — SH2 original :** [illustration source du Red Pyramid Thing](https://www.silenthillmemories.net/sh2/arts/pics/sh2_art_monster_08_red_pyramid_thing.jpg) et image de sélection existante du même profil. Le nouveau sprite utilise une posture de combat de profil.

Les modèles, textures et rendus natifs servent de références temporaires et ne sont pas ajoutés au jeu. Les nouvelles images restent des reconstructions : les poses, textures fines, proportions locales et détails des griffes ne sont pas certifiés à l’identique.

## Intégration et vérification

- `npm run build` : réussi, 289 fichiers de distribution.
- Tests ciblés Node (`sprites`, `sprite-clips`, `sprite-presentation`) : **133 réussis**.
- Tests ciblés Python (`test_sprite_import`, `test_sprite_clip`) : **58 réussis**.
- `git diff --check` : réussi.
- Les **162 autres anciens profils** sont inchangés ; toutes les anciennes images et le portrait de Pyramid Head sont préservés.
- Contrôle visuel du vrai moteur et transport HTTP : **73 contrôles réussis**, 8 PNG reçus avec empreintes identiques, 8 rendus de portraits, 4 duels avec rôles inversés et 120 ticks d’idles exclusivement combat. Le [rapport QA détaillé](qa-sprite-continuation-2026-11-17/report.json) conserve les mesures et les limites du protocole.
- Les quatre captures finales ont été inspectées : silhouettes complètes et appuis cohérents au sol des deux côtés ; aucune correction d’ancre requise.
- Chromium ne démarre pas dans cet environnement (`socket() failed: Operation not permitted`). Les rendus du moteur réalisés hors navigateur ne doivent pas être présentés comme des captures d’une session web.

### Rendus du moteur vérifiés

Ces images sont produites par le vrai `FightEngine` avec un canevas natif, après l’introduction normale et 120 ticks d’idle. Elles ne sont pas des captures de navigateur.

| Duel | Rendu conservé |
|---|---|
| Pyramid Head → Fighter | [Capture](qa-sprite-continuation-2026-11-17/duel-sh2_red_pyramid_thing_great_knife_029--ascension_fighter_179-tick120.png) |
| Fighter → Pyramid Head | [Capture](qa-sprite-continuation-2026-11-17/duel-ascension_fighter_179--sh2_red_pyramid_thing_great_knife_029-tick120.png) |
| Mama → Split Worm | [Capture](qa-sprite-continuation-2026-11-17/duel-arcade_mama_117--arcade_split_worm_arcade-tick120.png) |
| Split Worm → Mama | [Capture](qa-sprite-continuation-2026-11-17/duel-arcade_split_worm_arcade--arcade_mama_117-tick120.png) |

## Reprise sans doublons

Le [relevé machine exact](sprite-status-continuation-2026-11-17.json) contient les 64 IDs encore sans image et les quatre profils à sélection/combat séparés. Le [journal des imports](sprite-continuation-imports-2026-11-17.json) conserve empreintes, dimensions, ancres et affectation des frames ; les [prompts](sprite-continuation-prompts-2026-11-17.json) et la [provenance](../../art/provenance-continuation-20261117.json) rendent le lot traçable.

### Sorties annoncées auparavant, non récupérées dans cette reprise

La fin de la discussion précédente annonçait Hummer Arcade, Tremer Arcade, Tuberculosis et douze vues de combat distinctes. Ces sorties ne sont pas présentes dans le commit distant de départ ; aucune archive correspondante n’a été retrouvée parmi les fichiers accessibles. Elles ne sont donc pas comptées dans ce registre et ne sont pas régénérées par ce lot. **Récupérer leurs fichiers originaux avant toute nouvelle génération de ces sujets.** Le détail exact des douze IDs de combat n’a pas été récupéré.

Le total de 166 publié par cette reprise résulte des **trois nouveaux profils Fighter/Mama/Split Worm** et ne signifie pas que les trois sorties Arcade antérieures ont été récupérées.

Le [rapport précédent](SPRITE_MISSING_2026-11-17.md) reste une archive de l’état 163/230 au commit de départ. Pour reprendre, utiliser le relevé machine de cette continuation, puis relire le registre courant.

Aucune modification du roster, des règles de combat, du classeur de production, ni de la version 0.9.6.
