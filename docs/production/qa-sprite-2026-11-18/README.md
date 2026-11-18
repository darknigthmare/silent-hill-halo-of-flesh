# QA native — Sprites du 18 novembre 2026

**64 contrôles réussis, aucun échec**, dans le véritable `FightEngine` avec Canvas natif. Les paires Scraper ↔ Richard Victim 19 et Weeping Bat ↔ Scraper ont été exécutées dans les deux ordres : quatre duels, six portraits de sélection, quatre captures finales de combat et six portraits inspectés visuellement.

| Combattant | Résultat visuel | Appui ou suspension |
|---|---|---:|
| Scraper, SH3 | Corps et deux lames entiers ; orientation correcte ; transparence propre | +0,18 px sous le sol |
| Richard Braintree Victim 19, SH4 | Corps, tube et chaussures entiers ; orientation correcte ; suspension volontaire | 8,76 px au-dessus du sol |
| Weeping Bat, Downpour | Tous les doigts, griffes, jambes et pieds entiers ; orientation correcte ; aucun fond gris ni halo réel | 0,11 px au-dessus du sol |

**Aucun recalage du registre recommandé.** Les nouveaux PNG de combat sont distincts des portraits de sélection. Les octets servis correspondent au manifeste ; registre et manifeste sont restés inchangés pendant la vérification.

- [Rapport détaillé et captures](main/README.md).
- [Résumé structuré](summary.json).
- [Contrôles automatiques](main/report.json).
- [Revue visuelle](main/visual-review.json).

## Reproduire le passage

Depuis la racine du dépôt, choisir un nouveau dossier de sortie pour conserver ce journal :

```sh
node scripts/qa-sprite-candidates-native.mjs \
  --pairs=sh3_scraper_045:sh4_richard_braintree_victim_19,downpour_weeping_bat_105:sh3_scraper_045 \
  --out=docs/production/qa-sprite-YYYY-MM-DD/main \
  --label=sprite-YYYYMMDD
```

Le harnais inverse chaque paire, démarre le serveur source et refuse d’écraser un `report.json` existant. `--ids`, `--stage`, `--port` et `HALO_QA_ROOT` permettent de l’adapter. Il nécessite Node, `@napi-rs/canvas` et `sharp` ; ce passage utilise Node 24.22.3, Canvas 0.1.100 et Sharp 0.35.5, fournis par l’environnement. La résolution accepte les dépendances locales, `NODE_PATH`, `HALO_QA_NODE_MODULES` ou `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Le package et son lockfile n’ont pas été modifiés.

## Portée

La QA couvre les ressources exactes, les introductions, les poses fixes, la caméra, les deux orientations et la pause. Les captures finales nécessitent toujours une revue visuelle séparée du script. Ce passage n’est pas un test de navigateur : l’unique essai Chromium s’est arrêté sur un refus système de `socket()` avant l’ouverture d’une page. Aucun nouvel essai n’a été effectué.

Aucune animation bitmap, attaque, collision ou fidélité 1:1 n’est certifiée. Les côtés opposés sont des miroirs du moteur. Les trois références Weeping Bat sont frontales ou de trois quarts ; la pose latérale est recomposée et les détails arrière demeurent non certifiés.
