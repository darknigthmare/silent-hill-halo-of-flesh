/**
 * Production-reference decisions, kept separate from the source catalogue.
 * A cited proposal is still a proposal. These original Canvas prototypes are
 * not captured footage, canonical timings, accepted artwork or 1:1 geometry.
 * This module is pure: it never reads clocks, RNG, DOM or mutable combat state.
 */
const unique = values => [...new Set(values.filter(Boolean))];
const copy = value => JSON.parse(JSON.stringify(value));
const has = (stage, ...props) => props.some(prop => (stage.props || []).includes(prop));
const unresolved = /non.confirme|non.confirmee|a.identifier|a.documenter|a.corroborer|a.verifier|a.relever|a.fixer|a.preciser|composite.a.separer/;
const INTERIOR = new Set(['school','hospital','apartment','hotel','room','house','hall','office','building','prison','gallery','museum','mall','theater','subway','workshop','sewer','church','lair','otherworld','labyrinth']);
const ALTERED = new Set(['nowhere','hospital_nightmare','midwich_nightmare','central_nightmare','hotel_otherworld','brookhaven_sh2','brookhaven_sh3','nightmare_mall','nightmare_hilltop','nightmare_hospital_sh3','outside_room_302','final_sacrament','nightmare_theater','nightmare_hospital_hc','scarlet_chamber','nightmare_school','frozen_streets','nightmare_hospital_sm','nightmare_mall_sm','otherworld_void','dark_shrine','dark_shrine_corridors','dark_shrine_main','corrupted_ebisugaoka','film_midwich','ascension_otherworld']);
const TRANSITIONS = new Set(['cedar_grove','alchemilla_origins','film_church','ebisugaoka','stilledalen','hope_junction']);
const NARRATIVE_ONLY = new Set(['looping_hall','villa','villa_rooftop','villa_stairwell','final_sacrament','otherworld_void','anne_fight','arcade_1918','arcade_1993']);
const STYLE = Object.freeze({sh1:'rust',sh2:'decay',sh3:'flesh',sh4:'haunting',origins:'mirror',homecoming:'rust',shattered:'ice',downpour:'storm',arcade:'rust',bom:'elemental',pt:'loop',shortmessage:'floral',shf:'shrine',film:'ash',ascension:'ritual',townfall:'signal'});

// Corrections refer to the exact ID/media. Similar names never transfer a rule.
const ENVIRONMENT = Object.freeze({
  old_silent_hill: {weather:'snow'},
  church_hc: {name:'CHURCH OF THE HOLY WAY',weather:'dust'},
  prison_hc: {name:'OVERLOOK PENITENTIARY'},
  prison_meat_locker: {name:'LABYRINTH — MEAT LOCKER',weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['cells','watchtower','chains']},
  brookhaven_sh2:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['ward','curtains','monitor','beds','cages']},
  alchemilla: {weather:'dust',disabledEvents:{referenceLightReply:'Salle d’attente normale retenue ; le voyant de l’ascenseur appartient à un autre sous-lieu.'}}, nowhere:{weather:'flicker'}, central_nightmare:{weather:'dust'},
  lakeside_amusement:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['wheel','booths']},
  lakeside_sh3:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['wheel','booths']},
  midwich_nightmare:{weather:'dust',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['lockers','chains','ceiling-lights']},
  sewers:{weather:'dust',fog:0,terrain:'concrete',automaticFinishers:false,disableAnimations:true},
  shopping_mall:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true},
  blue_creek:{weather:'water',terrain:'wetConcrete'},
  hotel_otherworld:{weather:'water',terrain:'wetConcrete',removeProps:['fire','mirrors']},
  lakeview:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['portraits','fire','firelight','crtv','screens','monitors','television']}, labyrinth:{weather:'dust',terrain:'concrete',style:'decay'},
  historical_society:{removeProps:['stairs']}, baldwin_mansion:{removeProps:['fireplace']},
  brookhaven_roof:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['water','fence']}, apartment_roof:{weather:'fog'},
  room_302:{weather:'dust'}, apartment_world:{weather:'dust'}, forest_world:{weather:'fog',removeProps:['wish_house','wish house']},
  subway_world:{weather:'dust',removeProps:['turnstile']},
  building_world:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['doors','signs','elevator']},
  water_prison:{weather:'dust',terrain:'concrete',removeProps:['tower','watchtower','cells','spotlight','chains']},
  hospital_world:{removeProps:['beds','head','curtains','monitor']},
  town_hall_hc:{removeProps:['stairs','flags']}, shepherd_house_hc:{removeProps:['portraits','stairs','mirrors']},
  devils_pit:{weather:'dust',terrain:'concrete',removeProps:['water','rails','cart']},
  cedar_grove:{weather:'dust'}, riverside_motel:{weather:'fog'}, grand_hotel:{weather:'dust'},
  artaud_theater:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true},
  nightmare_school:{weather:'cold'}, nightmare_hospital_sm:{weather:'cold'}, nightmare_mall_sm:{weather:'cold'},
  police_station_hc:{weather:'dust'}, centennial_building:{weather:'dust'}, st_marias:{weather:'dust'}, overlook:{weather:'dust',removeProps:['towers','watchtower','flood','chains']},
  church:{weather:'dust',removeProps:['fans','flesh','symbols']}, hilltop_center:{removeProps:['elevator']}, underground_hc:{weather:'dust'},
  nightmare_mall:{weather:'dust'}, nightmare_hilltop:{weather:'dust'}, nightmare_theater:{weather:'dust'},
  scarlet_chamber:{weather:'dust',removeProps:['mirrors']},
  villa:{weather:'dust'}, villa_rooftop:{weather:'fog'},
  hinako_home:{weather:'dust',removeProps:['roots']}, shimizu_residence:{weather:'dust'}, dark_shrine_main:{weather:'dust'},
  film_midwich:{weather:'ash'}, film_church:{weather:'dust'}, film_sanctuary:{weather:'dust'}, return_streets:{weather:'ash'},
  arcade_1918:{weather:'water',style:'decay',removeProps:['runes','altar']},
  arcade_1993:{weather:'water',style:'decay',removeProps:['portraits','void']},
  ascension_otherworld:{weather:'flicker',removeProps:['altar']},
  st_amelia_residential:{weather:'fog',removeProps:['crtv']},
  alternate_facility:{weather:'flicker',style:'signal'},
});

// Scene wording and neutral versus footing do not assert a material's source physics.
const SCENE_PRESENTATION = Object.freeze({
  prison_meat_locker:{source:'sh2',policy:{normalPhaseLabel:'CHAMBRE FROIDE · SECONDE SALLE',terrainRules:false,terrainPresentation:{name:'SOL DE LA CHAMBRE FROIDE',description:'Seconde salle du combat Eddie de SH2 original ; carcasses et rails de fond distincts du plateau versus. Matériau, humidité et physique non mesurés ; cadrage non certifié 1:1.'}}},
  brookhaven_sh2:{source:'sh2',policy:{terrainRules:false,terrainPresentation:{name:'SEUIL DE L’ASCENSEUR B1',description:'Couloir Otherworld B1 de Brookhaven SH2 original, devant l’ascenseur de la poursuite. Plateau versus adapté sans reproduire le sort de Maria ; physique et géométrie non certifiées 1:1.'}}},
  brookhaven_roof:{source:'sh2',policy:{normalPhaseLabel:'TOIT AVANT LA CHUTE',terrainRules:false,terrainPresentation:{name:'PLATEAU DU TOIT BROOKHAVEN',description:'Toit de Brookhaven SH2 original avant la chute, grille encore intacte. Matériau et humidité non déterminés ; règles matérielles désactivées, cadrage et collisions non certifiés 1:1.'}}},
  building_world:{source:'sh4',policy:{normalPhaseLabel:'ESCALIER B12–B15 · PREMIER PASSAGE',terrainRules:false,terrainPresentation:{name:'PALIER DU GRAND VENTILATEUR',description:'Escalier B12–B15 du premier Building World, sous le grand ventilateur. Palier horizontal adapté au versus ; aucune chute, physique ou géométrie source certifiée 1:1.'}}},
  artaud_theater:{source:'origins',policy:{normalPhaseLabel:'SCÈNE NORMALE · PROJECTEURS ACTIVÉS',terrainRules:false,terrainPresentation:{name:'PLATEAU DE LA SCÈNE ARTAUD',description:'Scène normale du théâtre après activation des projecteurs et levée du rideau. Décor peint non identifié, reflet et bascule non importés ; géométrie, physique et lumière non certifiées 1:1.'}}},
  lakeview:{source:'sh2',policy:{normalPhaseLabel:'AVANT LA CASSETTE',terrainRules:false,terrainPresentation:{name:'TAPIS DU LOBBY',description:'Tapis du lobby avant la cassette ; humidité non déterminée. Règles de terrain désactivées ; caméra et géométrie non certifiées 1:1.'}}},
  shopping_mall:{source:'sh3',policy:{normalPhaseLabel:'CENTRE COMMERCIAL NORMAL',terrainRules:false,terrainPresentation:{name:'SOL DU CENTRE COMMERCIAL',description:'Couloir normal du Central Square ; plateau versus adapté, humidité et physique non déterminées. Aucun effet de terrain source revendiqué ; fidélité 1:1 non certifiée.'}}},
  midwich_nightmare:{source:'sh1',policy:{terrainRules:false,terrainPresentation:{name:'DALLE AUTOUR DU FOYER',description:'Chaufferie Otherworld de Midwich ; passage de duel devant le foyer, cadrage adapté. Règles matérielles désactivées ; caméra et collisions non certifiées 1:1.'}}},
  sewers:{source:'sh3',policy:{normalPhaseLabel:'APRÈS LE SÈCHE-CHEVEUX',terrainRules:false,terrainPresentation:{name:'PASSERELLE DU CANAL',description:'Passerelle après usage du sèche-cheveux ; eau confinée au canal, aucun courant électrique actif dans le versus. Physique et cadrage non certifiés 1:1.'}}},
  lakeside_amusement:{source:'sh1',policy:{normalPhaseLabel:'MANÈGE DE CYBIL · SH1',terrainRules:false,terrainPresentation:{name:'PLATEAU DU MANÈGE SH1',description:'Manège du parc SH1 ; humidité et matériau du plateau non déterminés. Rotation de fond proposée, règles matérielles désactivées et caméra non certifiée 1:1.'}}},
  lakeside_sh3:{source:'sh3',policy:{normalPhaseLabel:'AVANT LA TRANSITION DU CARROUSEL',terrainRules:false,terrainPresentation:{name:'PLATEAU DU HAPPY CAROUSEL',description:'Happy Carousel avant sa transition ; chevaux de fond fixés à leurs mâts. Aucun poison ou obstacle ajouté ; humidité, physique et caméra non certifiées 1:1.'}}},
});

/** Small, executable vocabulary. A binding below is required; no keyword tagging. */
export const STAGE_REFERENCE_TRACKS = Object.freeze({
  fogLayers: {name:'Nappes de brume à deux vitesses',layer:'background',replaces:['fogDrift']},
  snowDepth: {name:'Neige dans la profondeur',layer:'air',replaces:['snowGust']},
  ashDepth: {name:'Cendre dans la profondeur',layer:'air',replaces:['ashFall']},
  fanEccentric: {name:'Ventilateur derrière sa protection',layer:'background',replaces:['fanSpin']},
  curtainBreathe: {name:'Bord de rideau dans un courant faible',layer:'background',replaces:['curtainSway']},
  chainPendulum: {name:'Chaîne suspendue à faible amplitude',layer:'background',replaces:['chainSway']},
  waterRings: {name:'Ondes à niveau d’eau constant',layer:'background',replaces:['waterRipple','waves']},
  waterSwell: {name:'Houle basse au fond du lac',layer:'background',replaces:['waterRipple','waves']},
  dustDrift: {name:'Poussière dans un faisceau de fond',layer:'background',replaces:[]},
  mirrorContamination: {name:'Traînée sombre sur le miroir',layer:'background',replaces:['mirrorGlitch']},
  lightSequence: {name:'Lumières successives vers la porte',layer:'background',replaces:['lightFlicker','lampFlicker']},
  signFlicker: {name:'Enseigne intermittente',layer:'background',replaces:['neonFlicker','streetLightFlicker']},
  paperFlutter: {name:'Papier retenu au décor',layer:'background',replaces:['flagSway']},
  rootBorder: {name:'Vrilles confinées à la bordure',layer:'background',replaces:['rootsCreep']},
  flowerBorder: {name:'Fleurs rouges dans la bordure',layer:'background',replaces:['rootsCreep','petalSpiral']},
  lanternGlow: {name:'Lueur contenue des lanternes',layer:'background',replaces:['lanternSway','firePulse']},
  doorReply: {name:'Battant entrouvert, appui fixe',layer:'background',replaces:['doorPulse']},
  shutterLift: {name:'Rideau métallique partiellement relevé',layer:'background',replaces:['storeShutters']},
  lampReply: {name:'Voyant après impact',layer:'background',replaces:['elevatorBlink']},
  pipePurge: {name:'Trois jets derrière la protection',layer:'background',replaces:['pipeSteam','ventSteam']},
  pianoKeyReply: {name:'Une touche du piano répond à l’impact',layer:'background',replaces:[],stageId:'midwich',source:'sh1',pendingLocation:'music-room'},
  ropePendulum: {name:'Corde du gibet, appui fixe',layer:'background',replaces:[],stageId:'toluca_prison',source:'sh2',pendingLocation:'gallows-courtyard'},
  cellDoorReply: {name:'Une porte de cellule sur ses charnières',layer:'background',replaces:[],stageId:'toluca_prison',source:'sh2'},
  cubeTurn: {name:'Cube de commande, orientation de fond',layer:'background',replaces:[],stageId:'labyrinth',source:'sh2'},
  washroomHoleReply: {name:'Lueur contenue du trou de la salle de bain',layer:'background',replaces:[],stageId:'room_302',source:'sh4'},
  paintingGlint: {name:'Reflet sur le vitrage d’un cadre sombre',layer:'background',replaces:[],stageId:'historical_society',source:'sh2',locationScope:'Salles d’exposition du musée ; hors escalier et puits',limits:'Vitrage et cadre abstraits ; aucun tableau officiel ni personnage reproduit ou animé.'},
  closedDoorReply: {name:'Battant fermé du Lounge d’Ernest',layer:'background',replaces:[],stageId:'baldwin_mansion',source:'sh2',locationScope:'Palier devant le Lounge ; porte fermée de Born from a Wish',limits:'La porte reste opaque et fermée ; aucun Ernest visible, aucune bougie du grenier déplacée ici.'},
  chapelCandleLean: {name:'Flammes des cierges de la chapelle',layer:'background',replaces:[],stageId:'church',source:'sh3',locationScope:'Chapelle avec autel et vitraux ; hors passages mémoire et fosse finale',limits:'Cierges attestés ; inclinaison commune proposée pour le versus, sans invocation ni effet sur les combattants.'},
  officeBlindSway: {name:'Store du bureau de Monica’s Dance Studio',layer:'background',replaces:[],stageId:'hilltop_center',source:'sh3',locationScope:'Bureau / réception de Monica’s Dance Studio, Hilltop Center normal',limits:'Store attesté dans cette pièce ; oscillation proposée pour le versus, sans atelier ni seuil de baignoire.'},
  subwayDoorCycle: {name:'Panneaux d’une voiture arrêtée',layer:'background',replaces:[],stageId:'subway_world',source:'sh4',locationScope:'Premier passage, quai Lynch Street et voitures arrêtées',limits:'Commande rouge attestée ; cycle lent proposé pour le versus, sans Cynthia, Wallmen, départ du train ou danger Hazel Street SH3.'},
  forestWindLayers: {name:'Vent distinct dans les branches et les herbes',layer:'background',replaces:['forestWind','windGust'],stageId:'forest_world',source:'sh4',locationScope:'Sentier et clairière arborée du premier passage ; hors enceinte Wish House',limits:'Deux fréquences de vent proposées pour le versus ; troncs et appuis fixes, aucune maison brûlée ni racine animée comme une main.'},
  waterwheelTurn: {name:'Roue horizontale au fond de la salle B2',layer:'background',replaces:[],stageId:'water_prison',source:'sh4',locationScope:'B2 Waterwheel Room, mécanisme sous la coursive sèche',limits:'Roue dans le plan horizontal et axe vertical ; rotation lente proposée, sans cellule pivotante, vanne automatique, moulin vertical ou sol inondé.'},
  wheelchairDrift: {name:'Fauteuil abstrait dans le couloir du deuxième étage',layer:'background',replaces:[],stageId:'hospital_world',source:'sh4',locationScope:'Couloir des chambres au deuxième étage ; hors chambre de la tête géante',limits:'Fauteuil vide abstrait proposé pour le versus ; les Wheelchairs du jeu sont des ennemis, cette piste ne produit ni leur apparence complète, ni leur IA, ni leurs dégâts.'},
  lecternGlint: {name:'Lueur sur le pupitre de la salle publique',layer:'background',replaces:[],stageId:'town_hall_hc',source:'homecoming',locationScope:'Premier passage normal, salle centrale du Town Hall',limits:'Podium attesté par le guide ; reflet proposé pour le versus, sans texte ajouté, cérémonie de retour, clé ou ouverture du sous-sol.'},
  atticDustFall: {name:'Poussière sous les chevrons du grenier normal',layer:'background',replaces:[],stageId:'shepherd_house_hc',source:'homecoming',locationScope:'Grenier Shepherd House normal avant la transformation',limits:'Charpente et poussière interprétées depuis la proposition versus ; aucun plan mesuré ni masque, médaille, horloge ou objet de l’état Otherworld importé.'},
  mineBeamDrips: {name:'Gouttes sous les traverses de la cavité',layer:'background',replaces:[],stageId:'devils_pit',source:'downpour',locationScope:'Cavité intérieure des roues hydrauliques, vue depuis la coursive sèche',limits:'Traverses et conduites documentées ; gouttes proposées pour le versus, sans pluie extérieure, cave inondée sur le plateau, démarrage de pompe ou train.'},
  cellBarShadows: {name:'Ombres des barreaux sur la coursive',layer:'background',replaces:[],stageId:'overlook',source:'downpour',locationScope:'Coursive Block A de la prison normale avant la vision du couloir inondé',limits:'Barreaux documentés ; déplacement de leur ombre proposé pour le versus, sans corps en cellule, tours, scène des douches, inondation ou prison Homecoming.'},
  boilerHearthGlow:{name:'Braises contenues dans le foyer central',layer:'background',replaces:[],stageId:'midwich_nightmare',source:'sh1',locationScope:'Arène de la chaufferie Otherworld de Midwich, foyer ouvert entouré de grilles',limits:'Éclat des braises proposé sous le rebord ; aucun Split Head, pluie de braises, sirène répétée ou casier. Le passage de duel devant le foyer et la caméra sont adaptés, non certifiés 1:1.'},
  canalCableSway:{name:'Câble sur la passerelle, eau à niveau fixe',layer:'background',replaces:[],stageId:'sewers',source:'sh3',locationScope:'Passerelle du canal après utilisation du sèche-cheveux',limits:'Câble installé après le sèche-cheveux ; petites vibrations proposées pour le versus. Aucun corps vivant, électricité active, électrocution ou eau sur le plateau de duel.'},
  sh1CarouselOrbit:{name:'Rotation de fond du manège SH1',layer:'background',replaces:[],stageId:'lakeside_amusement',source:'sh1',locationScope:'Manège de la rencontre Cybil dans le parc SH1 original',limits:'Rotation lente proposée avec un cheval fixe comme repère ; silhouettes de sculptures originales partielles, ni Cybil, ni gaz et énigme du Happy Carousel SH3.'},
  sh3HorseBob:{name:'Chevaux du Happy Carousel sur mâts fixes',layer:'background',replaces:[],stageId:'lakeside_sh3',source:'sh3',locationScope:'Happy Carousel SH3 avant la transition et la rencontre Memory of Alessa',limits:'Trois sculptures de fond interprètent une partie du manège ; va-et-vient proposé, ensemble des douze chevaux et puzzle non reproduits. Aucun poison, monstre ou scène Cybil SH1.'},
  freezerCarcassSway:{name:'Une carcasse suspendue dans la seconde chambre froide',layer:'background',replaces:['chainSway'],stageId:'prison_meat_locker',source:'sh2',locationScope:'Seconde salle principale de la chambre froide du combat Eddie, SH2 original 2001',limits:'Rail et crochet restent fixes ; une masse abstraite suspendue oscille lentement comme proposition versus. Aucun Eddie, corps humain, obstacle de collision, jet de vapeur du remake ou transport de carcasse. Aspect, nombre de crochets, angle et cadence source non mesurés.'},
  rooftopFenceFlex:{name:'Grille intacte avant la chute de Brookhaven',layer:'background',replaces:[],stageId:'brookhaven_roof',source:'sh2',locationScope:'Toit de Brookhaven SH2 original, grille entre la porte et Elevator Control Room, avant la chute narrative',limits:'Poteaux fixes et déformation minime du treillis proposés pour le versus ; aucune rupture, chute, apparition de Pyramid Head ou grille du remake. Piste préparée mais masquée lorsqu’un bitmap remplace ce toit.'},
  stairwellFanTurn:{name:'Grand ventilateur au-dessus du puits B12–B15',layer:'background',replaces:[],stageId:'building_world',source:'sh4',locationScope:'Grand escalier vide B12 vers B15, premier Building World de SH4',limits:'Le guide atteste un énorme ventilateur au-dessus de l’escalier. Rotor abstrait en perspective et rotation proposés pour le versus ; orientation, nombre de pales et vitesse non confirmés par une vue originale. Aucune enseigne, corde, toit à Gum Heads, boutique ou chute d’ascenseur.'},
  artaudSpotlightGlide:{name:'Lueur des projecteurs sur le fond de scène normal',layer:'background',replaces:['spotlightSweep'],stageId:'artaud_theater',source:'origins',locationScope:'Scène normale Artaud après les quatre ampoules, le panneau d’éclairage et le levier du rideau',limits:'Deux sources fixes et une variation douce de lueur proposées pour le versus ; aucun spot mobile source revendiqué, texte peint, décor d’arbre ou océan sélectionné sans preuve, marionnette, miroir, Ariel ou Caliban. Géométrie et cadence non mesurées.'},
  pursuitElevatorGap:{name:'Panneaux de l’ascenseur au bout du couloir B1',layer:'background',replaces:[],stageId:'brookhaven_sh2',source:'sh2',locationScope:'Couloir Otherworld B1 de la poursuite à la lance, devant l’ascenseur de Brookhaven SH2 original',limits:'Cadre fixe et battants maintenus entrouverts dans une suspension versus avant fermeture scénique ; faible variation d’écart proposée, aucun cycle canonique revendiqué. Sans Maria, Pyramid Head, ombre, chute d’ascenseur, sirène répétée ou reprise de la mort narrative.'},
});

// [render key, zero-based research proposal, exact rear anchor, optional event].
// No body, cameo, camera displacement, sound recording or new topology is claimed.
const BINDINGS = Object.freeze({
  midwich:[['doorReply',1,[.5,.57]]],
  alchemilla:[['fanEccentric',1,[.78,.27]],['lampReply',2,[.52,.3],'referenceLightReply']],
  old_silent_hill:[['fogLayers',1,[.5,.54]],['snowDepth',0,[.5,.45]]],
  nowhere:[['lightSequence',1,[.5,.28]]],
  central_nightmare:[['dustDrift',1,[.67,.61]]],
  sewer_resort:[['waterRings',1,[.58,.72]]],
  blue_creek:[['waterRings',1,[.5,.72]]],
  toluca_prison:[['cellDoorReply',2,[.28,.61],'referenceCellReply']],
  labyrinth:[['cubeTurn',1,[.69,.49]]],
  historical_society:[['paintingGlint',1,[.29,.38]]],
  baldwin_mansion:[['closedDoorReply',2,[.5,.57],'referenceClosedDoorReply']],
  hotel_otherworld:[['waterRings',1,[.51,.72]],['dustDrift',2,[.73,.39],'referenceDustRelease']],
  south_vale:[['fogLayers',1,[.5,.55]]],
  brookhaven_roof:[['paperFlutter',1,[.73,.65]],['rooftopFenceFlex',2,[.5,.57]]],
  prison_meat_locker:[['freezerCarcassSway',1,[.5,.21]]],
  brookhaven_sh2:[['pursuitElevatorGap',1,[.5,.57]]],
  brookhaven_sh3:[['waterRings',1,[.51,.72]]],
  shopping_mall:[['shutterLift',1,[.26,.53]]],
  nightmare_mall:[['dustDrift',1,[.24,.53]]],
  underpass_sh3:[['fanEccentric',1,[.79,.27]],['pipePurge',2,[.2,.58],'referenceSteamPurge']],
  nightmare_hospital_sh3:[['mirrorContamination',1,[.73,.39]]],
  church:[['chapelCandleLean',1,[.71,.49]]],
  hilltop_center:[['officeBlindSway',1,[.72,.32]]],
  room_302:[['chainPendulum',1,[.52,.34]],['washroomHoleReply',2,[.78,.49],'referenceWashroomReply']],
  subway_world:[['subwayDoorCycle',1,[.5,.57]]],
  forest_world:[['forestWindLayers',1,[.5,.57]]],
  water_prison:[['waterwheelTurn',1,[.71,.49]]],
  hospital_world:[['wheelchairDrift',1,[.72,.57]]],
  building_world:[['stairwellFanTurn',1,[.5,.23]]],
  town_hall_hc:[['lecternGlint',1,[.5,.57]]],
  shepherd_house_hc:[['atticDustFall',1,[.5,.17]]],
  devils_pit:[['mineBeamDrips',0,[.28,.24]]],
  overlook:[['cellBarShadows',0,[.72,.57]]],
  midwich_nightmare:[['boilerHearthGlow',1,[.5,.61]]],
  sewers:[['canalCableSway',1,[.62,.55]]],
  lakeside_amusement:[['sh1CarouselOrbit',1,[.5,.54]]],
  lakeside_sh3:[['sh3HorseBob',1,[.5,.54]]],
  apartment_world:[['doorReply',1,[.5,.57]]],
  riverside_motel:[['signFlicker',0,[.72,.31]],['curtainBreathe',1,[.29,.38]]],
  shepherds_glen:[['fogLayers',0,[.5,.55]]],
  grand_hotel:[['dustDrift',1,[.69,.45]]],
  alchemilla_origins:[['curtainBreathe',2,[.3,.39]]],
  artaud_theater:[['curtainBreathe',1,[.21,.3]],['artaudSpotlightGlide',2,[.5,.43]]],
  police_station_hc:[['lampReply',0,[.53,.3]]],
  curtis_shop:[['chainPendulum',0,[.71,.25]]],
  frozen_streets:[['snowDepth',0,[.5,.45]]],
  centennial_building:[['dustDrift',1,[.52,.39]],['paperFlutter',0,[.3,.6]]],
  st_marias:[['curtainBreathe',0,[.28,.36]]],
  arcade_city:[['fogLayers',0,[.5,.55]],['signFlicker',1,[.7,.32]]],
  arcade_hospital:[['curtainBreathe',0,[.28,.37]]],
  arcade_toluca_lake:[['waterSwell',0,[.56,.7]],['fogLayers',1,[.5,.49]]],
  villa:[['paperFlutter',0,[.3,.49]]],
  ebisugaoka:[['fogLayers',0,[.5,.52]],['flowerBorder',1,[.84,.69]],['paperFlutter',2,[.31,.39]]],
  dark_shrine:[['lanternGlow',0,[.29,.36]]],
  corrupted_ebisugaoka:[['rootBorder',0,[.84,.69]]],
  film_midwich:[['ashDepth',1,[.5,.44]]],
  return_streets:[['ashDepth',0,[.5,.44]]],
  hope_junction:[['fogLayers',0,[.5,.54]]],
  book_water:[['waterRings',0,[.53,.7]]],
  book_earth:[['dustDrift',1,[.72,.56]]],
  book_wood:[['rootBorder',1,[.83,.69]]],
});

// Material matches only. The actual versus attacks/timings remain adaptations.
const HAZARDS = Object.freeze({
  hazel_subway:['trainRush'], otherworld_void:['voidPull'],
  book_fire:['emberFall'], book_water:['waterSurge'], book_wood:['rootSnare'],
  book_earth:['fallingDebris'], book_steel:['chainSweep'], book_blood:['bloodTide'],
});
const EVENT_HAZARDS = Object.freeze({lockerSlam:'lockerSlam',gurneyRush:'gurneyRush',corridorCollapse:'roadCollapse',carouselStart:'carouselSweep',trainRumble:'trainRush',steamRelease:'steamVent',waterRise:'waterSurge',mirrorTurn:'mirrorFracture',rootWake:'rootSnare',voidPull:'voidPull',ashFall:'emberFall',elevatorCall:'elevatorDrop',roomBreath:'roomPulse',stormSurge:'lightningStrike',iceLock:'iceFracture',ritualWake:'ritualSeal'});
const AMBIENT_EVENTS = Object.freeze({
  nowhere:['powerFailure','sirenCall'], hospital_nightmare:['sirenCall'],
  nightmare_mall:['powerFailure'], hazel_subway:['powerFailure'],
  building_world:['powerFailure'], outside_room_302:['powerFailure'],
  looping_hall:['powerFailure'], villa_stairwell:['powerFailure'],
  nightmare_hospital_hc:['powerFailure'], police_station_hc:['powerFailure'], prison_hc:['powerFailure'],
  film_midwich:['sirenCall'], film_church:['sirenCall'],
  alternate_facility:['powerFailure'],
});

const PHYSICAL_ANIMATIONS = Object.freeze({trainPass:'trainRush',mineCart:'trainRush',carouselTurn:'carouselSweep',rootsCreep:'rootSnare',voidSurge:'voidPull',chasmPulse:'roadCollapse',iceCrack:'iceFracture'});
const FORBIDDEN_CAMEOS = new Set(['shadowPass','windowShadow','cellShadow','portraitBlink','dollTurn']);

/** Public predicates also protect rendering against an old or injected cue. */
export function stageReferenceEventAllowed(stage, id) {
  return !stage?.reference?.blocked && (!stage?.referencePolicy || stage.referencePolicy.allowedEvents.includes(id));
}
export function stageReferenceHazardAllowed(stage, id) {
  return !stage?.reference?.blocked && (!stage?.referencePolicy || stage.referencePolicy.allowedHazards.includes(id));
}
/** A new exact-location prop cannot be borrowed by a similarly named work. */
export function stageReferenceTrackAllowed(stage, track) {
  const definition=STAGE_REFERENCE_TRACKS[track?.key];
  if(!definition||definition.pendingLocation||stage?.reference?.blocked)return false;
  if(!definition.stageId)return true;
  return stage?.id===definition.stageId&&stage?.source===definition.source&&track.source===definition.source&&
    track.id===`${definition.stageId}:reference:${track.proposalIndex+1}`&&
    (BINDINGS[stage.id]||[]).some(([key,index,,event])=>key===track.key&&index===track.proposalIndex&&(event||null)===(track.event||null));
}
export function stageAnimationConflictsWithHazard(id, hazardId) {
  return PHYSICAL_ANIMATIONS[id] === hazardId || ({hospitalMonitor:'gurneyRush',pipeSteam:'steamVent',waterRipple:'waterSurge',mirrorGlitch:'mirrorFracture',elevatorBlink:'elevatorDrop',ashFall:'emberFall'})[id] === hazardId;
}

function animationAllowed(stage, id, worldState) {
  if (FORBIDDEN_CAMEOS.has(id)) return false;
  if (PHYSICAL_ANIMATIONS[id]) return false; // Physical objects belong to announced events/hazards.
  if (id === 'ashFall') return stage.source === 'film' && stage.weather === 'ash';
  if (id === 'snowGust') return stage.weather === 'snow';
  if (id === 'rainSheets' || id === 'lightning') return stage.weather === 'rain';
  if (id === 'fogDrift') return !INTERIOR.has(stage.family) && ['fog','snow','water','rain'].includes(stage.weather);
  if (['bloodPulse','metalPulse','sirenPulse','ritualGlyph'].includes(id) && worldState === 'fixed-normal') return false;
  if (id === 'firePulse') return stage.weather === 'embers' || has(stage,'fireplace','lava');
  if (id === 'petalSpiral') return ['shf','shortmessage'].includes(stage.source) && stage.weather === 'petals';
  if (id === 'hospitalMonitor') return has(stage,'monitors');
  if (id === 'radioPulse') return has(stage,'radio');
  if (id === 'tvStatic') return has(stage,'monitors','screens') && stage.source !== 'shf';
  if (id === 'fanSpin') return has(stage,'fans','vents');
  if (id === 'chainSway') return has(stage,'chains');
  if (id === 'pipeSteam' || id === 'ventSteam') return has(stage,'pipes','boiler','vents');
  if (id === 'mirrorGlitch') return has(stage,'mirrors') && ['origins','sh3'].includes(stage.source);
  if (id === 'waterRipple' || id === 'waves') return has(stage,'water','pool','pools','canal') || stage.weather === 'water';
  if (id === 'boatRock') return has(stage,'boat','boats');
  if (id === 'ferrisWheel') return has(stage,'wheel');
  if (id === 'bellSwing') return has(stage,'bells');
  if (id === 'spotlightSweep' || id === 'lighthouseBeam') return has(stage,'beam','spotlight','spotlights');
  if (id === 'curtainSway') return has(stage,'curtains');
  if (id === 'elevatorBlink') return has(stage,'elevator');
  if (id === 'lockerRattle') return has(stage,'lockers') && worldState !== 'fixed-normal';
  if (id === 'doorPulse') return false; // A breathing/hostile room is not implied by a door.
  if (id === 'screenSlide') return has(stage,'screens');
  if (id === 'sawSpin') return has(stage,'saws');
  if (id === 'sparks') return stage.weather === 'sparks' || has(stage,'machines');
  if (id === 'forestWind' || id === 'windGust') return !INTERIOR.has(stage.family) && has(stage,'trees','roots','fence','antenna');
  if (id === 'storeShutters') return has(stage,'shutters');
  if (id === 'flagSway') return has(stage,'flags');
  if (id === 'lanternSway') return has(stage,'lanterns');
  if (id === 'gravityTilt' || id === 'headlightSweep' || id === 'tunnelWind') return false;
  return ['lightFlicker','lampFlicker','neonFlicker','streetLightFlicker','coldBreath','floorCreak'].includes(id);
}

export function applyStageReferencePolicy(stage, reference) {
  const result = {...stage,props:[...(stage.props || [])],layers:[...(stage.layers || [])],animations:[...(stage.animations || [])]};
  const identityMatched = Boolean(reference && reference.id === stage.id && reference.source === stage.source);
  const status = identityMatched ? reference.locationStatus : 'reference-identite-absente-ou-incompatible';
  const blocked = !identityMatched || typeof status!=='string' || !status.trim() || unresolved.test(status);
  const corrections = ENVIRONMENT[stage.id] || {};
  if(!blocked&&corrections.name)result.name=corrections.name;
  let worldState = blocked ? 'unresolved' : ALTERED.has(stage.id) || stage.source === 'bom' ? 'fixed-altered' : TRANSITIONS.has(stage.id) ? 'versus-transition' : 'fixed-normal';
  const interior = INTERIOR.has(stage.family) || (stage.id==='devils_pit'&&stage.source==='downpour') || (stage.id==='sewers'&&stage.source==='sh3') || ['nightmare_school','nightmare_hospital_sm','nightmare_mall_sm'].includes(stage.id);
  result.weather = blocked ? 'none' : corrections.weather || (interior && ['rain','snow','ash'].includes(stage.weather) ? 'dust' : stage.weather);
  // Do not perpetuate the movie's cinder language in unrelated game interiors.
  if (!blocked && result.weather === 'ash' && stage.source !== 'film') result.weather = 'dust';
  result.props = result.props.filter(prop => !(corrections.removeProps || []).includes(prop));
  result.layers = result.layers.filter(prop => !(corrections.removeProps || []).includes(prop));
  const style = corrections.style || STYLE[stage.source] || stage.shift?.style || 'rust';
  result.shift = {...stage.shift,style,enabled:worldState === 'versus-transition',startOtherworld:worldState === 'fixed-altered',referenceState:worldState};
  result.visibility = {...stage.visibility,fog:blocked ? 0 : corrections.fog ?? (interior ? Math.min(stage.visibility?.fog || .15,.2) : stage.visibility?.fog || .4)};
  if (corrections.terrain) result.terrain = {...stage.terrain,id:corrections.terrain};
  if (blocked) result.terrain = {...stage.terrain,id:'concrete'};
  result.reference = {
    id:stage.id,source:stage.source,identityMatched,blocked,locationStatus:status,
    catalogueName:stage.name,correctedName:result.name!==stage.name?result.name:null,
    locationNote:identityMatched ? reference.locationNote || '' : 'Fiche de lieu exacte requise avant activation des effets.',
    referenceIds:identityMatched ? [...(reference.referenceIds || [])] : [],
    constraints:identityMatched ? [...(reference.constraints || [])] : [],
    proposals:identityMatched ? copy(reference.animations || []) : [],
  };
  const referenceTracks = blocked ? [] : (BINDINGS[stage.id] || []).flatMap(([key,index,anchor,event]) => {
    const proposal = reference.animations?.[index],definition = STAGE_REFERENCE_TRACKS[key];
    if (!proposal || !definition || definition.pendingLocation || (definition.stageId&&(stage.id!==definition.stageId||stage.source!==definition.source)) || /bloque|non.confirme|a.verifier/.test(proposal.status || '')) return [];
    return [{id:`${stage.id}:reference:${index+1}`,key,name:definition.name,description:proposal.description,proposalIndex:index,source:stage.source,
      evidence:[...(proposal.evidence || reference.referenceIds || [])],layer:definition.layer,anchor:{x:anchor[0],y:anchor[1]},
      trigger:event ? 'local-heavy-impact' : 'ambient',event:event || null,
      eventEnabled:event ? !corrections.disabledEvents?.[event] : null,
      implementation:'canvas-prototype',coverage:'partial-visual-prototype',implementedElement:definition.name,
      fidelity:'adaptation-versus-proposee',captureStatus:proposal.captureStatus || 'capture-a-relever',
      locationScope:definition.locationScope || null,
      limits:unique(['Mouvement original de décor uniquement ; pas de collision, de son capturé, de personnage ou de certification 1:1.',definition.limits,corrections.disabledEvents?.[event]]).join(' ')}];
  });
  const allowedHazards = blocked ? [] : [...(HAZARDS[stage.id] || [])];
  const candidateEvents = unique([...(stage.director?.events || []),...referenceTracks.map(track=>track.event)]);
  const allowedEvents = blocked ? [] : candidateEvents.filter(id => !corrections.disabledEvents?.[id] && (referenceTracks.some(track=>track.event===id) ||
    (EVENT_HAZARDS[id] ? allowedHazards.includes(EVENT_HAZARDS[id]) && id !== 'ashFall' : (AMBIENT_EVENTS[stage.id] || []).includes(id))));
  const replaced = new Set(referenceTracks.flatMap(track=>STAGE_REFERENCE_TRACKS[track.key].replaces));
  const animations = blocked || corrections.disableAnimations ? [] : result.animations.filter(id=>!replaced.has(id) && animationAllowed(result,id,worldState));
  const suppression = [
    ...referenceTracks.filter(track=>track.eventEnabled===false).map(track=>({kind:'event',id:track.event,reason:corrections.disabledEvents[track.event]})),
    ...(stage.director?.events || []).filter(id=>!allowedEvents.includes(id)).map(id=>({kind:'event',id,reason:'Occurrence locale ou danger non retenu par la fiche exacte.'})),
    ...(stage.director?.hazardDeck || []).filter(id=>!allowedHazards.includes(id)).map(id=>({kind:'hazard',id,reason:'Un motif ou une boucle décorative ne suffit pas à autoriser des dégâts.'})),
    ...(stage.animations || []).filter(id=>!animations.includes(id)).map(id=>({kind:'animation',id,reason:replaced.has(id)?'Remplacé par une piste précise du classeur.':'Motif/phase/accessoire incompatible, non confirmé ou silhouette à produire.'})),
  ];
  if (result.weather !== stage.weather) suppression.push({kind:'weather',id:stage.weather,reason:`Ambiance remplacée par ${result.weather} pour conserver le lieu et l’œuvre.`});
  result.referenceTracks = referenceTracks;
  result.referencePolicy = {worldState,allowedEvents,allowedHazards,automaticFinishers:!blocked&&corrections.automaticFinishers!==false&&!NARRATIVE_ONLY.has(stage.id)&&stage.source!=='shattered',
    ...(!blocked&&SCENE_PRESENTATION[stage.id]?.source===stage.source?copy(SCENE_PRESENTATION[stage.id].policy):{}),
    weather:result.weather,interior,baselineMotion:!blocked,suppression,
    hazardFidelity:'Associations matérielles de versus ; dégâts, trajectoires et timings non attestés 1:1.',
    renderedProposalIds:referenceTracks.filter(track=>track.eventEnabled!==false).map(track=>track.id),pendingProposalIds:(identityMatched?reference.animations || []:[]).map((_,index)=>`${stage.id}:reference:${index+1}`).filter(id=>!referenceTracks.some(track=>track.id===id&&track.eventEnabled!==false)),
  };
  result.animations = animations;
  result.animationTracks = (stage.animationTracks || []).filter(track=>animations.includes(track.id));
  result.director = {...stage.director,events:allowedEvents,hazardDeck:allowedHazards,motifPolicy:{...stage.director?.motifPolicy,
    events:allowedEvents,hazards:allowedHazards,ambienceOnly:allowedHazards.length===0,evidenceScope:'exact-production-reference / original-versus-prototypes',suppression}};
  result.interactions = allowedEvents.slice(0,3).map((event,index) => {
    const previous = (stage.interactions || []).find(interaction=>interaction.event===event),track=referenceTracks.find(track=>track.event===event);
    return {...previous,id:previous?.id || `${stage.id}_${event}_${index+1}`,event,name:previous?.name || track?.name || event,
      trigger:track?.trigger || previous?.trigger || 'time-or-first-heavy-impact',fidelity:'adaptation-versus-proposee',
      fidelityLabel:track?'PROPOSITION LORE · PROTOTYPE VERSUS':'MOTIF LORE · RÈGLE VERSUS',
      canonicalBasis:track?.description || result.reference.locationNote,referenceIds:track?.evidence || result.reference.referenceIds,
      proposalId:track?.id || null,zone:track?.event?{x:track.anchor.x,radius:.15}:previous?.zone};
  });
  result.lore = {...stage.lore,premise:result.reference.locationNote,canonicalBasis:result.reference.referenceIds.join(' ; '),
    fidelity:blocked?'reference-bloquee':'lieu-reference / mise-en-scene-versus',
    adaptationNotice:'Les mouvements joués sont des prototypes originaux de propositions. Aucune nouvelle capture ni fidélité 1:1 validée ; collisions et sons ne sont pas déduits de ces boucles.'};
  result.catalogueStatus = blocked ? 'reference-blocked' : stage.catalogueStatus;
  return result;
}
