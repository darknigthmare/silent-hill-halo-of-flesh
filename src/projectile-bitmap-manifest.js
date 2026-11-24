// Authored independent projectile PNGs. Validate with scripts/build-projectile-bitmaps.mjs.
// A static candidate is not an animated clip or a certification of source fidelity.
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
  }
};
