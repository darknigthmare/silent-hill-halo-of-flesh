# Vérifier le package XLSX exporté

Le comparateur [verify-workbook-package.py](verify-workbook-package.py) utilise uniquement la bibliothèque standard Python : ZIP et XML en lecture. Il écrit un rapport JSON neuf et ne sauvegarde jamais de classeur.

Exécuter **avant de remplacer le classeur source**, lorsque l'export est terminé :

```bash
python docs/production/vague23/qa-preparation/verify-workbook-package.py \
  --source=docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx \
  --export=/workspace/scratch/6101dce1e243/outputs/silent-hill-wave23/SILENT_HILL_CORPUS_BIBLE.xlsx \
  --stage-ids=book_fire,book_earth,book_blood,book_water \
  --require-active-stages \
  --report=docs/production/vague23/workbook/package-preservation.json
```

## Changements admis

Les IDs sont recherchés dans `Stages!A9:A131`, sans supposer leur numéro de ligne. La position de chaque ID doit rester inchangée.

Seuls peuvent différer :

- les valeurs de **D/G/J** sur les quatre lignes identifiées ;
- les valeurs calculées de **B4/E4**, jamais leurs formules ;
- **ht/customHeight** sur ces quatre lignes uniquement : chaque changement de hauteur est consigné avant/après.

Aucune largeur, aucun style de cellule, aucune formule ou autre propriété de ligne n'est autorisé à changer. Avec `--require-active-stages`, les quatre cellules D exportées doivent contenir `Actif`.

## Vérifications

Le rapport confronte les valeurs et formules, les styles de cellule résolus par contenu, les validations, les règles conditionnelles et leurs styles, les tables/filtres, les volets, les largeurs, les hauteurs, les styles nommés, thèmes, couleurs et hyperliens. Les identifiants de relations et les numéros internes de style sont résolus avant comparaison.

Les SHA256 des deux fichiers sont repris après lecture pour détecter une modification concurrente.

Codes de sortie : **0** préservation vérifiée, **1** différences interdites, **2** erreur de lecture ou de structure. Un chemin de rapport existant est refusé.

## Limites

Le programme ne réévalue pas les formules et ne rend pas le classeur. Il ne valide pas le sens des nouveaux textes G/J ni les captures visuelles. Il ne compare pas tous les autres formats de pièces OOXML possibles, notamment les graphiques, images, commentaires, macros ou signatures numériques ; ils sont hors du périmètre demandé.

Les entrées ZIP, dates d'archivage, identifiants de relations et styles inutilisés peuvent être réordonnés sans changer le résultat. Les structures non prises en charge ne sont pas assimilées à une preuve de préservation.

Le contrôle interne [workbook-package-selfcheck.json](workbook-package-selfcheck.json) contient **12 cas** sur des copies sémantiques en mémoire du véritable fichier source : changements autorisés acceptés, valeurs/formules/styles/validations/filtres/volets/largeurs et hauteurs hors périmètre rejetés. Il ne certifie pas encore l'export final et n'a écrit aucun XLSX.
