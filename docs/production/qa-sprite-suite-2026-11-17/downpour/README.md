# QA native — Anne Cunningham et Prisoner Juggernaut

Date : 17 novembre 2026.

**39 contrôles réussis, aucun échec.** Le véritable `FightEngine` a exécuté deux duels avec inversion des places, les introductions, 120 ticks d’attente en combat et la pause. Quatre rendus de sélection conservent les portraits précédents. Les deux captures finales ont été inspectées visuellement.

## Résultat visuel

| Point | Résultat |
|---|---|
| Orientation | Chaque combattant fait face à son adversaire dans les deux ordres. Le pistolet d’Anne pointe vers l’adversaire. |
| Corps entier | Têtes, mains, pieds et pistolet restent intégralement dans le cadre. |
| Transparence | Aucun rectangle gris ni halo gris gênant autour d’Anne à l’échelle du jeu. Les reflets clairs du Juggernaut appartiennent à sa peau ; aucun fond rectangulaire visible. |
| Appui d’Anne | Bas de l’enveloppe alpha à **+1,51 px** sous la ligne de sol du moteur, dans les deux places. |
| Appui du Juggernaut | Bas de l’enveloppe alpha à **+0,23 px**, dans les deux places. |
| Séparation sélection/combat | Les traces de dessin utilisent uniquement les nouveaux PNG de combat pendant les duels ; les quatre portraits utilisent les images de sélection conservées. |
| Intégrité | Registre et manifeste inchangés pendant la vérification. |

**Aucun recalage du registre recommandé.** Ces écarts d’appui sont faibles et les pieds paraissent posés sur le sol et leurs ombres.

## Captures finales inspectées

- [Anne à gauche, Juggernaut à droite](duel-downpour_anne_cunningham--downpour_prisoner_juggernaut_110-tick120.png)
- [Juggernaut à gauche, Anne à droite](duel-downpour_prisoner_juggernaut_110--downpour_anne_cunningham-tick120.png)

## Preuves

- [Rapport des 39 contrôles](report.json)
- [Revue visuelle et empreintes des captures](visual-review.json)

## Portée

Il s’agit de rendus du moteur réel avec Canvas natif, **pas de captures de navigateur**. Le DOM, le CSS, les entrées navigateur, le décodage navigateur et le service worker ne sont pas couverts. Les PNG passent par un décodage temporaire sans perte pour le Canvas natif ; leurs fichiers d’origine ne sont pas modifiés.

Les images sont des poses fixes. Cette vérification ne certifie aucune animation, attaque, collision ou fidélité 1:1 avec l’œuvre d’origine. La direction gauche provient du miroir du moteur et ne prouve pas indépendamment l’anatomie du côté opposé.

Le harness utilisé est `/workspace/scratch/eb1659a0c6b9/qa_sprite_next_native.mjs`, configuré avec `HALO_QA_ROOT` et la paire `downpour_anne_cunningham:downpour_prisoner_juggernaut_110`.
