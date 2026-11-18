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
