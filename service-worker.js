const VERSION = '0.9.6';
const CACHE_REVISION = 'parallel-20261101-pass12';
// BITMAP_REVISION_BEGIN
const BITMAP_REVISION = '7cb92ce83ffe2bd2200cff0ee8f99c232825647da9a6153c67ec5c70f5be83ce';
// BITMAP_REVISION_END
const CACHE_PREFIX = 'halo-of-flesh';
const STATIC_CACHE = `${CACHE_PREFIX}-static-v${VERSION}-${CACHE_REVISION}-${BITMAP_REVISION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-v${VERSION}-${CACHE_REVISION}-${BITMAP_REVISION}`;
const OFFLINE_URL = '/offline.html';

const ESSENTIAL_SHELL = [
  // SPRITE_ASSETS_BEGIN
  "/assets/sprites/arcade_creeper_arcade.306efcaf78b8.png",
  "/assets/sprites/arcade_creeper_arcade.e4c2182692b5.png",
  "/assets/sprites/arcade_double_head_arcade.43246b06e708.png",
  "/assets/sprites/arcade_double_head_arcade.ec8280e04d4f.png",
  "/assets/sprites/arcade_gum_head_arcade.98c6e097cb8a.png",
  "/assets/sprites/arcade_hummer_arcade.488927e4b09b.png",
  "/assets/sprites/arcade_hummer_arcade.f9d82ebc84a0.png",
  "/assets/sprites/arcade_insane_cancer_arcade.05cd8a4b7672.png",
  "/assets/sprites/arcade_insane_cancer_arcade.af065e6db36b.png",
  "/assets/sprites/arcade_mama_117.10d203f5fa42.png",
  "/assets/sprites/arcade_mama_117.fcc669873d67.png",
  "/assets/sprites/arcade_red_pyramid_thing_arcade.0afa295f8be5.png",
  "/assets/sprites/arcade_robbie_the_rabbit_axe.0a7dfbbed021.png",
  "/assets/sprites/arcade_robbie_the_rabbit_axe.3bd102f8efdf.png",
  "/assets/sprites/arcade_robbie_the_rabbit_chainsaw.204f63a13338.png",
  "/assets/sprites/arcade_scraper_arcade.cf2e735654ec.png",
  "/assets/sprites/arcade_split_worm_arcade.2f1eea0ab83a.png",
  "/assets/sprites/arcade_split_worm_arcade.64f373c1ec8a.png",
  "/assets/sprites/arcade_toadstool_arcade.6e616bb88c7c.png",
  "/assets/sprites/arcade_tremer_arcade.b02634efb95b.png",
  "/assets/sprites/arcade_tremer_arcade.f20804673e14.png",
  "/assets/sprites/arcade_tuberculosis.05377508d32c.png",
  "/assets/sprites/arcade_tuberculosis.f0f6525955eb.png",
  "/assets/sprites/ascension_fighter_179.429d47545e50.png",
  "/assets/sprites/ascension_fighter_179.f4cf31409885.png",
  "/assets/sprites/ascension_snarler_180.216c2e6ba960.png",
  "/assets/sprites/ascension_snarler_180.88e712963625.png",
  "/assets/sprites/ascension_stinger_181.a031246ea341.png",
  "/assets/sprites/ascension_the_collector_183.55a90d583450.png",
  "/assets/sprites/ascension_the_immolator_182.627713ebf694.png",
  "/assets/sprites/ascension_wanderer_178.3da19262874e.png",
  "/assets/sprites/ascension_wanderer_178.488439c222a8.png",
  "/assets/sprites/bom_air_screamer_121.98ef307e67f8.png",
  "/assets/sprites/bom_blood_baby_144.4673bf2f00b4.png",
  "/assets/sprites/bom_bogeyman_122.1d2a5e309e09.png",
  "/assets/sprites/bom_butcher_123.95b439f69ed7.png",
  "/assets/sprites/bom_double_head_124.7b4030beb9da.png",
  "/assets/sprites/bom_earth_guardian_142.99401861091a.png",
  "/assets/sprites/bom_fire_guardian_137.711e8bf0b8c7.png",
  "/assets/sprites/bom_fire_guardian_137.b974f7db88ad.png",
  "/assets/sprites/bom_ghost_125.6fa510a96dba.png",
  "/assets/sprites/bom_ghost_125.ed274487b37b.png",
  "/assets/sprites/bom_gray_child_147.947d757ecfea.png",
  "/assets/sprites/bom_insane_cancer_126.c2e9933d0d6f.png",
  "/assets/sprites/bom_light_guardian_140.eccb0bb176ea.png",
  "/assets/sprites/bom_needler_127.9f41a2f38998.png",
  "/assets/sprites/bom_nurse_128.af4b765e1618.png",
  "/assets/sprites/bom_pyramid_head_129.c02795c707f2.png",
  "/assets/sprites/bom_raw_shock_148.d6ca2baa89ed.png",
  "/assets/sprites/bom_schism_130.89c7127c0006.png",
  "/assets/sprites/bom_steel_guardian_146.221d68a36f7a.png",
  "/assets/sprites/bom_steel_guardian_146.34f6a40e4729.png",
  "/assets/sprites/bom_straight_jacket_131.ac32c6f8e574.png",
  "/assets/sprites/bom_swarm_132.96315f628aaf.png",
  "/assets/sprites/bom_tremer_133.637b09a88365.png",
  "/assets/sprites/bom_water_guardian_141.bbcd702cc4f9.png",
  "/assets/sprites/bom_wood_guardian_138.22940f0abe70.png",
  "/assets/sprites/bom_wood_guardian_138.dce588da250b.png",
  "/assets/sprites/bom_wood_sapling_139.5d67aa29cc35.png",
  "/assets/sprites/downpour_anne_cunningham.23e6f56e2c49.png",
  "/assets/sprites/downpour_anne_cunningham.3e3d10e33146.png",
  "/assets/sprites/downpour_bogeyman_115.dd7b5abc8be8.png",
  "/assets/sprites/downpour_bogeyman_115.f6de13b5497f.png",
  "/assets/sprites/downpour_doll_106.50727eee886c.png",
  "/assets/sprites/downpour_prisoner_juggernaut_110.036e48ab91fa.png",
  "/assets/sprites/downpour_prisoner_juggernaut_110.08ce5a51a4d6.png",
  "/assets/sprites/downpour_prisoner_minion_agile_109.0dedf3f6e2e4.png",
  "/assets/sprites/downpour_prisoner_minion_agile_109.713f81af60dc.png",
  "/assets/sprites/downpour_prisoner_minion_brawler_108.5fcf5cd7e9c9.png",
  "/assets/sprites/downpour_prisoner_minion_brawler_108.a393e8d32549.png",
  "/assets/sprites/downpour_screamer_104.6d78871316ed.png",
  "/assets/sprites/downpour_screamer_104.73dcfd40f467.png",
  "/assets/sprites/downpour_shadow_107.4a43797eb735.png",
  "/assets/sprites/downpour_shadow_107.d39788178ac5.png",
  "/assets/sprites/downpour_tormented_soul_111.d44d778f8573.png",
  "/assets/sprites/downpour_wall_corpse_112.e72426541b83.png",
  "/assets/sprites/downpour_weeping_bat_105.796af2e2894d.png",
  "/assets/sprites/downpour_weeping_bat_105.b30525a06086.png",
  "/assets/sprites/film_armless_man_170.25e542fa86c4.png",
  "/assets/sprites/film_armless_man_170.a103ebba3cce.png",
  "/assets/sprites/film_bubble_head_nurse_return_to_silent_hill.4dfe1e93350e.png",
  "/assets/sprites/film_creeper_return_to_silent_hill.fc7cb9789eef.png",
  "/assets/sprites/film_creeper_swarm_film_173.8171253b7eed.png",
  "/assets/sprites/film_lying_figure_return_to_silent_hill.03b36f638422.png",
  "/assets/sprites/film_mannequin_monster_176.dc9b92150b37.png",
  "/assets/sprites/film_red_pyramid_film_175.36b284a5f726.png",
  "/assets/sprites/film_red_pyramid_thing_return_to_silent_hill.04809e40872a.png",
  "/assets/sprites/film_red_pyramid_thing_return_to_silent_hill.9da7fb02b1a3.png",
  "/assets/sprites/homecoming_asphyxia_096.75b6c185db1d.png",
  "/assets/sprites/homecoming_bogeyman_092.0799468c197e.png",
  "/assets/sprites/homecoming_feral_086.d944b0e329cf.png",
  "/assets/sprites/homecoming_feral_086.dfeeb64862d0.png",
  "/assets/sprites/homecoming_lurker_085.8cd7fc032a40.png",
  "/assets/sprites/homecoming_lurker_085.f75a3e452a0b.png",
  "/assets/sprites/homecoming_needler_088.04a662ecb2cb.png",
  "/assets/sprites/homecoming_needler_088.39331afee89d.png",
  "/assets/sprites/homecoming_nurse.bdc9670f12ab.png",
  "/assets/sprites/homecoming_order_soldier_091.769a4578e91b.png",
  "/assets/sprites/homecoming_scarlet_doll_form_094.4dff90f33b7a.png",
  "/assets/sprites/homecoming_scarlet_spider_form_095.b79dfe63c212.png",
  "/assets/sprites/homecoming_schism_089.40895822f98f.png",
  "/assets/sprites/homecoming_schism_089.b94be9905392.png",
  "/assets/sprites/homecoming_sepulcher_093.0c93c08d540b.png",
  "/assets/sprites/homecoming_siam_090.88b378486212.png",
  "/assets/sprites/homecoming_smog_087.24134515bb83.png",
  "/assets/sprites/homecoming_smog_087.63ce313a3705.png",
  "/assets/sprites/homecoming_swarm.d2dfbea5f058.png",
  "/assets/sprites/origins_ariel_078.5c894ecbb354.png",
  "/assets/sprites/origins_caliban_079.1cbb09623aa2.png",
  "/assets/sprites/origins_caliban_079.f7c29928e5e8.png",
  "/assets/sprites/origins_carrion_076.cc08ebd145bb.png",
  "/assets/sprites/origins_carrion_076.fc6703575ef3.png",
  "/assets/sprites/origins_demon_084.abac0695168a.png",
  "/assets/sprites/origins_demon_084.c23b0115c82b.png",
  "/assets/sprites/origins_faceless_nurse.533898f3a5ea.png",
  "/assets/sprites/origins_memory_of_helen_grady_082.0be64df8f39b.png",
  "/assets/sprites/origins_remnant_077.912fa1130daa.png",
  "/assets/sprites/origins_straight_jacket_074.44bc2de11b55.png",
  "/assets/sprites/origins_straight_jacket_074.5b5eb9aba8ef.png",
  "/assets/sprites/origins_the_butcher_081.b2b741cbb31c.png",
  "/assets/sprites/origins_two_back_080.9e0fbbab1404.png",
  "/assets/sprites/sh1_air_screamer_001.49a50bf77b97.png",
  "/assets/sprites/sh1_air_screamer_001.9b5e20f622b4.png",
  "/assets/sprites/sh1_air_screamer_001.f208137d6414.png",
  "/assets/sprites/sh1_bloodsucker.04acbc6820b3.png",
  "/assets/sprites/sh1_creeper_009.0ed910ef61d0.png",
  "/assets/sprites/sh1_creeper_009.57fcc90186ee.png",
  "/assets/sprites/sh1_floatstinger_016.09f3672541e8.png",
  "/assets/sprites/sh1_floatstinger_016.80344808d0d5.png",
  "/assets/sprites/sh1_grey_child_005.29acacc0dd42.png",
  "/assets/sprites/sh1_groaner_003.82984139e47a.png",
  "/assets/sprites/sh1_groaner_003.b1df281db9ab.png",
  "/assets/sprites/sh1_groaner_003.cfa48c2c5630.png",
  "/assets/sprites/sh1_groaner_003.ff3410acb3a0.png",
  "/assets/sprites/sh1_hanged_scratcher_011.499200e206d4.png",
  "/assets/sprites/sh1_hanged_scratcher_011.ab639ab99e1c.png",
  "/assets/sprites/sh1_incubator_018.82460c82402f.png",
  "/assets/sprites/sh1_larval_stalker_007.f686cf003576.png",
  "/assets/sprites/sh1_mumbler_006.38861850b609.png",
  "/assets/sprites/sh1_night_flutter_002.4c283a4ddf49.png",
  "/assets/sprites/sh1_night_flutter_002.ad502d70da3d.png",
  "/assets/sprites/sh1_puppet_doctor_013.16b6777faa95.png",
  "/assets/sprites/sh1_puppet_doctor_013.7ac753d023c5.png",
  "/assets/sprites/sh1_puppet_nurse_012.14857368f9d9.png",
  "/assets/sprites/sh1_romper_010.09a1f60ce398.png",
  "/assets/sprites/sh1_romper_010.6ceba51e9d28.png",
  "/assets/sprites/sh1_romper_010.f5be63471b21.png",
  "/assets/sprites/sh1_romper_010.fa62c070efdd.png",
  "/assets/sprites/sh1_split_head_014.0422e5926e4d.png",
  "/assets/sprites/sh1_split_head_014.2b9d7a5ec550.png",
  "/assets/sprites/sh1_split_head_014.483ae08e94aa.png",
  "/assets/sprites/sh1_split_head_014.e48107f497d7.png",
  "/assets/sprites/sh1_stalker_008.4cf565113e5e.png",
  "/assets/sprites/sh1_twinfeeler_015.510c783296c3.png",
  "/assets/sprites/sh1_twinfeeler_015.7097962c69fe.png",
  "/assets/sprites/sh1_wormhead_004.08501d7f2bd5.png",
  "/assets/sprites/sh1_wormhead_004.16f970ba8d80.png",
  "/assets/sprites/sh1_wormhead_004.339fd5045d59.png",
  "/assets/sprites/sh1_wormhead_004.aebf12dd2f70.png",
  "/assets/sprites/sh2_abstract_daddy_028.21dad4720ede.png",
  "/assets/sprites/sh2_bubble_head_nurse_024.fc01d3735b74.png",
  "/assets/sprites/sh2_creeper_025.84618d11d580.png",
  "/assets/sprites/sh2_eddie_dombrowski_032.31e07d7ed871.png",
  "/assets/sprites/sh2_eddie_dombrowski_032.a6b898f61d40.png",
  "/assets/sprites/sh2_lying_figure_020.86ac95da85c7.png",
  "/assets/sprites/sh2_lying_figure_020.af82da95d655.png",
  "/assets/sprites/sh2_lying_figure_crawling_021.a2ce60380f5d.png",
  "/assets/sprites/sh2_mandarin_026.04d4be93badc.png",
  "/assets/sprites/sh2_maria_final_manifestation_033.64ae6430cae7.png",
  "/assets/sprites/sh2_red_pyramid_thing_great_knife_029.b681982c38d8.png",
  "/assets/sprites/sh2_red_pyramid_thing_great_knife_029.d21437cdebf4.png",
  "/assets/sprites/sh2_red_pyramid_thing_spear_030.797d28258adf.png",
  "/assets/sprites/sh2_red_pyramid_thing_spear_030.9ba1d2d57009.png",
  "/assets/sprites/sh2_twin_pyramid_heads_031.849712862c16.png",
  "/assets/sprites/sh3_closer_036.83102a051acb.png",
  "/assets/sprites/sh3_closer_036.a571dd362666.png",
  "/assets/sprites/sh3_closer_036.e00beefd711f.png",
  "/assets/sprites/sh3_closer_036.f18918ff7e87.png",
  "/assets/sprites/sh3_closer_church_variant.3d7aee839083.png",
  "/assets/sprites/sh3_double_head_040.0ef012666f82.png",
  "/assets/sprites/sh3_double_head_040.6d8c0b112533.png",
  "/assets/sprites/sh3_double_head_040.a0885231d6ff.png",
  "/assets/sprites/sh3_double_head_040.fd9ce712ec8f.png",
  "/assets/sprites/sh3_glutton.90c14e5d4c7d.png",
  "/assets/sprites/sh3_god_050.ef8d8f24df0b.png",
  "/assets/sprites/sh3_god_050.f6f8f72ed323.png",
  "/assets/sprites/sh3_insane_cancer_041.00201a3d31ac.png",
  "/assets/sprites/sh3_insane_cancer_041.c977f8bce191.png",
  "/assets/sprites/sh3_leonard_wolf_048.70857b7708e8.png",
  "/assets/sprites/sh3_leonard_wolf_048.cdbe5f879519.png",
  "/assets/sprites/sh3_memory_of_alessa_049.06e554d4f1a9.png",
  "/assets/sprites/sh3_memory_of_alessa_049.6e965c6ce5f6.png",
  "/assets/sprites/sh3_memory_of_alessa_049.e44abe7d8249.png",
  "/assets/sprites/sh3_missionary_047.820d3acca65f.png",
  "/assets/sprites/sh3_missionary_047.83ad51e81ec4.png",
  "/assets/sprites/sh3_numb_body_large_038.764b1384ab07.png",
  "/assets/sprites/sh3_numb_body_large_038.ac97bc943228.png",
  "/assets/sprites/sh3_numb_body_medium.4018b22369f3.png",
  "/assets/sprites/sh3_numb_body_small_037.3904c1567965.png",
  "/assets/sprites/sh3_numb_body_small_037.974da23966d7.png",
  "/assets/sprites/sh3_numb_body_small_037.9ddda808b57c.png",
  "/assets/sprites/sh3_numb_body_small_037.a69b62b7c58a.png",
  "/assets/sprites/sh3_nurse_revolver_044.f4651e9f2b8e.png",
  "/assets/sprites/sh3_pendulum_039.6bfe8afc9ed6.png",
  "/assets/sprites/sh3_pendulum_039.97153b22d0bc.png",
  "/assets/sprites/sh3_scraper_045.2bfdc425582b.png",
  "/assets/sprites/sh3_scraper_045.827b9a459105.png",
  "/assets/sprites/sh3_slurper_042.269a6ac1ed42.png",
  "/assets/sprites/sh3_slurper_042.3f0598df95a4.png",
  "/assets/sprites/sh3_slurper_042.5cda350161d4.png",
  "/assets/sprites/sh3_slurper_042.ccdea6132d6f.png",
  "/assets/sprites/sh3_split_worm_046.5bbdfc4868e0.png",
  "/assets/sprites/sh3_split_worm_046.5e27e5f4f9bf.png",
  "/assets/sprites/sh4_bottom_065.b0daf4900078.png",
  "/assets/sprites/sh4_cynthia_velasquez_victim_16.0cf7eb3b5514.png",
  "/assets/sprites/sh4_eileen_head_073.66bb06b246a6.png",
  "/assets/sprites/sh4_eric_walsh_victim_10.b61ddf804db1.png",
  "/assets/sprites/sh4_greedy_worm_069.4bcd7d35af77.png",
  "/assets/sprites/sh4_gum_head_new_type_058.5bd345e719cc.png",
  "/assets/sprites/sh4_gum_head_new_type_058.a0cf8e0bcf4e.png",
  "/assets/sprites/sh4_gum_head_old_type_057.53de39c93d92.png",
  "/assets/sprites/sh4_gum_head_old_type_057.e75cbbab2b25.png",
  "/assets/sprites/sh4_hummer_055.8561079c64dc.png",
  "/assets/sprites/sh4_hummer_055.9d51cedd24be.png",
  "/assets/sprites/sh4_hummer_055.b6ec9f61d826.png",
  "/assets/sprites/sh4_hummer_055.ce4b2fdfbc00.png",
  "/assets/sprites/sh4_jimmy_stone_victim_1.2e0fb62d4d50.png",
  "/assets/sprites/sh4_joseph_schreiber_victim_15.41c23490fcf2.png",
  "/assets/sprites/sh4_man_with_the_coat_067.76f1458da7c7.png",
  "/assets/sprites/sh4_one_truth_070.fdb890443d18.png",
  "/assets/sprites/sh4_patient_060.735bcaec2736.png",
  "/assets/sprites/sh4_peter_walls_victim_12.216d7213feb9.png",
  "/assets/sprites/sh4_richard_braintree_victim_19.0355a497acf2.png",
  "/assets/sprites/sh4_richard_braintree_victim_19.845daa5b3742.png",
  "/assets/sprites/sh4_sharon_blake_victim_13.fdf29cba0b0d.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.013381fb3f35.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.167e0e26ebd6.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.3180b9553b30.png",
  "/assets/sprites/sh4_sniffer_dog_female_054.efa3851269cf.png",
  "/assets/sprites/sh4_sniffer_dog_male_053.121baef62376.png",
  "/assets/sprites/sh4_sniffer_dog_male_053.4af1facfd8a4.png",
  "/assets/sprites/sh4_steve_garland_victim_4.1baeea09fe90.png",
  "/assets/sprites/sh4_toadstool_061.a638ed6ea7d7.png",
  "/assets/sprites/sh4_tremer_blue_063.5bcfad8047d2.png",
  "/assets/sprites/sh4_tremer_red_064.19432685fd21.png",
  "/assets/sprites/sh4_twin_victim_059.6db9971d6f09.png",
  "/assets/sprites/sh4_twin_victim_059.80b4e2ee7ffa.png",
  "/assets/sprites/sh4_wall_man_056.397d02f8b567.png",
  "/assets/sprites/sh4_walter_sullivan_072.7c27f4ac64aa.png",
  "/assets/sprites/sh4_walter_sullivan_072.f7a3056ad30d.png",
  "/assets/sprites/sh4_wheelchair_068.d81a108b0a69.png",
  "/assets/sprites/sh4_whitestool_062.bcbd83497241.png",
  "/assets/sprites/shattered_raw_shock_abstract_102.1ff0846e3fc4.png",
  "/assets/sprites/shattered_raw_shock_atrophied_103.d37aa45dec34.png",
  "/assets/sprites/shattered_raw_shock_base_099.46fc4116fef9.png",
  "/assets/sprites/shattered_raw_shock_diseased_101.59f6c89e93d6.png",
  "/assets/sprites/shattered_raw_shock_feminine_100.1226cc9a3419.png",
  "/assets/sprites/shf_ara_abare_153.a11358a86425.png",
  "/assets/sprites/shf_drum_monster_161.e7aefe55a14b.png",
  "/assets/sprites/shf_harai_katashiro_158.9cd0b864b7bd.png",
  "/assets/sprites/shf_hinako_s_father_164.ba8ac5bd4d54.png",
  "/assets/sprites/shf_irohihi_154.28e17594542d.png",
  "/assets/sprites/shf_kamugara_157.c71b154fd6db.png",
  "/assets/sprites/shf_kashimashi_151.3f2710657644.png",
  "/assets/sprites/shf_kyubi_169.abb1af2fa71c.png",
  "/assets/sprites/shf_oi_omoi_159.5b5945b00b18.png",
  "/assets/sprites/shf_rinko_like_entity_163.152fcdc05393.png",
  "/assets/sprites/shf_sakuko_like_entity_162.f15d4f66c8da.png",
  "/assets/sprites/shf_sakuko_like_entity_162.f4949f7cbcc6.png",
  "/assets/sprites/shf_shichibi_168.332222c595ae.png",
  "/assets/sprites/shf_shiromuku_166.25d31075e81d.png",
  "/assets/sprites/shf_tsukumogami_167.e8130e444254.png",
  "/assets/sprites/shortmessage_sakura_head_150.19576d20cace.png",
  "/assets/sprites/townfall_fallen.50be585d8b6e.png",
  "/assets/sprites/townfall_lunger.c53d378bc7df.png",
  "/assets/sprites/townfall_sorrowful.c27ab7f2cf5c.png",
  "/assets/sprites/townfall_the_weight.d6c2834ffe6d.png",
  "/assets/sprites/townfall_widow.853146bb99d2.png",
  // SPRITE_ASSETS_END
  // STAGE_BITMAP_ASSETS_BEGIN
  "/assets/stages/alchemilla.waiting-room.2ef1639ee034.png",
  "/assets/stages/brookhaven_roof.before-fall.52cd844d609c.png",
  "/assets/stages/lakeview.lobby.7bc2120c786c.png",
  "/assets/stages/midwich.courtyard.c9728428d63d.png",
  "/assets/stages/shopping_mall.helens-bakery.0e2670100789.png",
  "/assets/stages/woodside.corridor.c6ac083599d0.png",
  // STAGE_BITMAP_ASSETS_END
  '/',
  '/index.html',
  '/offline.html',
  '/404.html',
  '/styles.css',

  '/manifest.webmanifest',
  '/src/data.js',
  '/src/production-reference.js',
  '/src/combat-reference-policy.js',
  '/src/weapon-phases.js',
  '/src/stage-reference-policy.js',
  '/src/stage-lot12-policy.js',
  '/src/stage-lot12-renderer.js',
  '/src/lore-cinematics.js',
  '/src/reference-ui.js',
  '/src/stage-director.js',
  '/src/stage-cinematics.js',
  '/src/stage-hazard-renderer.js',
  '/src/stage-architecture.js',
  '/src/stage-lore-policy.js',
  '/src/combat-geometry.js',
  '/src/combat-resolution.js',
  '/src/movesets.js',
  '/src/shared.js',
  '/src/save-store.js',
  '/src/run-progress.js',
  '/src/player-input.js',
  '/src/touch-controls.js',
  '/src/playflow-ui.js',
  '/src/renderers.js',
  '/src/sprite-system.js',
  '/src/sprite-usage.js',
  '/src/stage-bitmaps.js',
  '/src/stage-bitmap-manifest.js',
  '/src/sprite-animation.js',
  '/src/sprite-poses.js',
  '/src/presentation-sequences.js',
  '/src/sprite-framing.js',
  '/src/sprite-inspector.js',
  '/src/sprite-clips.js',
  '/src/sprite-clip-editor.js',
  '/src/sprite-manifest.js',
  '/src/sprite-workshop.js',
  '/src/fight.js',
  '/src/command.js',
  '/src/versus.js',
  '/src/chronicles.js',
  '/src/archive.js',
];

const OPTIONAL_SHELL = [
  '/assets/icons/icon-192.svg',
  '/assets/icons/icon-512.svg',
  '/modules/unified-versus.html',
  '/modules/chronicles.html',
  '/modules/archive.html',
  '/modules/roster-command.html',
  '/modules/finisher-archive.html',
  '/modules/combat-academy.html',
  '/modules/versus.css',
  '/modules/chronicles.css',
  '/modules/archive.css',
  '/modules/sprite-workshop.html',
  '/modules/sprite-workshop.css',
  '/data/sprite-coverage.json',
];

const NEVER_CACHE = new Set([
  '/service-worker.js',
  // Export exhaustif de plusieurs mégaoctets : disponible en ligne, jamais imposé au cache critique.
  '/data/movesets.json',
]);

function isSameOrigin(request) {
  try { return new URL(request.url).origin === self.location.origin; }
  catch { return false; }
}

function canStore(request, response) {
  if (!response || !response.ok || response.type === 'opaque' || request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (NEVER_CACHE.has(url.pathname) || request.headers.has('range')) return false;
  const policy = response.headers.get('Cache-Control') || '';
  return !/no-store/i.test(policy);
}

async function cacheOne(cache, path) {
  const request = new Request(path, { cache: 'reload', credentials: 'same-origin' });
  const response = await fetch(request);
  if (!response.ok) throw new Error(`Pré-cache impossible (${response.status}) : ${path}`);
  await cache.put(request, response);
}

async function installShell() {
  const cache = await caches.open(STATIC_CACHE);
  await Promise.all(ESSENTIAL_SHELL.map((path) => cacheOne(cache, path)));
  // Une page de compatibilité secondaire ne doit jamais empêcher l’installation complète.
  await Promise.allSettled(OPTIONAL_SHELL.map((path) => cacheOne(cache, path)));
}

// A cached copy is an optimization, never a condition for delivering a valid response.
const MAX_RUNTIME_ENTRIES = 128;
async function matchCached(request, options = {}) {
  try {
    for (const name of [RUNTIME_CACHE, STATIC_CACHE]) {
      const response = await (await caches.open(name)).match(request, options);
      if (response) return response;
    }
  } catch { /* CacheStorage may be disabled; the network can still work. */ }
  return null;
}
async function storeRuntime(request, response) {
  if (!canStore(request, response)) return response;
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_ENTRIES)).map(key => cache.delete(key)));
  } catch { /* Quota/security failures must not discard already fetched bytes. */ }
  return response;
}
async function networkFirstNavigation(event) {
  const request = event.request;
  try {
    let preload;
    try { preload = await event.preloadResponse; } catch { /* Retry ordinary fetch. */ }
    return await storeRuntime(request, preload || await fetch(request));
  } catch {
    const cached = await matchCached(request, { ignoreSearch: true });
    if (cached) return cached;
    const fallback = await matchCached(OFFLINE_URL);
    return fallback || new Response('Archive hors ligne indisponible.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
async function staleWhileRevalidate(event) {
  const request = event.request;
  const update = fetch(request).then(response => storeRuntime(request, response)).catch(() => null);
  // Register synchronously: a returned cached response must not terminate the refresh.
  event.waitUntil(update.then(() => undefined));
  const cached = await matchCached(request, { ignoreSearch: true });
  return cached || (await update) || Response.error();
}
async function networkFirstData(request) {
  const url = new URL(request.url);
  if (NEVER_CACHE.has(url.pathname)) return fetch(request);
  try {
    return await storeRuntime(request, await fetch(request));
  } catch {
    return (await matchCached(request, { ignoreSearch: true })) || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(installShell());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([STATIC_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((key) => key.startsWith(`${CACHE_PREFIX}-`) && !keep.has(key))
      .map((key) => caches.delete(key)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach((client) => client.postMessage({ type: 'SHHF_SW_ACTIVATED', version: VERSION }));
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !isSameOrigin(request) || request.headers.has('range')) return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event));
    return;
  }
  if(url.pathname.startsWith('/assets/sprites/')){
    event.respondWith((async()=>{try{return (await matchCached(request)) || (await storeRuntime(request,await fetch(request)));}catch{return Response.error();}})());
    return;
  }
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(networkFirstData(request));
    return;
  }
  event.respondWith(staleWhileRevalidate(event));
});

self.addEventListener('message', (event) => {
  const type = event.data?.type;
  if (type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (type === 'CLEAR_CACHES') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith(`${CACHE_PREFIX}-`)).map((key) => caches.delete(key)));
      await installShell();
      event.source?.postMessage?.({ type: 'SHHF_CACHES_CLEARED', version: VERSION });
    })());
    return;
  }
  if (type === 'GET_VERSION') event.source?.postMessage?.({ type: 'SW_VERSION', version: VERSION });
});
