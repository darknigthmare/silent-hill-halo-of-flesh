# Correction de la fixture des supports cinématiques

## Erreur CI

Run QA [44543361709](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44543361709), job [test / 135627292438](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44543361709/job/135627292438), étape 5 « Run full QA ».

Commit publié : `151c6acf0092044068f6362651c6208aa69ffd35`. Le runner teste son merge PR `4d27d662e1fdb5dea0e89fd773464668c4138efb`.

Première erreur : `tests/cinematic-supports.test.mjs:71`, `sh1_hanged_scratcher_011`, `true !== false` (`ERR_ASSERTION`). Bilan CI : 1289 tests Node réussis sur 1290 ; le job sprite-importer réussit ses 115 tests. Les étapes d’installation et build --verify-only réussissent. Le build complet placé après les tests et la vérification finale des fichiers générés ne sont pas atteints.

## Cause

La fixture négative vide les `props` et `layers` procéduraux de sewer_resort. Depuis l’ajout de son bitmap, elle conserve toutefois le contrat `geometry.ceiling=true` de la composition replace `south-tunnel-pipe-bay`. Le moteur existant donne volontairement priorité à cette géométrie réelle. Le test et le module lore-cinematics ont des blobs identiques entre la base précédente 2c16796 et le commit publié ; le nouveau bitmap révèle la fixture incomplète. Il s’agit d’un défaut de test lié à la nouvelle couverture, sans indice de panne d’infrastructure ni de régression du moteur.

## Correction limitée au test

Le négatif sélectionne explicitement une scène synthétique inconnue, `synthetic-no-support-room`, vide ses motifs et exige que `stageBitmapFor` renvoie null. Les négatifs d’identité inventée, de mauvaise édition et de lieu bloqué sont conservés.

Un nouveau positif exige le vrai bitmap `south-tunnel-pipe-bay`, son mode replace et son plafond déclaré ; Hanged Scratcher et Flesh Lip doivent garder leurs fins signature/nightmare autorisées avec des motifs procéduraux vides. Aucun contrat réel n’est désactivé.

## Vérification locale

- Base exacte, checkout initial propre : échec original reproduit avant édition.
- 53/53 tests réussis dans cinematic-supports, lore-cinematics, stage-bitmaps et stage-room-scope.
- git diff --check réussi ; un seul fichier modifié, tests/cinematic-supports.test.mjs (+16/-1).
- Node local 24.22.3 ; runner QA défaillant Node22.23.4. La future CI devra confirmer le correctif sur son environnement.
- Aucun test d’images, navigateur ou build complet relancé ; aucun commit/publication par cet agent.

Les logs du premier brouillon sont conservés sous attempt1- : le négatif réparé et les tests voisins y passaient déjà, mais une assertion du nouveau positif supposait à tort un sceneId dans la politique. La scène du bitmap sélectionné est désormais vérifiée directement contre sa valeur documentée.

## Livrables

- `ci-diagnosis.json` : preuves et extrait exact de la première erreur GitHub.
- `baseline-reproduction.json` / `baseline-reproduction.log` : reproduction avant correction.
- `verification-report.json` / `targeted-tests.log` : résultat final des 53 tests et périmètre exact.
- `cinematic-support-fixture.patch` : diff minimal à publier.
