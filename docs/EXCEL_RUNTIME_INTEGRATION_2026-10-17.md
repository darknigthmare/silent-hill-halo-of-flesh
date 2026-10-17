# Intégration des fiches de production — v0.9.6

PR #4, branche `feat/bitmap-sprites-v091`. Comparaison avec le commit
`843449e78c02ce53564a033439dab1fd8c8fb204`. Le catalogue de référence initial
du classeur conserve sa base `d11cf4e8c03668aa535631cb2ef60767ee51e75b`.

## Ce qui fonctionne dans le jeu

Les recherches du classeur alimentent désormais les profils de combat, les
conditions de cinématique, le directeur d’arène, les dossiers et les outils de
montage. Les données proviennent de `research/classic.json` et
`research/extended.json`. Le générateur refuse les omissions, doublons et
références inconnues, puis produit le registre JavaScript distribué et un index
compact partagé avec les outils Python. Le jeu n’ouvre pas le fichier Excel et
ne transforme pas automatiquement une annotation manuelle en règle exécutable.

| Périmètre | État de cette passe |
| --- | ---: |
| Fiches de combattant appliquées | 230 |
| Fiches de lieu appliquées | 123 |
| Références conservées | 135 |
| Profils compatibles avec un combat de prototype | 194 |
| Emplacements de commande conservés | 4 600 |
| Commandes actives | 3 711 |
| Commandes désactivées avec une raison | 889 |
| Supers et désespoirs actifs, inclus dans les commandes | 324 / 460 |
| Montages de fatalité de combattant écrits | 86, pour 43 identifiants |
| Montages de fatalité de lieu écrits | 7 |
| Présentations avec mise en scène composée | 301, pour les mêmes 43 identifiants |
| Points d’intégration de présentation | 9 |
| Éléments visuels partiels issus des fiches de lieu | 50, sur 40 lieux |

« Compatible avec un combat de prototype » ne signifie pas que les images sont
terminées. Certains profils restent des adaptations explicites de rencontres
scénarisées. Les rôles non combattants, obstacles et identités non confirmées
restent consultables ; leurs commandes offensives ne sont pas exécutées.

## Movesets : contraintes réelles et commandes disponibles

Le moteur n’infère plus un projectile, une téléportation, un piège ou une
affliction à partir d’un mot du catalogue ou d’un archétype. Une capacité doit
être autorisée dans la politique du sujet exact. Les traits passifs passent par
la même restriction : un effet retiré du moveset ne revient pas par le trait.
Les routes d’annulation excluent les commandes désactivées.

Le [comparatif reproductible](production/combat-reference-comparison.json) est
calculé sur les vrais profils du commit précédent et de cette passe :

| Propriété des commandes | Avant | Après |
| --- | ---: | ---: |
| Projectile | 342 | 84 |
| Téléportation | 47 | 8 |
| Piège autonome | 25 | 0 |
| Aura locale | 3 | 50 |
| Affliction | 2 308 | 25 |
| Super ou désespoir activé | 460 | 324 |

Ces catégories se recoupent ; elles ne s’additionnent pas pour obtenir le nombre
de commandes. Les chiffres concernent leur exécution, pas leur certification
visuelle. Le script `scripts/compare-combat-reference.mjs` reconstruit les modules
du commit de base dans un dossier temporaire sans modifier le checkout.

Exemples vérifiés dans les profils et dans le moteur :

- **Air Screamer / Night Flutter** : serres et plongée physique. Une cible
  éloignée n’est plus touchée par un ancien tir sonore fictif.
- **Mannequin, Pendulum et Fallen** : déplacement visible ; les téléportations
  héritées des anciens archétypes sont retirées. Richard Braintree conserve le
  déplacement autorisé pour sa fiche, suivi de l’arme appropriée.
- **Cybil** : dix tirs acceptés, puis les actions désarmées prévues dans son
  profil. Le compteur apparaît dans le HUD. Une manche ne recharge pas la
  réserve ; une nouvelle tentative recrée correctement le compteur.
- **Wall Man et corps attachés** : déplacement, saut et esquive incompatibles
  sont bloqués. Impacts, chevauchements, projections arrière, lancements et
  dangers ne déplacent plus leur ancrage.
- **Valtiel et sujets non combattants** : refus du combat, y compris lorsque le
  diagnostic graphique est activé. Le dossier et les références restent lisibles.

Les phases nécessitant plusieurs acteurs ou une alternance encore absente du
moteur restent limitées : Alessa utilise ici sa phase couteau ; les supers de
phases non produites et les invocations sans second acteur sont désactivés avec
leur raison. Les timings, dégâts, portées et coûts sont des valeurs du versus.
Aucun champ de mesure de la source n’est rempli par estimation.

## Fatalités et présentations

Les 86 montages de combattant reposent sur 22 grammaires de gestes compatibles
avec les corps : plongée, morsure, mâchoire, souffle contraint, membres du
mannequin, gestes cliniques, lame, lance, masse et autres capacités déclarées.
Chaque identifiant possède une coupe signature et une coupe Nightmare distincte.
La seconde change l’anticipation, les suspensions, les contacts, le cadrage et
l’extinction ; elle n’emprunte pas l’identité d’une autre œuvre.

Les sept lieux disposent de montages par identifiant exact : **Blue Creek
Stairwell, Lakeview Otherworld, Brookhaven Flooded Room, Sewer Channel, Room 302,
Midwich Nightmare School et Hazel Street Subway**. L’exécution exige la zone,
les appuis, le mécanisme et les accessoires prévus. Une pièce sans rideau ne
peut pas fournir la fermeture du rideau d’une autre séquence.

Le moteur vérifie l’identité et l’œuvre de l’attaquant, le rôle, la morphologie
et la taille de la cible, l’arme, le plafond et les accessoires nécessaires.
Un montage non écrit ou une paire incompatible produit un K.O. ordinaire.
Par exemple, la prise debout du Red Pyramid du film n’est pas substituée à une
fatalité contre Air Screamer. Les finishers restent réservés à la victoire
décisive ; les poses de manche intermédiaire sont réversibles.

Les acteurs, la cible, la caméra, les effets et les sons partagent l’horloge de
simulation. Les sons de mise en scène sont synthétisés pour le prototype. La
pause, la reprise, le changement de focus, le reset et la destruction du moteur
conservent leur synchronisation. Le résultat HTML attend aussi la sortie
composée du sujet, même lorsque aucun clip d’image n’est importé.

**La provocation** utilise P pour le sujet I, N pour le sujet II, le clic du stick
gauche sur une manette, ou le bouton tactile. Sa durée de base est de 66 ticks.
Elle ne donne aucun dégât, jauge ou invulnérabilité supplémentaire. Un déplacement,
une garde, une attaque ou un impact l’annule ; le déplacement gagne s’il arrive
sur la même frame. Le temps du combat continue de s’écouler.

## Clips par contexte et compatibilité

Les 38 anciennes clés restent au même index ; `taunt` est ajoutée en dernier,
pour un total de 39 clés génériques. Les neuf clés de présentation acceptent
aussi des contextes validés :

| Exemple | Usage |
| --- | --- |
| `intro@sh1_air_screamer_001:intro` | Introduction exacte du sujet |
| `winRound@sh1_air_screamer_001:winRound1` | Victoire réversible de manche |
| `taunt@sh1_air_screamer_001:taunt` | Attitude propre au sujet |
| `finisher@sh1_air_screamer_001_signature` | Piste de l’attaquant pour sa signature |
| `finished@sh1_air_screamer_001_signature` | Piste de la cible pour cette signature |
| `finished@midwich_nightmare_fatality` | Piste de la cible pour le mécanisme de ce lieu |

L’atelier, l’inspecteur, le sampler et les outils Python partagent ce contrat.
Une piste attaquant ne peut pas prendre l’identifiant de fatalité d’un autre
combattant. Une piste cible peut référencer un finisher connu auquel elle réagit.
Les chaînes arbitraires, identifiants inconnus, contextes placés sur les attaques
ordinaires et montages faits uniquement d’idle sont refusés.

Un finisher contextuel absent revient à l’image d’attente et l’annonce comme
manquant. Il ne lit jamais le clip générique d’une autre fatalité. Les anciennes
introductions génériques restent compatibles. Un clip importé plus long peut
allonger la scène commune ; la mise en scène est étendue proportionnellement
sans changer les durées propres des images ni les timings des attaques.

Les anciens remappages à onze actions restent lisibles. Leur migration conserve
les touches choisies et attribue à la provocation une touche libre. Le chargement
n’écrit pas silencieusement la sauvegarde et les secours restent utilisables.

## Arènes : phases, ambiance et mécanismes

Les fiches règlent séparément le lieu, sa phase et les mécanismes autorisés :
66 lieux restent dans leur phase normale, 32 dans leur phase altérée, 6 permettent
une transition de versus et 19 attendent une confirmation. Les commandes du dojo
et les rites respectent ces limites, y compris `redJudgment` au démarrage et au
reset. Une phase initiale de Room 302 ne reçoit pas ses hantises tardives par
simple héritage du catalogue.

Les 50 éléments visuels ajoutés sont des **prototypes partiels** des propositions
de leurs fiches : météo, éclairage, eau, motifs du lieu et réactions décoratives.
Chaque raccord décrit l’élément réellement dessiné. Il ne certifie pas toute la
proposition dont il est issu. Les mouvements réduits figent les déplacements
décoratifs sans figer les avertissements des dangers physiques.

Le directeur conserve 105 boucles compatibles, 21 événements, 21 interactions et
9 liens de danger actifs. Les trois nouvelles réactions locales de lumière,
poussière et vapeur demandent un impact lourd dans leur zone. Elles ne se
déclenchent pas par simple cadence et n’ajoutent pas de dégâts. La neige de SH1,
les cendres des films, l’hôtel détruit et les lieux gelés suivent leurs fiches.

Le classeur conserve les **1 799 identifiants de pistes** déjà livrés. Les
**1 161 anciens éléments retirés** restent identifiables, avec leur désactivation
et l’absence de déclenchement automatique. Sept nouveaux raccords de mécanismes
sont détaillés dans la fiche de l’arène correspondante ; aucune ancienne ligne
annotable n’est remplacée pour leur faire de la place.

## Chroniques et sauvegardes

Les nouvelles chroniques portent le marqueur strict
`chronicleFormat: "reference-encounters-v1"`. La file ne contient que les rencontres
autorisées, dans leur ordre initial et avec l’arène du chapitre original.
`chapterIndices` conserve la correspondance, et `referenceDossiers` conserve les
chapitres hors combat. Sept chapitres répartis sur six chroniques sont présentés
comme dossiers ; ils ne rapportent aucune victoire et le résultat final ne les
présente pas comme des scènes jouées.

Les anciens checkpoints sans marqueur restent lisibles et valides. Si une reprise
demande encore un rôle maintenant interdit, l’interface explique le blocage et
conserve la file, les victoires, le backup, les records et les tentatives. Les
champs du nouveau format sont validés ensemble ; falsifier un chapitre, un rôle,
une arène ou leur ordre invalide le checkpoint.

## Excel et vérification

Le [classeur actualisé](production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx)
conserve ses **11 onglets, 12 690 lignes et 80 formules**. Les statuts techniques,
les paramètres réellement utilisés, les restrictions et les contextes de montage
sont mis à jour. Les responsables et relevés vidéo restent des champs modifiables.
Sur 875 actions, 874 restent ouvertes, dont 127 de priorité P0 ; une intégration
technique en cours ne valide pas automatiquement la production artistique.

L’éditeur importe le fichier existant. Il contrôle les identifiants, l’ordre et
les états annotables avant de remplacer une valeur. Il conserve les colonnes,
styles, tableaux, filtres et validations ; seules les hauteurs des lignes dont
le nouveau texte l’exige peuvent augmenter, avec un journal distinct. Le contrôle
en lecture seule compare toutes les cellules au fichier précédent et vérifie les
formules recalculées. Un statut est temporairement changé puis restauré pour
prouver que la synthèse reste dynamique.

Le [rapport de validation](INTEGRATION_QA_2026-10-17.json) rassemble les résultats
locaux : **534 tests Node, 79 tests Python et 238 contrôles HTTP dans neuf suites**,
avec **38 captures et aucune exception JavaScript**. Les parcours concernés par
les derniers correctifs ont été rejoués sur le build final. La CI exécute de
nouveau l’ensemble sur le commit publié ; ses liens sont dans la PR.
Les parcours navigateur servent les fichiers de `dist`. La QA prépare certains K.O.,
positions et horloges pour vérifier les transitions ; elle ne constitue pas une
campagne jouée intégralement ni un essai de toutes les manettes physiques.

**État artistique : deux PNG candidats, aucun clip animé, aucune fidélité 1:1
certifiée.** Les montages livrent des trajectoires, des coupes et des raccords
d’exécution. Les poses des membres, saisies, attaques et récupérations demandent
encore leurs images indépendantes, puis une comparaison avec les captures de
l’édition exacte. Les timecodes et FPS de source restent vides jusqu’à mesure.

## Reproduction

```sh
npm test
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm run build
npm run qa:browser
node scripts/build-production-plan.mjs
node scripts/compare-combat-reference.mjs
```

La [documentation du classeur](production/README.md) décrit le parcours de mise
à jour ciblée. `npm run references:check` vérifie que les registres distribués
correspondent exactement aux recherches versionnées.
