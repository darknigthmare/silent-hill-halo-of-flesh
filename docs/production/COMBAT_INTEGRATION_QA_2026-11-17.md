# Revue et imports des sprites de combat — 17 novembre 2026

**12 images de combat distinctes ont été importées, accompagnées de 3 nouvelles sélections Arcade. Les 12 portraits sont conservés exactement. Le registre contient 166 profils sur 230 ; 64 restent absents.**

Dix de ces douze profils constituent des rôles actifs en combat. Tuberculosis et Pyramid Return possèdent leurs images mais restent désactivés par `createCombatProfile` ; aucune règle de gameplay n’a été modifiée par cette revue.

## Résultat par profil

| Profil | Combat natif | Actif | Calibration ancre X / Y ; hauteur |
|---|---|:---:|---|
| Brawler | 941 × 1672 | Oui | 0.471838 / 0.958134 ; 0.980861 |
| Agile / Stabber | 941 × 1672 | Oui | 0.471838 / 0.860048 ; 0.819378 |
| Shadow | 941 × 1672 | Oui | 0.435707 / 0.921651 ; 0.944976 |
| God — SH3 | 941 × 1672 | Oui | 0.393199 / 0.986244 ; 0.861244 |
| Demon — Origins | 1536 × 1024 | Oui | 0.364583 / 0.979492 ; 0.966797 |
| Fire Guardian — BoM | 1672 × 941 | Oui | 0.496411 / 0.961743 ; 0.835282 |
| Robbie Axe — Arcade | 941 × 1672 | Oui | 0.467588 / 0.940789 ; 0.927033 |
| Armless Man — 2006 | 941 × 1672 | Oui | 0.446334 / 0.949163 ; 0.980861 |
| Pyramid — Return 2026 | 1671 × 941 | Non | 0.550569 / 0.859724 ; 0.765143 |
| Hummer — Arcade | 1774 × 887 | Oui | 0.535513 / 0.921082 ; 0.518602 |
| Tuberculosis — Arcade | 1536 × 1024 | Non | 0.514323 / 0.902344 ; 0.996094 |
| Tremer — Arcade | 2172 × 724 | Oui | 0.529466 / 0.846685 ; 0.662983 |

Toutes les images de combat sont des `idle` statiques, natives vers la droite (`facing: 1`), classées `side-view-candidate` avec fidélité `unverified`. Les douze fichiers sont distincts de leur portrait. Aucune animation complète, image UHD native ou fidélité 1:1 certifiée n’est revendiquée.

## Réserves visuelles et anatomiques

- Brawler : décalage d’environ 48 px entre les deux appuis ; le rendu n’est pas strictement orthographique.
- God : vue latérale en trois quarts ; deux extrémités inférieures canoniques sans pieds. Rideau exclu de la hauteur de référence.
- Demon : projections dorsales entières mais marge haute de 9 px. Le halo brun visible dans l’aperçu se situe dans le RGB de pixels d’alpha 0 ; il ne constitue pas un fond opaque.
- Fire Guardian : stature de référence adaptée à sa morphologie constamment ramassée, hors cornes. Aucun étalon bipède debout n’est inventé.
- Robbie : les orteils internes sont partiellement occultés en profil ; le nombre de dents demeure indéterminé dans les petites sources.
- Pyramid Return : le premier combat aux marges serrées n’a pas été importé ; la correction garde 108 px de marge significative haute et 132 px basse. La source est une figurine sous licence.
- Hummer : ancre conventionnelle sous le corps en vol, sans pied fictif ; stature corporelle calculée hors ailes.
- Tuberculosis : queue entière à courbure adaptée ; appuis décalés d’environ 24 px ; stature équivalente de faible précision depuis les jambes fléchies. Le profil reste inactif.
- Tremer : ancre et hauteur adaptées au corps rampant sans membres, pas à une stature humanoïde.

## Conservation et traçabilité

Les neuf portraits initiaux et les trois nouveaux portraits ont été comparés à leurs snapshots : dictionnaires et SHA256 des fichiers inchangés. Les champs `selectionProvenance` correspondent aux hashes et dimensions des portraits. Hummer a été repassé une fois par `--selection`, avec le même PNG et les mêmes notes, après le correctif de provenance de l’importeur.

Les seize dry-runs et seize appels réels de l’importeur comprennent douze combats, trois sélections et ce rafraîchissement de provenance. Aucun pixel n’a été retouché par l’agent de revue. Le JSON associé contient les chemins, hashes, limites alpha, images natives consultées, résultats des imports, justifications de calibrations et réserves par profil.

Numb Body — Arcade a été arrêté après le refus `output/sexual` rapporté par la racine (request `69e384e1-616d-4d50-90f8-23ec8263d6c0`). Aucun sprite n’a été importé et aucun nouvel essai n’a été effectué pour ce profil.

Les builds, tests applicatifs et validations de scène de combat sont traités par la racine. Ce rapport de revue des images ne prétend pas certifier leur résultat.
