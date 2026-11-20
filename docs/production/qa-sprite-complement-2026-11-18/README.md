# QA native — Complément des sprites du 18 novembre 2026

**39 contrôles réussis, aucun échec**, dans le véritable `FightEngine` avec Canvas natif. La paire Screamer Downpour ↔ Leonard Wolf SH3 a été exécutée dans les deux ordres : deux duels, quatre portraits de sélection, deux captures finales de combat et quatre portraits inspectés visuellement.

| Combattant | Résultat visuel | Écart au sol |
|---|---|---:|
| Screamer, Downpour | Corps, robe, griffes et bottes entiers ; orientation correcte ; transparence propre | −0,009 px |
| Leonard Wolf, SH3 | Corps, pointes des deux bras et pieds entiers ; orientation correcte ; aucun fond brun ni halo réel | +0,003 px |

**Aucun recalage du registre recommandé.** Les nouveaux PNG de combat sont distincts des portraits de sélection. Les octets servis correspondent au manifeste ; registre et manifeste sont restés inchangés pendant la vérification. Les rapports du premier sous-lot n’ont pas été modifiés.

- [Rapport détaillé et captures](main/README.md).
- [Résumé structuré](summary.json).
- [Contrôles automatiques](main/report.json).
- [Revue visuelle](main/visual-review.json).

## Reproduire le passage

Depuis la racine du dépôt, choisir un nouveau dossier de sortie pour conserver ce journal :

```sh
node scripts/qa-sprite-candidates-native.mjs \
  --pairs=downpour_screamer_104:sh3_leonard_wolf_048 \
  --out=docs/production/qa-sprite-complement-YYYY-MM-DD/main \
  --label=sprite-complement-YYYYMMDD
```

Le harnais inverse la paire, démarre le serveur source et refuse d’écraser un `report.json` existant. Il nécessite Node, `@napi-rs/canvas` et `sharp` ; ce passage utilise Node 24.22.3, Canvas 0.1.100 et Sharp 0.35.5, fournis par l’environnement. Aucune modification de package ou de lockfile n’a été nécessaire.

## Portée

La QA couvre les ressources exactes, les introductions, les poses fixes, la caméra, les deux orientations et la pause. Les captures finales nécessitent toujours une revue visuelle séparée du script. Ce passage n’est pas un test de navigateur : l’unique essai Chromium antérieur s’était arrêté sur un refus système de `socket()` avant l’ouverture d’une page ; aucun nouvel essai n’a été effectué.

Aucune animation bitmap, attaque, collision ou fidélité 1:1 n’est certifiée. Les côtés opposés sont des miroirs du moteur. Les poses latérales légèrement obliques sont recomposées depuis leurs références d’édition exacte ; leurs détails arrière demeurent non certifiés.
