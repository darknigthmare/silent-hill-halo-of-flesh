# Fidélité — ce qui est établi et ce qui ne l'est pas

## Provenance de cette passe

Base de publication vérifiée : main `995bd2243c7326dea09d2da06a21164435ce592b` (v0.7.0). Travail v0.8.0 récupéré depuis l'archive Drive de l'utilisateur, complété ici en v0.8.1. Les noms, armes, stages, variantes et classifications des movesets sont hérités, pas remplacés par une recherche extérieure silencieuse.

## Ce que contrôle le code ajouté

`stage-lore-policy.js` compare les événements et animations aux accessoires, à la famille et au climat déjà déclarés dans le catalogue. Cette règle empêche par exemple des lits roulants sans lits, des trains sans rails ou un CRTV hors du pack Townfall. Ce contrôle vérifie la cohérence interne, pas la véracité de chaque entrée du catalogue.

`combat-geometry.js` aligne les zones vulnérables sur les silhouettes originales dessinées dans ce prototype. Les dimensions sont des unités de jeu, sans prétention de taille canonique mesurée. Aucune immunité surnaturelle nouvelle n'est déduite d'une simple étiquette : le traitement du sol tient compte de la posture et de la famille visuelle.

## Ce qui reste une adaptation

Les commandes de versus, invulnérabilités d'esquive, fenêtres de garde, dégâts, volumes, trajets, sauts et mises à mort sont de la conception originale. La source narrative ne fournit pas nécessairement ces paramètres. La correction d'un mécanisme ne transforme donc pas un mouvement « composite » en mouvement « attesté ».

Les 447 actions étiquetées direct-canonical, les 3 694 composites et les 459 adaptations conservent leurs classifications héritées. Cette passe ne recertifie pas ces 4 600 entrées. `coverageComplete: true` signifie que les cibles internes codées sont remplies ; il ne prouve pas l'exhaustivité de toute la franchise.

## Références extérieures ponctuelles, distinctes de la base

- PlayStation Blog, 1er octobre 2024, présentation du combat Flesh Lip par les développeurs : https://blog.playstation.com/2024/10/01/silent-hill-2-new-gameplay-reveals-intense-flesh-lip-boss-fight-and-introduces-laura/ . Cette source concerne le remake ; ses phases ne sont pas copiées automatiquement sur le boss du jeu original.
- Konami, présentation officielle de Silent Hill f : https://www.konami.com/games/eu/fr/products/silenthill_f/ . Contexte d'Ebisugaoka et de la brume ; pas une preuve de chaque timing, arène ou nom descriptif du catalogue.

## Limites de rendu

Aucun asset officiel extrait. Les images du paquet QA montrent les véritables primitives du moteur, encore très simplifiées. Elles ne prouvent ni une fidélité morphologique 1:1, ni la ressemblance de chaque décor à tous les plans officiels. Des modèles/sprites originaux plus précis, une comparaison par œuvre et une QA humaine restent nécessaires.
