# Correction de la fixture de phase des stages — vague 22

La seule modification de code concerne `tests/stage-reference-policy.test.mjs`.
Le moteur, les règles de source et les pixels des deux plans d’Alchemilla restent inchangés.

## Échec reproduit avant modification

Commande exacte :

```sh
node --test --test-name-pattern='^fixed narrative states survive a caller supplying a different Otherworld amount$' tests/stage-reference-policy.test.mjs
```

Résultat : **1 test exécuté, 0 réussi, 1 échec**, sortie 1. `before.txt` conserve
exactement la sortie du diagnostic effectué avant l’édition ; `reproduction.json`
documente cette commande et son résultat. La suite complète initialement en échec
est archivée séparément par le coordinateur.

## Cause et correction

Le test utilisait Alchemilla Origins comme témoin de rendu procédural réagissant à
la quantité Otherworld. La nouvelle scène `normal-first-floor-elevator-landing`
dispose de deux bitmaps en mode `replace`. Sans préparation des images, les deux
appels comparaient désormais le même écran de chargement. Avec des images prêtes,
le renderer conserve les plans de la scène source et retourne avant l’overlay
procédural, conformément au fonctionnement existant.

Cette livraison représente le palier normal du premier étage, lors de la rencontre
avec Kaufmann avant la montée au deuxième étage. Elle ne fournit ni phase Otherworld
ni animation de transition. La règle moteur `versus-transition` et `shift.enabled`
restent néanmoins inchangées : la phase représentée par ces images statiques ne
doit pas être confondue avec la règle de transition du catalogue.

Le test existant utilise maintenant un catalogue bitmap explicitement vide,
restauré dans un `finally`. Il vérifie ainsi réellement les états procéduraux fixes
et conserve l’assertion de différence entre Otherworld 0 et 1 pour la transition.

Un test positif supplémentaire utilise les deux descripteurs réels d’Alchemilla et
des images factices déterministes déjà prêtes dans le cache. Il exige exactement
les deux chemins `drawImage` attendus, refuse les écrans de chargement et d’erreur,
et vérifie que ces plans normaux restent identiques entre Otherworld 0 et 1.
Les entrées précédentes du cache et son horloge sont restaurées dans un `finally`.
Ce contrôle porte sur les appels Canvas ; il ne certifie ni les pixels, ni une
animation, ni une fidélité 1:1.

## Vérification après modification

```sh
node --test --test-reporter=tap tests/stage-reference-policy.test.mjs
```

Résultat : **15 tests réussis sur 15**, aucun échec, test ignoré ou annulation,
sortie 0. `after.tap` conserve la sortie exacte ; `after-command.json` contient
la commande, les compteurs et l’empreinte de cette sortie.

Le diff du seul fichier de test est enregistré dans `test-only.patch` :
**32 lignes ajoutées, 4 retirées**. `git diff --check` sur ce fichier réussit.
Les empreintes des trois fichiers moteur/politique examinés et des deux PNG
d’Alchemilla sont identiques avant et après, comme l’indique `verification.json`.

Aucune suite complète relancée, aucun commit créé et aucune publication effectuée
dans le cadre de cette correction.
