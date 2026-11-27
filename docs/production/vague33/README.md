# Vague 33 — huit poses, galerie The Arcade et corrections de contact

La vague ajoute **dix PNG candidats intégrés** : huit poses de combat individuelles et les deux couches de la galerie normale de la Historical Society dans **Silent Hill: The Arcade**. Elle poursuit la PR #11 après la vague 32 publiée ; [baseline.json](baseline.json) fixe le commit et l’arbre de comparaison.

| Propriétaire exact | Œuvre | Ajout |
| --- | --- | --- |
| `sh1_night_flutter_002` | Silent Hill original | Marche et attaque légère au sol |
| `sh3_numb_body_medium` | Silent Hill 3 | Marche et attaque spéciale |
| `sh2_lying_figure_020` | Silent Hill 2 original, debout | Marche et attaque légère |
| `sh2_lying_figure_crawling_021` | Silent Hill 2 original, rampant | Déplacement et attaque légère |
| `arcade_historical` | Silent Hill: The Arcade | Fond de galerie normale et montants de porte transparents |

Chaque pose possède son propre PNG et un clip d’une seule image, sans boucle. Aucun nouveau profil, portrait ou cycle animé n’est compté. Les deux variantes du Lying Figure conservent leurs propriétaires distincts ; les images de SH2 remake ne servent pas de références. La [revue des sources](source-review-final.json) distingue les références originales archivées, les guides secondaires, les enregistrements de jeu et les reconstructions. **La fidélité reste `unverified` : ces ajouts ne sont pas certifiés 1:1.**

## Appui et contact corrigés

Le Numb Body moyen flottait au repos de **23,881 unités monde**, soit **23,364 pixels du canvas interne**, dans les deux orientations. Seul `anchor[1]` de sa frame idle passe de `1` à `903/1024`. La nouvelle recette mesure **zéro écart au sol dans les deux sens**. Le PNG original, son empreinte et son échelle sont conservés. La pose spéciale aux pieds levés garde son appui virtuel ; elle n’est pas assimilée à un pied posé. La [fiche de correction](idle-anchor-correction.json) relie les captures avant et après.

Le Lying Figure rampant utilisait une échelle excessive sur ses canevas horizontaux. Ses trois frames — idle historique et deux nouvelles poses — partagent désormais `bodyHeight: 2.94`, une ancre X de `0.4` et un appui Y mesuré. Cette calibration réduit leur facteur monde/pixel par trois et évite un changement d’échelle au retour au repos. La hauteur de référence représente une taille debout équivalente divisée par la hauteur du canevas ; elle peut donc dépasser 1 pour une pose couchée. Les outils d’import, de calibration et de rendu acceptent maintenant le même domaine fini `0.05..4`, tandis que les ancres restent dans `0..1`.

**Seule la commande `neutralLight` du propriétaire rampant passe de `mid` à `low`.** Dégâts nominaux 31, portée 55, startup 5, activité 3 et récupération 9 restent identiques, de même que tous les autres champs du coup. La [comparaison de 230 profils](combat-profile-preservation.json) confirme que les 229 autres profils sont inchangés. Le corps, la hurtbox et l’enveloppe de poussée historiques restent des adaptations versus ; aucune collision du jeu source n’est déduite du contour du PNG.

Dans le Dojo réel, le point reproductible du front se trouve dans le rectangle HIT peint par le moteur, dans les deux sens. Les six essais de contact donnent, sur l’adversaire configuré, **29 dégâts en touche, 4 sous garde basse et 29 sous garde debout**, avec retour au repos. Ces dégâts effectifs incluent la résolution versus et ne remplacent pas la valeur nominale 31. [Calibrations et limites](crawling-calibration.json), [contact géométrique](qa/crawling-contact/report.json), [combat et garde](qa/crawling-combat/report.json).

## Galerie précise de The Arcade

La scène représente la galerie normale avant la descente vers la prison : papier peint jaune olive, boiseries sombres et quatre cadres. Deux parcours de jeu distincts sont documentés dans [la revue de scène](stages/source-review.json). Leurs prévisualisations établissent les grandes formes ; les sujets détaillés des tableaux, les textes, les textures fines, le sol et les dimensions restent reconstruits.

Le fond et les montants sont deux PNG distincts de 1 672 × 941 pixels. La scène reste normale, intérieure et fixe. Son sol versus utilise des coefficients neutres. Poussière, clignotement, dangers et finishers automatiques génériques sont désactivés pour cette scène ; les propositions historiques restent dans le catalogue. Aucun escalier, plafond utilisable ou événement supplémentaire n’est déduit de l’image. La [recette HTTP](qa/stage/report.json) vérifie les couches dans le vrai combat.

## Vérifications exécutées

La [validation finale du lot](final-validation.json) relie l’inventaire, les classeurs, les sources du build et le diagnostic hors ligne. Les preuves d’images sont regroupées dans [le rapport QA](qa/validation.json), avec leurs captures et journaux bruts.

| Vérification de cette vague | Résultat |
| --- | ---: |
| Suite JavaScript complète, concurrence bornée | 1 364 tests réussis, aucun échec ni test ignoré |
| Tests Python d’import et de calibration restaurés | 65 réussis |
| Huit poses dans les deux orientations, action et retour au repos | 391 contrôles, 32 captures |
| Galerie Historical Society dans le jeu | 21 contrôles, 1 capture |
| Appui Medium après correction | 13 contrôles, 2 captures |
| Contact du rampant avec HITBOXES natif | 14 contrôles, 2 captures |
| Touche, garde basse et garde debout du rampant | 47 contrôles, 6 captures |
| Total des cinq recettes HTTP finales | **486 contrôles, 43 captures** |
| Build distribué | 831 fichiers ; 49 JavaScript et 10 HTML vérifiés |

La preuve Medium avant correction comporte séparément 13 contrôles et deux captures. Elle n’est pas ajoutée au total des cinq recettes finales. Les constats antérieurs dont les captures ont été perdues ne sont pas reconstitués comme preuves. Les résultats de la vague 32 restent historiques et ne valent pas validation automatique des nouveaux fichiers.

La commande de build accepte un répertoire de sortie dédié avec `--out-dir`. Elle vérifie sa destination avant toute génération ou suppression : racines, sources, redirections par liens et répertoires externes existants non attribués à ce projet sont refusés. Les six tests de ce contrat font partie de la suite JavaScript ci-dessus.

## Chargement hors ligne et ancienne recette CI

Le timeout de la recette historique `http-qa-v090.mjs` a été reproduit localement : son contexte privé dispose d’un quota CDP réel d’environ 535 Mo et l’installation du service worker échoue avec `QuotaExceededError` devant le précache de plus de 850 Mo. La logique d’installation existait déjà dans la baseline. La valeur masquée de `navigator.storage.estimate()` ne suffisait pas à diagnostiquer ce refus.

Le helper `scripts/qa-offline-profile.mjs` ouvre un profil normal temporaire, puis ferme le navigateur avant de retirer uniquement son répertoire. Il ne modifie ni quota, ni contenu précaché, ni service worker applicatif. Les huit recettes comportant un scénario hors ligne utilisent ce contrat ; les contextes d’injection de panne avec `serviceWorkers: 'block'` restent séparés. Les six migrations de la chaîne principale et celle des chroniques ont été relues et vérifiées syntaxiquement, sans déclarer leurs parcours complets exécutés.

Un second défaut de la recette v090 a été observé : la case du mode diagnostic pouvait être cochée avant que `init()` termine, puis être réinitialisée. La recette attend maintenant le premier bouton du roster créé par cette initialisation avant de cocher la case. Les actions et assertions existantes, les délais maximums et le moteur restent inchangés ; un contrôle explicite des erreurs du worker est ajouté.

Le [dernier parcours v090](qa/http-v090-diagnostic/verified-final/http-report.json) réussit **39 assertions**, dont la reprise du checkpoint, le contrôle effectif du service worker, le rechargement du vrai shell hors ligne et l’interface mobile. Il n’enregistre aucune erreur de page ni du worker. Ces résultats sont distincts des 486 contrôles d’images ci-dessus. Le diagnostic ciblé du helper vérifie également le précache complet et le nettoyage idempotent du profil. Les échecs initiaux sont conservés avec leur état d’interface.

La reproduction locale utilise Playwright 1.62.1 et Chromium 158 ; la CI épinglée utilise Playwright 1.57.0 et Chromium 143. La cause du refus de quota est directement observée localement ; son attribution au timeout CI historique reste une inférence documentée. Les workflows du nouveau commit doivent rendre leur propre verdict.

## Bible et extensions

Le guide et ses deux extensions conservent **68 rubriques, 48 fiches d’exemple, 16 familles et 445 associations**, avec 729 chemins d’image présents. Les deux classeurs sont recalculés, rendus et vérifiés contre ces sources. Seules deux cellules d’association changent dans chacun : le nom précis de la galerie et son état `fixed-normal`.

La [validation des classeurs](workbooks/validation.json) atteste la conservation de **13 feuilles historiques, 252 822 cellules et 87 formules**. Les 3 971 cellules sources et 12 formules avec leurs caches sont comparées dans chaque classeur ; aucune erreur de formule n’a été détectée. Huit rendus et dix contrôles de lecture sont conservés. Excel de bureau n’a pas été exécuté ; le classeur de production volumineux est rendu via une projection temporaire conservant exactement les feuilles actuelles concernées.

Les **40 scénarios fonctionnels des extensions restent conçus et non exécutés**. Les recettes techniques de cette vague ne les remplacent pas.

## Couverture et manquants

L’[inventaire recalculé](inventory.json) contient les propriétaires exacts de chaque manque, les empreintes et les exceptions de conservation.

| Catégorie | État après vague 33 | Reste |
| --- | ---: | ---: |
| Portraits candidats | 204 / 230 profils | 26 |
| Bases latérales candidates | 190 / 230 profils | 36 sans base, 4 vues héritées à reprendre |
| Arènes avec bitmap candidat | 98 / 123 | 25 |
| Commandes de projectile actives avec bitmap | 31 / 86 | 55 |
| Récits individuels illustrés | 3 / 230 | 227 |
| Commandes actives sans clip propre, sur les bases latérales concernées | 3 069 | Liste détaillée dans l’inventaire |
| Nouveaux cycles animés de cette vague | 0 | Les 6 clips animés historiques restent distincts |

Ces catégories se recoupent ; elles ne s’additionnent pas en un nombre d’images à produire. Un portrait, une base, une pose, une animation, un récit jouable et une fidélité source vérifiée sont des états différents. Les identités non résolues et les générations refusées restent en attente. Le récit Lying Figure conserve son blocage par la base absente de `sh2_mannequin_ambusher_023`, même si ses illustrations et ses nouvelles poses sont présentes.
