# Préservation des remplissages conditionnels du classeur

## Diagnostic et décision

Le premier export obtenu après import dans `@oai/artifact-tool` perdait l’attribut natif `patternType="solid"` des quatre formats différentiels (`dxf`) du classeur source. Les couleurs, textes, plages et priorités des règles restaient présents. Le rapport initial affiche deux différences, car il fournit le premier écart de chaque collection de règles comparée, une par feuille. La lecture directe du XML a confirmé les quatre attributs manquants.

L’aide publique `range.conditionalFormats`, conservée dans `conditional-format-api-help.json`, documente les opérations `clear()` et `add()`. Elle n’expose pas de modification ciblée de l’attribut d’un `dxf` importé. Le diagnostic reproductible `../qa-preparation/probe-dxf-export.mjs` crée une seule règle temporaire avec `format: {fill: '#FFF0CB'}`. Son export contient bien `patternType="solid"` : voir `conditional-format-api-probe.json`. Le défaut concerne donc l’aller-retour des règles importées ; l’ajout documenté d’une règle conserve le remplissage.

**Le correctif utilise exclusivement l’API d’édition d’artifact-tool. Aucun composant OOXML n’est modifié manuellement.**

## Correctif dans le workflow

`../qa-preparation/read-source-conditional-formats.py` ouvre le ZIP/XML du classeur source en lecture seule. Il exige les deux feuilles attendues, les quatre plages connues, les règles simples `containsText`, leurs priorités et leurs remplissages opaques unis. Il refuse toute définition plus riche ou inattendue. Il retourne les valeurs effectivement lues, avec le SHA-256 du fichier source.

`../update-workbook.mjs` vérifie ce SHA, retire les quatre règles de leurs plages puis les réapplique dans leur ordre original avec `range.conditionalFormats.add(...)`. Aucune couleur ni condition n’est déduite du contenu des cellules.

| Feuille | Plage | Texte recherché | Priorité | Couleur originale |
| --- | --- | --- | ---: | --- |
| Corpus | G9:G74 | Absent | 1 | `#FFF0CB` |
| Corpus | E9:E74 | Annulé | 2 | `#F5DFDE` |
| Stages | D9:D131 | Absent | 1 | `#FFF0CB` |
| Stages | E9:E131 | Bloquée | 2 | `#F5DFDE` |

L’exporteur conserve les anciennes entrées différentielles 0–3, désormais inutilisées, et les quatre règles pointent vers les entrées 4–7 qui contiennent `solid`. Les identifiants internes changent ; les définitions natives appliquées aux cellules restent équivalentes. Les enregistrements de style inutilisés et les identifiants internes étaient déjà exclus de l’équivalence sémantique du comparateur. **Le comparateur n’a reçu aucune modification ni exception pour ce correctif.**

## Dernier export vérifié

Le texte ajouté en J21 et J26 est dérivé du champ `edition` contenant `E3 prerelease` : « Référence E3 de préversion ; état commercial non certifié. » Earth possède déjà cette qualification et ne reçoit pas de phrase redondante. Fire conserve sa référence à la capture de lancement.

Les seules valeurs modifiées sont D/G/J des lignes 21, 22, 23 et 26, plus les résultats calculés B4/E4. Toutes les formules sont conservées. Les hauteurs autorisées passent de 36 à 101 pour Blood/Water et de 88 à 153 pour Earth/Fire. Aucune largeur, aucun style de cellule et aucune autre ligne ne changent.

- `package-preservation.json` : réussite, **0 différence** hors valeurs et hauteurs autorisées ; validations, règles conditionnelles résolues, tables/filtres, vues/panes et autres propriétés couvertes conservés.
- `workbook-verification.json` : relecture complète de l’export, formules et tables conservées ; recalcul avec modification temporaire puis restauration réussi ; totaux **69 actifs, 39 absents ouverts, 15 bloqués, 123 lieux**.
- `stages-after-summary.png` et `book-zones-after.png` : rendus depuis le fichier final réimporté. Les notes, qualifications de préversion et chemins des quatre stages sont lisibles. La revue finale des deux aperçus a aussi été confirmée par l’agent principal.
- Les preuves du premier export restent disponibles dans `package-preservation-initial-export.json` et `workbook-verification-initial-export.json`.

SHA-256 du source utilisé, resté intact pendant l’édition et la comparaison :

`a7928d7350d35bcd61745b886110b1c007525b41644ff30001e1c981ace49649`

SHA-256 du candidat final vérifié avant promotion :

`75ac1eee15b90e8ff981e4531b2ad6801b68a61732d4974794583b10965eb6ff`

## Reproduction et limites

Le workflow s’exécute avec une copie identique du builder dans un dossier temporaire dont `node_modules` pointe vers `CODEX_PRIMARY_RUNTIME_NODE_MODULES`. Le runtime Node et le Python utilisés sont ceux de l’environnement primaire. Les commandes exécutées avant promotion étaient :

```bash
"$CODEX_PRIMARY_RUNTIME_NODE" update-workbook.mjs \
  --root=/workspace/scratch/6101dce1e243/silent-hill-halo-of-flesh \
  --out=/workspace/scratch/6101dce1e243/silent-hill-halo-of-flesh/docs/production/vague23/workbook \
  --output=/workspace/scratch/6101dce1e243/outputs/silent-hill-wave23/SILENT_HILL_CORPUS_BIBLE.xlsx \
  --mode=edit

"$CODEX_PRIMARY_RUNTIME_PYTHON" docs/production/vague23/qa-preparation/verify-workbook-package.py \
  --source=docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx \
  --export=/workspace/scratch/6101dce1e243/outputs/silent-hill-wave23/SILENT_HILL_CORPUS_BIBLE.xlsx \
  --stage-ids=book_fire,book_earth,book_blood,book_water \
  --require-active-stages \
  --report=docs/production/vague23/workbook/package-preservation.json
```

La première commande se lance dans le dossier temporaire d’édition ; la seconde à la racine du checkout. Le rapport du comparateur exige un chemin neuf. Après promotion du candidat, une reproduction nécessite un checkout isolé avec le source original correspondant au SHA ci-dessus : le classeur central promu ne constitue plus la baseline.

Ces contrôles établissent l’équivalence des fonctionnalités natives couvertes et la lisibilité des rendus artifact-tool. Ils ne constituent pas une ouverture ni un recalcul dans Excel ou LibreOffice. Les limites détaillées du comparateur restent consignées dans son rapport.
