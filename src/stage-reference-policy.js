/**
 * Production-reference decisions, kept separate from the source catalogue.
 * A cited proposal is still a proposal. These original Canvas prototypes are
 * not captured footage, canonical timings, accepted artwork or 1:1 geometry.
 * This module is pure: it never reads clocks, RNG, DOM or mutable combat state.
 */
const unique = values => [...new Set(values.filter(Boolean))];
const copy = value => JSON.parse(JSON.stringify(value));
const has = (stage, ...props) => props.some(prop => (stage.props || []).includes(prop));
const unresolved = /non.confirme|non.confirmee|a.identifier|a.documenter|a.corroborer|a.verifier|a.relever|a.fixer|a.preciser|composite.a.separer/;
const INTERIOR = new Set(['school','hospital','apartment','hotel','room','house','hall','office','building','prison','gallery','museum','mall','theater','subway','workshop','sewer','church','lair','otherworld','labyrinth']);
const ALTERED = new Set(['nowhere','hospital_nightmare','midwich_nightmare','central_nightmare','hotel_otherworld','brookhaven_sh2','brookhaven_sh3','nightmare_mall','nightmare_hilltop','nightmare_hospital_sh3','outside_room_302','final_sacrament','nightmare_theater','nightmare_hospital_hc','scarlet_chamber','nightmare_school','frozen_streets','nightmare_hospital_sm','nightmare_mall_sm','otherworld_void','dark_shrine','dark_shrine_corridors','dark_shrine_main','corrupted_ebisugaoka','film_midwich','ascension_otherworld']);
const TRANSITIONS = new Set(['cedar_grove','alchemilla_origins','film_church','ebisugaoka','stilledalen','hope_junction']);
const NARRATIVE_ONLY = new Set(['looping_hall','villa','villa_rooftop','villa_stairwell','final_sacrament','otherworld_void','anne_fight','arcade_1918','arcade_1993']);
const STYLE = Object.freeze({sh1:'rust',sh2:'decay',sh3:'flesh',sh4:'haunting',origins:'mirror',homecoming:'rust',shattered:'ice',downpour:'storm',arcade:'rust',bom:'elemental',pt:'loop',shortmessage:'floral',shf:'shrine',film:'ash',ascension:'ritual',townfall:'signal'});

const LOT11_ENVIRONMENT = Object.freeze({
  "curtis_shop": {
    "source": "homecoming",
    "name": "CURTIS — COMPTOIR DE L’ATELIER",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "tools",
      "chains",
      "saws",
      "machinery"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "looping_hall": {
    "source": "pt",
    "name": "P.T. — COULOIR ÉCLAIRÉ",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "radio",
      "bathroom",
      "clock",
      "corridor",
      "doors",
      "ceiling-lights"
    ],
    "automaticFinishers": false,
    "disableAnimations": true,
    "disabledEvents": {
      "powerFailure": "État éclairé des vues retenues ; coupure de courant et changements des autres boucles exclus."
    }
  },
  "cedar_grove": {
    "source": "origins",
    "name": "CEDAR GROVE — FEMALE TREATMENT",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "cells",
      "mirrors",
      "gurneys",
      "ward",
      "curtains",
      "monitor"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "antique_shop": {
    "source": "origins",
    "name": "GREEN LION — PASSAGE VERS LE RITUEL",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-altered",
    "removeProps": [
      "flauros",
      "altar",
      "fire",
      "grates",
      "chains",
      "industrial-depth"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "church_hc": {
    "source": "homecoming",
    "name": "CHURCH OF THE HOLY WAY — NEF",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "organ",
      "altar",
      "chains",
      "nave",
      "symbols"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "underground_hc": {
    "source": "homecoming",
    "name": "UNDERGROUND — ANTICHAMBRE DES FAMILLES",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "webs",
      "machines",
      "cocoons",
      "organic-wall",
      "pipes",
      "roots"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "dark_shrine_corridors": {
    "source": "shf",
    "name": "DARK SHRINE — AUTEL INARI",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-altered",
    "removeProps": [
      "lanterns",
      "runes",
      "roots",
      "torii",
      "ritual-depth"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "dark_shrine_main": {
    "source": "shf",
    "name": "DARK SHRINE — PREMIÈRE CHAMBRE RITUELLE",
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-altered",
    "removeProps": [
      "altar",
      "lanterns",
      "runes",
      "torii",
      "ritual-depth"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  }
});
const LOT11_SCENE_PRESENTATION = Object.freeze({
  "curtis_shop": {
    "source": "homecoming",
    "policy": {
      "sceneId": "junkyard-counter-first-exchange",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "DEVANT LE COMPTOIR DE L’ATELIER",
        "description": "La vue native montre le comptoir de bois, pendule ronde, livres et fenêtre à planches. Aucun corps ou siège occupé n’est rejoué, aucune ampoule ou machine rotative inventée. Chaîne générique antérieure non attestée dans ce cadrage retirée du rendu. Lumière et perspective frontale versus, non géométrie mesurée. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "normalPhaseLabel": "COMPTOIR · PREMIER ÉCHANGE"
    }
  },
  "looping_hall": {
    "source": "pt",
    "policy": {
      "sceneId": "lit-beige-hall-unidentified-loop",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "PLANCHER DU COULOIR P.T.",
        "description": "Trois vues natives inspectées : appliques et plinthes, lanterne et porte fermée, poste RADIO sur meuble. Aucun téléphone entier ou vibration attestée ; pas photographie de couple reproduite, Lisa, phase rouge, réfrigérateur suspendu, son capturé ou boucle source simulée. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "normalPhaseLabel": "COULOIR ÉCLAIRÉ · BOUCLE NON DATÉE"
    }
  },
  "cedar_grove": {
    "source": "origins",
    "policy": {
      "sceneId": "female-treatment-mirror",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "SEUIL DU MIROIR DE SOINS",
        "description": "Le guide et les plans situent le miroir, sans vue native entière de cette pièce inspectée. Cadre, carreaux, profondeur, reflet et faible mouvement sont une reconstruction versus ; aucune géométrie ou bascule originale certifiée. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "normalPhaseLabel": "SALLE DE SOINS · AVANT LE MIROIR"
    }
  },
  "antique_shop": {
    "source": "origins",
    "policy": {
      "sceneId": "green-lion-inner-passage",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "PLATEAU DU PASSAGE INTÉRIEUR",
        "description": "Le guide confirme le trou puis la confrontation, et illustre séparément le Flauros assemblé. Le passage, l’éclairage et la position scénique du volume géométrique restent des adaptations, pas une photographie du Flauros dans cette salle. Aucun personnage, corps rituel, symbole lisible ou grille d’inventaire. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "alteredPhaseLabel": "PASSAGE INTÉRIEUR · AVANT CONFRONTATION"
    }
  },
  "church_hc": {
    "source": "homecoming",
    "policy": {
      "sceneId": "holy-way-main-hall-before-glass-break",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "ALLÉE DE LA NEF",
        "description": "Le guide décrit la fenêtre, les plaques et le pentagone à la base de l’orgue ; les images montrent les cierges et le panneau. Tuyaux supérieurs non reconstruits faute de vue native attribuée. Cadres, teintes et ombres sont abstraits, sans dessin du chevalier ou Halo lisible, Siam, chute du vitrail ou activation du puzzle. La galerie seule ne certifie pas édition et instant de jeu. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "normalPhaseLabel": "NEF · AVANT RUPTURE DU VITRAIL"
    }
  },
  "underground_hc": {
    "source": "homecoming",
    "policy": {
      "sceneId": "founding-families-antechamber",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "DEVANT LA PORTE À ANNEAUX",
        "description": "Quatre tablettes couvertes et porte à deux anneaux documentées. Espacement, couverture et lumière de fond reconstruits ; aucune inscription familiale copiée, résolution du puzzle, vapeur de conduite, lampe chirurgicale ou membre mécanique d’Amnion. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "normalPhaseLabel": "ANTICHAMBRE · PORTE ENCORE FERMÉE"
    }
  },
  "dark_shrine_corridors": {
    "source": "shf",
    "policy": {
      "sceneId": "inari-altar-before-replacement",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "PLANCHER DEVANT L’AUTEL",
        "description": "La statue trouvée dans une autre pièce reste absente du socle retenu. Bougies, meuble et lueur rouge sont les seuls motifs ; aucun kusarigama, suzu de Sakuko, chaîne de décor, Halo ou symbole inventé. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "alteredPhaseLabel": "AUTEL · AVANT RESTITUTION"
    }
  },
  "dark_shrine_main": {
    "source": "shf",
    "policy": {
      "sceneId": "first-ritual-chamber-threshold",
      "terrainRules": false,
      "terrainPresentation": {
        "name": "PLANCHER DU SEUIL RITUEL",
        "description": "L’image de l’indice appartient au parcours New Game+ ; l’état de porte, les deux braseros et les panneaux sont retenus sans importer le jardin ou ses cloches. Flamme et mouvement authored ; aucun corps, poupée activée, purification, inscription ou finisher de récit. Physique neutre du versus ; caméra et géométrie non certifiées 1:1."
      },
      "alteredPhaseLabel": "PREMIÈRE CHAMBRE · SEUIL"
    }
  }
});

const LOT10_ENVIRONMENT = Object.freeze({
  "dark_shrine": {
    "weather": "none",
    "fog": 0,
    "interior": false,
    "worldState": "fixed-altered",
    "removeProps": [
      "torii",
      "roots"
    ],
    "name": "DARK SHRINE — PARVIS DE SHRINE VAULT",
    "source": "shf",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "hinako_home": {
    "weather": "none",
    "fog": 0,
    "interior": true,
    "removeProps": [
      "tatami",
      "doors",
      "roots"
    ],
    "name": "SHIMIZU RESIDENCE I — CORRIDOR D’ENTRÉE",
    "source": "shf",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "shimizu_residence": {
    "weather": "none",
    "fog": 0,
    "interior": true,
    "removeProps": [
      "screens",
      "lanterns",
      "portraits"
    ],
    "name": "SHIMIZU RESIDENCE I — SALLE À MANGER",
    "source": "shf",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "school_shf": {
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "desks",
      "corridor"
    ],
    "name": "EBISUGAOKA SCHOOL — BUREAU DU PERSONNEL",
    "source": "shf",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "corrupted_ebisugaoka": {
    "weather": "none",
    "fog": 0,
    "interior": false,
    "worldState": "fixed-altered",
    "removeProps": [
      "lanterns",
      "booths",
      "roots"
    ],
    "name": "EBISUGAOKA — PARVIS SHIMIZU",
    "source": "shf",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "nightmare_school": {
    "weather": "none",
    "fog": 0,
    "interior": false,
    "worldState": "fixed-altered",
    "removeProps": [
      "ice",
      "lockers",
      "maze"
    ],
    "name": "MIDWICH GELÉ — COUR PAPARAZZI",
    "source": "shattered",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "nightmare_hospital_sm": {
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-altered",
    "removeProps": [
      "beds",
      "ice",
      "lights"
    ],
    "name": "ALCHEMILLA GELÉ — CHAMBRE ER",
    "source": "shattered",
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "nightmare_mall_sm": {
    "weather": "none",
    "fog": 0,
    "interior": true,
    "worldState": "fixed-altered",
    "removeProps": [
      "shops",
      "ice",
      "escalator"
    ],
    "name": "TOLUCA MALL GELÉ — HALL GUMBALL",
    "source": "shattered",
    "automaticFinishers": false,
    "disableAnimations": true
  }
});

// Corrections refer to the exact ID/media. Similar names never transfer a rule.
const ENVIRONMENT = Object.freeze({
  old_silent_hill: {weather:'snow'},
  church_hc: {name:'CHURCH OF THE HOLY WAY',weather:'dust'},
  prison_hc: {name:'OVERLOOK PENITENTIARY'},
  prison_meat_locker: {name:'LABYRINTH — MEAT LOCKER',weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['cells','watchtower','chains']},
  brookhaven_sh2:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['ward','curtains','monitor','beds','cages']},
  alchemilla: {source:'sh1',weather:'dust',removeProps:['ward','curtains','monitor','beds'],disabledEvents:{referenceLightReply:'Salle d’attente normale retenue ; le voyant de l’ascenseur appartient à un autre sous-lieu.'}}, nowhere:{weather:'flicker'}, central_nightmare:{weather:'dust'},
  lakeside_amusement:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['wheel','booths']},
  lakeside_sh3:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['wheel','booths']},
  midwich_nightmare:{weather:'dust',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['lockers','chains','ceiling-lights']},
  sewers:{weather:'dust',fog:0,terrain:'concrete',automaticFinishers:false,disableAnimations:true},
  shopping_mall:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true},
  blue_creek:{weather:'water',terrain:'wetConcrete'},
  hotel_otherworld:{weather:'water',terrain:'wetConcrete',removeProps:['fire','mirrors']},
  lakeview:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['portraits','fire','firelight','crtv','screens','monitors','television']}, labyrinth:{weather:'dust',terrain:'concrete',style:'decay'},
  historical_society:{removeProps:['stairs']}, baldwin_mansion:{removeProps:['fireplace']},
  brookhaven_roof:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['water','fence']}, apartment_roof:{weather:'fog'},
  room_302:{weather:'dust'}, apartment_world:{weather:'dust'}, forest_world:{weather:'fog',removeProps:['wish_house','wish house']},
  subway_world:{weather:'dust',removeProps:['turnstile']},
  building_world:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true,removeProps:['doors','signs','elevator']},
  water_prison:{weather:'dust',terrain:'concrete',removeProps:['tower','watchtower','cells','spotlight','chains']},
  hospital_world:{removeProps:['beds','head','curtains','monitor']},
  town_hall_hc:{removeProps:['stairs','flags']}, shepherd_house_hc:{removeProps:['portraits','stairs','mirrors']},
  devils_pit:{weather:'dust',terrain:'concrete',removeProps:['water','rails','cart']},
  cedar_grove:{weather:'dust'}, riverside_motel:{weather:'fog'}, grand_hotel:{weather:'dust'},
  artaud_theater:{weather:'none',fog:0,automaticFinishers:false,disableAnimations:true},
  nightmare_school:{weather:'cold'}, nightmare_hospital_sm:{weather:'cold'}, nightmare_mall_sm:{weather:'cold'},
  police_station_hc:{weather:'dust'}, centennial_building:{weather:'dust'}, st_marias:{weather:'dust'}, overlook:{weather:'dust',removeProps:['towers','watchtower','flood','chains']},
  church:{weather:'dust',removeProps:['fans','flesh','symbols']}, hilltop_center:{removeProps:['elevator']}, underground_hc:{weather:'dust'},
  nightmare_mall:{weather:'dust'}, nightmare_hilltop:{weather:'dust'}, nightmare_theater:{weather:'dust'},
  scarlet_chamber:{weather:'dust',removeProps:['mirrors']},
  villa:{weather:'dust'}, villa_rooftop:{weather:'fog'},
  hinako_home:{weather:'dust',removeProps:['roots']}, shimizu_residence:{weather:'dust'}, dark_shrine_main:{weather:'dust'},
  film_midwich:{weather:'ash'}, film_church:{weather:'dust'}, film_sanctuary:{weather:'dust'}, return_streets:{weather:'ash'},
  arcade_1918:{weather:'water',style:'decay',removeProps:['runes','altar']},
  arcade_1993:{weather:'water',style:'decay',removeProps:['portraits','void']},
  ascension_otherworld:{weather:'flicker',removeProps:['altar']},
  st_amelia_residential:{weather:'fog',removeProps:['crtv']},
  alternate_facility:{weather:'flicker',style:'signal'},
  ...{
    "blue_creek": {
      "source": "sh2",
      "weather": "water",
      "terrain": "wetConcrete",
      "automaticFinishers": false,
      "removeProps": [
        "doors",
        "windows"
      ]
    },
    "nightmare_mall": {
      "source": "sh3",
      "weather": "dust",
      "automaticFinishers": false,
      "removeProps": [
        "shops",
        "shutters",
        "signage",
        "fans"
      ]
    },
    "grand_hotel": {
      "source": "homecoming",
      "weather": "dust",
      "automaticFinishers": false,
      "removeProps": [
        "elevator",
        "dolls",
        "boiler",
        "portraits",
        "firelight"
      ]
    },
    "police_station_hc": {
      "source": "homecoming",
      "weather": "dust",
      "automaticFinishers": false,
      "removeProps": [
        "desks",
        "windows",
        "elevator"
      ]
    },
    "prison_hc": {
      "source": "homecoming",
      "name": "OVERLOOK PENITENTIARY",
      "weather": "dust",
      "automaticFinishers": false,
      "removeProps": [
        "chains",
        "watchtower"
      ]
    },
    "shepherds_glen": {
      "source": "homecoming",
      "automaticFinishers": false,
      "removeProps": [
        "townhall",
        "trees"
      ]
    },
    "film_church": {
      "source": "film",
      "weather": "dust",
      "automaticFinishers": false,
      "worldState": "fixed-normal",
      "removeProps": [
        "chains",
        "flesh",
        "symbols"
      ]
    },
    "nightmare_hospital_hc": {
      "source": "homecoming",
      "weather": "dust",
      "automaticFinishers": false,
      "worldState": "fixed-normal",
      "removeProps": [
        "beds",
        "fans",
        "chains",
        "monitor"
      ]
    },
    "film_hospital": {
      "source": "film",
      "name": "HÔPITAL DU FILM — CHAMBRE D’ALESSA",
      "weather": "none",
      "fog": 0,
      "automaticFinishers": false,
      "disableAnimations": true,
      "removeProps": [
        "ward",
        "monitor",
        "beds",
        "gurneys",
        "chains"
      ]
    },
    "book_fire": {
      "source": "bom",
      "interior": true,
      "automaticFinishers": false,
      "removeProps": [
        "lava",
        "runes",
        "pillars",
        "glyphs",
        "void",
        "elemental-field"
      ]
    },
    "book_wood": {
      "source": "bom",
      "automaticFinishers": false,
      "removeProps": [
        "runes",
        "glyphs",
        "void"
      ]
    },
    "book_earth": {
      "source": "bom",
      "interior": true,
      "automaticFinishers": false,
      "removeProps": [
        "runes",
        "glyphs",
        "void"
      ]
    },
    "book_blood": {
      "source": "bom",
      "automaticFinishers": false,
      "removeProps": [
        "runes",
        "glyphs",
        "void",
        "veins",
        "pools"
      ]
    }
  },

  ...LOT10_ENVIRONMENT,
  ...LOT11_ENVIRONMENT,
});

// Scene wording and neutral versus footing do not assert a material's source physics.
const SCENE_PRESENTATION = Object.freeze({
  ...LOT11_SCENE_PRESENTATION,
  ...{
  "dark_shrine": {
    "source": "shf",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "PARVIS AVANT SHRINE VAULT",
      "alteredPhaseLabel": "PARVIS AVANT SHRINE VAULT",
      "terrainPresentation": {
        "name": "PARVIS DU HOKORA",
        "description": "Parvis devant Shrine Vault fermé et son petit Hokora latéral ; pas couloirs, salle de boss ou coffre ouvert. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "hinako_home": {
    "source": "shf",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "RESIDENCE I · ENTRÉE",
      "alteredPhaseLabel": "RESIDENCE I · ENTRÉE",
      "terrainPresentation": {
        "name": "PLANCHER DU CORRIDOR",
        "description": "Corridor d’entrée à plancher bois, distinct de la salle à manger tatami de ResidenceI et des étatsResidenceII/III. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "shimizu_residence": {
    "source": "shf",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "RESIDENCE I · SALLE À MANGER",
      "alteredPhaseLabel": "RESIDENCE I · SALLE À MANGER",
      "terrainPresentation": {
        "name": "TATAMI DE LA SALLE À MANGER",
        "description": "Salle à manger à table ronde du calendrier jauni, voie initiale ; pas cuisine ni corridor à plancher bois. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "school_shf": {
    "source": "shf",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "BUREAU AU COFFRET DE CLÉS",
      "alteredPhaseLabel": "BUREAU AU COFFRET DE CLÉS",
      "terrainPresentation": {
        "name": "SOL DU BUREAU DU PERSONNEL",
        "description": "Bureau du personnel avec coffret de clés et tableau de planning ; pas classe générique ou rideau non observé. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "corrupted_ebisugaoka": {
    "source": "shf",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "PARTIE 5 · DEVANT LA RÉSIDENCE",
      "alteredPhaseLabel": "PARTIE 5 · DEVANT LA RÉSIDENCE",
      "terrainPresentation": {
        "name": "PARVIS DEVANT SHIMIZU",
        "description": "Parvis de la vue Part5 devant Shimizu ; pétales et brouillard, sans procession ajoutée ou feu de fin de récit. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "nightmare_school": {
    "source": "shattered",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "COUR GELÉE · PUZZLE PAPARAZZI",
      "alteredPhaseLabel": "COUR GELÉE · PUZZLE PAPARAZZI",
      "terrainPresentation": {
        "name": "COUR DEVANT LA FENÊTRE",
        "description": "Cour de Midwich HighSchool gelée devant la première fenêtre Paparazzi ; puzzle et personnes gelées exclus. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "nightmare_hospital_sm": {
    "source": "shattered",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "CHAMBRE ER · AVANT DÉGEL",
      "alteredPhaseLabel": "CHAMBRE ER · AVANT DÉGEL",
      "terrainPresentation": {
        "name": "SOL DE LA CHAMBRE ER",
        "description": "Chambre ER Alchemilla au puzzle radio avant le dégel ; pas quai ferroviaire, couloir Homecoming ou séparation vitrée inventée. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  },
  "nightmare_mall_sm": {
    "source": "shattered",
    "policy": {
      "terrainRules": false,
      "normalPhaseLabel": "HALL GUMBALL · AVANT DÉGEL",
      "alteredPhaseLabel": "HALL GUMBALL · AVANT DÉGEL",
      "terrainPresentation": {
        "name": "SOL DU HALL GUMBALL",
        "description": "Hall Gumball gelé après Garage AccessSouth ; pas toit, galerie précédente, personnages gelés ou puzzle jouable. Physique neutre du versus, matériau et cadence source non mesurés ; caméra et géométrie non certifiées1:1."
      }
    }
  }
},
  blue_creek:{"source":"sh2","policy":{"terrainRules":false,"terrainPresentation":{"name":"PALIER DE L’ESCALIER","description":"Palier au-dessus de l’escalier noyé ; eau tenue au fond, aucune physique source mesurée. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"AVANT LE DRAINAGE"}},
  nightmare_mall:{"source":"sh3","policy":{"terrainRules":false,"terrainPresentation":{"name":"PALIER DES SIX TUNNELS","description":"Arène souterraine Split Worm ; treillis de bord et sol de duel adaptés, sans ver ajouté. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."}}},
  grand_hotel:{"source":"homecoming","policy":{"terrainRules":false,"terrainPresentation":{"name":"SOL DE L’ATRIUM","description":"Atrium de la rencontre Sepulcher adapté au versus ; supports et rayonnages distincts des chambres et du boiler. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"ATRIUM SANS SEPULCHER"}},
  police_station_hc:{"source":"homecoming","policy":{"terrainRules":false,"terrainPresentation":{"name":"SOL DE LA CELLULE","description":"Cellule de la première rencontre Wheeler ; pas le bureau du chef, le garage ou la prison Overlook. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"CELLULE AVANT LIBÉRATION"}},
  prison_hc:{"source":"homecoming","policy":{"terrainRules":false,"terrainPresentation":{"name":"COURSIVE CELL BLOCK B","description":"Coursive de la prison Homecoming avant la séquence des cages ; lampe et ombres de versus, sans projecteur source certifié. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"CELL BLOCK B NORMAL"}},
  overlook:{"source":"downpour","policy":{"terrainRules":false,"terrainPresentation":{"name":"COURSIVE BLOCK A","description":"Coursive Block A de Downpour ; pas de puits, douches ou workshop inondé. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"BLOCK A AVANT INONDATION"}},
  downpour_streets:{"source":"downpour","policy":{"terrainRules":false,"terrainPresentation":{"name":"CHAUSSÉE DE PEARL CREEK","description":"Condition pluvieuse du versus sur une rue Pearl Creek ; disposition des flaques et moment météorologique non certifiés. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"PEARL CREEK SOUS LA PLUIE"}},
  book_fire:{"source":"bom","policy":{"terrainRules":false,"terrainPresentation":{"name":"PASSAGE DEVANT LES GRILLES FIRE","description":"Salle industrielle de la vue Vita du16octobre2012 ; feu sous les grilles, pas lave extérieure. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."}}},
  book_wood:{"source":"bom","policy":{"terrainRules":false,"terrainPresentation":{"name":"CLAIRIÈRE WOOD","description":"Lisière de l’arène Wood de la vue Vita du16octobre2012 ; aucun Guardian de fond. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."}}},
  book_earth:{"source":"bom","policy":{"terrainRules":false,"terrainPresentation":{"name":"PASSAGE DE LA GALERIE EARTH","description":"Galerie de la préversion du6juin2012 ; pas d’état final commercial ou de plan certifié. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."}}},
  book_blood:{"source":"bom","policy":{"terrainRules":false,"terrainPresentation":{"name":"BORD DES PLATEFORMES BLOOD","description":"Surface rouge de la préversion du6juin2012 ; liquidité et écoulement non confirmés. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."}}},
  film_church:{"source":"film","policy":{"terrainRules":false,"terrainPresentation":{"name":"ALLÉE DES CIERGES","description":"Nef du film2006 avant l’intrusion finale ; aucun barbelé ni communauté ou décor2012 ajouté. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"NEF AVANT L’INTRUSION"}},
  nightmare_hospital_hc:{"source":"homecoming","policy":{"terrainRules":false,"terrainPresentation":{"name":"COULOIR DU RÊVE INITIAL","description":"Couloir clinique du rêve initial avant sa transformation ; ascenseur final et état Otherworld séparés. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"RÊVE CLINIQUE AVANT LE MIROIR"}},
  film_hospital:{"source":"film","policy":{"terrainRules":false,"terrainPresentation":{"name":"SOL DE LA CHAMBRE D’ALESSA","description":"Chambre d’Alessa du film2006 ; appellation Brookhaven non attestée, pas couloir des nurses ou scène2012. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"CHAMBRE D’ALESSA · FILM 2006"}},
  shepherds_glen:{"source":"homecoming","policy":{"terrainRules":false,"terrainPresentation":{"name":"TROTTOIR DU PANNEAU","description":"Panneau de disparus et sa propre lampe dans Shepherd’s Glen ; pas Town Hall ou cimetière. Physique neutre du versus ; échelle, caméra et animation non certifiées 1:1."},"normalPhaseLabel":"PANNEAU DE LA RENCONTRE ELLE"}},

  prison_meat_locker:{source:'sh2',policy:{normalPhaseLabel:'CHAMBRE FROIDE · SECONDE SALLE',terrainRules:false,terrainPresentation:{name:'SOL DE LA CHAMBRE FROIDE',description:'Seconde salle du combat Eddie de SH2 original ; carcasses et rails de fond distincts du plateau versus. Matériau, humidité et physique non mesurés ; cadrage non certifié 1:1.'}}},
  brookhaven_sh2:{source:'sh2',policy:{terrainRules:false,terrainPresentation:{name:'SEUIL DE L’ASCENSEUR B1',description:'Couloir Otherworld B1 de Brookhaven SH2 original, devant l’ascenseur de la poursuite. Plateau versus adapté sans reproduire le sort de Maria ; physique et géométrie non certifiées 1:1.'}}},
  brookhaven_roof:{source:'sh2',policy:{normalPhaseLabel:'TOIT AVANT LA CHUTE',terrainRules:false,terrainPresentation:{name:'PLATEAU DU TOIT BROOKHAVEN',description:'Toit de Brookhaven SH2 original avant la chute, grille encore intacte. Matériau et humidité non déterminés ; règles matérielles désactivées, cadrage et collisions non certifiés 1:1.'}}},
  building_world:{source:'sh4',policy:{normalPhaseLabel:'ESCALIER B12–B15 · PREMIER PASSAGE',terrainRules:false,terrainPresentation:{name:'PALIER DU GRAND VENTILATEUR',description:'Escalier B12–B15 du premier Building World, sous le grand ventilateur. Palier horizontal adapté au versus ; aucune chute, physique ou géométrie source certifiée 1:1.'}}},
  artaud_theater:{source:'origins',policy:{normalPhaseLabel:'SCÈNE NORMALE · PROJECTEURS ACTIVÉS',terrainRules:false,terrainPresentation:{name:'PLATEAU DE LA SCÈNE ARTAUD',description:'Scène normale du théâtre après activation des projecteurs et levée du rideau. Décor peint non identifié, reflet et bascule non importés ; géométrie, physique et lumière non certifiées 1:1.'}}},
  lakeview:{source:'sh2',policy:{normalPhaseLabel:'AVANT LA CASSETTE',terrainRules:false,terrainPresentation:{name:'TAPIS DU LOBBY',description:'Tapis du lobby avant la cassette ; humidité non déterminée. Règles de terrain désactivées ; caméra et géométrie non certifiées 1:1.'}}},
  shopping_mall:{source:'sh3',policy:{normalPhaseLabel:'CENTRE COMMERCIAL NORMAL',terrainRules:false,terrainPresentation:{name:'SOL DU CENTRE COMMERCIAL',description:'Couloir normal du Central Square ; plateau versus adapté, humidité et physique non déterminées. Aucun effet de terrain source revendiqué ; fidélité 1:1 non certifiée.'}}},
  midwich_nightmare:{source:'sh1',policy:{terrainRules:false,terrainPresentation:{name:'DALLE AUTOUR DU FOYER',description:'Chaufferie Otherworld de Midwich ; passage de duel devant le foyer, cadrage adapté. Règles matérielles désactivées ; caméra et collisions non certifiées 1:1.'}}},
  sewers:{source:'sh3',policy:{normalPhaseLabel:'APRÈS LE SÈCHE-CHEVEUX',terrainRules:false,terrainPresentation:{name:'PASSERELLE DU CANAL',description:'Passerelle après usage du sèche-cheveux ; eau confinée au canal, aucun courant électrique actif dans le versus. Physique et cadrage non certifiés 1:1.'}}},
  lakeside_amusement:{source:'sh1',policy:{normalPhaseLabel:'MANÈGE DE CYBIL · SH1',terrainRules:false,terrainPresentation:{name:'PLATEAU DU MANÈGE SH1',description:'Manège du parc SH1 ; humidité et matériau du plateau non déterminés. Rotation de fond proposée, règles matérielles désactivées et caméra non certifiée 1:1.'}}},
  lakeside_sh3:{source:'sh3',policy:{normalPhaseLabel:'AVANT LA TRANSITION DU CARROUSEL',terrainRules:false,terrainPresentation:{name:'PLATEAU DU HAPPY CAROUSEL',description:'Happy Carousel avant sa transition ; chevaux de fond fixés à leurs mâts. Aucun poison ou obstacle ajouté ; humidité, physique et caméra non certifiées 1:1.'}}},
});

const LOT9_REFERENCE_TRACKS = Object.freeze({
  blueStairRailReply:{"name":"Rampe fixée au-dessus de l’escalier noyé","layer":"background","replaces":[],"stageId":"blue_creek","source":"sh2","locationScope":"Palier nord Blue Creek, duel SH2 original avant drainage","limits":"Rampe et eau de la vue originale ; vibration et goutte proposées pour le versus. Aucun drainage, départ de Pyramid Head, chute ou niveau mesuré."},
  splitWormGrateReply:{"name":"Treillis de bord de l’arène souterraine","layer":"background","replaces":[],"stageId":"nightmare_mall","source":"sh3","locationScope":"Palier de l’arène Split Worm SH3, six ouvertures conservées","limits":"Treillis abstrait près du bord ; déformation élastique proposée sans nouveau passage, collision, Split Worm ou ouverture d’un septième tunnel."},
  atriumSupportReply:{"name":"Support suspendu de l’atrium Sepulcher","layer":"background","replaces":[],"stageId":"grand_hotel","source":"homecoming","locationScope":"Atrium Otherworld du Grand Hotel Homecoming, sans boss ajouté","limits":"Le guide décrit les quatre sacs suspendus. Seul leur support abstrait réagit dans le versus ; aucun sac destructible, arbre vivant, Sepulcher, vibration canonique ou lustre inventé."},
  policeCellLightDust:{"name":"Poussière dans la lumière de la cellule","layer":"background","replaces":[],"stageId":"police_station_hc","source":"homecoming","locationScope":"Cellule du réveil d’Alex, commissariat Homecoming, avant libération par Wheeler","limits":"Barreaux et cellule attestés ; faisceau et poussière sont proposés pour le versus, sans Wheeler, phare mobile attribué à son arme, fumée d’incendie ou effet sur la précision."},
  policeCellBarsReply:{"name":"Barreaux fermés de la cellule du commissariat","layer":"background","replaces":[],"stageId":"police_station_hc","source":"homecoming","locationScope":"Cellule du premier réveil, distincte de la prison Homecoming","limits":"Une résonance visuelle proposée après impact local ; serrure intacte, aucun passage ouvert, Schism, Wheeler ou empreinte de main."},
  overlookHCCellReply:{"name":"Porte de cellule Overlook Homecoming","layer":"background","replaces":[],"stageId":"prison_hc","source":"homecoming","locationScope":"Coursive normale Cell Block B avant le puzzle des cages Otherworld","limits":"Porte grillagée interprétée, oscillation très faible proposée ; sans prison Downpour, cage du puzzle, levier automatique, ouverture ou chute."},
  overlookHCBarLight:{"name":"Ombres des barreaux du Cell Block B","layer":"background","replaces":[],"stageId":"prison_hc","source":"homecoming","locationScope":"Coursive normale de la prison Overlook Homecoming","limits":"Barreaux attestés ; mouvement de l’éclairage du versus proposé, sans projecteur de surveillance source revendiqué ni passage d’un gardien."},
  overlookDPDoorReply:{"name":"Battant de fond du Block A Downpour","layer":"background","replaces":[],"stageId":"overlook","source":"downpour","locationScope":"Coursive Block A normale avant toute chambre inondée, Downpour","limits":"Porte de coursive retenue fermée ; vibration proposée, sans crime des douches, flooding du workshop, tours ou plan de Homecoming."},
  pearlCreekRainDepth:{"name":"Pluie de fond sur Pearl Creek","layer":"background","replaces":["rainSheets"],"stageId":"downpour_streets","source":"downpour","locationScope":"Rue de Pearl Creek vers Laymond Avenue et Brite Street, condition pluvieuse du versus","limits":"Déclinaison de la pluie du prototype en profondeur ; angle et cadence authored, rue et état météorologique non mesurés. Aucun pouvoir de monstre ou orage offensif ajouté."},
  pearlCreekPuddles:{"name":"Ondes des petites flaques de bordure","layer":"background","replaces":[],"stageId":"downpour_streets","source":"downpour","locationScope":"Même rue Pearl Creek sous la pluie, chaussée de duel dégagée","limits":"Petites flaques abstraites proposées en bordure, sans géographie de flaque source certifiée, inondation de chaussée, sol mobile ou coefficient de glisse attesté."},
  bomFireGrateGlow:{"name":"Feu visible sous une grille industrielle","layer":"background","replaces":[],"stageId":"book_fire","source":"bom","locationScope":"Salle Fire illustrée le 16 octobre 2012, grilles industrielles, Vita","limits":"Grilles et lueurs de feu documentées, langues lumineuses proposées sous le plan de fond ; aucun obstacle ou dégâts passifs, Guardian ou lave de volcan importée."},
  bomFireEmberDepth:{"name":"Braises derrière la grille Fire","layer":"background","replaces":[],"stageId":"book_fire","source":"bom","locationScope":"Même salle industrielle Fire Vita, sans entrée du Guardian","limits":"Braises ascendantes authored depuis le motif de feu ; cette photo ne mesure ni leur existence animée exacte, ni cadence ou trajectoire. Elles restent confinées au fond."},
  bomWoodBareBranches:{"name":"Branches nues au bord de l’arène Wood","layer":"background","replaces":["forestWind"],"stageId":"book_wood","source":"bom","locationScope":"Clairière du Wood Guardian illustrée le 16 octobre 2012, Guardian exclu","limits":"Arbres et branches de la lisière seulement, sans corps du Guardian ; petit frémissement proposé. Pas une chambre intérieure de planches empruntée à une autre capture."},
  bomWoodBarkReply:{"name":"Écorce de l’arbre de lisière","layer":"background","replaces":[],"stageId":"book_wood","source":"bom","locationScope":"Même lisière Wood Vita, impact près du tronc abstrait gauche","limits":"Courte poussière authored après impact local ; arbre fixe, pas de débris offensifs, déracinement, membre du Guardian ou silhouette ennemie."},
  bomEarthGravelRoll:{"name":"Petites pierres dans la galerie minière Earth","layer":"background","replaces":[],"stageId":"book_earth","source":"bom","locationScope":"Galerie Earth de la capture du 6 juin 2012, préversion datée","limits":"Roches et galerie attestées pour cette préversion ; roulement authored de trois pierres de fond, sans pente jouable ni état final de la version commerciale certifié."},
  bomEarthBlockReply:{"name":"Bloc retenu dans la paroi minière","layer":"background","replaces":[],"stageId":"book_earth","source":"bom","locationScope":"Même galerie Earth préversion juin 2012, hors trajet de duel","limits":"Bloc mural abstrait et secousse proposés, sans détachement, chute, Earth Guardian ou emprunt au dispositif Steel. Dimensions, mouvement et état final non confirmés."},
  gansNaveCandles:{"name":"Cierges alignés de la nef de 2006","layer":"background","replaces":[],"stageId":"film_church","source":"film","locationScope":"Église du film Christophe Gans 2006, nef avant intrusion finale","limits":"Cierges bas alignés et cierges latéraux documentés dans deux vues ; vacillement authored. Ni chandelles Revelation, barbelés, communauté, symboles lisibles ou transformation ajoutés."},
  hcDreamCurtainGurney:{"name":"Rideau et brancard du couloir initial","layer":"background","replaces":[],"stageId":"nightmare_hospital_hc","source":"homecoming","locationScope":"Rêve clinique Homecoming avant le miroir et l’écorchure Otherworld","limits":"Rideau sur cadre roulant et brancard vides attestés ; frémissement du tissu proposé. Sangles non confirmées et non produites ; aucun patient ou corps, pas état rouillé après le miroir."},
  freezerHookColdReply:{"name":"Crochet et courte buée de fond","layer":"background","replaces":[],"stageId":"prison_meat_locker","source":"sh2","locationScope":"Seconde chambre froide Eddie de SH2 original 2001","limits":"Crochet retenu au rail et faible volute authored ; aucun transport de carcasses, tir ou mécanique de vapeur du remake. Son et température non mesurés."},
  bomBloodSurfacePulse:{"name":"Lueur sur les surfaces rouges de Blood","layer":"background","replaces":[],"stageId":"book_blood","source":"bom","locationScope":"Plateformes rouges de l’arène Blood illustrée le 6 juin 2012, préversion","limits":"Pulsation de lueur uniquement sur la surface rouge observée ; liquidité, volume et écoulement non confirmés. Pas de marée, Blood Guardian, adversaire ou géométrie finale revendiquée."},
  gansAlessaTentCloth:{"name":"Voile de la chambre d’Alessa 2006","layer":"background","replaces":[],"stageId":"film_hospital","source":"film","locationScope":"Chambre d’Alessa dans le film 2006 ; nom Brookhaven non attribué","limits":"Voile opaque/plastifié et cadre documentés par deux vues ; respiration du tissu authored. Aucun lit occupé, Alessa, Lisa, Rose, nurse de couloir ou adaptation 2012 ajouté."},
  shepherdMissingNotices:{"name":"Affiches sur le panneau de disparus","layer":"background","replaces":[],"stageId":"shepherds_glen","source":"homecoming","locationScope":"Panneau extérieur de la première rencontre Elle, Homecoming","limits":"Panneau et papiers de la capture ; frémissement authored de quelques coins. Aucun visage, nom de disparu lisible, Elle ou plan de Town Hall importé."},
  shepherdNoticeLampFog:{"name":"Lampe au-dessus du panneau de disparus","layer":"background","replaces":["streetLightFlicker"],"stageId":"shepherds_glen","source":"homecoming","locationScope":"Même panneau extérieur Shepherd’s Glen sous la brume","limits":"Lampe réelle du panneau ; atténuation de faisceau par la brume proposée. Sans extinction narrative, choc électrique, éclair ou lampadaire déplacé depuis un autre quartier."},
});
const LOT9_BINDINGS = Object.freeze({"blue_creek":[["blueStairRailReply",2,[0.55,0.56],"referenceRailingReply"]],"nightmare_mall":[["splitWormGrateReply",2,[0.24,0.56],"referenceMallGrateReply"]],"grand_hotel":[["atriumSupportReply",2,[0.73,0.28],"referenceSupportReply"]],"police_station_hc":[["policeCellLightDust",1,[0.35,0.35]],["policeCellBarsReply",2,[0.35,0.57],"referencePoliceBarsReply"]],"prison_hc":[["overlookHCCellReply",0,[0.68,0.57],"referenceGateReply"],["overlookHCBarLight",1,[0.68,0.57]]],"overlook":[["overlookDPDoorReply",1,[0.72,0.57],"referenceGateReply"]],"downpour_streets":[["pearlCreekRainDepth",0,[0.5,0.4]],["pearlCreekPuddles",1,[0.5,0.66]]],"book_fire":[["bomFireGrateGlow",0,[0.5,0.55]],["bomFireEmberDepth",1,[0.5,0.5]]],"book_wood":[["bomWoodBareBranches",0,[0.5,0.57]],["bomWoodBarkReply",2,[0.22,0.5],"referenceBarkReply"]],"book_earth":[["bomEarthGravelRoll",0,[0.5,0.6]],["bomEarthBlockReply",2,[0.74,0.48],"referenceEarthBlockReply"]],"film_church":[["gansNaveCandles",0,[0.5,0.57]]],"nightmare_hospital_hc":[["hcDreamCurtainGurney",2,[0.76,0.57]]],"prison_meat_locker":[["freezerHookColdReply",2,[0.18,0.32],"referenceHookReply"]],"book_blood":[["bomBloodSurfacePulse",0,[0.5,0.59]]],"film_hospital":[["gansAlessaTentCloth",0,[0.68,0.57]]],"shepherds_glen":[["shepherdMissingNotices",1,[0.5,0.57]],["shepherdNoticeLampFog",2,[0.5,0.25]]]});

/** Small, executable vocabulary. A binding below is required; no keyword tagging. */
// Lot10: exact room parts and explicit versus result/restart compositions.
const LOT10_REFERENCE_TRACKS = Object.freeze({
  "hokoraRopeSway": {
    "name": "Corde du Hokora devant Shrine Vault",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine",
    "source": "shf",
    "locationScope": "Parvis extérieur Dark Shrine, petit Hokora à gauche de Shrine Vault fermé, SHf2025",
    "limits": "Corde et shide visibles ensemble ; faible flexion authored, sans ouverture du coffre, Hinako, énigme ou motif rituel reproduit."
  },
  "hokoraShideFlutter": {
    "name": "Papier plié retenu au Hokora",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine",
    "source": "shf",
    "locationScope": "Même petit Hokora du parvis avant Shrine Vault fermé",
    "limits": "Papier zigzag observé, frémissement versus proposé ; sans papier de collectible déplacé, texte sacré copié ou cadence source mesurée."
  },
  "residenceEntryPanel": {
    "name": "Porte translucide du corridor d’entrée",
    "layer": "background",
    "replaces": [],
    "stageId": "hinako_home",
    "source": "shf",
    "locationScope": "Shimizu ResidenceI, corridor d’entrée à plancher bois, SHf2025",
    "limits": "Panneaux fermés observés ; vibration minime versus. Ce corridor reste distinct de la salle à manger à tatami, sans déplacer cloison ou collision."
  },
  "residenceThresholdLight": {
    "name": "Lumière au seuil du corridor familial",
    "layer": "background",
    "replaces": [],
    "stageId": "hinako_home",
    "source": "shf",
    "locationScope": "Même corridor d’entrée ResidenceI, porte translucide et plancher bois",
    "limits": "Variation douce proposée depuis la lumière de la vue ; pas d’ombre familiale, apparition, scène de retour ou branche projetée sur un tatami absent."
  },
  "residenceDiningDishes": {
    "name": "Vaisselle sur la table ronde de la salle à manger",
    "layer": "background",
    "replaces": [],
    "stageId": "shimizu_residence",
    "source": "shf",
    "locationScope": "Shimizu ResidenceI, salle à manger du calendrier jauni, voie initiale SHf2025",
    "limits": "Table ronde basse et vaisselle observées ; léger frémissement versus. Aucun objet de cuisine, calendrier lisible, boss ou confrontation importé."
  },
  "schoolStaffChalkDust": {
    "name": "Poussière du tableau du bureau du personnel",
    "layer": "background",
    "replaces": [],
    "stageId": "school_shf",
    "source": "shf",
    "locationScope": "Ebisugaoka Middle School, bureau du personnel au coffret de clés, SHf2025",
    "limits": "Tableau noir de planning visible à droite ; poussière proposée au-dessus de sa réglette, sans classe, rideau, écriture copiée ou scène d’enseignement."
  },
  "residenceForecourtPetals": {
    "name": "Pétales rouges devant la résidence",
    "layer": "background",
    "replaces": [],
    "stageId": "corrupted_ebisugaoka",
    "source": "shf",
    "locationScope": "Parvis extérieur de la résidence Shimizu, Ebisugaoka Part5 SHf2025",
    "limits": "Pétales et bordure rouge de la vue observés ; chute lente versus proposée, sans croissance sur les combattants, foule ou propagation canonique mesurée."
  },
  "residenceForecourtFog": {
    "name": "Brume devant les tuiles de la résidence",
    "layer": "background",
    "replaces": [],
    "stageId": "corrupted_ebisugaoka",
    "source": "shf",
    "locationScope": "Même parvis Shimizu Part5, façade et ciel embrumés",
    "limits": "Deux plans de brume authored depuis la vue ; pas de changement de météo, procession, passage d’acteur ou physique de glisse source revendiqué."
  },
  "midwichCourtyardIcePane": {
    "name": "Givre autour de la fenêtre de la cour",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_school",
    "source": "shattered",
    "locationScope": "Midwich High School gelée, cour du premier cliché Paparazzi, ShatteredMemories Wii2009",
    "limits": "Fenêtre contextualisée par le guide et son petit cadrage de téléphone ; dessin de givre versus proposé. Ni couple gelé, photos, glace brisée ni restitution complète du bâtiment."
  },
  "midwichCourtyardColdBeam": {
    "name": "Buée dans le faisceau de la cour",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_school",
    "source": "shattered",
    "locationScope": "Même fenêtre de la cour Midwich au puzzle Paparazzi, Wii2009",
    "limits": "Flashlight et contexte glacé documentés ; faisceau fixe et buée versus proposés sans Harry, main, téléphone ou lumière de quête portable."
  },
  "alchemillaERColdWall": {
    "name": "Lueur froide dans le mur de la chambre ER",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_hospital_sm",
    "source": "shattered",
    "locationScope": "Chambre ER Alchemilla, puzzle radio avant dégel de la porte, ShatteredMemories Wii2009",
    "limits": "Vue de chambre et guide précis ; pulsation bleue authored sur le mur, sans figures père/enfant, radio jouable, fréquence sonore, rideau ou vitrage non corroboré."
  },
  "tolucaGumballFrostSign": {
    "name": "Panneau de la salle Gumball sous le givre",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_mall_sm",
    "source": "shattered",
    "locationScope": "TolucaMall gelé, hall Gumball après Garage Access South, ShatteredMemories Wii2009",
    "limits": "Panneau mural et glace visibles dans la petite vue ; givre authored sur un panneau abstrait, sans logo copié, Tookie, silhouettes gelées, distributeur ou puzzle jouable."
  },
  "hokoraRoundRest": {
    "name": "Corde et shide s’immobilisent, la lueur du Hokora se resserre",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine",
    "source": "shf",
    "locationScope": "Parvis extérieur Dark Shrine, petit Hokora à gauche de Shrine Vault fermé, SHf2025",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Corde et shide s’immobilisent, la lueur du Hokora se resserre. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "hokoraRopeSway",
        "hokoraShideFlutter",
        "lanternGlow"
      ],
      "settleFrames": 30,
      "kind": "hokoraRoundRest"
    }
  },
  "entryRoundRest": {
    "name": "Le panneau s’apaise et le seuil garde un rectangle de lumière",
    "layer": "background",
    "replaces": [],
    "stageId": "hinako_home",
    "source": "shf",
    "locationScope": "Shimizu ResidenceI, corridor d’entrée à plancher bois, SHf2025",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Le panneau s’apaise et le seuil garde un rectangle de lumière. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "residenceEntryPanel",
        "residenceThresholdLight"
      ],
      "settleFrames": 22,
      "kind": "entryRoundRest"
    }
  },
  "diningRoundRest": {
    "name": "Les deux reflets de vaisselle se rapprochent des rebords immobiles",
    "layer": "background",
    "replaces": [],
    "stageId": "shimizu_residence",
    "source": "shf",
    "locationScope": "Shimizu ResidenceI, salle à manger du calendrier jauni, voie initiale SHf2025",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les deux reflets de vaisselle se rapprochent des rebords immobiles. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "residenceDiningDishes"
      ],
      "settleFrames": 26,
      "kind": "diningRoundRest"
    }
  },
  "staffRoomRoundRest": {
    "name": "La craie cesse de dériver, la réglette reste le repère éclairé",
    "layer": "background",
    "replaces": [],
    "stageId": "school_shf",
    "source": "shf",
    "locationScope": "Ebisugaoka Middle School, bureau du personnel au coffret de clés, SHf2025",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. La craie cesse de dériver, la réglette reste le repère éclairé. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "schoolStaffChalkDust"
      ],
      "settleFrames": 36,
      "kind": "staffRoomRoundRest"
    }
  },
  "forecourtRoundRest": {
    "name": "Les pétales se posent visuellement et la brume voile les tuiles",
    "layer": "background",
    "replaces": [],
    "stageId": "corrupted_ebisugaoka",
    "source": "shf",
    "locationScope": "Parvis extérieur de la résidence Shimizu, Ebisugaoka Part5 SHf2025",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les pétales se posent visuellement et la brume voile les tuiles. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "rootBorder",
        "residenceForecourtPetals",
        "residenceForecourtFog"
      ],
      "settleFrames": 42,
      "kind": "forecourtRoundRest"
    }
  },
  "courtyardRoundRest": {
    "name": "La bordure givrée se stabilise, le faisceau froid s’adoucit",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_school",
    "source": "shattered",
    "locationScope": "Midwich High School gelée, cour du premier cliché Paparazzi, ShatteredMemories Wii2009",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. La bordure givrée se stabilise, le faisceau froid s’adoucit. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "midwichCourtyardIcePane",
        "midwichCourtyardColdBeam"
      ],
      "settleFrames": 32,
      "kind": "courtyardRoundRest"
    }
  },
  "erRoundRest": {
    "name": "La pulsation du mur ER se réduit autour de la porte gelée",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_hospital_sm",
    "source": "shattered",
    "locationScope": "Chambre ER Alchemilla, puzzle radio avant dégel de la porte, ShatteredMemories Wii2009",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. La pulsation du mur ER se réduit autour de la porte gelée. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "alchemillaERColdWall"
      ],
      "settleFrames": 20,
      "kind": "erRoundRest"
    }
  },
  "gumballRoundRest": {
    "name": "Le panneau froid s’éteint en quatre plages derrière le givre",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_mall_sm",
    "source": "shattered",
    "locationScope": "TolucaMall gelé, hall Gumball après Garage Access South, ShatteredMemories Wii2009",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Le panneau froid s’éteint en quatre plages derrière le givre. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "tolucaGumballFrostSign"
      ],
      "settleFrames": 28,
      "kind": "gumballRoundRest"
    }
  },
  "fireGrateRoundRest": {
    "name": "Les braises s’arrêtent et la grille garde une rougeur basse",
    "layer": "background",
    "replaces": [],
    "stageId": "book_fire",
    "source": "bom",
    "locationScope": "Même salle industrielle Fire Vita, sans entrée du Guardian",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les braises s’arrêtent et la grille garde une rougeur basse. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "bomFireGrateGlow",
        "bomFireEmberDepth"
      ],
      "settleFrames": 24,
      "kind": "fireGrateRoundRest"
    }
  },
  "woodClearingRoundRest": {
    "name": "Les branches se reposent et les extrémités de la lisière s’assombrissent",
    "layer": "background",
    "replaces": [],
    "stageId": "book_wood",
    "source": "bom",
    "locationScope": "Même lisière Wood Vita, impact près du tronc abstrait gauche",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les branches se reposent et les extrémités de la lisière s’assombrissent. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "rootBorder",
        "bomWoodBareBranches"
      ],
      "settleFrames": 38,
      "kind": "woodClearingRoundRest"
    }
  },
  "earthGalleryRoundRest": {
    "name": "Les petites pierres s’arrêtent et la poussière disparaît au pied de la galerie",
    "layer": "background",
    "replaces": [],
    "stageId": "book_earth",
    "source": "bom",
    "locationScope": "Même galerie Earth préversion juin 2012, hors trajet de duel",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les petites pierres s’arrêtent et la poussière disparaît au pied de la galerie. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "dustDrift",
        "bomEarthGravelRoll"
      ],
      "settleFrames": 18,
      "kind": "earthGalleryRoundRest"
    }
  },
  "bloodPlatformRoundRest": {
    "name": "La lueur rouge des surfaces reste en une bande fixe et basse",
    "layer": "background",
    "replaces": [],
    "stageId": "book_blood",
    "source": "bom",
    "locationScope": "Plateformes rouges de l’arène Blood illustrée le 6 juin 2012, préversion",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. La lueur rouge des surfaces reste en une bande fixe et basse. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "bomBloodSurfacePulse"
      ],
      "settleFrames": 34,
      "kind": "bloodPlatformRoundRest"
    }
  },
  "naveRoundRest": {
    "name": "Les cierges cessent leur inclinaison, les flammes de fond gardent leur point chaud",
    "layer": "background",
    "replaces": [],
    "stageId": "film_church",
    "source": "film",
    "locationScope": "Église du film Christophe Gans 2006, nef avant intrusion finale",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les cierges cessent leur inclinaison, les flammes de fond gardent leur point chaud. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "gansNaveCandles"
      ],
      "settleFrames": 25,
      "kind": "naveRoundRest"
    }
  },
  "alessaRoomRoundRest": {
    "name": "Le voile opaque se repose sur son cadre, un pli garde la lumière",
    "layer": "background",
    "replaces": [],
    "stageId": "film_hospital",
    "source": "film",
    "locationScope": "Chambre d’Alessa dans le film 2006 ; nom Brookhaven non attribué",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Le voile opaque se repose sur son cadre, un pli garde la lumière. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "gansAlessaTentCloth"
      ],
      "settleFrames": 40,
      "kind": "alessaRoomRoundRest"
    }
  },
  "clinicalDreamRoundRest": {
    "name": "Le tissu cesse de flotter, le cadre du brancard reste un repère clair",
    "layer": "background",
    "replaces": [],
    "stageId": "nightmare_hospital_hc",
    "source": "homecoming",
    "locationScope": "Rêve clinique Homecoming avant le miroir et l’écorchure Otherworld",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Le tissu cesse de flotter, le cadre du brancard reste un repère clair. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "hcDreamCurtainGurney"
      ],
      "settleFrames": 27,
      "kind": "clinicalDreamRoundRest"
    }
  },
  "policeCellRoundRest": {
    "name": "Le faisceau se resserre sur la cellule sans ouvrir ses barreaux",
    "layer": "background",
    "replaces": [],
    "stageId": "police_station_hc",
    "source": "homecoming",
    "locationScope": "Cellule du premier réveil, distincte de la prison Homecoming",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Le faisceau se resserre sur la cellule sans ouvrir ses barreaux. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "lampReply",
        "policeCellLightDust"
      ],
      "settleFrames": 21,
      "kind": "policeCellRoundRest"
    }
  },
  "cellBlockBRoundRest": {
    "name": "Les ombres des barreaux cessent leur dérive et gardent une ligne fixe",
    "layer": "background",
    "replaces": [],
    "stageId": "prison_hc",
    "source": "homecoming",
    "locationScope": "Coursive normale de la prison Overlook Homecoming",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. Les ombres des barreaux cessent leur dérive et gardent une ligne fixe. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "overlookHCBarLight"
      ],
      "settleFrames": 33,
      "kind": "cellBlockBRoundRest"
    }
  },
  "atriumRoundRest": {
    "name": "La poussière cesse de tomber et le support d’atrium garde un faible éclat",
    "layer": "background",
    "replaces": [],
    "stageId": "grand_hotel",
    "source": "homecoming",
    "locationScope": "Atrium Otherworld du Grand Hotel Homecoming, sans boss ajouté",
    "limits": "Composition de résultat et reprise propre au versus : les jeux et films sources n’ont pas ces manches. La poussière cesse de tomber et le support d’atrium garde un faible éclat. Même pièce et phase narrative, sans événement source, changement de collision, acteur, son capturé ou certification1:1. Réinitialisation de la boucle au décompte de manche suivante assumée comme raccord versus.",
    "trigger": "match-phase",
    "matchRecipe": {
      "targets": [
        "dustDrift"
      ],
      "settleFrames": 31,
      "kind": "atriumRoundRest"
    }
  }
});
const LOT10_BINDINGS = Object.freeze({"dark_shrine":[["hokoraRopeSway",1,[0.27,0.46]],["hokoraShideFlutter",2,[0.27,0.46]],["hokoraRoundRest",3,[0.27,0.46]]],"hinako_home":[["residenceEntryPanel",0,[0.67,0.57]],["residenceThresholdLight",2,[0.67,0.57]],["entryRoundRest",3,[0.67,0.57]]],"shimizu_residence":[["residenceDiningDishes",0,[0.5,0.57]],["diningRoundRest",3,[0.5,0.57]]],"school_shf":[["schoolStaffChalkDust",1,[0.73,0.39]],["staffRoomRoundRest",3,[0.73,0.39]]],"corrupted_ebisugaoka":[["residenceForecourtPetals",1,[0.5,0.32]],["residenceForecourtFog",2,[0.5,0.48]],["forecourtRoundRest",3,[0.5,0.48]]],"nightmare_school":[["midwichCourtyardIcePane",0,[0.64,0.49]],["midwichCourtyardColdBeam",1,[0.64,0.49]],["courtyardRoundRest",3,[0.64,0.49]]],"nightmare_hospital_sm":[["alchemillaERColdWall",2,[0.67,0.45]],["erRoundRest",3,[0.67,0.45]]],"nightmare_mall_sm":[["tolucaGumballFrostSign",0,[0.3,0.34]],["gumballRoundRest",3,[0.3,0.34]]],"book_fire":[["fireGrateRoundRest",3,[0.5,0.55]]],"book_wood":[["woodClearingRoundRest",3,[0.5,0.57]]],"book_earth":[["earthGalleryRoundRest",3,[0.5,0.6]]],"book_blood":[["bloodPlatformRoundRest",3,[0.5,0.59]]],"film_church":[["naveRoundRest",3,[0.5,0.57]]],"film_hospital":[["alessaRoomRoundRest",3,[0.68,0.57]]],"nightmare_hospital_hc":[["clinicalDreamRoundRest",3,[0.76,0.57]]],"police_station_hc":[["policeCellRoundRest",3,[0.35,0.57]]],"prison_hc":[["cellBlockBRoundRest",3,[0.68,0.57]]],"grand_hotel":[["atriumRoundRest",3,[0.69,0.45]]]});

const LOT11_REFERENCE_TRACKS = Object.freeze({
  "curtisCounterClock": {
    "name": "Pendule et livres du comptoir",
    "layer": "background",
    "replaces": [],
    "stageId": "curtis_shop",
    "source": "homecoming",
    "sceneId": "junkyard-counter-first-exchange",
    "locationScope": "Comptoir de l’atelier où Curtis est assis lors de l’échange initial du pistolet ; distinct du combat ultérieur en Room321 Underground.",
    "limits": "La vue native montre le comptoir de bois, pendule ronde, livres et fenêtre à planches. Aucun corps ou siège occupé n’est rejoué, aucune ampoule ou machine rotative inventée. Chaîne générique antérieure non attestée dans ce cadrage retirée du rendu. Lumière et perspective frontale versus, non géométrie mesurée."
  },
  "curtisWindowSlits": {
    "name": "Fenêtre à planches de l’atelier",
    "layer": "background",
    "replaces": [],
    "stageId": "curtis_shop",
    "source": "homecoming",
    "sceneId": "junkyard-counter-first-exchange",
    "locationScope": "Comptoir de l’atelier où Curtis est assis lors de l’échange initial du pistolet ; distinct du combat ultérieur en Room321 Underground.",
    "limits": "La vue native montre le comptoir de bois, pendule ronde, livres et fenêtre à planches. Aucun corps ou siège occupé n’est rejoué, aucune ampoule ou machine rotative inventée. Chaîne générique antérieure non attestée dans ce cadrage retirée du rendu. Lumière et perspective frontale versus, non géométrie mesurée."
  },
  "ptHangingLantern": {
    "name": "Lanterne du second tronçon éclairé",
    "layer": "background",
    "replaces": [],
    "stageId": "looping_hall",
    "source": "pt",
    "sceneId": "lit-beige-hall-unidentified-loop",
    "locationScope": "Couloir P.T. éclairé, murs beige et plancher sombre, photographié le14août2014 ; numéro de boucle non déterminable. Reconstruction frontale versus de ses deux tronçons, sans réinitialisation de topologie.",
    "limits": "Trois vues natives inspectées : appliques et plinthes, lanterne et porte fermée, poste RADIO sur meuble. Aucun téléphone entier ou vibration attestée ; pas photographie de couple reproduite, Lisa, phase rouge, réfrigérateur suspendu, son capturé ou boucle source simulée."
  },
  "ptRadioCabinet": {
    "name": "Poste radio et meuble du couloir éclairé",
    "layer": "background",
    "replaces": [],
    "stageId": "looping_hall",
    "source": "pt",
    "sceneId": "lit-beige-hall-unidentified-loop",
    "locationScope": "Couloir P.T. éclairé, murs beige et plancher sombre, photographié le14août2014 ; numéro de boucle non déterminable. Reconstruction frontale versus de ses deux tronçons, sans réinitialisation de topologie.",
    "limits": "Trois vues natives inspectées : appliques et plinthes, lanterne et porte fermée, poste RADIO sur meuble. Aucun téléphone entier ou vibration attestée ; pas photographie de couple reproduite, Lisa, phase rouge, réfrigérateur suspendu, son capturé ou boucle source simulée."
  },
  "ptBackDoorLight": {
    "name": "Porte fermée du second tronçon",
    "layer": "background",
    "replaces": [],
    "stageId": "looping_hall",
    "source": "pt",
    "sceneId": "lit-beige-hall-unidentified-loop",
    "locationScope": "Couloir P.T. éclairé, murs beige et plancher sombre, photographié le14août2014 ; numéro de boucle non déterminable. Reconstruction frontale versus de ses deux tronçons, sans réinitialisation de topologie.",
    "limits": "Trois vues natives inspectées : appliques et plinthes, lanterne et porte fermée, poste RADIO sur meuble. Aucun téléphone entier ou vibration attestée ; pas photographie de couple reproduite, Lisa, phase rouge, réfrigérateur suspendu, son capturé ou boucle source simulée."
  },
  "treatmentMirrorVeil": {
    "name": "Reflet contenu dans le miroir de soins",
    "layer": "background",
    "replaces": [],
    "stageId": "cedar_grove",
    "source": "origins",
    "sceneId": "female-treatment-mirror",
    "locationScope": "Salle Female Treatment du Sanitarium, avant la traversée du miroir ; ni couloir entier ni chambre Momma.",
    "limits": "Le guide et les plans situent le miroir, sans vue native entière de cette pièce inspectée. Cadre, carreaux, profondeur, reflet et faible mouvement sont une reconstruction versus ; aucune géométrie ou bascule originale certifiée."
  },
  "greenLionPassageDust": {
    "name": "Poussière au bord du passage intérieur",
    "layer": "background",
    "replaces": [],
    "stageId": "antique_shop",
    "source": "origins",
    "sceneId": "green-lion-inner-passage",
    "locationScope": "Passage après le trou de Green Lion Antiques, avant la confrontation finale Origins ; aucun stock de la boutique SH1 transporté ici.",
    "limits": "Le guide confirme le trou puis la confrontation, et illustre séparément le Flauros assemblé. Le passage, l’éclairage et la position scénique du volume géométrique restent des adaptations, pas une photographie du Flauros dans cette salle. Aucun personnage, corps rituel, symbole lisible ou grille d’inventaire."
  },
  "flaurosCoreShade": {
    "name": "Ombre du volume géométrique assemblé",
    "layer": "background",
    "replaces": [],
    "stageId": "antique_shop",
    "source": "origins",
    "sceneId": "green-lion-inner-passage",
    "locationScope": "Passage après le trou de Green Lion Antiques, avant la confrontation finale Origins ; aucun stock de la boutique SH1 transporté ici.",
    "limits": "Le guide confirme le trou puis la confrontation, et illustre séparément le Flauros assemblé. Le passage, l’éclairage et la position scénique du volume géométrique restent des adaptations, pas une photographie du Flauros dans cette salle. Aucun personnage, corps rituel, symbole lisible ou grille d’inventaire."
  },
  "greenLionWallGlint": {
    "name": "Lueur contenue du passage final",
    "layer": "background",
    "replaces": [],
    "stageId": "antique_shop",
    "source": "origins",
    "sceneId": "green-lion-inner-passage",
    "locationScope": "Passage après le trou de Green Lion Antiques, avant la confrontation finale Origins ; aucun stock de la boutique SH1 transporté ici.",
    "limits": "Le guide confirme le trou puis la confrontation, et illustre séparément le Flauros assemblé. Le passage, l’éclairage et la position scénique du volume géométrique restent des adaptations, pas une photographie du Flauros dans cette salle. Aucun personnage, corps rituel, symbole lisible ou grille d’inventaire."
  },
  "holyWayCandleRow": {
    "name": "Cierges de la nef de Holy Way",
    "layer": "background",
    "replaces": [],
    "stageId": "church_hc",
    "source": "homecoming",
    "sceneId": "holy-way-main-hall-before-glass-break",
    "locationScope": "Nef et fond à orgue de Church of the Holy Way, avant la rupture de la fenêtre du chevalier ; pas confessionnal ou église du film.",
    "limits": "Le guide décrit la fenêtre, les plaques et le pentagone à la base de l’orgue ; les images montrent les cierges et le panneau. Tuyaux supérieurs non reconstruits faute de vue native attribuée. Cadres, teintes et ombres sont abstraits, sans dessin du chevalier ou Halo lisible, Siam, chute du vitrail ou activation du puzzle. La galerie seule ne certifie pas édition et instant de jeu."
  },
  "holyWayGlassLight": {
    "name": "Lumière du vitrage de Holy Way",
    "layer": "background",
    "replaces": [],
    "stageId": "church_hc",
    "source": "homecoming",
    "sceneId": "holy-way-main-hall-before-glass-break",
    "locationScope": "Nef et fond à orgue de Church of the Holy Way, avant la rupture de la fenêtre du chevalier ; pas confessionnal ou église du film.",
    "limits": "Le guide décrit la fenêtre, les plaques et le pentagone à la base de l’orgue ; les images montrent les cierges et le panneau. Tuyaux supérieurs non reconstruits faute de vue native attribuée. Cadres, teintes et ombres sont abstraits, sans dessin du chevalier ou Halo lisible, Siam, chute du vitrail ou activation du puzzle. La galerie seule ne certifie pas édition et instant de jeu."
  },
  "holyWayOrganPanel": {
    "name": "Panneau de l’orgue à cinq logements",
    "layer": "background",
    "replaces": [],
    "stageId": "church_hc",
    "source": "homecoming",
    "sceneId": "holy-way-main-hall-before-glass-break",
    "locationScope": "Nef et fond à orgue de Church of the Holy Way, avant la rupture de la fenêtre du chevalier ; pas confessionnal ou église du film.",
    "limits": "Le guide décrit la fenêtre, les plaques et le pentagone à la base de l’orgue ; les images montrent les cierges et le panneau. Tuyaux supérieurs non reconstruits faute de vue native attribuée. Cadres, teintes et ombres sont abstraits, sans dessin du chevalier ou Halo lisible, Siam, chute du vitrail ou activation du puzzle. La galerie seule ne certifie pas édition et instant de jeu."
  },
  "foundersTabletLight": {
    "name": "Quatre tablettes couvertes de l’antichambre",
    "layer": "background",
    "replaces": [],
    "stageId": "underground_hc",
    "source": "homecoming",
    "sceneId": "founding-families-antechamber",
    "locationScope": "Antichambre Founding Families Puzzle, après la confrontation Curtis et avant la salle Amnion ; sans hôpital du rêve, salle de torture ou boss.",
    "limits": "Quatre tablettes couvertes et porte à deux anneaux documentées. Espacement, couverture et lumière de fond reconstruits ; aucune inscription familiale copiée, résolution du puzzle, vapeur de conduite, lampe chirurgicale ou membre mécanique d’Amnion."
  },
  "foundersDoorRings": {
    "name": "Deux anneaux de la porte encore fermée",
    "layer": "background",
    "replaces": [],
    "stageId": "underground_hc",
    "source": "homecoming",
    "sceneId": "founding-families-antechamber",
    "locationScope": "Antichambre Founding Families Puzzle, après la confrontation Curtis et avant la salle Amnion ; sans hôpital du rêve, salle de torture ou boss.",
    "limits": "Quatre tablettes couvertes et porte à deux anneaux documentées. Espacement, couverture et lumière de fond reconstruits ; aucune inscription familiale copiée, résolution du puzzle, vapeur de conduite, lampe chirurgicale ou membre mécanique d’Amnion."
  },
  "foundersDaggerColumns": {
    "name": "Colonnes des verrous cérémoniels",
    "layer": "background",
    "replaces": [],
    "stageId": "underground_hc",
    "source": "homecoming",
    "sceneId": "founding-families-antechamber",
    "locationScope": "Antichambre Founding Families Puzzle, après la confrontation Curtis et avant la salle Amnion ; sans hôpital du rêve, salle de torture ou boss.",
    "limits": "Quatre tablettes couvertes et porte à deux anneaux documentées. Espacement, couverture et lumière de fond reconstruits ; aucune inscription familiale copiée, résolution du puzzle, vapeur de conduite, lampe chirurgicale ou membre mécanique d’Amnion."
  },
  "inariAltarCandles": {
    "name": "Cierges du petit autel Inari",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_corridors",
    "source": "shf",
    "sceneId": "inari-altar-before-replacement",
    "locationScope": "Petite salle de l’autel à statue manquante dans Dark Shrine Corridors, avant de restituer Inari ; hors arène Sakuko.",
    "limits": "La statue trouvée dans une autre pièce reste absente du socle retenu. Bougies, meuble et lueur rouge sont les seuls motifs ; aucun kusarigama, suzu de Sakuko, chaîne de décor, Halo ou symbole inventé."
  },
  "inariAltarRedGlint": {
    "name": "Reflet rouge contenu au meuble de l’autel",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_corridors",
    "source": "shf",
    "sceneId": "inari-altar-before-replacement",
    "locationScope": "Petite salle de l’autel à statue manquante dans Dark Shrine Corridors, avant de restituer Inari ; hors arène Sakuko.",
    "limits": "La statue trouvée dans une autre pièce reste absente du socle retenu. Bougies, meuble et lueur rouge sont les seuls motifs ; aucun kusarigama, suzu de Sakuko, chaîne de décor, Halo ou symbole inventé."
  },
  "inariAltarWoodLight": {
    "name": "Reflet sur les boiseries de l’autel",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_corridors",
    "source": "shf",
    "sceneId": "inari-altar-before-replacement",
    "locationScope": "Petite salle de l’autel à statue manquante dans Dark Shrine Corridors, avant de restituer Inari ; hors arène Sakuko.",
    "limits": "La statue trouvée dans une autre pièce reste absente du socle retenu. Bougies, meuble et lueur rouge sont les seuls motifs ; aucun kusarigama, suzu de Sakuko, chaîne de décor, Halo ou symbole inventé."
  },
  "ritualThresholdBraziers": {
    "name": "Braseros du premier seuil rituel",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_main",
    "source": "shf",
    "sceneId": "first-ritual-chamber-threshold",
    "locationScope": "Seuil de la première chambre rituelle illustré par l’indice Crimson Water 1 ; hors jardin de cloches, seconde chambre et combat Rinko.",
    "limits": "L’image de l’indice appartient au parcours New Game+ ; l’état de porte, les deux braseros et les panneaux sont retenus sans importer le jardin ou ses cloches. Flamme et mouvement authored ; aucun corps, poupée activée, purification, inscription ou finisher de récit."
  },
  "ritualThresholdPanels": {
    "name": "Panneaux du premier seuil rituel",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_main",
    "source": "shf",
    "sceneId": "first-ritual-chamber-threshold",
    "locationScope": "Seuil de la première chambre rituelle illustré par l’indice Crimson Water 1 ; hors jardin de cloches, seconde chambre et combat Rinko.",
    "limits": "L’image de l’indice appartient au parcours New Game+ ; l’état de porte, les deux braseros et les panneaux sont retenus sans importer le jardin ou ses cloches. Flamme et mouvement authored ; aucun corps, poupée activée, purification, inscription ou finisher de récit."
  },
  "ritualThresholdDoorGlint": {
    "name": "Lueur sur la porte rituelle fermée",
    "layer": "background",
    "replaces": [],
    "stageId": "dark_shrine_main",
    "source": "shf",
    "sceneId": "first-ritual-chamber-threshold",
    "locationScope": "Seuil de la première chambre rituelle illustré par l’indice Crimson Water 1 ; hors jardin de cloches, seconde chambre et combat Rinko.",
    "limits": "L’image de l’indice appartient au parcours New Game+ ; l’état de porte, les deux braseros et les panneaux sont retenus sans importer le jardin ou ses cloches. Flamme et mouvement authored ; aucun corps, poupée activée, purification, inscription ou finisher de récit."
  }
});
const LOT11_BINDINGS = Object.freeze({
  "curtis_shop": [
    [
      "curtisCounterClock",
      1,
      [
        0.45,
        0.54
      ]
    ],
    [
      "curtisWindowSlits",
      2,
      [
        0.8,
        0.32
      ]
    ]
  ],
  "looping_hall": [
    [
      "ptHangingLantern",
      0,
      [
        0.48,
        0.25
      ]
    ],
    [
      "ptRadioCabinet",
      1,
      [
        0.77,
        0.55
      ]
    ],
    [
      "ptBackDoorLight",
      2,
      [
        0.5,
        0.57
      ]
    ]
  ],
  "cedar_grove": [
    [
      "treatmentMirrorVeil",
      1,
      [
        0.66,
        0.4
      ]
    ]
  ],
  "antique_shop": [
    [
      "greenLionPassageDust",
      0,
      [
        0.25,
        0.45
      ]
    ],
    [
      "flaurosCoreShade",
      1,
      [
        0.68,
        0.48
      ]
    ],
    [
      "greenLionWallGlint",
      2,
      [
        0.68,
        0.35
      ]
    ]
  ],
  "church_hc": [
    [
      "holyWayCandleRow",
      0,
      [
        0.5,
        0.55
      ]
    ],
    [
      "holyWayGlassLight",
      1,
      [
        0.72,
        0.29
      ]
    ],
    [
      "holyWayOrganPanel",
      2,
      [
        0.5,
        0.43
      ]
    ]
  ],
  "underground_hc": [
    [
      "foundersTabletLight",
      0,
      [
        0.5,
        0.39
      ]
    ],
    [
      "foundersDoorRings",
      1,
      [
        0.5,
        0.43
      ]
    ],
    [
      "foundersDaggerColumns",
      2,
      [
        0.5,
        0.47
      ]
    ]
  ],
  "dark_shrine_corridors": [
    [
      "inariAltarRedGlint",
      1,
      [
        0.6,
        0.39
      ]
    ],
    [
      "inariAltarWoodLight",
      2,
      [
        0.3,
        0.36
      ]
    ],
    [
      "inariAltarCandles",
      0,
      [
        0.6,
        0.49
      ]
    ]
  ],
  "dark_shrine_main": [
    [
      "ritualThresholdBraziers",
      0,
      [
        0.5,
        0.52
      ]
    ],
    [
      "ritualThresholdPanels",
      1,
      [
        0.5,
        0.34
      ]
    ],
    [
      "ritualThresholdDoorGlint",
      2,
      [
        0.5,
        0.4
      ]
    ]
  ]
});

export const STAGE_REFERENCE_TRACKS = Object.freeze({
  ...LOT11_REFERENCE_TRACKS,
  ...LOT10_REFERENCE_TRACKS,
  ...LOT9_REFERENCE_TRACKS,
  fogLayers: {name:'Nappes de brume à deux vitesses',layer:'background',replaces:['fogDrift']},
  snowDepth: {name:'Neige dans la profondeur',layer:'air',replaces:['snowGust']},
  ashDepth: {name:'Cendre dans la profondeur',layer:'air',replaces:['ashFall']},
  fanEccentric: {name:'Ventilateur derrière sa protection',layer:'background',replaces:['fanSpin']},
  curtainBreathe: {name:'Bord de rideau dans un courant faible',layer:'background',replaces:['curtainSway']},
  chainPendulum: {name:'Chaîne suspendue à faible amplitude',layer:'background',replaces:['chainSway']},
  waterRings: {name:'Ondes à niveau d’eau constant',layer:'background',replaces:['waterRipple','waves']},
  waterSwell: {name:'Houle basse au fond du lac',layer:'background',replaces:['waterRipple','waves']},
  dustDrift: {name:'Poussière dans un faisceau de fond',layer:'background',replaces:[]},
  mirrorContamination: {name:'Traînée sombre sur le miroir',layer:'background',replaces:['mirrorGlitch']},
  lightSequence: {name:'Lumières successives vers la porte',layer:'background',replaces:['lightFlicker','lampFlicker']},
  signFlicker: {name:'Enseigne intermittente',layer:'background',replaces:['neonFlicker','streetLightFlicker']},
  paperFlutter: {name:'Papier retenu au décor',layer:'background',replaces:['flagSway']},
  rootBorder: {name:'Vrilles confinées à la bordure',layer:'background',replaces:['rootsCreep']},
  flowerBorder: {name:'Fleurs rouges dans la bordure',layer:'background',replaces:['rootsCreep','petalSpiral']},
  lanternGlow: {name:'Lueur contenue des lanternes',layer:'background',replaces:['lanternSway','firePulse']},
  doorReply: {name:'Battant entrouvert, appui fixe',layer:'background',replaces:['doorPulse']},
  shutterLift: {name:'Rideau métallique partiellement relevé',layer:'background',replaces:['storeShutters']},
  lampReply: {name:'Voyant après impact',layer:'background',replaces:['elevatorBlink']},
  pipePurge: {name:'Trois jets derrière la protection',layer:'background',replaces:['pipeSteam','ventSteam']},
  pianoKeyReply: {name:'Une touche du piano répond à l’impact',layer:'background',replaces:[],stageId:'midwich',source:'sh1',pendingLocation:'music-room'},
  ropePendulum: {name:'Corde du gibet, appui fixe',layer:'background',replaces:[],stageId:'toluca_prison',source:'sh2',pendingLocation:'gallows-courtyard'},
  cellDoorReply: {name:'Une porte de cellule sur ses charnières',layer:'background',replaces:[],stageId:'toluca_prison',source:'sh2'},
  cubeTurn: {name:'Cube de commande, orientation de fond',layer:'background',replaces:[],stageId:'labyrinth',source:'sh2'},
  washroomHoleReply: {name:'Lueur contenue du trou de la salle de bain',layer:'background',replaces:[],stageId:'room_302',source:'sh4'},
  paintingGlint: {name:'Reflet sur le vitrage d’un cadre sombre',layer:'background',replaces:[],stageId:'historical_society',source:'sh2',locationScope:'Salles d’exposition du musée ; hors escalier et puits',limits:'Vitrage et cadre abstraits ; aucun tableau officiel ni personnage reproduit ou animé.'},
  closedDoorReply: {name:'Battant fermé du Lounge d’Ernest',layer:'background',replaces:[],stageId:'baldwin_mansion',source:'sh2',locationScope:'Palier devant le Lounge ; porte fermée de Born from a Wish',limits:'La porte reste opaque et fermée ; aucun Ernest visible, aucune bougie du grenier déplacée ici.'},
  chapelCandleLean: {name:'Flammes des cierges de la chapelle',layer:'background',replaces:[],stageId:'church',source:'sh3',locationScope:'Chapelle avec autel et vitraux ; hors passages mémoire et fosse finale',limits:'Cierges attestés ; inclinaison commune proposée pour le versus, sans invocation ni effet sur les combattants.'},
  officeBlindSway: {name:'Store du bureau de Monica’s Dance Studio',layer:'background',replaces:[],stageId:'hilltop_center',source:'sh3',locationScope:'Bureau / réception de Monica’s Dance Studio, Hilltop Center normal',limits:'Store attesté dans cette pièce ; oscillation proposée pour le versus, sans atelier ni seuil de baignoire.'},
  subwayDoorCycle: {name:'Panneaux d’une voiture arrêtée',layer:'background',replaces:[],stageId:'subway_world',source:'sh4',locationScope:'Premier passage, quai Lynch Street et voitures arrêtées',limits:'Commande rouge attestée ; cycle lent proposé pour le versus, sans Cynthia, Wallmen, départ du train ou danger Hazel Street SH3.'},
  forestWindLayers: {name:'Vent distinct dans les branches et les herbes',layer:'background',replaces:['forestWind','windGust'],stageId:'forest_world',source:'sh4',locationScope:'Sentier et clairière arborée du premier passage ; hors enceinte Wish House',limits:'Deux fréquences de vent proposées pour le versus ; troncs et appuis fixes, aucune maison brûlée ni racine animée comme une main.'},
  waterwheelTurn: {name:'Roue horizontale au fond de la salle B2',layer:'background',replaces:[],stageId:'water_prison',source:'sh4',locationScope:'B2 Waterwheel Room, mécanisme sous la coursive sèche',limits:'Roue dans le plan horizontal et axe vertical ; rotation lente proposée, sans cellule pivotante, vanne automatique, moulin vertical ou sol inondé.'},
  wheelchairDrift: {name:'Fauteuil abstrait dans le couloir du deuxième étage',layer:'background',replaces:[],stageId:'hospital_world',source:'sh4',locationScope:'Couloir des chambres au deuxième étage ; hors chambre de la tête géante',limits:'Fauteuil vide abstrait proposé pour le versus ; les Wheelchairs du jeu sont des ennemis, cette piste ne produit ni leur apparence complète, ni leur IA, ni leurs dégâts.'},
  lecternGlint: {name:'Lueur sur le pupitre de la salle publique',layer:'background',replaces:[],stageId:'town_hall_hc',source:'homecoming',locationScope:'Premier passage normal, salle centrale du Town Hall',limits:'Podium attesté par le guide ; reflet proposé pour le versus, sans texte ajouté, cérémonie de retour, clé ou ouverture du sous-sol.'},
  atticDustFall: {name:'Poussière sous les chevrons du grenier normal',layer:'background',replaces:[],stageId:'shepherd_house_hc',source:'homecoming',locationScope:'Grenier Shepherd House normal avant la transformation',limits:'Charpente et poussière interprétées depuis la proposition versus ; aucun plan mesuré ni masque, médaille, horloge ou objet de l’état Otherworld importé.'},
  mineBeamDrips: {name:'Gouttes sous les traverses de la cavité',layer:'background',replaces:[],stageId:'devils_pit',source:'downpour',locationScope:'Cavité intérieure des roues hydrauliques, vue depuis la coursive sèche',limits:'Traverses et conduites documentées ; gouttes proposées pour le versus, sans pluie extérieure, cave inondée sur le plateau, démarrage de pompe ou train.'},
  cellBarShadows: {name:'Ombres des barreaux sur la coursive',layer:'background',replaces:[],stageId:'overlook',source:'downpour',locationScope:'Coursive Block A de la prison normale avant la vision du couloir inondé',limits:'Barreaux documentés ; déplacement de leur ombre proposé pour le versus, sans corps en cellule, tours, scène des douches, inondation ou prison Homecoming.'},
  boilerHearthGlow:{name:'Braises contenues dans le foyer central',layer:'background',replaces:[],stageId:'midwich_nightmare',source:'sh1',locationScope:'Arène de la chaufferie Otherworld de Midwich, foyer ouvert entouré de grilles',limits:'Éclat des braises proposé sous le rebord ; aucun Split Head, pluie de braises, sirène répétée ou casier. Le passage de duel devant le foyer et la caméra sont adaptés, non certifiés 1:1.'},
  canalCableSway:{name:'Câble sur la passerelle, eau à niveau fixe',layer:'background',replaces:[],stageId:'sewers',source:'sh3',locationScope:'Passerelle du canal après utilisation du sèche-cheveux',limits:'Câble installé après le sèche-cheveux ; petites vibrations proposées pour le versus. Aucun corps vivant, électricité active, électrocution ou eau sur le plateau de duel.'},
  sh1CarouselOrbit:{name:'Rotation de fond du manège SH1',layer:'background',replaces:[],stageId:'lakeside_amusement',source:'sh1',locationScope:'Manège de la rencontre Cybil dans le parc SH1 original',limits:'Rotation lente proposée avec un cheval fixe comme repère ; silhouettes de sculptures originales partielles, ni Cybil, ni gaz et énigme du Happy Carousel SH3.'},
  sh3HorseBob:{name:'Chevaux du Happy Carousel sur mâts fixes',layer:'background',replaces:[],stageId:'lakeside_sh3',source:'sh3',locationScope:'Happy Carousel SH3 avant la transition et la rencontre Memory of Alessa',limits:'Trois sculptures de fond interprètent une partie du manège ; va-et-vient proposé, ensemble des douze chevaux et puzzle non reproduits. Aucun poison, monstre ou scène Cybil SH1.'},
  freezerCarcassSway:{name:'Une carcasse suspendue dans la seconde chambre froide',layer:'background',replaces:['chainSway'],stageId:'prison_meat_locker',source:'sh2',locationScope:'Seconde salle principale de la chambre froide du combat Eddie, SH2 original 2001',limits:'Rail et crochet restent fixes ; une masse abstraite suspendue oscille lentement comme proposition versus. Aucun Eddie, corps humain, obstacle de collision, jet de vapeur du remake ou transport de carcasse. Aspect, nombre de crochets, angle et cadence source non mesurés.'},
  rooftopFenceFlex:{name:'Grille intacte avant la chute de Brookhaven',layer:'background',replaces:[],stageId:'brookhaven_roof',source:'sh2',locationScope:'Toit de Brookhaven SH2 original, grille entre la porte et Elevator Control Room, avant la chute narrative',limits:'Poteaux fixes et déformation minime du treillis proposés pour le versus ; aucune rupture, chute, apparition de Pyramid Head ou grille du remake. Piste préparée mais masquée lorsqu’un bitmap remplace ce toit.'},
  stairwellFanTurn:{name:'Grand ventilateur au-dessus du puits B12–B15',layer:'background',replaces:[],stageId:'building_world',source:'sh4',locationScope:'Grand escalier vide B12 vers B15, premier Building World de SH4',limits:'Le guide atteste un énorme ventilateur au-dessus de l’escalier. Rotor abstrait en perspective et rotation proposés pour le versus ; orientation, nombre de pales et vitesse non confirmés par une vue originale. Aucune enseigne, corde, toit à Gum Heads, boutique ou chute d’ascenseur.'},
  artaudSpotlightGlide:{name:'Lueur des projecteurs sur le fond de scène normal',layer:'background',replaces:['spotlightSweep'],stageId:'artaud_theater',source:'origins',locationScope:'Scène normale Artaud après les quatre ampoules, le panneau d’éclairage et le levier du rideau',limits:'Deux sources fixes et une variation douce de lueur proposées pour le versus ; aucun spot mobile source revendiqué, texte peint, décor d’arbre ou océan sélectionné sans preuve, marionnette, miroir, Ariel ou Caliban. Géométrie et cadence non mesurées.'},
  pursuitElevatorGap:{name:'Panneaux de l’ascenseur au bout du couloir B1',layer:'background',replaces:[],stageId:'brookhaven_sh2',source:'sh2',locationScope:'Couloir Otherworld B1 de la poursuite à la lance, devant l’ascenseur de Brookhaven SH2 original',limits:'Cadre fixe et battants maintenus entrouverts dans une suspension versus avant fermeture scénique ; faible variation d’écart proposée, aucun cycle canonique revendiqué. Sans Maria, Pyramid Head, ombre, chute d’ascenseur, sirène répétée ou reprise de la mort narrative.'},
});

// [render key, zero-based research proposal, exact rear anchor, optional event].
// No body, cameo, camera displacement, sound recording or new topology is claimed.
const BINDINGS = Object.freeze({
  midwich:[['doorReply',1,[.5,.57]]],
  alchemilla:[['fanEccentric',1,[.78,.27]],['lampReply',2,[.52,.3],'referenceLightReply']],
  old_silent_hill:[['fogLayers',1,[.5,.54]],['snowDepth',0,[.5,.45]]],
  nowhere:[['lightSequence',1,[.5,.28]]],
  central_nightmare:[['dustDrift',1,[.67,.61]]],
  sewer_resort:[['waterRings',1,[.58,.72]]],
  blue_creek:[['waterRings',1,[.5,.72]]],
  toluca_prison:[['cellDoorReply',2,[.28,.61],'referenceCellReply']],
  labyrinth:[['cubeTurn',1,[.69,.49]]],
  historical_society:[['paintingGlint',1,[.29,.38]]],
  baldwin_mansion:[['closedDoorReply',2,[.5,.57],'referenceClosedDoorReply']],
  hotel_otherworld:[['waterRings',1,[.51,.72]],['dustDrift',2,[.73,.39],'referenceDustRelease']],
  south_vale:[['fogLayers',1,[.5,.55]]],
  brookhaven_roof:[['paperFlutter',1,[.73,.65]],['rooftopFenceFlex',2,[.5,.57]]],
  prison_meat_locker:[['freezerCarcassSway',1,[.5,.21]]],
  brookhaven_sh2:[['pursuitElevatorGap',1,[.5,.57]]],
  brookhaven_sh3:[['waterRings',1,[.51,.72]]],
  shopping_mall:[['shutterLift',1,[.26,.53]]],
  nightmare_mall:[['dustDrift',1,[.24,.53]]],
  underpass_sh3:[['fanEccentric',1,[.79,.27]],['pipePurge',2,[.2,.58],'referenceSteamPurge']],
  nightmare_hospital_sh3:[['mirrorContamination',1,[.73,.39]]],
  church:[['chapelCandleLean',1,[.71,.49]]],
  hilltop_center:[['officeBlindSway',1,[.72,.32]]],
  room_302:[['chainPendulum',1,[.52,.34]],['washroomHoleReply',2,[.78,.49],'referenceWashroomReply']],
  subway_world:[['subwayDoorCycle',1,[.5,.57]]],
  forest_world:[['forestWindLayers',1,[.5,.57]]],
  water_prison:[['waterwheelTurn',1,[.71,.49]]],
  hospital_world:[['wheelchairDrift',1,[.72,.57]]],
  building_world:[['stairwellFanTurn',1,[.5,.23]]],
  town_hall_hc:[['lecternGlint',1,[.5,.57]]],
  shepherd_house_hc:[['atticDustFall',1,[.5,.17]]],
  devils_pit:[['mineBeamDrips',0,[.28,.24]]],
  overlook:[['cellBarShadows',0,[.72,.57]]],
  midwich_nightmare:[['boilerHearthGlow',1,[.5,.61]]],
  sewers:[['canalCableSway',1,[.62,.55]]],
  lakeside_amusement:[['sh1CarouselOrbit',1,[.5,.54]]],
  lakeside_sh3:[['sh3HorseBob',1,[.5,.54]]],
  apartment_world:[['doorReply',1,[.5,.57]]],
  riverside_motel:[['signFlicker',0,[.72,.31]],['curtainBreathe',1,[.29,.38]]],
  shepherds_glen:[['fogLayers',0,[.5,.55]]],
  grand_hotel:[['dustDrift',1,[.69,.45]]],
  alchemilla_origins:[['curtainBreathe',2,[.3,.39]]],
  artaud_theater:[['curtainBreathe',1,[.21,.3]],['artaudSpotlightGlide',2,[.5,.43]]],
  police_station_hc:[['lampReply',0,[.53,.3]]],
  frozen_streets:[['snowDepth',0,[.5,.45]]],
  centennial_building:[['dustDrift',1,[.52,.39]],['paperFlutter',0,[.3,.6]]],
  st_marias:[['curtainBreathe',0,[.28,.36]]],
  arcade_city:[['fogLayers',0,[.5,.55]],['signFlicker',1,[.7,.32]]],
  arcade_hospital:[['curtainBreathe',0,[.28,.37]]],
  arcade_toluca_lake:[['waterSwell',0,[.56,.7]],['fogLayers',1,[.5,.49]]],
  villa:[['paperFlutter',0,[.3,.49]]],
  ebisugaoka:[['fogLayers',0,[.5,.52]],['flowerBorder',1,[.84,.69]],['paperFlutter',2,[.31,.39]]],
  dark_shrine:[['lanternGlow',0,[.29,.36]]],
  corrupted_ebisugaoka:[['rootBorder',0,[.84,.69]]],
  film_midwich:[['ashDepth',1,[.5,.44]]],
  return_streets:[['ashDepth',0,[.5,.44]]],
  hope_junction:[['fogLayers',0,[.5,.54]]],
  book_water:[['waterRings',0,[.53,.7]]],
  book_earth:[['dustDrift',1,[.72,.56]]],
  book_wood:[['rootBorder',1,[.83,.69]]],
});

// Material matches only. The actual versus attacks/timings remain adaptations.
const HAZARDS = Object.freeze({
  hazel_subway:['trainRush'], otherworld_void:['voidPull'],
  book_fire:['emberFall'], book_water:['waterSurge'], book_wood:['rootSnare'],
  book_earth:['fallingDebris'], book_steel:['chainSweep'], book_blood:['bloodTide'],
});
const EVENT_HAZARDS = Object.freeze({lockerSlam:'lockerSlam',gurneyRush:'gurneyRush',corridorCollapse:'roadCollapse',carouselStart:'carouselSweep',trainRumble:'trainRush',steamRelease:'steamVent',waterRise:'waterSurge',mirrorTurn:'mirrorFracture',rootWake:'rootSnare',voidPull:'voidPull',ashFall:'emberFall',elevatorCall:'elevatorDrop',roomBreath:'roomPulse',stormSurge:'lightningStrike',iceLock:'iceFracture',ritualWake:'ritualSeal'});
const AMBIENT_EVENTS = Object.freeze({
  nowhere:['powerFailure','sirenCall'], hospital_nightmare:['sirenCall'],
  nightmare_mall:['powerFailure'], hazel_subway:['powerFailure'],
  building_world:['powerFailure'], outside_room_302:['powerFailure'],
  looping_hall:['powerFailure'], villa_stairwell:['powerFailure'],
  nightmare_hospital_hc:['powerFailure'], police_station_hc:['powerFailure'], prison_hc:['powerFailure'],
  film_midwich:['sirenCall'], film_church:['sirenCall'],
  alternate_facility:['powerFailure'],
});

const PHYSICAL_ANIMATIONS = Object.freeze({trainPass:'trainRush',mineCart:'trainRush',carouselTurn:'carouselSweep',rootsCreep:'rootSnare',voidSurge:'voidPull',chasmPulse:'roadCollapse',iceCrack:'iceFracture'});
const FORBIDDEN_CAMEOS = new Set(['shadowPass','windowShadow','cellShadow','portraitBlink','dollTurn']);

/** Public predicates also protect rendering against an old or injected cue. */
export function stageReferenceEventAllowed(stage, id) {
  return !stage?.reference?.blocked && (!stage?.referencePolicy || stage.referencePolicy.allowedEvents.includes(id));
}
export function stageReferenceHazardAllowed(stage, id) {
  return !stage?.reference?.blocked && (!stage?.referencePolicy || stage.referencePolicy.allowedHazards.includes(id));
}
/** A new exact-location prop cannot be borrowed by a similarly named work. */
export function stageReferenceTrackAllowed(stage, track) {
  const definition=STAGE_REFERENCE_TRACKS[track?.key];
  if(!definition||definition.pendingLocation||stage?.reference?.blocked)return false;
  const selectedScene=LOT11_SCENE_PRESENTATION[stage?.id];
  if(selectedScene?.source===stage?.source&&stage.referencePolicy?.sceneId===selectedScene.policy.sceneId&&
    !(LOT11_BINDINGS[stage.id]||[]).some(([key,index])=>key===track.key&&index===track.proposalIndex))return false;
  if(!definition.stageId)return true;
  return stage?.id===definition.stageId&&stage?.source===definition.source&&track.source===definition.source&&
    (!definition.trigger||track.trigger===definition.trigger)&&
    (!definition.sceneId||stage.referencePolicy?.sceneId===definition.sceneId)&&
    track.id===`${definition.stageId}:reference:${track.proposalIndex+1}`&&
    [...(BINDINGS[stage.id]||[]),...(LOT9_BINDINGS[stage.id]||[]),...(LOT10_BINDINGS[stage.id]||[]),...(LOT11_BINDINGS[stage.id]||[])].some(([key,index,,event])=>key===track.key&&index===track.proposalIndex&&(event||null)===(track.event||null));
}
export function stageAnimationConflictsWithHazard(id, hazardId) {
  return PHYSICAL_ANIMATIONS[id] === hazardId || ({hospitalMonitor:'gurneyRush',pipeSteam:'steamVent',waterRipple:'waterSurge',mirrorGlitch:'mirrorFracture',elevatorBlink:'elevatorDrop',ashFall:'emberFall'})[id] === hazardId;
}

function animationAllowed(stage, id, worldState) {
  if (FORBIDDEN_CAMEOS.has(id)) return false;
  if (PHYSICAL_ANIMATIONS[id]) return false; // Physical objects belong to announced events/hazards.
  if (id === 'ashFall') return stage.source === 'film' && stage.weather === 'ash';
  if (id === 'snowGust') return stage.weather === 'snow';
  if (id === 'rainSheets' || id === 'lightning') return stage.weather === 'rain';
  if (id === 'fogDrift') return !INTERIOR.has(stage.family) && ['fog','snow','water','rain'].includes(stage.weather);
  if (['bloodPulse','metalPulse','sirenPulse','ritualGlyph'].includes(id) && worldState === 'fixed-normal') return false;
  if (id === 'firePulse') return stage.weather === 'embers' || has(stage,'fireplace','lava');
  if (id === 'petalSpiral') return ['shf','shortmessage'].includes(stage.source) && stage.weather === 'petals';
  if (id === 'hospitalMonitor') return has(stage,'monitors');
  if (id === 'radioPulse') return has(stage,'radio');
  if (id === 'tvStatic') return has(stage,'monitors','screens') && stage.source !== 'shf';
  if (id === 'fanSpin') return has(stage,'fans','vents');
  if (id === 'chainSway') return has(stage,'chains');
  if (id === 'pipeSteam' || id === 'ventSteam') return has(stage,'pipes','boiler','vents');
  if (id === 'mirrorGlitch') return has(stage,'mirrors') && ['origins','sh3'].includes(stage.source);
  if (id === 'waterRipple' || id === 'waves') return has(stage,'water','pool','pools','canal') || stage.weather === 'water';
  if (id === 'boatRock') return has(stage,'boat','boats');
  if (id === 'ferrisWheel') return has(stage,'wheel');
  if (id === 'bellSwing') return has(stage,'bells');
  if (id === 'spotlightSweep' || id === 'lighthouseBeam') return has(stage,'beam','spotlight','spotlights');
  if (id === 'curtainSway') return has(stage,'curtains');
  if (id === 'elevatorBlink') return has(stage,'elevator');
  if (id === 'lockerRattle') return has(stage,'lockers') && worldState !== 'fixed-normal';
  if (id === 'doorPulse') return false; // A breathing/hostile room is not implied by a door.
  if (id === 'screenSlide') return has(stage,'screens');
  if (id === 'sawSpin') return has(stage,'saws');
  if (id === 'sparks') return stage.weather === 'sparks' || has(stage,'machines');
  if (id === 'forestWind' || id === 'windGust') return !INTERIOR.has(stage.family) && has(stage,'trees','roots','fence','antenna');
  if (id === 'storeShutters') return has(stage,'shutters');
  if (id === 'flagSway') return has(stage,'flags');
  if (id === 'lanternSway') return has(stage,'lanterns');
  if (id === 'gravityTilt' || id === 'headlightSweep' || id === 'tunnelWind') return false;
  return ['lightFlicker','lampFlicker','neonFlicker','streetLightFlicker','coldBreath','floorCreak'].includes(id);
}

export function applyStageReferencePolicy(stage, reference) {
  const result = {...stage,props:[...(stage.props || [])],layers:[...(stage.layers || [])],animations:[...(stage.animations || [])]};
  const identityMatched = Boolean(reference && reference.id === stage.id && reference.source === stage.source);
  const status = identityMatched ? reference.locationStatus : 'reference-identite-absente-ou-incompatible';
  const blocked = !identityMatched || typeof status!=='string' || !status.trim() || unresolved.test(status);
  const selectedCorrections = ENVIRONMENT[stage.id] || {};
  const corrections = !selectedCorrections.source || selectedCorrections.source === stage.source ? selectedCorrections : {};
  if(!blocked&&corrections.name)result.name=corrections.name;
  let worldState = blocked ? 'unresolved' : corrections.worldState || (ALTERED.has(stage.id) || stage.source === 'bom' ? 'fixed-altered' : TRANSITIONS.has(stage.id) ? 'versus-transition' : 'fixed-normal');
  const interior = corrections.interior ?? (INTERIOR.has(stage.family) || (stage.id==='devils_pit'&&stage.source==='downpour') || (stage.id==='sewers'&&stage.source==='sh3') || ['nightmare_school','nightmare_hospital_sm','nightmare_mall_sm'].includes(stage.id));
  result.weather = blocked ? 'none' : corrections.weather || (interior && ['rain','snow','ash'].includes(stage.weather) ? 'dust' : stage.weather);
  // Do not perpetuate the movie's cinder language in unrelated game interiors.
  if (!blocked && result.weather === 'ash' && stage.source !== 'film') result.weather = 'dust';
  result.props = result.props.filter(prop => !(corrections.removeProps || []).includes(prop));
  result.layers = result.layers.filter(prop => !(corrections.removeProps || []).includes(prop));
  const style = corrections.style || STYLE[stage.source] || stage.shift?.style || 'rust';
  result.shift = {...stage.shift,style,enabled:worldState === 'versus-transition',startOtherworld:worldState === 'fixed-altered',referenceState:worldState};
  result.visibility = {...stage.visibility,fog:blocked ? 0 : corrections.fog ?? (interior ? Math.min(stage.visibility?.fog || .15,.2) : stage.visibility?.fog || .4)};
  if (corrections.terrain) result.terrain = {...stage.terrain,id:corrections.terrain};
  if (blocked) result.terrain = {...stage.terrain,id:'concrete'};
  result.reference = {
    id:stage.id,source:stage.source,identityMatched,blocked,locationStatus:status,
    catalogueName:stage.name,correctedName:result.name!==stage.name?result.name:null,
    locationNote:identityMatched ? reference.locationNote || '' : 'Fiche de lieu exacte requise avant activation des effets.',
    referenceIds:identityMatched ? [...(reference.referenceIds || [])] : [],
    constraints:identityMatched ? [...(reference.constraints || [])] : [],
    proposals:identityMatched ? copy(reference.animations || []) : [],
  };
  const referenceTracks = blocked ? [] : [...(BINDINGS[stage.id] || []),...(LOT9_BINDINGS[stage.id] || []),...(LOT10_BINDINGS[stage.id] || []),...(LOT11_BINDINGS[stage.id] || [])].flatMap(([key,index,anchor,event]) => {
    const proposal = reference.animations?.[index],definition = STAGE_REFERENCE_TRACKS[key];
    if (!proposal || !definition || definition.pendingLocation || (definition.stageId&&(stage.id!==definition.stageId||stage.source!==definition.source)) || /bloque|non.confirme|a.verifier/.test(proposal.status || '')) return [];
    return [{id:`${stage.id}:reference:${index+1}`,key,name:definition.name,description:proposal.description,proposalIndex:index,source:stage.source,
      evidence:[...(proposal.evidence || reference.referenceIds || [])],layer:definition.layer,anchor:{x:anchor[0],y:anchor[1]},
      trigger:definition.trigger || (event ? 'local-heavy-impact' : 'ambient'),event:event || null,
      ...(definition.matchRecipe?{matchRecipe:copy(definition.matchRecipe),requiresExplicitMatchPhase:true}:{}),
      eventEnabled:event ? !corrections.disabledEvents?.[event] : null,
      implementation:'canvas-prototype',coverage:'partial-visual-prototype',implementedElement:definition.name,
      fidelity:'adaptation-versus-proposee',captureStatus:proposal.captureStatus || 'capture-a-relever',
      locationScope:definition.locationScope || null,
      limits:unique(['Mouvement original de décor uniquement ; pas de collision, de son capturé, de personnage ou de certification 1:1.',definition.limits,corrections.disabledEvents?.[event]]).join(' ')}];
  });
  const allowedHazards = blocked ? [] : [...(HAZARDS[stage.id] || [])];
  const candidateEvents = unique([...(stage.director?.events || []),...referenceTracks.map(track=>track.event)]);
  const allowedEvents = blocked ? [] : candidateEvents.filter(id => !corrections.disabledEvents?.[id] && (referenceTracks.some(track=>track.event===id) ||
    (EVENT_HAZARDS[id] ? allowedHazards.includes(EVENT_HAZARDS[id]) && id !== 'ashFall' : (AMBIENT_EVENTS[stage.id] || []).includes(id))));
  const replaced = new Set(referenceTracks.flatMap(track=>STAGE_REFERENCE_TRACKS[track.key].replaces));
  const animations = blocked || corrections.disableAnimations ? [] : result.animations.filter(id=>!replaced.has(id) && animationAllowed(result,id,worldState));
  const suppression = [
    ...referenceTracks.filter(track=>track.eventEnabled===false).map(track=>({kind:'event',id:track.event,reason:corrections.disabledEvents[track.event]})),
    ...(stage.director?.events || []).filter(id=>!allowedEvents.includes(id)).map(id=>({kind:'event',id,reason:'Occurrence locale ou danger non retenu par la fiche exacte.'})),
    ...(stage.director?.hazardDeck || []).filter(id=>!allowedHazards.includes(id)).map(id=>({kind:'hazard',id,reason:'Un motif ou une boucle décorative ne suffit pas à autoriser des dégâts.'})),
    ...(stage.animations || []).filter(id=>!animations.includes(id)).map(id=>({kind:'animation',id,reason:replaced.has(id)?'Remplacé par une piste précise du classeur.':'Motif/phase/accessoire incompatible, non confirmé ou silhouette à produire.'})),
  ];
  if (result.weather !== stage.weather) suppression.push({kind:'weather',id:stage.weather,reason:`Ambiance remplacée par ${result.weather} pour conserver le lieu et l’œuvre.`});
  result.referenceTracks = referenceTracks;
  result.referencePolicy = {worldState,allowedEvents,allowedHazards,automaticFinishers:!blocked&&corrections.automaticFinishers!==false&&!NARRATIVE_ONLY.has(stage.id)&&stage.source!=='shattered',
    ...(!blocked&&SCENE_PRESENTATION[stage.id]?.source===stage.source?copy(SCENE_PRESENTATION[stage.id].policy):{}),
    weather:result.weather,interior,baselineMotion:!blocked,suppression,
    hazardFidelity:'Associations matérielles de versus ; dégâts, trajectoires et timings non attestés 1:1.',
    renderedProposalIds:referenceTracks.filter(track=>track.eventEnabled!==false).map(track=>track.id),pendingProposalIds:(identityMatched?reference.animations || []:[]).map((_,index)=>`${stage.id}:reference:${index+1}`).filter(id=>!referenceTracks.some(track=>track.id===id&&track.eventEnabled!==false)),
  };
  result.animations = animations;
  result.animationTracks = (stage.animationTracks || []).filter(track=>animations.includes(track.id));
  result.director = {...stage.director,events:allowedEvents,hazardDeck:allowedHazards,motifPolicy:{...stage.director?.motifPolicy,
    events:allowedEvents,hazards:allowedHazards,ambienceOnly:allowedHazards.length===0,evidenceScope:'exact-production-reference / original-versus-prototypes',suppression}};
  result.interactions = allowedEvents.slice(0,3).map((event,index) => {
    const previous = (stage.interactions || []).find(interaction=>interaction.event===event),track=referenceTracks.find(track=>track.event===event);
    return {...previous,id:previous?.id || `${stage.id}_${event}_${index+1}`,event,name:previous?.name || track?.name || event,
      trigger:track?.trigger || previous?.trigger || 'time-or-first-heavy-impact',fidelity:'adaptation-versus-proposee',
      fidelityLabel:track?'PROPOSITION LORE · PROTOTYPE VERSUS':'MOTIF LORE · RÈGLE VERSUS',
      canonicalBasis:track?.description || result.reference.locationNote,referenceIds:track?.evidence || result.reference.referenceIds,
      proposalId:track?.id || null,zone:track?.event?{x:track.anchor.x,radius:.15}:previous?.zone};
  });
  result.lore = {...stage.lore,premise:result.reference.locationNote,canonicalBasis:result.reference.referenceIds.join(' ; '),
    fidelity:blocked?'reference-bloquee':'lieu-reference / mise-en-scene-versus',
    adaptationNotice:'Les mouvements joués sont des prototypes originaux de propositions. Aucune nouvelle capture ni fidélité 1:1 validée ; collisions et sons ne sont pas déduits de ces boucles.'};
  result.catalogueStatus = blocked ? 'reference-blocked' : stage.catalogueStatus;
  return result;
}
