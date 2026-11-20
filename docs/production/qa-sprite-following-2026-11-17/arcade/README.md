# QA visuelle — Insane Cancer Arcade et Walter

**39 contrôles réussis, aucune erreur.** Les deux ordres du duel ont exécuté le véritable `FightEngine`, son introduction, 120 mises à jour de garde et la pause. Les deux captures finales et les deux portraits d’Insane Cancer ont été inspectés visuellement.

## Lecture visuelle

Insane Cancer présente une silhouette entière : tête, épaules, ventre, deux poings, jambes et deux pieds. Son visage et sa garde se tournent vers Walter dans les deux emplacements. Les contours restent entièrement dans le cadre, avec un alpha propre et sans rectangle gris ou halo visible à l’échelle de jeu. Les deux portraits de sélection préservent également le sujet entier avec une marge haute et basse visible.

| Combattant | Derniers pixels visibles par rapport au sol | Décision |
|---|---:|---|
| Insane Cancer — Arcade | +0,39 px | Aucun recalage |
| Walter Sullivan adulte — SH4 | +2,47 px | Aucun recalage |

Les valeurs restent identiques après inversion des joueurs. Walter conserve ses deux pistolets, ses chaussures et son orientation correcte.

## Distinction des ressources

| Usage Insane Cancer | PNG | Dimensions |
|---|---|---:|
| Sélection frontale | `arcade_insane_cancer_arcade.af065e6db36b.png` | 1199 × 1312 |
| Combat latéral | `arcade_insane_cancer_arcade.05cd8a4b7672.png` | 1297 × 1212 |

Les chemins sont dans `assets/sprites/`. Les portraits sont dessinés uniquement dans la sélection ; la pose latérale est utilisée en combat. Les octets HTTP et SHA256 correspondent au manifeste, de même que le décodage natif et l’enveloppe alpha. Registre et manifeste n’ont pas changé pendant la vérification.

## Preuves

- `report.json` : contrôles automatiques, géométrie et chemins exacts.
- `visual-review.json` : revue des deux duels et des deux portraits.
- `duel-arcade_insane_cancer_arcade--sh4_walter_sullivan_072-tick120.png`.
- `duel-sh4_walter_sullivan_072--arcade_insane_cancer_arcade-tick120.png`.
- `portrait-arcade_insane_cancer_arcade-right.png` et `portrait-arcade_insane_cancer_arcade-left.png`.

## Limites

Ce sont des rendus **Canvas natifs**, pas des captures de navigateur. Le DOM, le CSS, les entrées et le service worker du navigateur ne sont pas testés. La nouvelle source Arcade couvre le corps entier à une résolution native de 120 × 90 px ; cette QA ne certifie pas une anatomie ou des matières exactes 1:1. Les images restent des gardes fixes ; le côté opposé est le miroir du moteur. Aucune animation bitmap, attaque ou chronologie de collision nouvelle n’est certifiée.
