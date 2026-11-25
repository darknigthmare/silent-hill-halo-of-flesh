// Authored independent projectile PNGs. Static candidates; fidelity remains unverified.
export const PROJECTILE_BITMAPS = {
  "sh1_incubator_blue_lightning": {
    "id": "sh1_incubator_blue_lightning",
    "fighterId": "sh1_incubator_018",
    "source": "sh1",
    "slots": [
      "neutralSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "CL_SH1_BOSSES"
    ],
    "presentation": {
      "heightInRadii": 4,
      "anchor": "center",
      "facing": 1,
      "composite": "screen"
    },
    "notes": [
      "La source documente les décharges bleues d’Incubator. Aucun relevé de texture, tracé, palette RGB ou cadence originale n’est disponible.",
      "Reconstruction visuelle statique pour le projectile horizontal existant du versus ; pas un cycle animé ni une décharge originale mesurée."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/sh1_incubator_blue_lightning.bc62471eecc3.png",
      "sha256": "bc62471eecc380da70aaa1bf78e59c342094d9ea7597eaaff5090ba4812f7ffd",
      "bytes": 1025146,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        89,
        340,
        1455,
        704
      ]
    }
  },
  "sh2_lying_figure_acid": {
    "id": "sh2_lying_figure_acid",
    "fighterId": "sh2_lying_figure_020",
    "source": "sh2",
    "slots": [
      "neutralSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "CL_SH2_ENEMIES",
      "CL_SH2_CREATURES"
    ],
    "presentation": {
      "heightInRadii": 4,
      "anchor": "center",
      "facing": 1,
      "composite": "source-over"
    },
    "notes": [
      "La source documente le jet thoracique de la Lying Figure debout de SH2 original. Aucun transfert vers la forme rampante ou le remake.",
      "Nuage jaune pâle reconstruit en un PNG statique ; microtexture, taille, orientation opposée et durée restent des choix visuels du versus sans capture d’attaque exacte."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/sh2_lying_figure_acid.947604e7ff5a.png",
      "sha256": "947604e7ff5ab1dad111a9b0000585de8ed007e8ad07fd632fbfee515039cf51",
      "bytes": 1389718,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        140,
        273,
        1397,
        752
      ]
    }
  },
  "sh3_god_ground_flame": {
    "id": "sh3_god_ground_flame",
    "fighterId": "sh3_god_050",
    "source": "sh3",
    "slots": [
      "neutralSpecial",
      "downSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "CL_SH3_BOSSES",
      "CL_SH3_CREATURES"
    ],
    "presentation": {
      "heightInRadii": 5,
      "anchor": "ground",
      "facing": 1,
      "composite": "screen",
      "groundBaseline": 0.735
    },
    "notes": [
      "Le guide décrit le feu projeté au sol par God dans SH3 original. Aucun nouveau projectile aérien ou météore ajouté.",
      "La ligne lumineuse observée à environ 73,5 % de la hauteur du PNG natif est alignée avec le sol réel ; le halo translucide peut dépasser sous cette ligne. Ce repère concerne l’illustration générée, pas une mesure canonique.",
      "Image indépendante statique ; forme, dispersion et cadence originales non certifiées."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/sh3_god_ground_flame.8b645595b188.png",
      "sha256": "8b645595b188a85e2286d44ad7b51ae46a4201a3ebab01342dad7485b65a96b8",
      "bytes": 1258820,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        73,
        369,
        1437,
        790
      ]
    }
  },
  "bom_earth_guardian_rock": {
    "id": "bom_earth_guardian_rock",
    "fighterId": "bom_earth_guardian_142",
    "source": "bom",
    "slots": [
      "neutralSpecial"
    ],
    "referenceIds": [
      "EXT24",
      "EXT20",
      "EXT12_REF_BOM_EARTH_GUARDIAN_142_VIEW_1_20261101",
      "EXT12_REF_BOM_EARTH_GUARDIAN_142_VIEW_2_20261101"
    ],
    "presentation": {
      "heightInRadii": 3,
      "anchor": "center",
      "composite": "source-over",
      "facing": 1
    },
    "notes": [
      "Separate levitating irregular brown/olive stone boulders are visible in E3 2012 gameplay images; they are distinct from the guardian head and articulated hands. Produce one rock, not the full group.",
      "Promotional pre-release E3 2012 imagery; retail material identity not certified.",
      "Side-view reconstruction and gameplay scale remain versus presentation choices.",
      "No source trajectory, velocity, rotation, phase count or animation measured.",
      "Sources et reçus : docs/production/vague28/projectiles/."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/bom_earth_guardian_rock.f8fb0ce119d0.png",
      "sha256": "f8fb0ce119d0dd8350095ee410ee0e904ef843344bb3a59a91a63fb4d54eb7ce",
      "bytes": 1370319,
      "width": 1254,
      "height": 1254,
      "framingBounds": [
        105,
        111,
        1144,
        1144
      ]
    }
  },
  "bom_fire_guardian_hand_flame": {
    "id": "bom_fire_guardian_hand_flame",
    "fighterId": "bom_fire_guardian_137",
    "source": "bom",
    "slots": [
      "neutralSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "EXT22",
      "EXT20"
    ],
    "presentation": {
      "heightInRadii": 3,
      "anchor": "center",
      "composite": "screen",
      "facing": 1
    },
    "notes": [
      "The emitted hand-flame appears as a bright white irregular core with pink-magenta lobes and violet fringes, distinct from the orange environment/body fire. The 01:27:50 view shows one stream; 01:29:10 shows a double emission. Only one independent stream is requested for each existing versus shot.",
      "Evidence is a public video native storyboard preview at 160x90, sampled every ten seconds.",
      "Broad color and stream shape observed; no exact contour, RGB palette, temporal cycle or original-resolution texture certified.",
      "Horizontal independent traveling sprite is a versus rendering adaptation; the original hand jet is not newly implemented as a continuous beam.",
      "Sources et reçus : docs/production/vague28/projectiles/."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/bom_fire_guardian_hand_flame.650230316e42.png",
      "sha256": "650230316e42961747e64890138308c4ff93c4241ba1d701e52bba034d4ef370",
      "bytes": 1220634,
      "width": 2172,
      "height": 724,
      "framingBounds": [
        164,
        47,
        2074,
        662
      ]
    }
  },
  "sh1_floatstinger_acid_cloud": {
    "id": "sh1_floatstinger_acid_cloud",
    "fighterId": "sh1_floatstinger_016",
    "source": "sh1",
    "slots": [
      "neutralSpecial",
      "airSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "CL_SH1_BOSSES",
      "CL_SH1_CREATURES"
    ],
    "presentation": {
      "heightInRadii": 3,
      "anchor": "center",
      "composite": "source-over",
      "facing": 1
    },
    "notes": [
      "Original Silent Hill Floatstinger gameplay repost shows a diffuse olive-green/brown mottled acid emission; the caption is not source evidence for precise chemistry.",
      "Reference is a public 498x370 gameplay GIF with a caption, not an original-resolution capture or certified platform master.",
      "Broad palette and cloudy material observed; isolated side-view contour, texture, scale and direction are versus presentation choices.",
      "One static PNG reused only by the existing Floatstinger projectile slots; no new move, trajectory, timing, phase count or animation inferred.",
      "Source evidence, exact prompts and native output receipts: docs/production/vague29/projectiles/."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/sh1_floatstinger_acid_cloud.9d0dee3a72ce.png",
      "sha256": "9d0dee3a72ce64b1e06d39acd8298fd832f81603e934bd9d9887064bf525fd83",
      "bytes": 1517372,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        135,
        225,
        1399,
        798
      ]
    }
  },
  "homecoming_asphyxia_toxic_plume": {
    "id": "homecoming_asphyxia_toxic_plume",
    "fighterId": "homecoming_asphyxia_096",
    "source": "homecoming",
    "slots": [
      "neutralSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "EXT05",
      "EXT06"
    ],
    "presentation": {
      "heightInRadii": 3,
      "anchor": "center",
      "composite": "source-over",
      "facing": 1
    },
    "notes": [
      "Silent Hill Homecoming Asphyxia gameplay previews at approximately 03:15 and 03:50 show a dark charcoal/brown irregular mouth emission.",
      "Reference is public native 320x180 YouTube storyboard imagery sampled every five seconds; exact RGB palette, fine contour and original texture are not certified.",
      "The generated smoke is a detailed static interpretation of the visible dark effect; side-view orientation, full plume volume and scale are versus presentation choices.",
      "One static PNG reused only by the existing Asphyxia projectile slots; no poison gameplay, new move, timing or animation added.",
      "Source evidence, exact prompts and native output receipts: docs/production/vague29/projectiles/."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/homecoming_asphyxia_toxic_plume.fa3fd7e4a76a.png",
      "sha256": "fa3fd7e4a76aa79b7139a6239c9daf2330d40ca9da9d458fd2e0b98d33ed96cf",
      "bytes": 1237462,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        77,
        293,
        1466,
        751
      ]
    }
  },
  "ascension_immolator_fire_jet": {
    "id": "ascension_immolator_fire_jet",
    "fighterId": "ascension_the_immolator_182",
    "source": "ascension",
    "slots": [
      "neutralSpecial",
      "super",
      "desperation"
    ],
    "referenceIds": [
      "EXT58",
      "EXT57"
    ],
    "presentation": {
      "heightInRadii": 3,
      "anchor": "center",
      "composite": "screen",
      "facing": 1
    },
    "notes": [
      "Official Genvid Entertainment UNBLINKING scene, airdate 2024-01-24 scene 2, shows the Immolator fire emission; previews near 01:46 and 01:48 support a yellow/orange irregular flame stream with brown-orange smoke.",
      "Reference is public native 320x180 YouTube storyboard imagery sampled every two seconds; no full-resolution frame or exact original texture certified.",
      "Horizontal isolated flame volume, detailed wisps, placement and scale are versus presentation choices; the source scene jet is not newly implemented as a continuous beam.",
      "One static PNG reused only by the existing Immolator projectile slots; no new power, trajectory, timing or animation added.",
      "Source evidence, exact prompts and native output receipts: docs/production/vague29/projectiles/."
    ],
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "frame": {
      "path": "assets/projectiles/ascension_immolator_fire_jet.a05b1938f04c.png",
      "sha256": "a05b1938f04cae8fbe24969e0c69501501febe16b4a25ba78b29993a2f142b88",
      "bytes": 1168665,
      "width": 1536,
      "height": 1024,
      "framingBounds": [
        153,
        349,
        1387,
        686
      ]
    }
  }
};
