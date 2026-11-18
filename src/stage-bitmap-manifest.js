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
    "notes": "Caméra et coupe adaptées au versus : continuité du tapis au premier plan pour les appuis horizontaux. Matériaux du couloir PC original ; géométrie et cadrage non certifiés."
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
  }
};
