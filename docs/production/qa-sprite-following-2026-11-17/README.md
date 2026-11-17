# QA native — Suite suivante des sprites du 17 novembre 2026

**78 contrôles réussis, aucun échec**, répartis sur deux passages du véritable `FightEngine` avec Canvas natif. Chaque paire a été exécutée dans les deux ordres : quatre duels, huit rendus de portrait et quatre captures finales de combat inspectées. Les deux portraits d’Insane Cancer Arcade ont également été inspectés.

| Passage | Contrôles | Duels | Résultat |
|---|---:|---:|---|
| [Walter Sullivan ↔ Bogeyman Downpour](main/README.md) | 39 | 2 | Corps et armes entiers, orientations correctes, alpha propre, appuis cohérents. |
| [Insane Cancer Arcade ↔ Walter Sullivan](arcade/README.md) | 39 | 2 | Deux poings et deux pieds complets, portraits entiers, sélection et combat distincts. |

Aucun recalage du registre recommandé. L’écart des derniers pixels au sol est de +2,47 px pour Walter, +1,08 px pour Bogeyman et +0,39 px pour Insane Cancer. Les mêmes valeurs se retrouvent dans les deux emplacements.

Les nouveaux PNG de combat sont dessinés exclusivement dans les duels ; les portraits de sélection sont préservés et restent distincts. Les octets des ressources ont été vérifiés contre le manifeste. Registre et manifeste sont restés inchangés pendant chaque passage ; l’import d’Insane Cancer a eu lieu entre les deux.

[Résumé structuré](summary.json)

Ces rendus ne sont pas des captures de navigateur. Les vérifications couvrent les introductions, les poses fixes, le rendu, les ressources exactes, la caméra et la pause. Elles ne certifient aucune animation bitmap, attaque, collision, fidélité 1:1 ou comportement DOM/CSS/service worker. La source complète d’Insane Cancer provient de vignettes natives 120 × 90 px d’une démonstration de conversion du modèle Arcade ; les détails fins restent non certifiés.
