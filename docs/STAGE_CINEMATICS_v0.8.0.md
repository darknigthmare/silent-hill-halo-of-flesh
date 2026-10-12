# Stages vivants — chorégraphie & gameplay v0.8.0

## Principes de fidélité

Les lieux, accessoires et conditions atmosphériques sont **hérités du catalogue de v0.7.0**. Le moteur **n'affirme jamais** qu'une animation, un chronométrage ou une fatalité créée pour le jeu Versus apparaît ainsi dans une œuvre officielle. Chaque chorégraphie indique `motif-location-attested / choreography-original-versus`. Il s'agit d'une interprétation originale et non d'assets extraits de Silent Hill.

| Univers / lieu | Direction de scène (originale) | Ancrage préservé |
|---|---|---|
| SH1 — Midwich / Alchemilla | Casiers, lumières, conduites et sirène | Collège, hôpital, peur industrielle |
| SH2 — Wood Side / Brookhaven / Lakeview | Chariots, ascenseurs, miroirs et décomposition | Lieux mémoriels et ambiances organiques |
| SH3 — Hazel Street / Mall | Rame, escalators, volets et brume | Équipements et architecture urbaine |
| SH4 — Room 302 | Parois, tableaux et objets hantés | Pièce domestique anormale |
| Shattered Memories | Givre rampant et trajet glissant | Monde gelé |
| P.T. — 204863 | Présence dans les cadres, lumières et boucle | Couloir et retour spatial |
| The Short Message | Pétales et racines | Végétation, parcours et traumatisme |
| Silent Hill f — Ebisugaoka | Racines, pétales, cloches et marques rituelles | Village japonais et transformation florale |
| Townfall — St. Amelia | Signal CRTV, pluie, éclair et dérèglement de la côte | Île écossaise froide, brouillard, CRTV |

**Sources primaires étudiées** : [Silent Hill f, Konami](https://www.konami.com/games/eu/fr/products/silenthill_f/), [Silent Hill 2, Konami](https://www.konami.com/games/eu/fr/products/silenthill2r/), [Silent Hill: Townfall, Konami](https://www.konami.com/games/eu/fr/products/shtf/). Ces pages étayent les grands motifs et lieux, pas les dégâts ou l'équilibrage.

## Catalogue des familles actives

Chaque événement pré-existant dans `stage.director.events` possède à présent une représentation de type objet : panne générale, sirène, casiers, chariot médical, effondrement, manège, rame, vapeur, eau, miroir, racines, projecteur, CRTV, cloche, vide, cendres, portraits, ascenseur, pièce organique, orage, glace et rituel.

- `src/stage-cinematics.js` : plan déterministe par lieu et événement, coordonnées normalisées sur une profondeur crédible, interpolation indépendante du RNG de combat, dessins Canvas originaux.
- `src/renderers.js` : second passage de décor actif, derrière personnages et indicateurs de collisions.
- `src/fight.js` : silhouettes des dangers au même emplacement que les zones d'impact : rame, chariot, casiers, ascenseurs, racines, glace, CRTV, chaînes, vapeur et eau.
- `src/stage-director.js` : le codex expose `choreography` dans les données générées, avec provenance et emplacement.
- `src/archive.js` : nouvelle section « CHORÉGRAPHIES VISUELLES », vignette vivante et aperçu à mi-animation.

## Règles de combat

Une zone de danger est télégraphiée à l'avance. L'IA ne connaît **que** la liste des zones déjà visibles : elle tient compte de l'adhérence du terrain, de son temps de réaction et de la place libre dans l'arène. Pour une onde générale qu'il est impossible de contourner, elle peut utiliser la garde si l'attaque est parable. L'IA ne lit pas les tirages aléatoires futurs.

La silhouette accompagnant la zone d'impact reste affichée, même lorsque les animations ambiantes sont désactivées ; l'option « mouvement réduit » amortit les oscillations. Les animations décoratives n'utilisent jamais la fonction RNG du moteur de combat : un joueur à 30 FPS ne reçoit pas d'autres dangers qu'à 120 FPS.

## Limites à conserver dans les retours QA

1. Les silhouettes sont des animations Canvas originales et stylisées, **pas des sprites officiels fidèles au pixel près**.
2. Les événements n'ont pas tous un mouvement en profondeur indépendant de la caméra : il reste des cas de mise en scène 2D symbolique.
3. Le catalogue contient toujours beaucoup de mouvements composites issus de comportements documentés : ce ne sont pas 4 600 coups directement vus en jeu.
4. Une séquence réellement canonique nécessite une vérification plan par plan contre la source, ainsi que les droits d'utilisation des assets concernés.
