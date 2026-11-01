/** Lot12: source-visible room objects. Authored Canvas presentation, no captured source animation. */
export const LOT12_ENVIRONMENT = Object.freeze({
  "woodside": {
    "source": "sh2",
    "name": "WOOD SIDE — APPARTEMENT 208",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "stairs",
      "trash",
      "hallway"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "blue_creek": {
    "source": "sh2",
    "name": "BLUE CREEK — PALIER DE L’ESCALIER",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "stairs",
      "bars",
      "water",
      "hallway"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "toluca_prison": {
    "source": "sh2",
    "name": "TOLUCA — COUR DU GIBET",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "gallows",
      "meat"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "labyrinth": {
    "source": "sh2",
    "name": "LABYRINTHE — COMMANDE BOX OF FACES",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "walls",
      "door",
      "pit",
      "water"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "shopping_mall": {
    "source": "sh3",
    "name": "CENTRAL SQUARE — HAPPY BURGER",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "shops",
      "shutters",
      "signs",
      "signage"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "church": {
    "source": "sh3",
    "name": "CHURCH — CHAPELLE INITIALE",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "altar",
      "nave"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "room_302": {
    "source": "sh4",
    "name": "ROOM302 — ENTRÉE ENCHAÎNÉE",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "window",
      "door",
      "interior",
      "haunting"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "water_prison": {
    "source": "sh4",
    "name": "WATER PRISON — SURVEILLANCE2F",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      ""
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  },
  "apartment_world": {
    "source": "sh4",
    "name": "APARTMENT WORLD — BUREAU105",
    "weather": "none",
    "fog": 0,
    "terrain": "concrete",
    "interior": true,
    "worldState": "fixed-normal",
    "removeProps": [
      "doors",
      "windows",
      "fans",
      "flesh",
      "symbols",
      "tower",
      "cells",
      "chains",
      "watchtower",
      "spotlight",
      "hall",
      "umbilical",
      "hallway"
    ],
    "automaticFinishers": false,
    "disableAnimations": true
  }
});
export const LOT12_SCENE_PRESENTATION = Object.freeze({
  "woodside": {
    "source": "sh2",
    "policy": {
      "sceneId": "woodside-208-clock-room",
      "terrainRules": false,
      "normalPhaseLabel": "APPARTEMENT 208",
      "terrainPresentation": {
        "name": "PLATEAU SEC · APPARTEMENT 208",
        "description": "Appartement208 de Wood Side, état initial, avant déplacement de l’horloge ; hors307, piscine et lampe du mannequin. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "blue_creek": {
    "source": "sh2",
    "policy": {
      "sceneId": "blue-creek-stairwell-before-drainage",
      "terrainRules": false,
      "normalPhaseLabel": "AVANT LE DRAINAGE",
      "terrainPresentation": {
        "name": "PALIER DE L’ESCALIER",
        "description": "Palier de la rencontre Pyramid Head avant drainage ; marches vers l’eau au fond, duel sur un plateau sec adapté. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "toluca_prison": {
    "source": "sh2",
    "policy": {
      "sceneId": "toluca-courtyard-scaffold",
      "terrainRules": false,
      "normalPhaseLabel": "COUR DU GIBET",
      "terrainPresentation": {
        "name": "PLATEAU SEC · COUR DU GIBET",
        "description": "Cour de TolucaPrison devant le panneau du gibet, avant placement des trois plaques ; hors blocs de cellules. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "labyrinth": {
    "source": "sh2",
    "policy": {
      "sceneId": "labyrinth-box-of-faces-control",
      "terrainRules": false,
      "normalPhaseLabel": "COMMANDE BOX OF FACES",
      "terrainPresentation": {
        "name": "PLATEAU SEC · COMMANDE BOX OF FACES",
        "description": "Pièce de commande BoxofFaces de SH2original, cube immobile avant manipulation ; hors salleAbstractDaddy et couloir des cordes. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "shopping_mall": {
    "source": "sh3",
    "policy": {
      "sceneId": "central-square-happy-burger",
      "terrainRules": false,
      "normalPhaseLabel": "HAPPY BURGER",
      "terrainPresentation": {
        "name": "PLATEAU SEC · HAPPY BURGER",
        "description": "Happy Burger normal de CentralSquare, table et stores de la rencontre Douglas ; aucun client ni personnage rejoué. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "church": {
    "source": "sh3",
    "policy": {
      "sceneId": "sh3-chapel-before-altar-departure",
      "terrainRules": false,
      "normalPhaseLabel": "CHAPELLE INITIALE",
      "terrainPresentation": {
        "name": "PLATEAU SEC · CHAPELLE INITIALE",
        "description": "Chapelle initiale avec autel, cierges et vitraux ; hors bibliothèque, couloirs mémoire et fosse du dieu. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "room_302": {
    "source": "sh4",
    "policy": {
      "sceneId": "room302-first-entry-door",
      "terrainRules": false,
      "normalPhaseLabel": "ENTRÉE ENCHAÎNÉE",
      "terrainPresentation": {
        "name": "PLATEAU SEC · ENTRÉE ENCHAÎNÉE",
        "description": "Entrée de Room302 au premier passage, porte enchaînée fermée et kitchenette adjacente ; hors salle de bain et hantises ultérieures. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "water_prison": {
    "source": "sh4",
    "policy": {
      "sceneId": "water-prison-2f-surveillance",
      "terrainRules": false,
      "normalPhaseLabel": "SURVEILLANCE2F",
      "terrainPresentation": {
        "name": "PLATEAU SEC · SURVEILLANCE2F",
        "description": "Salle centrale de surveillance2F au premier passage, avant rotation de la vanne ; hors roue hydrauliqueB2 et vanne de toit. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  },
  "apartment_world": {
    "source": "sh4",
    "policy": {
      "sceneId": "south-ashfield-room105-desk",
      "terrainRules": false,
      "normalPhaseLabel": "BUREAU105",
      "terrainPresentation": {
        "name": "PLATEAU SEC · BUREAU105",
        "description": "Bureau du conciergeRoom105 au premier passage ApartmentWorld, près de la table aux clés ; hors couloir302 et appartementRichard. Physique neutre du versus ; géométrie et caméra non certifiées1:1."
      }
    }
  }
});
export const LOT12_REFERENCE_TRACKS = Object.freeze({
  "wood208Clock": {
    "name": "Horloge haute de l’appartement208",
    "stageId": "woodside",
    "source": "sh2",
    "sceneId": "woodside-208-clock-room",
    "layer": "background",
    "replaces": [],
    "locationScope": "Appartement208 de Wood Side, état initial, avant déplacement de l’horloge ; hors307, piscine et lampe du mannequin.",
    "limits": "Horloge haute fermée, volets à lattes et téléviseur documentés. CadreTV sans corps, sang, texte ou image copié ; aiguilles fixes et aucun puzzle résolu. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "wood208TV": {
    "name": "Téléviseur de l’appartement208",
    "stageId": "woodside",
    "source": "sh2",
    "sceneId": "woodside-208-clock-room",
    "layer": "background",
    "replaces": [],
    "locationScope": "Appartement208 de Wood Side, état initial, avant déplacement de l’horloge ; hors307, piscine et lampe du mannequin.",
    "limits": "Horloge haute fermée, volets à lattes et téléviseur documentés. CadreTV sans corps, sang, texte ou image copié ; aiguilles fixes et aucun puzzle résolu. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "wood208Shutters": {
    "name": "Volets à lattes de l’appartement208",
    "stageId": "woodside",
    "source": "sh2",
    "sceneId": "woodside-208-clock-room",
    "layer": "background",
    "replaces": [],
    "locationScope": "Appartement208 de Wood Side, état initial, avant déplacement de l’horloge ; hors307, piscine et lampe du mannequin.",
    "limits": "Horloge haute fermée, volets à lattes et téléviseur documentés. CadreTV sans corps, sang, texte ou image copié ; aiguilles fixes et aucun puzzle résolu. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "blueStairDoor": {
    "name": "Porte fermée du palier",
    "stageId": "blue_creek",
    "source": "sh2",
    "sceneId": "blue-creek-stairwell-before-drainage",
    "layer": "background",
    "replaces": [],
    "locationScope": "Palier de la rencontre Pyramid Head avant drainage ; marches vers l’eau au fond, duel sur un plateau sec adapté.",
    "limits": "Les vues montrent garde-corps, porte fermée et parois dégradées. Le guide confirme eau puis drainage, sans hauteur native mesurée. Le boss et sa sirène ne sont pas rejoués. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "blueStairWater": {
    "name": "Eau au pied des marches",
    "stageId": "blue_creek",
    "source": "sh2",
    "sceneId": "blue-creek-stairwell-before-drainage",
    "layer": "background",
    "replaces": [],
    "locationScope": "Palier de la rencontre Pyramid Head avant drainage ; marches vers l’eau au fond, duel sur un plateau sec adapté.",
    "limits": "Les vues montrent garde-corps, porte fermée et parois dégradées. Le guide confirme eau puis drainage, sans hauteur native mesurée. Le boss et sa sirène ne sont pas rejoués. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "blueStairPlaster": {
    "name": "Enduit dégradé de l’escalier",
    "stageId": "blue_creek",
    "source": "sh2",
    "sceneId": "blue-creek-stairwell-before-drainage",
    "layer": "background",
    "replaces": [],
    "locationScope": "Palier de la rencontre Pyramid Head avant drainage ; marches vers l’eau au fond, duel sur un plateau sec adapté.",
    "limits": "Les vues montrent garde-corps, porte fermée et parois dégradées. Le guide confirme eau puis drainage, sans hauteur native mesurée. Le boss et sa sirène ne sont pas rejoués. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "tolucaScaffoldPanel": {
    "name": "Panneau du gibet de la cour",
    "stageId": "toluca_prison",
    "source": "sh2",
    "sceneId": "toluca-courtyard-scaffold",
    "layer": "background",
    "replaces": [],
    "locationScope": "Cour de TolucaPrison devant le panneau du gibet, avant placement des trois plaques ; hors blocs de cellules.",
    "limits": "Vue sombre montrant façade de bois et panneau : motifs illisibles abstraits. Haut du gibet et corde hors lumière non reconstruits ; aucune exécution, cellule ou victime ajoutée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "boxFacesPedestal": {
    "name": "Pied et table de BoxofFaces",
    "stageId": "labyrinth",
    "source": "sh2",
    "sceneId": "labyrinth-box-of-faces-control",
    "layer": "background",
    "replaces": [],
    "locationScope": "Pièce de commande BoxofFaces de SH2original, cube immobile avant manipulation ; hors salleAbstractDaddy et couloir des cordes.",
    "limits": "Cube à visage, pied circulaire sur table et panneaux perforés documentés. Le visage reste abstrait sans portrait copié ; aucune rotation automatique, crâne complet ou reconfiguration des collisions. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "boxFacesCube": {
    "name": "Cube de BoxofFaces, orientation fixe",
    "stageId": "labyrinth",
    "source": "sh2",
    "sceneId": "labyrinth-box-of-faces-control",
    "layer": "background",
    "replaces": [],
    "locationScope": "Pièce de commande BoxofFaces de SH2original, cube immobile avant manipulation ; hors salleAbstractDaddy et couloir des cordes.",
    "limits": "Cube à visage, pied circulaire sur table et panneaux perforés documentés. Le visage reste abstrait sans portrait copié ; aucune rotation automatique, crâne complet ou reconfiguration des collisions. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "boxFacesPanels": {
    "name": "Panneaux perforés de la commande",
    "stageId": "labyrinth",
    "source": "sh2",
    "sceneId": "labyrinth-box-of-faces-control",
    "layer": "background",
    "replaces": [],
    "locationScope": "Pièce de commande BoxofFaces de SH2original, cube immobile avant manipulation ; hors salleAbstractDaddy et couloir des cordes.",
    "limits": "Cube à visage, pied circulaire sur table et panneaux perforés documentés. Le visage reste abstrait sans portrait copié ; aucune rotation automatique, crâne complet ou reconfiguration des collisions. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "happyBurgerBlinds": {
    "name": "Stores de Happy Burger",
    "stageId": "shopping_mall",
    "source": "sh3",
    "sceneId": "central-square-happy-burger",
    "layer": "background",
    "replaces": [],
    "locationScope": "Happy Burger normal de CentralSquare, table et stores de la rencontre Douglas ; aucun client ni personnage rejoué.",
    "limits": "Table, condiments, deux chaises, stores et lambris visibles. Pas grille de boutique, vitrine cassée, présentoir animé ou façade d’une autre salle. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "happyBurgerTable": {
    "name": "Table et condiments de Happy Burger",
    "stageId": "shopping_mall",
    "source": "sh3",
    "sceneId": "central-square-happy-burger",
    "layer": "background",
    "replaces": [],
    "locationScope": "Happy Burger normal de CentralSquare, table et stores de la rencontre Douglas ; aucun client ni personnage rejoué.",
    "limits": "Table, condiments, deux chaises, stores et lambris visibles. Pas grille de boutique, vitrine cassée, présentoir animé ou façade d’une autre salle. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "happyBurgerChairs": {
    "name": "Chaises de Happy Burger",
    "stageId": "shopping_mall",
    "source": "sh3",
    "sceneId": "central-square-happy-burger",
    "layer": "background",
    "replaces": [],
    "locationScope": "Happy Burger normal de CentralSquare, table et stores de la rencontre Douglas ; aucun client ni personnage rejoué.",
    "limits": "Table, condiments, deux chaises, stores et lambris visibles. Pas grille de boutique, vitrine cassée, présentoir animé ou façade d’une autre salle. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "sh3ChapelAltar": {
    "name": "Autel de la chapelle initiale",
    "stageId": "church",
    "source": "sh3",
    "sceneId": "sh3-chapel-before-altar-departure",
    "layer": "background",
    "replaces": [],
    "locationScope": "Chapelle initiale avec autel, cierges et vitraux ; hors bibliothèque, couloirs mémoire et fosse du dieu.",
    "limits": "Autel en bois, cierges et triple vitrage documentés. Verres colorés abstraits sans figures ou texte religieux copié. Pas page tournée d’un livre non identifié, orgue ou invocation. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "chapelCandleLean": {
    "name": "Cierges de la chapelle initiale",
    "stageId": "church",
    "source": "sh3",
    "sceneId": "sh3-chapel-before-altar-departure",
    "layer": "background",
    "replaces": [],
    "locationScope": "Chapelle initiale avec autel, cierges et vitraux ; hors bibliothèque, couloirs mémoire et fosse du dieu.",
    "limits": "Autel en bois, cierges et triple vitrage documentés. Verres colorés abstraits sans figures ou texte religieux copié. Pas page tournée d’un livre non identifié, orgue ou invocation. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "sh3ChapelGlass": {
    "name": "Triple vitrage de la chapelle",
    "stageId": "church",
    "source": "sh3",
    "sceneId": "sh3-chapel-before-altar-departure",
    "layer": "background",
    "replaces": [],
    "locationScope": "Chapelle initiale avec autel, cierges et vitraux ; hors bibliothèque, couloirs mémoire et fosse du dieu.",
    "limits": "Autel en bois, cierges et triple vitrage documentés. Verres colorés abstraits sans figures ou texte religieux copié. Pas page tournée d’un livre non identifié, orgue ou invocation. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room302ChainedDoor": {
    "name": "Porte enchaînée de l’entrée",
    "stageId": "room_302",
    "source": "sh4",
    "sceneId": "room302-first-entry-door",
    "layer": "background",
    "replaces": [],
    "locationScope": "Entrée de Room302 au premier passage, porte enchaînée fermée et kitchenette adjacente ; hors salle de bain et hantises ultérieures.",
    "limits": "Porte et chaînes, plafonnier rond, réfrigérateur et placards visibles. Pas inscription copiée, voix, apparition ou trou de salle de bain déplacé dans l’entrée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room302CeilingLight": {
    "name": "Plafonnier rond de l’entrée",
    "stageId": "room_302",
    "source": "sh4",
    "sceneId": "room302-first-entry-door",
    "layer": "background",
    "replaces": [],
    "locationScope": "Entrée de Room302 au premier passage, porte enchaînée fermée et kitchenette adjacente ; hors salle de bain et hantises ultérieures.",
    "limits": "Porte et chaînes, plafonnier rond, réfrigérateur et placards visibles. Pas inscription copiée, voix, apparition ou trou de salle de bain déplacé dans l’entrée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room302Kitchenette": {
    "name": "Kitchenette adjacente à l’entrée",
    "stageId": "room_302",
    "source": "sh4",
    "sceneId": "room302-first-entry-door",
    "layer": "background",
    "replaces": [],
    "locationScope": "Entrée de Room302 au premier passage, porte enchaînée fermée et kitchenette adjacente ; hors salle de bain et hantises ultérieures.",
    "limits": "Porte et chaînes, plafonnier rond, réfrigérateur et placards visibles. Pas inscription copiée, voix, apparition ou trou de salle de bain déplacé dans l’entrée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "waterPrisonValve": {
    "name": "Volant de la surveillance2F",
    "stageId": "water_prison",
    "source": "sh4",
    "sceneId": "water-prison-2f-surveillance",
    "layer": "background",
    "replaces": [],
    "locationScope": "Salle centrale de surveillance2F au premier passage, avant rotation de la vanne ; hors roue hydrauliqueB2 et vanne de toit.",
    "limits": "Volant sur piédestal, œilletons circulaires et puits à échelle de la salle photographiée. Aucun gardien, cellule/étage tournant ou roue B2 ; accès en profondeur hors sol de duel. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "waterPrisonPeepholes": {
    "name": "Œilletons de la surveillance2F",
    "stageId": "water_prison",
    "source": "sh4",
    "sceneId": "water-prison-2f-surveillance",
    "layer": "background",
    "replaces": [],
    "locationScope": "Salle centrale de surveillance2F au premier passage, avant rotation de la vanne ; hors roue hydrauliqueB2 et vanne de toit.",
    "limits": "Volant sur piédestal, œilletons circulaires et puits à échelle de la salle photographiée. Aucun gardien, cellule/étage tournant ou roue B2 ; accès en profondeur hors sol de duel. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "waterPrisonShaft": {
    "name": "Puits central de la surveillance2F",
    "stageId": "water_prison",
    "source": "sh4",
    "sceneId": "water-prison-2f-surveillance",
    "layer": "background",
    "replaces": [],
    "locationScope": "Salle centrale de surveillance2F au premier passage, avant rotation de la vanne ; hors roue hydrauliqueB2 et vanne de toit.",
    "limits": "Volant sur piédestal, œilletons circulaires et puits à échelle de la salle photographiée. Aucun gardien, cellule/étage tournant ou roue B2 ; accès en profondeur hors sol de duel. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room105Desk": {
    "name": "Bureau du concierge105",
    "stageId": "apartment_world",
    "source": "sh4",
    "sceneId": "south-ashfield-room105-desk",
    "layer": "background",
    "replaces": [],
    "locationScope": "Bureau du conciergeRoom105 au premier passage ApartmentWorld, près de la table aux clés ; hors couloir302 et appartementRichard.",
    "limits": "Bureau, chaise tubulaire et partition à barreaux visibles. Pas poupée, cordon, occupant, document lisible ou serrure du puzzle reproduite. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room105Chair": {
    "name": "Chaise tubulaire du bureau105",
    "stageId": "apartment_world",
    "source": "sh4",
    "sceneId": "south-ashfield-room105-desk",
    "layer": "background",
    "replaces": [],
    "locationScope": "Bureau du conciergeRoom105 au premier passage ApartmentWorld, près de la table aux clés ; hors couloir302 et appartementRichard.",
    "limits": "Bureau, chaise tubulaire et partition à barreaux visibles. Pas poupée, cordon, occupant, document lisible ou serrure du puzzle reproduite. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  },
  "room105Bars": {
    "name": "Partition à barreaux du bureau105",
    "stageId": "apartment_world",
    "source": "sh4",
    "sceneId": "south-ashfield-room105-desk",
    "layer": "background",
    "replaces": [],
    "locationScope": "Bureau du conciergeRoom105 au premier passage ApartmentWorld, près de la table aux clés ; hors couloir302 et appartementRichard.",
    "limits": "Bureau, chaise tubulaire et partition à barreaux visibles. Pas poupée, cordon, occupant, document lisible ou serrure du puzzle reproduite. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée."
  }
});
export const LOT12_BINDINGS = Object.freeze({
  "woodside": [
    [
      "wood208Clock",
      0,
      [
        0.31,
        0.57
      ]
    ],
    [
      "wood208TV",
      1,
      [
        0.71,
        0.53
      ]
    ],
    [
      "wood208Shutters",
      2,
      [
        0.14,
        0.29
      ]
    ]
  ],
  "blue_creek": [
    [
      "blueStairDoor",
      0,
      [
        0.75,
        0.57
      ]
    ],
    [
      "blueStairWater",
      1,
      [
        0.5,
        0.52
      ]
    ],
    [
      "blueStairPlaster",
      3,
      [
        0.22,
        0.3
      ]
    ]
  ],
  "toluca_prison": [
    [
      "tolucaScaffoldPanel",
      0,
      [
        0.5,
        0.57
      ]
    ]
  ],
  "labyrinth": [
    [
      "boxFacesPedestal",
      0,
      [
        0.43,
        0.57
      ]
    ],
    [
      "boxFacesCube",
      1,
      [
        0.43,
        0.35
      ]
    ],
    [
      "boxFacesPanels",
      2,
      [
        0.76,
        0.34
      ]
    ]
  ],
  "shopping_mall": [
    [
      "happyBurgerBlinds",
      0,
      [
        0.27,
        0.27
      ]
    ],
    [
      "happyBurgerTable",
      1,
      [
        0.52,
        0.57
      ]
    ],
    [
      "happyBurgerChairs",
      2,
      [
        0.52,
        0.57
      ]
    ]
  ],
  "church": [
    [
      "sh3ChapelAltar",
      0,
      [
        0.5,
        0.57
      ]
    ],
    [
      "chapelCandleLean",
      1,
      [
        0.5,
        0.57
      ]
    ],
    [
      "sh3ChapelGlass",
      2,
      [
        0.5,
        0.27
      ]
    ]
  ],
  "room_302": [
    [
      "room302ChainedDoor",
      0,
      [
        0.4,
        0.57
      ]
    ],
    [
      "room302CeilingLight",
      1,
      [
        0.4,
        0.16
      ]
    ],
    [
      "room302Kitchenette",
      2,
      [
        0.76,
        0.57
      ]
    ]
  ],
  "water_prison": [
    [
      "waterPrisonValve",
      0,
      [
        0.58,
        0.57
      ]
    ],
    [
      "waterPrisonPeepholes",
      1,
      [
        0.47,
        0.29
      ]
    ],
    [
      "waterPrisonShaft",
      2,
      [
        0.58,
        0.56
      ]
    ]
  ],
  "apartment_world": [
    [
      "room105Desk",
      0,
      [
        0.29,
        0.57
      ]
    ],
    [
      "room105Chair",
      1,
      [
        0.5,
        0.57
      ]
    ],
    [
      "room105Bars",
      2,
      [
        0.76,
        0.4
      ]
    ]
  ]
});
