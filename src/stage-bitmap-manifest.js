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
  },
  "brookhaven_sh3": {
    "stageId": "brookhaven_sh3",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "leonard-basin-below-c4",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_12_NIGHTMARE_HOSPITAL"
    ],
    "layers": [
      {
        "id": "leonard-basin",
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
            "path": "assets/stages/brookhaven_sh3.leonard-basin.1b105f5aef29.png",
            "sha256": "1b105f5aef29c411914163578795af1fe50a6d4e790ba27524abd681b693beb4",
            "bytes": 2275719,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "access-ladder",
        "rect": [
          0.016,
          0,
          0.205,
          0.695
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/brookhaven_sh3.access-ladder.43a8e52282cc.png",
            "sha256": "43a8e52282cc823a17e37279bb96bf26e157e5d05214f9162fb91c1531ad8003",
            "bytes": 761708,
            "width": 887,
            "height": 1774
          }
        ],
        "parallaxX": 0.025
      }
    ],
    "notes": "Salle inondée sous C4. Les brosses de fond restent décoratives. La position latérale de l’échelle et la lumière sont des choix de composition pour le duel."
  },
  "historical_society": {
    "stageId": "historical_society",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "second-exhibition-room",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_08_HISTORICAL_SOCIETY"
    ],
    "layers": [
      {
        "id": "exhibition-room",
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
            "path": "assets/stages/historical_society.exhibition-room.d8f2ddc8b889.png",
            "sha256": "d8f2ddc8b88973f25b9f2df3bf44a87e22d03ad5ca5039301fb653f0fe4efc11",
            "bytes": 2243034,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "damaged-display-case",
        "rect": [
          0.04,
          0.505,
          0.32,
          0.27
        ],
        "fit": "contain",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/historical_society.damaged-display-case.f5ef90a939da.png",
            "sha256": "f5ef90a939da38c60ddd151842786d2729eb3da2ae41b7387d7bb2650b231dac",
            "bytes": 2415697,
            "width": 1774,
            "height": 887
          }
        ],
        "parallaxX": 0.035
      }
    ],
    "notes": "Seconde salle d’exposition du musée de Silent Hill 2 (2001), avant la descente. La vitrine endommagée est vide. Les tableaux, les matériaux, les mesures et le cadrage latéral sont des interprétations pour le versus."
  },
  "brookhaven_sh2": {
    "stageId": "brookhaven_sh2",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "otherworld-b1-elevator-terminus",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_06_NIGHTMARE_HOSPITAL"
    ],
    "layers": [
      {
        "id": "elevator-terminus",
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
            "path": "assets/stages/brookhaven_sh2.elevator-terminus.5ae0d389b5c5.png",
            "sha256": "5ae0d389b5c51d2c567e6cb9b8c8291541ce05b71da925d4a27c990b353271f6",
            "bytes": 2613099,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-door-jamb",
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
            "path": "assets/stages/brookhaven_sh2.near-door-jamb.2f663e35be1c.png",
            "sha256": "2f663e35be1ca7edba101cb790bc78fcb09485e57e627ffa7420e3cd784a098a",
            "bytes": 461573,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Extrémité du couloir Otherworld B1 de Brookhaven dans Silent Hill 2 original (2001), devant l’ascenseur de la poursuite. Élargissement du sol, cadrage latéral, matériaux fins, éclairage, huisserie proche et portes entrouvertes sont des interprétations pour le versus. Aucun personnage, décès de Maria, poursuite ni cycle source reproduit."
  },
  "underground_hc": {
    "stageId": "underground_hc",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "founding-families-antechamber",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06",
      "EXT11_REF_UNDERGROUND_HC_ROOM_2_20261028",
      "EXT11_REF_UNDERGROUND_HC_ROOM_3_20261028"
    ],
    "layers": [
      {
        "id": "founding-families-closed-door",
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
            "path": "assets/stages/underground_hc.founding-families-closed-door.aefad84f59ee.png",
            "sha256": "aefad84f59ee1a74aa05d96abc0c529e097ed335d2a0b4028a9e1711ceb9b013",
            "bytes": 2399961,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-jambs",
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
            "path": "assets/stages/underground_hc.near-jambs.a49721844afa.png",
            "sha256": "a49721844afa73828caaaad75387ef2daa4dac08329ed195227c48c62bc76cbd",
            "bytes": 437771,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Antichambre des familles fondatrices de Silent Hill: Homecoming, après Curtis et avant la salle d’Amnion, avant résolution de l’énigme. Quatre tablettes couvertes et porte fermée ; les anneaux de sol restent dans le plan arrière. Caméra latérale, largeur, espacement, éclairage, matières fines et montants proches reconstruits pour le versus. Les captures sources 200×125 documentent surtout les mécanismes, pas cette vue d’ensemble. Deux plans statiques en 1672×941 natifs, sans animation source, sans certification 1:1 ni UHD native."
  },
  "film_hospital": {
    "stageId": "film_hospital",
    "source": "film",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "alessa-isolation-room-2006",
    "referenceIds": [
      "EXT49",
      "EXT9_FILM2006_ALESSA_ROOM_46_20261026",
      "EXT9_FILM2006_ALESSA_ROOM_81_20261026"
    ],
    "layers": [
      {
        "id": "alessa-isolation-room",
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
            "path": "assets/stages/film_hospital.alessa-isolation-room.d6410e6a7d3b.png",
            "sha256": "d6410e6a7d3b43e677865f44da90ec5c00d54b09792ef747a1cb7665e9c27beb",
            "bytes": 2829692,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-privacy-curtain",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/film_hospital.near-privacy-curtain.6ea5905574b3.png",
            "sha256": "6ea5905574b3ea669204aae5771bc7321f04e6c40f0e9880f1a362ddd900a47d",
            "bytes": 228118,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Deux plans statiques candidats de la chambre d’Alessa du film 2006. Matériaux et tente documentés par les photos 46 et 81 ; cadrage versus, volumes et piste de combat reconstruits. Aucun personnage, corps visible, lit occupé ou couloir des Dark Nurses. Le nom Brookhaven n’est pas attesté. Dimensions natives 1672 × 941 ; pas de certification 1:1 ni 4K natif. Préserver les compositions authored existantes gansAlessaTentCloth et alessaRoomRoundRest avec un raccord bitmap ciblé ; les PNG ne constituent pas de nouveaux clips animés."
  },
  "midwich_nightmare": {
    "stageId": "midwich_nightmare",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "otherworld-boiler-hearth",
    "referenceIds": [
      "CL_SH1_03_NIGHTMARE_SCHOOL"
    ],
    "layers": [
      {
        "id": "hearth",
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
            "path": "assets/stages/midwich_nightmare.hearth.862c9df53e36.png",
            "sha256": "862c9df53e36a477d92d8f9881181f303a57e9020cd82b6164a90a553b7b2f71",
            "bytes": 1955416,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-grid-uprights",
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
            "path": "assets/stages/midwich_nightmare.near-grid-uprights.9a4ed6517140.png",
            "sha256": "9a4ed651714051ca4b4a072f0510ea6edbef0b0a6dd57ffc4b61ce864ef66291",
            "bytes": 175727,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Chambre du foyer central de Split Head sous la chaufferie Otherworld de Midwich SH1, sans boss ni corps. Caillebotis et foyer documentés ; largeur, cage, perspective, détail des matériaux et deux montants proches reconstruits pour le versus. Passage horizontal dégagé devant le foyer. Deux plans statiques natifs 1672×941 ; parallaxe de caméra authored .012. Aucun plafond déclaré, aucune règle de terrain, aucun danger, aucune cadence source ou fidélité 1:1 revendiquée."
  },
  "building_world": {
    "stageId": "building_world",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "b12-b15-fan-stairwell-first-visit",
    "referenceIds": [
      "CL_SH4_05_BUILDING_WORLD"
    ],
    "layers": [
      {
        "id": "fan-stairwell",
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
            "path": "assets/stages/building_world.fan-stairwell.15995c474e24.png",
            "sha256": "15995c474e24d66bed78609dea163344a04f4471260e5065edd2e9ecc834d23b",
            "bytes": 2465408,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-masonry-returns",
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
            "path": "assets/stages/building_world.near-masonry-returns.9e753eeb66e2.png",
            "sha256": "9e753eeb66e25617558a302d0ae75d622531b4d31917ca7a2bd63a320a962652",
            "bytes": 270542,
            "width": 1671,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Grand escalier B12–B15 sous le ventilateur, premier Building World de SH4. Chambre vide sans fauteuils de la seconde visite. Matières et volée d’escalier informées par une capture de la seconde visite, sans importer ses entités ou événements. Palier horizontal, caméra, proportions, orientation frontale et quatre pales du ventilateur sont des adaptations non certifiées. Fond natif1672×941 et avant-plan natif1671×941, inchangés ; parallaxe de caméra .012. Aucun plafond déclaré, aucune chute, règle matérielle, cadence source ou fidélité 1:1 revendiquée."
  },
  "subway_world": {
    "stageId": "subway_world",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "lynch-street-platform-first-visit",
    "referenceIds": [
      "CL_SH4_02_SUBWAY_WORLD"
    ],
    "layers": [
      {
        "id": "lynch-platform",
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
            "path": "assets/stages/subway_world.lynch-platform.db4c6baf4c38.png",
            "sha256": "db4c6baf4c38de7ef7bd37644f76bc2d791d231327a37f5578fc669c852ec732",
            "bytes": 2392453,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-platform-uprights",
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
            "path": "assets/stages/subway_world.near-platform-uprights.6fac368c5db5.png",
            "sha256": "6fac368c5db562632321936d4355883dcc44a79c8332d7d95e4230819ee5553a",
            "bytes": 272237,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Premier passage de Subway World SH4, quai Lynch Street et voiture arrêtée, portes fermées et bouton rouge. Capture source limitée au vestibule de commande : quai latéral, largeur et façade de voiture reconstruits pour versus. Aucun escalator/Wallman, train en mouvement ou scène Hazel Street SH3. Deux PNG statiques natifs 1672×941 : fond opaque et plan proche alpha séparé. Parallaxe proposée .012 ; aucune nouvelle règle de combat/terrain, cadence source ou fidélité 1:1."
  },
  "forest_world": {
    "stageId": "forest_world",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "first-visit-rocky-clearing",
    "referenceIds": [
      "CL_SH4_03_FOREST_WORLD"
    ],
    "layers": [
      {
        "id": "first-visit-clearing",
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
            "path": "assets/stages/forest_world.first-visit-clearing.76588be774de.png",
            "sha256": "76588be774dee33c230e26852319d7365d765f0112e7e2ba12ef394ff20690a2",
            "bytes": 2529787,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-bark-and-grass",
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
            "path": "assets/stages/forest_world.near-bark-and-grass.5df8c21ae5bc.png",
            "sha256": "5df8c21ae5bc20359b76a76c49a7f2db2ee22521ea8d74a0ee985adbd3b2423a",
            "bytes": 183407,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Clairière rocheuse du premier passage Forest World SH4. Capture de la rencontre Jasper utilisée sans les deux personnages ; rocher, clôture et étagère à cierges conservés au fond. Chemin horizontal élargi ; sans Wish House ni scène de retour/incendie. Deux PNG statiques natifs 1672×941 : fond opaque et plan proche alpha séparé. Parallaxe proposée .012 ; aucune nouvelle règle de combat/terrain, cadence source ou fidélité 1:1."
  },
  "hilltop_center": {
    "stageId": "hilltop_center",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "monica-reception-normal",
    "referenceIds": [
      "CL_SH3_07_HILLTOP_CENTER"
    ],
    "layers": [
      {
        "id": "monica-reception",
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
            "path": "assets/stages/hilltop_center.monica-reception.8153762e19e6.png",
            "sha256": "8153762e19e65a235921ab42c5dc2567d6ccad86336bcea22f01da5e7404c3a4",
            "bytes": 2459042,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-cabinet-edges",
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
            "path": "assets/stages/hilltop_center.near-cabinet-edges.e64c163eeca2.png",
            "sha256": "e64c163eeca248bb5a7f02e959a2b47bf0e4becc5028c939d7a29a06f9ffa8a8",
            "bytes": 254156,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Bureau/réception normal de Monica’s Dance Studio SH3, fenêtre au store fermé, armoires, fauteuils, table de verre et bureau. Plan horizontal et meubles reculés pour versus ; pas de salle de répétition, atelier, baignoire ou Otherworld. Symbole mural représenté mais tracé non certifié. Deux PNG statiques natifs 1672×941 : fond opaque et plan proche alpha séparé. Parallaxe proposée .012 ; aucune nouvelle règle de combat/terrain, cadence source ou fidélité 1:1."
  },
  "baldwin_mansion": {
    "stageId": "baldwin_mansion",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "closed-lounge-landing",
    "referenceIds": [
      "CL_SH2_BFAW02_BALDWIN_MANSION"
    ],
    "layers": [
      {
        "id": "closed-lounge-landing",
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
            "path": "assets/stages/baldwin_mansion.closed-lounge-landing.5fa7f85bcd25.png",
            "sha256": "5fa7f85bcd252c37e664299ada13e0c4f64896167c7191b688f6328b2cacac9a",
            "bytes": 2160077,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-timber-jambs",
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
            "path": "assets/stages/baldwin_mansion.near-timber-jambs.de3ae2125a5e.png",
            "sha256": "de3ae2125a5ee7723d7b90edf085207cb9df7d8a40f13eaad2be2e7156ce0c28",
            "bytes": 182898,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Palier devant la porte du Lounge d’Ernest, Born from a Wish SH2 original. Porte fermée et matériaux repris de la capture ; vue large et retours latéraux reconstruits pour versus. Aucune bougie du grenier, aucun corps d’Ernest. Montants de bois proches semi-opaques alpha max208/255. Deux PNG statiques natifs 1672×941 : fond opaque et plan proche alpha séparé. Parallaxe proposée .012 ; aucune nouvelle règle de combat/terrain, cadence source ou fidélité 1:1."
  },
  "dark_shrine": {
    "stageId": "dark_shrine",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "shrine-vault-forecourt-closed",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT33",
      "EXT34",
      "EXT10_SHF_SHRINE_PATH_GUIDE_20261026",
      "EXT10_SHF_SHRINE_HOKORA_20261026"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/dark_shrine.background.2664d35ea297.png",
            "sha256": "2664d35ea29745a4372c226486c61d90f8a04fb5d309a97d9c590bb2e14b8981",
            "bytes": 2294268,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/dark_shrine.foreground.2abdd42961b5.png",
            "sha256": "2abdd42961b578991e4b0f5670ffcab08a2678af7bf0a5930976b1af1d64dcff",
            "bytes": 132551,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Parvis extérieur devant les portes fermées de Shrine Vault, Hokora à gauche, lanternes et marches derrière une bande de sol libre ; aucun acteur ni HUD. Deux couches statiques générées d’après capture native exacte, adaptées au duel latéral. Géométrie, caméra, détails occultés et fidélité 1:1 non certifiés ; aucun clip animé créé."
  },
  "school_shf": {
    "stageId": "school_shf",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "staff-room-key-cabinet",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT32",
      "EXT10_SHF_SCHOOL_GUIDE_20261026",
      "EXT10_SHF_STAFF_ROOM_20261026"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/school_shf.background.360ffba8283b.png",
            "sha256": "360ffba8283bcffb155b4fbdd3e01378ebeb5444a27b2cbe5751f4c99b999614",
            "bytes": 2265328,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/school_shf.foreground.a50d69a51274.png",
            "sha256": "a50d69a51274e519af937eea250adced9eaa18c554b0245c2a8eccddbe74d9ce",
            "bytes": 185180,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Bureau du personnel identifiable : bibliothèque vitrée/globe à gauche, coffret mural et planning à droite, plancher libre ; aucun acteur ni HUD. Deux couches statiques générées d’après capture native exacte, adaptées au duel latéral. Géométrie, caméra, détails occultés et fidélité 1:1 non certifiés ; aucun clip animé créé."
  },
  "hinako_home": {
    "stageId": "hinako_home",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "residence-i-entry-corridor",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT34",
      "EXT10_SHF_SHIMIZU_RESIDENCE_GUIDE_20261026",
      "EXT10_SHF_RESIDENCE_ENTRY_20261026"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/hinako_home.background.90570edd1d72.png",
            "sha256": "90570edd1d72771cd12dff858ae4c9b533d4278d698d88855c897816adc8d75f",
            "bytes": 2117156,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/hinako_home.foreground.e1ab86dcc94a.png",
            "sha256": "e1ab86dcc94ac3a1bc1adcc212f75df96062367d02b5d5be9b9ff06ad9d3813b",
            "bytes": 204582,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Corridor à plancher bois avec porte quadrillée fermée, enduit et poutres, petit calendrier ; aucun tatami, acteur ou HUD. Deux couches statiques générées d’après capture native exacte, adaptées au duel latéral. Géométrie, caméra, détails occultés et fidélité 1:1 non certifiés ; aucun clip animé créé."
  },
  "corrupted_ebisugaoka": {
    "stageId": "corrupted_ebisugaoka",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "shimizu-forecourt-part5",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT32",
      "EXT_SHF_EBISUGAOKA5_20261025",
      "EXT10_SHF_RESIDENCE_FORECOURT_20261026"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/corrupted_ebisugaoka.background.3e90f59a15a2.png",
            "sha256": "3e90f59a15a20b03a2f36ee1653f99efedb828386e556b68ce910673a571ef23",
            "bytes": 2452216,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/corrupted_ebisugaoka.foreground.097c19a0598a.png",
            "sha256": "097c19a0598acde9f37df4fdde9533f2c4ae0f9cd05c4b271ea0b3e0197db4bc",
            "bytes": 299193,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Façade et parvis documentés de Shimizu Part 5 ; pots à droite, linge à gauche, végétation rouge aux marges, espace central libre ; aucun acteur ni HUD. Deux couches statiques générées d’après capture native exacte, adaptées au duel latéral. Géométrie, caméra, détails occultés et fidélité 1:1 non certifiés ; aucun clip animé créé."
  },
  "hospital_world": {
    "stageId": "hospital_world",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "hospital-second-floor-corridor",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH4_07_HOSPITAL_WORLD"
    ],
    "layers": [
      {
        "id": "second-floor-hall",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/hospital_world.second-floor-hall.0bb80f060644.png",
            "sha256": "0bb80f0606449b629f834810497a61d800e7dc1d3d885568b0071ae91e250910",
            "bytes": 2109114,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-door-jamb",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/hospital_world.near-door-jamb.d94873aa3fe8.png",
            "sha256": "d94873aa3fe8d3321442db077fd37fc25f35bab8c9ba333f6b688af57c4d15bd",
            "bytes": 288757,
            "width": 1671,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "SH4 2004 Hospital World, couloir des chambres 2F. Portes closes et luminaires bas conservés ; aucun fauteuil ennemi, patient ou tête géante. Vue latérale et espacement reconstruits depuis une capture axiale imprimée ; textures, nombre de portes et largeur ne sont pas mesurés. Premier plan natif 1671×941 associé au fond 1672×941, fit stretch conservant toute la silhouette. Deux PNG statiques natifs, fond opaque et premier plan alpha indépendant. Parallaxe proposée .012. Aucun mouvement original, UHD ou rendu 1:1 certifié ; aucun changement de règles, personnage ou classeur."
  },
  "artaud_theater": {
    "stageId": "artaud_theater",
    "source": "origins",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-theater-forest-set-lit",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT03",
      "EXT_ORIGINS_THEATER_GUIDE_20261026"
    ],
    "layers": [
      {
        "id": "normal-forest-stage",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/artaud_theater.normal-forest-stage.73ab43a7563e.png",
            "sha256": "73ab43a7563e0aaa24a9c8b0fa8942b4201bb8e08f1c6c1b2bbf3bc6693f4b21",
            "bytes": 2274126,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-open-curtains",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/artaud_theater.near-open-curtains.133f10a3b777.png",
            "sha256": "133f10a3b7775e1642def9f424fee9c9393544976943038a28f37373d24d545a",
            "bytes": 377476,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Origins 2007 Artaud : scène normale éclairée après lever du rideau, réglage de décor forestier visible dans le guide officiel. Panneaux peints, ouverture centrale et petit arbre accessoire ; aucun passage au monde forestier Otherworld. État resserré par rapport au triage initial : décor forestier installé dans le théâtre normal. Cadrage élargi, proportions et espace de duel adaptés ; aucune fusion bibliothèque/grotte/Otherworld. Matière des rideaux interprétée depuis les bords de scène. Deux PNG statiques natifs, fond opaque et premier plan alpha indépendant. Parallaxe proposée .012. Aucun mouvement original, UHD ou rendu 1:1 certifié ; aucun changement de règles, personnage ou classeur."
  },
  "devils_pit": {
    "stageId": "devils_pit",
    "source": "downpour",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "water-wheels-cavern-dry-catwalk",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT11"
    ],
    "layers": [
      {
        "id": "upper-cavern-wheels",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/devils_pit.upper-cavern-wheels.406d6f6df55f.png",
            "sha256": "406d6f6df55f370912c5ff5b2df6bb30f1846d5b65b59a192657c947081d0381",
            "bytes": 2964994,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-timber-brace",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/devils_pit.near-timber-brace.1858e96a1fd2.png",
            "sha256": "1858e96a1fd21deb630f02dd6a24f0947d968f041ec168380c8ca73fd304b57b",
            "bytes": 235056,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Downpour 2012 Devil’s Pit, Upper Caverns : chambre des roues hydrauliques/lift depuis la coursive sèche, avant départ vers Deep Mines. Déploiement latéral et espacement adaptés des captures Prima 02d-017/018. Roues, lift et conduites restent statiques ; pas de puzzle rejoué, pas d’eau sur le plateau, ni fusion avec la cave inondée, le train ou l’attraction extérieure. Deux PNG statiques natifs, fond opaque et premier plan alpha indépendant. Parallaxe proposée .012. Aucun mouvement original, UHD ou rendu 1:1 certifié ; aucun changement de règles, personnage ou classeur."
  },
  "overlook": {
    "stageId": "overlook",
    "source": "downpour",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "block-a-a2-before-flooded-vision",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT11"
    ],
    "layers": [
      {
        "id": "block-a-a2-gallery",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/overlook.block-a-a2-gallery.da91aaa922c0.png",
            "sha256": "da91aaa922c03b973ee7ffb7ade47a91cd2aef81244be1f813fce4526d98bdc5",
            "bytes": 2595719,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-rusted-jambs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "stretch",
        "ticksPerFrame": 1,
        "loop": false,
        "frames": [
          {
            "path": "assets/stages/overlook.near-rusted-jambs.29b757fe46c2.png",
            "sha256": "29b757fe46c2e25ab7da25f70081adedcd66f951af5c5ddb081458f867433b84",
            "bytes": 418385,
            "width": 1672,
            "height": 941
          }
        ],
        "parallaxX": 0.012
      }
    ],
    "notes": "Downpour 2012 Overlook Penitentiary, coursive Cells A2 du Block A après escalier, avant barrière de fil barbelé et vision du couloir inondé. Caméra réorientée transversalement vers la galerie opposée ; répétition des cellules, largeur et lumière adaptées, non relevées architecturalement. Aucun plan Homecoming, émeute, corps, fil électrique, pluie ou inondation. Deux PNG statiques natifs, fond opaque et premier plan alpha indépendant. Parallaxe proposée .012. Aucun mouvement original, UHD ou rendu 1:1 certifié ; aucun changement de règles, personnage ou classeur."
  },
  "lakeside_sh3": {
    "stageId": "lakeside_sh3",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "happy-carousel-before-transition",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_13_LAKESIDE_AMUSEMENT_PARK"
    ],
    "layers": [
      {
        "id": "happy-carousel-before-transition",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/lakeside_sh3.happy-carousel-before-transition.bdd844f50ec7.png",
            "sha256": "bdd844f50ec7c6d96d60502aa5e23afdb0f8c0aa9ac33529e0154c7763ac2949",
            "bytes": 2284992,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-canopy-poles",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/lakeside_sh3.near-canopy-poles.4249d9b87185.png",
            "sha256": "4249d9b871856257e242050e0da77d741e61e0e16f8a501992c6e8f98f151ce2",
            "bytes": 214606,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Happy Carousel SH3 avant transition et Memory of Alessa ; trois sculptures sur mâts fixes, sans gaz ni personne.",
      "Cadrage latéral reconstruit ; les trois chevaux représentent une partie des douze. Plateau couvert rouille, sans sol extérieur mouillé.",
      "Deux plans statiques distincts ; aucune rotation ou animation de chevaux produite."
    ]
  },
  "nightmare_hospital_sh3": {
    "stageId": "nightmare_hospital_sh3",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "brookhaven-3f-storeroom-mirror",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_12_NIGHTMARE_HOSPITAL"
    ],
    "layers": [
      {
        "id": "mirror-storeroom",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_sh3.mirror-storeroom.a60fa6d89fbf.png",
            "sha256": "a60fa6d89fbf8f0d0854453a45597724a1a44e783e2cdf5dd4deeb91f460d51a",
            "bytes": 2501782,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-doorjambs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_sh3.near-doorjambs.1d8e55fb19ab.png",
            "sha256": "1d8e55fb19ab4cfba5b3a830489b87aa561e3077bc984d8a1efd8750139c1fe0",
            "bytes": 391266,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Réserve 3F de Brookhaven Otherworld : grand miroir, bassin utilitaire et traces sombres fixes, sans reflet humain.",
      "Reconstruction latérale du lieu ; capture native republiée par Den of Geek, plateforme exacte de cette capture non vérifiée indépendamment.",
      "Aucune contamination animée ni reflet dynamique produit ; aucune salle téléphonique ou bassin Leonard substitué."
    ]
  },
  "sewers": {
    "stageId": "sewers",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "underpass-bridge-after-hair-dryer",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_05_UNDERPASS"
    ],
    "layers": [
      {
        "id": "channel-after-dryer",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/sewers.channel-after-dryer.9572d9592225.png",
            "sha256": "9572d9592225a1014a0d9cf914a5834ddad5e2795887ac35b058eaad4999db10",
            "bytes": 2499871,
            "width": 1671,
            "height": 941
          }
        ]
      },
      {
        "id": "near-basin-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/sewers.near-basin-edges.5698b0266f8c.png",
            "sha256": "5698b0266f8c9ea3bbfe2097e6feec0f10cbcc5aaefc998c1b548f08a01bab32",
            "bytes": 316219,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Passerelle du canal après usage du sèche-cheveux ; câble posé au bord, eau sous le plateau, aucun ennemi vivant ni courant actif.",
      "L’architecture est guidée par la capture du pont lors de la rencontre ; la phase après sèche-cheveux est une reconstruction fondée sur la fiche et le guide.",
      "Une correction imagegen ciblée a élargi la passerelle afin que y=82,5% tombe sur le treillis. Aucun pixel modifié par script.",
      "Le fond livré mesure 1671×941 et le premier plan 1672×941. fit=cover conserve les proportions ; différence de largeur de 1 pixel source, sans recadrage matériel."
    ]
  },
  "old_silent_hill": {
    "stageId": "old_silent_hill",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "levin-street-house",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH1_01_OLD_SILENT_HILL"
    ],
    "layers": [
      {
        "id": "levin-street-house",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/old_silent_hill.levin-street-house.b24f46cfebac.png",
            "sha256": "b24f46cfebac68dc73b3d227ee2186b97ba9a1ce84e62278e9eb90c38260d2fa",
            "bytes": 1624541,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-frontage-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/old_silent_hill.near-frontage-edges.680e79d56e03.png",
            "sha256": "680e79d56e0381abd08b777cfa4d9450e3cab9312ba80da4555a55d567bc98b9",
            "bytes": 160823,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Neige blanche et brouillard de SH1 ; aucune cendre de film, personne ou silhouette lointaine.",
      "Vue de maison utilisée pour les volumes ; seconde capture utilisée seulement pour la chaussée, la brume et la neige, sans fusion de géométries de rues.",
      "Façade réorientée latéralement, trottoir et chaussée étendus pour le versus. Position, échelle et distance des objets non mesurées.",
      "Le gros plan périphérique de bardage et boîte aux lettres est une adaptation de cadrage à partir de matériaux visibles, pas une seconde adresse attestée.",
      "Deux plans statiques ; aucune chute de neige animée ou transition de rue produite."
    ]
  },
  "hospital_nightmare": {
    "stageId": "hospital_nightmare",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "room204",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH1_07_NIGHTMARE_HOSPITAL"
    ],
    "layers": [
      {
        "id": "room204",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/hospital_nightmare.room204.ce097401c830.png",
            "sha256": "ce097401c830c49c6b8e798205841730db002e4076d20b7eb69af868a7987ea3",
            "bytes": 1919049,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-doorjambs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/hospital_nightmare.near-doorjambs.18e549796dbd.png",
            "sha256": "18e549796dbddb1fc60a8be06ac7c47210c44c24f03210074e2b4b8adaaa00a7",
            "bytes": 296524,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Deux lits anciens, chariot à étagères, fenêtre barrée et plaque turquoise sans inscription lisible repris de la chambre 204.",
      "Harry, Bloodsucker, tentacules et flaque sanglante retirés pour cette demande de décor sans acteur ni monstre.",
      "Mobilier reculé et réparti sur la paroi arrière pour un plateau de duel libre ; caméra, nombre exact de divisions murales et matériau du sol non certifiés.",
      "Motif de sol carré rouillé guidé par la capture 204 ; le preset de matériau du moteur ne constitue pas une mesure du matériau original.",
      "Deux plans statiques ; aucune animation du Bloodsucker, poche suspendue ou variation de lumière produite."
    ]
  },
  "sewer_resort": {
    "stageId": "sewer_resort",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "south-tunnel-pipe-bay",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH1_10_SEWERS_TO_RESORT_AREA"
    ],
    "layers": [
      {
        "id": "south-tunnel-pipe-bay",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/sewer_resort.south-tunnel-pipe-bay.d8ad023bdfb3.png",
            "sha256": "d8ad023bdfb37cc8541b0d4e943e9e2be772b6315db730d338adaac390281d42",
            "bytes": 2118832,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-service-struts",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/sewer_resort.near-service-struts.f302d8e9f669.png",
            "sha256": "f302d8e9f66995771b44eac9d4af591580d82b9cfb8183f88764d222b9e5e0bf",
            "bytes": 278076,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Baie documentée de sorties de conduites vert sombre devant structures grillagées rouillées ; aucun emprunt au canal de SH3 ni au passage ultérieur vers le parc.",
      "Harry, créature et tache de sang retirés. Eau derrière et sous la passerelle, pas de flaque sanglante ni de danger ajouté.",
      "Caillebotis élargi en plateau latéral ; nombre, proportions et écartement précis des tuyaux et supports reconstruits, non mesurés.",
      "Avant-plan indépendant de deux fragments de supports rouillés ; aucune grille ou conduite devant les appuis centraux.",
      "Deux plans statiques ; aucune montée des eaux, vapeur ou animation de créature produite."
    ]
  },
  "south_vale": {
    "stageId": "south_vale",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "neely-sanders-frontage",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH2_01_EAST_SOUTH_SIDE"
    ],
    "layers": [
      {
        "id": "neely-sanders-frontage",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/south_vale.neely-sanders-frontage.f97d2c2df42a.png",
            "sha256": "f97d2c2df42aa5076923ef67040f537d1d6cd23a669fc1bd0001cffa639f13d4",
            "bytes": 2217344,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-street-poles",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/south_vale.near-street-poles.7e6716e17a5e.png",
            "sha256": "7e6716e17a5e0bc7a0c501257e278f29651e0555cb2b81fd24cf6c99d4270cfa",
            "bytes": 210049,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Brique brune, porte en bois, fenêtres couvertes de journaux, bande/auvent bleu-vert et magasin sombre attenant repris de la capture native.",
      "James et textes lisibles retirés. Les textures de journaux restent des motifs illisibles ; aucune enseigne inventée.",
      "Aucun sang transféré de la capture de Lindsey/Sanders, aucun secteur West South Vale ni élément du remake 2024.",
      "Façade mise à plat et chaussée étendue pour le duel ; les fragments de poteaux proches sont une interprétation de premier plan, pas un relevé de leur nombre ou position.",
      "Deux plans statiques ; brouillard peint, sans nouvelle animation météorologique ou interaction de véhicule."
    ]
  },
  "hotel_otherworld": {
    "stageId": "hotel_otherworld",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "last-hall-after-egg-doors",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_13_NIGHTMARE_HOTEL"
    ],
    "layers": [
      {
        "id": "last-hall-after-egg-doors",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/hotel_otherworld.last-hall-after-egg-doors.23ccf794f57b.png",
            "sha256": "23ccf794f57b3017d69a27996d78bdc358815130c1cea185c94e0ea1f932fba4",
            "bytes": 1938212,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-panel-jambs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/hotel_otherworld.near-panel-jambs.061fca74f434.png",
            "sha256": "061fca74f43466de191d9abd002b4e7eb5ca5d961319fb91c8a998a34df2109e",
            "bytes": 285111,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Sous-lieu retenu explicitement : couloir post-œufs documenté par la capture native, et non le hall du duo, le sous-sol inondé ou l’escalier en flammes d’Angela.",
      "Plâtre gris usé, soubassement de bois sombre, appliques triangulaires et plafond bas à traverses réinterprétés en vue latérale ; James retiré.",
      "Le cadrage, l’espacement des panneaux et des appliques sont reconstruits pour le versus. Ni plan coté ni matériau/physique de sol vérifiés.",
      "Aucune inondation, incendie ou ruine spectaculaire ajoutée depuis une autre salle. La politique runtime water ne sert pas de preuve visuelle pour ce couloir précis.",
      "Deux plans statiques ; aucune animation de fuite, poussière ou séquence des boss produite."
    ]
  },
  "prison_meat_locker": {
    "stageId": "prison_meat_locker",
    "source": "sh2",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "second-freezer",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH2_10_THE_LABYRINTH"
    ],
    "layers": [
      {
        "id": "second-freezer",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/prison_meat_locker.second-freezer.5437e088da66.png",
            "sha256": "5437e088da66fda0f9fd9f9ca0bf38289189ca28133bccb33a02519d1877cea1",
            "bytes": 1710056,
            "width": 1671,
            "height": 941
          }
        ]
      },
      {
        "id": "near-freezer-jambs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.012,
        "frames": [
          {
            "path": "assets/stages/prison_meat_locker.near-freezer-jambs.4337c644a171.png",
            "sha256": "4337c644a1714b7b41e07fc6e003c1d11fde8ba1de5e4b90092d3102f285b79a",
            "bytes": 279546,
            "width": 1670,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Salle industrielle verdâtre, fluorescents, rails fixes et quartiers de viande animale suspendus ; Eddie, James et corps humains absents.",
      "Quatre pièces de viande réparties au fond pour dégager le duel ; décompte et placement sont une reconstruction, pas une topologie certifiée de la salle.",
      "Une correction ciblée a relié les quatre pièces aux crochets du rail. Le premier essai avait des suspensions interrompues et est exclu des assets livrables.",
      "Aucun déplacement des rails, jet de vapeur ou mécanisme du remake. Sol et humidité non mesurés ; plateau versus distinct des obstacles du combat original.",
      "Tailles natives conservées : fond 1671×941, premier plan 1670×941. Écart de largeur de 1 pixel normalisé par fit=cover ; aucune mise à l’échelle enregistrée dans les PNG.",
      "Deux plans statiques ; aucune oscillation de viande, vapeur ou nouvelle animation produite."
    ]
  },
  "grand_hotel": {
    "stageId": "grand_hotel",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "otherworld-atrium-without-sepulcher",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06",
      "EXT05"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/grand_hotel.background.8250537eb741.png",
            "sha256": "8250537eb741b52239e76f63a5de6e6e84a3f65da453c3b7c96b52d36a088cc2",
            "bytes": 2018968,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/grand_hotel.foreground.bc6963bb530b.png",
            "sha256": "bc6963bb530b8d1ee4080393d5c18bc066054d61ac26e33180b8382c15f69af9",
            "bytes": 97721,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Atrium Otherworld du Grand Hotel sans Sepulcher : enveloppe sombre nervurée, rayonnages/supports latéraux sculptés, sol brun circulaire continu et petits débris aux coins. Aucun boss, sac organique, arbre vivant, lustre ou événement. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "town_hall_hc": {
    "stageId": "town_hall_hc",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "public-hall-first-visit",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/town_hall_hc.background.ccb41f2ca340.png",
            "sha256": "ccb41f2ca3400fb30083aedaeeb25fb0f8830276cfb352e6f876d44d311c4177",
            "bytes": 2299765,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/town_hall_hc.foreground.a42274c88402.png",
            "sha256": "a42274c88402daafa7ca162708731b14a37891e948966ea00ce008a72c24baac",
            "bytes": 249564,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Salle publique du premier passage normal : boiseries, porte arrière sur estrade, deux pots, podium à gauche et chaises à droite. Tapis et sol centraux libres ; montants proches limités aux marges. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "shepherd_house_hc": {
    "stageId": "shepherd_house_hc",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-attic-before-transformation",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/shepherd_house_hc.background.7f735ed7e9fe.png",
            "sha256": "7f735ed7e9fe426c7d1ad211e368b9d8c762a9c02f6048b0c403f1d735b332fd",
            "bytes": 2142985,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/shepherd_house_hc.foreground.a7cc1f1e9d27.png",
            "sha256": "a7cc1f1e9d27108af9ad916c9ac19cfca1d702c0512d1d323554d7ec03dd713b",
            "bytes": 244289,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Grenier normal avant transformation : deux fenêtres laiteuses, planches brutes, charpente, bibliothèque fermée et caisses couvertes. Plancher central dégagé ; montant et chutes de bois seulement aux coins. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "centennial_building": {
    "stageId": "centennial_building",
    "source": "downpour",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "library-normal-main-reading-room",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT11"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/centennial_building.background.c8a81a276b6a.png",
            "sha256": "c8a81a276b6a7f3f1a252b0a7f5f0d327fe6254682304f79c04fa79fcf21b991",
            "bytes": 2546849,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/centennial_building.foreground.9ddcc6285a36.png",
            "sha256": "9ddcc6285a36798db5c6baa4947962bb2ca621b4b05603af2e05d7a9fde6530f",
            "bytes": 205294,
            "width": 1673,
            "height": 940
          }
        ]
      }
    ],
    "notes": "Bibliothèque normale : rayonnages, pilastres de bois, galerie, bureau arrière, fenêtres hautes et tapis. Le faisceau UV portable des captures est exclu ; papiers du premier plan au coin droit. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "st_marias": {
    "stageId": "st_marias",
    "source": "downpour",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-chapel-closed-altar-gate",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT11"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/st_marias.background.e8b396a71baf.png",
            "sha256": "e8b396a71baf5bb0c5600090dbc9de112a07d2b304d485d4c0b4d9879c05797c",
            "bytes": 2889977,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/st_marias.foreground.5ea59966acd3.png",
            "sha256": "5ea59966acd38172eff9a5386b99efebba02bd66d2ba10d1be66a25422145a9f",
            "bytes": 93452,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Chapelle normale devant sa grille d’autel fermée : enduit écaillé, poteaux massifs, fer à motifs rectilignes, autel au rideau rouge derrière. Sol central continu ; éclats et planche proches aux coins. Lustre hors cadre. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "shepherds_glen": {
    "stageId": "shepherds_glen",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "elles-missing-persons-board-sidewalk",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT06"
    ],
    "layers": [
      {
        "id": "background",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/shepherds_glen.background.12de6f58dc06.png",
            "sha256": "12de6f58dc06f590e24402da8cbf0dd48d298c43718348d3bce6325c6ee03696",
            "bytes": 1966431,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "foreground",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/shepherds_glen.foreground.c83fab7b1fd2.png",
            "sha256": "c83fab7b1fd227e642b5a31eb0fddf47bb8f2488ffaea165d1f6d123c044cd62",
            "bytes": 208307,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": "Trottoir de la rencontre Elle : panneau de disparus et sa petite lampe propre, chaise vide, clôture et brume distante. Le grand lampadaire est un plan alpha indépendant à gauche ; aucune personne. Deux PNG statiques générés à partir de captures documentées et adaptés au duel. Caméra, topologie, proportions et détails occultés non certifiés 1:1 ; aucun clip animé créé."
  },
  "hazel_subway": {
    "stageId": "hazel_subway",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "concourse-ticket-alcove",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_04_SUBWAY_STATION"
    ],
    "layers": [
      {
        "id": "ticket-alcove",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/hazel_subway.ticket-alcove.4d537af9a148.png",
            "sha256": "4d537af9a1485e2e384396327b8a60c35c923552f8318e92021fff76e75c40c3",
            "bytes": 2203973,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/hazel_subway.near-wall-edges.98e4c72a8308.png",
            "sha256": "98e4c72a83083b2f1dcabd1417e687c20d31daaac96ece679ffedd266584b884",
            "bytes": 200941,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Un changeur gris et trois distributeurs verts, journal replié, carrelage crème à bandes vertes et porte de service d'après la vue native.",
      "Les inscriptions de distributeurs reproduites appartiennent à la texture attestée ; aucun HUD, texte ajouté ou signalétique de gare inventée.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "underpass_sh3": {
    "stageId": "underpass_sh3",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "upper-map-room",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_05_UNDERPASS"
    ],
    "layers": [
      {
        "id": "map-room",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/underpass_sh3.map-room.da4cf2791272.png",
            "sha256": "da4cf2791272392c8e54a54009dd9f9f1db636cf669687f5a8fb7bf43909a366",
            "bytes": 2137101,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/underpass_sh3.near-wall-edges.a65261780188.png",
            "sha256": "a6526178018839d6009a259e7bdd5fa5e3c2f0ed72bd416ef361a5da82651565",
            "bytes": 216890,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Carte murale, peinture vert-bleu usée, casier renversé et tonneau attestés ; Heather et la masse collectible retirées.",
      "Aucun mélange avec canal, salle du chauffage, variante sanglante Extra New Game ou chantier.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "nightmare_hilltop": {
    "stageId": "nightmare_hilltop",
    "source": "sh3",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "gallery-before-painting-burn",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH3_08_NIGHTMARE_HILLTOP_CENTER"
    ],
    "layers": [
      {
        "id": "gallery-painting",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/nightmare_hilltop.gallery-painting.2a9fc04c0043.png",
            "sha256": "2a9fc04c004376adb2ea2ee5acb6e13247d23c6a5f2b77329178e1b58247e856",
            "bytes": 2475526,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/nightmare_hilltop.near-wall-edges.cfcaac8fc270.png",
            "sha256": "cfcaac8fc270606dad7c4177774b7edff77e17bb8d6ef468ebab075cd4251cf3",
            "bytes": 262629,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Cadre, deux lampes grillagées, corrosion ivoire/rouille et seau repris de la capture native.",
      "Les figures restent uniquement peintes dans le tableau attesté ; aucun acteur, cadavre, monstre ou personnage tridimensionnel ajouté.",
      "La peinture n'est pas brûlée ; aucune transformation ni scène de Glutton inventée.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "outside_room_302": {
    "stageId": "outside_room_302",
    "source": "sh4",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "final-hallway-chained-room105",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH4_13_OUTSIDE_ROOM_302"
    ],
    "layers": [
      {
        "id": "door105",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/outside_room_302.door105.1a96e575d9fd.png",
            "sha256": "1a96e575d9fdbfca1a67143b3c82946826b997c6404e342c83d9cb6e26644143",
            "bytes": 2425527,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/outside_room_302.near-wall-edges.0fafe322dcde.png",
            "sha256": "0fafe322dcde13854f14a966dd680ac663a32fec3d964eacf517a51d095f4cae",
            "bytes": 264338,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Porte105 élancée, grille haute, chaînes obliques et mur rouge tirés de la capture native1920×1080.",
      "Aucune statue humaine suspendue ni acteur de la zone voisine104 utilisé ; cadrage limité à la baie105.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "alchemilla_origins": {
    "stageId": "alchemilla_origins",
    "source": "origins",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-first-floor-elevator-landing",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT03",
      "EXT01"
    ],
    "layers": [
      {
        "id": "elevator-landing",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/alchemilla_origins.elevator-landing.d7a48880728c.png",
            "sha256": "d7a48880728c021669239f9c9e0a3d178a48c67d2c6ed3de9cabc8e59e006531",
            "bytes": 2275547,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/alchemilla_origins.near-wall-edges.88e0d0800459.png",
            "sha256": "88e0d0800459a36b5c4b5b834b59b31565ba5c97134a09ee6868e004983d3587",
            "bytes": 195761,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Capture native du guide officiel BradyGames page imprimée20/PDF21 : portes, panneaux carrés, peinture verte basse et bouton à droite.",
      "PDF original conservé et hashé ; JPEG natif de page extrait sans retouche, vues de Kaufmann et du palier inspectées.",
      "La politique moteur versus-transition reste inchangée ; ce lot fournit uniquement un fond normal statique, aucune phase Otherworld ni transition bitmap.",
      "Résolution des vues de guide limitée : proportions et textures fines reconstruites, pas de fidélité1:1 prétendue.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "nightmare_hospital_hc": {
    "stageId": "nightmare_hospital_hc",
    "source": "homecoming",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "initial-clinical-dream-gate2a",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT06"
    ],
    "layers": [
      {
        "id": "gate2a",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_hc.gate2a.faf8d083f23c.png",
            "sha256": "faf8d083f23c60b6ab83cea558412faf3f9d7c0077bd7240b098c43c58b9b01c",
            "bytes": 2463170,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_hc.near-wall-edges.e7c5e101d745.png",
            "sha256": "e7c5e101d745d272eadbcc199e13228a429da7e2ff39a36620dfd24bee9de132",
            "bytes": 185326,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "La phase fixed-normal et le libellé RÊVE CLINIQUE AVANT LE MIROIR sont respectés ; aucune rouille Otherworld ajoutée.",
      "Capture native officielle page imprimée29/PDF8, raster240×135 décodé du PDF Pearson/BradyGames ; limites de détail explicites.",
      "Grille, plaque2A, clavier/lumière droite, plâtre bleuté écaillé, carrelage bas et trolley gauche visibles sur la preuve.",
      "Alex et Joshua retirés ; aucun personnage ou monstre ajouté.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "villa": {
    "stageId": "villa",
    "source": "shortmessage",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "normal-corridor-apartment214",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT30",
      "EXT31"
    ],
    "layers": [
      {
        "id": "apartment214-door",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/villa.apartment214-door.263d6a61f2f4.png",
            "sha256": "263d6a61f2f44d7baf21e2b8ca7792601205004b4881887e92dfeb81b3f8f65d",
            "bytes": 2247109,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/villa.near-wall-edges.4d500efc075f.png",
            "sha256": "4d500efc075fb1f14c489a6c0aa865210f26dc289fef13f3c2b6c3e6ff2dadbe",
            "bytes": 208154,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Porte sombre C.B., grand graffiti ocre, grille gauche, enduit et conduites attestés par la capture native800×450.",
      "Aucun intérieur de studio, dessin humain, chaîne de poursuite, post-it Otherworld ou acteur ajouté.",
      "Le drapeau moteur interior:false existant est conservé ; le périmètre visuel exact est ce couloir couvert, sans nouvelle logique météo ni animation.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "nowhere": {
    "stageId": "nowhere",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "bethor-generator-room-before-power-off",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "CL_SH1_15_NOWHERE"
    ],
    "layers": [
      {
        "id": "bethor-generator-room",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/nowhere.bethor-generator-room.6c753fcbaa0a.png",
            "sha256": "6c753fcbaa0afb827734973cfb66a27e62df7958a75274a70826074b87c5b1c9",
            "bytes": 1808666,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/nowhere.near-wall-edges.70fd5fb39aff.png",
            "sha256": "70fd5fb39afff30d8938646e6f53f60d28dc6bed7f914713fed259a4bcaf9768",
            "bytes": 196477,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Deux armoires olive, panneau de cadrans éclairé, parois rouillées et montant droit guidés par la capture native600×450.",
      "Harry, arme et ombre humaine retirés ; aucune autre pièce de Nowhere assemblée ici.",
      "Une petite trappe gauche non attestée dans la première génération a été retirée par une correction imagegen ciblée ; seul le PNG corrigé est livré.",
      "La géométrie de la salle est élargie pour le duel ; les petits cadrans et textures de la capture restent des reconstructions non certifiées1:1.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "central_nightmare": {
    "stageId": "central_nightmare",
    "source": "sh1",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "floatstinger-rooftop-altered-phase",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "CL_SH1_09_NIGHTMARE_CENTRAL_SILENT_HILL"
    ],
    "layers": [
      {
        "id": "floatstinger-roof",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/central_nightmare.floatstinger-roof.a166c86064f4.png",
            "sha256": "a166c86064f447441dfc3006b71dff73c734c5c466cc0f66722d3871d3c4fc14",
            "bytes": 1499491,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-roof-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/central_nightmare.near-roof-edges.d6d18810f03e.png",
            "sha256": "d6d18810f03ef335e814402ef2d4d90abf7ab227fc1c3b22778f856f3114ff72",
            "bytes": 82839,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Capture native1048×789 : dallage, parapet bas, retour rouge gauche, volume bas gauche et grand volume droit conservés.",
      "Harry et Floatstinger sont retirés. Aucun réservoir, antenne, décor urbain voisin ou phase Twinfeeler ajouté.",
      "Avant-plan limité à deux très petits retours de maçonnerie aux coins bas extrêmes, adaptation de caméra déclarée ; aucune chute ni nouvelle collision.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "nightmare_hospital_sm": {
    "stageId": "nightmare_hospital_sm",
    "source": "shattered",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "psp-er-radio-room-iced-exit",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT09",
      "EXT10_SM_HOSPITAL_GUIDE_20261026",
      "EXT10_SM_HOSPITAL_ROOM_20261026"
    ],
    "layers": [
      {
        "id": "psp-er-iced-exit",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_sm.psp-er-iced-exit.52b62d0305f9.png",
            "sha256": "52b62d0305f9d115edf0503904dbc4e987cc8cc8cf18bbdbe7dc72df68837d65",
            "bytes": 2477450,
            "width": 1672,
            "height": 941
          }
        ]
      },
      {
        "id": "near-wall-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "path": "assets/stages/nightmare_hospital_sm.near-wall-edges.e3eb42c05e84.png",
            "sha256": "e3eb42c05e8497b59c3ea7178597334ad5f245f67d90ebd72ca6e9c18b54c62b",
            "bytes": 166438,
            "width": 1672,
            "height": 941
          }
        ]
      }
    ],
    "notes": [
      "Trois vues natives PSP 318×180 du longplay 2Ekz2eUCIbU : porte bleue bouchée de glace, colonne fixe de pavés de verre immédiatement à gauche, lit et meuble bas attestés. Les feuilles sources M60/M61 ont été inspectées avant génération ; seules les cellules pertinentes sont livrées.",
      "La nouvelle preuve PSP précise une colonne maçonnée de pavés de verre ; elle ne justifie aucune cloison vitrée, rideau animé, autre salle ou mélange avec la version Wii. Les anciennes annotations de propositions Wii ne sont pas transformées en preuve visuelle PSP.",
      "Harry, père/enfant gelés, téléphone, radio jouable, sous-titres et interface sont exclus. La glace reste fixe ; aucune fonte, chanson, transformation ou règle de terrain ajoutée.",
      "La faible résolution, la caméra mobile et l’occlusion par le joueur limitent les détails visibles. Le volume hors cadre, l’échelle, la largeur pour le duel et l’éclairage uniforme sont reconstruits ; aucune identité pixel à pixel ni fidélité 1:1 certifiée.",
      "Two independent static PNG planes with different horizontal parallax; no animated clip, transition or hazard added.",
      "Camera orientation, widening and scale reconstructed for versus. Hidden geometry and pixel fidelity are unverified; no1:1 or UHD certification.",
      "Foreground return edges are a restrained camera adaptation of observed room materials; no new furniture."
    ]
  },
  "ebisugaoka": {
    "stageId": "ebisugaoka",
    "source": "shf",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "fogworld-corner-shop-main-street",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT32"
    ],
    "layers": [
      {
        "id": "fogworld-corner-shop",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "4a4cf5e4c7d954f03feba3c3000340c033e09042792ac9a8746b707304e5e0be",
            "bytes": 2369728,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/ebisugaoka.fogworld-corner-shop.4a4cf5e4c7d9.png"
          }
        ]
      },
      {
        "id": "near-timber-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "a2ee94a9cf3e884b3ab6678ad385da2cdbaeb18557572b11e0a3672f2fbd3201",
            "bytes": 164483,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/ebisugaoka.near-timber-edges.a2ee94a9cf3e.png"
          }
        ]
      }
    ],
    "notes": [
      "Two official PlayStation images of the same shop were inspected at 1920-pixel width: timber facade, tile eaves, lattice windows, balcony, worn sign, bench, red cylindrical postbox and overhead wires.",
      "Only normal Fog World is delivered. Existing versus-transition policy is preserved; no floral Otherworld frame or automatic transition is invented.",
      "The straight-on camera and wider road are versus adaptations. Sign lettering and hidden details remain unverified.",
      "Two independent static PNG planes with differential horizontal parallax. No new animation, hazard, collision or finisher logic.",
      "Foreground timber returns are restrained camera framing from attested materials, not a measured original street boundary."
    ]
  },
  "book_fire": {
    "stageId": "book_fire",
    "source": "bom",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "fire-zone-launch20121016-workbench-room",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT21",
      "EXT9_BOM_FIRE_VIEW_01_20261026",
      "EXT9_BOM_FIRE_VIEW_02_20261026"
    ],
    "layers": [
      {
        "id": "launch-fire-room",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "41ce3e9666c526a1c3daf2fa5e30cbd4fab5bd1f4cdf4230a056bee7ea135d1d",
            "bytes": 2469012,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_fire.launch-fire-room.41ce3e9666c5.png"
          }
        ]
      },
      {
        "id": "near-iron-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "9f531b56161d24a0c8174a8b180f4a15d364e50e0258e002a632227de1e0d0b6",
            "bytes": 217813,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_fire.near-iron-edges.9f531b56161d.png"
          }
        ]
      }
    ],
    "notes": [
      "Launch screenshot 20121016_01 fixes the retail room: drawer workbench, small table, iron wall panels, grates and underfloor warm illumination. The second launch screenshot only confirms materials.",
      "Ranko Prozo portfolio Fire World 01 provides clearer material/kit reference. Its exact layout and the unrelated shooting-range Fire World 02 were not substituted for the retail room.",
      "No player, creature, weapon, HUD, collectible, attack fire, lava or new pit imported. The low frontal camera and widened solid fight lane are declared versus adaptations.",
      "Two independent static PNG planes with differential horizontal parallax. No new animation, hazard, collision or finisher logic.",
      "Foreground narrow iron returns are restrained camera framing from attested materials; native output is not certified 1:1 or UHD."
    ]
  },
  "book_earth": {
    "stageId": "book_earth",
    "source": "bom",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "earth-gallery-e3-20120606-view37",
    "geometry": {
      "ceiling": true
    },
    "referenceIds": [
      "EXT21",
      "EXT9_BOM_EARTH_VIEW_37_20261026"
    ],
    "layers": [
      {
        "id": "earth-gallery-timber-wall",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "9388cd040cd54c7fa58f1e83570dfa528463820e2bc9807a418d9fc228330773",
            "bytes": 2306208,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_earth.earth-gallery-timber-wall.9388cd040cd5.png"
          }
        ]
      },
      {
        "id": "near-earth-timber-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "e57d980721fcb5dd830c76ba6b0ae7c37797ce0b5d28b92e347ff881a1870a79",
            "bytes": 224867,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_earth.near-earth-timber-edges.e57d980721fc.png"
          }
        ]
      }
    ],
    "notes": [
      "La policy existante demande explicitement cette préversion du 6 juin 2012. Aucun état final commercial n’est revendiqué.",
      "La conversion de caméra plongeante en caméra de combat latérale, la largeur et les parties cachées sont des adaptations non certifiées.",
      "Le mur de soutènement bois-pierre, l’entrée sombre, les planches, les récipients et l’éclairage olive proviennent de la capture précise ; personnages, armes, HUD, surbrillance du seau, sang et effets de combat exclus.",
      "Deux PNG natifs indépendants ; premier plan à vrai alpha limité aux extrêmes. Aucun pixel repeint ou redimensionné.",
      "Le décor ne valide pas les collisions, dangers, animations ou la fidélité1:1 ; importer comme candidat statique et vérifier dans le moteur."
    ]
  },
  "book_water": {
    "stageId": "book_water",
    "source": "bom",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "water-rooftop-dlc-gallery20130315-view37",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT21"
    ],
    "layers": [
      {
        "id": "water-rooftop-lattice",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "3e1e5c015f1fd84146ce2bbce365c085963d13ba67c60eeb35eb87991a4755de",
            "bytes": 2244718,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_water.water-rooftop-lattice.3e1e5c015f1f.png"
          }
        ]
      },
      {
        "id": "near-rooftop-steel-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "d593738b8364466c6ddf0831e86b9cca7f4655741f8c2bca5f6d7da13216ebd7",
            "bytes": 219517,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_water.near-rooftop-steel-edges.d593738b8364.png"
          }
        ]
      }
    ],
    "notes": [
      "La capture de jeu postérieure à la sortie fixe la pièce. Le portfolio du créateur corrobore l’identité Water World et les matériaux, sans être pris pour un plan retail exact.",
      "La galerie est datée du15mars2013 ; son nom de fichier contient20130115. Les deux informations sont conservées sans réécrire la provenance.",
      "Le décor est un toit technique sombre avec grilles à croisillons, portes métalliques et ventilations ; aucune salle inondée, rune ou piscine n’est déduite du nom Water.",
      "La perspective, la largeur et la profondeur des appareils sont adaptées à une arène latérale. Aucun personnage, flamme de torche, reflet de combat, arme ou HUD n’est importé.",
      "Deux PNG natifs indépendants ; premier plan à alpha véritable sur les seuls extrêmes. Pas de retouche, redimensionnement ni preuve de fidélité1:1.",
      "Candidat statique pour intégration et vérification moteur par le responsable principal."
    ]
  },
  "arcade_city": {
    "stageId": "arcade_city",
    "source": "arcade",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "city-jacks-inn-fog-forecourt-opening",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT13",
      "EXT15"
    ],
    "layers": [
      {
        "id": "jacks-inn-fog-forecourt",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "0df4f76b667367ba07d41713728021fa83794b18f81c32a23e41b3457f45f00d",
            "bytes": 2179945,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/arcade_city.jacks-inn-fog-forecourt.0df4f76b6673.png"
          }
        ]
      },
      {
        "id": "near-concrete-pillar-edges",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "dc85c4de41ae8bc67bf1e1f13a3aae8e793a7bb9d8368be0aa326e8733448114",
            "bytes": 162212,
            "width": 1671,
            "height": 941,
            "path": "assets/stages/arcade_city.near-concrete-pillar-edges.dc85c4de41ae.png"
          }
        ]
      }
    ],
    "notes": [
      "Le début du parcours City est documenté à Jack’s Inn ; seules l’entrée couverte et la rue brumeuse visibles dans ces deux images sont adaptées.",
      "La brume masque les détails absents des captures. Aucun motel étendu, véhicule, boutique ou nouvelle rue n’est reconstitué.",
      "Figures, monstres, texte d’interface, viseur, munitions, score et sous-titres retirés. L’enseigne reste illisible.",
      "L’élargissement et le cadrage latéral sont des adaptations non certifiées. L’auvent appartient au décor de fond ; la géométrie de l’arène reste extérieure, sans changement moteur.",
      "Deux PNG natifs indépendants, alpha réel aux extrêmes et centre libre. Aucun pixel retouché."
    ]
  },
  "book_blood": {
    "stageId": "book_blood",
    "source": "bom",
    "status": "integrated-candidate",
    "fidelity": "unverified",
    "origin": "conversation-image-generation",
    "mode": "replace",
    "scene": "blood-platform-e3-20120606-view22",
    "geometry": {
      "ceiling": false
    },
    "referenceIds": [
      "EXT21"
    ],
    "layers": [
      {
        "id": "blood-platform-ribbed-door",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0,
        "frames": [
          {
            "sha256": "f3b31605cd4ea24d73c987630a74f72e39048ac5ff8bf87b36b5935bb94b86bd",
            "bytes": 1989996,
            "width": 1672,
            "height": 941,
            "path": "assets/stages/book_blood.blood-platform-ribbed-door.f3b31605cd4e.png"
          }
        ]
      },
      {
        "id": "near-dry-structural-ribs",
        "rect": [
          0,
          0,
          1,
          1
        ],
        "fit": "cover",
        "ticksPerFrame": 1,
        "loop": false,
        "parallaxX": 0.006,
        "frames": [
          {
            "sha256": "476ef774e0637e2523b4dce7db64b5e9562ea5f180ded8705faa8718ae87ffb5",
            "bytes": 181436,
            "width": 1672,
            "height": 940,
            "path": "assets/stages/book_blood.near-dry-structural-ribs.476ef774e063.png"
          }
        ]
      }
    ],
    "notes": [
      "État de préversion du6juin2012 explicitement conservé, conformément à la policyBORD DES PLATEFORMES BLOOD ; aucune fidélité à une pièce commerciale finale n’est revendiquée.",
      "Seules la porte rectangulaire, la structure, le disque intégré et la plateforme de la capture22 sont repris. La largeur et la caméra latérale sont adaptées au versus.",
      "La surface rouge est traitée comme matière solide sèche. Aucun sang liquide, écoulement, éclaboussure, effet, corps, organe, autel ou signe graphique n’est ajouté.",
      "Joueurs, armes, HUD, glows et particules de combat exclus. Aucun danger, mouvement ou collision ne se déduit du décor.",
      "Deux PNG natifs indépendants ; premier plan à véritable alpha limité aux extrêmes, aucun pixel repeint ou redimensionné."
    ]
  }
};
