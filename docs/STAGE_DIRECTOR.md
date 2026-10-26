# Directeur d’arènes et gameplay environnemental — v0.9.6

**123 arènes · 14 terrains · 15 bascules · 29 événements · 8 liens de danger · 29 interactions.**

> Les lieux, accessoires, climats et motifs sont documentés à partir du catalogue du projet. Les timings, dégâts, zones de danger et déclencheurs restent des adaptations versus originales explicitement séparées du canon.

## Terrains jouables

| ID | Nom | Mouvement | Saut | Esquive | Friction | Recul | Garde | Description |
|---|---|---:|---:|---:|---:|---:|---:|---|
| `concrete` | BÉTON SEC | ×1 | ×1 | ×1 | 0.84 | ×1 | ×1 | Sol stable et neutre. |
| `wetConcrete` | BÉTON TREMPÉ | ×0.96 | ×0.96 | ×1.06 | 0.9 | ×1.08 | ×0.96 | L’élan se conserve plus longtemps et les impacts repoussent davantage. |
| `flooded` | EAU STAGNANTE | ×0.87 | ×0.9 | ×0.9 | 0.8 | ×0.92 | ×0.92 | L’eau freine les déplacements et les esquives sans rendre le combat illisible. |
| `ice` | GLACE DU CAUCHEMAR | ×1.02 | ×0.95 | ×1.14 | 0.94 | ×1.12 | ×0.9 | Faible adhérence : les accélérations et esquives prolongent leur glissade. |
| `steel` | CAILLEBOTIS MÉTALLIQUE | ×0.98 | ×0.96 | ×0.98 | 0.86 | ×1.04 | ×0.94 | Le métal résonne, accentue la radio et transmet les chocs. |
| `wood` | PLANCHER ANCIEN | ×0.97 | ×1 | ×0.96 | 0.85 | ×1 | ×0.98 | Le plancher trahit les déplacements par des craquements. |
| `carpet` | MOQUETTE HUMIDE | ×0.92 | ×0.96 | ×0.9 | 0.76 | ×0.88 | ×1.04 | Les pas sont étouffés mais les esquives perdent de la portée. |
| `mud` | BOUE ET RACINES | ×0.88 | ×0.9 | ×0.86 | 0.77 | ×0.9 | ×0.92 | Le terrain retient les pieds et favorise les attaques de poursuite. |
| `petals` | PÉTALES ET VRILLES | ×0.93 | ×0.96 | ×0.92 | 0.82 | ×0.94 | ×0.9 | La flore réagit aux combattants et se densifie pendant la bascule. |
| `ritualStone` | PIERRE RITUELLE | ×0.97 | ×0.94 | ×0.94 | 0.83 | ×1.02 | ×0.88 | Les marques rituelles amplifient la jauge et les phases de boss. |
| `unstable` | STRUCTURE INSTABLE | ×0.95 | ×0.94 | ×0.98 | 0.87 | ×1.14 | ×0.9 | Le décor cède sous les impacts lourds et augmente le recul. |
| `narrow` | COULOIR ÉTROIT | ×0.95 | ×0.88 | ×0.84 | 0.84 | ×0.82 | ×1.02 | Les murs réduisent l’espace de recul et rendent les saisies plus dangereuses. |
| `void` | ESPACE IMPOSSIBLE | ×0.92 | ×1.06 | ×1.02 | 0.88 | ×1.06 | ×0.86 | La géométrie altère brièvement la gravité et les distances. |
| `ash` | CENDRES ET GRILLE | ×0.96 | ×0.96 | ×0.96 | 0.83 | ×1.02 | ×0.92 | La cendre masque les appuis et accompagne les transformations industrielles. |

## Bascule des mondes

| ID | Nom | Signal | Durée | Seuil | Radio | Description |
|---|---|---|---:|---:|---:|---|
| `rust` | ROUILLE INDUSTRIELLE | SIRÈNE | 150 f | 58% | ×1.12 | La matière se dénude en grille, métal, sang séché et pulsations rouges. |
| `decay` | DÉCOMPOSITION HUMIDE | BATTEMENT SOURD | 170 f | 55% | ×1.06 | La surface familière se dégrade, noircit et révèle un espace gorgé d’eau ou de moisissure. |
| `flesh` | MÉTAMORPHOSE ORGANIQUE | VENTILATION | 155 f | 60% | ×1.1 | Les parois deviennent chair, tuyaux et membranes, sans copier une texture officielle. |
| `haunting` | HANTISE DE LA PIÈCE | GRÉSILLEMENT | 180 f | 52% | ×1.18 | L’espace se contamine par les victimes, les murs et les objets hantés. |
| `mirror` | PASSAGE PAR LE MIROIR | VERRE FISSURÉ | 118 f | 62% | ×1.05 | Le reflet se fracture et remplace progressivement la version normale du lieu. |
| `ice` | PRISE DE GLACE | CRAQUEMENT | 120 f | 64% | ×0.72 | Le cauchemar se fige, bleuit et transforme la poursuite en glissade froide. |
| `storm` | ORAGE ET DÉLUGE | TONNERRE | 145 f | 57% | ×1.08 | La pluie, les éclairs et l’eau envahissent progressivement l’espace. |
| `elemental` | RÉÉCRITURE DU LIVRE | PAGE DÉCHIRÉE | 135 f | 60% | ×0.88 | La zone adopte l’élément de la page active et ses effets de terrain. |
| `loop` | BOUCLE 204863 | COUP À LA PORTE | 96 f | 66% | ×1.25 | L’éclairage, la géométrie et les apparitions se répètent avec de légères divergences. |
| `floral` | FLORAISON DU TRAUMA | PÉTALES | 140 f | 60% | ×0.9 | Pétales, racines et masses florales envahissent le lieu en réponse au combat. |
| `shrine` | PROCESSION DU SANCTUAIRE | CLOCHE RITUELLE | 165 f | 56% | ×0.76 | Lanternes, marques, bois sacré et floraison composent un Otherworld rituel japonais. |
| `ash` | CENDRES ET DÉCOLLEMENT | SIRÈNE INDUSTRIELLE | 145 f | 60% | ×1.15 | La cendre tombe pendant que les couches de surface se détachent vers le métal brûlé. |
| `ritual` | PORTE DU TRAUMA | CHANT BAS | 160 f | 56% | ×1.02 | Les symboles et silhouettes accumulées ouvrent un espace de jugement partagé. |
| `signal` | RUPTURE DU SIGNAL | CRTV | 112 f | 62% | ×1.4 | Le CRTV et les parasites réécrivent les volumes sans transformer le lieu en Otherworld rouillé générique. |
| `void` | EFFONDREMENT DU VIDE | ASPIRATION | 126 f | 55% | ×1.12 | La perspective s’étire et les sorties se replient vers un centre impossible. |

## Déclencheurs contextuels

- `time-or-first-heavy-impact` : premier impact lourd, rupture d’armure, rebond au sol ou délai initial du lieu.
- `otherworld-halfway` : transformation du monde arrivée à mi-course.
- `low-health-or-late-round` : vitalité critique ou dernier quart du temps réglementaire.
- `director-cadence` : repli autonome quand aucun déclencheur contextuel ne s’active.

Les événements conservent leur télégraphie et leur zone évitable ; le snapshot mémorise la cause du déclenchement.

## Événements environnementaux

| ID | Nom | Durée | Danger lié | Terrain temporaire | Message |
|---|---|---:|---|---|---|
| `powerFailure` | PANNE GÉNÉRALE | 150 f | Aucun | Aucun | LES LUMIÈRES S’ÉTEIGNENT |
| `sirenCall` | APPEL DE LA SIRÈNE | 130 f | Aucun | Aucun | LA SIRÈNE APPELLE |
| `lockerSlam` | COULOIR DES CASIERS | 100 f | CLAQUEMENT DE CASIERS | Aucun | LES CASIERS RÉPONDENT |
| `gurneyRush` | CHARIOT SANS INFIRMIER | 110 f | CHARIOT LANCÉ | Aucun | UN CHARIOT TRAVERSE LE SERVICE |
| `corridorCollapse` | EFFONDREMENT DU PASSAGE | 115 f | RUPTURE DE CHAUSSÉE | Aucun | LE PASSAGE SE DÉCHIRE |
| `carouselStart` | DERNIER TOUR | 145 f | COURONNE DU MANÈGE | Aucun | LE MANÈGE REDÉMARRE |
| `trainRumble` | RAME FANTÔME | 125 f | PASSAGE DE LA RAME | Aucun | UNE RAME APPROCHE |
| `steamRelease` | PURGE DES CONDUITES | 90 f | PURGE DE VAPEUR | Aucun | LES CONDUITES PURGENT |
| `waterRise` | MONTÉE DES EAUX | 160 f | VAGUE D’EAU NOIRE | flooded | L’EAU MONTE |
| `mirrorTurn` | REFLET INVERSÉ | 118 f | FRACTURE DU REFLET | Aucun | LE REFLET BOUGE AVANT VOUS |
| `rootWake` | RACINES ÉVEILLÉES | 130 f | PRISE DES RACINES | petals | LES RACINES CHERCHENT UN CORPS |
| `spotlightHunt` | FAISCEAU DE SURVEILLANCE | 125 f | Aucun | Aucun | LE FAISCEAU VOUS CHERCHE |
| `crtvLock` | SIGNAL CRTV | 112 f | Aucun | Aucun | LE SIGNAL SE VERROUILLE |
| `bellToll` | CLOCHE DU JUGEMENT | 118 f | Aucun | Aucun | LA CLOCHE COMPTE LES FAUTES |
| `voidPull` | ATTRACTION DU VIDE | 120 f | ATTRACTION DU VIDE | void | LE VIDE TIRE SUR LE SOL |
| `ashFall` | CHUTE DE CENDRES | 150 f | PLUIE DE CENDRES | ash | LA CENDRE RECOUVRE LE SOL |
| `portraitWatch` | REGARDS SUR LE MUR | 105 f | Aucun | Aucun | LES PORTRAITS VOUS SUIVENT |
| `elevatorCall` | APPEL D’ÉTAGE | 100 f | CHUTE D’ASCENSEUR | Aucun | L’ASCENSEUR ARRIVE VIDE |
| `roomBreath` | RESPIRATION DE LA PIÈCE | 135 f | CONTRACTION DE LA PIÈCE | Aucun | LA PIÈCE RESPIRE |
| `stormSurge` | FRONT D’ORAGE | 135 f | IMPACT DE FOUDRE | wetConcrete | L’ORAGE COUPE LA ROUTE |
| `iceLock` | PRISE DU GEL | 130 f | FISSURE DE GLACE | ice | LA GLACE PREND LE SOL |
| `ritualWake` | RÉPONSE DU RITUEL | 145 f | FERMETURE DU SCEAU | ritualStone | LE RITUEL RÉPOND |
| `referenceLightReply` | VOYANT DU PALIER | 100 f | Aucun | Aucun | LE VOYANT RÉPOND |
| `referenceDustRelease` | POUSSIÈRE DU PLÂTRE | 130 f | Aucun | Aucun | LE PLÂTRE FRÉMIT |
| `referenceSteamPurge` | ROBINET DU PASSAGE | 108 f | Aucun | Aucun | TROIS PURGES AU FOND DU PASSAGE |
| `referenceCellReply` | PORTE DE CELLULE | 96 f | Aucun | Aucun | UNE PORTE VIBRE AU FOND |
| `referenceClosedDoorReply` | PORTE DU LOUNGE | 100 f | Aucun | Aucun | LE BATTANT RESTE FERMÉ |
| `referenceWashroomReply` | TROU DE LA SALLE DE BAIN | 108 f | Aucun | Aucun | UNE LUEUR DANS LE PASSAGE |
| `referenceRailingReply` | RAMPE DE L’ESCALIER | 104 f | Aucun | Aucun | UNE VIBRATION DANS LA RAMPE |
| `referenceMallGrateReply` | GRILLE DU CENTRE COMMERCIAL | 112 f | Aucun | Aucun | LE TREILLIS REPREND SA FORME |
| `referenceSupportReply` | SUPPORT DE L’ATRIUM | 116 f | Aucun | Aucun | UN SUPPORT FRÉMIT AU FOND |
| `referencePoliceBarsReply` | BARREAUX DU COMMISSARIAT | 100 f | Aucun | Aucun | LES BARREAUX RESTENT FERMÉS |
| `referenceGateReply` | PORTE DE COURSIVE | 108 f | Aucun | Aucun | LA PORTE VIBRE SUR SES GONDS |
| `referenceBarkReply` | ÉCORCE DE FOND | 116 f | Aucun | Aucun | UNE POUSSIÈRE D’ÉCORCE TOMBE |
| `referenceEarthBlockReply` | BLOC DE LA GALERIE | 106 f | Aucun | Aucun | LE BLOC RESTE EN PLACE |
| `referenceHookReply` | CROCHET DE LA CHAMBRE FROIDE | 110 f | Aucun | Aucun | LE CROCHET OSCILLE SUR SON RAIL |

## Doctrine par arène

| Arène | Terrain | Bascule | Événements | Déclencheurs | Dangers | Animations | Base lore |
|---|---|---|---|---|---|---:|---|
| MIDWICH ELEMENTARY | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 1 | École de SH1 avant la traversée de l’horloge ; séparer de Nightmare School. |
| ALCHEMILLA HOSPITAL | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 1 | Alchemilla de SH1, état hospitalier initial ; ne pas employer les couloirs de Brookhaven. |
| OLD SILENT HILL | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 1 | Rues du premier quartier de SH1 ; brouillard et neige distincts de la cendre du film. |
| NOWHERE | CAILLEBOTIS MÉTALLIQUE | fixed-altered — aucune bascule | APPEL DE LA SIRÈNE | IMPACT LOURD / PREMIER TEMPS |  | 1 | Espace composite sans carte de SH1 ; choisir les salles exactes avant assemblage. |
| LAKESIDE AMUSEMENT PARK | PLATEAU DU MANÈGE SH1 | fixed-normal — aucune bascule |  |  |  | 0 | Parc de SH1 et manège de Cybil ; distinguer explicitement le parc de SH3. Vue retenue : manège de Cybil SH1 original, distinct du Happy Carousel SH3. Rotation de fond lente et un cheval fixe sont une proposition versus ; pas Cybil, gaz/énigme 12 chevaux SH3, grande roue extérieure dans la même vue. Sculptures/caméra interprétées, matériau/humidité non déterminés. |
| WOOD SIDE APARTMENTS | MOQUETTE HUMIDE | fixed-normal — aucune bascule |  |  |  | 0 | Wood Side original 2001 ; éclairage et architecture du remake ne sont pas interchangeables. |
| BLUE CREEK — STAIRWELL | PALIER DE L’ESCALIER | fixed-normal — aucune bascule | RAMPE DE L’ESCALIER | IMPACT LOURD À PROXIMITÉ |  | 0 | Cage d’escalier du premier duel Pyramid Head, SH2 original. |
| BROOKHAVEN — BASEMENT | SEUIL DE L’ASCENSEUR B1 | fixed-altered — aucune bascule |  |  |  | 0 | SH2 original2001 : extrémité du couloir Otherworld B1 de Brookhaven, devant l’ascenseur pendant la poursuite de Pyramid Head. Le guide décrit une cutscène puis la remontée vers le premier étage ; la capture de cabine montre l’état après fermeture. Le maintien des portes entrouvertes avant cette fermeture est une suspension adaptée au versus, sans capture prouvant cette ouverture ni cycle original mesuré. Aucun trajet vers le lobby, décès de Maria ou poursuivant n’est rejoué automatiquement. Dimensions, caméra et battement des portes restent à comparer aux captures originales. |
| TOLUCA PRISON | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule | PORTE DE CELLULE | IMPACT LOURD À PROXIMITÉ |  | 0 | Prison de SH2 original ; séparer les blocs de cellules et la cour du gibet. Séparer cour du gibet et blocs de cellules ; trois cordes attestées au gibet, réactions et balancement restent des propositions de versus. |
| THE LABYRINTH | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 0 | Labyrinthe de SH2 original ; la salle d’Abstract Daddy et le cube sont des sous-lieux distincts. Labyrinthe souterrain fermé ; le cube oriente les passages dans l’œuvre. Sa rotation décorative du versus ne remappe pas le sol actif et ses visages ne sont pas reproduits. |
| LAKEVIEW HOTEL — OTHERWORLD | BÉTON TREMPÉ | fixed-altered — aucune bascule | POUSSIÈRE DU PLÂTRE | IMPACT LOURD À PROXIMITÉ |  | 1 | État ruiné du Lakeview après la cassette, SH2 original. |
| CENTRAL SQUARE — HELEN’S BAKERY | SOL DU CENTRE COMMERCIAL | fixed-normal — aucune bascule |  |  |  | 0 | Central Square Shopping Center de SH3 avant son état Nightmare. Vue retenue : Helen’s Bakery normale à l’étage2, avant le basculement Nightmare ; petit comptoir des pinces près de la porte, plateaux de pains, rayonnages métalliques et carrelage documentés par deux vues concordantes et le plan du guide. Ne pas importer le lance-flammes réservé à Extra New Game ni un personnage de la capture. Les anciennes propositions de rideau/vitrine/enseigne décrivent le centre commercial général et restent hors du cadre de cette pièce ; aucune animation originale, dimension ou caméra 1:1 n’est validée. |
| BROOKHAVEN — FLOODED ROOM | BÉTON SEC | fixed-altered — aucune bascule |  |  |  | 1 | Salle d’eau du boss Leonard sous Brookhaven Otherworld, SH3. |
| THE CHURCH | PIERRE RITUELLE | fixed-normal — aucune bascule |  |  |  | 0 | Église du culte dans SH3 ; chapelle, passages de mémoire et fosse finale à distinguer. Vue retenue : chapelle SH3 avec autel, vitraux et cierges ; séparer les passages mémoire et fosse finale. Inclinaison synchrone des flammes = proposition versus. |
| DAISY VILLA ROOFTOP | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 0 | Toit Daisy Villa du combat Missionary de SH3. |
| SEWER CHANNEL | PASSERELLE DU CANAL | fixed-normal — aucune bascule |  |  |  | 0 | Canal du piège Sewer Creature dans SH3 ; garder la créature majoritairement sous l’eau. Vue retenue : passerelle du canal APRÈS usage du sèche-cheveux, car le câble n’est installé qu’à ce moment. Eau sous la passerelle, sans ennemi vivant réintroduit ni courant électrique jouable. Vibrations du câble/remous proposés, pas plateau de duel inondé. |
| ROOM 302 | PLANCHER ANCIEN | fixed-normal — aucune bascule | TROU DE LA SALLE DE BAIN | IMPACT LOURD À PROXIMITÉ |  | 0 | Appartement de Henry au début de SH4 ; les hantises tardives demandent une variante. Appartement initial : ouverture fixe de la salle de bain ; la lueur après impact est proposée, sans téléportation du duel ni hantise tardive. |
| SUBWAY WORLD | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 1 | Subway World de SH4 ; trains traversables et escalator avec Wallmen. Vue retenue : premier passage, quai Lynch Street et voitures arrêtées aux portes commandées par bouton rouge ; ni escalator/Wallmen, ni arrivée du train de Hazel Street SH3. Le cycle visuel du panneau est une proposition versus, pas un automatisme du récit. |
| WATER PRISON WORLD | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 0 | Tour-prison de SH4 : cellules autour d’un axe et mécanismes hydrauliques. Vue retenue : B2 Waterwheel Room et son mécanisme vu depuis la coursive sèche ; axe vertical et roue dans le plan horizontal à garder, cellules pivotantes et vanne du toit hors cadre. Rotation lente proposée pour le versus, aucun déclenchement de vanne ou déplacement du sol. |
| APARTMENT WORLD | MOQUETTE HUMIDE | fixed-normal — aucune bascule |  |  |  | 0 | South Ashfield Heights de SH4 vu depuis les couloirs et logements. |
| HOSPITAL WORLD | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 1 | Hôpital de SH4 aux chambres d’étage variables ; ne pas réutiliser un plan Brookhaven. Vue retenue : couloir des chambres au 2e étage, sans chambre de tête géante ni lits. Le fauteuil abstrait de fond est la proposition versus ; les Wheelchairs sont des ennemis dans SH4, leurs dégâts/IA ne sont pas importés par cette piste décorative. Aucun réarrangement des pièces actives. |
| CEDAR GROVE SANITARIUM | BÉTON SEC | PASSAGE PAR LE MIROIR — transition versus autorisée |  |  |  | 1 | Cedar Grove Sanitarium; préciser pièce retenue, ne pas assimiler tout le bâtiment à la cellule d’Helen. |
| RIVERSIDE MOTEL | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 0 | Riverside Motel; cuisine du Butcher et chambre500 de Richard sont des sous-lieux distincts. |
| SHEPHERD’S GLEN | TROTTOIR DU PANNEAU | fixed-normal — aucune bascule |  |  |  | 0 | Ville de Shepherd’s Glen; cadrage de rue à définir. |
| GRAND HOTEL | SOL DE L’ATRIUM | fixed-normal — aucune bascule | SUPPORT DE L’ATRIUM | IMPACT LOURD À PROXIMITÉ |  | 1 | Grand Hotel et rencontre Sepulcher; ne pas reproduire Lakeview. |
| FROZEN SCHOOL | GLACE DU CAUCHEMAR | fixed-altered — aucune bascule |  |  |  | 0 | Midwich dans Shattered Memories; cauchemar glacé, pas école Otherworld rouillée1999. |
| OVERLOOK PENITENTIARY | COURSIVE BLOCK A | fixed-normal — aucune bascule | PORTE DE COURSIVE | IMPACT LOURD À PROXIMITÉ |  | 0 | Overlook Penitentiary version Downpour; ne pas reprendre le plan de Homecoming. Vue retenue : coursive BlockA de la prison normale Downpour, avant la cellule transformée en couloir inondé. Ombres des barreaux proposées pour le versus ; tours extérieures, showers/crime scene, workshop flooding et PrisonHC séparés. |
| LITTLE BARONESS | EAU STAGNANTE | fixed-normal — aucune bascule |  |  |  | 1 | Little Baroness; conserver l’époque et le point de vue du bateau choisi. |
| BOOK OF MEMORIES — NEXUS | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Nexus est appellation de hub du projet; sept zones sont attestées, Nexus comme lieu canon reste à prouver. |
| 204863 — LOOPING HALL | COULOIR ÉTROIT | fixed-normal — aucune bascule | PANNE GÉNÉRALE | IMPACT LOURD / PREMIER TEMPS |  | 1 | Couloir bouclé de P.T.; 204863 est un motif sonore, pas adresse attestée. |
| KETTENSTADT VILLA | PÉTALES ET VRILLES | fixed-normal — aucune bascule |  |  |  | 1 | Complexe abandonné The Villa dans Kettenstadt; couloirs et appartements à différencier. |
| EBISUGAOKA — MAIN STREET | BÉTON TREMPÉ | PROCESSION DU SANCTUAIRE — transition versus autorisée |  |  |  | 0 | Ebisugaoka; Japon années1960, rue exacte à fixer. |
| DARK SHRINE | PIERRE RITUELLE | fixed-altered — aucune bascule |  |  |  | 0 | Dark Shrine attesté; une seule arène ne résume pas corridors, hall et final path. |
| EBISUGAOKA MIDDLE SCHOOL | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Ecole d’Ebisugaoka : nom/cadrage précis à recouper sur plan de chapitre. |
| HINAKO’S HOME | PLANCHER ANCIEN | fixed-normal — aucune bascule |  |  |  | 1 | Maison Shimizu; doublon de lieu avec shimizu_residence, cadrage distinct seulement. |
| FESTIVAL SQUARE | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Place de festival : nom éditorial non confirmé par référence consultée. |
| FIRE ZONE | PASSAGE DEVANT LES GRILLES FIRE | fixed-altered — aucune bascule |  |  | PLUIE DE CENDRES | 0 | Zone Fire attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : deux vues de la galerie datée16octobre2012 montrent des sols et parois industriels, grilles et lueurs chaudes. Elles guident un cadre de salle adapté au versus sans identifier toute la géométrie procédurale ; personnages, HUD, attaques et dangers des captures sont exclus. |
| WOOD ZONE | CLAIRIÈRE WOOD | fixed-altered — aucune bascule | ÉCORCE DE FOND | IMPACT LOURD À PROXIMITÉ | PRISE DES RACINES | 0 | Zone Wood attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : la vue de galerie datée16octobre2012 montre une arène terreuse avec branches nues et pierres près du Wood Guardian. Le prototype peut reprendre les matériaux visibles sans importer le boss, ses rejetons, leur zone de contact ou une disposition procédurale prétendue fixe. |
| LIGHT ZONE | PIERRE RITUELLE | fixed-altered — aucune bascule |  |  |  | 0 | Zone Light attestée dans Book of Memories; salle procédurale précise à choisir. |
| WATER ZONE | EAU STAGNANTE | fixed-altered — aucune bascule | MONTÉE DES EAUX | MI-CHEMIN OTHERWORLD | VAGUE D’EAU NOIRE | 0 | Zone Water attestée dans Book of Memories; salle procédurale précise à choisir. |
| EARTH ZONE | PASSAGE DE LA GALERIE EARTH | fixed-altered — aucune bascule | BLOC DE LA GALERIE | IMPACT LOURD À PROXIMITÉ | CHUTE DE DÉBRIS | 0 | Zone Earth attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : la vue de galerie datée6juin2012 montre une pièce sombre avec matériaux terreux, bois et récipients. Il s’agit d’une préversion ; ni pièce finale, ni disposition, mouvement ou physique de la version commerciale ne sont confirmés. Aucun personnage, arme, HUD ou danger ne doit être importé. |
| BLOOD ZONE | BORD DES PLATEFORMES BLOOD | fixed-altered — aucune bascule |  |  | MARÉE DE SANG | 0 | Zone Blood attestée dans Book of Memories; salle procédurale précise à choisir. |
| STEEL ZONE | CAILLEBOTIS MÉTALLIQUE | fixed-altered — aucune bascule |  |  | BALAYAGE DE CHAÎNES | 0 | Zone Steel attestée dans Book of Memories; salle procédurale précise à choisir. |
| GREEN LION ANTIQUES | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 0 | Green Lion Antiques, séquence du Flauros Demon; emplacement final documenté par guide. |
| CHURCH OF THE HOLY WAY | PIERRE RITUELLE | fixed-normal — aucune bascule |  |  |  | 0 | Nom à corriger : Church of the Holy Way dans Silent Hill, pas église de Shepherd’s Glen. |
| UNDERGROUND LAIR | BOUE ET RACINES | fixed-normal — aucune bascule |  |  |  | 0 | Underground/Lair; installation de l’Ordre, scène finale Amnion. |
| MIDWICH — FILM OTHERWORLD | CENDRES ET GRILLE | fixed-altered — aucune bascule | APPEL DE LA SIRÈNE | MI-CHEMIN OTHERWORLD |  | 2 | Ecole Midwich du film2006; sanitaires Colin et couloir Pyramid distincts. |
| HÔPITAL DU FILM — CHAMBRE D’ALESSA | SOL DE LA CHAMBRE D’ALESSA | fixed-normal — aucune bascule |  |  |  | 0 | Film Silent Hill de Christophe Gans2006 : chambre hospitalière d’Alessa, lit sous voile de tente médicale, parois carrelées abîmées et grille de sol visibles dans deux photos concordantes. Aucune preuve n’attribue le nom Brookhaven à cette pièce ; le catalogue conserve cet ancien libellé historique sans le transférer à la scène choisie. Pièce distincte du couloir des Dark Nurses ; aucune personne, apparition, attaque ou séquence de soin importée. Mouvement du voile, caméra et géométrie restent des adaptations à comparer, sans fidélité1:1 certifiée. |
| CHURCH OF THE ORDER | ALLÉE DES CIERGES | fixed-normal — aucune bascule | APPEL DE LA SIRÈNE | IMPACT LOURD / PREMIER TEMPS |  | 0 | Eglise du film2006 et communauté Christabella; distinguer sa secte des versions jeux. |
| SANCTUARY — REVELATION | BOUE ET RACINES | fixed-normal — aucune bascule |  |  |  | 0 | Sanctuaire du duel final de Revelation2012; séparer église2006. |
| HOPE’S JUNCTION | BÉTON TREMPÉ | PORTE DU TRAUMA — transition versus autorisée |  |  |  | 1 | Hope’s Junction en Pennsylvanie; choisir quartier et branche canonique. |
| STILLEDALEN WOODS | BÉTON TREMPÉ | PORTE DU TRAUMA — transition versus autorisée |  |  |  | 1 | Stilledalen en Norvège; forêt, ferme et village ne sont pas interchangeables. |
| ASCENSION — OPEN GATE | PIERRE RITUELLE | fixed-altered — aucune bascule |  |  |  | 1 | Seuil collecté/ouvert par le Collector; OPEN GATE est un titre d’arène du projet. |
| ALCHEMILLA — NIGHTMARE WARD | CAILLEBOTIS MÉTALLIQUE | fixed-altered — aucune bascule | APPEL DE LA SIRÈNE | MI-CHEMIN OTHERWORLD |  | 3 | Alchemilla Otherworld de SH1, avec le Bloodsucker de la chambre 204. |
| MIDWICH — NIGHTMARE SCHOOL | DALLE AUTOUR DU FOYER | fixed-altered — aucune bascule |  |  |  | 0 | École Otherworld de SH1 ; la chaufferie mène à Split Head. Vue retenue : arène de la chaufferie Otherworld, foyer ouvert central entouré de grilles, documenté dans captures sh1_boss_split_head_lizard/sh1_b01_01. Braises lumineuses contenues proposées pour le versus ; ni casiers/classes, sirène répétée, pluie de braises ou Split Head ajouté. Passage de duel devant le foyer et caméra adaptés, collisions non certifiées. |
| CENTRAL SILENT HILL — OTHERWORLD | STRUCTURE INSTABLE | fixed-altered — aucune bascule |  |  |  | 1 | Centre Otherworld de SH1 : galerie commerciale et toit associés à deux états du boss insecte. |
| SEWERS TO THE RESORT | EAU STAGNANTE | fixed-normal — aucune bascule |  |  |  | 1 | Égouts qui conduisent à la zone touristique dans SH1. |
| SOUTH VALE STREETS | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 1 | South Vale Est de SH2 original ; préciser rue exacte et limites de parcours. |
| BROOKHAVEN — ROOFTOP | PLATEAU DU TOIT BROOKHAVEN | fixed-normal — aucune bascule |  |  |  | 0 | Toit de Brookhaven dans SH2 original ; évènement Pyramid Head lié au récit. |
| SILENT HILL HISTORICAL SOCIETY | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 1 | Bâtiment et descente de la Historical Society de SH2 original. Vue retenue : salles d’exposition du musée ; reflet de vitrage en proposition versus, sans reproduire ni animer le contenu d’un tableau officiel, escalier/puits séparés. |
| LABYRINTH — MEAT LOCKER | SOL DE LA CHAMBRE FROIDE | fixed-normal — aucune bascule | CROCHET DE LA CHAMBRE FROIDE | IMPACT LOURD À PROXIMITÉ |  | 0 | Libellé à corriger : la chambre froide du combat Eddie termine le Labyrinthe ; ne pas affirmer une salle ordinaire de Toluca Prison. |
| LAKEVIEW HOTEL — LOBBY | TAPIS DU LOBBY | fixed-normal — aucune bascule |  |  |  | 0 | Vue retenue : lobby intact du Lake View original, avant le visionnage de la cassette en312 (normal-lobby-before-video). Le guide situe le meuble musical près de l’escalier ; deux vues montrent portes vitrées, boiseries et tapis rouge. Ce cadrage de pièce est documenté, sans trancher l’interprétation globale Fog/Memory de l’hôtel. Dimensions, échelle, caméra et sol masqué restent à comparer ; leur adaptation au versus ne vaut pas mesure du jeu. Réception adjacente, piano du restaurant, TV/cassette de312 et transformation Nightmare restent hors cadre. Les anciennes propositions de transition/cassette sont conservées au dossier et inactives dans cette scène ; aucune transition automatique n’est validée. Aucune clôture artistique ni certification1:1. |
| BALDWIN MANSION | PLANCHER ANCIEN | fixed-normal — aucune bascule | PORTE DU LOUNGE | IMPACT LOURD À PROXIMITÉ |  | 1 | Manoir de Born from a Wish, campagne Maria de SH2 original. Vue retenue : palier devant la porte du Lounge d’Ernest, gardée fermée ; la bougie attestée au grenier ne doit pas être transportée ici. Réaction du battant = adaptation versus après impact local, sans corps. |
| CENTRAL SQUARE — NIGHTMARE MALL | PALIER DES SIX TUNNELS | fixed-altered — aucune bascule | PANNE GÉNÉRALE, GRILLE DU CENTRE COMMERCIAL | IMPACT LOURD / PREMIER TEMPS, IMPACT LOURD À PROXIMITÉ |  | 1 | Centre commercial Otherworld de SH3, comprenant l’arène souterraine de Split Worm. |
| HAZEL STREET SUBWAY | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule | RAME FANTÔME, PANNE GÉNÉRALE | IMPACT LOURD / PREMIER TEMPS, MI-CHEMIN OTHERWORLD | PASSAGE DE LA RAME | 1 | Station Hazel Street de SH3 ; danger des voies distinct du métro SH4. |
| UNDERPASS | EAU STAGNANTE | fixed-normal — aucune bascule | ROBINET DU PASSAGE | IMPACT LOURD À PROXIMITÉ |  | 1 | Couloirs et locaux techniques avant le canal de SH3 ; sous-zone distincte du stage sewers. |
| HILLTOP CENTER | MOQUETTE HUMIDE | fixed-normal — aucune bascule |  |  |  | 1 | Hilltop Center initial de SH3 ; bureaux, commerces et objets de travail. Store attesté dans le bureau/réception de Monica’s Dance Studio, capture sh3_07_hilltop_center_map_location.jpg ; la vue retient cette pièce normale, sans atelier ni baignoire/Otherworld. Oscillation = proposition versus. |
| HILLTOP CENTER — OTHERWORLD | CAILLEBOTIS MÉTALLIQUE | fixed-altered — aucune bascule |  |  |  | 1 | Hilltop Otherworld de SH3, avec le Glutton comme obstacle de progression. |
| BROOKHAVEN — NIGHTMARE HOSPITAL | BÉTON SEC | fixed-altered — aucune bascule |  |  |  | 1 | Brookhaven Otherworld de SH3 ; salle au miroir isolée du bassin Leonard. |
| LAKESIDE AMUSEMENT PARK — SH3 | PLATEAU DU HAPPY CAROUSEL | fixed-normal — aucune bascule |  |  |  | 0 | Parc de SH3 et carrousel de Memory of Alessa ; distinct du boss Cybil de SH1. Vue retenue : Happy Carousel SH3 AVANT sa transition et Memory of Alessa ; trois sculptures visibles sur mâts fixes interprètent une partie des douze chevaux. Va-et-vient proposé, ni gaz nocif/puzzle/Alessa ou Cybil ajouté. Plateau couvert distinct du béton humide extérieur ; physique et caméra non certifiées. |
| FOREST WORLD | BOUE ET RACINES | fixed-normal — aucune bascule |  |  |  | 0 | Forêt du premier passage SH4 ; séparer de Wish House brûlée au retour. Vue retenue : sentier/clairière arborée du premier passage, sans façade Wish House ni incendie du retour ; vent des herbes et branches proposé pour le versus. |
| BUILDING WORLD | PALIER DU GRAND VENTILATEUR | fixed-normal — aucune bascule |  |  |  | 0 | Building World de SH4, assemblage de toits et commerces. |
| OUTSIDE ROOM 302 | MOQUETTE HUMIDE | fixed-altered — aucune bascule |  |  |  | 0 | Dernier parcours autour de 302 dans SH4, altéré après les retours. |
| WISH HOUSE | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Wish House existe avant puis après l’incendie ; l’état du stage doit être choisi explicitement. |
| 21 SACRAMENTS — FINAL CHAMBER | CAILLEBOTIS MÉTALLIQUE | fixed-altered — aucune bascule |  |  |  | 1 | Chambre finale SH4 : Walter mobile, Conjurer fixé et Eileen soumis au rituel. |
| ALCHEMILLA HOSPITAL — ORIGINS | BÉTON SEC | PASSAGE PAR LE MIROIR — transition versus autorisée |  |  |  | 2 | Alchemilla Hospital dans Origins; garder plans2007 et miroir propre à cette œuvre. |
| ARTAUD THEATER | PLATEAU DE LA SCÈNE ARTAUD | fixed-normal — aucune bascule |  |  |  | 0 | Artaud Theater, Origins : plateau normal après pose et activation des quatre ampoules du catwalk, puis lever du rideau depuis Curtain Control. Le guide distingue ensuite les configurations commandées par leviers et le passage du grand miroir, dont l’état menant au combat Caliban ; le prototype ne fusionne pas ces états. Éclairage fixe de la scène documenté, balayage cyclique et caméra du versus non mesurés. |
| ARTAUD THEATER — NIGHTMARE | PLANCHER ANCIEN | fixed-altered — aucune bascule |  |  |  | 0 | Variation Otherworld d’Artaud; même théâtre, géométrie d’arène à reconstruire. |
| ALCHEMILLA — HOMECOMING NIGHTMARE | COULOIR DU RÊVE INITIAL | fixed-normal — aucune bascule | PANNE GÉNÉRALE | MI-CHEMIN OTHERWORLD |  | 1 | Cauchemar Alchemilla de Homecoming, avant le réveil d’Alex. |
| SHEPHERD’S GLEN POLICE STATION | SOL DE LA CELLULE | fixed-normal — aucune bascule | PANNE GÉNÉRALE, BARREAUX DU COMMISSARIAT | IMPACT LOURD / PREMIER TEMPS, IMPACT LOURD À PROXIMITÉ |  | 1 | Commissariat de Shepherd’s Glen. |
| SHEPHERD’S GLEN TOWN HALL | COULOIR ÉTROIT | fixed-normal — aucune bascule |  |  |  | 1 | Town Hall de Shepherd’s Glen; plans publics et passage de retour distincts. Vue retenue : premier passage normal, salle centrale publique avec podium et livre d’histoire derrière ; sous-sol et cérémonie de retour hors cadre. Lueur du pupitre proposée pour le versus, sans action du Founders Key. |
| OVERLOOK PENITENTIARY | COURSIVE CELL BLOCK B | fixed-normal — aucune bascule | PANNE GÉNÉRALE, PORTE DE COURSIVE | MI-CHEMIN OTHERWORLD, IMPACT LOURD À PROXIMITÉ |  | 1 | Nom à corriger : Overlook Penitentiary; même établissement nommé dans le guide Homecoming. |
| SHEPHERD HOUSE — ATTIC | PLANCHER ANCIEN | fixed-normal — aucune bascule |  |  |  | 1 | Grenier Shepherd House; état Otherworld dépend de l’étape. Vue retenue : grenier normal avant la conversation avec Lillian et la transformation ; séparer l’état Otherworld du chapitre08. Charpente/poussière sont une interprétation graphique de la proposition versus, pas une géométrie mesurée ; pas de masques/médailles/horloge de l’état altéré importés. |
| SCARLET’S CHAMBER | BOUE ET RACINES | fixed-altered — aucune bascule |  |  |  | 0 | Arène de Scarlet en Hell Descent; Scarlet’s Chamber est un nom éditorial. |
| CURTIS’S JUNKYARD WORKSHOP | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 2 | Atelier junkyard = lieu de rencontre et échange d’arme; ne pas le présenter comme lieu du combat Curtis sans relevé. |
| SILENT HILL — FROZEN STREETS | GLACE DU CAUCHEMAR | fixed-altered — aucune bascule |  |  |  | 0 | Rues dans les séquences gelées SM; cadre d’itinéraire à choisir. |
| FROZEN HOSPITAL | GLACE DU CAUCHEMAR | fixed-altered — aucune bascule |  |  |  | 1 | Hôpital de SM; sélectionner une séquence précise dans la route, sans copier Brookhaven2001. |
| FROZEN MALL | GLACE DU CAUCHEMAR | fixed-altered — aucune bascule |  |  |  | 0 | Centre commercial de Shattered Memories; sous-lieu et phase à relever. |
| LIGHTHOUSE / THERAPY REVELATION | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Phare et révélation thérapeutique sont des lieux/plans différents; l’intitulé actuel les fusionne. |
| DEVIL’S PIT | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 0 | Devil’s Pit; préciser attraction, mine ou arrivée ferroviaire. Vue retenue : cavité intérieure des roues hydrauliques/lift, depuis la coursive sèche ; poutres et conduites de l’illustration du puzzle Water Wheels. Gouttes de traverse proposées pour le versus ; attraction extérieure, cave inondée adjacente et trajet de train hors cadre, aucun puzzle ou pompe automatique. |
| CENTENNIAL BUILDING | MOQUETTE HUMIDE | fixed-normal — aucune bascule |  |  |  | 2 | Centennial Building; séparer archives et salles administratives. |
| ST. MARIA’S MONASTERY | PIERRE RITUELLE | fixed-normal — aucune bascule |  |  |  | 1 | St Maria’s Monastery; cadrage de chapelle, théâtre ou orphelinat à fixer. |
| SILENT HILL — DOWNPOUR STREETS | CHAUSSÉE DE PEARL CREEK | fixed-normal — aucune bascule |  |  |  | 2 | Rues Downpour; la pluie constitue une condition de scène, pas un pouvoir de tous les monstres. |
| DOWNPOUR — VOID CHASE | ESPACE IMPOSSIBLE | fixed-altered — aucune bascule | ATTRACTION DU VIDE | IMPACT LOURD / PREMIER TEMPS | ATTRACTION DU VIDE | 0 | Poursuites du Void; une arène versus fixe serait une adaptation. |
| FULL CIRCLE — ANNE’S CONFRONTATION | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Confrontation finale Anne/Murphy; point de vue et issue dépendent du scénario. |
| THE ARCADE — CITY / JACK’S INN | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 0 | Stage1-1 City; Jack’s Inn documenté comme départ par entrée de parcours. |
| THE ARCADE — BROOKHAVEN HOSPITAL | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 2 | Stage1-2 Brookhaven; premier combat Pyramid Head. |
| THE ARCADE — HOSPITAL ROOF | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 4 | Stage1-3 Brookhaven2/toit de Tuberculosis. |
| THE ARCADE — HISTORICAL SOCIETY | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 1 | Stage2-1 Historical Society. |
| THE ARCADE — TOLUCA PRISON | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 2 | Stage2-2 Toluca Prison; rencontre Split Worm. |
| THE ARCADE — UNDERGROUND GRAVEYARD | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Le guide nomme Stage2-3 Under Ground Basement; terme Underground Graveyard du projet à corroborer. |
| THE ARCADE — TOLUCA LAKE | EAU STAGNANTE | fixed-normal — aucune bascule |  |  |  | 1 | Stage3-1 Toluca Lake. |
| THE ARCADE — 1918 | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 1 | 1918/1993 est une séquence associée au Phantom, pas deux lieux géographiques. |
| THE ARCADE — 1993 PHANTOM FRONT | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule |  |  |  | 1 | Même séquence finale1918/1993; Phantom Front est une désignation éditoriale. |
| THE ARCADE — SHOPPING MALL | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Centre commercial non retrouvé dans le parcours consulté; ne pas qualifier d’arène canonique Arcade. |
| THE ARCADE — AMUSEMENT PARK | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Parc d’attractions non retrouvé dans le parcours consulté; Robbie ne prouve pas un parc jouable. |
| KETTENSTADT VILLA — ROOFTOP | PÉTALES ET VRILLES | fixed-normal — aucune bascule |  |  |  | 1 | Toit de la Villa; préserver rôle narratif, finisher mortel environnemental non automatique. |
| KETTENSTADT VILLA — STAIRWELL | BÉTON SEC | fixed-normal — aucune bascule | PANNE GÉNÉRALE | MI-CHEMIN OTHERWORLD |  | 1 | Escaliers de la Villa, sous-lieu du complexe. |
| DARK SHRINE — CORRIDORS | PIERRE RITUELLE | fixed-altered — aucune bascule |  |  |  | 2 | Dark Shrine Corridors, entité ressemblant à Sakuko. |
| SHIMIZU RESIDENCE | PLANCHER ANCIEN | fixed-normal — aucune bascule |  |  |  | 3 | Shimizu Residence, rencontre des parents; ne pas confondre avec autre demeure. |
| DARK SHRINE — MAIN HALL | PIERRE RITUELLE | fixed-altered — aucune bascule |  |  |  | 1 | Dark Shrine Main Hall, entité ressemblant à Rinko. |
| EBISUGAOKA — CORRUPTED PROCESSION | PÉTALES ET VRILLES | fixed-altered — aucune bascule |  |  |  | 2 | Ebisugaoka recouvert de flore; Corrupted Procession est intitulé éditorial. |
| RETURN TO SILENT HILL — STREETS | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 1 | Rues Return to Silent Hill2026; pas copie automatique2006. |
| RETURN TO SILENT HILL — BROOKHAVEN | BÉTON SEC | fixed-normal — aucune bascule |  |  |  | 2 | Hôpital film2026; plans de nurses et lit plafond à relever séparément. |
| RETURN TO SILENT HILL — BURNING LAKEVIEW | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Lakeview du film2026 : variation brûlée et scène à vérifier précisément. |
| RETURN TO SILENT HILL — PORTRAIT ROOM | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Portrait Room est nom éditorial; localisation et rapport à l’entité lit à confirmer. |
| ST. AMELIA MARINA | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | St Amelia attestée; appellation Marina et quai précis à relever dans la version commerciale. |
| ST. AMELIA — RESIDENTIAL DISTRICT | BÉTON TREMPÉ | fixed-normal — aucune bascule |  |  |  | 2 | Quartiers résidentiels de St Amelia; rue et enseignes à repérer. |
| ST. AMELIA MEDICAL CENTRE | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Medical Centre : nom du catalogue à corroborer dans carte/plan primaire. |
| CEG TOWER | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Tour de bureaux documentée par critique; nom CEG et étage exact à relever. |
| CLARA WOODS | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Clara Woods : nom non corroboré par sources lues. |
| CLARA WOODS — DIFFERENT | BÉTON SEC | unresolved — aucune bascule |  |  |  | 0 | Variante Different dépend du lieu Clara Woods non confirmé ici. |
| ST. AMELIA — ALTERNATE FACILITY | CAILLEBOTIS MÉTALLIQUE | fixed-normal — aucune bascule | PANNE GÉNÉRALE | MI-CHEMIN OTHERWORLD |  | 2 | Centre de commande/auxiliary room documenté; nom Alternate Facility est éditorial à rapprocher du plan exact. |

## Réactions issues des fiches

Les 97 éléments visuels partiels sont déclarés par leur ID de proposition et leur élément réellement dessiné. Les réactions de lumière, poussière et vapeur utilisent exclusivement `local-heavy-impact` : un choc lourd dans la zone normalisée du lieu. Elles ne produisent aucun dégât, ne démarrent pas par simple cadence et respectent la phase autorisée.

Les états et listes de mécanismes de la fiche sont également vérifiés lors des appels directs du moteur, des transitions de boss et des rites. Une famille de décor ne suffit pas à autoriser un événement.
