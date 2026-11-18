# QA visuelle — Scraper, Richard et Weeping Bat

**64 contrôles réussis, aucune erreur.** Le vrai `FightEngine` a exécuté les introductions, 120 mises à jour de garde et la pause pour les deux paires, chacune dans les deux ordres. Les quatre captures finales et les six portraits de sélection ont été inspectés visuellement.

## Lecture visuelle

| Combattant | Vérification dans les deux emplacements | Derniers pixels visibles par rapport au sol | Décision |
|---|---|---:|---|
| Scraper, SH3 | Corps accroupi, deux lames et leurs pointes, mains et chaussures entiers ; face à l’adversaire ; alpha propre | +0,18 px | Aucun recalage |
| Richard Braintree, Victim 19, SH4 | Corps, genou relevé, chaussures et tube courbé entiers ; face à l’adversaire ; légère suspension conservée | −8,76 px | Aucun recalage |
| Weeping Bat, Downpour | Tête, bouche, deux bras, griffes, deux jambes et orteils entiers ; vue latérale orientée vers l’adversaire | −0,11 px | Aucun recalage |

Un nombre positif place les derniers pixels visibles légèrement sous le sol ; un nombre négatif les place au-dessus. Les mesures utilisent une enveloppe alpha ≥ 32 et sont identiques après inversion. Richard conserve volontairement une suspension de 8,76 px, avec une ancre verticale à 1. Aucun corps ni accessoire ne sort du cadre.

Le fond RGB caché de Weeping Bat ne produit **aucun rectangle gris ni halo réel** dans les rendus Canvas. Les six portraits historiques restent complets : les pointes des lames de Scraper, le tube et les chaussures de Richard, ainsi que les doigts et pieds de Weeping Bat sont préservés dans les deux orientations.

## Contrat d’intégration

Les PNG servis ont été comparés aux octets, dimensions et SHA256 du manifeste. L’adaptation d’encodage PNG est réalisée en mémoire ; l’égalité des pixels décodés est contrôlée. Aucun PNG source n’a été modifié. Les duels utilisent exclusivement les nouveaux chemins de combat, distincts des portraits conservés pour la sélection.

| Combattant | PNG de combat | Portrait préservé |
|---|---|---|
| Scraper | `sh3_scraper_045.827b9a459105.png` | `sh3_scraper_045.2bfdc425582b.png` |
| Richard Victim 19 | `sh4_richard_braintree_victim_19.845daa5b3742.png` | `sh4_richard_braintree_victim_19.0355a497acf2.png` |
| Weeping Bat | `downpour_weeping_bat_105.b30525a06086.png` | `downpour_weeping_bat_105.796af2e2894d.png` |

Ces fichiers sont dans `assets/sprites/`. Le registre et le manifeste sont restés inchangés pendant la vérification. Les positions, orientations, points de vie et poses des acteurs n’ont pas été remplacés par le harnais.

## Preuves

- [Rapport automatique et géométrie](report.json).
- [Revue visuelle et décision de calibration](visual-review.json).
- [Scraper à gauche, Richard à droite](duel-sh3_scraper_045--sh4_richard_braintree_victim_19-tick120.png).
- [Richard à gauche, Scraper à droite](duel-sh4_richard_braintree_victim_19--sh3_scraper_045-tick120.png).
- [Weeping Bat à gauche, Scraper à droite](duel-downpour_weeping_bat_105--sh3_scraper_045-tick120.png).
- [Scraper à gauche, Weeping Bat à droite](duel-sh3_scraper_045--downpour_weeping_bat_105-tick120.png).

Six portraits et huit captures de combat ont été enregistrés. Les quatre captures `tick120` et les six portraits sont les dix fichiers inspectés manuellement ; les quatre captures `tick0` ne sont pas comptées comme inspections visuelles.

## Limites

Il s’agit de rendus **Canvas natif**, pas de captures de navigateur. L’unique essai Chromium du 18 novembre s’est arrêté avant la création d’une page, car l’environnement refusait `socket()` ; il n’a pas été réessayé. Le DOM, le CSS, les entrées navigateur, le décodage navigateur et le service worker ne sont pas couverts.

Ces gardes contiennent une seule image. Les mises à jour du moteur ne constituent pas une animation bitmap et ne valident ni de nouvelles attaques, ni les timings de collision, ni une fidélité 1:1. Le côté opposé est le miroir du moteur. Les trois références originales de Weeping Bat sont frontales ou de trois quarts : aucune n’est une vue de dos. La nouvelle pose latérale est recomposée ; ses détails arrière ne sont pas certifiés séparément.
