# Diagnostic navigateur — continuation des Rites

## Check publié observé

Head : `c2a9fc4acf1934294bb39d29e6759c747e90d87d`.

- [QA 44190615216](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44190615216) : terminée, réussite des jobs `test` et `sprite-importer`.
- [HTTP browser QA 44190615221](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44190615221), job `134418718685` : terminée en échec, sortie 1 à `2026-11-17T22:32:44Z`.
- Les cinq premières suites ont passé 345 contrôles. `http-qa-boundaries-v095.mjs` a ensuite passé 31 contrôles et échoué sur « Rite 3 advances from a coherent match end to its next prepared encounter ». Aucun `pageerror` n'est rapporté.
- Ubuntu 24.04 et Chromium étaient installés correctement. Ce run n'a pas atteint la limite globale de 30 minutes.

L'[artefact partiel](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44190615221/artifacts/14375449711), 11 804 170 octets, a été téléchargé et son SHA-256 vérifié : `1dfb26d8182fb2d0192228749ce26e42e5d7e4a6c4edefcbeff6e5bbb5f1fc3b`. La capture `07-actual-rite-config.png` montre Air Screamer contre Numb Body — Small au troisième Rite, avec le dialogue de pause attendu.

## Défaut reproduit

Le rapport CI ne contient ni le seed du parcours ni les sous-termes de l'assertion composée. Il ne permet donc pas d'attribuer définitivement son échec à un quatrième adversaire précis.

Un parcours valide créé avec le seed `3953401584` place Numb Body — Small en troisième position et Split Head en quatrième. La reproduction Node avec les vrais profils et les transitions du moteur confirme que le troisième match atteint `matchEnd`, avec le bon vainqueur, le KO et la présentation `loseMatch` attendus, puis `run.status === 'won'`.

Le chargement suivant échoue ensuite lorsque l'ancien code essaie de conserver toutes les images des deux adversaires à la fois :

| Ensemble de sprites | Octets décodés |
| --- | ---: |
| Ancienne paire Air Screamer + Numb Body | 44 045 088 |
| Nouvelle paire Air Screamer + Split Head | 44 046 800 |
| Union complète des deux paires | 69 209 432 |
| Budget inchangé du cache de sprites | 67 108 864 |
| Nouvelle paire + images finales encore utiles de l'ancien match | 50 336 864 |

Le dépassement lève `RangeError: Combat sprite set exceeds the decoded-memory budget.`. L'interface intercepte cette erreur comme un échec de préchargement et conserve le parcours gagné. Il s'agit donc d'un défaut de transition reproductible avec deux paires individuellement admissibles, même si le seed du run CI reste inconnu.

## Correctif borné

`retainedCombatFrames` conserve toutes les images d'un ancien combat encore actif ou d'une manche réversible. Après `matchEnd`, il conserve uniquement le clip réellement résolu pour chaque présentation finale. Une sortie animée garde toutes ses frames possibles ; un fallback de présentation sur l'idle conserve son image fixe conformément au lecteur de sprites.

Le préchargement capture cette liste réduite pour le retour sur échec, puis ajoute les images complètes de la nouvelle paire. Les images finales de l'ancien match restent décodées pendant le chargement, en cas d'échec et jusqu'au remplacement réussi. Toutes les couches et frames de l'ancien décor restent également protégées. Les portraits de sélection distincts ne sont pas ajoutés au cache de combat.

Le budget de 64 MiB, ses contrôles, l'assertion navigateur et les règles de progression restent inchangés. Les deux caches continuent de valider leurs listes avant toute modification. Aucun registre d'art, PNG, journal de livraison ou workflow n'est modifié par ce correctif.

## Vérification effectuée

`node --test tests/stage-bitmaps.test.mjs tests/sprite-presentation.test.mjs tests/sprite-clips.test.mjs` : **110 tests réussis, 0 échec**.

Les nouvelles régressions vérifient les présentations finales, la conservation d'un clip de sortie complet, le cas Numb Body → Split Head, un décodage en attente puis en échec, le retour aux images précédentes, le réessai réussi, la conservation des frames du décor et le plafond des octets décodés ou réservés. `node --check src/versus.js` et `git diff --check` passent.

Une tentative locale de Chromium a été arrêtée avant tout test par le refus `socket(): Operation not permitted` de l'environnement d'exécution. Aucun succès navigateur local n'en est déduit. Après intégration du lot, le gate complet `npm test` a réussi dans une copie byte-for-byte sur `/tmp` : **1251 tests, 0 échec et 317 fichiers de build vérifiés**. Cette copie résout uniquement le manque d’espace disque du volume source ; aucun code de build ni budget n’est modifié. Les preuves sont dans [le relevé de validation](validation-sprite-following-2026-11-17/summary.json). Le résultat de la nouvelle exécution HTTP navigateur reste à consulter après publication.
