// Authored exact-stage candidates. Original timing and visual fidelity remain unverified.
export const STAGE_BITMAPS = {
  "midwich": {
    "stageId": "midwich",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-courtyard",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH1_02_MIDWICH_ELEMENTARY_SCHOOL"
    ],
    "layers": [
      {
        "id": "courtyard",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/midwich.courtyard.c9728428d63d.png",
            "sha256": "c9728428d63d6950b27b5ec791cfcce4854c3aaf0ba781cf735b51c7725844c2",
            "bytes": 1628967,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ]
  },
  "woodside": {
    "stageId": "woodside",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "original-pc-corridor",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_02_WOOD_SIDE_APTS"
    ],
    "layers": [
      {
        "id": "corridor",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/woodside.corridor.c6ac083599d0.png",
            "sha256": "c6ac083599d0ee37add17b1682fd5f29a50d325547744021e5f721980ee706b5",
            "bytes": 2389863,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Caméra et coupe adaptées au versus : continuité du tapis au premier plan pour les appuis horizontaux. Matériaux du couloir PC original ; géométrie et cadrage non certifiés.",
    "variants": [
      {
        "stageId": "woodside",
        "source": "sh2",
        "status": "integrated-candidate",
        "fidelity": "unverified",
        "origin": "conversation-image-generation",
        "mode": "replace",
        "scene": "woodside-208-clock-room",
        "geometry": {
          "ceiling": false
        },
        "referenceIds": [
          "CL_SH2_02_WOOD_SIDE_APTS",
          "EXT12_REF_WOODSIDE_ROOM_2_20261101",
          "EXT12_REF_WOODSIDE_ROOM_3_20261101"
        ],
        "layers": [
          {
            "id": "clock-room",
            "rect": [
              0,
              0,
              1,
              1
            ],
            "fit": "cover",
            "ticksPerFrame": 1,
            "loop": false,
            "frames": [
              {
                "path": "assets/stages/woodside.clock-room.da94acd4e920.png",
                "sha256": "da94acd4e92079ab84490684c78ff3b3c7656c172e3bc2aac49be78ce6597e4f",
                "bytes": 2219586,
                "width": 1672,
                "height": 941
              }
            ]
          },
          {
            "id": "grandfather-clock",
            "rect": [
              0.64,
              0.12,
              0.3,
              0.68
            ],
            "fit": "contain",
            "ticksPerFrame": 1,
            "loop": false,
            "frames": [
              {
                "path": "assets/stages/woodside.grandfather-clock.bc7fec047ff5.png",
                "sha256": "bc7fec047ff50a86de01f366d1c5fa5719ba3070986e26c011a3c07b9f079896",
                "bytes": 1640280,
                "width": 1024,
                "height": 1536
              }
            ],
            "parallaxX": 0.035
          }
        ],
        "notes": "Appartement 208 avant déplacement de l’horloge. Le meuble fermé forme le plan rapproché. Échelle, éclairage et cadrage latéral adaptés au duel."
      }
    ]
  },
  "alchemilla": {
    "stageId": "alchemilla",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-waiting-room",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH1_06_ALCHEMILLA_HOSPITAL"
    ],
    "notes": "Salle d’attente normale SH1 ; caméra, étendue du sol et mobilier repoussé au fond adaptés au versus. Réception adjacente non fusionnée avec cette vue ; aucune géométrie ni animation certifiée.",
    "layers": [
      {
        "id": "waiting-room",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/alchemilla.waiting-room.2ef1639ee034.png",
            "sha256": "2ef1639ee034520921b0b369963e200f0afd92de973706451959d28c7f347baa",
            "bytes": 1822324,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ]
  },
  "lakeview": {
    "stageId": "lakeview",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-lobby-before-video",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_12_LAKE_VIEW_HOTEL"
    ],
    "notes": "Lobby SH2 original avant la cassette de la chambre 312, côté meuble musical et portes vitrées. Caméra frontale élargie, tapis continu et mobilier au fond adaptés au versus ; détails de chaise/coffre et symétrie reconstruits. Aucune réception, escalier, TV, phase brûlée ou géométrie certifiée.",
    "layers": [
      {
        "id": "lobby",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/lakeview.lobby.7bc2120c786c.png",
            "sha256": "7bc2120c786ca6ce13aa190b854bcf1de53b4f8d10b9d129ea55bb56a495d9e1",
            "bytes": 2712564,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ]
  },
  "shopping_mall": {
    "stageId": "shopping_mall",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-helens-bakery",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_02_SHOPPING_CENTER",
      "EXT_SH3_MALL_BAKERY_20261025",
      "EXT_SH3_MALL_TONGS_VIEW_20261025",
      "EXT_SH3_MALL_TONGS_MAP_20261025"
    ],
    "notes": "Helen’s Bakery normale SH3 avant basculement, comptoir des pinces et rayonnages de cette seule pièce. Caméra frontalisée, mobilier repoussé et carrelage étendu au premier plan adaptés au versus ; aucune boutique voisine, arme Extra ni géométrie ou animation 1:1 certifiée.",
    "layers": [
      {
        "id": "bakery",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/shopping_mall.helens-bakery.0e2670100789.png",
            "sha256": "0e26701007893594c037c681332c69a411c75cbea2c81436f55c1fa95a407b67",
            "bytes": 2558681,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "variants": [
      {
        "stageId": "shopping_mall",
        "source": "sh3",
        "status": "integrated-candidate",
        "fidelity": "unverified",
        "origin": "conversation-image-generation",
        "mode": "replace",
        "scene": "central-square-happy-burger",
        "geometry": {
          "ceiling": false
        },
        "referenceIds": [
          "CL_SH3_02_SHOPPING_CENTER",
          "EXT12_REF_SHOPPING_MALL_ROOM_2_20261101"
        ],
        "layers": [
          {
            "id": "happy-burger",
            "rect": [
              0,
              0,
              1,
              1
            ],
            "fit": "cover",
            "ticksPerFrame": 1,
            "loop": false,
            "frames": [
              {
                "path": "assets/stages/shopping_mall.happy-burger.2f61daa0c6a6.png",
                "sha256": "2f61daa0c6a6d925ddb0d6cf7b8e08f6f314879979d628a1f4a3cb82d1d545cb",
                "bytes": 1872785,
                "width": 1672,
                "height": 941
              }
            ]
          },
          {
            "id": "happy-burger-table",
            "rect": [
              0,
              0.53,
              0.31,
              0.38
            ],
            "fit": "contain",
            "ticksPerFrame": 1,
            "loop": false,
            "frames": [
              {
                "path": "assets/stages/shopping_mall.happy-burger-table.459203f86106.png",
                "sha256": "459203f86106b40cc83677ddd760f7f965b57122be9a4ea4c50bd0909a8c8c78",
                "bytes": 887489,
                "width": 1672,
                "height": 941
              }
            ],
            "parallaxX": 0.055
          }
        ],
        "notes": "Salle normale de Happy Burger. Une table et ses condiments forment le plan rapproché à gauche. Répartition du mobilier et cadrage adaptés au duel."
      }
    ]
  },
  "brookhaven_roof": {
    "stageId": "brookhaven_roof",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "original-roof-before-fall",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH2_05_BROOKHAVEN_HOSPITAL"
    ],
    "notes": "Toit Brookhaven SH2 original avant la chute. Plan RF, détail du journal et gros plan narratif corroborent la pièce, l’accès et les matériaux locaux ; aucune vue large exploitable ne confirme ces façades complètes. Caméra frontale, positions et dimensions des deux structures, fenêtre, grille intacte et aire de combat reconstruits pour le versus. Pas de chute, trou, pluie ou personnage ; aucune géométrie ni animation originale certifiée.",
    "layers": [
      {
        "id": "roof-before-fall",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/brookhaven_roof.before-fall.52cd844d609c.png",
            "sha256": "52cd844d609cf9403cbcd2340429c5d53c9e61da4d72696e79961eb21117ae11",
            "bytes": 2849870,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ]
  },
  "lakeside_amusement": {
    "stageId": "lakeside_amusement",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "cybil-carousel-platform-1999",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH1_14_LAKESIDE_AMUSEMENT_PARK"
    ],
    "layers": [
      {
        "id": "platform",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/lakeside_amusement.platform.e002db685c30.png",
            "sha256": "e002db685c30f7364f230dc8c4ca78987c8eebd57e6d1cabfe579027e9a419f3",
            "bytes": 1929001,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "mounted-horse",
        "rect": [
          0.685,
          0,
          0.289,
          0.77
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/lakeside_amusement.mounted-horse.d72b181aab33.png",
            "sha256": "d72b181aab335cd763ac5000852460d954302d0605a0004dd32b8f3381a7a4cf",
            "bytes": 1553449,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.09
      }
    ],
    "notes": "Monture indépendante au bord du plateau. Le cadrage latéral, la disposition des trois chevaux et la course du plan rapproché adaptent les vues PS1 au versus."
  },
  "room_302": {
    "stageId": "room_302",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "room302-first-entry-door",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH4_01_ROOM_302",
      "EXT12_REF_ROOM_302_ROOM_2_20261101",
      "EXT12_REF_ROOM_302_ROOM_3_20261101"
    ],
    "layers": [
      {
        "id": "entrance",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/room_302.entrance.6535cc934c6c.png",
            "sha256": "6535cc934c6cb9a7c5b8a5e277f8ba4f5edf7ef7625c15b2df4c53e133efe3eb",
            "bytes": 2371319,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "chair",
        "rect": [
          0.876,
          0.67,
          0.12,
          0.32
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/room_302.chair.739650b60353.png",
            "sha256": "739650b60353c4cd098a0bbd47e7a0df511a0e7bf37efdfcc593e460f727c888",
            "bytes": 1657025,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.064
      }
    ],
    "notes": "Entrée enchaînée vue depuis le séjour, avec la kitchenette et une chaise de salle à manger sur un plan séparé. Le cadrage et le déplacement apparent sont adaptés au versus."
  },
  "riverside_motel": {
    "stageId": "riverside_motel",
    "source": "origins",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "riverside-motel-mist-guest-courtyard",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT03",
      "EXT02"
    ],
    "layers": [
      {
        "id": "courtyard",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/riverside_motel.courtyard.20bf06773d8a.png",
            "sha256": "20bf06773d8ad2ec71a75dc0f5885d54b91acf465f9d62b96c65f2889b2c9d8f",
            "bytes": 2166190,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "gate",
        "rect": [
          0.007,
          0.5,
          0.18125,
          0.46
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/riverside_motel.gate.270f1cbab7c5.png",
            "sha256": "270f1cbab7c5f8a4956f481c8a4d58640de2cc1a5f8b713185910e753667d2a4",
            "bytes": 1104301,
            "width": 1052,
            "height": 1495
          }
        ],
        "parallaxX": 0.045
      }
    ],
    "notes": "Cour des chambres 305–309 dans la brume de la version PSP. Le portillon ouvert est un plan indépendant. Cadrage et course adaptés au versus."
  },
  "blue_creek": {
    "stageId": "blue_creek",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "blue-creek-stairwell-before-drainage",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH2_03_BLUE_CREEK_APTS",
      "EXT12_REF_BLUE_CREEK_ROOM_2_20261101",
      "EXT12_REF_BLUE_CREEK_ROOM_3_20261101"
    ],
    "layers": [
      {
        "id": "flooded-landing",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/blue_creek.flooded-landing.26ee99b29813.png",
            "sha256": "26ee99b298138af4835b555bfb0aa6598e1a28b4fdeba910d65814c27396322f",
            "bytes": 2717731,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "landing-rail",
        "rect": [
          0.008,
          0.57,
          0.26,
          0.35
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/blue_creek.landing-rail.bae35a70bc4e.png",
            "sha256": "bae35a70bc4eb4f41c42220196201f1e9fd7e483ffd258ee241c02d4754f6051",
            "bytes": 1239212,
            "width": 1536,
            "height": 1024
          }
        ],
        "parallaxX": 0.045
      }
    ],
    "notes": "Palier de la première rencontre avec Pyramid Head, avant drainage. Le tronçon de rampe bordant les marches forme le plan rapproché. Eau fixe et espace de combat adapté."
  },
  "church": {
    "stageId": "church",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "sh3-chapel-before-altar-departure",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH3_14_CHURCH",
      "EXT12_REF_CHURCH_ROOM_2_20261101",
      "EXT12_REF_CHURCH_ROOM_3_20261101"
    ],
    "layers": [
      {
        "id": "initial-chapel",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/church.initial-chapel.1b637d5146cd.png",
            "sha256": "1b637d5146cddd0fb69aff559dcf3496cb4237b6fa63b4294b8a1a2718145b40",
            "bytes": 2343399,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "candle-stand",
        "rect": [
          0.738,
          0.53,
          0.255,
          0.36
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/church.candle-stand.53fb59eeefa2.png",
            "sha256": "53fb59eeefa2a38e42e5a7669258a3570461ccc1a60c50962f65fc628e565fcb",
            "bytes": 1553795,
            "width": 1536,
            "height": 1024
          }
        ],
        "parallaxX": 0.045
      }
    ],
    "notes": "Chapelle initiale de Silent Hill 3 (2003), devant l’autel aux trois vitraux. La table au livre ouvert et les cierges forment le plan rapproché. Caméra de profil, espace du duel, supports du mobilier et détail des vitraux reconstruits."
  },
  "toluca_prison": {
    "stageId": "toluca_prison",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "toluca-courtyard-scaffold",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH2_09_TOLUCA_PRISON",
      "EXT12_REF_TOLUCA_PRISON_ROOM_2_20261101"
    ],
    "layers": [
      {
        "id": "courtyard",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/toluca_prison.courtyard.4d0ef11168ae.png",
            "sha256": "4d0ef11168ae0d2e727fc7bcbcdf91ea27a8f2aacdf6ee703d39d876b21f0fe9",
            "bytes": 2024725,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "scaffold-panel",
        "rect": [
          0.34,
          0,
          0.32,
          0.656
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/toluca_prison.scaffold-panel.3b120ad61785.png",
            "sha256": "3b120ad61785a179ac66a2020fe227569c048700c9db317a776daf3b8476f258",
            "bytes": 1710277,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.021
      }
    ],
    "notes": "Cour de Toluca avant placement des trois plaques. Le panneau du gibet et ses deux montants plongent dans l’obscurité. Éclairage et espace de circulation reconstruits pour la vue latérale."
  },
  "labyrinth": {
    "stageId": "labyrinth",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "labyrinth-box-of-faces-control",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH2_10_THE_LABYRINTH",
      "EXT12_REF_LABYRINTH_ROOM_2_20261101",
      "EXT12_REF_LABYRINTH_ROOM_3_20261101"
    ],
    "layers": [
      {
        "id": "control-chamber",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/labyrinth.control-chamber.60453a15467d.png",
            "sha256": "60453a15467dbe6581cf73c7f45f23616ae4ad19540a1c4bebd7ed8a5bf6da90",
            "bytes": 2631340,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "box-of-faces",
        "rect": [
          0.025,
          0.385,
          0.25,
          0.405
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/labyrinth.box-of-faces.ae7971ba7a0f.png",
            "sha256": "ae7971ba7a0f3e51b4097d454678f8315366eb75d40195ac4e9381060da534d6",
            "bytes": 2111581,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.036
      }
    ],
    "notes": "Chambre de commande du labyrinthe, cube à visages immobile sur son support orientable. Le relief, les parois et la disposition au sol sont adaptés à la vue latérale du duel."
  },
  "water_prison": {
    "stageId": "water_prison",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "water-prison-2f-surveillance",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH4_04_WATER_PRISON_WORLD",
      "EXT12_REF_WATER_PRISON_ROOM_2_20261101"
    ],
    "layers": [
      {
        "id": "surveillance-room",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/water_prison.surveillance-room.5f3849f04407.png",
            "sha256": "5f3849f044071b38e31920a2ba156a21727cbbab9930e0ad3f543e0c0ba4e8e3",
            "bytes": 2740198,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "valve-pedestal",
        "rect": [
          0.7,
          0.405,
          0.14,
          0.29
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/water_prison.valve-pedestal.7711109d1342.png",
            "sha256": "7711109d1342ce450c9571ce7c81a68ff60237c4d53769ea55d9df41aa50de9e",
            "bytes": 1984081,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.022
      }
    ],
    "notes": "Salle de surveillance du deuxième étage, lors du premier passage. Le volant sur son piédestal reste fixe auprès du puits. Le cadrage latéral, la profondeur de la salle et la position horizontale du piédestal sont adaptés au duel."
  },
  "apartment_world": {
    "stageId": "apartment_world",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "south-ashfield-room105-desk",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH4_06_APARTMENT_WORLD",
      "EXT12_REF_APARTMENT_WORLD_ROOM_2_20261101",
      "EXT12_REF_APARTMENT_WORLD_ROOM_3_20261101"
    ],
    "layers": [
      {
        "id": "office",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/apartment_world.office.6001d447c296.png",
            "sha256": "6001d447c2965d4f3033093be4218284eb5a606d0ec5a8b341765f126ff07dc3",
            "bytes": 2625586,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "tubular-chair",
        "rect": [
          0.414,
          0.48,
          0.15,
          0.24
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/apartment_world.tubular-chair.0558fe1037f5.png",
            "sha256": "0558fe1037f53b13d0dfb4fe56680265b8aeefd2a582482a333d775e7016654c",
            "bytes": 546824,
            "width": 1254,
            "height": 1254
          }
        ],
        "parallaxX": 0.018
      }
    ],
    "notes": "Bureau 105 du concierge au premier passage. La table, le casier et la cloison grillagée se trouvent derrière la chaise vide. Le nouveau cadrage et le déplacement apparent de la chaise suivent la caméra du duel."
  },
  "looping_hall": {
    "stageId": "looping_hall",
    "source": "pt",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "lit-beige-hall-unidentified-loop",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT27",
      "EXT28",
      "EXT11_REF_LOOPING_HALL_ROOM_1_20261028",
      "EXT11_REF_LOOPING_HALL_ROOM_2_20261028",
      "EXT11_REF_LOOPING_HALL_ROOM_3_20261028",
      "EXT11_REF_LOOPING_HALL_ROOM_4_20261028"
    ],
    "layers": [
      {
        "id": "hallway",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/looping_hall.hallway.b48a0819aed4.png",
            "sha256": "b48a0819aed4aa8a694e0a45da197cfa83121cc24281dbd0c3f1d9a4c3a3a8e0",
            "bytes": 2139128,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "radio-cabinet",
        "rect": [
          0.12,
          0.405,
          0.255,
          0.36
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/looping_hall.radio-cabinet.b16069870543.png",
            "sha256": "b1606987054330e1f38a4641e7acf888ab702cd6e7eb91b48033bfcbed0372cc",
            "bytes": 1253982,
            "width": 1373,
            "height": 1145
          }
        ],
        "parallaxX": 0.022
      }
    ],
    "notes": "Couloir résidentiel éclairé. Le poste radio, la plante et le cadre photographique restent ensemble sur le meuble du couloir. Le retour avec la porte close reste au fond, tandis que la caméra de duel élargit la vue transversale. Le numéro de boucle n’est pas établi."
  },
  "curtis_shop": {
    "stageId": "curtis_shop",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "junkyard-counter-first-exchange",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06",
      "EXT11_REF_CURTIS_SHOP_ROOM_2_20261028",
      "EXT11_REF_CURTIS_SHOP_ROOM_3_20261028"
    ],
    "layers": [
      {
        "id": "workshop",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/curtis_shop.workshop.910767824f6e.png",
            "sha256": "910767824f6eb21b92657235cb7150af60503c6f6379bca1f3ca8e2d64b86657",
            "bytes": 2161367,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "sales-counter",
        "rect": [
          0.15,
          0.408,
          0.43,
          0.325
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/curtis_shop.sales-counter.003f99674bac.png",
            "sha256": "003f99674bac0fba9cd2ab3e6ebbe62657f1784c0ea40bf4106a7aed93e5691b",
            "bytes": 2038176,
            "width": 2061,
            "height": 763
          }
        ],
        "parallaxX": 0.032
      }
    ],
    "notes": "Atelier du ferrailleur au premier échange. Le long comptoir de vente se détache de l’établi et de la fenêtre à planches du mur du fond. La bande de sol au premier plan est élargie pour le duel."
  },
  "dark_shrine_main": {
    "stageId": "dark_shrine_main",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "first-ritual-chamber-threshold",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT34",
      "EXT11_REF_DARK_SHRINE_MAIN_ROOM_1_20261028",
      "EXT11_REF_DARK_SHRINE_MAIN_ROOM_2_20261028",
      "EXT11_REF_DARK_SHRINE_MAIN_ROOM_3_20261028"
    ],
    "layers": [
      {
        "id": "ritual-threshold",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/dark_shrine_main.ritual-threshold.f8316c264028.png",
            "sha256": "f8316c264028704acc290d1e00fe9ad3ea727950be0c6a807f427628e0808504",
            "bytes": 2648676,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "tripod-brazier",
        "rect": [
          0.105,
          0.342,
          0.153,
          0.431
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/dark_shrine_main.tripod-brazier.31d49a758d02.png",
            "sha256": "31d49a758d0287aee9bf0913c5b3fbcab59867be9e8cb3d91d32d2d4b36fc791",
            "bytes": 1449018,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.018
      }
    ],
    "notes": "Seuil fermé de la première chambre rituelle. Le brasero gauche se déplace en parallaxe et le droit reste près du mur. Les panneaux de bois, le tatami et la porte suivent la référence photographique du parcours Crimson Water. Les flammes sont fixes."
  },
  "book_wood": {
    "stageId": "book_wood",
    "source": "bom",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "wood-guardian-clearing",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT21",
      "EXT9_BOM_WOOD_VIEW_06_20261026"
    ],
    "layers": [
      {
        "id": "wood-clearing",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/book_wood.wood-clearing.badc47213490.png",
            "sha256": "badc4721349088d28b698b11eecde3286188b20520301521e93f4375c884cd8f",
            "bytes": 2586365,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "bare-bough",
        "rect": [
          0.035,
          0.405,
          0.185,
          0.327
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/book_wood.bare-bough.58fbcd47b401.png",
            "sha256": "58fbcd47b40118115db72e81684420aec51625c22b6e440717e8a499865afba9",
            "bytes": 648447,
            "width": 1199,
            "height": 1312
          }
        ],
        "parallaxX": 0.022
      }
    ],
    "notes": "Clairière terreuse de la zone Wood avec une bordure de pierres et d’arbres nus. La souche au bord gauche suit le mouvement de caméra du duel. Cadrage et proportions adaptés au versus."
  },
  "church_hc": {
    "stageId": "church_hc",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "holy-way-main-hall-before-glass-break",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT07",
      "EXT06",
      "EXT11_REF_CHURCH_HC_ROOM_2_20261028",
      "EXT11_REF_CHURCH_HC_ROOM_3_20261028"
    ],
    "layers": [
      {
        "id": "holy-way-nave",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/church_hc.holy-way-nave.03a8aefbef40.png",
            "sha256": "03a8aefbef40fd769b8ae5dcfe040cae5ddef97ef3bc3de45f517c236ddbddb7",
            "bytes": 2448945,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "candle-stand",
        "rect": [
          0.075,
          0.39,
          0.14,
          0.414
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/church_hc.candle-stand.31cb771411d7.png",
            "sha256": "31cb771411d7b309f8fea4cc11cd0dd01bcefeac3d22799201cda901eba1a94f",
            "bytes": 1058460,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.026
      }
    ],
    "notes": "La nef est vue avant la rupture du vitrail. Le grand porte-cierge occupe la bordure gauche. Le personnage sculpté et les volumes du fond sont une interprétation."
  },
  "dark_shrine_corridors": {
    "stageId": "dark_shrine_corridors",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "inari-altar-before-replacement",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT34",
      "EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_1_20261028",
      "EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_2_20261028",
      "EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_3_20261028"
    ],
    "layers": [
      {
        "id": "inari-altar",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/dark_shrine_corridors.inari-altar.c91ff918e575.png",
            "sha256": "c91ff918e5750e5f3562a4c69c685baf0ab50b926475130890ee9c8100a09926",
            "bytes": 2145845,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "lacquer-shelf",
        "rect": [
          0.061,
          0.285,
          0.217,
          0.515
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/dark_shrine_corridors.lacquer-shelf.fb67e770ed74.png",
            "sha256": "fb67e770ed7405ac323a0d6cd230a3aa7f7965b95c084f4b28d05aff93483947",
            "bytes": 2374736,
            "width": 1024,
            "height": 1536
          }
        ],
        "parallaxX": 0.034
      }
    ],
    "notes": "La salle est représentée avant la restitution de la statue. Le meuble aux coffres occupe le bord gauche et laisse le socle éclairé visible au centre."
  }
};
