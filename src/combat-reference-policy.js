import { FIGHTER_REFERENCES } from './production-reference.js';
import { ALESSA_WEAPON_PHASES } from './weapon-phases.js';

// Gameplay transpositions of the observations collected for the production plan.
// An archetype, a name, or an occurrence of “cry / ground / apparition” is never
// evidence of a projectile, a trap or a teleport. Recipes are scoped to exact IDs;
// even an explicit baseId does not transfer powers between works or editions.
const RECIPES = Object.create(null);
const NON_COMBAT_ROLES = new Set(['noncombatant', 'environmental-obstacle', 'unverified']);
const NON_COMBAT_SCRIPTED = new Set([
  'sh3_sewer_creature_052','sh4_sacrificed_walter_071','shortmessage_sakura_head_150',
  'homecoming_bogeyman_092',
  'shattered_raw_shock_base_099','shattered_raw_shock_feminine_100','shattered_raw_shock_diseased_101',
  'shattered_raw_shock_abstract_102','shattered_raw_shock_atrophied_103'
]);
const GROUND_ONLY = new Set([
  'sh1_creeper_009', 'sh2_creeper_025', 'sh2_lying_figure_crawling_021',
  'sh3_slurper_042', 'sh4_one_truth_070', 'film_colin_the_janitor_174',
  'bom_tremer_133'
]);
const ATTACHED_BODIES = new Set(['sh4_one_truth_070']);
const MOBILE_STATIONARY = new Set(['sh1_twinfeeler_015']);
const PHASE_SUPER_LIMITS = Object.freeze({
  sh1_monster_cybil_017: 'Le super alterne tir et prise désarmée ; sa chorégraphie par phase reste à intégrer.',
  bom_blood_baby_144: 'La source décrit un rejeton créé par sa mère ; aucune invocation de Blood Mama par Blood Baby n’est attestée. Attaque propre à relever.'
});
// Classify only the explicitly authored firearm shots, never every projectile
// owned by a humanoid or an inherited weapon from a different work.
const FIREARM_SHOT_SLOTS = Object.freeze({
  sh1_monster_cybil_017:['neutralSpecial'],
  sh2_eddie_dombrowski_032:['neutralSpecial','downSpecial','super','desperation'],
  sh3_nurse_revolver_044:['neutralSpecial','super','desperation'],
  sh3_memory_of_alessa_049:['neutralSpecial','super','desperation'],
  sh4_man_with_the_coat_067:['neutralSpecial','super','desperation'],
  sh4_walter_sullivan_072:['neutralSpecial','super','desperation'],
  downpour_anne_cunningham:['neutralSpecial','super'],
  arcade_robbie_the_rabbit_shotgun:['neutralSpecial','super','desperation']
});
const HANDGUN_FIGHTERS = new Set([
  'sh1_monster_cybil_017','sh2_eddie_dombrowski_032','sh3_nurse_revolver_044',
  'sh3_memory_of_alessa_049','sh4_man_with_the_coat_067','sh4_walter_sullivan_072',
  'downpour_anne_cunningham'
]);

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
  // Shared SH1 controller: standing bite (attack 40), hovering bite (41),
  // gliding scratch (42). Decomp @8a16aab, air_screamer.h:116–118 and
  // air_screamer.c:13509–13547. Input variants and numerical tuning stay versus.
  moves:{
    ...weaponKit('Serres'),
    neutralLight:contact('Morsure au sol'),
    airLight:contact('Morsure en vol stationnaire'),
    airHeavy:contact('Griffure en vol plané'),
    neutralSpecial:contact('Griffure en vol plané — approche', {travel:3.5, hits:1, reach:150}),
    forwardSpecial:contact('Griffure planée — traversée', {travel:4, hits:1}),
    airSpecial:contact('Griffure planée — descente'),
    super:contact('Plongée brisée', {travel:3.7, hits:2, reach:210}),
    desperation:contact('Plongée brisée — dernière attaque', {travel:4.1, hits:2, reach:235})
  }
});
define('sh1_mumbler_006', {moves:weaponKit('Griffes du Mumbler')});
define('sh1_stalker_008 sh1_grey_child_005', {moves:weaponKit('Couteau')});
// SH1 enemies_en.htm: Romper leaps onto Harry, bowls him over and may hold
// him down. Bind substitutes for the original escape inputs. Travel, jump,
// knockdown and bind duration remain authored versus tuning.
define('sh1_romper_010', {
  groundHolds:{slots:['neutralSpecial','throw','super','desperation'],sourceTimingMeasured:false},
  disabledSlots:{backThrow:'Le Romper plaque sa cible ; aucune projection arrière avec échange de places n’est décrite.'},
  moves:{...weaponKit('Heurt du corps'),
    neutralSpecial:contact('Bond puis maintien au sol',{level:'throw',effectOverride:'bind',hits:1,reach:90}),
    forwardSpecial:contact('Grand bond renversant',{travel:4.8,verticalTravel:2.8,knockdown:true,hits:1}),
    throw:contact('Plaquage du corps',{effectOverride:'bind',hits:1}),
    super:contact('Bond puis emprise au sol',{level:'throw',effectOverride:'bind',travel:3.2,hits:1}),
    dodgeAttack:contact('Heurt après écart'),guardCounter:contact('Plaquage de riposte'),
    wakeupAttack:contact('Reprise par le corps')
  }
});
define('sh1_puppet_nurse_012 sh1_puppet_doctor_013', {moves:weaponKit('Couteau du parasite')});
// SH1 (1999), bosses_en.htm: headbutts precede the aggravated, open-jaw bite;
// shots into the open mouth exploit its weakness. The 70% transition and 2x
// versus multiplier are local tuning, not source HP, shell counts or timing.
const SPLIT_HEAD_JAW_SLOTS=['forwardHeavy','neutralSpecial','throw','guardCounter','super','desperation'];
define('sh1_split_head_014', {
  mouthPhase:{slots:SPLIT_HEAD_JAW_SLOTS,healthRequirement:.7,sourceTimingMeasured:false},
  firearmExposure:{slots:SPLIT_HEAD_JAW_SLOTS,damageScale:2,moveType:'contact',activeOnly:true,
    frontalOnly:true,sourceTimingMeasured:false},
  disabledSlots:{backThrow:'La gueule se referme devant le corps ; aucune projection arrière avec échange de places n’est documentée.'},
  moves:{...weaponKit('Heurt de tête'),
    forwardHeavy:contact('Mâchoire béante — avancée',{hits:1}),
    neutralSpecial:contact('Mâchoire béante — morsure',{hits:1,unblockable:true}),
    throw:contact('Capture dans la gueule',{hits:1}),
    guardCounter:contact('Morsure de riposte — mâchoire béante',{hits:1}),
    dodgeAttack:contact('Heurt de tête après écart'),
    wakeupAttack:contact('Heurt de tête au relèvement'),
    super:contact('Gueule ouverte — approche puis morsure',{hits:1,travel:2.1}),
    desperation:contact('Dernière morsure béante',{hits:1,travel:2.4})
  }
});
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
define('sh1_incubator_018', {
  // SH1 NTSC-U 1.1 decomp @8a16aab: Unknown23_Update is Incubator
  // (map7_s03_3.c:8137). unknown23.c:870–885 checks planar distance <2.5;
  // :358–378 emits attack 68, amount 1, with an outward angle. The SH1 boss
  // guide independently identifies the knockdown field and blue/red lightning:
  // https://www.silenthillmemories.net/sh1/bosses_en.htm
  // Pixels, HP conversion, cooldown, recovery and RGB values below are versus
  // choices, not measured source timings, dimensions or a canonical palette.
  proximityField:{id:'incubator-proximity',radius:150,cooldown:90,damage:1,
    knockback:6,knockdown:34,invuln:8,fidelity:'source-knockdown-versus-tuning',sourceTimingMeasured:false},
  moves:{
  neutralSpecial:shot('Décharge bleue',{projectileColor:'#80baff'}),
  super:shot('Jugement bleu',{projectileColor:'#80baff'}),
  desperation:shot('Foudre bleue du dénouement',{projectileColor:'#80baff'})
}});
define('sh1_incubus_019', {moves:{
  neutralSpecial:shot('Décharge rouge',{projectileColor:'#ff6868'}),
  super:shot('Orage du rituel',{projectileColor:'#ff6868'}),
  desperation:shot('Foudre rouge du dénouement',{projectileColor:'#ff6868'})
}});
define('sh1_monster_cybil_017', {
  // SH1 NTSC-U 1.1: initial health 4000, discard triggered strictly below 2000
  // or after ten shots. The ratio maps that source rule to this versus health pool.
  // shdecompilations/silent-hill-decomp@8a16aab925373696eaec2935dfe4f4c012b139e8
  // src/maps/characters/monster_cybil.c (MonsterCybil_Init; func_800D9AB4).
  ammoProfile:{capacity:10, exhaustion:'unarmed', disarmBelowHealthRatio:.5},
  disabledSlots:{throw:'La prise appartient à la phase désarmée ; utiliser S après abandon du pistolet (dix tirs ou vitalité sous la moitié).',
    backThrow:'La projection arrière armée n’est pas documentée dans cette rencontre.'},
  // The bullet is source attack 63 (monster_cybil.c:1182–1185), routed to
  // DamageThrownFront/Back (bodyprog/player_control.c:7133–7145). Recovery and
  // damage retain the existing versus values, not source-measured frame data.
  moves:{...weaponKit('Crosse du pistolet'), neutralSpecial:shot('Tir du pistolet', {ammoCost:1,knockdown:true})}
});
define('sh2_lying_figure_020', {
  disabledSlots:{throw:'Les bras sont enfermés ; aucune saisie de cette version n’est documentée.',
    backThrow:'Les bras sont enfermés ; aucune projection arrière n’est documentée.'},
  moves:{
    ...weaponKit('Heurt du torse'),
    crouchLight:contact('Percussion basse du corps'),
    forwardSpecial:contact('Rampement percutant', {travel:3.3, level:'low'}),
    neutralSpecial:shot('Jet thoracique'), super:shot('Souffle contrarié'), desperation:shot('Dernier jet thoracique')
  }
});
// SH2 (2001), enemies_en.htm: acid is emitted while standing; the prone
// creature instead collides with James while scrambling. This fixed crawling
// profile must not borrow the standing form's ranged attack. Speed, reach and
// input variants below remain authored versus values.
define('sh2_lying_figure_crawling_021', {
  disabledSlots:{throw:'Les bras sont enfermés ; aucune saisie de cette version n’est documentée.',
    backThrow:'Les bras sont enfermés ; aucune projection arrière n’est documentée.'},
  moves:{...weaponKit('Percussion du corps rampant'),
    neutralSpecial:contact('Percussion rampante',{travel:3.3,level:'low',hits:1,reach:150}),
    forwardSpecial:contact('Rampement percutant',{travel:3.3,level:'low',hits:1}),
    super:contact('Percussion rampante — assaut prolongé',{travel:3.7,level:'low',hits:2,reach:180}),
    desperation:contact('Dernier assaut rampant',{travel:4,level:'low',hits:2,reach:195})}
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
  // The original moth swarm catches James in an animation he can escape by
  // struggling (SH2 bosses_en.htm). Bind is this versus game's limited movement
  // and dodge restriction, not a recreated struggle or measured source timing.
  neutralSpecial:shot('Nuage d’insectes noirs', {projectileScale:1.25, projectileSpeed:8,effectOverride:'bind'}),
  super:shot('Dernier appel — essaim', {projectileScale:1.4, projectileSpeed:8,effectOverride:'bind'}),
  desperation:shot('Ultime essaim', {projectileScale:1.4, projectileSpeed:8,effectOverride:'bind'})
}});
define('sh2_mandarin_026', {moves:{...weaponKit('Appendice sous la grille'),
  neutralSpecial:contact('Frappe à travers la grille'), super:contact('Sous les pieds', {hits:2})}});
define('sh2_flesh_lip_027', {moves:{...weaponKit('Pieds de la cage'),
  neutralSpecial:contact('Poussée des pieds'), super:contact('Lit suspendu — prise courte', {level:'throw', hits:1})}});
// SH3 enemies_en.htm: padded-arm thrusts, an extending blade and arms swung
// around the body. Church Closers are faster/stronger. The circular 2D contact
// envelope and the Church's .85 startup / 1.12 damage factors are versus choices.
function closerRecipe(church=false){
  const moves={...weaponKit('Bras du Closer'),
    neutralSpecial:contact('Lame extraite du bras',{reach:210,startupAdd:7,damageScale:1.16,hits:1}),
    forwardHeavy:contact('Estoc de la lame du bras',{reach:210,startupAdd:5,hits:1}),
    forwardSpecial:contact('Poussée du bras matelassé',{reach:170,travel:1.6,startupAdd:6,hits:1}),
    downSpecial:contact('Balayage circulaire des bras',{reach:125,travel:0,level:'mid',hits:1}),
    super:contact('Rotation des bras puis lame',{reach:180,travel:0,level:'mid',hits:2}),
    dodgeAttack:contact('Bras après écart'),guardCounter:contact('Bras de riposte'),
    wakeupAttack:contact('Reprise des bras')};
  if(church)for(const move of Object.values(moves)){
    move.startupScale=(move.startupScale||1)*.85;move.damageScale=(move.damageScale||1)*1.12;
  }
  return {contactSweeps:{slots:['downSpecial','super','desperation'],sourceTimingMeasured:false},
    disabledSlots:{throw:'Les attaques relevées sont des poussées, lames et balayages ; aucune saisie n’est décrite.',
      backThrow:'Aucune projection arrière avec échange de places n’est décrite pour ce Closer.'},moves};
}
define('sh3_closer_036',closerRecipe());
define('sh3_closer_church_variant',closerRecipe(true));
// SH3 enemies_en.htm: a jumping bite is lighter than the grounded leg hold.
// Bind is the limited versus restriction, not the source's struggle sequence.
define('sh3_double_head_040', {
  groundHolds:{slots:['neutralSpecial','throw','super','desperation'],sourceTimingMeasured:false},
  disabledSlots:{backThrow:'Le Double Head retient la jambe avec la gueule ; aucune projection arrière n’est décrite.'},
  moves:{...weaponKit('Morsure du Double Head'),
    neutralSpecial:contact('Prise de jambe au sol',{level:'throw',effectOverride:'bind',reach:84,damageScale:1.15,hits:1}),
    forwardSpecial:contact('Bond puis morsure brève',{travel:4.3,verticalTravel:2.3,damageScale:.72,hits:1}),
    throw:contact('Jambe retenue entre les mâchoires',{effectOverride:'bind',hits:1}),
    super:contact('Bond puis jambe retenue',{level:'throw',effectOverride:'bind',travel:2.6,hits:1}),
    dodgeAttack:contact('Morsure après écart'),guardCounter:contact('Morsure de riposte'),
    wakeupAttack:contact('Reprise de la mâchoire')
  }
});
define('sh3_numb_body_small_037 sh3_numb_body_medium sh3_numb_body_large_038', {
  disabledSlots:{throw:'Ce corps sans bras n’a pas de saisie documentée.',backThrow:'Ce corps sans bras n’a pas de projection documentée.'},
  moves:{...weaponKit('Heurt de tête'), neutralSpecial:contact('Bond de tête', {travel:3.2}),
    super:contact('Approche puis heurt de tête', {hits:2, travel:3.2})}
});
// SH3 (2003), enemies_en.htm: frontal Handgun rounds are deflected; the
// Shotgun and Submachine Gun remain effective. Mapping other works' handguns
// to the same versus class and the idle defense window are local choices.
define('sh3_pendulum_039', {defense:{frontalHandgunBullets:true},moves:{
  ...weaponKit('Lames tournantes'),
  neutralSpecial:contact('Rotation métallique', {hits:3, reach:165}),
  forwardSpecial:contact('Charge rotative visible', {hits:2, travel:4.1}),
  super:contact('Rotation puis pointe inférieure', {hits:3, travel:2.5}),
  desperation:contact('Dernière charge rotative', {hits:3, travel:3.1})
}});
// SH3 enemies_en.htm: arm swipes and a running charge that bowls Heather over.
// Travel, damage and recovery are authored versus tuning, not source timings.
define('sh3_insane_cancer_041', {moves:{
  ...weaponKit('Bras de l’Insane Cancer'),
  neutralSpecial:contact('Charge du corps',{travel:3.2,knockdown:true,hits:1}),
  forwardSpecial:contact('Course puis collision',{travel:4,knockdown:true,hits:1}),
  super:contact('Charge renversante prolongée',{travel:3.8,knockdown:true,hits:1}),
  desperation:contact('Dernière charge du corps',{travel:4.2,knockdown:true,hits:1})
}});
// SH3 enemies_en.htm: the low rush knocks Heather down; at close range the
// Slurper holds and chews her leg. Bind substitutes for the original escape
// inputs. It does not establish a measured struggle duration or a rear throw.
define('sh3_slurper_042', {
  groundHolds:{slots:['neutralSpecial','throw','super','desperation'],sourceTimingMeasured:false},
  disabledSlots:{backThrow:'La morsure retient la jambe ; aucune projection arrière avec échange de places n’est documentée.'},
  moves:{...weaponKit('Morsure rampante'),
    neutralSpecial:contact('Prise de jambe puis morsure',{level:'throw',effectOverride:'bind',hits:1,reach:90}),
    forwardSpecial:contact('Charge rampante renversante',{travel:4,knockdown:true,level:'low',hits:1}),
    throw:contact('Jambe retenue par la mâchoire',{effectOverride:'bind',hits:1}),
    super:contact('Emprise basse prolongée',{level:'throw',effectOverride:'bind',hits:1,reach:100}),
    desperation:contact('Dernière emprise rampante',{level:'throw',effectOverride:'bind',hits:1,reach:110})
  }
});
define('sh3_nurse_revolver_044', {moves:{...weaponKit('Crosse du revolver'),
  neutralSpecial:shot('Tir de revolver'), super:shot('Ligne de soin — tir'), desperation:shot('Dernier tir de la Nurse')
}});
// SH3 boss guide (Andrew Haffenden): the ground pound "does no damage but
// staggers Heather". https://www.silenthillmemories.net/sh3/bosses_en.htm
// Zero health damage is sourced. This local, grounded collision, crouch guard
// and 18-tick stagger use versus rules; no original animation was measured.
define('sh3_split_worm_046', {
  nonDamagingStaggers:{downSpecial:{frames:18,groundedOnly:true,sourceTimingMeasured:false}},
  moves:{downSpecial:contact('Frappe du sol — déséquilibre',{meter:0})}
});
// SH3 (2003), bosses_en.htm, Missionary: frontal gunfire is stopped by its
// blades; a silencer hides the muzzle flash. Downed targets remain vulnerable.
// The runtime's attack/recovery exclusions are versus state choices, not
// measured windows from the source. No automatic counter or perfect guard.
define('sh3_missionary_047', {defense:{frontalVisibleBullets:true}});
// Each SH3 form equips exactly one weapon. Inputs, quarter-health boundaries,
// burst size, approach distance and recovery remain original versus choices.
const alessaWeaponPhases=ALESSA_WEAPON_PHASES.map((phase,index)=>{
  const firearm=phase.id==='handgun'||phase.id==='smg';
  const weapon=firearm?`Crosse du ${phase.id==='smg'?'pistolet-mitrailleur':'pistolet'}`:phase.weapon;
  const moves={...weaponKit(weapon)};
  const pressure=`Mémoire alternée — ${phase.weapon}`;
  if(firearm){
    const burst=phase.id==='smg'?{projectileBurstCount:3,projectileBurstInterval:5,active:11,damageScale:.45}:{};
    moves.neutralSpecial=shot(phase.id==='smg'?'Rafale de la mitraillette':'Tir du pistolet',
      {...burst,projectileArc:0,projectileLife:60});
    moves.super=shot(pressure,{...burst,travel:1.8});
    moves.desperation=shot(`${pressure} — dernier recours`,{...burst,travel:2.1});
  }else{
    moves.neutralSpecial=contact(`${phase.weapon} — frappe de la phase`,{hits:1,reach:phase.id==='pipe'?190:120});
    moves.super=contact(pressure,{hits:2,travel:1.8,reach:phase.id==='pipe'?215:150});
    moves.desperation=contact(`${pressure} — dernier recours`,{hits:2,travel:2.1,reach:phase.id==='pipe'?235:165});
  }
  return {...phase,index,moves};
});
define('sh3_memory_of_alessa_049', {moves:alessaWeaponPhases[0].moves,weaponPhases:alessaWeaponPhases});
define('sh3_god_050', {moves:{
  ...weaponKit('Bras de la forme incomplète'),
  neutralSpecial:shot('Flammes projetées au sol', {effectOverride:'burn', projectileSpeed:8}),
  downSpecial:shot('Vague de flammes basse', {effectOverride:'burn', level:'low', projectileSpeed:8}),
  super:shot('Couronne de flammes', {effectOverride:'burn', projectileSpeed:9}),
  desperation:shot('Dernière vague de flammes', {effectOverride:'burn', projectileSpeed:9})
}});
define('sh4_one_truth_070', {moves:{...weaponKit('Bras de la paroi'),
  neutralSpecial:contact('Balayage depuis le support'), super:contact('Deux balayages localisés', {hits:2})
}});
// SH4 enemies_en.htm: the claw swing knocks Henry to the floor. This applies
// to Wall Man only; sharing a visual support does not establish One Truth's kit.
define('sh4_wall_man_056', {moves:{...weaponKit('Griffes de la paroi'),
  neutralHeavy:contact('Balayage renversant des griffes',{knockdown:true}),
  neutralSpecial:contact('Griffes depuis le support',{knockdown:true,hits:1}),
  super:contact('Deux balayages depuis la paroi',{knockdown:true,hits:2})
}});
// SH4 enemies_en.htm: Sniffers lunge and may hold Henry in a biting grip.
// Bind substitutes for that hold; it is not a measured source escape sequence.
define('sh4_sniffer_dog_male_053 sh4_sniffer_dog_female_054', {
  groundHolds:{slots:['neutralSpecial','throw','super','desperation'],sourceTimingMeasured:false},moves:{...weaponKit('Morsure du Sniffer'),
  forwardSpecial:contact('Bond puis morsure',{travel:4.5,hits:1}),
  neutralSpecial:contact('Morsure retenue',{level:'throw',effectOverride:'bind',hits:1,reach:90}),
  throw:contact('Prise entre les mâchoires',{effectOverride:'bind',hits:1}),
  super:contact('Bond puis prise mordante',{level:'throw',effectOverride:'bind',travel:3.2,hits:1})
}});
// SH4 enemies_en.htm: a single melee hit bats Hummers down. Their health and
// the knockdown recovery below retain versus rules; this does not force death.
define('sh4_hummer_055', {hitResponse:{meleeKnockdown:true,sourceTimingMeasured:false},
  disabledSlots:{throw:'Les attaques décrites sont des morsures en vol, pas un enlèvement de Henry.',
    backThrow:'Aucune projection aérienne avec échange de places n’est documentée.'},
  moves:{...weaponKit('Morsure du Hummer'),
    neutralSpecial:contact('Morsure en vol stationnaire',{hits:1}),
    forwardSpecial:contact('Morsure en passage rapide',{hits:1,travel:4.5}),
    guardCounter:contact('Morsure de riposte'),
    dodgeAttack:contact('Morsure après écart en vol'),
    wakeupAttack:contact('Morsure à la reprise du vol'),
    super:contact('Passage rapide puis morsure',{hits:1,travel:4.3})
  }
});
define('sh4_gum_head_old_type_057', {moves:weaponKit('Poing du Gum Head')});
define('sh4_gum_head_new_type_058', {moves:weaponKit('Tube du Gum Head')});
define('sh4_patient_060', {moves:weaponKit('Marteau du Patient')});
// SH4 enemies_en.htm: Twin Victim attacks with its supporting arms, spinning
// around and diving after Henry. Pointing is not an offensive aura or a grab.
define('sh4_twin_victim_059', {
  contactSweeps:{slots:['neutralSpecial','super','desperation'],sourceTimingMeasured:false},
  disabledSlots:{throw:'Les bras servent à marcher et frapper ; aucune saisie soulevant Henry n’est décrite.',
    backThrow:'Aucune projection arrière avec échange de places n’est décrite.'},
  moves:{...weaponKit('Bras porteurs du Twin Victim'),
    neutralSpecial:contact('Rotation des bras porteurs',{reach:130,hits:2,travel:0}),
    forwardSpecial:contact('Poursuite puis plongeon',{travel:4.6,verticalTravel:2.2,hits:1}),
    super:contact('Balayages tournants des deux bras',{reach:160,hits:2,travel:0}),
    dodgeAttack:contact('Bras après écart'),guardCounter:contact('Bras porteur de riposte'),
    wakeupAttack:contact('Reprise sur les bras')
  }
});
const SH4_GHOSTS = 'sh4_ghost_victim_066 sh4_jimmy_stone_victim_1 sh4_steve_garland_victim_4 sh4_eric_walsh_victim_10 sh4_peter_walls_victim_12 sh4_sharon_blake_victim_13 sh4_toby_archbolt_victim_14';
// SH4: The Room (2004), enemies_en.htm: all these ghosts drain nearby health
// without attacking. Jasper adds larger fire damage. The local radius, pulse
// interval and health conversion are versus choices; no source timing measured.
const ghostProximity = (burning=false) => ({id:burning?'sh4-ghost-burning-proximity':'sh4-ghost-proximity',
  kind:'drain',radius:115,cooldown:60,damage:1,bonusDamage:burning?5:0,
  fidelity:'source-proximity-drain-versus-tuning',sourceTimingMeasured:false});
define(SH4_GHOSTS, {proximityField:ghostProximity(),moves:{
  neutralSpecial:nearAura('Présence dangereuse rapprochée'), downSpecial:nearAura('Aura de proximité'),
  super:nearAura('Pression de proximité', {hits:2, active:14}),
  desperation:nearAura('Dernière pression spectrale', {hits:2, active:18}),
  backSpecial:contact('Recul en flottement'), dodgeAttack:contact('Glissement de riposte')
}});
define('sh4_cynthia_velasquez_victim_16', {proximityField:ghostProximity(),moves:{
  neutralSpecial:contact('Saisie par les cheveux', {level:'throw', effectOverride:'bind'}),
  downSpecial:nearAura('Présence rapprochée de Cynthia'),
  throw:contact('Cheveux enserrants', {effectOverride:'bind'}),
  super:contact('Cheveux puis emprise courte', {level:'throw', hits:1, effectOverride:'bind'})
}});
define('sh4_jasper_gein_victim_17', {proximityField:ghostProximity(true),moves:{
  ...weaponKit('Chandelier'),
  neutralSpecial:nearAura('Proximité brûlante', {effectOverride:'burn'}),
  downSpecial:nearAura('Aura brûlante de Jasper', {effectOverride:'burn'}),
  super:nearAura('Cercle brûlant rapproché', {effectOverride:'burn', hits:2, active:14}),
  desperation:nearAura('Dernière présence brûlante', {effectOverride:'burn', hits:2, active:18})
}});
define('sh4_andrew_desalvo_victim_18', {proximityField:ghostProximity(),moves:{
  neutralSpecial:contact('Charge tournoyante', {travel:3.8}),
  downSpecial:nearAura('Présence rapprochée d’Andrew'),
  super:contact('Rotation puis collision', {travel:4, hits:2})
}});
define('sh4_richard_braintree_victim_19', {proximityField:ghostProximity(),moves:{
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
// Homecoming creatures_en.htm: Lurker uses claws and a jumping collision that
// knocks Alex down. Feral also pounces and holds him while biting his throat.
// These body motions, inputs and bind durations are versus transpositions.
define('homecoming_lurker_085', {
  disabledSlots:{throw:'La source décrit griffes et saut renversant, pas une saisie soulevant Alex.',
    backThrow:'Aucune projection arrière avec échange de places n’est décrite.'},
  moves:{...weaponKit('Griffes du Lurker'),
    neutralSpecial:contact('Entaille des griffes',{hits:2}),
    forwardSpecial:contact('Saut renversant du Lurker',{travel:4.3,verticalTravel:2.6,knockdown:true,hits:1}),
    super:contact('Bond puis percussion des griffes',{travel:3.8,knockdown:true,hits:1}),
    dodgeAttack:contact('Griffes après écart'),guardCounter:contact('Griffes de riposte'),
    wakeupAttack:contact('Reprise des griffes')
  }
});
define('homecoming_feral_086', {
  groundHolds:{slots:['neutralSpecial','throw','super','desperation'],sourceTimingMeasured:false},
  disabledSlots:{backThrow:'Le Feral plaque et mord de face ; aucune projection arrière avec échange de places n’est décrite.'},
  moves:{...weaponKit('Morsure du Feral'),
    neutralSpecial:contact('Gorge retenue entre les mâchoires',{level:'throw',effectOverride:'bind',reach:90,hits:1}),
    forwardSpecial:contact('Bond renversant du Feral',{travel:5.1,verticalTravel:3,knockdown:true,hits:1}),
    throw:contact('Plaquage puis morsure de gorge',{effectOverride:'bind',hits:1}),
    super:contact('Bond puis gorge retenue',{level:'throw',effectOverride:'bind',travel:3,hits:1}),
    dodgeAttack:contact('Morsure après écart'),guardCounter:contact('Morsure de riposte'),
    wakeupAttack:contact('Reprise de la mâchoire')
  }
});
define('homecoming_order_soldier_091', {moves:weaponKit('Tube — variante de contact')});
define('homecoming_smog_087', {
  aiSignatureOnly:true,
  disabledSlots:Object.fromEntries([
    'neutralLight','forwardLight','crouchLight','airLight','neutralHeavy','forwardHeavy','crouchHeavy','airHeavy',
    'throw','backThrow','dodgeAttack','guardCounter','wakeupAttack','forwardSpecial','backSpecial','downSpecial','airSpecial'
  ].map(key=>[key,'La seule attaque documentée du Smog est son exhalation ; ce contact, bond ou prise n’est pas attesté.'])),
  moves:{
  neutralSpecial:nearAura('Nuage de smog rapproché'),
  downSpecial:contact('Percussion de la cage thoracique', {armorFrames:0}),
  super:nearAura('Exhalation puis ouverture', {armorFrames:0, active:14})
},
  // Homecoming creatures_en.htm + walkthrough_en.htm: exposed lungs while
  // preparing its smoke are vulnerable to gunfire. The 2x multiplier and the
  // startup/active opening are versus tuning, never source damage or frames.
  firearmExposure:{slots:['neutralSpecial','super','desperation'],damageScale:2,sourceTimingMeasured:false}
});
// Homecoming creatures_en.htm: the four blades block frontal attacks including
// gunfire, while the back is vulnerable. The available grounded posture and
// armor-break/Nightmare exceptions are versus choices. A silencer does not
// remove a physical bullet from this defense (unlike Missionary's visual cue).
define('homecoming_needler_088', {
  defense:{frontalVisibleBullets:true,frontalMelee:true,silencedBullets:true},
  disabledSlots:{backSpecial:'La garde des lames est une défense de posture ; cette attente ne produit pas une frappe gratuite.',
    backThrow:'Aucune projection arrière avec échange de places n’est documentée pour cette forme.'},
  moves:{...weaponKit('Membres-lames'),
    neutralHeavy:contact('Abattement des membres-lames',{knockdown:true,armorFrames:0}),
    forwardSpecial:contact('Assaut des membres-lames',{knockdown:true,travel:4.7,hits:3}),
    throw:contact('Prise des membres antérieurs',{level:'throw',reach:90,hits:1})}
});
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
  const moves = combatEnabled ? (recipe.weaponPhases?.length
    ? recipe.weaponPhases.flatMap(phase=>Object.values(phase.moves||{}))
    : Object.values(recipe.moves || {})) : [];
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
    ...(recipe.defense?{defense:{...recipe.defense}}:{}),
    ...(recipe.mouthPhase?{mouthPhase:{...recipe.mouthPhase,slots:[...recipe.mouthPhase.slots]}}:{}),
    ...(recipe.hitResponse?{hitResponse:{...recipe.hitResponse}}:{}),
    ...(recipe.contactSweeps?{contactSweeps:{...recipe.contactSweeps,slots:[...recipe.contactSweeps.slots]}}:{}),
    ...(recipe.groundHolds?{groundHolds:{...recipe.groundHolds,slots:[...recipe.groundHolds.slots]}}:{}),
    ...(recipe.firearmExposure?{firearmExposure:{...recipe.firearmExposure,slots:[...recipe.firearmExposure.slots]}}:{}),
    ...(recipe.aiSignatureOnly?{aiSignatureOnly:true}:{}),
    ...(combatEnabled&&recipe.proximityField?{proximityField:{...recipe.proximityField}}:{}),
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

export function isFirearmProjectile(fighter, move) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES);
  if(!ref||!move?.projectile||move.trap||
    !FIREARM_SHOT_SLOTS[ref.id]?.includes(move.key))return false;
  return ref.id!=='sh3_memory_of_alessa_049'||['handgun','smg'].includes(move.weaponPhaseId);
}

export function isVisibleFirearmProjectile(fighter, move) {
  return move?.silenced!==true&&isFirearmProjectile(fighter,move);
}

export function isHandgunProjectile(fighter,move) {
  if(!isFirearmProjectile(fighter,move)||!HANDGUN_FIGHTERS.has(fighter.id))return false;
  return fighter.id!=='sh3_memory_of_alessa_049'||move.weaponPhaseId==='handgun';
}

export function passiveProximityField(fighter) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES);
  const field=ref&&RECIPES[ref.id]?.proximityField;
  return field?{...field}:null;
}

export function sourceMouthPhase(fighter) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES),phase=ref&&RECIPES[ref.id]?.mouthPhase;
  return phase?{...phase,slots:[...phase.slots]}:null;
}

export function sourceHitResponse(fighter,move,ranged=false) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES),response=ref&&RECIPES[ref.id]?.hitResponse;
  return response?.meleeKnockdown&&move&&!ranged&&!move.projectile&&!move.trap&&!move.aura&&
    move.level!=='throw'&&move.category!=='throw'?{knockdown:true,sourceTimingMeasured:false}:null;
}

export function sourceContactSweep(fighter,move) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES),sweep=ref&&RECIPES[ref.id]?.contactSweeps;
  return Boolean(sweep&&move?.enabled!==false&&sweep.slots.includes(move?.key)&&
    !move.projectile&&!move.trap&&!move.aura&&move.level!=='throw'&&move.category!=='throw');
}

// These observed leg/bite holds and pins stay on the floor. They must not
// inherit the generic versus throw's lift, launch or horizontal ejection.
export function sourceGroundHold(fighter,move) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES),hold=ref&&RECIPES[ref.id]?.groundHolds;
  return Boolean(hold&&move?.enabled!==false&&hold.slots.includes(move?.key)&&
    !move.projectile&&!move.trap&&!move.aura&&(move.level==='throw'||move.category==='throw'));
}

export function firearmExposure(fighter, attack) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES);
  const exposure=ref&&RECIPES[ref.id]?.firearmExposure;
  if(!exposure||!attack?.move||!exposure.slots.includes(attack.key)||
    attack.move.key!==attack.key||!Number.isFinite(attack.frame)||attack.frame<1||
    attack.frame>=attack.move.startup+attack.move.active)return null;
  if(exposure.moveType==='contact'){
    if(attack.move.projectile||attack.move.trap||attack.move.aura||
      exposure.activeOnly&&attack.frame<attack.move.startup)return null;
  }else if(!attack.move.aura)return null;
  return {...exposure,slots:[...exposure.slots]};
}

export function nonDamagingStagger(fighter,move) {
  const ref=matchingReference(fighter,FIGHTER_REFERENCES);
  if(!ref||!move||move.projectile||move.trap||move.aura||move.level==='throw')return null;
  const stagger=RECIPES[ref.id]?.nonDamagingStaggers?.[move.key];
  return stagger?{...stagger}:null;
}
