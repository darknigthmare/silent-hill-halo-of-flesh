# Vérification de l’intégration aux classeurs

## Actualisation — extensions 01 et 02, 27 novembre 2026

Le [rapport des extensions](extensions/README.md) décrit l’ajout des rubriques
30–67 à la feuille **Guide combat** et le rafraîchissement des associations.
Les 30 rubriques et les dix décisions de modules gardent leur emplacement.
La table supplémentaire est ajoutée aux deux classeurs existants ; aucune
feuille historique n’est remplacée. Les vérifications et empreintes de cette
actualisation sont séparées des rapports datés qui suivent.

## État historique — vague 30

Le [rapport de la vague 30](../../production/vague30/README.md) et la [validation des classeurs](../../production/vague30/workbooks/validation.json) portent l’état de ce lot : **445 associations**, dont **11 projectiles**, et **700 chemins d’image présents**. Les deux feuilles de guide sont rafraîchies dans chaque XLSX ; les **13 feuilles historiques, 252 822 cellules et 87 formules** sont conservées. Les contrôles de cette mise à jour, ses empreintes et ses rendus sont séparés des preuves initiales ci-dessous.

## Rapport historique de l’intégration initiale

Vérification du 25 novembre 2026, à partir des classeurs historiques de la révision `ce3c73f8e1fcaae515053dbca9458a3f5d9c0219`.

## Résultat

Les deux classeurs existants contiennent désormais les feuilles **Guide combat** et **Associations guide**. Les mêmes données structurées alimentent les deux fichiers.

| Classeur | Feuilles historiques conservées | Feuilles finales | Cellules historiques conservées | Formules historiques conservées |
| --- | ---: | ---: | ---: | ---: |
| `SILENT_HILL_CORPUS_BIBLE.xlsx` | 2 | 4 | 2 272 | 7 |
| `SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx` | 11 | 13 | 250 550 | 80 |

**Guide combat** contient les 30 rubriques `00–29`, leur adaptation au jeu, l’état constaté, les critères de validation, les fichiers associés et les prochaines actions. Une seconde table suit les dix décisions de modules : trois retenus, quatre différés, un à décider et deux non applicables.

**Associations guide** contient 442 lignes : 230 profils, 123 arènes, 15 chroniques, 66 entrées de corpus et huit projectiles. Les identifiants d’origine sont conservés. Les détails complets restent dans [`associations.json`](../associations.json).

Les deux feuilles ont leurs filtres et tables natives, huit lignes d’en-tête figées et deux colonnes figées. Les décisions de modules disposent d’une liste de validation et d’une mise en évidence de l’état « À décider ». Chaque classeur contient douze nouvelles formules de synthèse.

## Conservation vérifiée

Le script [`verify-combat-guide-workbook.py`](../../../scripts/verify-combat-guide-workbook.py) compare le paquet OOXML source au fichier exporté. Il vérifie l’ordre exact des anciennes feuilles, l’ajout exclusif des deux nouvelles feuilles, le contenu XML des anciennes feuilles, les relations, les définitions de styles et les chaînes partagées historiques. Les tableaux natifs et autres parties historiques sont identiques. Les identifiants techniques de relations réémis par l’export sont comparés par leur destination et leur type.

Les 87 formules historiques, les 13 blocs de mise en forme conditionnelle et les 11 listes de validation historiques sont conservés. Les métadonnées du classeur sont inchangées. Les anciennes synthèses gardent leur date et leurs états historiques ; elles ne sont pas présentées comme une actualisation de production.

Les rapports détaillés contiennent les empreintes des fichiers et les comptes par feuille :

- [Conservation du corpus](corpus-workbook-preservation.json).
- [Conservation du classeur de production](production-workbook-preservation.json).
- [Création des feuilles du corpus](corpus-workbook-authoring.json).
- [Création des feuilles de production](production-workbook-authoring.json).
- [Concordance au JSON final](workbook-source-reconciliation.json).

La concordance au JSON final compare 3 484 cellules de contenu et douze caches de formules par classeur. Les chaînes vides du JSON correspondent aux cellules Excel vides. Le rapport de création garde l’empreinte réellement lue lors de l’export ; des métadonnées de provenance ont ensuite été ajoutées à `associations.json`, sans modifier les données des feuilles. Le rapport de concordance porte sur cette version finale.

## Contrôle visuel et calcul

L’importation, la création, les recalculs et les rendus utilisent `@oai/artifact-tool` dans le runtime primaire. Un changement temporaire d’une décision de module a modifié le compteur associé, puis le rétablissement de la décision a restauré le compteur. Aucune erreur de formule n’a été détectée.

Les rendus avant et après réimportation finale des feuilles historiques **Corpus**, **Stages** et **Synthèse** sont identiques octet par octet :

| Feuille | Avant | Après |
| --- | --- | --- |
| Corpus | [Aperçu](before-Corpus.png) | [Aperçu](after-Corpus.png) |
| Stages | [Aperçu](before-Stages.png) | [Aperçu](after-Stages.png) |
| Synthèse | [Aperçu](before-Synthese.png) | [Aperçu](after-Synthese.png) |

Les nouvelles vues ont été relues visuellement :

- [Rubriques et adaptation](guide-overview.png).
- [Existant, actions, critères et références](guide-details.png).
- [Narration, boss, modes et arènes](guide-narrative.png).
- [Décisions de modules](guide-modules.png).
- [Synthèse des associations](associations-summary.png).
- [Premières associations](associations-overview.png).
- [Dernières associations](associations-end.png).

La vérification porte sur les données OOXML et les rendus Artifact Tool. Excel de bureau n’a pas été exécuté.

## Compatibilité de la maintenance

Les scripts de vérification et de mise à jour de production acceptent toujours les onze feuilles historiques, ou ces mêmes onze feuilles suivies exactement de **Guide combat** et **Associations guide**. Toute feuille supplémentaire différente, paire incomplète ou modification d’ordre reste rejetée. Les formules documentaires des deux nouvelles feuilles sont préservées par l’outil de mise à jour de production.

La suite ciblée `python -m unittest discover -s tests -p test_production_workbook_update.py` passe sur le classeur final à treize feuilles : **11 tests réussis**. Elle couvre notamment l’ajout de sources, la conservation des annotations et parties OOXML, les caches de calcul, le rejet des changements de périmètre et la préservation des deux feuilles de guide. Voir le [journal de test](production-workbook-tests.txt).

Le script [`add-combat-guide-workbook.mjs`](../../../scripts/add-combat-guide-workbook.mjs) permet de reconstruire les ajouts depuis les sources structurées et un classeur historique. Il refuse de remplacer automatiquement des feuilles de guide déjà présentes : une nouvelle génération doit repartir d’une source historique identifiée et réconcilier les éventuelles annotations manuelles.
