# Liaison des nouveaux idles avec l’historique ART92

Le nouvel idle de Light Guardian était importé et son portrait conservé, mais le lecteur de provenance ne parcourt pas les reçus imbriqués dans `vague22/`. Après la séparation des deux images, le contrat ART92 exige un journal reconnu qui lie l’idle actuel à son propriétaire, sa source, ses octets et son ancien portrait. Water Guardian et Earth Guardian sont les deux autres candidats ART92 de cette vague concernés par cette liaison.

Le [journal de vague 22](../../../sprite-wave22-imports-2026-11-19.json) utilise le schéma existant `schema: 1`, `imports[]`, `kind: distinct-combat-idle`. Il documente les 16 imports et 34 liens de références natives avec URL et SHA256. Les 12 usages de combat et les 4 références d’atelier sont distingués ; le type de journal désigne le slot d’image et ne rend aucun profil jouable.

Pour Twin Pyramid Heads, les déclarations sources restent `singleSubjectReviewed: false`, `singleCollectiveProfileReviewed: true` et `subjectCount: 2`. La convention technique du registre est décrite séparément dans `registryReview`. Un seul profil moteur collectif demeure représenté.

**SHA256 du journal :** `3f7932c1275b5fe7525df17b37345768e6a14b6252a740ddf61398f4802a3f45`.

Les quatre fichiers de tests existants ont été exécutés une fois, séquentiellement : `art-campaign-review`, `art-campaign-tracking`, `gamedev-sprite-backlog` et `production-plan`. **75 tests réussis, 0 échec, code 0**, en 8,213 secondes. Ce résultat ne remplace pas la relance de la suite complète.

Preuves : [commande exacte](command.txt), [log TAP](targeted-tests.tap), [résultats](results.json) et [reçu d’écriture et empreintes antérieures](journal-write-receipt.json). Les 20 fichiers historiques, registre, manifeste et validateurs suivis avant/après sont inchangés. Aucun moteur, validateur, ledger ART144/ART92, fragment historique, portrait ou PNG n’a été modifié pour ce correctif.

L’[exécution complète antérieure en échec](../attempts/continuation-and-procedural-fixture/node-project.txt) reste archivée. Ses résultats ne sont pas comptés parmi ces 75 tests ciblés.
