# Vague 28 — revue native finale des deux effets

**Résultat : 79 contrôles réussis, quatre scènes et six captures 1280×720 relues individuellement**, après intégration du cache de combat à 72 Mio. Rapport : [report.json](report.json). Empreinte SHA-256 du rapport : `8c6e3d798456d6f7aeac562424b1108762e5b78f5020fd4ebfaaa7735dd13144`.

Le statut concerne le rendu natif de ces candidats dans le versus. La fidélité reste `unverified` ; cette passe ne certifie ni animation originale ni reproduction 1:1.

## Version et méthode contrôlées

Le harnais utilise les vrais `FightEngine.update/render`, les callbacks clavier de `InputState` et les options normales de duel local/entraînement. Les actions déclenchées sont `neutralSpecial` pour Earth et Fire, chacun en joueur1 puis en joueur2. Aucun combattant ni projectile n'est injecté. Le rendu est fait par Canvas natif ; ce n'est pas une exécution HTTP ou Chromium.

Les PNG sont lus à leurs dimensions natives. SHA-256, taille et égalité RGBA avant/après l'adaptateur de décodage en mémoire sont vérifiés. Aucun fichier image du projet n'est modifié. Le rapport identifie les **35 fichiers de code du graphe d'imports**, dont le harnais et `src/sprite-system.js`, les **10 images chargées** et les **six chemins d'images réellement dessinées**.

Le cache de combat observé vaut 75 497 472 octets (72 Mio), celui des stages 67 108 864 octets (64 Mio) et celui des projectiles 33 554 432 octets (32 Mio). L'empreinte de `src/sprite-system.js` contrôlé est `9576f522cd63113dbb33b2bfdcae24728783d08ed2194f384732467e88589a28`. Le cache de projectiles atteint 12 580 176 octets pendant les quatre scènes, sous son plafond. Cette passe ne remplace pas l'audit global d'admission du roster.

## Effets en vol

| Effet | Slot observé | Dimensions logiques du bitmap | Vitesse observée | Observation |
|---|---|---|---|---|
| Earth, `bom_earth_guardian_rock` | `neutralSpecial` | 36,21×36 | ±12 unités logiques/tick | Un seul rocher brun-olive, irrégulier, indépendant de la tête et des mains ; lisible dans les deux sens. |
| Fire, `bom_fire_guardian_hand_flame` | `neutralSpecial` | 111,80×36 | ±8 unités logiques/tick | Plume blanche, magenta et violette, origine étroite vers le lanceur ; orientation correcte et transparence conservée. |

Les vitesses sont aussi calculées à partir des positions relevées : Earth parcourt 240 unités logiques en 20 ticks ; Fire en parcourt 160. Il s'agit des paramètres du versus existant, pas de mesures du jeu source. La caméra réduit légèrement les dimensions visibles à l'écran.

Les quatre vues de vol sont prises 20 ticks après la première observation du projectile. Ce délai laisse voir les effets dégagés du corps. Le premier rapport à cinq ticks, conservé, montrait encore le rocher devant l'ouverture de la tête. Seul le moment de la capture a été adapté ; aucune position, vitesse ou hitbox n'a changé. Les contrôles confirment également que dessiner le PNG ne change ni trajectoire, ni durée de vie, ni santé.

## Raccord Fire à la première émission

La pose effectivement dessinée est `assets/sprites/bom_fire_guardian_137.00774213127e.png`. Le repère sur la courbe supérieure de la griffe repliée est approximativement [985,490] dans son PNG natif 1670×941 ; le repère de départ étroit du jet est [174,467] dans le PNG 2172×724. Les coordonnées écran proviennent des arguments et matrices réels de `drawImage`.

| Orientation | Repère de griffe, écran | Origine colorée, écran | Écart origine−griffe |
|---|---|---|---|
| Droite | (373,60 ;443,79) | (371,14 ;443,98) | Δx−2,46 ;Δy+0,18 ;distance2,47px |
| Gauche | (906,40 ;443,79) | (908,86 ;443,98) | Δx+2,46 ;Δy+0,18 ;distance2,47px |

**Le repère [985,490] n’est pas le bout d’un doigt.** Il se trouve sur le haut de la griffe repliée. L’origine du jet est proche de ce repère choisi et symétrique, mais elle n’est pas raccordée précisément à la pointe anatomique. La main reste près du visage dans cette pose ; une partie du jet chevauche le profil de la tête au premier rendu. Le museau très voisin peut ainsi faire lire l’effet comme un souffle à l’échelle du jeu. La pointe de griffe estimée vers [1090,530] est à environ **42,92 pixels** de l’origine colorée dans les deux sens. La distance de 2,47 pixels décrit uniquement l’écart des repères approximatifs choisis sur les deux PNG. Elle ne prouve ni départ au bout d’un doigt, ni raccord anatomique exact, ni geste original, ni émission continue depuis la main. Cette ambiguïté est conservée et documentée ; aucune nouvelle retouche ne la masque. Après 20 ticks, la plume est entièrement séparée du corps, conformément au projectile mobile déjà utilisé par le moteur.

## Références et limites de fidélité

Earth repose sur les [captures 48](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_48_earth_boss.jpg) et [49](https://www.silenthillmemories.net/sh_book_of_memories/screenshots/pics/sh_book_of_memories_screen_20120606_49_earth_boss.jpg) de l'E3 2012. Elles précèdent la version commerciale et documentent la matière et la forme générale des rochers. Elles ne mesurent ni leur taille de rendu versus ni leur rotation.

Fire est documenté par les miniatures natives 160×90 du [longplay](https://www.youtube.com/watch?v=ruh4O2ZO7aA), notamment à [1:27:50](https://www.youtube.com/watch?v=ruh4O2ZO7aA&t=5270). Cette preuve renseigne la palette générale blanc/magenta/violet et la présence d'un jet. Elle ne donne pas un contour haute résolution, une palette RGB mesurée ou un cycle animé. Le jet horizontal indépendant reste une adaptation de présentation.

Steel est laissé manquant : les vidéos inspectées ne permettaient pas de définir un contour de lame projectile assez fiable. Les données de recherche, images sources et empreintes initiales sont conservées dans le dossier parent.

## Pièces archivées

Les six observations individuelles et les hashes complets des captures sont dans [visual-review.json](visual-review.json). [artifact-hashes.json](artifact-hashes.json) archive les empreintes des fichiers de cette revue et du résultat. Les rapports antérieurs `../qa-native-final/report.json` et `../qa-native-visible/report.json` restent disponibles. Les six images finales ont les mêmes hashes que le passage intermédiaire à 20 ticks ; la correction de capacité du cache n'a pas changé le rendu de ces scènes.
