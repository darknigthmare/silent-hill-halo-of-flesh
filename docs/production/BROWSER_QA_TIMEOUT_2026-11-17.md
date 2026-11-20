# Diagnostic de la limite du contrôle navigateur — 17 novembre 2026

Le [run HTTP browser QA 44184519620](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44184519620), sur le commit `dfd9c7f3d0b082dc0794e9f502246ffb630269da`, s’est terminé avec le statut `cancelled`. Le [job navigateur 134397337269](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44184519620/job/134397337269) utilisait bien Ubuntu 24.04 et avait installé Chromium avec succès.

Les douze rapports entièrement présents dans ses journaux totalisent **977 contrôles réussis, zéro échec et zéro erreur JavaScript**. Ils couvrent **12 des 16 suites** exécutées en série. La suite `source-expansion`, qui représente 430 de ces contrôles, s’est terminée après environ 6 min 54 s ; les rapports complets de `cinematic-expansion`, `art-batch4`, `art144` et `art92` n’ont pas été produits avant l’annulation.

| Horodatage vérifié | UTC |
|---|---|
| Début du job | 21:53:41 |
| Dernier rapport complet, `source-expansion` | 22:04:42 |
| Annulation de la commande | 22:05:53 |
| Fin du nettoyage du job | 22:06:00 |

La commande est annulée environ **12 min 13 s après le démarrage du job**, dont la limite globale était de **12 minutes**. Aucun run plus récent sur cette branche n’indique un remplacement concurrent. Ces éléments rendent un dépassement de cette limite **très probable**. L’API indique toutefois seulement `cancelled` et le journal « The operation was canceled » ; l’annotation explicite de cause n’a pas pu être lue, l’endpoint correspondant étant refusé par le connecteur. Il ne s’agit donc pas d’une attribution formellement confirmée par GitHub.

Le workflow porte uniquement `jobs.browser.timeout-minutes` de **12 à 30 minutes**, afin de laisser les seize suites atteindre leur terme. Le runner Ubuntu 24.04, les commandes, les assertions, les permissions et la conservation des artefacts restent identiques. Aucune suite n’est supprimée ou raccourcie.

Cette modification de budget ne transforme pas le run annulé en validation complète. Les **977/977** résultats sont ceux des douze suites achevées ; une nouvelle exécution doit encore vérifier l’ensemble. L’[artefact partiel conservé](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44184519620/artifacts/14374641781) porte l’ID `14374641781` ; son archive de 108 230 348 octets n’a pas été téléchargée pendant ce diagnostic.
