# Vague 32 — réconciliation des classeurs

Les deux classeurs de `docs/production/` contiennent les **68 rubriques du guide et de ses deux extensions**, ainsi que les **445 associations**. La présente passe actualise quatre cellules par classeur : les noms précis et les statuts bitmap de l’antichambre du Green Lion et de l’entrée de Lighthouse Counseling Center.

Les nouveaux chemins de poses et de récits restent rattachés à leur propriétaire dans `docs/combat-guide/associations.json`. Ce fichier relie **719 images présentes**, dont **12 nouvelles**. Le tableau du classeur résume l’identité, l’œuvre, les rubriques, le statut et le fichier de référence ; il n’ajoute pas de colonnes duplicatives pour chaque frame.

## Résultats vérifiés

| Contrôle | Résultat |
| --- | ---: |
| Cellules du guide comparées aux JSON, par classeur | 3 971 |
| Formules et caches du guide comparés, par classeur | 12 |
| Cellules sources actualisées, par classeur | 4 |
| Feuilles historiques préservées, au total | 13 |
| Cellules historiques préservées | 252 822 |
| Formules historiques préservées | 87 |
| Contrôles de lecture des rendus finaux | 12 |
| Images de rendu conservées | 8 |

Les styles, colonnes, volets figés, validations, formats conditionnels, notes et tables historiques sont préservés. Les feuilles historiques gardent leur date et leur portée d’origine ; les nouveaux états se lisent dans les onglets guide et les JSON associés.

L’authoring, le recalcul et les rendus proviennent d’Artifact Tool. Le changement temporaire d’une décision de module et d’un statut d’extension a fait varier les compteurs concernés ; les valeurs initiales ont ensuite été restaurées. La recherche d’erreurs de formule n’a trouvé aucune entrée. L’adaptateur `scripts/graft-combat-guide-workbook.py` transfère uniquement les cellules du donneur recensées dans le journal et préserve les autres éléments du paquet XLSX.

Les rendus du corpus utilisent le classeur complet. Ceux du grand classeur utilisent une projection temporaire des feuilles du guide dont les charges XML, styles et tables sont exactement celles du fichier complet livré. Cette projection ne remplace pas le classeur. Excel de bureau n’a pas été exécuté.

## Preuves

- [Validation et empreintes des fichiers livrés](validation.json).
- [Journal des quatre changements](refresh-change-log.json).
- [Rapport d’authoring](authoring-report.json) et [recherche des erreurs de formule](formula-scan.ndjson).
- [Préservation du corpus](corpus-preservation.json) et [du grand classeur](production-preservation.json).
- [Liens des douze images nouvelles](association-asset-links.json).
- [Rendus du corpus](render-corpus/render-report.json) et [du grand classeur](render-production/render-report.json).

Les deux noms de décor, leurs statuts, les compteurs du guide et les premières lignes d’extension ont été relus visuellement. La comparaison exacte des charges XML établit la conservation des feuilles historiques non modifiées.

## Refaire la vérification

Depuis la racine du dépôt :

```bash
"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/production/vague32/workbooks/verify-workbooks.py
```

Ce contrôle relit les fichiers livrés, compare les cellules aux sources courantes, retrouve le baseline `d4269ad8239a99cad53d44bc77b569ed7a0d41a3` dans Git et vérifie les empreintes des rendus et des douze images. Il refuse des sources devenues différentes de celles du donneur.

## Actualisation suivante

Après régénération des JSON de la bible, utiliser `scripts/add-combat-guide-workbook.mjs` en mode `refresh-resolved`. Le dernier argument doit désigner le commit contenant les JSON correspondant exactement au classeur d’entrée. L’argument `source.xlsx` doit provenir de ce même commit. Le builder s’exécute avec `CODEX_PRIMARY_RUNTIME_NODE` dans un dossier temporaire lié à `CODEX_PRIMARY_RUNTIME_NODE_MODULES`.

Pour poursuivre avant le prochain commit, le baseline `d4269ad8239a99cad53d44bc77b569ed7a0d41a3` et ses classeurs d’origine restent utilisables : le donneur calculera alors le cumul des changements depuis ce commit. Greffer ce donneur séparément sur chacun des **deux classeurs de ce baseline**, vérifier et relire les rendus, puis seulement remplacer les deux fichiers de production. Réutiliser les anciens rapports exige que leurs empreintes de sources soient encore identiques.

Cette validation concerne les classeurs et leurs liens. Elle n’atteste ni l’exécution des modes décrits dans les extensions, ni une animation supplémentaire, ni une fidélité artistique 1:1.
