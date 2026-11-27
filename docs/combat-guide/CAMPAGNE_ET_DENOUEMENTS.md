# Silent Hill: Halo of Flesh — Campagne, récits et Dénouements

**Révision : 25 novembre 2026.** Association des sections 06 à 11, 24 à 27 du
guide général au contexte réel du projet. Référence de comparaison : `9c426d7`. Mise à jour de production fixe : vague30.

Ce chapitre complète le [GDD](../GDD_FR.md), la
[bible du corpus](../BIBLE_CORPUS_SILENT_HILL.md) et les
[contrats des récits et du tournoi](../TOURNAMENT_STORY.md). Il conserve leurs
identifiants. Les propositions ci-dessous sont une **conception documentaire** :
elles n'ajoutent ni nouvelle route au moteur, ni illustration, ni animation.

## 1. Point de départ vérifié

Le jeu est centré sur les manifestations, créatures et adversaires de la série.
Il ne possède pas, dans le catalogue inspecté, de combattants Harry, James ou
Heather à transformer implicitement en héros jouables de cette campagne.
Leurs noms dans les titres de Chroniques désignent un contexte narratif.

| Ensemble existant | État observé | Conséquence pour cette bible |
| --- | --- | --- |
| [Roster](../../data/roster.json) | 230 profils ; 187 autorisés au combat par la politique courante, 43 hors duel | Ces nombres mesurent l'éligibilité du prototype, pas 187 combattants artistiquement terminés. |
| [Chroniques](../../data/chronicles.json) | 15 chaînes avec titre, source, adversaires, stages, intro et outro ; 13 conservent au moins une rencontre admissible, 2 restent entièrement consultables | Conserver les 15 IDs ; approfondir leurs scènes sans les compter comme 15 campagnes entièrement écrites. |
| [Récits de manifestation](../../src/tournament.js) | `storyPlan` construit des épreuves de la même source et un rival déterministe, puis reprend des textes du moveset | Une file calculée ne prouve ni rivalité canonique, ni histoire personnelle écrite, ni illustrations produites. |
| Profils hors duel | `combatEnabled: false` peut coexister avec une file de chapitres calculée | La fiche reste consultable ; ne pas compter ses chapitres calculés comme combats accessibles. |
| [Conclusions du catalogue](../../data/fatalities.json) | Clés et séquences historiques `fatalities`, `signature`, `nightmare` | Conserver ces clés. « Dénouements » devient le vocabulaire de conception, sans prétendre qu'un renommage de l'interface est déjà appliqué. |

Les règles d'éligibilité sont celles de
[combat-reference-policy.js](../../src/combat-reference-policy.js), non le seul
champ `boss`, l'archétype ou la présence d'un moveset. Ainsi un fantôme, une
apparition, un obstacle et un boss de duel ne deviennent pas interchangeables.

Le [planificateur des Chroniques](../../src/run-progress.js) sépare les
rencontres admissibles des dossiers consultables. `harry_ice` et `maya_villa`
n'ont actuellement aucune rencontre de combat admissible. À l'inverse,
`loop_204863` conserve une rencontre contre `pt_lisa_149` : Lisa est admise par
la politique comme `scripted-encounter`, dans une adaptation de versus. Son
**récit individuel** `storyPlan('pt_lisa_149')` possède une file vide, faute
d'adversaire P.T. distinct dans le catalogue. Son admission au combat, son rôle
dans une Chronique et l'existence d'un parcours individuel sont donc trois
états différents ; aucun ne démontre un duel canonique dans P.T.

### Quatre niveaux narratifs distincts

1. **Chronique** : parcours thématique existant lié à un groupe de sources.
2. **Récit de manifestation** : parcours individuel du prototype, enrichissable
   par des scènes écrites et des rivaux motivés.
3. **Campagne globale** : intrigue commune originale décrite dans la section 3.
4. **Archive consultable** : récit sans duel pour une présence non combattante.

Le tournoi **Le Rite des Huit** conserve ses propres règles. Sa convergence de
combattants n'est pas la preuve que toutes les œuvres partagent une chronologie.

## 2. Associations des quinze Chroniques

Les titres, IDs et lieux ci-dessous proviennent de `data/chronicles.json` ; les
fonctions narratives proposées sont des créations de ce projet. Les listes de
lieux indiquent les associations du prototype, pas un trajet géographique ou un
ordre d'événements authentifié dans l'œuvre.

| ID conservé / titre | Source / lieux associés | Approfondissement proposé et réserve à conserver |
| --- | --- | --- |
| `fog_of_alessa` — La Brume d'Alessa | `sh1` ; `midwich`, `lakeside_amusement`, `nowhere` | Distinguer l'école normale, son état cauchemardesque et les salles précises de Nowhere. Le montage de trois adversaires devient trois épreuves de versus, pas une reconstitution du parcours de Harry. |
| `james_sentence` — La Sentence de James | `sh2` ; `woodside`, `labyrinth`, `hotel_otherworld` | Construire une progression d'enfermement et de confrontation ; chaque manifestation garde sa propre référence. La formule actuelle sur la culpabilité ne doit pas expliquer indistinctement toutes les créatures. |
| `heather_birth` — Naître deux fois | `sh3` ; `shopping_mall`, `brookhaven_sh3`, `church` | Distinguer mémoire, corps et refus d'une destinée dans les textes originaux. Aucun rôle jouable Heather ajouté ; Memory of Alessa garde sa fiche et ses phases d'armes. |
| `room_21` — Les Vingt-et-Un Sacrements | `sh4` ; `room_302`, `water_prison`, `apartment_world` | Montrer enfermement, passage et rituel. Séparer Walter mobile, sa manifestation fixe et les victimes ; une étape non combattante appelle une scène ou un objectif spécifique, pas un KO improvisé. |
| `travis_mirrors` — Les Miroirs de Travis | `origins` ; `cedar_grove`, `riverside_motel`, `antique_shop` | Le motif du reflet structure les raccords illustrés. Le miroir n'autorise pas toutes les créatures à se téléporter ; lieux et équipements restent ceux de leur fiche. |
| `alex_home` — Le Fils qui revient | `homecoming` ; `shepherds_glen`, `grand_hotel`, `underground_hc` | Développer l'héritage et les apparences familiales comme thèmes de montage ; conserver le rôle scénarisé du Bogeyman et les rencontres documentées de Curtis. |
| `harry_ice` — Mémoire sous la glace | `shattered` ; `nightmare_school` | Dossier de poursuite et mémoire, sans duel tuable contre les Raw Shocks. La glace ne constitue pas un pouvoir de projectile transmis à ces profils. |
| `murphy_rain` — Pluie sur Ryall | `downpour` ; `overlook` | Opposer accusation et possibilité de sortie dans les textes du projet ; distinguer les boss, Anne et le phénomène Void selon leurs rôles. Aucun pardon officiel choisi par le résultat d'un match. |
| `book_elements` — Les Gardiens du livre | `bom` ; `book_fire`, `book_wood`, `book_water`, `book_blood`, `book_steel` | Associer les épreuves aux zones et aux gardiens de cette version. Un nom commun à un autre jeu ne transfère ni gestes ni statut narratif. |
| `loop_204863` — 204863 | `pt` ; `looping_hall` | La Chronique contient une rencontre admissible contre Lisa en adaptation de versus scénarisée. Le récit individuel de Lisa reste sans adversaire P.T. distinct et ne peut pas démarrer un run de récit. Les scènes de boucle et les conditions de résultat doivent conserver ce statut adapté, sans présenter un KO comme une résolution attestée de P.T. |
| `maya_villa` — Les Pétales de Maya | `shortmessage` ; `villa` | Scènes de présence, messages et échappée. Sakura Head conserve le rôle de rencontre scénarisée hors duel autonome prévu par la politique. |
| `hinako_f` — La Procession d'Hinako | `shf` ; `ebisugaoka`, `school_shf`, `dark_shrine` | Identifier les versions, masques et états précis. Les noms de travail ou identités à confirmer restent tels quels ; aucun choix de fin imposé par un tournoi. |
| `ashes_of_alessa` — Les Cendres d'Alessa | `film` ; `film_midwich`, `film_hospital`, `film_church`, `film_sanctuary` | Cette chaîne agrège déjà plusieurs films : traiter leurs rencontres comme montage alternatif, et ajouter le sous-identifiant du film à chaque scène. `source: film` n'établit pas à lui seul la compatibilité de deux personnages. |
| `trauma_together` — Le Trauma partagé | `ascension` ; `hope_junction`, `stilledalen`, `ascension_otherworld` | Faire apparaître les points de vue et conséquences dans les illustrations sans inventer une décision officielle de la série interactive. Les deux communautés ne sont pas un seul décor interchangeable. |
| `static_beneath_st_amelia` — Le Signal sous St. Amelia | `townfall` ; `st_amelia_marina`, `st_amelia_residential`, `townfall_medical`, `ceg_tower`, `clara_woods_different` | Conserver les références et réserves propres à Townfall. Le CRTV du menu ne prouve pas une connexion canonique avec tous les autres récits. |

**Contrat commun de réécriture :** chaque chronique reçoit une situation
initiale, une motivation de parcours, la raison de chaque épreuve, un revers,
une clôture et les scènes correspondantes. Une créature non verbale conserve
son comportement ; les objectifs du joueur ne lui attribuent pas une
conscience humaine ou une quête morale inexistante dans les sources.

## 3. Campagne globale proposée — Le Registre des absences

### 3.1 Identité et statut

**ID documentaire : `SHC_CAM_REGISTRE_ABSENCES`. Statut : original du projet,
à implémenter.** La campagne est un récit de convergence alternatif. Son cadre
ne prétend ni révéler l'origine officielle de Silent Hill, ni réunir réellement
tous les épisodes dans une même ville ou une même époque.

Dans une salle d'archives sans fenêtre, un poste diffuse des noms dont les
dossiers sont devenus vierges. Une voix cherche à enfermer toutes les présences
dans un même récit. Les pages se ressemblent de plus en plus, mais leurs traces
matérielles se contredisent. À chaque confrontation, le joueur retrouve un
détail que le registre ne parvient pas à effacer : une arme, une posture, un
lieu, une façon d'approcher.

L'enjeu commun est de préserver ces identités avant la fermeture du registre.
La voix et la salle sont des **créations originales de cadrage narratif**.
Elles ne sont attribuées à aucune divinité, aucun culte ou personnage officiel.
L'observateur reste hors champ ; ce rôle n'ajoute pas un héros combattant.

Le joueur incarne successivement des manifestations déjà cataloguées. Le récit
emploie leur comportement comme point de vue visuel, sans leur faire expliquer
le mystère par des dialogues inventés. Chaque confrontation se déroule dans
une œuvre identifiée. Les changements d'œuvre utilisent un raccord d'archive,
distinct d'une transition physique d'arène.

### 3.2 Périmètre de conception

La première version conçue ici comporte **trois actes et huit chapitres**, avec
un prologue et un épilogue fixes. Elle ne rend pas simultanément jouables toutes
les branches du corpus. Les quinze Chroniques restent des dossiers autonomes
que la campagne permet de consulter depuis les entractes ; leurs chaînes ne
sont pas copiées intégralement dans la campagne.

Les IDs de sujets et d'arènes du tableau existent dans les données. Leur
association ci-dessous est une proposition de mise en scène. Les adversaires
exacts, dialogues complets et règles finales de chaque rencontre restent à
arrêter dans la fiche de chapitre, avec contrôle de la version et du rôle.
Le moteur actuel n'exécute pas ce tableau.

| Chapitre / acte | Sujet et lieu proposés | Action dramatique / objectif du joueur | État obtenu et raccord |
| --- | --- | --- | --- |
| `SHC_CAM_01` — La première trace / I | `sh1_air_screamer_001` ; `old_silent_hill` | Une silhouette traverse une rue dont le nom s'efface. Apprendre portée et déplacement aérien contre un adversaire SH1 compatible ; aucun projectile sonique ajouté. | Première page récupérée après victoire ; raccord illustré vers un registre marqué SH1. |
| `SHC_CAM_02` — Le poids de la lame / I | `sh2_red_pyramid_thing_great_knife_029` ; `blue_creek` | La voix attribue la même silhouette à plusieurs dossiers. Faire lire poids, lenteur et geste de la grande lame dans une épreuve SH2. | Identifier la version 2001 ; l'issue de versus ne raconte pas une mort canonique du boss. |
| `SHC_CAM_03` — Le visage repris / I | `sh3_memory_of_alessa_049` ; `lakeside_sh3` | La même page montre successivement des armes incompatibles. Le combat présente l'état d'arme retenu par la fiche ; le montage dévoile ensuite la falsification. | Fin d'acte : les ressemblances ne suffisent plus. Le parc SH3 reste distinct du parc SH1. |
| `SHC_CAM_04` — Derrière la porte / II | `sh4_walter_sullivan_072` ; `final_sacrament` | Le registre confond corps mobile et présence fixe. Une scène explique les états ; le duel proposé commence dans l'état vulnérable compatible, avec pistolet et tube de cette rencontre. | Une nouvelle page distingue les deux fonctions. La phase rituelle source demeure documentée et n'est pas remplacée par un seuil arbitraire présenté comme canon. |
| `SHC_CAM_05` — Deux reflets / II | `origins_the_butcher_081` ; `riverside_motel` | La voix prétend reconnaître une autre créature derrière le tablier. Épreuve Origins axée sur la présence et la portée du sujet, sans lui attribuer le kit d'un exécuteur d'une autre œuvre. | Revers : préserver une silhouette ne suffit pas, son équipement et son contexte comptent aussi. |
| `SHC_CAM_06` — Ce qui ne tombe pas / II | Pas de sujet de duel dans ce chapitre proposé ; dossiers `harry_ice`, `loop_204863`, `maya_villa` | Entr'acte consultable : la voix exige un vainqueur, mais les dossiers montrent fuite, présence et poursuite. Le joueur classe trois observations ; aucune victoire par KO n'est demandée. Ce choix de campagne n'annule pas la rencontre Lisa de la Chronique actuelle. | La fermeture forcée est interrompue. Ce chapitre requiert un parcours d'observation spécifique, absent du moteur actuel. |
| `SHC_CAM_07` — Le masque et le nom / III | `shf_kashimashi_151` ; `ebisugaoka` | Une page florale résiste à la catégorie imposée. Duel de même œuvre avec gestes et apparence de la fiche ; les autres versions ne sont pas fusionnées. | L'archive retrouve une voix distincte ; fin de chapitre, sans choisir une fin officielle de Silent Hill f. |
| `SHC_CAM_08` — Le dernier dossier / III | Reprise du sujet du chapitre 01, `sh1_air_screamer_001` ; `old_silent_hill` | La première page a changé de légende. Une dernière épreuve SH1 réemploie les règles apprises ; un choix d'archive restaure les distinctions établies aux chapitres précédents. | La voix s'interrompt et les dossiers se referment séparément. La victoire clôt cette campagne originale, sans effacer les histoires de la franchise. |

**Prologue `SHC_CAM_PRO` :** trois illustrations fixes : salle vide ; noms
effacés sur des dossiers sans texte incrusté ; première silhouette réfléchie
dans l'écran. Le texte est une narration originale, enregistrée séparément.

**Épilogue `SHC_CAM_EPI` :** trois illustrations fixes : dossiers de matières
différentes ; poste muet ; porte de la salle demeurant fermée. Le dernier écran
ouvre la consultation des Chroniques. L'ambiguïté porte sur le cadre original,
pas sur une réécriture des fins officielles.

### 3.3 Fiche obligatoire de chaque chapitre

Chaque ID de chapitre doit relier : état d'entrée, source et édition, sujet,
adversaire éligible, lieu exact, raison de la confrontation, scènes, victoire,
échec, point de reprise et état de sortie. Les chapitres sans combat déclarent
explicitement leur interaction et leur condition d'achèvement.

Le progrès de campagne conserve chapitre, état des dossiers, scènes vues et
difficulté. Une défaite relance la rencontre sans supprimer les scènes acquises.
Les illustrations peuvent être passées puis relues. Les choix d'archive ne
modifient ni statistiques du versus, ni sources historiques. Ce contrat de
sauvegarde est **à implémenter** ; il ne se substitue pas au format actuel
`monster-story-v1` des récits individuels.

## 4. Trois fiches narratives représentatives

Les deux premiers dossiers approfondissent des récits actuellement générés ;
le troisième montre le traitement d'une présence hors duel. Les rivaux ci-dessous
sont des **oppositions de versus créées par le projet**. Le nom « rival » ne
certifie pas une relation observée dans le jeu d'origine.

### 4.1 Air Screamer — Dernier passage

**ID : `SHC_ROUTE_AIR_SCREAMER`. Sujet : `sh1_air_screamer_001`.**
Source retenue : SH1 original 1999, région encore à fixer dans la fiche. Les
références `CL_SH1_ENEMIES` et `CL_SH1_CREATURES` décrivent piqué, contact en vol
et contact au sol ; elles ne prouvent pas un projectile ou un cri infligeant
des dégâts. Voir [fiche de référence](../../src/production-reference.js).

**État du récit actuel :** le plan calculé contient Monster Cybil à
`lakeside_amusement`, Puppet Nurse à `midwich`, Wormhead à `midwich`, puis Split
Head à `nowhere`. Cette sélection est celle du prototype. Elle ne situe pas
historiquement tous ces affrontements dans ces salles.

**Écriture proposée :** une présence aérienne traverse les espaces où la lumière
disparaît. L'objectif du joueur est de garder l'initiative tout en trouvant des
fenêtres pour se poser. Le rival Split Head oppose masse, bouche et trajectoire
au piqué de l'Air Screamer. Ce contraste tactique motive le duel du projet ; les
deux monstres ne reçoivent ni haine personnelle, ni dialogue, ni alliance canonique.

Pour le dossier détaillé, le lieu de finale cible est `midwich_nightmare`, dont
la fiche décrit la chaufferie de la rencontre Split Head. Le volume utilisable
par l'Air Screamer doit être validé avant d'en faire une arène de duel. Ce choix
documentaire ne modifie pas la file actuelle ni n'authentifie un combat entre
les deux créatures. Les étapes intermédiaires doivent recevoir la même revue
de lieu ; leur association héritée n'est pas une preuve.

| Brief fixe | Composition et information à raconter | Continuité / état de production |
| --- | --- | --- |
| `SHC_ILL_AIR_INTRO` | Maison, niche et boîte aux lettres de Levin Street dans `old_silent_hill` ; Air Screamer entier en vol, ailes déployées, neige et brume. L’image annonce la présence aérienne. | PNG produit et lié au profil SH1, à la sélection et au premier chapitre ; composition originale candidate, fidélité non certifiée. [Fichier et sources](../production/vague30/story/README.md). |
| `SHC_ILL_AIR_RIVAL` | Chaufferie de `midwich_nightmare`, foyer et grilles visibles ; Air Screamer dans le volume supérieur, Split Head au sol. Les deux silhouettes expliquent le conflit de portée. | Composition multi-sujets autorisée pour cette illustration ; sprites séparés pour le moteur ; duel original ; image à produire. |
| `SHC_ILL_AIR_OUTRO` | Même façade, niche, marches, neige et brume après le départ complet de la créature. La rue vide porte la conséquence. | PNG produit et lié à l’achèvement du récit ; aucune éclaircie ni délivrance ajoutée. L’introduction et la conclusion restent deux images fixes. [Fichier et sources](../production/vague30/story/README.md). |

**Dénouement Signature proposé : « Dernier passage ».** Piqué de contact,
renversement compatible avec la cible, puis sortie dans la brume ; la coupe
sonore clôt l'action. Le nom et la chorégraphie sont du projet. Le geste reprend
la proposition existante de la fiche ; aucun rayon, onde sonique ou vent offensif
n'est déduit du cri. Pour un géant fixe, montrer le passage et le recul local
autorisé, sans soulever tout le corps. Pour une cible non combattante, la
conclusion est indisponible.

### 4.2 Red Pyramid Thing — Great Knife : La lame demeure

**ID : `SHC_ROUTE_GREAT_KNIFE`. Sujet : `sh2_red_pyramid_thing_great_knife_029`.**
Source retenue : SH2 original 2001. Les références `CL_SH2_03_BLUE_CREEK_APTS`,
`CL_SH2_BOSSES` et `CL_SH2_ENEMIES` de la fiche distinguent grande lame,
contact, saisie et retrait de la première rencontre. Le casque, le tablier et
la lame ne prennent pas les proportions de la version film ; la variante lance
`sh2_red_pyramid_thing_spear_030` demeure un autre profil.

**État du récit actuel :** Mannequin à `woodside`, Creeper à `woodside`, Abstract
Daddy à `labyrinth`, puis Flesh Lip à `brookhaven_sh2`. Le rival Flesh Lip est
choisi par le plan déterministe, sans relation narrative attestée. Le stage
`labyrinth` désigne la salle de commande Box of Faces, et `brookhaven_sh2` le
couloir Otherworld B1 devant l'ascenseur : ces fonds ne doivent pas être décrits
comme les salles originales d'Abstract Daddy ou de Flesh Lip.

**Écriture proposée :** le récit oppose le poids d'un geste répété à des présences
qui envahissent l'espace autrement. L'objectif du joueur est de choisir quand
engager la lame et quand accepter le recul. Flesh Lip devient un rival de
géométrie, suspendu, obligeant à rendre ses fenêtres d'attaque lisibles ; le
duel reste une rencontre alternative du projet. Aucune réplique n'explique
définitivement la psychologie de James et aucune conclusion officielle n'est
choisie à sa place.

La finale détaillée exige une **référence de salle Flesh Lip dédiée** avant
production fidèle. Aucun ID de stage fictif n'est ajouté ici pour masquer
l'absence. Le dossier peut employer le fond B1 du prototype pour une adaptation
explicitement déclarée ; il ne peut pas le valider comme lieu de la rencontre
originale. L'intro et l'outro ci-dessous disposent, elles, de `blue_creek` comme
association documentée.

| Brief fixe | Composition et information à raconter | Continuité / état de production |
| --- | --- | --- |
| `SHC_ILL_KNIFE_INTRO` | Palier de `blue_creek`, garde-corps et descente vers l'eau au fond ; grande lame traînée, sujet entier, aucun costume film. La masse et le silence posent le rythme. | L'espace sec de duel est adapté ; la référence du palier reste distincte de son échelle versus ; image à produire. |
| `SHC_ILL_KNIFE_RIVAL` | Lame au premier plan et silhouette suspendue de Flesh Lip au fond, avec volume libre entre les deux. Cette opposition doit rester lisible avant le premier coup. | Salle exacte, hauteur de suspension et cadre à documenter ; brief bloqué sur la référence du lieu, pas prêt à certifier. |
| `SHC_ILL_KNIFE_OUTRO` | Retour au palier ; la silhouette emporte la lame vers la sortie, sans pose de trophée. Le plan montre un retrait plutôt qu'une destruction du sujet. | Une sirène éventuelle n'est liée qu'à la mise en scène Blue Creek explicitement choisie ; ne pas la généraliser à tous les matches ; image à produire. |

**Dénouement Signature proposé : « Sentence ».** Réemploi du mouvement
d'abattement documenté, préparation lisible, impact puis immobilité. Le nom,
le montage et les règles sont originaux. Ne pas ajouter la lance, une invocation
ou un démembrement emprunté à une autre œuvre. Une cible géante ou suspendue
reçoit un cadrage d'impact sur une zone compatible ; à défaut, employer une
victoire simple, sans déformer son corps. Le dénouement suicidaire d'une autre
rencontre n'est pas une réaction universelle de défaite.

### 4.3 Eileen Head — La porte reste fermée

**ID : `SHC_ARCHIVE_EILEEN_HEAD`. Sujet : `sh4_eileen_head_073`.**
Rôle courant : `noncombatant`, `combatEnabled: false`. Les références
`CL_EILEEN_HEAD` et `EXT_SH4_ODDITIES_20261023` conservent une identité nuancée
et une présence immobile. Les libellés génériques historiques de super ou de
fatalité ne peuvent pas prévaloir sur cette décision de rôle.

Le dossier raconte l'approche d'une porte, l'observation et le choix de repartir.
Il ne comporte ni adversaire, ni barre de vie, ni rival à vaincre, ni Dénouement
offensif. Le fait que `storyPlan` calcule une file de quatre chapitres ne rend
pas cette file jouable.

| Brief fixe | Composition et information à raconter | Continuité / état de production |
| --- | --- | --- |
| `SHC_ILL_HEAD_INTRO` | Couloir d'étage de Hospital World ; cadrer le seuil avant l'ouverture. L'architecture de SH4 reste distincte de Brookhaven. | `hospital_world` peut fournir le contexte de couloir, pas la chambre elle-même ; image à produire après choix du seuil exact. |
| `SHC_ILL_HEAD_PRESENCE` | Porte entrouverte et regard déjà orienté vers l'observateur ; cadrage conservant l'échelle de la tête dans sa chambre. | La fiche du stage actuel exclut la chambre de la tête géante : une référence de chambre est nécessaire. Aucun laser, mouvement de poursuite ou corps ajouté ; brief bloqué sur le cadrage source. |
| `SHC_ILL_HEAD_OUTRO` | Même seuil fermé, observateur hors champ ; un étroit reste de lumière suffit à maintenir la présence. | Fin originale de consultation, aucune mort et aucune victoire de combattant ; image à produire. |

## 5. Dénouements : vocabulaire et contrat

**« Dénouement » est un nom créé pour Halo of Flesh**, choisi pour relier la
conclusion d'un affrontement au ton du projet. Ce n'est pas le nom d'une
mécanique officielle commune à Silent Hill.

| Terme de conception | Correspondance existante | Fonction |
| --- | --- | --- |
| **Nightmare / ultime** | Action de super du moveset | Utilisable pendant le combat selon sa jauge et ses conditions. |
| **Dénouement Signature** | Famille historique `signature` | Clôture liée à une action propre au sujet ; source et adaptation explicites. |
| **Dénouement Cauchemar** | Famille historique `nightmare` | Présentation de clôture amplifiée ; ne donne pas automatiquement au sujet le contrôle de l'Otherworld. |
| **Dénouement de lieu** | Entrée de conclusion de stage | Séquence du décor avec règles, cibles et ancrages propres. |
| **Victoire** | Présentation de fin de match | Attitude du vainqueur ; peut remplacer un dénouement incompatible. |
| **Outro narrative** | Fin de route ou de chapitre | Conséquence du récit, indépendante d'une animation de fin de combat. |

Les valeurs `decisive-special` et `decisive-super` présentes dans les données
décrivent des déclencheurs hérités. Elles ne prouvent pas une fenêtre de saisie
après KO ni une commande spéciale déjà disponible. Toute nouvelle commande,
fenêtre, jauge, distance et compatibilité de mode doit recevoir une règle
versionnée avant implémentation.

### Fiche D adaptée au projet

Chaque Dénouement doit contenir : ID stable et famille ; ID exact du sujet ;
œuvre, édition et source ; nom et statut du nom ; geste attesté ; intention de
mise en scène ; condition de match et priorité sur KO ; distance et ancrages ;
cibles compatibles ; solution de remplacement ; durée et passage abrégé ;
caméra, son, texte et effet ; retour au résultat ; statut documentaire,
artistique, d'intégration et de test.

Le champ **intention** peut décrire une chasse, un automatisme, une pression ou
un comportement observé. Il ne doit pas donner par défaut remords, désir de
vengeance ou plaisir de tuer à toute manifestation. Pour un adversaire humain,
arme, caractère et situation restent ceux de la version choisie.

### Compatibilité des cibles

| Famille de cible | Règle de conception | Repli obligatoire |
| --- | --- | --- |
| Bipède de taille compatible | Saisie et chute seulement si anatomie, espace et rôle le permettent | Impact sans saisie ou simple victoire. |
| Quadrupède / petite créature | Ancrage et hauteur propres ; pas de squelette humain imposé | Plan au sol et réaction spécifique. |
| Essaim / masse collective | Effet sur une portion ou dispersion autorisée par la fiche | Fin de présence de versus, sans transformer l'essaim en un corps unique. |
| Volant / suspendu | Respecter appui, fixation et volume réellement prévus | Cadrage de contact compatible, sans chute systématique. |
| Géant / corps fixé | Aucun soulèvement générique ni téléportation hors de son support | Impact local, coupure de plan ou victoire simple. |
| Fantôme / entité intangible | La défaite ou le retrait suit le contrat de cette version | Neutralisation temporaire si prévue ; aucune destruction définitive automatiquement annoncée. |
| Non-combattant / obstacle / identité bloquée | Aucun dénouement offensif accessible | Scène d'archive ou observation, selon le rôle. |

Une scène abrégée conserve le même résultat de simulation. Le profil statique
d'un stage conserve ses repères ; il n'active pas un danger ni une fermeture de
porte simplement parce que l'illustration les suggère. La conclusion arcade
n'établit aucune nouvelle fin canonique.

## 6. Illustrations : règles de production et comptage

La phase courante reste **images et sprites fixes**. Les entrées, sorties,
transitions, voix et mouvements sont décrits pour la suite ; aucune animation
n'est livrée par ce chapitre.

Chaque brief d'illustration associe scène, version, sujet, lieu exact, état du
décor, cadrage, regard, pose, équipement, palette et références. Les éléments
sans preuve restent signalés. Une image narrative peut réunir plusieurs
personnages ; un sprite destiné au moteur garde un sujet exploitable par image,
avec cadrage entier, orientation latérale, ancrage et transparence appropriés.

Les fonds doivent reprendre les lieux et leurs repères vérifiés. Une scène de
théâtre générique, une estrade inventée ou une salle interchangeable ne valide
pas un lieu de la série. Une composition versus doit énumérer ses adaptations
de caméra, d'échelle et de sol. Les textes, légendes, sous-titres et crédits
restent hors de l'image pour permettre leur modification et leur localisation.

**Périmètre créé par ce chapitre :** une proposition de campagne en huit
chapitres ; association des quinze Chroniques existantes ; deux exemples de
récit combattant et un dossier non combattant ; neuf briefs fixes pour ces
exemples ; six plans fixes proposés pour le prologue et l'épilogue ; deux
Dénouements Signature détaillés. Les neuf briefs et les six plans ne sont pas
quinze fichiers produits. Les chapitres ne sont pas huit parcours implémentés.

## 7. Validation et prochaines associations

La relecture de ce chapitre a porté sur les IDs présents, les rôles calculés,
les plans actuels des trois sujets et les descriptions précises des lieux.
Elle ne constitue pas un test navigateur ni une revue de nouvelles images.

| Contrôle | Condition de validation |
| --- | --- |
| Identité et continuité | Chaque scène nomme l'œuvre, la version et la source ; le pack `film` reçoit une précision par film. |
| Éligibilité | Un sujet hors duel ne devient pas jouable par la présence d'un récit, d'une jauge ou d'un texte de finisher. |
| Relations | Rivalité attestée et opposition de versus portent des statuts différents. |
| Lieu | Pièce, état et époque correspondent à la scène ; l'association à un même jeu ne suffit pas. |
| Route | Intro, raison des rencontres, revers et conséquence sont écrits ; une sélection déterministe seule reste un squelette de parcours. |
| Campagne | Début, huit chapitres, reprise et épilogue accessibles avant de déclarer la campagne intégrée. |
| Illustration | Fichier présent, comparé aux références et relu à sa taille d'affichage avant de passer de « produit » à « vérifié ». |
| Dénouement | Déclencheur, cas incompatible, KO simultané, interruption et retour au résultat testés dans les modes annoncés. |
| Statistiques | Lore, conception, assets, intégration, tests et publication suivis séparément avec un périmètre daté. |

### Écarts précis à ne pas masquer

- `sh3_memory_of_alessa_049.stageId` renvoie encore à `lakeside_amusement`
  (SH1) ; le résolveur des récits se replie alors sur le premier stage SH3.
  Le chapitre proposé utilise explicitement `lakeside_sh3`, sans corriger
  silencieusement les données héritées dans cette livraison documentaire.
- Les associations de Split Head à `nowhere`, d'Abstract Daddy à la pièce
  Box of Faces et de Flesh Lip au couloir B1 sont des placements du prototype.
  Elles ne prouvent pas la géographie des rencontres originales.
- Le stage `hospital_world` couvre un couloir et exclut la chambre de la tête
  géante. Un brief Eileen Head ne peut pas réutiliser ce fond comme preuve de
  l'intérieur de la chambre.
- Les 230 profils et les 4 600 entrées de commandes ne prouvent pas 230
  scénarios écrits ni 4 600 gestes officiellement attestés.
- La présence de séquences `fatalities` sur des profils hors duel ne lève pas
  la restriction de rôle. Les clés héritées restent conservées ; les
  conclusions offensives interdites ne deviennent pas des tâches à produire.

### Sources internes utilisées

Les constats du projet viennent de [roster.json](../../data/roster.json),
[chronicles.json](../../data/chronicles.json), [stages.json](../../data/stages.json),
[fatalities.json](../../data/fatalities.json),
[tournament.js](../../src/tournament.js) et
[combat-reference-policy.js](../../src/combat-reference-policy.js).
Les détails d'œuvres cités sont repris des observations et contraintes de
[production-reference.js](../../src/production-reference.js), avec leurs IDs de
preuve. Leur niveau de preuve secondaire et leurs captures encore manquantes
restent inchangés ; cette rédaction ne les transforme pas en nouvelle
vérification primaire. Aucun dialogue officiel n'a été inventé ou cité.
