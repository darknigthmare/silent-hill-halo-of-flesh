# Chantiers parallèles — dixième lot du 26 octobre 2026

Ce lot prolonge `79c64fe91590567253eb35630018e877d590d7a0` sur `main`.
Six chantiers traitent chacun trente identifiants réels du classeur :
**180 lignes, dont 120 réalisations candidates et 60 spécifications**.
Les tests, citations, composants partagés et corrections annexes ne sont pas
comptés comme des lignes supplémentaires.

| Chantier | Réalisations candidates | Spécifications | Nouveaux blocages |
| --- | ---: | ---: | ---: |
| [Images](batches/lot10-art.json) | 30 | 0 | 0 |
| [Commandes](batches/lot10-combat.json) | 30 | 0 | 0 |
| [Présentations](batches/lot10-cinematics.json) | 30 | 0 | 0 |
| [Lieux](batches/lot10-stages.json) | 30 | 0 | 0 |
| [Observations](batches/lot10-references.json) | 0 | 30 | 0 |
| [Poses](batches/lot10-poses.json) | 0 | 30 | 0 |
| **Total** | **120** | **60** | **0** |

La [synthèse des six relevés](batches/lot10-summary.json) vérifie le périmètre
et la traçabilité des lignes. Aucun nouveau blocage n’est déclaré dans ces
180 lignes ; les dossiers historiquement ouverts conservent leurs limites.
Une réalisation candidate n’est pas une certification artistique ou une
clôture de toute l’action parente du classeur. Le lot ajoute **zéro certification
1:1 et zéro timing original mesuré**.

## Trente images fixes sur dix profils

La [provenance artistique](../../art/reference-provenance-batch10.json) relie
les trente PNG à leurs références et calibrations. Dix profils reçoivent chacun
trois images distinctes : déplacement (`walk`), impact (`hurt`) et défaite
(`ko`). Il s’agit de Groaner, Wormhead, Hummer, Double Head, Numb Body small,
Sniffer femelle, Romper, Split Head, Closer et Slurper.

Chaque clip contient une image fixe non bouclée. Les trente PNG n’établissent
aucun cycle de marche, transition d’impact ou chute originale. Contraste,
perspective, parties masquées et poses transposées restent à comparer aux
références ; les calibrations de l’image du projet ne sont pas des mesures du
jeu source.

Le fallback de défaite finale peut employer le PNG `ko` du propriétaire exact
quand son image contextuelle manque. TIME avec un acteur vivant, défaite de
manche réversible et cible `finished` conservent leurs règles propres. Une pose
fixe n’active pas le combat d’un obstacle et ne devient pas une animation
validée dans l’Excel.

## Trente commandes de combat

Carrion, Caliban, Mandarin SH2, Pyramid Head avec Great Knife, Straight-Jacket
Origins et Nurse au revolver SH3 reçoivent chacun cinq commandes documentées
dans leur [relevé de combat](batches/lot10-combat.json).

Carrion avance par percussion basse du corps ; Caliban utilise des appuis
piétinants locaux. Mandarin frappe depuis le support grillagé avec des
appendices de contact : il reste fixe et ne transforme pas ces contacts au sol
en missiles ou en attaques contre les corps en vol.

La Great Knife distingue taille horizontale, abattement et emprise de la main
libre. Cette dernière soulève la cible et permet son dégagement par alternance
gauche/droite. Le propriétaire ne peut pas marcher ou relancer une attaque
pendant sa prise ; blessure, éloignement, remplacement de statut et fin de
manche libèrent la posture temporaire. Straight-Jacket conserve une prise
debout par les jambes et des jets acides à durée de vie bornée. La victime de
cette prise peut réellement frapper son propriétaire pour la rompre.

La Nurse choisit tir ou crosse selon la distance corporelle au début de
l’attaque. Le choix reste attaché à cette attaque : un projectile lancé ne
devient pas une frappe de crosse lorsque les acteurs se rapprochent.

Portées, dégâts, hauteurs, durées, six directions de dégagement et variantes
de commande sont des réglages du versus. L’invulnérabilité et la fin chronométrée
du duel original contre Pyramid Head ne sont pas converties en règles
automatiques de victoire. Aucun timing ni mouvement source complet n’est
certifié par ces changements.

## Trente présentations

Order Soldier Homecoming, Gray Child de l’Expansion Pack Book of Memories,
Wood Sapling, Harai Katashiro et Dark Nurse du film de 2006 reçoivent chacun
six contextes : introduction, victoire/défaite de manche, victoire/défaite
finale et sortie. Le [relevé des présentations](batches/lot10-cinematics.json)
conserve les propriétaires, œuvres, années, équipements et limites de preuve.

Harai conserve ses jambes-lames et le couteau tenu décrit par le bestiaire.
Sa sortie en trois appuis est une composition continue du versus, sans
téléportation ou rotation d’un PNG présentée comme une pose originale. Ses
90 ticks suivent le cycle réel de résultat et la pause, sans déplacer les
coordonnées physiques des combattants. Le soldat conserve son équipement de
mêlée choisi dans le catalogue ; le modèle exact de tuyau et l’instrument
précis de la Nurse restent à comparer sur plans.

La Nurse de Christophe Gans reste une adaptation jouable `versus-scripted`,
déjà réveillée : aucun déclencheur réel de lumière ou comportement de
Revelation ne lui est attribué. Aucun nouveau taunt ou finisher n’est ajouté.
Les images contextuelles restent ouvertes. Le catalogue résout
**746 présentations statiques**, auxquelles s’ajoutent les sept contextes Cybil
conditionnels à son état d’arme et de munitions.

## Trente lignes de lieux

Le [relevé des lieux](batches/lot10-stages.json) branche **douze éléments
d’ambiance et dix-huit compositions de résultat/reprise**. Ces dernières
suivent les phases réelles du match : ralentissement visuel au résultat,
maintien, puis raccord vers la manche suivante. Les jeux et films sources
n’ont pas ces manches ; ce sont des compositions du versus.

Les nouvelles pièces SHf distinguent le Hokora devant le Shrine Vault fermé,
le corridor d’entrée de ResidenceI, sa salle à manger au calendrier, le bureau
du personnel de l’école et le parvis de la résidence dans Ebisugaoka partie5.
Corridor et salle à manger désignent deux pièces de la même adresse. Les
trois pièces Shattered Memories sont la cour du premier point Paparazzi de
Midwich, la chambre du puzzle radio d’Alchemilla et le hall Gumball Shake Up
après Garage Access South. Téléphone, énigmes, acteurs et personnages gelés
ne sont pas produits par ces décors.

Les dix-huit compositions couvrent ces huit cadres et dix lieux déjà retenus,
dont les mondes Vita, la nef et la chambre d’Alessa du film, et des pièces
Homecoming. Le mouvement d’ambiance reste local et adapté, sans transfert de
géométrie, vent, cadence, dégâts ou propriétés physiques depuis une image fixe.

Une correction annexe resserre Alchemilla SH1 sur sa salle d’attente normale
déjà représentée par bitmap. Les tokens de service hospitalier `ward`,
`curtains`, `monitor` et `beds` sont retirés des accessoires et calques actifs.
Les deux variantes du finisher `pipeCurtain` sont donc refusées dans cette
pièce faute du rideau requis. Aucun nouveau token de brancard ni nouvelle ligne
de quota n’est ajouté. La présence de mobilier de transport dans une capture
fixe n’autorise pas une scène de chambre ou un premier plan à rideau.

## Soixante spécifications et références

Trente observations reçoivent de nouvelles preuves textuelles ou visuelles
qualifiées : One Truth, Walter, Memory of Alessa, Leonard, Missionary,
Twinfeeler, Puppet Nurse, Puppet Doctor, Night Flutter et Creeper. Dix
descriptions de combat/Harai et huit notes de lieux sont intégrées hors quota
pour les autres chantiers.

Le catalogue ajoute **33 objets source**, portant le total de 184 à **217**.
Le préfixe des 184 objets est conservé intégralement. Les images fixes,
portraits et illustrations servent leur portée propre : une identité ou une
pièce attestée ne prouve pas une attaque, une pose entière ou une cadence.
Les URL, empreintes, citations exactes et limites figurent dans
l’[audit des références](research/role-decisions-batch10-2026-10-26.json).

Les trente autres spécifications concernent cinq poses par profil : Cybil,
Lying Figure rampante, Maria finale, Closer Church, Jasper et Andrew. Attente,
locomotion, impact, chute et phase précisent corps, appuis, équipement et
limites. Ces briefs ne produisent aucun PNG ou clip supplémentaire.

Les 435 observations conservent leurs identifiants, noms, propriétaires,
œuvres, éditions, ordre, statuts et timecodes. Les 33 décisions de rôle
historiques restent identiques, dont les huit adaptations filmiques jouables
et les 25 dossiers sans duel autonome. Les cellules de timings source ne
reçoivent aucune mesure inventée.

## Validation et export final

Le SOURCE combat publié passe **282 contrôles**, avec 56 captures, 145 scènes
et aucune erreur JavaScript ; ses trente lignes ont été exercées en
38 exécutions préparées. Le SOURCE cinématiques passe **742 contrôles**, avec
124 captures, 79 scènes et aucune erreur JavaScript. Ces preuves sont des
scènes de régression préparées, sans campagne originale mesurée.

La revue indépendante du runtime gelé passe **133 scénarios** : emprises,
trente commandes aux deux indices, choix Nurse, trente présentations et cycle
de sortie Harai. Les 10 058 assertions comprennent des échantillons temporels
répétés ; elles ne sont pas des lignes Excel supplémentaires. La correction
Alchemilla a été relue sur les images, les tokens actifs et les refus effectifs
des deux finishers. La preuve SOURCE de lieux antérieure ne revendique pas
une nouvelle exécution Alchemilla après cette correction.

Les tests globaux passent **1 017 tests Node et 100 tests Python**.
L’export Excel modifie **1 875 cellules**, ajuste **540 hauteurs** et ajoute
**33 sources sur 231 cellules**. Le contrôle de préservation porte sur
**249 899 cellules**, différences autorisées comprises ; il ne prétend pas
qu’elles sont toutes inchangées. La comparaison indépendante couvre
**248 995 champs mappés** et passe **50 contrôles**, dont les 180 lignes du lot,
les treize anciens blocages visibles et les **18 400 cellules de timings
source laissées vides**.

Le plan conserve **875 actions, dont 840 ouvertes et 93 P0**. Son empreinte est
`317ebe4006e47cad2e348ac069c30a024dd5de686dbd3f680d6c03c81fcb43e3`.
Le [classeur exporté](SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx)
a pour empreinte
`3da8c5e4215aa6add9398019896aa693b833e15fdbef84d93a24eb7b8dbfbc7f`.

- Suites navigateur DIST : **14 suites, 2 213 contrôles, 399 captures et aucune
  erreur JavaScript**. Les 817 contrôles d’images comprennent un KO obtenu par
  19 frappes réelles, sans injection de santé, position ou état. Le corps de
  Groaner reste partiellement occulté par le vainqueur ; cette observation
  ne certifie pas une pose source entière ou une animation originale.
- Registre graphique : **49 profils illustrés, 84 PNG actifs, six décors bitmap**,
  un montage animé candidat et aucune certification 1:1. Les 181 autres profils
  restent sans PNG.
- Build : **166 fichiers**, dont **165 comparés octet par octet aux sources**, sans
  différence ; cache `parallel-20261026-pass10`.
- Le [rapport QA](../INTEGRATION_QA_2026-10-26-lot10.json) conserve les résultats
  et empreintes de cette livraison. Les commits du lot sont consultables dans
  l’historique de `main`.
