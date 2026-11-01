# Chantiers parallèles — douzième lot du 1er novembre 2026

Ce lot part de `1e6e408a3ef9d66869fdf7ce26eded06e383d12a` et conserve les 21
commits distants intégrés jusqu’à `ced77333b07e1ea08cf04263c9abe23bbd4361ae`.
Leurs validations strictes de clips, horloges de sprites, victoire au temps
et outils d’audit restent présents. Les tests finaux portent sur cet ensemble.
Six chantiers traitent chacun trente identifiants existants du classeur.
La [synthèse auditée](batches/lot12-summary.json) vérifie **180 lignes distinctes**,
dont **97 réalisations candidates, 60 spécifications et 23 blocages**.
Les 157 lignes non bloquées diffèrent du plan précédent. Les tests, recherches
supplémentaires et images rejetées ne comptent pas comme lignes réalisées.

| Chantier | Candidats réalisés | Spécifications | Blocages |
| --- | ---: | ---: | ---: |
| [Images](batches/lot12-art.json) | 12 | 0 | 18 |
| [Commandes](batches/lot12-combat.json) | 30 | 0 | 0 |
| [Présentations](batches/lot12-cinematics.json) | 30 | 0 | 0 |
| [Lieux](batches/lot12-stages.json) | 25 | 0 | 5 |
| [Observations](batches/lot12-references.json) | 0 | 30 | 0 |
| [Poses](batches/lot12-poses.json) | 0 | 30 | 0 |
| **Total** | **97** | **60** | **23** |

## Douze sujets cadrés entiers pour le combat 2D

Les nouveaux profils sont Steve Garland, Eric Walsh, Sharon Blake, Wall Man,
Man with the Coat et One Truth pour SH4 ; Gum Head, Scraper, Red Pyramid Thing
et Robbie avec tronçonneuse pour The Arcade ; Sepulcher pour Homecoming ; et
Wood Sapling pour Book of Memories. Les poses gardent leurs armes, formes et
appuis naturels plutôt qu’une garde humaine uniforme. Mains, chaussures,
lames, oreilles, racines et appendices visibles restent dans le cadre.

Le registre atteint **86 profils et 121 PNG actifs**. Les **74 objets et 109 PNG
antérieurs restent identiques** ; les douze fichiers ajoutés sont des copies
exactes des sorties de l’outil image, totalisant 7 439 629 octets. La marge
lisible minimale est de 5,66 % sur Sepulcher. Aucun pixel de production n’a été
retouché par Python. Les clips sont douze idles d’une image, non bouclés ;
**aucune nouvelle animation** n’est produite.

L’extérieur de Wall Man rejoint le mur ; One Truth comprend un corps attesté,
ses quatre bras et son cadre. Cela ne reconstruit pas leur anatomie cachée ou
les douze corps de la rencontre originale. Eric sans épée d’Obedience garde
une reconstruction de vêtement explicitement non vérifiée. Wood Sapling repose
notamment sur une capture de préversion de juin 2012. Hauteur de suspension,
échelle, matière, vue opposée et animation originales restent à vérifier.

Deux nouveaux refus sont enregistrés précisément : Toby14 et Amnion suspendu.
Aucune nouvelle tentative ni variante de contournement n’est produite ; Amnion
exposé reste également bloqué. La sortie Peter12 est exclue après correction
d’une erreur d’âge, sans être importée. Les autres blocages concernent notamment
l’identité composite du Ghost, des vues incomplètes ou des variantes et armes
non établies. Les refus et limites antérieurs restent conservés.
La [provenance](../../art/reference-provenance-batch12.json) détaille les quinze
appels, treize sorties, douze imports et leurs limites.

Le cadrage connecté du lot11 est préservé : corps lisible et franges reliées,
sans bruit faiblement opaque isolé, marge de dix pixels et secousse maximale.
La revue indépendante passe **266 256 combinaisons et 749 232 enveloppes**,
avec une échelle minimale synthétique de 0,682758. Ces vérifications numériques
ne mesurent pas l’anatomie ou la géométrie des jeux d’origine.

## Commandes et mises en scène

Les trente commandes révisent la seringue Origins, le scalpel Homecoming,
les membres-lames Needler, les griffes Lurker, la seconde forme Scarlet et la
mâchoire Feral. Leurs contacts restent locaux et leurs coefficients sont ceux
du versus. La morsure du Feral est replacée à la hauteur de sa petite silhouette.
Les trois bonds Scarlet exposent le dos après un échec ; le bonus ne s’applique
pas après un contact ni à une frappe frontale. Pause et reprise préservent cet état.

Le moteur respectait mal `armorFrames:0` sur les desperations. Treize valeurs
sont corrigées, dont cinq du nouveau lot et huit préexistantes ; les 4 587 autres
commandes gardent leur valeur. Les armures de trait et de phase sont conservées.
Le bilan des paramètres effectifs est de trente commandes du quota et huit
corrections d’armure supplémentaires. Les statistiques et rôles des 230 profils
restent préservés. La simulation et les collisions de `fight.js` et du module
de géométrie ne changent pas.

Quatre équipements de catalogue sont clarifiés hors quota : truelle de Steve
Garland distincte d’un couteau, Gum Head Arcade
aux mains nues, hache Robbie distincte d’un couperet, et arme longue Robbie
distincte d’un pistolet. Le modèle exact de cette arme et le nom « shotgun »
restent incertains dans les vues ; aucun nouveau PNG de cette variante n’est livré.
La fiche One Truth est aussi corrigée : maître parmi douze Giant Wall Men,
distinct du Twin Victim et rattaché à Building World lors de la seconde visite.
Ce rattachement ne certifie pas la géométrie de sa salle de boss.

Les trente présentations couvrent Anne, le Ghost composite SH4, Earth Guardian,
Steel Guardian et Swarm Vita. Elles gardent leurs corps et équipements, sans
faire apparaître de jambes dans les fragments Earth ou un individu dans le
Ghost composite. Les trente anciennes propositions sont archivées dans la
ligne et l’action sans être déclarées réalisées. Le catalogue atteint **806
présentations sans état d’acteur**, plus sept contextes Cybil conditionnels,
et conserve **205 timelines stockées : 198 de sujets et sept de lieux**.
Aucune nouvelle image contextuelle n’est produite par ce chantier.

Le plafond d’un bitmap Woodside devenu inactif ne peut plus autoriser une
suspension dans la chambre208. Le Labyrinth Box of Faces ne fournit pas de
mur de premier plan à Wall Man ou Richard. Les positifs unitaires synthétiques
sont nommés comme tels ; les pièces réelles fournissent les cas négatifs.

## Neuf pièces et vingt-cinq maquettes d’éléments

Le périmètre exact est Wood Side208, palier Blue Creek avant drainage, bas du
panneau de la cour Toluca, commande Box of Faces, Happy Burger, chapelle SH3,
entrée enchaînée Room302, surveillance2F Water Prison et bureau105 Apartment
World. Happy Burger est distingué de Helen’s Bakery ; le garde-corps Blue Creek
est restauré et l’eau reste au fond, sans rides génériques sur le plateau sec.

**Ces dessins Canvas sont des maquettes géométriques très simplifiées.** Ils
ne remplacent pas la production des matières, reliefs, éclairages, géométries
et caméras fidèles aux lieux d’origine. Le sol de versus et les adversaires
croisés restent des adaptations. Les cinq blocages concernent trois propositions
Brookhaven et deux éléments non lisibles de la cour Toluca.

Le directeur compte **163 pistes, dont 158 visibles et cinq masquées**, 64
boucles génériques, 26 associations d’événement, 26 interactions et huit liens
de dangers. Les six bitmaps et leurs octets sont conservés ; quatre sont actifs
pour les pièces choisies. Le couloir Woodside et Helen’s Bakery restent
archivés et vérifiés sur leurs scènes explicites, sans masquer208 ou Happy
Burger ni leur prêter leurs propriétés physiques.

Les 46 révisions de cibles de lieux, dont 21 du lot11 et 25 nouvelles, conservent
les textes précédents dans leurs lignes et actions. Les treize blocages
historiques du lot9 restent visibles. Parmi les onze rejets avant sélection,
hors ses trente lignes, six restent documentaires, deux bloqués et trois
révisés ; ce relevé ne réduit pas les treize véritables blocages historiques.

## Sources et Excel

Les **277 sources** conservent les 246 objets antérieurs à l’identique et ajoutent
31 vues vérifiées. Les trente observations et trente briefs de poses sont
spécifiés, sans créer de PNG ni de timing natif. L’audit documentaire passe
62 contrôles. Les 435 observations gardent identité, ordre, édition, statut et
timecodes ; les 33 décisions de rôle restent inchangées, dont huit adaptations
filmiques jouables et 25 dossiers hors duel.

L’export modifie **1 756 cellules**, augmente **611 hauteurs** et ajoute les
31 sources sur 217 cellules. Les 80 formules sont recalculées avec une extension
de plage auditée. La préservation compare 250 333 cellules, différences autorisées
comprises ; la revue indépendante compare **249 415 champs mappés et passe
137 contrôles**. Les 18 400 cellules de timings et 4 600 relevés originaux restent
vides. Les **840 actions ouvertes, dont 93 P0**, ne sont pas fermées par un simple
statut candidat ; 144 profils restent sans PNG.

Plan SHA256 : `63c08b63218968be7dcae892edd70dcbafe411859b1f7e52f12dbe404f66fae6`.
[Excel](SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx) SHA256 :
`931517647d9844af829dbf5c0fabe2f529bfe909f3b8c8215768d38a24a91907`.

## Vérification du prototype

La validation finale passe **1 201 tests Node, 101 tests Python et 3 296 contrôles navigateur dans 14 suites, avec 610 captures distinctes et aucune erreur JavaScript**.
Les 14 commandes de `qa:browser` sont exécutées dans l’ordre ; la dernière
attend la fin du contrôle artistique SOURCE pour préserver ses captures.
Le contrôle complémentaire des lieux sur DIST passe **152 contrôles et 45
captures**, comptés séparément des quatorze suites principales.

Les preuves SOURCE des agents précèdent cette intégration distante et les
derniers correctifs de métadonnées One Truth/Steve ; les suites
DIST finales vérifient l’ensemble fusionné. Ces preuves SOURCE couvrent 1 549 contrôles artistiques avec 278 captures,
102 contrôles de commandes avec 33 captures, 908 contrôles cinématiques et
152 contrôles de lieux avec 45 captures. Les 186 entrées de capture cinématique
SOURCE correspondent à **183 fichiers uniques** ; trois noms réutilisés sont
corrigés dans le script avant le contrôle DIST. Le contrôle artistique HTTP
décode 111 fichiers, dont les douze nouveaux ; l’audit local couvre les 121 frames.

La revue runtime indépendante passe 84 contrôles, 257 scénarios moteur et
420 échantillons cinématiques. Après intégration distante, elle vérifie aussi
120 clips sur 360 échantillons, treize montages invalides, cinq horloges
corrompues et dix résultats au temps extrêmes. Elle a fait corriger les bonds Scarlet, le contact
Feral et les prêts de support de pièce. L’outil distant `audit:sprites` est aussi conservé et exécuté sur la couverture
actuelle : 86 profils illustrés, 144 absents et un seul clip animé candidat.
Le cache hors ligne inclut les deux
nouveaux modules de lieux. Un premier test Python a croisé l’export du classeur ;
la suite complète est rejouée contre les octets finaux gelés et passe.

Le [rapport QA](../INTEGRATION_QA_2026-11-01-lot12.json) lie les journaux et preuves.
Ces tests locaux, prévisualisations, fixtures synthétiques et contrôles de
Chromium ne certifient ni une campagne originale, un périphérique physique,
une session Excel native ou une exécution de GitHub CI. **La fidélité 1:1,
les animations et les tâches encore ouvertes restent à produire ou valider.**
