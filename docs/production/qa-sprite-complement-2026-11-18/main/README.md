# QA visuelle — Screamer et Leonard

**39 contrôles réussis, aucune erreur.** Le vrai `FightEngine` a exécuté les introductions, 120 mises à jour de garde et la pause pour Screamer Downpour ↔ Leonard Wolf SH3, dans les deux ordres. Les deux captures finales et les quatre portraits de sélection ont été inspectés visuellement.

## Lecture visuelle

| Combattant | Vérification dans les deux emplacements | Derniers pixels visibles par rapport au sol | Décision |
|---|---|---:|---|
| Screamer, Downpour | Tête, cheveux, robe opaque, deux mains à griffes et deux bottes entiers ; face à l’adversaire ; alpha propre | −0,009 px | Aucun recalage |
| Leonard Wolf, SH3 | Tête, deux bras pointus avec leurs extrémités, deux jambes et deux pieds entiers ; face à l’adversaire ; alpha propre | +0,003 px | Aucun recalage |

Un nombre positif place les derniers pixels visibles sous le sol ; un nombre négatif les place au-dessus. Les mesures utilisent une enveloppe alpha ≥ 32 et sont identiques après inversion. Les deux appuis sont pratiquement exacts et les silhouettes restent intégralement dans le cadre.

Le fond RGB brun caché de Leonard ne produit **aucun rectangle ni halo réel** dans les rendus Canvas. Les quatre portraits historiques restent complets dans les deux orientations : griffes et bottes de Screamer, pointes des deux bras et pieds de Leonard.

## Contrat d’intégration

Les PNG servis ont été comparés aux octets, dimensions et SHA256 du manifeste. L’adaptation d’encodage PNG est réalisée en mémoire et l’égalité des pixels décodés est contrôlée. Aucun PNG source n’a été modifié. Les combats utilisent exclusivement les nouvelles images de combat, distinctes des portraits conservés pour la sélection.

| Combattant | PNG de combat | Portrait préservé |
|---|---|---|
| Screamer | `downpour_screamer_104.6d78871316ed.png` | `downpour_screamer_104.73dcfd40f467.png` |
| Leonard | `sh3_leonard_wolf_048.cdbe5f879519.png` | `sh3_leonard_wolf_048.70857b7708e8.png` |

Ces fichiers sont dans `assets/sprites/`. Le registre et le manifeste sont restés inchangés pendant la vérification. Les positions, orientations, points de vie et poses des acteurs n’ont pas été remplacés par le harnais.

## Preuves

- [Rapport automatique et géométrie](report.json).
- [Revue visuelle et décision de calibration](visual-review.json).
- [Screamer à gauche, Leonard à droite](duel-downpour_screamer_104--sh3_leonard_wolf_048-tick120.png).
- [Leonard à gauche, Screamer à droite](duel-sh3_leonard_wolf_048--downpour_screamer_104-tick120.png).

Quatre portraits et quatre captures de combat ont été enregistrés. Les deux captures `tick120` et les quatre portraits sont les six fichiers inspectés manuellement ; les deux captures `tick0` ne sont pas comptées comme inspections visuelles.

## Limites

Il s’agit de rendus **Canvas natif**, pas de captures de navigateur. L’unique essai Chromium antérieur du 18 novembre s’était arrêté avant la création d’une page, car l’environnement refusait `socket()` ; aucun nouvel essai n’a été effectué pour ce complément. Le DOM, le CSS, les entrées navigateur, le décodage navigateur et le service worker ne sont pas couverts.

Ces gardes contiennent une seule image. Les mises à jour du moteur ne constituent pas une animation bitmap et ne valident ni de nouvelles attaques, ni les timings de collision, ni une fidélité 1:1. Le côté opposé est le miroir du moteur. Les poses latérales légèrement obliques sont recomposées depuis leurs références d’édition exacte ; leurs détails arrière ne sont pas certifiés séparément.

Ce dossier appartient uniquement au complément Screamer–Leonard. Les rapports et captures du premier sous-lot du 18 novembre n’ont pas été modifiés.
