# Classeur de production — couverture après vague 19

Le classeur existant a reçu une mise à jour factuelle avec **Artifact Tool dans le runtime primaire**, puis un audit natif en lecture seule. Aucun fichier du dépôt source n’a été modifié par ce travail.

## Résultat

- 204 portraits sur 230, 135 vues latérales candidates, 6 clips animés et 32 décors bitmap actifs sur 123.
- Restants : 26 portraits absents, 37 vues de combat absentes et 58 vues héritées à revoir.
- 330 cellules factuelles mises à jour : Combattants 54, Clips 241, Mouvements 1, Arènes 32 et Synthèse 2.
- 151 hauteurs de lignes augmentées ; aucun changement de largeur de colonne, de style de cellule, de tableau, de filtre ou de validation.
- 80 formules conservées et recalculées. Résultats : 204 PNG, 6 clips, 0 certification, 840 actions ouvertes et 93 P0.

Les 11 onglets, leurs 250 550 cellules, les rôles, les responsables, les états de production et 177 blocs d’historique sont préservés. La disponibilité du clip d’attaque Origins `neutralSpecial` est indiquée en Mouvements Y1839 ; les cinq autres clips animés correspondent aux poses de base.

## Vérification

Les 38 parties natives du XLSX sont comparées après résolution de chaque ID de relation vers sa cible. Seules les valeurs du journal, les hauteurs exactes du journal et les caches recalculés sont exclus de la comparaison. Artifact Tool régénère les IDs internes des relations : le comparateur historique exigeant une identité binaire ZIP échoue donc, et cet écart de sérialisation est explicitement conservé dans le rapport. L’audit complet du graphe XML valide les mêmes cibles et toutes les autres métadonnées.

La suite du dépôt `tests/test_production_workbook_update.py` passe **10 tests** en 165.553 s, dans une copie isolée utilisant le XLSX candidat et son rapport. L’édition d’une action a aussi été exercée puis restaurée : 840 → 839 → 840 actions ouvertes.

Les aperçus de la Synthèse et des faits modifiés sont contrôlés. Le plus long ancien historique (Clips I1876) conserve sa limite de hauteur de 390 points : les 3 453 caractères restent dans la cellule, mais la fin se consulte en ouvrant la cellule. Aucun texte historique n’a été supprimé pour raccourcir la ligne.

## Import et historique

`delivery.json` donne les fichiers et destinations proposées. Copier le XLSX et le rapport canonique ensemble, ainsi que les journaux et le snapshot compressé qu’ils référencent. Les aperçus se trouvent dans `previews/`.

`planSha256` vaut `null` : aucun nouveau plan complet n’a été appliqué. L’ancien hash `45b092009538a4586933571ac633f094b8de3f9bb7fdbad4cb8795ef5873bede` est gardé dans `historicalPlanSha256`, avec le rapport précédent. Une future mise à jour complète doit d’abord réconcilier cette étape factuelle.

SHA256 du classeur livré : `4016c8e34463b43931618f7fe01ffc0c16e519515ef8a299437ce70d41725871`.

Aucune session Excel native, mesure de timing source ni certification artistique 1:1 n’est revendiquée.
