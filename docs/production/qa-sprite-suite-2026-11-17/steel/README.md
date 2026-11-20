# QA native — Steel Guardian contre Anne Cunningham

Date : 17 novembre 2026.

**39 contrôles réussis, aucun échec.** Le véritable `FightEngine` a exécuté les introductions, 120 ticks de combat en pose fixe et la pause, dans les deux ordres de sélection. Les deux captures finales et les deux portraits Steel Guardian ont été inspectés.

## Résultat visuel

| Point | Résultat |
|---|---|
| Orientation | Tête et corps central de Steel Guardian tournés vers Anne dans les deux places. |
| Extrémités en combat | Deux ailes, pointes, lames pendantes, chaînes visibles, mains et griffes des pieds complètes. |
| Portraits de sélection | Les deux portraits de 500 × 500 px conservent l’ensemble des ailes, chaînes, lames et griffes. |
| Transparence | Décor visible autour du corps et entre les éléments ; aucun rectangle opaque ni halo de fond gênant observé. |
| Suspension | Point visible le plus bas à **4,36 px au-dessus du sol**, identique dans les deux places ; posture suspendue cohérente avec la demande. |
| Caméra | Échelle **0,93037** dans les deux duels ; marge extérieure de l’aile **28,68 px** au bord le plus proche. |
| Séparation sélection/combat | Le combat utilise exclusivement le nouveau PNG latéral `.221d68a36f7a.png` ; le portrait reste `.34f6a40e4729.png`. |
| Intégrité | Registre et manifeste inchangés pendant la QA. |

**Aucun recalage recommandé** pour l’ancre `[0.725, 0.98]` et `bodyHeight: 0.86` dans ces vues au repos.

## Captures inspectées

- [Steel à gauche](duel-bom_steel_guardian_146--downpour_anne_cunningham-tick120.png)
- [Steel à droite](duel-downpour_anne_cunningham--bom_steel_guardian_146-tick120.png)
- [Portrait Steel, orientation droite](portrait-bom_steel_guardian_146-right.png)
- [Portrait Steel, orientation gauche](portrait-bom_steel_guardian_146-left.png)

## Preuves et portée

[Rapport des contrôles](report.json) · [Revue visuelle, empreintes et mesures](visual-review.json)

Ces images sont des rendus du moteur réel avec Canvas natif, **pas des captures de navigateur**. Le DOM, le CSS, les entrées et le décodage navigateur ainsi que le service worker ne sont pas couverts. Le décodage temporaire via Sharp est vérifié sans perte ; les PNG sources sont conservés.

Les poses restent fixes. Aucune animation, attaque, collision, quantité exacte de lames/maillons ou fidélité 1:1 n’est certifiée. La direction gauche provient du miroir du moteur et ne constitue pas une référence indépendante du côté opposé.

Harness : `/workspace/scratch/eb1659a0c6b9/qa_sprite_next_native.mjs`, paire `bom_steel_guardian_146:downpour_anne_cunningham`.
