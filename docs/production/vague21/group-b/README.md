# Passe 21 — lot B : six arènes manquantes

Livraison isolée de **6 arènes / 12 PNG statiques**, destinée à l’intégration par l’agent racine. Aucun personnage, portrait, moveset, classeur, fichier du moteur ou manifeste partagé n’a été modifié par cet agent.

| ID | Pièce et état retenus | Plan proche |
| --- | --- | --- |
| `grand_hotel` | Atrium Otherworld du Grand Hotel sans Sepulcher | Petits fragments de bordure aux coins bas |
| `town_hall_hc` | Salle publique du premier passage normal | Montants de boiserie aux marges |
| `shepherd_house_hc` | Grenier normal avant Lillian et transformation | Montant brut et chutes de bois |
| `centennial_building` | Bibliothèque normale, salle de lecture | Bord de boiserie et papiers au coin |
| `st_marias` | Chapelle normale, grille d’autel fermée | Éclats de plâtre/pierre et planche aux coins |
| `shepherds_glen` | Trottoir du panneau de disparus de la rencontre Elle | Lampadaire proche indépendant et papiers |

## Intégration

Le fichier `delivery.json` contient le tableau `stages` compatible avec `STAGE_BITMAPS`, le tableau `assets` avec `localPath`, destination `assets/stages/...<sha12>.png`, SHA256, octets, dimensions et rôle, puis les sources URL/SHA, prompts complets, limites et mesures alpha. Les PNG portent les noms `<stageId>.background.v1.png` et `<stageId>.foreground.v1.png` dans ce dossier de livraison isolé.

Chaque scène a un fond opaque RGB et un premier plan RGBA séparé. Les couches sont statiques, `fit: cover`, `parallaxX: 0` pour le fond et `0.006` pour le premier plan. Les six identifiants descriptifs de scène sont nouveaux ; les politiques existantes n’avaient aucun `sceneId` et ne sont pas modifiées.

**11 PNG mesurent 1672×941.** Le premier plan de Centennial mesure nativement **1673×940**. Les fichiers conservent leurs dimensions et pixels d’origine : aucun redimensionnement, détourage manuel ou recoloriage. Les douze fichiers sont des liens physiques vers les sorties Imagegen originales, vérifiés par SHA. Leur poids total est **14 963 602 octets**.

## Contrôles réalisés

Les douze sorties et leurs captures natives de référence ont été inspectées visuellement. Les six fonds sont entièrement opaques. Les six premiers plans ont un canal alpha réel, des pixels visibles et transparents, et **zéro pixel alpha ≥32** dans la bande centrale d’appui `x=20–80 %, y=80–86 %` ainsi que dans la zone centrale de corps contrôlée. Les appuis du moteur sont à `594/720 = 82,5 %` de la hauteur.

Quelques valeurs alpha1–2 subsistent dans les sorties natives, dont les RGB saturés de certaines franges techniques ; aucun de ces pixels rouges/jaunes ne dépasse le seuil alpha32. Les proportions et extrema sont consignés sans nettoyage de pixels. Le contrôle en composition réelle et avec le HUD reste à effectuer dans le harness natif de l’agent racine : cette livraison n’affirme aucun succès navigateur ou test du jeu en direct.

`descriptor-validation.json` confirme la sélection des **6 descripteurs et 12 frames uniques** avec les fonctions réelles `getStage`, `validateStageBitmap`, `stageBitmapFor` et `stageBitmapFrames`, en imports de lecture seule. Les six IDs étaient absents et non bloqués avant cette livraison. Le contrôle compare aussi les SHA, tailles, signatures PNG et dimensions IHDR aux fichiers.

## Sources et limites

Les captures Homecoming retenues proviennent du guide Portforward : 0031 pour Town Hall, 0368/0369 pour le grenier, 0138/0139/0140 pour l’atrium et 0062 pour le panneau. Les captures Downpour proviennent du guide Prima : 02g-021/022 pour la bibliothèque, 02i-017/018/019 pour les matériaux, grille et autel de la chapelle. Les guides Silent Hill Memories et les politiques locales établissent les séquences. Les URL exactes, fichiers archivés, SHA256 et usages par image figurent dans `delivery.json` et `references.json`.

Le **commissariat `police_station_hc` est reporté** : les captures inspectées sont des gros plans de dialogue derrière les barreaux ou des vignettes trop petites, et la planche Gamepressure est une carte. Aucune cellule générique n’a été fabriquée. L’agent racine a autorisé son remplacement par `shepherds_glen` après confirmation d’une vue native large et de la politique « PANNEAU DE LA RENCONTRE ELLE ».

Le Grand Hotel suit l’atrium Otherworld explicitement demandé par `atriumSupportReply`, tout en conservant le drapeau moteur `fixed-normal` et le libellé « ATRIUM SANS SEPULCHER ». Les sacs organiques, boss, arbre vivant et lustre sont exclus. La chapelle combine des vues complémentaires de son décor permanent sans importer l’ouverture de la grille ou le lustre descendu dans la scène retenue.

La caméra frontale, les distances, les zones occultées et le dégagement du plateau sont des reconstructions pour le versus. Les détails extrapolés, notamment la petite lampe de pupitre du Town Hall, sont déclarés dans les limites de chaque scène. **Aucune certification 1:1, UHD, animation source mesurée ou nouveau clip animé.**

## Traces de cette exécution isolée

`facts.json`, `prompts.json`, `generation-records.json`, `references.json`, `build-delivery.py` et `validate-descriptors.mjs` sont les traces locales de cette livraison. Les scripts contiennent des chemins de session : ils décrivent l’exécution exacte et ne prétendent pas constituer un outil portable du dépôt. Les répertoires de références et les fichiers PNG mentionnés sont ceux de ce dossier isolé ; une copie de ce README seule dans le dépôt ne les embarque pas.
