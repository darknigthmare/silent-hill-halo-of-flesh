/*
 * SILENT HILL: HALO OF FLESH — Living Otherworld stage director.
 *
 * This module never claims that versus-only hazards or timings are canonical.
 * It combines documented location motifs with explicit fan-game adaptation rules,
 * so every arena exposes a readable lore basis and a deterministic runtime profile.
 */

import { constrainStageDeck, localAnimationAllowed } from './stage-lore-policy.js';
import { stageChoreographyProfile } from './stage-cinematics.js';
import { applyStageReferencePolicy, stageReferenceHazardAllowed } from './stage-reference-policy.js';

const unique = (values = []) => [...new Set(values.filter(Boolean))];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clone = (value) => JSON.parse(JSON.stringify(value));


const PROP_LABELS = Object.freeze({
  altar: 'autel', antenna: 'antenne', bars: 'barreaux', bathroom: 'salle de bains', beam: 'faisceau', beds: 'lits', bells: 'cloches', blood: 'sang', boat: 'barque', boats: 'bateaux', boiler: 'chaudière', booths: 'baraques', bridges: 'passerelles', cages: 'cages', canal: 'canal', carousel: 'manège', cars: 'voitures abandonnées', cave: 'grotte', cells: 'cellules', chains: 'chaînes', chasm: 'gouffre', clock: 'horloge', cocoons: 'cocons', corridor: 'couloir', cracks: 'fissures', crates: 'caisses', crtv: 'CRTV', curtains: 'rideaux', deck: 'pont du navire', desks: 'bureaux', dolls: 'poupées', door: 'porte', doors: 'portes', drums: 'tambours', elevator: 'ascenseur', escalator: 'escalator', fans: 'ventilateurs', fence: 'grillage', fences: 'grillages', fire: 'feu', fireplace: 'cheminée', flags: 'drapeaux', flauros: 'Flauros', flesh: 'matière organique', flood: 'inondation', flowers: 'fleurs', fog: 'brume', freezer: 'chambre froide', gallows: 'potence', gears: 'engrenages', graffiti: 'graffitis', grates: 'grilles', graves: 'tombes', gurneys: 'chariots médicaux', hall: 'hall', head: 'tête monumentale', hooks: 'crochets', houses: 'maisons', ice: 'glace', lamps: 'lampes', lanterns: 'lanternes', lava: 'lave', lights: 'éclairages', lockers: 'casiers', machines: 'machines', maze: 'labyrinthe', meat: 'quartiers de viande', metal: 'métal', mirrors: 'miroirs', monitors: 'moniteurs', moss: 'mousse', neon: 'néon', organ: 'orgue', pages: 'pages', phone: 'téléphone', pillars: 'piliers', pipes: 'conduites', pit: 'fosse', platform: 'quai', pool: 'piscine', pools: 'bassins', portraits: 'portraits', radio: 'radio', rails: 'rails', road: 'chaussée', rocks: 'roches', rooms: 'chambres', roots: 'racines', runes: 'marques rituelles', saws: 'scies', screens: 'écrans', shops: 'boutiques', shutters: 'rideaux métalliques', signs: 'enseignes', spotlight: 'projecteur', spotlights: 'projecteurs', stage: 'scène', stairs: 'escaliers', stalls: 'étals', tatami: 'tatamis', tiles: 'carrelage', tools: 'outils', torii: 'torii', tower: 'tour', towers: 'tours', townhall: 'hôtel de ville', train: 'rame', trash: 'débris', trees: 'arbres', turnstile: 'tourniquet', umbilical: 'cordon ombilical', veins: 'veines', vents: 'bouches d’aération', void: 'vide', walls: 'murs', water: 'eau', webs: 'toiles', wheel: 'grande roue', wheelchairs: 'fauteuils roulants', window: 'fenêtre', windows: 'fenêtres', wish_house: 'Wish House',
});

const WEATHER_LABELS = Object.freeze({
  ash: 'une chute de cendres', blood: 'une humidité sanglante', cold: 'un froid sec', dust: 'une poussière suspendue', embers: 'des braises', flicker: 'un éclairage intermittent', fog: 'une brume dense', light: 'une lumière surexposée', petals: 'une dérive de pétales', rain: 'une pluie continue', runes: 'des signes rituels actifs', snow: 'une neige coupante', sparks: 'des étincelles électriques', spores: 'des spores flottantes', water: 'une présence d’eau noire',
});

const FAMILY_LORE = Object.freeze({
  amusement: 'un parc dont les attractions continuent sans public',
  apartment: 'des couloirs domestiques étroits où portes et voisinage deviennent hostiles',
  book: 'un nexus construit comme une page mentale reliant plusieurs zones',
  building: 'une verticalité urbaine faite d’escaliers, d’ascenseurs et de paliers',
  church: 'un espace de culte où l’architecture impose le jugement et la procession',
  elemental: 'une zone du livre gouvernée par un élément et ses règles matérielles',
  festival: 'une place rituelle où décor festif et menace cérémonielle se confondent',
  forest: 'un sous-bois fermé où les racines et les silhouettes limitent les lignes de fuite',
  gallery: 'une pièce d’exposition où les regards et les cadres deviennent actifs',
  graveyard: 'un espace funéraire où le sol et les racines rappellent les morts',
  hall: 'un passage cérémoniel long, frontal et difficile à quitter',
  hospital: 'la circulation contrainte d’un établissement médical et son équipement clinique',
  hotel: 'un lieu de mémoire domestique dont le confort se décompose',
  house: 'un intérieur familial où les objets privés deviennent accusateurs',
  ice: 'un monde gelé de poursuite, de glissade et de visibilité froide',
  labyrinth: 'une géométrie souterraine qui replie les sorties vers son centre',
  lair: 'un repaire organique ou industriel construit autour de la captivité',
  lake: 'une étendue d’eau où la brume efface les distances et les berges',
  lighthouse: 'une verticale exposée rythmée par le faisceau du phare',
  mall: 'un espace commercial vidé, fermé par ses vitrines et ses rideaux métalliques',
  marina: 'un front d’eau ouvert au vent, aux amarres et à la brume marine',
  mine: 'une structure rocheuse instable traversée par rails et galeries',
  motel: 'une succession de chambres anonymes autour d’un extérieur dégradé',
  museum: 'un lieu d’archives où escaliers, tableaux et portes conduisent vers le passé',
  office: 'un espace administratif vertical dont les ascenseurs et bureaux enferment le trajet',
  otherworld: 'un assemblage impossible déjà dominé par la matière du cauchemar',
  prison: 'une structure carcérale de cellules, chaînes et surveillance',
  roof: 'une surface haute et exposée dont les bords limitent le recul',
  rooftop: 'un toit ouvert au vent et à la chute, sans protection latérale',
  room: 'une pièce close qui réagit comme un organisme ou une présence',
  school: 'des salles et couloirs scolaires où mobilier et casiers deviennent menaçants',
  sewer: 'un réseau humide de canaux, grilles et conduites',
  ship: 'un pont mobile et métallique soumis aux chaînes, au roulis et aux passages étroits',
  shrine: 'un sanctuaire japonais structuré par lanternes, cloches et marques rituelles',
  street: 'une rue coupée par la brume, les véhicules et les ruptures de chaussée',
  subway: 'un quai linéaire où tunnel, rails et rame dictent le danger',
  theater: 'une scène où rideaux, lumière et machinerie transforment le combat en représentation',
  villa: 'un immeuble résidentiel vertical marqué par les graffitis, les escaliers et la poursuite',
  village: 'un habitat rural dispersé dont les chemins se referment sous la brume',
  void: 'un espace sans géométrie stable qui attire les corps et déforme les distances',
  workshop: 'un atelier encombré où outils, chaînes et machines deviennent des menaces lisibles',
});

function loreList(values = []) {
  if (!values.length) return 'les éléments du lieu';
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} et ${values[1]}`;
  return `${values.slice(0, -1).join(', ')} et ${values.at(-1)}`;
}

function generatedLorePremise(stage) {
  const family = FAMILY_LORE[stage.family] || `un lieu de type ${String(stage.family || 'inconnu').replaceAll('_', ' ')}`;
  const props = (stage.props || []).map((id) => PROP_LABELS[id] || String(id).replaceAll('_', ' '));
  const weather = WEATHER_LABELS[stage.weather] || String(stage.weather || 'une ambiance instable').replaceAll('_', ' ');
  const elements = loreList(props);
  const weatherLink = /^[aeiouyàâäéèêëîïôöùûüœ]/i.test(weather) ? `tandis qu’${weather}` : `tandis que ${weather}`;
  return `${stage.name} repose sur ${family}. ${elements.charAt(0).toUpperCase()}${elements.slice(1)} structurent la lecture du décor, ${weatherLink} guide sa perception et sa transformation.`;
}

export const STAGE_TERRAINS = Object.freeze({
  concrete: { name: 'BÉTON SEC', moveScale: 1, jumpScale: 1, dodgeScale: 1, friction: .84, knockbackScale: 1, guardRegenScale: 1, description: 'Sol stable et neutre.' },
  wetConcrete: { name: 'BÉTON TREMPÉ', moveScale: .96, jumpScale: .96, dodgeScale: 1.06, friction: .9, knockbackScale: 1.08, guardRegenScale: .96, description: 'L’élan se conserve plus longtemps et les impacts repoussent davantage.' },
  flooded: { name: 'EAU STAGNANTE', moveScale: .87, jumpScale: .9, dodgeScale: .9, friction: .8, knockbackScale: .92, guardRegenScale: .92, splash: true, description: 'L’eau freine les déplacements et les esquives sans rendre le combat illisible.' },
  ice: { name: 'GLACE DU CAUCHEMAR', moveScale: 1.02, jumpScale: .95, dodgeScale: 1.14, friction: .94, knockbackScale: 1.12, guardRegenScale: .9, slip: true, description: 'Faible adhérence : les accélérations et esquives prolongent leur glissade.' },
  steel: { name: 'CAILLEBOTIS MÉTALLIQUE', moveScale: .98, jumpScale: .96, dodgeScale: .98, friction: .86, knockbackScale: 1.04, guardRegenScale: .94, description: 'Le métal résonne, accentue la radio et transmet les chocs.' },
  wood: { name: 'PLANCHER ANCIEN', moveScale: .97, jumpScale: 1, dodgeScale: .96, friction: .85, knockbackScale: 1, guardRegenScale: .98, creak: true, description: 'Le plancher trahit les déplacements par des craquements.' },
  carpet: { name: 'MOQUETTE HUMIDE', moveScale: .92, jumpScale: .96, dodgeScale: .9, friction: .76, knockbackScale: .88, guardRegenScale: 1.04, description: 'Les pas sont étouffés mais les esquives perdent de la portée.' },
  mud: { name: 'BOUE ET RACINES', moveScale: .88, jumpScale: .9, dodgeScale: .86, friction: .77, knockbackScale: .9, guardRegenScale: .92, description: 'Le terrain retient les pieds et favorise les attaques de poursuite.' },
  petals: { name: 'PÉTALES ET VRILLES', moveScale: .93, jumpScale: .96, dodgeScale: .92, friction: .82, knockbackScale: .94, guardRegenScale: .9, bloom: true, description: 'La flore réagit aux combattants et se densifie pendant la bascule.' },
  ritualStone: { name: 'PIERRE RITUELLE', moveScale: .97, jumpScale: .94, dodgeScale: .94, friction: .83, knockbackScale: 1.02, guardRegenScale: .88, description: 'Les marques rituelles amplifient la jauge et les phases de boss.' },
  unstable: { name: 'STRUCTURE INSTABLE', moveScale: .95, jumpScale: .94, dodgeScale: .98, friction: .87, knockbackScale: 1.14, guardRegenScale: .9, description: 'Le décor cède sous les impacts lourds et augmente le recul.' },
  narrow: { name: 'COULOIR ÉTROIT', moveScale: .95, jumpScale: .88, dodgeScale: .84, friction: .84, knockbackScale: .82, guardRegenScale: 1.02, description: 'Les murs réduisent l’espace de recul et rendent les saisies plus dangereuses.' },
  void: { name: 'ESPACE IMPOSSIBLE', moveScale: .92, jumpScale: 1.06, dodgeScale: 1.02, friction: .88, knockbackScale: 1.06, guardRegenScale: .86, gravityPulse: true, description: 'La géométrie altère brièvement la gravité et les distances.' },
  ash: { name: 'CENDRES ET GRILLE', moveScale: .96, jumpScale: .96, dodgeScale: .96, friction: .83, knockbackScale: 1.02, guardRegenScale: .92, description: 'La cendre masque les appuis et accompagne les transformations industrielles.' },
});

export const STAGE_SHIFT_STYLES = Object.freeze({
  rust: { name: 'ROUILLE INDUSTRIELLE', cue: 'SIRÈNE', duration: 150, threshold: .58, timerRatio: .58, radioScale: 1.12, overlay: 'rust', description: 'La matière se dénude en grille, métal, sang séché et pulsations rouges.' },
  decay: { name: 'DÉCOMPOSITION HUMIDE', cue: 'BATTEMENT SOURD', duration: 170, threshold: .55, timerRatio: .55, radioScale: 1.06, overlay: 'decay', description: 'La surface familière se dégrade, noircit et révèle un espace gorgé d’eau ou de moisissure.' },
  flesh: { name: 'MÉTAMORPHOSE ORGANIQUE', cue: 'VENTILATION', duration: 155, threshold: .6, timerRatio: .56, radioScale: 1.1, overlay: 'flesh', description: 'Les parois deviennent chair, tuyaux et membranes, sans copier une texture officielle.' },
  haunting: { name: 'HANTISE DE LA PIÈCE', cue: 'GRÉSILLEMENT', duration: 180, threshold: .52, timerRatio: .52, radioScale: 1.18, overlay: 'haunting', description: 'L’espace se contamine par les victimes, les murs et les objets hantés.' },
  mirror: { name: 'PASSAGE PAR LE MIROIR', cue: 'VERRE FISSURÉ', duration: 118, threshold: .62, timerRatio: .6, radioScale: 1.05, overlay: 'mirror', description: 'Le reflet se fracture et remplace progressivement la version normale du lieu.' },
  ice: { name: 'PRISE DE GLACE', cue: 'CRAQUEMENT', duration: 120, threshold: .64, timerRatio: .64, radioScale: .72, overlay: 'ice', description: 'Le cauchemar se fige, bleuit et transforme la poursuite en glissade froide.' },
  storm: { name: 'ORAGE ET DÉLUGE', cue: 'TONNERRE', duration: 145, threshold: .57, timerRatio: .58, radioScale: 1.08, overlay: 'storm', description: 'La pluie, les éclairs et l’eau envahissent progressivement l’espace.' },
  elemental: { name: 'RÉÉCRITURE DU LIVRE', cue: 'PAGE DÉCHIRÉE', duration: 135, threshold: .6, timerRatio: .6, radioScale: .88, overlay: 'elemental', description: 'La zone adopte l’élément de la page active et ses effets de terrain.' },
  loop: { name: 'BOUCLE 204863', cue: 'COUP À LA PORTE', duration: 96, threshold: .66, timerRatio: .7, radioScale: 1.25, overlay: 'loop', description: 'L’éclairage, la géométrie et les apparitions se répètent avec de légères divergences.' },
  floral: { name: 'FLORAISON DU TRAUMA', cue: 'PÉTALES', duration: 140, threshold: .6, timerRatio: .58, radioScale: .9, overlay: 'floral', description: 'Pétales, racines et masses florales envahissent le lieu en réponse au combat.' },
  shrine: { name: 'PROCESSION DU SANCTUAIRE', cue: 'CLOCHE RITUELLE', duration: 165, threshold: .56, timerRatio: .55, radioScale: .76, overlay: 'shrine', description: 'Lanternes, marques, bois sacré et floraison composent un Otherworld rituel japonais.' },
  ash: { name: 'CENDRES ET DÉCOLLEMENT', cue: 'SIRÈNE INDUSTRIELLE', duration: 145, threshold: .6, timerRatio: .58, radioScale: 1.15, overlay: 'ash', description: 'La cendre tombe pendant que les couches de surface se détachent vers le métal brûlé.' },
  ritual: { name: 'PORTE DU TRAUMA', cue: 'CHANT BAS', duration: 160, threshold: .56, timerRatio: .56, radioScale: 1.02, overlay: 'ritual', description: 'Les symboles et silhouettes accumulées ouvrent un espace de jugement partagé.' },
  signal: { name: 'RUPTURE DU SIGNAL', cue: 'CRTV', duration: 112, threshold: .62, timerRatio: .62, radioScale: 1.4, overlay: 'signal', description: 'Le CRTV et les parasites réécrivent les volumes sans transformer le lieu en Otherworld rouillé générique.' },
  void: { name: 'EFFONDREMENT DU VIDE', cue: 'ASPIRATION', duration: 126, threshold: .55, timerRatio: .54, radioScale: 1.12, overlay: 'void', description: 'La perspective s’étire et les sorties se replient vers un centre impossible.' },
});

export const STAGE_INTERACTION_TRIGGERS = Object.freeze({
  'local-heavy-impact': {
    name: 'IMPACT LOURD À PROXIMITÉ',
    description: 'Réagit une fois à un choc lourd près de l’accessoire de fond ; le temps seul ne déclenche pas cette réaction.',
  },
  'time-or-first-heavy-impact': {
    name: 'IMPACT LOURD / PREMIER TEMPS',
    description: 'Réagit au premier coup lourd, à une rupture d’armure, à un rebond au sol ou au délai initial du lieu.',
  },
  'otherworld-halfway': {
    name: 'MI-CHEMIN OTHERWORLD',
    description: 'Réagit lorsque la transformation visuelle et matérielle du lieu dépasse la moitié de sa progression.',
  },
  'low-health-or-late-round': {
    name: 'PRESSION DE FIN DE ROUND',
    description: 'Réagit à une vitalité critique ou au dernier quart du temps réglementaire.',
  },
});

export const STAGE_EVENTS = Object.freeze({
  powerFailure: { name: 'PANNE GÉNÉRALE', duration: 150, darkness: .72, radioBoost: .22, message: 'LES LUMIÈRES S’ÉTEIGNENT', animation: 'lightFlicker' },
  sirenCall: { name: 'APPEL DE LA SIRÈNE', duration: 130, darkness: .18, radioBoost: .5, gameplayRole: 'ambience', message: 'LA SIRÈNE APPELLE', animation: 'sirenPulse' },
  lockerSlam: { name: 'COULOIR DES CASIERS', duration: 100, darkness: .22, radioBoost: .25, hazard: 'lockerSlam', message: 'LES CASIERS RÉPONDENT', animation: 'lockerRattle' },
  gurneyRush: { name: 'CHARIOT SANS INFIRMIER', duration: 110, darkness: .16, radioBoost: .18, hazard: 'gurneyRush', message: 'UN CHARIOT TRAVERSE LE SERVICE', animation: 'hospitalMonitor' },
  corridorCollapse: { name: 'EFFONDREMENT DU PASSAGE', duration: 115, darkness: .25, radioBoost: .18, hazard: 'roadCollapse', message: 'LE PASSAGE SE DÉCHIRE', animation: 'chasmPulse' },
  carouselStart: { name: 'DERNIER TOUR', duration: 145, darkness: .08, radioBoost: .12, hazard: 'carouselSweep', message: 'LE MANÈGE REDÉMARRE', animation: 'carouselTurn' },
  trainRumble: { name: 'RAME FANTÔME', duration: 125, darkness: .35, radioBoost: .28, hazard: 'trainRush', message: 'UNE RAME APPROCHE', animation: 'trainPass' },
  steamRelease: { name: 'PURGE DES CONDUITES', duration: 90, darkness: .12, radioBoost: .08, hazard: 'steamVent', message: 'LES CONDUITES PURGENT', animation: 'pipeSteam' },
  waterRise: { name: 'MONTÉE DES EAUX', duration: 160, darkness: .18, radioBoost: .12, hazard: 'waterSurge', terrainPulse: 'flooded', message: 'L’EAU MONTE', animation: 'waterRipple' },
  mirrorTurn: { name: 'REFLET INVERSÉ', duration: 118, darkness: .28, radioBoost: .24, hazard: 'mirrorFracture', message: 'LE REFLET BOUGE AVANT VOUS', animation: 'mirrorGlitch' },
  rootWake: { name: 'RACINES ÉVEILLÉES', duration: 130, darkness: .16, radioBoost: .08, hazard: 'rootSnare', terrainPulse: 'petals', message: 'LES RACINES CHERCHENT UN CORPS', animation: 'rootsCreep' },
  spotlightHunt: { name: 'FAISCEAU DE SURVEILLANCE', duration: 125, darkness: .5, radioBoost: .1, gameplayRole: 'ambience', message: 'LE FAISCEAU VOUS CHERCHE', animation: 'spotlightSweep' },
  crtvLock: { name: 'SIGNAL CRTV', duration: 112, darkness: .22, radioBoost: .58, gameplayRole: 'ambience', message: 'LE SIGNAL SE VERROUILLE', animation: 'tvStatic' },
  bellToll: { name: 'CLOCHE DU JUGEMENT', duration: 118, darkness: .12, radioBoost: .2, gameplayRole: 'ambience', message: 'LA CLOCHE COMPTE LES FAUTES', animation: 'bellSwing' },
  voidPull: { name: 'ATTRACTION DU VIDE', duration: 120, darkness: .62, radioBoost: .3, hazard: 'voidPull', terrainPulse: 'void', message: 'LE VIDE TIRE SUR LE SOL', animation: 'voidSurge' },
  ashFall: { name: 'CHUTE DE CENDRES', duration: 150, darkness: .18, radioBoost: .12, hazard: 'emberFall', terrainPulse: 'ash', message: 'LA CENDRE RECOUVRE LE SOL', animation: 'ashFall' },
  portraitWatch: { name: 'REGARDS SUR LE MUR', duration: 105, darkness: .25, radioBoost: .2, gameplayRole: 'ambience', message: 'LES PORTRAITS VOUS SUIVENT', animation: 'portraitBlink' },
  elevatorCall: { name: 'APPEL D’ÉTAGE', duration: 100, darkness: .3, radioBoost: .18, hazard: 'elevatorDrop', message: 'L’ASCENSEUR ARRIVE VIDE', animation: 'elevatorBlink' },
  roomBreath: { name: 'RESPIRATION DE LA PIÈCE', duration: 135, darkness: .34, radioBoost: .32, hazard: 'roomPulse', message: 'LA PIÈCE RESPIRE', animation: 'bloodPulse' },
  stormSurge: { name: 'FRONT D’ORAGE', duration: 135, darkness: .32, radioBoost: .2, hazard: 'lightningStrike', terrainPulse: 'wetConcrete', message: 'L’ORAGE COUPE LA ROUTE', animation: 'lightning' },
  iceLock: { name: 'PRISE DU GEL', duration: 130, darkness: .12, radioBoost: -.16, hazard: 'iceFracture', terrainPulse: 'ice', message: 'LA GLACE PREND LE SOL', animation: 'iceCrack' },
  ritualWake: { name: 'RÉPONSE DU RITUEL', duration: 145, darkness: .24, radioBoost: .18, hazard: 'ritualSeal', terrainPulse: 'ritualStone', message: 'LE RITUEL RÉPOND', animation: 'ritualGlyph' },
  referenceLightReply: { name: 'VOYANT DU PALIER', duration: 100, darkness: .04, radioBoost: .04, gameplayRole: 'ambience', referenceOnly: true, message: 'LE VOYANT RÉPOND' },
  referenceDustRelease: { name: 'POUSSIÈRE DU PLÂTRE', duration: 130, darkness: 0, radioBoost: 0, gameplayRole: 'ambience', referenceOnly: true, message: 'LE PLÂTRE FRÉMIT' },
  referenceSteamPurge: { name: 'ROBINET DU PASSAGE', duration: 108, darkness: .03, radioBoost: 0, gameplayRole: 'ambience', referenceOnly: true, message: 'TROIS PURGES AU FOND DU PASSAGE' },
  referenceCellReply: { name: 'PORTE DE CELLULE', duration: 96, darkness: 0, radioBoost: 0, gameplayRole: 'ambience', referenceOnly: true, message: 'UNE PORTE VIBRE AU FOND' },
  referenceWashroomReply: { name: 'TROU DE LA SALLE DE BAIN', duration: 108, darkness: 0, radioBoost: 0, gameplayRole: 'ambience', referenceOnly: true, message: 'UNE LUEUR DANS LE PASSAGE' },
});

const SOURCE_DIRECTIVES = Object.freeze({
  sh1: { shiftStyle: 'rust', terrain: 'concrete', fog: .68, darkness: .35, radioScale: 1.18, events: ['sirenCall','powerFailure'] },
  sh2: { shiftStyle: 'decay', terrain: 'wetConcrete', fog: .74, darkness: .42, radioScale: 1.08, events: ['powerFailure','portraitWatch'] },
  sh3: { shiftStyle: 'flesh', terrain: 'concrete', fog: .46, darkness: .38, radioScale: 1.12, events: ['powerFailure','sirenCall'] },
  sh4: { shiftStyle: 'haunting', terrain: 'wood', fog: .38, darkness: .48, radioScale: 1.22, events: ['roomBreath','portraitWatch'] },
  origins: { shiftStyle: 'mirror', terrain: 'concrete', fog: .52, darkness: .4, radioScale: 1.06, events: ['mirrorTurn','powerFailure'] },
  homecoming: { shiftStyle: 'rust', terrain: 'wetConcrete', fog: .5, darkness: .4, radioScale: 1.14, events: ['sirenCall','powerFailure'] },
  shattered: { shiftStyle: 'ice', terrain: 'ice', fog: .36, darkness: .3, radioScale: .72, events: ['iceLock','powerFailure'] },
  downpour: { shiftStyle: 'storm', terrain: 'wetConcrete', fog: .58, darkness: .38, radioScale: 1.05, events: ['stormSurge','waterRise'] },
  arcade: { shiftStyle: 'rust', terrain: 'concrete', fog: .56, darkness: .36, radioScale: 1.08, events: ['sirenCall','powerFailure'] },
  bom: { shiftStyle: 'elemental', terrain: 'ritualStone', fog: .28, darkness: .26, radioScale: .84, events: ['ritualWake','mirrorTurn'] },
  pt: { shiftStyle: 'loop', terrain: 'narrow', fog: .18, darkness: .64, radioScale: 1.3, events: ['powerFailure','mirrorTurn','roomBreath'] },
  shortmessage: { shiftStyle: 'floral', terrain: 'petals', fog: .42, darkness: .38, radioScale: .92, events: ['rootWake','powerFailure'] },
  shf: { shiftStyle: 'shrine', terrain: 'petals', fog: .48, darkness: .34, radioScale: .78, events: ['ritualWake','rootWake','bellToll'] },
  film: { shiftStyle: 'ash', terrain: 'ash', fog: .62, darkness: .42, radioScale: 1.2, events: ['ashFall','sirenCall'] },
  ascension: { shiftStyle: 'ritual', terrain: 'mud', fog: .52, darkness: .42, radioScale: 1.04, events: ['ritualWake','rootWake'] },
  townfall: { shiftStyle: 'signal', terrain: 'wetConcrete', fog: .72, darkness: .46, radioScale: 1.46, events: ['crtvLock','stormSurge','powerFailure'] },
});

const FAMILY_DIRECTIVES = Object.freeze({
  school: { terrain: 'concrete', hazards: ['staticBurst','lockerSlam','fallingDebris'], events: ['lockerSlam','powerFailure'], inset: 84, layers: ['corridor','lockers','ceiling-lights'] },
  hospital: { terrain: 'concrete', hazards: ['staticBurst','gurneyRush','fallingDebris','mirrorFracture'], events: ['gurneyRush','powerFailure','elevatorCall'], inset: 92, layers: ['ward','curtains','monitor'] },
  street: { terrain: 'wetConcrete', hazards: ['staticBurst','roadCollapse','fallingDebris'], events: ['corridorCollapse','stormSurge'], inset: 74, layers: ['facades','road','fog-bank'] },
  otherworld: { terrain: 'steel', hazards: ['sirenShock','chainSweep','emberFall','voidPull'], events: ['sirenCall','voidPull'], inset: 96, layers: ['grates','chains','industrial-depth'] },
  amusement: { terrain: 'wetConcrete', hazards: ['carouselSweep','fallingDebris','staticBurst'], events: ['carouselStart','powerFailure'], inset: 86, layers: ['rides','booths','lights'] },
  apartment: { terrain: 'carpet', hazards: ['staticBurst','doorSlam','fallingDebris','portraitGaze'], events: ['portraitWatch','roomBreath'], inset: 108, layers: ['hallway','doors','windows'] },
  hotel: { terrain: 'carpet', hazards: ['portraitGaze','emberFall','mirrorFracture'], events: ['portraitWatch','mirrorTurn','ashFall'], inset: 104, layers: ['lobby','portraits','firelight'] },
  prison: { terrain: 'steel', hazards: ['chainSweep','spotlightSweep','frostWave','staticBurst'], events: ['spotlightHunt','bellToll'], inset: 92, layers: ['cells','chains','watchtower'] },
  labyrinth: { terrain: 'flooded', hazards: ['waterSurge','voidPull','chainSweep'], events: ['waterRise','voidPull'], inset: 126, layers: ['walls','pit','water'] },
  mall: { terrain: 'concrete', hazards: ['fallingDebris','doorSlam','staticBurst'], events: ['powerFailure','corridorCollapse'], inset: 82, layers: ['shops','shutters','signage'] },
  church: { terrain: 'ritualStone', hazards: ['bellToll','ritualSeal','emberFall','chainSweep'], events: ['bellToll','ritualWake'], inset: 98, layers: ['altar','nave','symbols'] },
  roof: { terrain: 'wetConcrete', hazards: ['lightningStrike','fallingDebris','windShear'], events: ['stormSurge'], inset: 70, layers: ['roofline','fence','sky'] },
  rooftop: { terrain: 'wetConcrete', hazards: ['lightningStrike','windShear','petalBloom'], events: ['stormSurge','rootWake'], inset: 70, layers: ['roofline','fence','sky'] },
  sewer: { terrain: 'flooded', hazards: ['waterSurge','steamVent','bloodTide'], events: ['waterRise','steamRelease'], inset: 92, layers: ['tunnel','pipes','canal'] },
  room: { terrain: 'wood', hazards: ['roomPulse','doorSlam','portraitGaze'], events: ['roomBreath','portraitWatch'], inset: 138, layers: ['interior','windows','haunting'] },
  subway: { terrain: 'steel', hazards: ['trainRush','staticBurst','steamVent'], events: ['trainRumble','powerFailure'], inset: 84, layers: ['platform','tunnel','rails'] },
  motel: { terrain: 'wetConcrete', hazards: ['staticBurst','doorSlam','lightningStrike'], events: ['stormSurge','powerFailure'], inset: 84, layers: ['rooms','neon','parking'] },
  ice: { terrain: 'ice', hazards: ['frostWave','iceFracture','windShear'], events: ['iceLock','powerFailure'], inset: 78, layers: ['frozen-architecture','ice-plane','snow'] },
  ship: { terrain: 'flooded', hazards: ['waterSurge','chainSweep','fallingDebris'], events: ['waterRise','stormSurge'], inset: 90, layers: ['hull','deck','waterline'] },
  book: { terrain: 'ritualStone', hazards: ['ritualSeal','mirrorFracture','staticBurst'], events: ['ritualWake','mirrorTurn'], inset: 94, layers: ['pages','nexus','glyphs'] },
  elemental: { terrain: 'ritualStone', hazards: ['ritualSeal','staticBurst','emberFall'], events: ['ritualWake'], inset: 92, layers: ['elemental-field','glyphs','void'] },
  hall: { terrain: 'narrow', hazards: ['doorSlam','mirrorFracture','staticBurst'], events: ['powerFailure','mirrorTurn'], inset: 148, layers: ['corridor','doors','ceiling-lights'] },
  villa: { terrain: 'petals', hazards: ['rootSnare','petalBloom','fallingDebris'], events: ['rootWake','powerFailure'], inset: 92, layers: ['villa-shell','messages','floral-growth'] },
  village: { terrain: 'wetConcrete', hazards: ['staticBurst','fallingDebris','rootSnare'], events: ['stormSurge','rootWake'], inset: 76, layers: ['houses','street','fog-bank'] },
  shrine: { terrain: 'ritualStone', hazards: ['ritualSeal','rootSnare','bellToll'], events: ['ritualWake','bellToll','rootWake'], inset: 98, layers: ['torii','lanterns','ritual-depth'] },
  festival: { terrain: 'petals', hazards: ['petalBloom','rootSnare','emberFall'], events: ['rootWake','ritualWake'], inset: 84, layers: ['booths','lanterns','procession'] },
  house: { terrain: 'wood', hazards: ['doorSlam','portraitGaze','mirrorFracture'], events: ['portraitWatch','mirrorTurn','roomBreath'], inset: 118, layers: ['rooms','portraits','stairs'] },
  lair: { terrain: 'mud', hazards: ['rootSnare','bloodTide','steamVent'], events: ['rootWake','steamRelease'], inset: 102, layers: ['organic-wall','pipes','roots'] },
  forest: { terrain: 'mud', hazards: ['rootSnare','windShear','staticBurst'], events: ['rootWake','stormSurge'], inset: 78, layers: ['trees','roots','fog-bank'] },
  building: { terrain: 'concrete', hazards: ['fallingDebris','doorSlam','elevatorDrop'], events: ['corridorCollapse','elevatorCall'], inset: 100, layers: ['stairwell','doors','shaft'] },
  office: { terrain: 'carpet', hazards: ['elevatorDrop','staticBurst','fallingDebris'], events: ['elevatorCall','powerFailure'], inset: 96, layers: ['desks','windows','elevator'] },
  theater: { terrain: 'wood', hazards: ['spotlightSweep','fallingDebris','emberFall'], events: ['spotlightHunt','powerFailure'], inset: 92, layers: ['stage','curtains','spotlight'] },
  workshop: { terrain: 'steel', hazards: ['steamVent','chainSweep','fallingDebris'], events: ['steamRelease','powerFailure'], inset: 88, layers: ['tools','chains','machinery'] },
  lighthouse: { terrain: 'ice', hazards: ['spotlightSweep','frostWave','windShear'], events: ['spotlightHunt','iceLock'], inset: 76, layers: ['tower','beam','shore'] },
  mine: { terrain: 'unstable', hazards: ['fallingDebris','trainRush','waterSurge'], events: ['trainRumble','corridorCollapse'], inset: 88, layers: ['shaft','cart','rock'] },
  void: { terrain: 'void', hazards: ['voidPull','doorSlam','staticBurst'], events: ['voidPull','powerFailure'], inset: 124, layers: ['impossible-depth','doors','black-center'] },
  graveyard: { terrain: 'mud', hazards: ['rootSnare','staticBurst','frostWave'], events: ['rootWake','powerFailure'], inset: 82, layers: ['graves','roots','fog-bank'] },
  lake: { terrain: 'flooded', hazards: ['waterSurge','staticBurst','frostWave'], events: ['waterRise','stormSurge'], inset: 84, layers: ['shore','boat','fog-bank'] },
  gallery: { terrain: 'carpet', hazards: ['portraitGaze','mirrorFracture','elevatorDrop'], events: ['portraitWatch','mirrorTurn'], inset: 110, layers: ['frames','corridor','elevator'] },
  marina: { terrain: 'wetConcrete', hazards: ['crtvPulse','waterSurge','windShear'], events: ['crtvLock','waterRise','stormSurge'], inset: 78, layers: ['pier','boats','fog-bank'] },
});

const STAGE_OVERRIDES = Object.freeze({
  midwich: { note: 'Les couloirs scolaires, les casiers et l’obscurité progressive structurent la menace.', shift: { style: 'rust', cue: 'SONNERIE ET SIRÈNE' }, events: ['lockerSlam','powerFailure','sirenCall'], hazards: ['lockerSlam','staticBurst','fallingDebris'] },
  midwich_nightmare: { note: 'Version déjà transformée : grille, sirène, casiers et lumière instable.', startOtherworld: true, terrain: 'steel', events: ['lockerSlam','sirenCall'], hazards: ['lockerSlam','chainSweep','emberFall'] },
  alchemilla: { note: 'L’hôpital se lit par ses moniteurs, lits, rideaux et interruptions d’éclairage.', events: ['gurneyRush','powerFailure','elevatorCall'] },
  hospital_nightmare: { note: 'Ward industrialisé où chaînes, ventilateurs et moniteurs restent actifs.', startOtherworld: true, terrain: 'steel', hazards: ['gurneyRush','chainSweep','staticBurst'], events: ['gurneyRush','sirenCall'] },
  old_silent_hill: { note: 'La rue est coupée par la brume et les gouffres, avec des lampadaires intermittents.', events: ['corridorCollapse','powerFailure'], hazards: ['roadCollapse','staticBurst'] },
  central_nightmare: { note: 'La chaussée se fracture pendant la sirène et expose la structure rouillée.', startOtherworld: true, terrain: 'unstable', events: ['corridorCollapse','sirenCall'], hazards: ['roadCollapse','emberFall','chainSweep'] },
  nowhere: { note: 'Assemblage impossible de lieux précédents, immédiatement Otherworld.', startOtherworld: true, terrain: 'steel', events: ['sirenCall','voidPull','ritualWake'], hazards: ['sirenShock','chainSweep','voidPull'] },
  lakeside_amusement: { note: 'Le parc repose sur le manège, les lumières et la pluie, pas sur un danger générique.', events: ['carouselStart','powerFailure','stormSurge'], hazards: ['carouselSweep','lightningStrike','fallingDebris'] },
  woodside: { note: 'Couloirs résidentiels étroits, portes closes et présence derrière les fenêtres.', terrain: 'carpet', events: ['portraitWatch','roomBreath'], hazards: ['doorSlam','portraitGaze','staticBurst'] },
  blue_creek: { note: 'Escaliers et espaces humides favorisent les chutes, les portes et le recul court.', terrain: 'wetConcrete', events: ['waterRise','roomBreath'], hazards: ['waterSurge','doorSlam','fallingDebris'] },
  toluca_prison: { note: 'Le froid, les cellules et la potence imposent chaînes, faisceau et cloche.', events: ['spotlightHunt','bellToll'], hazards: ['chainSweep','spotlightSweep','frostWave'] },
  labyrinth: { note: 'Géométrie instable, eau et fosse centrale : le lieu attire vers son centre.', shift: { style: 'void', cue: 'MUR QUI RECULE' }, terrain: 'void', events: ['voidPull','waterRise'], hazards: ['voidPull','waterSurge','chainSweep'] },
  hotel_otherworld: { note: 'Le Lakeview brûlé combine feu, eau noire, portraits et effacement du souvenir.', terrain: 'wetConcrete', events: ['ashFall','portraitWatch','mirrorTurn'], hazards: ['emberFall','portraitGaze','mirrorFracture'] },
  lakeview: { note: 'La version brumeuse reste calme et reflétée avant sa décomposition.', events: ['portraitWatch','powerFailure'], hazards: ['portraitGaze','staticBurst'] },
  looping_hall: { note: 'Le couloir de P.T. fonctionne par répétition, coupure de lumière, porte et apparition.', shift: { style: 'loop', cue: 'COUP À LA PORTE', threshold: .7 }, terrain: 'narrow', events: ['powerFailure','mirrorTurn','roomBreath'], hazards: ['doorSlam','mirrorFracture','roomPulse'] },
  room_302: { note: 'La chambre est refuge puis prison ; les murs, fenêtres et objets deviennent hostiles.', shift: { style: 'haunting', cue: 'TÉLÉPHONE MUET' }, terrain: 'wood', events: ['roomBreath','portraitWatch','powerFailure'], hazards: ['roomPulse','doorSlam','portraitGaze'] },
  water_prison: { note: 'Architecture circulaire, cellules et projecteur : la surveillance devient un danger lisible.', terrain: 'flooded', events: ['spotlightHunt','waterRise'], hazards: ['spotlightSweep','waterSurge','chainSweep'] },
  subway_world: { note: 'Le quai et le tunnel annoncent la rame avant son passage.', terrain: 'steel', events: ['trainRumble','powerFailure'], hazards: ['trainRush','steamVent','staticBurst'] },
  nightmare_school: { note: 'Le cauchemar de Shattered Memories est une prise de glace et une poursuite, pas une rouille.', shift: { style: 'ice', cue: 'GLACE QUI SE PROPAGE' }, terrain: 'ice', events: ['iceLock','powerFailure'], hazards: ['iceFracture','frostWave','windShear'] },
  frozen_streets: { note: 'La chaussée glacée conserve l’élan et le phare découpe la tempête.', terrain: 'ice', events: ['iceLock','spotlightHunt'], hazards: ['iceFracture','windShear','spotlightSweep'] },
  lighthouse_sm: { note: 'Le faisceau du phare sert de rythme visuel à la révélation finale.', terrain: 'ice', events: ['spotlightHunt','iceLock'], hazards: ['spotlightSweep','frostWave','windShear'] },
  villa: { note: 'Messages, cages d’escalier et floraison de Sakura Head envahissent progressivement la villa.', shift: { style: 'floral', cue: 'PÉTALES CONTRE LE VERRE' }, terrain: 'petals', events: ['rootWake','powerFailure'], hazards: ['rootSnare','petalBloom','fallingDebris'] },
  villa_rooftop: { note: 'Le toit expose le vent et la floraison sans créer une arène industrielle.', terrain: 'petals', events: ['rootWake','stormSurge'], hazards: ['windShear','petalBloom','lightningStrike'] },
  ebisugaoka: { note: 'La ville rurale des années 1960 se ferme sous la brume avant la procession florale.', shift: { style: 'shrine', cue: 'CLOCHE ET PÉTALES' }, terrain: 'wetConcrete', events: ['rootWake','bellToll'], hazards: ['rootSnare','petalBloom','bellToll'] },
  dark_shrine: { note: 'Le sanctuaire repose sur les lanternes, marques rituelles et choix de Hinako.', startOtherworld: true, terrain: 'ritualStone', events: ['ritualWake','bellToll','rootWake'], hazards: ['ritualSeal','bellToll','rootSnare'] },
  dark_shrine_corridors: { note: 'Couloirs du sanctuaire : lanternes, racines et marques qui se referment.', terrain: 'ritualStone', events: ['rootWake','ritualWake'], hazards: ['rootSnare','ritualSeal','petalBloom'] },
  corrupted_ebisugaoka: { note: 'La procession transforme la rue en axe rituel envahi de racines et lanternes.', startOtherworld: true, terrain: 'petals', events: ['rootWake','ritualWake','bellToll'], hazards: ['rootSnare','petalBloom','ritualSeal'] },
  overlook: { note: 'La pluie et les couloirs pénitentiaires soutiennent une pression lourde et humide.', terrain: 'wetConcrete', events: ['stormSurge','spotlightHunt'], hazards: ['lightningStrike','spotlightSweep','waterSurge'] },
  otherworld_void: { note: 'La poursuite du Void replie les portes et la perspective vers un point central.', shift: { style: 'void', cue: 'ASPIRATION DU COULOIR' }, startOtherworld: true, terrain: 'void', events: ['voidPull','powerFailure'], hazards: ['voidPull','doorSlam','staticBurst'] },
  devils_pit: { note: 'Mine, wagonnets, pluie et roche instable composent le danger.', terrain: 'unstable', events: ['trainRumble','corridorCollapse','waterRise'], hazards: ['trainRush','fallingDebris','waterSurge'] },
  film_midwich: { note: 'Cendre, grillage et décollage des couches suivent la mise en scène cinématographique.', shift: { style: 'ash', cue: 'SIRÈNE ET CENDRES' }, terrain: 'ash', events: ['ashFall','sirenCall','lockerSlam'], hazards: ['emberFall','lockerSlam','chainSweep'] },
  film_church: { note: 'Le sanctuaire de l’Ordre combine cloche, chaînes et métal brûlé.', terrain: 'ritualStone', events: ['bellToll','sirenCall'], hazards: ['bellToll','chainSweep','emberFall'] },
  return_lakeview: { note: 'La version cinématographique du Lakeview est structurée par le feu et les portraits.', startOtherworld: true, terrain: 'ash', events: ['ashFall','portraitWatch'], hazards: ['emberFall','portraitGaze','fallingDebris'] },
  st_amelia_marina: { note: 'Marina glaciale, brouillard marin, bateaux et CRTV : le signal remplace la sirène classique.', shift: { style: 'signal', cue: 'CRTV — SIGNAL INSTABLE' }, terrain: 'wetConcrete', events: ['crtvLock','waterRise','stormSurge'], hazards: ['crtvPulse','waterSurge','windShear'] },
  st_amelia_residential: { note: 'Quartier résidentiel écossais sous pluie, brume et parasites du CRTV.', terrain: 'wetConcrete', events: ['crtvLock','stormSurge','powerFailure'], hazards: ['crtvPulse','lightningStrike','fallingDebris'] },
  townfall_medical: { note: 'Le centre médical associe moniteurs, éclairage instable et signal CRTV.', events: ['crtvLock','gurneyRush','powerFailure'], hazards: ['crtvPulse','gurneyRush','mirrorFracture'] },
  ceg_tower: { note: 'La verticalité du bureau et l’ascenseur sont perturbés par le signal.', events: ['crtvLock','elevatorCall','powerFailure'], hazards: ['crtvPulse','elevatorDrop','fallingDebris'] },
  clara_woods: { note: 'Bois froids et brumeux où les racines répondent au signal.', terrain: 'mud', events: ['crtvLock','rootWake','stormSurge'], hazards: ['crtvPulse','rootSnare','windShear'] },
  clara_woods_different: { note: 'Version différente des bois : géométrie et métal répondent au CRTV.', shift: { style: 'signal', cue: 'CRTV — IMAGE DÉCHIRÉE' }, startOtherworld: true, terrain: 'void', events: ['crtvLock','voidPull'], hazards: ['crtvPulse','voidPull','sirenShock'] },
  alternate_facility: { note: 'Installation alternative mêlant conduites, moniteurs et signal instable.', startOtherworld: true, terrain: 'steel', events: ['crtvLock','steamRelease','powerFailure'], hazards: ['crtvPulse','steamVent','elevatorDrop'] },
  book_fire: { terrain: 'ash', shift: { style: 'elemental' }, events: ['ritualWake','ashFall'], hazards: ['emberFall','ritualSeal'] },
  book_water: { terrain: 'flooded', shift: { style: 'elemental' }, events: ['ritualWake','waterRise'], hazards: ['waterSurge','ritualSeal'] },
  book_steel: { terrain: 'steel', shift: { style: 'elemental' }, events: ['ritualWake','steamRelease'], hazards: ['chainSweep','steamVent','ritualSeal'] },
  book_blood: { terrain: 'ritualStone', shift: { style: 'elemental' }, events: ['ritualWake','roomBreath'], hazards: ['bloodTide','ritualSeal'] },
  ascension_otherworld: { note: 'La porte ouverte concentre le trauma collectif et les silhouettes multiples.', startOtherworld: true, terrain: 'ritualStone', events: ['ritualWake','voidPull'], hazards: ['ritualSeal','voidPull','sirenShock'] },
});

function terrainFromStage(stage, source, family, override) {
  const id = override.terrain || family.terrain || source.terrain || 'concrete';
  return { id, ...(STAGE_TERRAINS[id] || STAGE_TERRAINS.concrete) };
}

function shiftFromStage(stage, source, override) {
  const style = override.shift?.style || source.shiftStyle || 'rust';
  const base = STAGE_SHIFT_STYLES[style] || STAGE_SHIFT_STYLES.rust;
  const shift = {
    style,
    ...base,
    ...(override.shift || {}),
  };
  shift.threshold = clamp(Number(shift.threshold ?? base.threshold), .34, .82);
  shift.timerRatio = clamp(Number(shift.timerRatio ?? base.timerRatio), .3, .88);
  shift.duration = Math.round(clamp(Number(shift.duration ?? base.duration), 70, 240));
  shift.startOtherworld = Boolean(override.startOtherworld || stage.weather === 'runes' && stage.family === 'otherworld');
  return shift;
}

function animationTrack(id, shiftStyle) {
  const otherworldOnly = new Set(['sirenPulse','bloodPulse','metalPulse','voidSurge','ritualGlyph','rootsCreep','firePulse','ashFall']);
  const fogOnly = new Set(['fogDrift','rainSheets','snowGust','waves','boatRock','streetLightFlicker']);
  const foreground = new Set(['chainSway','rootsCreep','curtainSway','petalSpiral','ashFall','snowGust','rainSheets']);
  const phase = otherworldOnly.has(id) ? 'otherworld' : fogOnly.has(id) ? 'fog' : 'both';
  return {
    id,
    phase,
    layer: foreground.has(id) ? 'foreground' : 'midground',
    intensity: shiftStyle === 'signal' && id === 'tvStatic' ? 1.3 : shiftStyle === 'ice' && id === 'iceCrack' ? 1.25 : 1,
    cadence: ['lightFlicker','mirrorGlitch','tvStatic','shadowPass'].includes(id) ? 'irregular' : 'continuous',
  };
}

function makeInteraction(stage, eventId, index) {
  const event = STAGE_EVENTS[eventId];
  const trigger = index === 0 ? 'time-or-first-heavy-impact' : index === 1 ? 'otherworld-halfway' : 'low-health-or-late-round';
  const triggerRule = STAGE_INTERACTION_TRIGGERS[trigger];
  return {
    id: `${stage.id}_${eventId}_${index + 1}`,
    event: eventId,
    name: event?.name || eventId,
    trigger,
    triggerLabel: triggerRule?.name || trigger,
    triggerDescription: triggerRule?.description || '',
    fidelity: 'lore-grounded-versus-adaptation',
    fidelityLabel: 'MOTIF LORE · RÈGLE VERSUS',
    canonicalBasis: `${stage.name} — ${event?.message || event?.name || eventId}.`,
  };
}

export function enrichStage(stage, reference) {
  if (['brookhaven_roof','arcade_hospital_roof'].includes(stage.id)) stage.family = 'roof';
  const source = SOURCE_DIRECTIVES[stage.source] || SOURCE_DIRECTIVES.sh1;
  const family = FAMILY_DIRECTIVES[stage.family] || FAMILY_DIRECTIVES.street;
  const override = STAGE_OVERRIDES[stage.id] || {};
  const shift = shiftFromStage(stage, source, override);
  const terrain = terrainFromStage(stage, source, family, override);
  const policy = constrainStageDeck(stage,
    override.events || unique([...(family.events || []), ...(source.events || [])]).slice(0, 5),
    override.hazards || unique([...(family.hazards || []), stage.hazard]));
  const hazardDeck = policy.hazards;
  const events = policy.events;
  const props = (stage.props || []).map((value) => String(value).replaceAll('_', ' '));
  const note = override.note || generatedLorePremise(stage);
  const baseCadence = stage.family === 'otherworld' || shift.startOtherworld ? 250 : stage.family === 'hall' || stage.source === 'pt' ? 300 : 340;
  const intensity = clamp((shift.radioScale + source.radioScale) / 2, .65, 1.55);

  stage.lore = {
    premise: note,
    canonicalBasis: `${stage.name} (${stage.source.toUpperCase()}) : architecture, météo, accessoires et transformation décrits par le catalogue du projet.`,
    fidelity: override.note ? 'location-specific-lore-profile' : 'source-and-location-composite',
    adaptationNotice: 'Les timings, dégâts, zones sûres et déclencheurs sont des adaptations de versus originales, séparées du décor canonique.',
  };
  stage.terrain = terrain;
  stage.visibility = {
    fog: clamp(source.fog + (stage.weather === 'fog' ? .12 : 0) + (stage.family === 'hall' ? -.2 : 0), .08, .9),
    darkness: clamp(source.darkness + (stage.weather === 'flicker' ? .12 : 0) + (shift.startOtherworld ? .08 : 0), .12, .82),
    radioScale: clamp(source.radioScale * shift.radioScale, .45, 1.8),
    silhouetteRange: Math.round(680 - source.fog * 260 - source.darkness * 120),
    flashlight: !['ice','elemental'].includes(shift.style),
  };
  stage.shift = shift;
  stage.director = {
    cadence: Math.round(baseCadence / intensity),
    initialDelay: Math.round(230 + stage.id.length * 3),
    intensity,
    arenaInset: override.inset || family.inset || 82,
    hazardDeck,
    events,
    motifPolicy: policy,
    safeMargin: stage.family === 'hall' || stage.family === 'room' ? 86 : 118,
    signature: `${stage.id}:${shift.style}:${terrain.id}:${hazardDeck.join('+')}:${events.join('+')}`,
  };
  stage.gameplay = {
    arenaInset: stage.director.arenaInset,
    terrainRules: true,
    environmentalDirector: true,
    edgePressure: ['street','roof','rooftop','marina','ship','lake'].includes(stage.family),
    verticalPressure: ['roof','rooftop','lighthouse','mine'].includes(stage.family),
    closeQuarters: ['hall','room','apartment','hospital'].includes(stage.family),
  };
  stage.layers = unique([...(family.layers || []), ...props]);
  stage.animations = (stage.animations || []).filter(id=>localAnimationAllowed(stage,typeof id==='string'?id:id.id));
  if (!stage.animations.length) stage.animations = ['fogDrift'];
  stage.animationTracks = (stage.animations || []).map((id) => animationTrack(typeof id === 'string' ? id : id.id, shift.style));
  stage.interactions = events.slice(0, 3).map((eventId, index) => makeInteraction(stage, eventId, index));
  stage.catalogueStatus ||= 'verified-location';
  const projected = applyStageReferencePolicy(stage, reference);
  if (projected.shift.style !== stage.shift.style) {
    projected.shift = {...projected.shift,...STAGE_SHIFT_STYLES[projected.shift.style],style:projected.shift.style,
      enabled:projected.shift.enabled,startOtherworld:projected.shift.startOtherworld,referenceState:projected.shift.referenceState};
  }
  projected.terrain = stageTerrainProfile(projected);
  projected.interactions = projected.interactions.map(interaction=>({...interaction,
    triggerLabel:STAGE_INTERACTION_TRIGGERS[interaction.trigger]?.name || interaction.trigger,
    triggerDescription:STAGE_INTERACTION_TRIGGERS[interaction.trigger]?.description || '',
  }));
  projected.gameplay = {...projected.gameplay,environmentalDirector:!projected.reference.blocked,terrainRules:!projected.reference.blocked};
  projected.director.signature = `${stage.id}:${projected.shift.style}:${projected.terrain.id}:${projected.referencePolicy.worldState}:${projected.director.hazardDeck.join('+')}:${projected.director.events.join('+')}`;
  Object.assign(stage,projected);
  return stage;
}

export function stageEventDefinition(id) {
  return STAGE_EVENTS[id] || null;
}

export function stageHazardDeck(stage, phase = 'fog') {
  const deck = (stage?.director?.hazardDeck || []).filter(id=>stageReferenceHazardAllowed(stage,id));
  if (phase === 'fog') {
    const filtered = deck.filter((id) => !['sirenShock','ritualSeal','voidPull'].includes(id));
    return filtered;
  }
  return deck;
}

export function stageTerrainProfile(stage, overrideId = null) {
  const id = overrideId || stage?.terrain?.id || 'concrete';
  return { id, ...(STAGE_TERRAINS[id] || STAGE_TERRAINS.concrete) };
}

export function stageShiftStyle(stage) {
  const style = stage?.shift?.style || 'rust';
  return { style, ...(STAGE_SHIFT_STYLES[style] || STAGE_SHIFT_STYLES.rust), ...(stage?.shift || {}) };
}

export function stageDirectorSummary(stage) {
  return {
    terrain: stageTerrainProfile(stage),
    shift: stageShiftStyle(stage),
    events: (stage?.director?.events || []).map((id) => ({ id, ...clone(STAGE_EVENTS[id] || { name: id }) })),
    hazards: [...(stage?.director?.hazardDeck || [])],
    animations: [...(stage?.animationTracks || [])],
    interactions: [...(stage?.interactions || [])],
    choreography: stageChoreographyProfile(stage).cues,
    reference: stage.reference || null,
    referencePolicy: stage.referencePolicy || null,
    referenceTracks: [...(stage.referenceTracks || [])],
    motifPolicy: stage.director?.motifPolicy || null,
  };
}
