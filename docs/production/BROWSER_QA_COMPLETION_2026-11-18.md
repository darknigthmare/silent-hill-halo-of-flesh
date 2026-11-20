# Résultats finaux de la QA publiée — 18 novembre 2026

Relevé en lecture seule effectué le 18 novembre 2026 à 06:44 UTC. Il complète les diagnostics du 17 novembre sans les réécrire. Les preuves structurées sont dans [browser-qa-completion-2026-11-18.json](browser-qa-completion-2026-11-18.json).

## Commit et résultats GitHub

La [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6) et sa branche `art/missing-fullbody-20261117` pointent toujours sur `fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4`, arbre `c950e77ff9de54235fa171a60b5eff91c12df263`, parent `c2a9fc4acf1934294bb39d29e6759c747e90d87d`. La PR est ouverte en brouillon. Les deux exécutions ci-dessous portent ce même head.

| Exécution | Résultat final vérifié | Détails |
| --- | --- | --- |
| [QA 44197059644](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059644) | `success` | Jobs `test` et `sprite-importer` réussis ; 1251/1251 tests Node, 111 tests de l'importeur et contrôle des fichiers générés réussis. Fin à 23:12:53 UTC le 17 novembre. |
| [HTTP browser QA 44197059597](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059597) | `cancelled` | Les rapports terminés sont positifs ; la commande est annulée après le rapport du dernier script. Le résultat global n'est donc pas une réussite CI. |

## Régression des Rites vérifiée sur le serveur CI

Dans le [log du job navigateur 134441158024](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059597/job/134441158024), l'assertion `Rite 3 advances from a coherent match end to its next prepared encounter` porte explicitement `passed: true` à `2026-11-17T23:14:16.0703576Z` (nom), puis `2026-11-17T23:14:16.0704416Z` (résultat).

Ce résultat distant complète le [diagnostic et correctif du cache](BROWSER_QA_RITE_CACHE_2026-11-17.md). Il valide le scénario navigateur observé sur ce head ; il ne certifie pas toutes les combinaisons possibles de parcours.

## Fin de la commande navigateur

Le workflow exécutait `npm run build && npm run qa:browser`. La commande `qa:browser` enchaîne seize scripts par `&&` ; `http-qa-art92.mjs` est le dernier. Le log atteint ce script et contient quatorze rapports JSON complets extraits, tous avec `passed: true`. Ce nombre de rapports extraits ne doit pas être confondu avec le nombre de scripts.

| Événement du 17 novembre | Heure UTC | Résultat observé |
| --- | --- | --- |
| Début du job navigateur | 23:10:59 | Ubuntu 24.04 ; installation de Chromium réussie. |
| Début de la commande build + QA | 23:11:54 | Étape `Build and test the actual HTTP interface`. |
| Rapport `art144` | 23:38:46.2856585 | `passed: true`, 1018 contrôles, 145 captures. |
| Rapport `art92`, dernier script | 23:41:01.4206817 | `passed: true`, 424 contrôles, 47 captures. |
| Annulation signalée par GitHub | 23:41:01.5293343 | `The operation was canceled.` |
| Fin du job après conservation des résultats | 23:41:15 | Conclusion `cancelled` ; upload de l'artefact réussi. |

Le [script commun art144/art92 à ce commit](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4/scripts/http-qa-art144.mjs) imprime son rapport dans le bloc `finally`, avant `browser.close()` et l'arrêt du serveur. L'annulation arrive environ 0,11 seconde après le rapport positif du dernier script. Le log ne confirme donc pas une sortie normale de toute la commande ni la fin de ce nettoyage.

La limite du [workflow exécuté](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4/.github/workflows/browser-qa.yml) était de 30 minutes. Le minutage est cohérent avec cette limite, mais **l'attribution de l'annulation au timeout reste une inférence** : l'API indique seulement `cancelled`, le log ne nomme pas explicitement la cause et l'endpoint des annotations n'est pas pris en charge par le connecteur. Aucun contournement ni réessai du run n'a été effectué.

L'[artefact `http-qa-v096`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059597/artifacts/14381078565) a bien été conservé : ID `14381078565`, 286 789 432 octets, digest déclaré par GitHub `sha256:871d3a0d7403d3ea73f74f6fc2b549158219d5fdcb9a2ce9f304bf336e9c714e`. Non expiré lors du relevé ; archive non téléchargée pour ce diagnostic.

## Modification bornée et validation restante

La seule modification de `.github/workflows/browser-qa.yml` porte `jobs.browser.timeout-minutes` de **30 à 45 minutes**, afin de laisser une marge à la fermeture des processus et à la variabilité du serveur CI. Les commandes, les seize scripts, les assertions, le runner, les permissions et la conservation des artefacts sont inchangés. Aucune assertion n'est retirée et aucune suite n'est raccourcie.

Cette modification ne transforme pas le run annulé en réussite. Une prochaine exécution devra confirmer une sortie normale et une conclusion globale `success`. Aucun test supplémentaire n'a été lancé pour ce changement de durée ; seules la syntaxe JSON du relevé et la portée du diff ont été relues. Les rapports historiques [limite initiale](BROWSER_QA_TIMEOUT_2026-11-17.md) et [cache des Rites](BROWSER_QA_RITE_CACHE_2026-11-17.md) restent inchangés.
