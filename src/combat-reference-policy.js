import { FIGHTER_REFERENCES } from './production-reference.js';

// Gameplay transpositions of the observations collected for the production plan.
// An archetype, a name, or an occurrence of “cry / ground / apparition” is never
// evidence of a projectile, a trap or a teleport. Recipes are scoped to exact IDs;
// even an explicit baseId does not transfer powers between works or editions.
const RECIPES = Object.create(null);
const NON_COMBAT_ROLES = new Set(['noncombatant', 'environmental-obstacle', 'unverified']);
const NON_COMBAT_SCRIPTED = new Set(['sh3_sewer_creature_052', 'sh4_sacrificed_walter_071']);
const GROUND_ONLY = new Set([
  'sh1_creeper_009', 'sh2_creeper_025', 'sh2_lying_figure_crawling_021',
  'sh3_slurper_042', 'sh4_one_truth_070', 'film_colin_the_janitor_174',
  'bom_tremer_133'
]);
const ATTACHED_BODIES = new Set(['sh4_one_truth_070']);
const MOBILE_STATIONARY = new Set(['sh1_twinfeeler_015']);
const PHASE_SUPER_LIMITS = Object.freeze({
  sh1_monster_cybil_017: 'Le super alterne tir et prise désarmée ; sa chorégraphie par phase reste à intégrer.',
  sh3_memory_of_alessa_049: 'Seule la phase couteau est active ; les quatre armes et leurs transitions restent à intégrer.',
  bom_blood_baby_144: 'L’invocation de Blood Mama demande un second acteur ; aucun projectile de remplacement.'
});

const shot = (name, extra = {}) => ({ name, projectile:true, active:1, hits:1,
  reach:720, projectileCount:1, projectileArc:0, projectileGravity:0,
  projectileSpeed:12, projectileLife:60, homing:0, ...extra });
const nearAura = (name, extra = {}) => ({ name, aura:true, reach:135, active:8, hits:1, ...extra });
const contact = (name, extra = {}) => ({ name, ...extra });
function define(ids, recipe) {
  for (const id of ids.split(' ')) RECIPES[id] = recipe;
}
function weaponKit(weapon) {
  return {
    neutralLight:contact(`${weapon} — coup bref`),
    forwardLight:contact(`${weapon} — approche`),
    crouchLight:contact(`${weapon} — frappe basse`),
    airLight:contact(`${weapon} — coup en retombée`),
    neutralHeavy:contact(`${weapon} — frappe appuyée`),
    forwardHeavy:contact(`${weapon} — grande frappe`),
    crouchHeavy:contact(`${weapon} — balayage bas`),
    airHeavy:contact(`${weapon} — frappe descendante`),
    neutralSpecial:contact(`${weapon} — pression rapprochée`),
    forwardSpecial:contact(`${weapon} — approche offensive`),
    backSpecial:contact(`${weapon} — recul puis réponse`),
    downSpecial:contact(`${weapon} — réponse basse`),
    airSpecial:contact(`${weapon} — retombée`)
  };
}

define('sh1_air_screamer_001 sh1_night_flutter_002', {
  moves:{
    ...weaponKit('Serres'),
    neutralLight:contact('Heurt de tête à terre'),
    neutralSpecial:contact('Plongée des serres', {travel:3.5, hits:1, reach:150}),
    forwardSpecial:contact('Approche plongeante', {travel:4, hits:1}),
    super:contact('Plongée brisée', {travel:3.7, hits:2, reach:210}),
    desperation:contact('Plongée brisée — dernière attaque', {travel:4.1, hits:2, reach:235})
  }
});
define('sh1_mumbler_006', {moves:weaponKit('Griffes du Mumbler')});
define('sh1_stalker_008 sh1_grey_child_005', {moves:weaponKit('Couteau')});
define('sh1_puppet_nurse_012 sh1_puppet_doctor_013', {moves:weaponKit('Couteau du parasite')});
define('sh1_twinfeeler_015', {moves:{
  neutralSpecial:shot('Crachat à l’émergence'),
  forwardSpecial:contact('Percussion en surface', {travel:3.5}),
  super:shot('Sillon aveugle — projection', {projectileSpeed:10}),
  desperation:shot('Émergence finale — projection', {projectileSpeed:10})
}});
define('sh1_floatstinger_016', {moves:{
  neutralSpecial:shot('Jet corrosif en vol'), airSpecial:shot('Projection depuis le vol'),
  forwardSpecial:contact('Heurt de l’abdomen', {travel:3}),
  super:shot('Cercle toxique — projection'), desperation:shot('Dernier jet corrosif')
}});
define('sh1_incubator_018', {moves:{
  neutralSpecial:shot('Décharge bleue'), super:shot('Jugement bleu'), desperation:shot('Foudre bleue du dénouement')
}});
define('sh1_incubus_019', {moves:{
  neutralSpecial:shot('Décharge rouge'), super:shot('Orage du rituel'), desperation:shot('Foudre rouge du dénouement')
}});
define('sh1_monster_cybil_017', {
  ammoProfile:{capacity:10, exhaustion:'unarmed'},
  disabledSlots:{throw:'La prise appartient à la phase désarmée ; utiliser S après épuisement des dix tirs.',
    backThrow:'La projection arrière armée n’est pas documentée dans cette rencontre.'},
  moves:{...weaponKit('Crosse du pistolet'), neutralSpecial:shot('Tir du pistolet', {ammoCost:1})}
});
define('sh2_lying_figure_020 sh2_lying_figure_crawling_021', {
  disabledSlots:{throw:'Les bras sont enfermés ; aucune saisie de cette version n’est documentée.',
    backThrow:'Les bras sont enfermés ; aucune projection arrière n’est documentée.'},
  moves:{
    ...weaponKit('Heurt du torse'),
    crouchLight:contact('Percussion basse du corps'),
    forwardSpecial:contact('Rampement percutant', {travel:3.3, level:'low'}),
    neutralSpecial:shot('Jet thoracique'), super:shot('Souffle contrarié'), desperation:shot('Dernier jet thoracique')
  }
});
define('sh2_mannequin_022 sh2_mannequin_ambusher_023 sh2_spider_mannequin', {moves:{
  ...weaponKit('Jambes supérieures'),
  forwardLight:contact('Approche articulée', {travel:1.45}),
  neutralSpecial:contact('Frappe des jambes supérieures', {hits:2}),
  super:contact('Feinte puis deux frappes de jambes', {hits:2, travel:1.8}),
  desperation:contact('Dernière attaque des jambes', {hits:2, travel:2.1})
}});
define('sh2_bubble_head_nurse_024 sh3_nurse_pipe_043', {moves:weaponKit('Tuyau')});
define('sh2_red_pyramid_thing_spear_030 sh2_twin_pyramid_heads_031', {moves:{
  ...weaponKit('Lance'), neutralSpecial:contact('Estoc de lance', {reach:225}),
  super:contact('Estoc puis balayage de lance', {hits:2, reach:255, travel:2.4}),
  desperation:contact('Dernier balayage de lance', {hits:2, reach:275, travel:2.6})
}});
define('sh2_eddie_dombrowski_032', {moves:{
  ...weaponKit('Poing'), neutralSpecial:shot('Tir de revolver'),
  downSpecial:shot('Tir depuis la couverture'),
  super:shot('Angle de tir'), desperation:shot('Dernier tir de revolver')
}});
define('sh2_maria_final_manifestation_033 sh2_mary_final_manifestation_034', {moves:{
  neutralSpecial:shot('Nuage d’insectes noirs', {projectileScale:1.25, projectileSpeed:8}),
  super:shot('Dernier appel — essaim', {projectileScale:1.4, projectileSpeed:8}),
  desperation:shot('Ultime essaim', {projectileScale:1.4, projectileSpeed:8})
}});
define('sh2_mandarin_026', {moves:{...weaponKit('Appendice sous la grille'),
  neutralSpecial:contact('Frappe à travers la grille'), super:contact('Sous les pieds', {hits:2})}});
define('sh2_flesh_lip_027', {moves:{...weaponKit('Pieds de la cage'),
  neutralSpecial:contact('Poussée des pieds'), super:contact('Lit suspendu — prise courte', {level:'throw', hits:1})}});
define('sh3_numb_body_small_037 sh3_numb_body_medium sh3_numb_body_large_038', {
  disabledSlots:{throw:'Ce corps sans bras n’a pas de saisie documentée.',backThrow:'Ce corps sans bras n’a pas de projection documentée.'},
  moves:{...weaponKit('Heurt de tête'), neutralSpecial:contact('Bond de tête', {travel:3.2}),
    super:contact('Approche puis heurt de tête', {hits:2, travel:3.2})}
});
define('sh3_pendulum_039', {moves:{
  ...weaponKit('Lames tournantes'),
  neutralSpecial:contact('Rotation métallique', {hits:3, reach:165}),
  forwardSpecial:contact('Charge rotative visible', {hits:2, travel:4.1}),
  super:contact('Rotation puis pointe inférieure', {hits:3, travel:2.5}),
  desperation:contact('Dernière charge rotative', {hits:3, travel:3.1})
}});
define('sh3_nurse_revolver_044', {moves:{...weaponKit('Crosse du revolver'),
  neutralSpecial:shot('Tir de revolver'), super:shot('Ligne de soin — tir'), desperation:shot('Dernier tir de la Nurse')
}});
define('sh3_memory_of_alessa_049', {moves:weaponKit('Couteau — phase initiale')});
define('sh3_god_050', {moves:{
  ...weaponKit('Bras de la forme incomplète'),
  neutralSpecial:shot('Flammes projetées au sol', {effectOverride:'burn', projectileSpeed:8}),
  downSpecial:shot('Vague de flammes basse', {effectOverride:'burn', level:'low', projectileSpeed:8}),
  super:shot('Couronne de flammes', {effectOverride:'burn', projectileSpeed:9}),
  desperation:shot('Dernière vague de flammes', {effectOverride:'burn', projectileSpeed:9})
}});
define('sh4_wall_man_056 sh4_one_truth_070', {moves:{...weaponKit('Bras de la paroi'),
  neutralSpecial:contact('Balayage depuis le support'), super:contact('Deux balayages localisés', {hits:2})
}});
define('sh4_gum_head_old_type_057', {moves:weaponKit('Poing du Gum Head')});
define('sh4_gum_head_new_type_058', {moves:weaponKit('Tube du Gum Head')});
define('sh4_patient_060', {moves:weaponKit('Marteau du Patient')});
const SH4_GHOSTS = 'sh4_ghost_victim_066 sh4_jimmy_stone_victim_1 sh4_steve_garland_victim_4 sh4_eric_walsh_victim_10 sh4_peter_walls_victim_12 sh4_sharon_blake_victim_13 sh4_toby_archbolt_victim_14';
define(SH4_GHOSTS, {moves:{
  neutralSpecial:nearAura('Présence dangereuse rapprochée'), downSpecial:nearAura('Aura de proximité'),
  super:nearAura('Pression de proximité', {hits:2, active:14}),
  desperation:nearAura('Dernière pression spectrale', {hits:2, active:18}),
  backSpecial:contact('Recul en flottement'), dodgeAttack:contact('Glissement de riposte')
}});
define('sh4_cynthia_velasquez_victim_16', {moves:{
  neutralSpecial:contact('Saisie par les cheveux', {level:'throw', effectOverride:'bind'}),
  downSpecial:nearAura('Présence rapprochée de Cynthia'),
  throw:contact('Cheveux enserrants', {effectOverride:'bind'}),
  super:contact('Cheveux puis emprise courte', {level:'throw', hits:1, effectOverride:'bind'})
}});
define('sh4_jasper_gein_victim_17', {moves:{
  ...weaponKit('Chandelier'),
  neutralSpecial:nearAura('Proximité brûlante', {effectOverride:'burn'}),
  downSpecial:nearAura('Aura brûlante de Jasper', {effectOverride:'burn'}),
  super:nearAura('Cercle brûlant rapproché', {effectOverride:'burn', hits:2, active:14}),
  desperation:nearAura('Dernière présence brûlante', {effectOverride:'burn', hits:2, active:18})
}});
define('sh4_andrew_desalvo_victim_18', {moves:{
  neutralSpecial:contact('Charge tournoyante', {travel:3.8}),
  downSpecial:nearAura('Présence rapprochée d’Andrew'),
  super:contact('Rotation puis collision', {travel:4, hits:2})
}});
define('sh4_richard_braintree_victim_19', {moves:{
  ...weaponKit('Pied-de-biche'),
  forwardSpecial:contact('Téléportation puis pied-de-biche', {teleport:'behind', hits:1}),
  backSpecial:contact('Téléportation courte', {teleport:'cross'}),
  downSpecial:nearAura('Présence rapprochée de Richard'),
  super:contact('Déplacement bref puis frappe', {teleport:'behind', hits:1})
}});
define('sh4_man_with_the_coat_067 sh4_walter_sullivan_072', {moves:{
  ...weaponKit('Tube de la rencontre'),
  neutralSpecial:shot('Tir de pistolet'), super:shot('Poursuite — tir'), desperation:shot('Dernier tir du poursuivant')
}});
define('origins_faceless_nurse', {moves:weaponKit('Seringue')});
define('origins_straight_jacket_074', {moves:{
  ...weaponKit('Heurt du corps entravé'),
  throw:contact('Saisie des jambes'), neutralSpecial:shot('Projection corrosive'),
  super:shot('Pression corrosive'), desperation:shot('Dernière projection corrosive')
}});
define('origins_two_back_080', {moves:{neutralSpecial:shot('Projection à distance'),
  super:contact('Saisie des deux corps solidaires', {level:'throw', hits:1})}});
define('origins_memory_of_helen_grady_082', {moves:{...weaponKit('Roue dentée'),
  neutralSpecial:nearAura('Nuage toxique rapproché'), super:nearAura('Pression du nuage', {hits:2, active:14})}});
define('origins_memory_of_richard_grady_083', {moves:{...weaponKit('Morsure en allonge'),
  neutralSpecial:shot('Jet à moyenne portée', {reach:430, projectileLife:34}),
  super:shot('Jet depuis les attaches murales', {reach:430, projectileLife:34})}});
define('origins_demon_084', {moves:{
  neutralSpecial:shot('Décharge d’énergie'), downSpecial:shot('Pluie de feu', {effectOverride:'burn'}),
  super:shot('Pression d’énergie'), desperation:shot('Dernière décharge')
}});
define('homecoming_nurse', {moves:weaponKit('Scalpel')});
define('homecoming_order_soldier_091', {moves:weaponKit('Tube — variante de contact')});
define('homecoming_smog_087', {moves:{
  neutralSpecial:nearAura('Nuage de smog rapproché'),
  downSpecial:contact('Percussion de la cage thoracique', {armorFrames:0}),
  super:nearAura('Exhalation puis ouverture', {armorFrames:0, active:14})
}});
define('homecoming_asphyxia_096', {moves:{
  neutralSpecial:shot('Jet toxique'), forwardSpecial:contact('Balayage de la queue', {hits:2}),
  super:shot('Pression par jet toxique')
}});
define('homecoming_amnion_hanging_form_097', {moves:{neutralSpecial:shot('Projectile toxique'),
  super:contact('Frappes de la forme suspendue', {hits:2})}});
define('downpour_screamer_104', {moves:{
  neutralSpecial:nearAura('Cri paralysant proche', {effectOverride:'bind'}),
  forwardSpecial:contact('Bond sur la cible', {travel:3.6}),
  super:nearAura('Cri puis menace rapprochée', {effectOverride:'bind', active:14})
}});
define('downpour_bogeyman_115', {moves:{...weaponKit('Marteau'),
  neutralSpecial:shot('Projection à distance'), super:contact('Approche au marteau', {hits:2, travel:2.3})}});
define('downpour_wheelman_116', {moves:{...weaponKit('Poing depuis les tubes'),
  neutralSpecial:shot('Projection de débris'), super:contact('Frappes massives', {hits:2})}});
define('downpour_anne_cunningham', {moves:{...weaponKit('Crosse'),
  neutralSpecial:shot('Tir d’Anne'), super:shot('Pression par tir')
}});
define('arcade_robbie_the_rabbit_shotgun', {moves:{...weaponKit('Crosse du fusil'),
  neutralSpecial:shot('Tir du fusil de Robbie'), super:shot('Pression au fusil'), desperation:shot('Dernier tir au fusil')
}});
define('arcade_robbie_the_rabbit_axe', {moves:weaponKit('Hache de Robbie')});
define('arcade_robbie_the_rabbit_chainsaw', {moves:weaponKit('Tronçonneuse de Robbie')});
define('bom_air_screamer_121', {moves:{...weaponKit('Serres — Book of Memories'),
  neutralSpecial:contact('Vol circulaire puis serres', {travel:3}), super:contact('Pression des serres', {travel:3, hits:2})}});
define('bom_ghost_125', {moves:{neutralSpecial:nearAura('Présence toxique persistante'),
  downSpecial:nearAura('Halo toxique'), super:nearAura('Pression du halo', {hits:2, active:14})}});
define('bom_straight_jacket_131', {moves:{neutralSpecial:shot('Projectile corrosif'), super:shot('Pression corrosive')}});
define('bom_fire_guardian_137', {moves:{
  neutralSpecial:shot('Lance-flammes de la main', {effectOverride:'burn', projectileLife:36, projectileSpeed:8}),
  downSpecial:nearAura('Explosion corporelle de feu', {effectOverride:'burn'}),
  super:shot('Pression au lance-flammes', {effectOverride:'burn', projectileLife:40, projectileSpeed:8})
}});
define('bom_earth_guardian_142', {moves:{neutralSpecial:shot('Tir de rocher'),
  downSpecial:shot('Onde du poing au sol', {level:'low'}), super:shot('Poing au sol puis onde')}});
define('bom_steel_guardian_146', {moves:{neutralSpecial:shot('Lame à distance'), super:shot('Pression des lames')}});
define('shf_kashimashi_151', {moves:weaponKit('Couteau de Kashimashi')});
define('shf_ayakakashi_152', {moves:{...weaponKit('Faucille'),
  forwardHeavy:contact('Abattement de faucille', {hits:1}),
  backSpecial:contact('Attente puis abattement', {counterStance:false})
}});
define('shf_ara_abare_153', {moves:{...weaponKit('Lame du bras'),
  neutralSpecial:contact('Abattement de la lame'), forwardSpecial:contact('Course puis abattement', {travel:3.9}),
  downSpecial:contact('Frappe basse de la lame')
}});
define('shf_harai_katashiro_158', {moves:{...weaponKit('Lames des jambes'),
  neutralSpecial:contact('Rotation des jambes-lames', {hits:2}),
  backSpecial:contact('Retrait des jambes-lames')
}});
define('shf_oi_omoi_159', {moves:{neutralSpecial:contact('Agitation des corps liés', {hits:2}),
  super:contact('Pression des corps liés', {hits:2})}});
define('shf_drum_monster_161', {moves:{...weaponKit('Bras-baguettes'),
  neutralSpecial:contact('Frappe des bras-baguettes'), super:contact('Pression des bras-baguettes', {hits:2})}});
define('shf_sakuko_like_entity_162', {moves:{...weaponKit('Masse et chaîne'),
  neutralSpecial:contact('Trois balayages de masse', {hits:3}),
  forwardSpecial:contact('Ruée de saisie', {level:'throw', travel:3.5}),
  backSpecial:contact('Téléportation de la cloche', {teleport:'cross'}),
  super:contact('Masse — trois balayages', {hits:3})
}});
define('shf_rinko_like_entity_163', {moves:{...weaponKit('Arme de Rinko-Like'),
  neutralSpecial:shot('Feu extrait de la poitrine', {effectOverride:'burn'}),
  super:contact('Deux tailles puis épaule', {hits:3})
}});
define('shf_hinako_s_father_164', {moves:{neutralSpecial:nearAura('Rugissement étourdissant proche', {effectOverride:'bind'})}});
define('shf_hinako_s_mother_165', {moves:{...weaponKit('Couteau de la forme maternelle'),
  neutralSpecial:shot('Couteau lancé'), super:contact('Tailles puis épaule', {hits:3})}});
define('shf_shiromuku_166', {moves:{...weaponKit('Bras-renard'),
  neutralSpecial:contact('Bras-renard — trois tailles', {hits:3, teleport:'behind'}),
  forwardSpecial:contact('Taille lourde glissée', {hits:1, travel:3.1}),
  backSpecial:contact('Revers défensif', {counterStance:true}),
  airSpecial:contact('Taille tournante', {hits:1}),
  super:contact('Bras-renard — téléportation puis trois tailles', {hits:3, teleport:'behind'})
}});
define('shf_tsukumogami_167', {moves:{...weaponKit('Bâton de la phase initiale'),
  neutralSpecial:contact('Pointe puis tour-abattement', {hits:2}),
  forwardSpecial:contact('Frappes des pieds puis approche', {hits:2}),
  super:contact('Deux frappes des pieds', {hits:2})
}});
define('shf_shichibi_168 shf_kyubi_169', {moves:{...weaponKit('Queues'),
  neutralSpecial:contact('Patte puis rotation des queues', {hits:2}),
  forwardSpecial:contact('Bond et morsure', {travel:3.5, hits:1}),
  super:contact('Patte puis balayage des queues', {hits:2}),
  desperation:contact('Dernier abattement des queues', {hits:2})
}});
define('townfall_lunger', {
  disabledSlots:{throw:'Les bras sont attachés ; la prise reste non documentée.',backThrow:'Les bras sont attachés ; la projection reste non documentée.'},
  moves:{...weaponKit('Tête-hache'), neutralSpecial:contact('Heurt de tête-hache'),
    forwardSpecial:contact('Charge de la tête-hache', {travel:4.1}),
    super:contact('Approche puis heurt de tête-hache', {hits:2, travel:3.5})}
});
define('townfall_sorrowful', {moves:{...weaponKit('Appendice thoracique'),
  neutralSpecial:contact('Fouet thoracique attaché', {reach:170, hits:1}),
  forwardSpecial:contact('Saisie rapprochée', {level:'throw', reach:72}),
  super:contact('Fouet puis emprise courte', {hits:2, reach:170})
}});
define('townfall_fallen', {moves:{
  neutralSpecial:contact('Embuscade de proximité'),
  forwardSpecial:contact('Réveil puis approche visible', {travel:3.2, hits:1}),
  dodgeAttack:contact('Écart puis assaut visible', {travel:2.6, hits:1}),
  wakeupAttack:contact('Reprise depuis l’immobilité', {hits:1}),
  super:contact('Attente puis assaut rapproché', {travel:2.9, hits:2})
}});
define('ascension_the_immolator_182', {moves:{
  neutralSpecial:shot('Torrent de feu', {effectOverride:'burn', projectileSpeed:8, projectileLife:42}),
  super:shot('Pression du torrent de feu', {effectOverride:'burn', projectileSpeed:8, projectileLife:46})
}});

function matchingReference(fighter, references) {
  const ref = fighter && references[fighter.id];
  return ref && ref.id === fighter.id && ref.source === fighter.source ? ref : null;
}

// A base reference is useful for the description only when it names this exact
// work and edition. Recipes above deliberately do not inherit through this link.
function observedBasis(ref, references, seen = new Set()) {
  if (!ref || seen.has(ref.id)) return [];
  seen.add(ref.id);
  const own = (ref.observedMoves || []).filter(move => move.status === 'documente-secondaire');
  const base = ref.baseId && references[ref.baseId];
  const sameEdition = !ref.referenceEdition || !base?.referenceEdition || ref.referenceEdition === base.referenceEdition;
  if (!base || base.id !== ref.baseId || base.source !== ref.source || !sameEdition) return own;
  // A distinct phase may cite its parent without authorizing that parent's kit.
  const explicitHeritage = (ref.observedMoves || []).some(move => move.status === 'heritage-documente');
  if (own.length || !explicitHeritage && (ref.observedMoves || []).length) return own;
  return observedBasis(base, references, seen);
}

export function combatReferencePolicy(fighter, references = FIGHTER_REFERENCES) {
  const ref = matchingReference(fighter, references);
  const role = ref?.combatRole || 'unverified';
  const combatEnabled = Boolean(ref && !NON_COMBAT_ROLES.has(role) && !NON_COMBAT_SCRIPTED.has(ref.id));
  const attached = ATTACHED_BODIES.has(fighter?.id) || role === 'stationary-boss' && !MOBILE_STATIONARY.has(fighter?.id);
  const observed = observedBasis(ref, references);
  const recipe = ref ? RECIPES[ref.id] || {} : {};
  const proposal = ref?.proposals?.super;
  const superReason = !combatEnabled ? 'Le rôle documenté ne permet pas un kit de combat autonome.'
    : PHASE_SUPER_LIMITS[ref.id] || (proposal?.status !== 'adaptation-versus-proposee'
      ? proposal?.description || 'Référence du super manquante.'
      : !observed.length ? 'Les gestes de cette édition restent à relever avant de produire un super.' : '');
  const moves = combatEnabled ? Object.values(recipe.moves || {}) : [];
  const effects = [...new Set(moves.map(move => move.effectOverride).filter(Boolean))];
  return {
    id: fighter?.id || null,
    source: ref?.source || fighter?.source || null,
    edition: ref?.referenceEdition || ref?.source || null,
    role,
    adaptationMode: role === 'scripted-encounter' && combatEnabled ? 'versus-scripted' : 'versus-transposition',
    combatEnabled,
    canMove: combatEnabled && !attached,
    canJump: combatEnabled && !attached && role !== 'stationary-boss' && !GROUND_ONLY.has(ref?.id),
    canDodge: combatEnabled && !attached,
    referenceIds: [...(ref?.referenceIds || [])],
    observedBasis: observed.map(move => `${move.name} : ${move.description}`).join(' '),
    superEnabled: !superReason,
    superReason,
    superName: proposal?.name || null,
    superDescription: proposal?.description || null,
    capabilities: {
      reviewed: Boolean(ref),
      projectile: moves.some(move => move.projectile),
      teleport: moves.some(move => move.teleport),
      trap: moves.some(move => move.trap),
      aura: moves.some(move => move.aura),
      effects
    }
  };
}

export function combatReferenceRecipe(fighter) {
  const ref = matchingReference(fighter, FIGHTER_REFERENCES);
  return structuredClone(ref ? RECIPES[ref.id] || {} : {});
}
