# QA visuelle — Walter et Bogeyman

Résultat : **39 contrôles réussis, aucune erreur**. Les deux duels inversés ont exécuté le vrai `FightEngine`, son introduction, 120 mises à jour de garde puis la pause. Les deux captures finales ont été inspectées visuellement.

## Lecture visuelle

| Combattant | Vérification en jeu | Écart maximal au sol | Décision |
|---|---|---:|---|
| Walter Sullivan, SH4 adulte | Corps, deux pistolets, manteau et chaussures entiers ; orientation vers l’adversaire dans les deux emplacements ; alpha propre | +2,47 px | Aucun recalage |
| Bogeyman, Downpour | Corps, tête de masse, manche, masque et chaussures entiers ; orientation correcte dans les deux emplacements ; alpha propre | +1,08 px | Aucun recalage |

Un écart positif indique que les derniers pixels visibles passent légèrement sous l’ancre du sol. Les valeurs sont identiques après inversion des emplacements. Les deux silhouettes restent entièrement dans le cadre ; aucune découpe, bordure de fond opaque ou halo visible à l’échelle de jeu.

## Contrat d’intégration

Les PNG servis ont été comparés aux octets et SHA256 du manifeste. Le décodage natif, les dimensions et les enveloppes alpha correspondent. Les combats utilisent exclusivement les nouveaux PNG latéraux ; les portraits historiques sont toujours utilisés pour la sélection. Quatre portraits et quatre captures de combat ont été enregistrés, dont deux captures finales inspectées. Le registre et le manifeste sont restés inchangés pendant la vérification.

- Walter : `assets/sprites/sh4_walter_sullivan_072.f7a3056ad30d.png`.
- Bogeyman : `assets/sprites/downpour_bogeyman_115.f6de13b5497f.png`.

## Preuves

- `report.json` : contrôles automatiques, géométrie, chemins exacts, limites d’exécution.
- `visual-review.json` : revue des deux captures finales et décision de calibration.
- `duel-sh4_walter_sullivan_072--downpour_bogeyman_115-tick120.png`.
- `duel-downpour_bogeyman_115--sh4_walter_sullivan_072-tick120.png`.

## Limites

Rendu **Canvas natif**, pas une session de navigateur. L’environnement Chromium était indisponible lors du diagnostic précédent et n’a pas été relancé. Le DOM, le CSS, les entrées et le service worker du navigateur ne sont pas couverts. Les images sont des gardes statiques, sans animation bitmap ni certification de fidélité 1:1. Le côté opposé est le miroir du moteur. Cette vérification n’évalue pas de nouvelles attaques ou de nouveaux timings de combat.
