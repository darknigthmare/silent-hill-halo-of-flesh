# État du guide et des associations

État calculé dans le code et les registres courants, comparé au commit de référence. Le contrôle des chemins est distinct des audits PNG, des recettes jouées et de la certification de fidélité.

Référence : `f01622bf097fb980f354f7f0fb55df3685f4e92a`, 2026-11-27. Générateur : [build-combat-guide.mjs](../../scripts/build-combat-guide.mjs).

| Catégorie | Présent / admis | Périmètre | Lecture correcte |
| --- | --- | --- | --- |
| Rubriques du guide et des extensions associées | 68 | 68 | 30 générales + 38 extensions ; couverture documentaire |
| Textes originaux conservés et vérifiés | 3 | 3 | SHA-256 des trois fichiers originaux |
| Scénarios de recette des extensions rédigés | 40 | 40 | 18 + 22 cas ; leur rédaction ne valide pas le runtime |
| Scénarios de recette des extensions exécutés | 0 | 40 | Les tests documentaires ne s’ajoutent pas à ce compteur |
| Fiches d’exemple reliées aux IDs existants | 48 | 16 familles de fiches | Conception proposée ; pas de nouveaux combattants ou systèmes actifs |
| Entrées de corpus | 66 | 66 | Œuvres, éditions et supports ; pas autant de jeux |
| Profils admis au combat | 187 | 230 | 43 hors duel |
| Commandes activées | 3499 | 4600 | 1101 emplacements désactivés |
| Boss admis | 63 | 75 | Admission ; pas recette artistique complète |
| Récits avec rencontres | 186 | 230 | Structures générées ; pas campagnes toutes détaillées |
| Chroniques avec rencontres | 13 | 15 | 57 rencontres et 11 dossiers |
| Portraits candidats référencés | 204 | 230 | Présence distincte de la fidélité validée |
| Vues latérales candidates déclarées | 190 | 230 | Les vues anciennes sans ce statut restent à revoir |
| Arènes avec bitmap candidat | 98 | 123 | Arène entière ; plusieurs couches peuvent compter pour une arène |
| Commandes projectile avec bitmap associé | 31 | 86 | 11 définitions d’images partagées selon propriétaire/slots |
| Montages de Dénouement de sujet écrits | 198 | 460 | Chorégraphies ; pas animations ou images finales |
| Montages de Dénouement de lieu écrits | 7 | 123 | Même distinction entre timeline et production |
| Illustrations de Chroniques référencées | 48 | inventaire connu | Ne couvre pas automatiquement les nouveaux briefs |
| Illustrations de récits individuels | 6 | 3 récit(s) | Intro et conclusion fixes ; campagne globale distincte |
| Liaisons entre stages implémentées | 0 | cible à définir | Les bascules Otherworld restent le même stage |

## Associations

| Catégorie | Entrées reliées |
| --- | --- |
| chronicle | 15 |
| corpus | 66 |
| profile | 230 |
| projectile | 11 |
| stage | 123 |

**445 entrées** reliées. 729 chemins d’images contrôlés dans l’index Git ou le checkout. Les clés de commande sont associées sous leur profil, sans leur inventer un nouvel identifiant runtime.

## Écarts de raccord observés

| Type | Sujet | Action |
| --- | --- | --- |
| profile-stage-source-mismatch | sh1_twinfeeler_015 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| profile-stage-source-mismatch | sh3_memory_of_alessa_049 | Relire le raccord de lieu et d’édition ; le repli runtime ne prouve pas sa fidélité narrative. |
| story-without-opponents | pt_lisa_149 | Profil admis mais aucun adversaire distinct dans son groupe source ; conserver le récit consultable. |
| aggregate-film-source | film | Le filtre par groupe source ne garantit pas une route propre à chaque film ; contrôler édition, rival et stage avant validation narrative. |

## Livraison de cette passe

Le guide et ses deux extensions restent associés aux contenus : 68 rubriques, 48 fiches d’exemple et 40 scénarios de recette conçus. La vague 33 ajoute dix PNG candidats : huit poses indépendantes du Night Flutter SH1, du Numb Body moyen SH3 et des deux variantes debout et rampante du Lying Figure SH2 original ; deux couches de la galerie normale de la Historical Society de The Arcade avant la descente. Les appuis du Numb Body moyen et l’échelle des trois poses du Lying Figure rampant sont corrigés sans retoucher les PNG. Le coup bref du rampant utilise sa bande basse ; portée, dégâts et timings conservés. Les nouveaux modes d’équipe, les droits de contenu et le service d’abonnement restent à développer ; leur description n’active aucun service. Aucune nouvelle animation ni certification 1:1.

10 nouvelles images fixes candidates déclarées pour ce lot, dont 8 poses de personnage. 0 nouvelle animation. Les preuves de production et de validation restent attribuées à leur lot ; les résultats antérieurs sont conservés dans [la vague 30](../production/vague30/README.md). Les [contrats propres à Silent Hill](extensions/README.md) détaillent les taunts, équipes, bonus et accès aux contenus.
