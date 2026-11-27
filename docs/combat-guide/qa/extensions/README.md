# Vérification des deux extensions et des classeurs

**Révision : 27 novembre 2026.** Référence historique :
`f01622bf097fb980f354f7f0fb55df3685f4e92a`.

Les deux extensions sont intégrées à la chaîne de bible existante et aux deux
classeurs de production. Les 30 rubriques générales conservent leur contenu ;
les 38 nouvelles rubriques ont une source séparée et une table supplémentaire.
La [vue résolue](../../requirements-resolved.json) contient les 68 rubriques.
Le [bilan structuré](validation.json) réunit les comptes, les contrôles réussis
et les empreintes des deux classeurs livrés.

## Périmètre contrôlé

| Contrôle | Résultat |
| --- | --- |
| Textes fournis | Trois sources exactes, conservées sans modification ; SHA-256 contrôlé à chaque génération. |
| Couverture | Rubriques `SHCG-00` à `SHCG-67`, ordonnées et sans doublon : 30 générales + 20 extension 01 + 18 extension 02. |
| Exemples | 48 fiches, couvrant les 16 familles E01 A–J et E02 A–F ; IDs de profils, stages, Chroniques, commandes et références vérifiés. |
| État des extensions | 35 rubriques de conception ; trois bases partielles constatées dans le code : taunt §31, projectiles §41 et contrôles §46. |
| Recette de jeu | 40 scénarios spécifiés : 18 pour l’extension 01 et 22 pour l’extension 02. **Aucun exécuté par cette intégration documentaire.** |
| Associations | 445 entrées : 230 profils, 123 arènes, 15 Chroniques, 66 notices de corpus et 11 projectiles. |
| Fichiers d’image | 707 chemins uniques présents dans l’index Git ou le checkout. Ce contrôle ne décode pas les PNG. |
| Lot de production associé | Sept PNG candidats : trois poses pour des profils existants et quatre plans pour deux arènes. Zéro nouvelle animation. |

Les [contrats détaillés](../../extensions/README.md) et les
[fiches d’exemple](../../extensions/examples.json) gardent les états de lore,
conception, assets, animation, runtime, validation et fidélité séparés. Les
associations `extensionExampleIds` permettent de retrouver les fiches concernant
un profil, un lieu, une Chronique ou une politique de projectile précise.
Un nom partagé entre éditions ne suffit pas à créer ce lien.

Les IDs `SHC_CAM_*` et `SHC_ROUTE_*` désignent des propositions narratives
documentaires. Ils ne sont pas ajoutés au roster. Les restrictions de rôle,
notamment Wall Man fixe et Doll hors duel, restent celles des politiques du
projet. Une acquisition ou une formule d’abonnement proposée ne les contourne pas.

## Deux classeurs existants actualisés

| Classeur | Feuilles historiques conservées | Feuilles finales | Cellules historiques conservées | Formules historiques conservées |
| --- | ---: | ---: | ---: | ---: |
| [Corpus / Stages](../../../production/SILENT_HILL_CORPUS_BIBLE.xlsx) | 2 | 4 | 2 272 | 7 |
| [Production](../../../production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) | 11 | 13 | 250 550 | 80 |

Les **13 feuilles historiques, 252 822 cellules et 87 formules** conservent leur
contenu XML octet par octet. Les styles, chaînes partagées, tables historiques,
métadonnées du classeur et autres parties sans rapport avec l’ajout sont aussi
conservés exactement. Les feuilles historiques gardent leurs états datés ; elles
ne sont pas présentées comme un nouvel inventaire de production.

Dans **Guide combat**, les 30 rubriques restent aux lignes 9–38 et les dix
décisions de modules aux lignes 45–54. La nouvelle table native
`CombatGuideExtensions` occupe `A60:K98`. Les compteurs totalisent les deux tables
de rubriques. Les décisions concernant les équipes et les archives de collection
précisent la conception retenue et le développement différé. Les dix décisions
comprennent trois modules retenus, cinq différés, un à décider et un hors périmètre.

La feuille **Associations guide** conserve ses 445 IDs et reçoit les nouvelles
rubriques associées ainsi que l’état courant des arènes produites. Les hauteurs
de lignes sont adaptées au texte supplémentaire. Les largeurs, styles,
validations, filtres, huit lignes et deux colonnes figées sont conservés.

La [concordance finale au JSON](workbook-source-reconciliation.json) compare
**3 971 cellules de contenu et douze caches de formules par classeur**. Les
empreintes des fichiers effectivement livrés figurent dans ce rapport ainsi que
dans les rapports de [conservation du corpus](corpus-preservation.json) et de
[conservation de production](production-preservation.json).

## Calcul, rendu et maintenance

Artifact Tool importe le classeur de référence, crée les cellules et la nouvelle
table, recalcule les compteurs et produit les rendus. Le
[rapport de création](authoring-report.json) et le
[journal des cellules modifiées](refresh-change-log.json) gardent les entrées
réellement utilisées. L’adaptateur de conservation transfère ces cellules revues
aux deux fichiers en vérifiant toutes les autres parties du paquet OOXML.

Une décision de module puis un état d’extension sont temporairement modifiés :
les compteurs réagissent, puis retrouvent leur valeur après restauration.
La [recherche d’erreurs](formula-scan.ndjson) ne trouve aucune cellule en erreur.
Les douze formules sont relues après réimportation dans le
[corpus](corpus-formulas.json) et dans la [production](production-formulas.json).
Le compteur « Conception seulement » vaut 37 : deux rubriques générales et
35 rubriques des extensions.

Les vues suivantes ont été relues après réimportation des fichiers finaux :

- [Synthèse et rubriques générales](guide-overview.png).
- [Début des extensions](extensions-overview.png) et [preuves et critères](extensions-contracts.png).
- [Module d’accès aux contenus](extensions-access.png) et [contrats associés](extensions-access-contracts.png).
- [Dernières rubriques](extensions-end.png).
- [Associations et compteurs](associations-overview.png), puis [dernières associations](associations-end.png).

Le rendu historique **Corpus** est identique avant et après :
[avant](before-Corpus.png), [après](after-Corpus.png). Le classeur de production
est réimporté pour rendu au moyen d’une projection temporaire qui conserve
exactement les deux feuilles documentaires et la première feuille historique.
Cette projection n’est jamais le fichier livré ; les onze feuilles historiques
du fichier complet sont vérifiées par comparaison exacte de leurs parties ZIP.
Son périmètre est consigné dans le rapport de conservation ; sa première
[vue historique](after-Synthese.png) est conservée avec les rendus.

Le vérificateur de maintenance accepte l’ancienne disposition à deux tables
de guide ou l’ajout exact `CombatGuideExtensions` à `A60:K98`. Un nom, une plage,
un ordre ou une couverture d’IDs incorrects sont rejetés. Les formules
documentaires restent conservées lorsque l’outil actualise la production.

## Vérifications reproductibles

```sh
npm run bible:guide
npm run bible:check
node --test tests/combat-guide.test.mjs
python -m unittest discover -s tests -p test_production_workbook_update.py -v
git diff --check
```

Les journaux de [génération](guide-build.json), de [contrôle reproductible](guide-check.json),
des [tests Node](guide-tests.txt) et des [tests de maintenance Python](production-workbook-tests.txt)
accompagnent cette livraison : **11 tests Node et 11 tests Python réussis**.
Les tests documentaires rejettent notamment une
source modifiée, un cas de recette manquant, une exécution sans preuve, un ID de
campagne utilisé comme combattant et un rattachement à un mauvais rôle ou une
mauvaise édition. Ils refusent aussi le transfert d’une fiche SH1 à son homonyme
Book of Memories, même si les deux IDs existent : le propriétaire des preuves
doit correspondre au propriétaire de la fiche, et ses associations doivent être
exactement celles calculées depuis cette fiche.
Les tests de maintenance contrôlent les annotations, ajouts de
sources, formules et parties OOXML conservées.

Le mode `extensions` du
[script Artifact Tool](../../../../scripts/add-combat-guide-workbook.mjs) part
du classeur à 30 rubriques de la référence historique indiquée. Il refuse de
remplacer une zone déjà occupée ou un contenu divergent de cette référence.
Le [script de greffe](../../../../scripts/graft-combat-guide-workbook.py)
exige le journal exact des cellules revues ; les modifications manuelles doivent
être réconciliées avant une autre greffe.

Les empreintes du rapport de création correspondent aux sources lues lors de
l’écriture. Les métadonnées des associations peuvent être recalculées après la
calibration finale des images ou une régénération des données. Le rapport de
concordance vérifie alors à nouveau toutes les cellules des deux fichiers contre
le JSON final, sans réattribuer au premier export une empreinte qu’il n’a pas lue.

## Portée des preuves

Cette vérification couvre la documentation, ses rattachements et les classeurs.
Elle ne valide pas les 40 scénarios dans le jeu, une animation, une nouvelle
fonction d’équipe ou un service de droits. Les contrôles artistiques et du
prototype appartiennent au [lot de production](../../../production/vague31/README.md).
Les sources exactes et les fichiers présents ne constituent pas une certification
de fidélité 1:1. Excel de bureau n’a pas été exécuté.
