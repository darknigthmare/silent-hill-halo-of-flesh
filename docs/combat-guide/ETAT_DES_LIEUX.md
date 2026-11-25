# État du guide et des associations

État calculé dans le code et les registres courants, comparé au commit de référence. Le contrôle des chemins est distinct des audits PNG, des recettes jouées et de la certification de fidélité.

Référence : `9c426d7e230eaec464203acb9b43b63a420acf30`, 2026-11-25. Générateur : [build-combat-guide.mjs](../../scripts/build-combat-guide.mjs).

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
| Arènes avec bitmap candidat | 93 | 123 | Arène entière ; plusieurs couches peuvent compter pour une arène |
| Commandes projectile avec bitmap associé | 31 | 86 | 11 définitions d’images partagées selon propriétaire/slots |
| Montages de Dénouement de sujet écrits | 198 | 460 | Chorégraphies ; pas animations ou images finales |
| Montages de Dénouement de lieu écrits | 7 | 123 | Même distinction entre timeline et production |
| Illustrations de Chroniques référencées | 48 | inventaire connu | Ne couvre pas automatiquement les nouveaux briefs |
| Illustrations de récits individuels | 2 | 1 récit(s) | Intro et conclusion fixes ; campagne globale distincte |
| Liaisons entre stages implémentées | 0 | cible à définir | Les bascules Otherworld restent le même stage |

## Associations

| Catégorie | Entrées reliées |
| --- | --- |
| chronicle | 15 |
| corpus | 66 |
| profile | 230 |
| projectile | 11 |
| stage | 123 |

**445 entrées** reliées. 700 chemins d’images contrôlés dans l’index Git. Les clés de commande sont associées sous leur profil, sans leur inventer un nouvel identifiant runtime.

## Écarts de raccord observés

| Type | Sujet | Action |
| --- | --- | --- |
| profile-stage-source-mismatch | sh1_twinfeeler_015 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| profile-stage-source-mismatch | sh3_memory_of_alessa_049 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| story-without-opponents | pt_lisa_149 | Profil admis mais aucun adversaire distinct dans son groupe source ; conserver le récit consultable. |
| aggregate-film-source | film | Le filtre par groupe source ne garantit pas une route propre à chaque film ; contrôler édition, rival et stage avant validation narrative. |

## Livraison de cette passe

14 images fixes candidates : trois poses, trois effets, six plans de décor et deux illustrations individuelles. 0 nouvelle animation. Le récit d’Air Screamer reçoit ses images sans changer sa file de rencontres. Les scènes Shimizu Residence II et prison Otherworld sont corrigées dans les références. Les audits, limites, classeurs et résultats de publication sont consignés dans [la vague30](../production/vague30/README.md). Les preuves anciennes restent datées de leur exécution.
