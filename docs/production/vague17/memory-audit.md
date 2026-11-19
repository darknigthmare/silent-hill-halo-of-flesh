# Audit mémoire — vague 17

Comparaison avec `96cbd9c49233230e8ddaed08f6f6063734aef96e`. Aucun registre commun, budget ou PNG modifié par cet audit. Les résultats ci-dessous ont été établis pendant l’intégration des quatre profils latéraux et des deux nouveaux décors, dont les dimensions sont restées inchangées. Le script portable lit désormais uniquement les registres réellement intégrés `art/registry.json` et `src/stage-bitmap-manifest.js` ; il ne réapplique aucune proposition et ne lit aucun fichier hors du dépôt.

## Résultats

Les deux caches ont chacun un plafond inchangé de **67 108 864 octets (64 Mio)**. Ils sont indépendants. Le calcul utilise les pixels décodés `width × height × 4`, dédupliqués par chemin, et les vrais validateurs du cache ; la taille compressée des PNG ne détermine pas ce budget.

| Situation | État intégré | Résultat |
|---|---:|---|
| Paire de combattants la plus lourde | 50 343 064 octets, 48,0109 Mio | Admise |
| Nouvelle paire + borne de deux images de résultat conservées | 62 935 504 octets, 60,0200 Mio | Admise |
| Chambre d’Alessa, deux plans | 12 586 816 octets, 12,0037 Mio | Admise |
| Underground, deux plans | 12 586 816 octets, 12,0037 Mio | Admise |
| Plus grosse union de deux salles, variantes incluses | 25 175 120 octets, 24,0089 Mio | Admise |

Parmi les 187 profils autorisés au combat, les **17 578 paires sans ordre, miroirs compris**, ont été examinées. Les **14 365 paires disposant déjà de leurs images de combat restent toutes admises** ; les 3 213 autres manquent d’images, comme à la base. Aucun lancement isolé ne devient impossible pour cause de budget.

La Nurse Origins passe de deux à quatre frames : 12 584 704 → 25 170 496 octets. Les quatre nouveaux profils remplacent leur ancien frame de combat, avec portrait conservé hors de `frames[]` : trois ont le même coût, Needler augmente de 4 088 octets. Les rôles non combattants de Doll et Raw Shock restent exclus du calcul des duels jouables.

## Régression repérée puis corrigée dans le changement de sélection

Si un ancien combat **Air Screamer + Groaner** reste vivant, passer à **Nurse Origins + Air Screamer** exige cette union :

- Base : 62 921 616 octets, 60,0067 Mio — admise.
- Vague 17 : 75 507 408 octets, 72,0095 Mio — refusée.

Le cache respecte toujours son plafond : le premier préchargement peut réussir en évincant ses images non épinglées, mais l’épinglage final de l’union échoue avec `Combat sprite set exceeds the decoded-memory budget.`. Ce comportement est reproduit avec la vraie classe `SpriteCache` et des décodeurs simulés aux dimensions déclarées.

Avant correction, les boutons d’en-tête ouvraient ce chemin : `randomize()` modifiait la sélection sans fermer le combat ; un retry pouvait alors demander une autre paire. La galerie permettait aussi de changer la future arène tout en conservant l’ancien moteur.

## Correction minimale intégrée

**Le flux passe maintenant par `showSelect()` avant un choix effectif de nouvelle paire ou d’arène.** Les deux gardes sont intégrées dans `src/versus.js` et ont été relues pendant cet audit.

- Dans `randomize()`, après avoir vérifié que le pool n’est pas vide, avant de modifier les sujets : `if (state.engine || state.loadingSprites) showSelect();`
- Dans le clic d’arène, avant l’affectation : `if (stage.id !== state.stage.id && (state.engine || state.loadingSprites)) showSelect();`

`showSelect()` libère les pins, invalide le chargement en cours, arrête le timer de résultat et détruit l’ancien moteur. Il ne remplace pas `state.run` et n’écrit ni sauvegarde, ni victoire, ni tentative. Le parcours en cours reste reprenable au début de la rencontre, selon la sémantique déjà annoncée par l’interface.

Une simple ouverture/fermeture de galerie, ou le choix de l’arène déjà sélectionnée, ne déclenche pas ce retour. En Récit et Tournoi, les arènes sont imposées par currentModePlan() : la galerie reste consultative et conserve le moteur et le checkpoint même si une autre vignette est cliquée. Le retry sans nouvelle sélection reste inchangé. La continuation après résultat conserve sa récupération actuelle : aucune transaction de suspension/rechargement supplémentaire n’est nécessaire.

Simulation du même contre-exemple après libération normale de la sélection : nouvel épinglage accepté, paire entière décodée, pic **62 923 192 octets**, inférieur au plafond. L’ancien combat est volontairement quitté au moment du choix d’un nouveau contact ; il n’est pas détruit tardivement sur une erreur de préchargement.

## Commande portable et limites

```sh
node scripts/audit-wave17-memory.mjs --out=docs/production/vague17/memory-audit.json
```

Résultats complets, hashes des entrées et simulations : `memory-audit.json`. Le commit de base doit être disponible dans l’historique Git local. Sans `--out`, le script écrit le rapport sur la sortie standard ; avec `--out`, un chemin relatif est résolu depuis la racine du dépôt. Aucun registre n’est modifié. Il n’effectue pas de décodage réel des PNG ; leurs audits raster sont fournis séparément. La version portable a reçu un contrôle syntaxique `node --check`, puis a été exécutée sur les registres intégrés : aucune régression de lancement et les deux gardes de sélection sont confirmées.

L’intégrateur a ajouté trois contrôles HTTP dans `scripts/http-qa-wave17.mjs` : même arène conservant moteur et pins ; autre arène ouvrant la sélection et libérant les deux leases ; Signal aléatoire effectuant la même libération avant le changement de paire. Leur exécution n’est pas revendiquée par cet audit. Les tests existants `tests/stage-bitmaps.test.mjs`, `scripts/http-qa-sprites.mjs` et `scripts/http-qa-chronicles.mjs` couvrent la conservation du résultat, la récupération après erreur d’image, les sélections devenues obsolètes et les checkpoints. Aucune transaction de récupération supplémentaire n’est proposée. Aucune revue navigateur de ce patch n’a été effectuée par cet agent.
