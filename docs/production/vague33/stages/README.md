# Vague 33 — Historical Society (The Arcade)

## Résultat

Deux plans candidats natifs de **1 672 × 941 px** pour `arcade_historical`, scène normale de la galerie avant la descente souterraine et la transition vers la prison. Le fond est RGB opaque ; le premier plan est RGBA et ne contient que deux étroits jambages de bois aux marges. Les pixels générés sont conservés sans recadrage, repeinture ni redimensionnement.

Ces fichiers sont des reconstructions visuellement sourcées, **pas une fidélité 1:1 certifiée**. Ils ne constituent ni une animation, ni une nouvelle mécanique de scène. Les deux plans sont maintenant intégrés à `src/stage-bitmap-manifest.js` et à la fiche de scène précise dans `src/stage-reference-policy.js`. `import-plan.json` relie leurs chemins effectifs aux mesures et à la recette en jeu.

## Preuves inspectées

La galerie est visible dans le gameplay **Silent Hill: The Arcade (2007) - Tutorial & Gameplay (JConfig)** de Gaming Onda Couch : [entrée à 20:50](https://www.youtube.com/watch?v=jovQIyOwE8A&t=1250s), [mur de tableaux à 21:00](https://www.youtube.com/watch?v=jovQIyOwE8A&t=1260s). La description du parcours situe le début de Historical Society à 20:43. Ces captures sont des cellules de storyboard publiques de 320 × 180 pixels, extraites sans agrandissement. Il s’agit d’une exécution PC via JConfig ; aucune capture de borne native ni variante régionale exacte n’est revendiquée.

Un deuxième parcours, **Silent Hill : The Arcade (Full Playthrough) (With 2 endings)** d’Old John’s Gaming World, répète [l’entrée à 18:30](https://www.youtube.com/watch?v=9MZN4w35ZVc&t=1110s) et [la galerie à 18:40](https://www.youtube.com/watch?v=9MZN4w35ZVc&t=1120s). Ses prévisualisations disponibles mesurent 160 × 90 pixels. Les horodatages identifient des échantillons espacés de dix secondes ; ils ne mesurent pas le début exact d’une action du jeu.

Le [catalogue des scènes Silent Hill Memories](https://www.silenthillmemories.net/sh_arcade/stages_en.htm) et sa carte `st2_1.gif` servent à identifier Stage 2 Area 1. Ils ne prouvent pas les textures. Les onze captures promotionnelles archivées sous « 2010.02.21 | Konami Europe » ont également été inspectées ; elles ne montrent pas cette galerie et n’ont pas servi d’images jointes à la génération. Aucune image du musée de Silent Hill 2 n’a été substituée à la version Arcade.

Les captures retenues établissent le papier peint jaune/olive à motifs verticaux, le soubassement en bois sombre, le chambranle d’entrée et l’ordre des quatre cadres autour de l’angle de la galerie. Les détails des peintures, les légendes, le sol exact, les dimensions complètes et la caméra native restent non résolus. Le fond généré reprend les grandes formes mais ses sujets picturaux et ses pixels ne sont pas prouvés identiques au jeu.

## Génération et adaptations

Un appel au générateur intégré a créé chaque plan. `background-prompt.txt` et `foreground-prompt.txt` conservent les instructions effectives. Le fond utilise les deux captures Arcade de 20:50 et 21:00 en pièces jointes. Le premier plan a été créé après la déconnexion de l’executor, à partir de la description précise de la capture déjà inspectée et de la palette du fond, sans pièce jointe. Son résultat data URL a été sauvegardé byte pour byte au rétablissement de l’environnement.

La caméra est reprojetée pour une arène latérale. Le bas du fond est une bande d’ombre volontairement peu détaillée ; ce n’est pas une preuve du revêtement réel du musée. La ligne de pieds proposée est y = 837 px (89 % de la hauteur), uniquement comme hypothèse d’intégration. Les jambages sont déplacés vers les bords pour préserver le jeu. Il n’y a ni escalier ajouté, ni trou, ni chaîne, ni effet de prison, ni événement interactif inventé.

## Contrôles

`anchor-measurements.json` donne les dimensions, les seuils d’alpha et les supports des jambages. Dans le corridor x = 67 à 1605 sur toute la hauteur, le maximum alpha est **1/255**, et aucun pixel ne dépasse **8/255**. Le centre est donc visuellement vide au seuil de contrôle retenu ; un alpha littéralement nul partout n’est pas revendiqué. Le plan de fond est opaque RGB.

`composition-native.html` superpose les deux fichiers à leur taille exacte, sans transformation. Le script `render-composition.mjs` peut produire une capture native avec Playwright. Le premier essai a été bloqué avant rendu parce que le navigateur installé a disparu lors de la reprise de l’executor. Consulter `composition-render-report.json` pour le statut le plus récent. La recette séparée [HTTP en jeu](../qa/stage/report.json) a ensuite réussi **21 contrôles** et conservé [une capture du vrai combat](../qa/stage/arcade_historical-http-fight.png), inspectée visuellement. Elle confirme les deux PNG servis, leur composition, la scène normale fixe, le sol neutre et l’absence des anciens effets génériques ; elle ne certifie pas les pixels ou dimensions du jeu source.

`backup-blobs.json` conserve les SHA de deux blobs de secours déposés dans le dépôt GitHub. Cette sauvegarde ne modifie ni branche ni commit et ne vaut pas publication du lot.
