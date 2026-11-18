const ARTWORK = {
  "heather_birth": {
    "intro": {
      "path": "assets/chronicles/heather_birth.intro.2ef91708c75e.webp",
      "alt": "Heather s’arrête entre les banquettes du diner et la galerie marchande déserte."
    },
    "ending": {
      "path": "assets/chronicles/heather_birth.ending.f3d3fe97049d.webp",
      "alt": "Heather, de dos dans la chapelle, regarde les vitraux éclairés au-dessus de l’autel."
    }
  },
  "room_21": {
    "intro": {
      "path": "assets/chronicles/room_21.intro.9edcdf651684.webp",
      "alt": "Dans l’appartement 302, Henry fait face à la porte enchaînée à côté de sa cuisine."
    },
    "ending": {
      "path": "assets/chronicles/room_21.ending.936178291280.webp",
      "alt": "Deux chaînes tendues se croisent sur les panneaux usés de la porte du 302."
    }
  },
  "travis_mirrors": {
    "intro": {
      "path": "assets/chronicles/travis_mirrors.intro.a8432e807635.webp",
      "alt": "Travis éclaire le miroir terni au-dessus des lavabos."
    },
    "ending": {
      "path": "assets/chronicles/travis_mirrors.ending.e9afa58dc5c1.webp",
      "alt": "Le Flauros assemblé et la clé du Riverside Motel reposent ensemble dans la pénombre."
    }
  },
  "harry_ice": {
    "intro": {
      "path": "assets/chronicles/harry_ice.intro.f5e2f6506b50.webp",
      "alt": "Un questionnaire attend près du fauteuil bleu du cabinet, face à une vitre aux reflets froids."
    },
    "ending": {
      "path": "assets/chronicles/harry_ice.ending.60e707ba2ec2.webp",
      "alt": "Une fissure traverse le reflet du manteau et du visage de Harry dans une paroi de glace bleue."
    }
  },
  "maya_villa": {
    "intro": {
      "path": "assets/chronicles/maya_villa.intro.2a8d87331e10.webp",
      "alt": "Dans un appartement de la Villa, une lampe éclaire un mur et une fenêtre couverts de papiers."
    },
    "ending": {
      "path": "assets/chronicles/maya_villa.ending.1703f9f04378.webp",
      "alt": "Dans l’atelier de Maya, quelques pétales s’éloignent de la fresque rose dans la lumière du jour."
    }
  },
  "static_beneath_st_amelia": {
    "intro": {
      "path": "assets/chronicles/static_beneath_st_amelia.intro.b2c5e2281739.webp",
      "alt": "Simon, reconnaissable à son gilet rouge, écoute dans une rue humide de St. Amelia noyée de brouillard."
    },
    "ending": {
      "path": "assets/chronicles/static_beneath_st_amelia.ending.345fe853f2ea.webp",
      "alt": "Le CRTV de poche s’éteint sur un rebord de fenêtre, devant une rue de St. Amelia perdue dans la brume."
    }
  },
  "murphy_rain": {
    "intro": {
      "path": "assets/chronicles/murphy_rain.intro.f5cc6b7b961b.webp",
      "alt": "Murphy se tient seul sous les fenêtres hautes d’Overlook, où la pluie projette les ombres des barreaux."
    },
    "ending": {
      "path": "assets/chronicles/murphy_rain.ending.9ef51285a649.webp",
      "alt": "À Overlook, Murphy et Anne se regardent face à face. Une main ouverte entre eux accompagne le choix du pardon."
    }
  }
};

export function chronicleArtwork(routeId) {
  return Object.hasOwn(ARTWORK, routeId) ? ARTWORK[routeId] : null;
}

export function setChronicleImage(image, artwork) {
  image.hidden = true;
  image.onload = null;
  image.onerror = null;
  if (!artwork) {
    image.removeAttribute('src');
    image.alt = '';
    return;
  }
  const url = new URL('../' + artwork.path, import.meta.url).href;
  image.alt = artwork.alt;
  const reveal = () => {
    if (image.currentSrc === url && image.naturalWidth > 0) image.hidden = false;
  };
  image.onload = reveal;
  if (image.src !== url) image.src = url;
  if (image.complete) reveal();
}
