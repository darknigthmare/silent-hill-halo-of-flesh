# Références complémentaires et travaux restant à réaliser

Ce document conserve le relevé de la passe de fidélité précédente. Les
[chantiers parallèles](CHANTIERS_PARALLELES_2026-10-23.md) décrivent l'état
suivant du classeur, des images et des validations.

La demande porte sur la réalisation des propositions du classeur et sur la
fidélité aux œuvres d'origine. Ces deux validations restent distinctes : les
supers, finishers et transitions de versus inventés pour le projet n'ont pas
tous un équivalent dans les jeux ou films.

## État vérifié dans le classeur

L'inventaire à la reprise comptait **874 actions ouvertes sur 875**, dont
**127 P0**. Il couvrait 230 productions artistiques,
230 révisions de mouvements, 230 ensembles cinématiques, 59 décisions de rôle,
123 arènes et deux actions globales. Le raccord technique de chargement des
décors bitmap est désormais validé : **873 actions restent ouvertes, dont
127 P0**. Les 4 600 mouvements ont encore leurs
champs de FPS, début, impact et fin de source vides.

Le registre actif contient **trois profils et sept PNG candidats** : trois
images d'Air Screamer, une du profil du film et trois poses armées de Memory of
Alessa. Il contient **un clip animé candidat**, le montage de vol d'Air
Screamer, et **zéro certification 1:1**. Les poses fixes d'Alessa ne constituent
pas des cycles animés ; aucun temps de source n'est mesuré pour ces candidats.
Les éléments d'arène retirés restent des
traces de décisions ; leur présence dans l'inventaire ne demande pas leur
réactivation.

## Sources techniques consultées sur Internet

Le dépôt communautaire de décompilation SH1 a été consulté au commit
`8a16aab925373696eaec2935dfe4f4c012b139e8`. Son [README](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/README.md#L38)
identifie la version PlayStation NTSC 1.1, exécutable `SLUS_007.07`.
Il s'agit d'une reconstruction communautaire du code, pas d'une capture vidéo.
Le projet demande les données du disque original pour reconstruire le jeu.

| Sujet | Référence figée | Observation exploitable |
| --- | --- | --- |
| Monster Cybil, état initial | [Initialisation](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/monster_cybil.c#L346) | Santé initiale 4 000 unités internes et dix balles. |
| Monster Cybil, abandon de l'arme | [Condition de transition](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/monster_cybil.c#L890) | Transition lorsque les balles sont épuisées **ou** la santé est strictement inférieure à 2 000 ; la même condition figure dans l'autre branche à la ligne 905. |
| Monster Cybil, phase désarmée | [État après transition](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/monster_cybil.c#L525) | L'abandon de l'arme et les munitions sont deux états distincts. L'abandon dû à la santé ne consomme pas les balles restantes. |
| Monster Cybil, consommation | [Événement de tir](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/monster_cybil.c#L1164) | Le compteur est décrémenté pendant la séquence de tir. |
| Monster Cybil, effet de la balle | [Émission de l'attaque 63](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/monster_cybil.c#L1182) et [réaction du joueur](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/bodyprog/player_control.c#L7133) | L'attaque 63 provoque `DamageThrownFront` ou `DamageThrownBack`, selon l'orientation. La balle renverse Harry. |
| Air Screamer et Night Flutter, attaques | [Identifiants d'animation](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/include/maps/characters/air_screamer.h#L116) | Le contrôleur partagé distingue morsure au sol, morsure en vol stationnaire et griffure en vol plané. |
| Air Screamer et Night Flutter, collisions | [Morsures 40 et 41](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/air_screamer.c#L13509) et [griffure 42](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/air_screamer.c#L13539) | Les trois familles correspondent à des identifiants d'attaque distincts ; la griffure possède deux segments de collision. |
| Air Screamer, données internes | [Table d'animation](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/air_screamer.c#L44) | Les plages 0–11, 12–25 et 26–55 sont des indices de keyframes internes. Elles ne mesurent pas les timings des sprites du projet. |
| Cadence interne SH1 | [Structure d'animation](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/include/bodyprog/chara/anim.h#L21) | La durée peut être constante ou variable, avec une base documentée à 30 FPS. Une valeur Q12 de la table n'est pas un relevé de FPS vidéo. |

Le [README de Silent Hill 2 Enhanced Edition](https://github.com/elishacloud/Silent-Hill-2-Enhancements/blob/1df281296f25c7e28df91578a5ffefeac2124adc/README.md)
a également été consulté. Il documente des corrections de l'édition PC ; il
demande le jeu original et ne distribue pas toutes ses animations. Ses
améliorations ne doivent pas être attribuées automatiquement aux éditions PS2,
Arcade ou au remake.

Deux autres outils communautaires ont été identifiés sur GitHub :
[Memory of Alessa](https://github.com/dreamingmoths/memory-of-alessa) reconstruit
SH3 PS2 et demande le disque NTSC-U v1.02 ;
[Silent Hill Museum](https://github.com/dreamingmoths/silent-hill-museum)
permet d'inspecter les modèles et animations de SH2 PC à partir des fichiers du
jeu. Ces projets fournissent du code d'analyse ou de reconstruction, pas les
images manquantes du classeur.

## Correction technique entreprise

La règle d'abandon de l'arme de Cybil est raccordée à une phase désarmée
persistante : épuisement des munitions ou passage sous la moitié de la santé.
Les balles restantes ne sont pas présentées comme des tirs effectués. La santé
du versus est normalisée par rapport au maximum du profil : ce changement
d'échelle est une adaptation du moteur. Les paramètres de dégâts et de durée
du projet ne deviennent pas des mesures officielles.

Le code source demande une transition avant l'abandon visuel de l'arme. Le
projet conserve l'attaque déjà acceptée et applique la phase désarmée aux
attaques suivantes. Ce raccord sans reprise de la cinématique originale, ainsi
que sa persistance entre les manches du versus, restent des adaptations ; le
moment exact du geste n'est pas certifié.

La collision d'une balle de Monster Cybil provoque désormais la chute de la
cible. Ce raccord est limité au profil exact de Cybil SH1 : il ne transforme
pas les tirs d'autres personnages en attaques renversantes. Il suit l'attaque
63 et la réaction du joueur de la décompilation, ainsi que le [guide des boss
SH1](https://www.silenthillmemories.net/sh1/bosses_en.htm). Les dégâts et la durée
de chute restent ceux du versus. Après épuisement des balles, la prise
désarmée existante reste disponible ; elle est encore une projection
instantanée, pas une reproduction de l'étranglement maintenu de la source.

Le raccord d'état ne produit pas les images du geste d'abandon ni les autres
poses et cinématiques ouvertes. Les statuts de production du classeur restent
ouverts jusqu'à livraison et vérification des images et montages demandés.

## Quatre phases de Memory of Alessa

Le [guide des boss SH3](https://www.silenthillmemories.net/sh3/bosses_en.htm) et
le [chapitre du parc d'attractions](https://www.silenthillmemories.net/sh3/walkthrough_13_lakeside_amusement_park_en.htm)
décrivent l'ordre couteau, pistolet, tuyau, mitraillette, avec disparition et
retour entre les formes. Ces deux pages partagent le même auteur : elles ne
comptent pas comme deux confirmations indépendantes. Les armes à feu disposent
aussi de coups de crosse au contact.

Le moteur applique désormais cet ordre et les attaques de l'arme équipée. Les
coups puissants ne peuvent pas sauter une arme ; la dernière forme peut être
vaincue. La pause fige la récupération, les projectiles déjà émis subsistent et
une nouvelle manche ou tentative restaure le couteau. Les quarts de vitalité,
52 ticks de récupération et rafales de trois tirs espacés de cinq ticks sont
des paramètres originaux du versus, pas des mesures de SH3. Le geste
d'effondrement et les animations des quatre formes restent à produire.

Deux vues complémentaires ont aussi été inspectées : le [corps entier avec
couteau du DVD Lost Memories](https://www.silenthillmemories.net/dvd_lm/sh3_creatures/pics/sh3_cre_14.jpg)
et une [capture du combat](https://www.silenthillmemories.net/sh3/walkthrough/pics/sh3_boss_memory_of_alessa.jpg).
Elles renseignent l'apparence et ne fournissent ni cycle animé ni cadence ; la
région et le traitement de la capture restent à établir.

Trois PNG transparents fixes sont désormais actifs pour les formes couteau,
pistolet et tuyau. La comparaison porte sur le costume, les cheveux noirs
courts, le visage brûlé et les silhouettes des armes. La finition mate réduit
les reliefs orangés et brillants du premier candidat. Le [rendu de modèle
archivé et légendé Memory of Alessa](https://www.silenthillmemories.net/sh3/arts/pics/sh3_art_creature_14_memory_of_alessa.jpg)
montre la même pose au couteau que le DVD ; il ne compte donc pas comme une
seconde image d'animation indépendante, et sa première publication n'est pas
authentifiée séparément. La capture du combat apporte une autre vue du visage
du modèle original de SH3.

Les illustrations d'inventaire du [couteau](https://www.silenthillmemories.net/sh3/weapons/knife.jpg),
du [pistolet](https://www.silenthillmemories.net/sh3/weapons/handgun.jpg) et du
[tuyau](https://www.silenthillmemories.net/sh3/weapons/steel%20pipe.jpg)
renseignent les silhouettes et matériaux, sans établir la prise exacte
d'Alessa. Les trois positions d'attente sont des poses candidates composées
pour le projet ; leurs prises, les parties cachées des mains, la texture
exacte du visage et l'anatomie du côté opposé ne sont pas validées par des
captures correspondantes.

La quatrième image, avec mitraillette, manque : l'outil de génération a refusé
la tentative dans la catégorie violence. Aucun contournement n'a été effectué.
Cette forme affiche une carte de manque explicite. Une attaque ou une défaite
sans animation conserve la pose fixe de l'arme équipée, sans emprunter l'image
d'une autre arme ni présenter cette pose comme le geste demandé. Le [registre
de provenance Alessa](../../art/reference-provenance-alessa.json) conserve les
références, empreintes, trois images actives et limites ; le [premier
candidat](../../art/archive/sh3_memory_of_alessa_049.first-candidate.json)
reste archivé. Aucun FPS ni timecode de source n'est renseigné.

## Air Screamer : montage candidat

Les références [de face](https://www.silenthillmemories.net/sh1/arts/pics/sh1_art_cre_03.jpg)
et [de dos en jeu](https://www.silenthillmemories.net/sh1/screens/pics/sh1_screen_10.jpg)
ont été téléchargées et inspectées. Elles permettent de comparer la tête, les
membranes, le torse et les pattes, sans mesurer un cycle de vol.

Trois images transparentes ont été reconstruites : ailes à mi-course, levées
et abaissées. Le montage `idle` contient quatre étapes, dont une reprise de
l'image médiane, sur 24 ticks à 60 Hz. Ses trois poses sont réellement
distinctes ; la cadence est un choix de travail du projet. Les attaques et
défaites absentes conservent une image fixe explicitement signalée comme repli,
au lieu de rejouer le vol comme s'il s'agissait de ces gestes.

Le [registre de provenance](../../art/reference-provenance.json) conserve les
URL, empreintes, images générées et limites. L'ancien candidat et sa
[description](../../art/archive/sh1_air_screamer_001.legacy.json) sont conservés.

Les noms des attaques d'Air Screamer et de Night Flutter SH1 distinguent
désormais morsure au sol, morsure en vol stationnaire et griffure en vol plané,
conformément aux trois familles du contrôleur partagé. Les variantes
d'approche, de traversée et de descente restent des adaptations du versus ;
leurs valeurs numériques n'ont pas été modifiées. Le [guide des ennemis
SH1](https://www.silenthillmemories.net/sh1/enemies_en.htm) décrit notamment un
assaut au sol avec la tête, tandis que la décompilation nomme cet état
`StandBiteAttack` : cette différence de vocabulaire ne fournit pas une mesure
du mouvement. Le raccord de Night Flutter ne produit pas ses images ni sa
silhouette propre.

## Split Worm : frappe du sol sans dégât

Le [guide des boss SH3](https://www.silenthillmemories.net/sh3/bosses_en.htm)
décrit une frappe du sol qui déséquilibre Heather sans infliger de dégâts.
L'attaque correspondante de Split Worm SH3 applique désormais zéro dégât et
un déséquilibre aux seules cibles en contact avec le sol. Elle ne réduit pas
la santé ou la garde et ne rapporte ni jauge, combo, score de dégâts ou contre.
Elle ne relève pas une cible déjà à terre et n'efface pas les projectiles.

Les **18 ticks** de déséquilibre et la portée locale sont des paramètres du
versus, sans temps de source mesuré. Ce raccord reste limité au profil exact
de Split Worm SH3. Il ne livre pas encore les animations du tunnel ou une
reproduction complète de la vulnérabilité de la carapace.

## Missionary : défense contre les tirs visibles

Le [guide des boss SH3](https://www.silenthillmemories.net/sh3/bosses_en.htm)
décrit le blocage frontal des balles par les lames, la vulnérabilité de dos et
au sol, et l'exception du silencieux qui masque le flash du tir. Le moteur
applique cette défense au seul Missionary SH3, pour les recettes de tirs d'armes
à feu identifiées. Les projectiles énergétiques ou corrosifs et les pièges ne
sont pas assimilés à ces balles.

La défense disponible dévie le tir sans dégât résiduel, gain de jauge, parade
parfaite ni riposte gratuite. Les états d'attaque, récupération, chute et autres
indisponibilités restent vulnérables. Ce choix d'états est une adaptation du
versus ; aucune fenêtre en frames n'est mesurée dans SH3. Le drapeau de tir
silencieux est pris en compte sans annoncer une arme silencieuse déjà produite.

## Incubator et Incubus : champ local et teintes

Le [guide des boss SH1](https://www.silenthillmemories.net/sh1/bosses_en.htm)
décrit le champ d'Incubator qui renverse Harry lorsqu'il s'approche. La
[décompilation NTSC 1.1](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/characters/unknown23.c#L870)
confirme une attaque locale à moins de `Q12(2.5)` avec direction radiale. Le
[raccord du contrôleur](https://github.com/shdecompilations/silent-hill-decomp/blob/8a16aab925373696eaec2935dfe4f4c012b139e8/src/maps/map7_s03/map7_s03_3.c#L8137)
identifie cette forme comme Incubator ; le contrôleur de cinématique de même
nom n'est pas la bonne référence pour ce combat.

Le champ est réservé à l'ID et à l'œuvre d'Incubator, sans projectile, jauge,
combo ou contre automatique. Le rayon en pixels, les dégâts, la chute et le
délai de réactivation sont des choix du versus. Ils ne convertissent pas les
unités internes du jeu original en mesures de sprites certifiées.

Les décharges sont désormais bleues pour Incubator et rouges pour Incubus,
conformément au guide. Les valeurs RGB sont des teintes de travail ; aucune
palette originale exacte n'a été relevée. Incubus ne reçoit pas le champ local.

## Correction documentaire : Blood Baby

Le [bestiaire Book of Memories](https://www.silenthillmemories.net/sh_book_of_memories/bestiary_en.htm)
décrit Blood Baby comme un rejeton engendré par sa mère, sans lui attribuer le
pouvoir d'invoquer Blood Mama. L'observation du catalogue est corrigée en
transition de naissance ; le super reste bloqué tant qu'une attaque propre
n'est pas attestée. L'[interview officielle PlayStation](https://blog.playstation.com/2012/10/03/silent-hill-book-of-memories-for-ps-vita-a-new-angle-on-silent-hill/)
fournit un contexte complémentaire de l'édition Vita, sans prouver les gestes
du rejeton. Aucune attaque n'est validée par cette seule naissance.

## Classeur et vérification

Le raccord de présentation inclut désormais les couches bitmap exactes d'un
lieu. Le lancement attend les acteurs et le décor ; un échec conserve l'ancien
moteur et ses images décodées. Une nouvelle tentative peut aboutir, tandis qu'un
changement de sélection ou retour au menu annule le lancement en attente.
Une reprise réussie efface l'ancien message de chargement et synchronise le
bouton de pause dès l'introduction du nouveau moteur. Les alertes de mémoire
apparues depuis le lancement restent visibles.
Le rendu utilise effectivement les images du cache, avec une horloge de
simulation figée par la pause. Le build vérifie identité, œuvre, empreintes,
dimensions et décodage des PNG déclarés.

L'action globale `global:cinematic-clips` est validée pour ce raccord technique.
Le registre de décors bitmap de production reste vide ; les tests injectent
des images synthétiques uniquement dans leurs scénarios. Les 123 actions
artistiques de lieux et les 230 ensembles de présentation restent ouvertes.

L'export de cette passe modifie 196 cellules par rapport au classeur de la
reprise et augmente la hauteur de 109 lignes pour leur texte. Les 80 formules
sont recalculées ; le vérificateur compare 249 556 cellules et préserve les
parties natives et annotations non concernées. Les corrections de Cybil et
Split Worm et les trois images fixes d'Alessa apparaissent dans leurs lignes.
L'action artistique d'Alessa et son repos sont en cours ; aucune action
artistique n'est déclarée validée. Les 873 actions restent ouvertes et les
timecodes/FPS de source restent vides.

La validation finale passe **604 tests Node, 96 tests Python et 305 contrôles
navigateur dans onze suites Chromium**, avec 45 captures et aucune exception
JavaScript. Le build contient 83 fichiers ; ses 82 fichiers issus du dépôt
sont identiques aux sources testées. Le [rapport machine](../INTEGRATION_QA_2026-10-23.json)
précise empreintes, périmètres et limites des scénarios.

Une vérification complémentaire des vrais PNG en jeu comporte 13 contrôles
et dix captures, exclus du total des suites du build. Les transitions ordinaires
sélectionnent trois images distinctes, avec un écart d'appui maximal de
0,30 pixel. La forme SMG conserve uniquement son cartouche ; sa largeur minimale
passe à 156 pixels pour rendre le libellé lisible à la taille native du jeu.
Une relecture du code confirme le maintien du contexte d'arme en attaque,
KO et présentation. Ces contrôles ne certifient pas les images ni les temps
des animations originales.

Les deux manifestes de PNG contribuent désormais à la révision des caches
statique et d'exécution. Une modification de poses, calibration ou durées
renouvelle les caches même lorsque les chemins des PNG restent identiques.

## Accès aux sources : état après reprise

Les téléchargements vérifiés sur Silent Hill Memories, ses images
et PlayStation Blog répondent HTTP 200. YouTube échoue encore au tunnel CONNECT
avec une erreur 403 ; Fandom répond 402 et Google renvoie une vérification
JavaScript. Ces réponses ne sont pas des vidéos ou résultats analysés. Aucune
vérification TLS ni politique du proxy n'a été désactivée.

Les pages vidéo SH1, SH3 et des DVD de compilation consultées intègrent leurs
séquences depuis YouTube. Le hub japonais public de Konami référence aussi un
MP4, qui redirige vers `img.konami.com`, bloqué au tunnel CONNECT 403. Son contenu
et son édition ne sont pas vérifiés ; il n'est pas utilisé comme preuve d'un
geste ou d'un temps de lecture.

La suite nécessite de consulter plusieurs références de chaque édition,
d'identifier les formes, armes et phases exactes, de mesurer les séquences,
puis de produire et comparer les images transparentes indépendantes.
Aucun relevé vidéo ni indicateur de fidélité 1:1 n'est rempli à partir des seuls
indices du code ou d'une description textuelle.
