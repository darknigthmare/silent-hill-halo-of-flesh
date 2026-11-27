# Vague 33 — synchronisation finale des deux classeurs

Les deux classeurs de production sont réconciliés avec les sources finales du guide : **68 rubriques**, **445 associations**, **729 images référencées** et **98 arènes disposant d’un bitmap candidat**. Les dix PNG supplémentaires correspondent à huit poses fixes pour quatre profils et aux deux couches de la galerie Historical Society de Silent Hill: The Arcade.

## Ce qui change

Deux cellules par classeur sont actualisées dans `Associations guide` :

| Cellule | Ancienne valeur | Nouvelle valeur |
| --- | --- | --- |
| C337 | THE ARCADE — HISTORICAL SOCIETY | THE ARCADE — GALERIE DE LA HISTORICAL SOCIETY |
| F337 | sans bitmap de stage ; fixed-normal | bitmap candidat référencé ; fixed-normal |

Les détails des nouvelles poses et des deux couches restent dans `docs/combat-guide/associations.json`, reliés aux propriétaires exacts. Les quatre profils sont `sh1_night_flutter_002`, `sh2_lying_figure_020`, `sh2_lying_figure_crawling_021` et `sh3_numb_body_medium`. Les cellules de synthèse de profils qui n’ont pas changé sont conservées.

La source finale est celle régénérée après les ajustements de calibration du rampant, de son attaque basse et du retrait du clignotement générique de la galerie. Ces changements de données ne sont pas convertis en nouvelles colonnes improvisées dans les feuilles historiques. Les compteurs d’images proviennent des associations ; les anciennes synthèses datées restent des relevés historiques.

## Baseline et préservation

La référence est la vague 32 **publiée**, commit `4f7d2e89c106ad4a00752bcb4c9b046ee3043b18`, tree `453e9a5f8b74e4e5c4dd0e306294b4c79e8867eb`. Les snapshots ont été lus par `git show <tree>:<chemin>` avec `GIT_NO_LAZY_FETCH=1`. Après restauration de l’environnement, leurs empreintes Git ont été confrontées de nouveau aux entrées de ce tree avant l’authoring final.

Les **13 feuilles historiques**, leurs **252 822 cellules** et leurs **87 formules** sont préservées byte pour byte. Les tables historiques, les styles, les chaînes partagées et les autres parties non concernées du paquet XLSX sont également conservés. Dans les deux feuilles du guide, les autres cellules, largeurs, styles, volets figés, validations, formats conditionnels, notes et hyperliens sont préservés.

## Authoring et contrôles

Artifact Tool importe le corpus baseline et produit un donneur final en mode `refresh-resolved`. Ses sources JSON sont identifiées par SHA-256. Le recalcul est vérifié par changement temporaire d’une décision de module et d’un statut d’extension, puis restauration des valeurs initiales. La recherche d’erreurs de formule trouve **zéro entrée**.

L’adaptateur `scripts/graft-combat-guide-workbook.py` transfère uniquement les cellules autorisées et les compteurs du donneur dans chacun des deux classeurs baseline. Chaque candidat est confronté aux sources finales : **3 971 cellules sources et 12 formules/caches par classeur**. Le corpus est réimporté et rendu en entier. Pour le grand classeur, la projection de lecture conserve exactement les charges XML des deux feuilles du guide et de la première feuille historique ; elle ne remplace jamais le fichier livré.

Huit rendus sont conservés, avec dix contrôles de lecture. Cinq images distinctes ont été inspectées visuellement ; les trois autres sont byte-identiques à leurs équivalents déjà inspectés. Les titres, les textes enveloppés, les compteurs, la ligne Historical Society et les premières lignes historiques restent lisibles. Les empreintes de la projection et de chaque rendu sont enregistrées.

Les deux fichiers finaux sont remplacés atomiquement après ces contrôles. `validation.json` relit les livrables, vérifie leurs empreintes, les sources, les formules, la préservation historique, les liens des dix nouvelles images et les preuves de rendu.

## Preuves conservées

- [Validation finale et empreintes](validation.json).
- [Baseline et audit](baseline-files.json), [audit des feuilles](baseline-audit.json).
- [Delta des sources](source-delta.json), [journal de la greffe](refresh-change-log.json).
- [Authoring final](authoring-report.json), [recherche d’erreurs de formule](formula-scan.ndjson).
- [Préservation du corpus](corpus-preservation.json), [préservation du grand classeur](production-preservation.json).
- [Liens et propriétaires des dix nouvelles images](association-asset-links.json).
- [Rendus du corpus](render-corpus/render-report.json), [rendus du grand classeur](render-production/render-report.json), [relecture visuelle](visual-review.json).

Au moment du contrôle, les dix nouvelles images sont dans le miroir source persistant ; les 719 images antérieures sont lues dans le cache reconstruisible de la baseline. Cette distinction est inscrite dans les preuves. Aucun fichier unique ni livrable final n’est stocké uniquement dans ce cache.

## Refaire la vérification

Depuis la racine du dépôt :

```bash
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/production/vague33/workbooks/verify-workbooks.py
```

Le contrôle exige les sources et livrables de cette passe, ainsi que les objets du tree publié32. `audit-sources.py` peut reconstruire le delta et les liens à partir de la baseline ; son cache de lecture des images antérieures peut être indiqué par `HALO_ASSET_CACHE`.

Pour refaire l’authoring, extraire les deux XLSX du tree publié32, exécuter `scripts/add-combat-guide-workbook.mjs` avec `refresh-resolved` et ce même tree comme dernier argument, puis greffer le donneur séparément sur les deux snapshots. Exécuter les scripts Artifact Tool avec le runtime principal et les dépendances `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Garder tous les candidats et projections temporaires à part, inspecter les rendus, puis remplacer les livrables et relancer la vérification finale.

Excel de bureau n’a pas été exécuté. Cette validation atteste la cohérence et la conservation des classeurs ; elle ne certifie ni une nouvelle animation, ni la réalisation de tous les modes du guide, ni une fidélité artistique 1:1.
