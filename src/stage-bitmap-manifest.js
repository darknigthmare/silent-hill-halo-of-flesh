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
  }
};
