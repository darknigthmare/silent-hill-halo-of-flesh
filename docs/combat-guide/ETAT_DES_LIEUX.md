# État du guide et des associations

État observé dans le code et les registres au commit de référence. Les fichiers image sont reliés par chemin Git ; ils ne sont pas relus visuellement dans cette passe.

Référence : `ce3c73f8e1fcaae515053dbca9458a3f5d9c0219`, 2026-11-25. Générateur : [build-combat-guide.mjs](../../scripts/build-combat-guide.mjs).

| Catégorie | Présent / admis | Périmètre | Lecture correcte |
| --- | --- | --- | --- |
| Rubriques du guide associées | 30 | 30 | Couverture documentaire |
| Entrées de corpus | 66 | 66 | Œuvres, éditions et supports ; pas autant de jeux |
| Profils admis au combat | 187 | 230 | 43 hors duel |
| Commandes activées | 3499 | 4600 | 1101 emplacements désactivés |
| Boss admis | 63 | 75 | Admission ; pas recette artistique complète |
| Récits avec rencontres | 186 | 230 | Structures générées ; pas campagnes toutes détaillées |
| Chroniques avec rencontres | 13 | 15 | 57 rencontres et 11 dossiers |
| Portraits candidats référencés | 204 | 230 | Présence distincte de la fidélité validée |
| Vues latérales candidates déclarées | 190 | 230 | Les vues anciennes sans ce statut restent à revoir |
| Arènes avec bitmap candidat | 90 | 123 | Arène entière ; plusieurs couches peuvent compter pour une arène |
| Commandes projectile avec bitmap associé | 24 | 86 | 8 définitions d’images partagées selon propriétaire/slots |
| Montages de Dénouement de sujet écrits | 198 | 460 | Chorégraphies ; pas animations ou images finales |
| Montages de Dénouement de lieu écrits | 7 | 123 | Même distinction entre timeline et production |
| Illustrations de Chroniques référencées | 48 | inventaire connu | Ne couvre pas automatiquement les nouveaux briefs |
| Liaisons entre stages implémentées | 0 | cible à définir | Les bascules Otherworld restent le même stage |

## Associations

| Catégorie | Entrées reliées |
| --- | --- |
| chronicle | 15 |
| corpus | 66 |
| profile | 230 |
| projectile | 8 |
| stage | 123 |

**442 entrées** reliées. 686 chemins d’images contrôlés dans l’index Git. Les clés de commande sont associées sous leur profil, sans leur inventer un nouvel identifiant runtime.

## Écarts de raccord observés

| Type | Sujet | Action |
| --- | --- | --- |
| profile-stage-source-mismatch | sh1_twinfeeler_015 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| profile-stage-source-mismatch | sh3_memory_of_alessa_049 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| story-without-opponents | pt_lisa_149 | Profil admis mais aucun adversaire distinct dans son groupe source ; conserver le récit consultable. |
| aggregate-film-source | film | Le filtre par groupe source ne garantit pas une route propre à chaque film ; contrôler édition, rival et stage avant validation narrative. |

## Livraison de cette passe

Le guide, les exigences, les associations, les fiches, la campagne conçue et les feuilles documentaires sont les livrables. Aucun nouveau sprite, aucune animation ni nouvelle mécanique runtime ne sont produits par cette passe. Les anciennes preuves restent datées de leur exécution. La publication et ses vérifications sont enregistrées séparément après le commit.
