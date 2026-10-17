# Corrections de continuation — 17 octobre 2026

Base vérifiée : PR #4, commit `d11cf4e8`, version `0.9.5`.
Cette passe corrige cinq comportements existants. Les nouvelles propositions de
movesets, présentations et animations relèvent du classeur de production de phase 1.

## Corrections et preuves

| Sujet | Défaut reproduit avant correction | Comportement corrigé |
|---|---|---|
| Rites du jugement | Sur le vrai écran HTTP du commit de base, la première rencontre annonce `denseFog`, mais `engine.ritual.id` vaut `none`. Les règles enregistrées écrasaient le rite de la rencontre. | `runEncounterRules()` fournit le même rite à l'interface et au moteur. Les huit rencontres conservent leur modificateur, y compris après sauvegarde/relecture. Les autres parcours conservent leur rite sélectionné. |
| Descente | La graine `1` termine sur un combattant non-boss, alors que le menu promet un dernier boss aléatoire. | Le boss final est réservé avant le tirage des six autres adversaires. Les sept adversaires restent distincts et le tirage demeure déterministe. Les parcours déjà enregistrés gardent leur file d'origine. |
| Import et secours | Un primaire JSON valide mais incompatible avec le jeu remplace encore un secours utilisable lors de l'import transactionnel. Le défaut est reproduit pour un parcours et pour des touches en conflit. | L'import applique les validateurs de parcours/commandes avant toute écriture, et avant de promouvoir un ancien primaire en secours. Le menu d'import et les écritures de résultats utilisent ces mêmes validateurs. Le retour arrière en cas d'écriture partielle reste vérifié. |
| Touches non enregistrables | Sur Chromium et le vrai écran de base : `KeyB` avant Recommencer, `KeyJ` sur le moteur de remplacement. | Les touches sont conservées dans l'état de la page Versus. Recommencer, revenir à la sélection puis relancer gardent les touches et l'aide correspondante. Une erreur de stockage reste signalée ; recharger la page ne garantit pas leur conservation. |
| Première manche et égalisation | Deux tests reproduisent une phase `fatality` après un K.O. qui ne gagne pas le match, dont une égalisation par le Sujet II. | Une fatalité de combattant ou d'arène existante exige désormais que la victoire à venir atteigne `roundsToWin`. Un K.O. intermédiaire règle la manche puis restaure les combattants pour la suivante. La victoire finale conserve son finisher et n'émet qu'un résultat de match. |

La condition de finisher utilise le score du vainqueur, indépendamment du numéro de
manche ou du score de l'adversaire. Elle ne crée aucune nouvelle pose de victoire ou
de défaite et ne certifie pas la fidélité canonique des finishers déjà présents.

## Vérification effectuée

| Vérification | Résultat de cette passe |
|---|---:|
| `npm test` — génération, validation, tests Node et build | **398 / 398** |
| Régressions nouvelles dans `tests/continuation-recovery.test.mjs` | **10 / 10** |
| Suite HTTP étendue `scripts/http-qa-boundaries-v095.mjs` | **43 / 43** |
| Captures HTTP produites | **7** |
| Exceptions JavaScript non gérées dans cette suite HTTP | **0** |

Les dix régressions nouvelles sont incluses dans les 398 tests Node. La vérification
du build conserve 230 profils, 123 arènes et 15 chroniques ; ces compteurs ne valident
ni l'exhaustivité canonique ni la qualité artistique.

Exécution locale : Node `24.19.0`, Playwright `1.57.0`, Chromium `143.0.7499.0`.
La sandbox locale interdisait le serveur HTTP et les processus IPC du navigateur ;
les tests ont réussi avec l'exécution escaladée autorisée, sans modifier le code
des permissions, les protections du navigateur ou les workflows du dépôt.

Le rapport HTTP et ses captures sont produits dans `tests/http-boundaries-v095/`.
La suite couvre la pause, les manettes simulées, les commandes non enregistrées,
l'import réel de fichiers, les secours, le format mobile, les huit rites et le
chargement hors ligne. Les victoires de parcours et les K.O. sont des états préparés,
et les pannes de stockage/manettes sont injectées. Ce ne sont pas des campagnes
intégralement jouées ou des essais sur manettes/téléphones physiques.

Les outils Python d'importation d'images sont inchangés et leur suite n'a pas été
réexécutée dans cette passe de corrections. Les cinq autres suites HTTP historiques
n'ont pas été rejouées ici ; le workflow navigateur existant les conserve.

## Fichiers de cette passe

- `src/fight.js` : décision de finisher selon la victoire de match.
- `src/run-progress.js` : dernier boss de Descente et règles de chaque rencontre.
- `src/save-store.js` : validation métier des imports et des secours.
- `src/command.js` : validateurs appliqués par l'import réel du menu.
- `src/versus.js` : rite moteur/écran commun, imports validés et touches de session.
- `src/playflow-ui.js` : lecture des touches de session depuis la sélection.
- `tests/continuation-recovery.test.mjs` : dix régressions exécutables.
- `scripts/http-qa-boundaries-v095.mjs` : parcours HTTP étendu.
- `docs/CORRECTIONS_CONTINUATION_2026-10-17.md` : présent relevé.

Aucun changement de `data.js`, `movesets.js`, de version, d'image de production ou
de définition de fatalité/stage n'est introduit par ces corrections.
