# Groupe A — clôture stages manquants, passe 20

**Livraison finale : 3 décors, 6 PNG distincts.** Aucun changement du dépôt par le producteur ; aucune publication ou modification de personnage.

## Périmètre exact

- **lakeside_sh3** : Happy Carousel SH3 avant transition et Memory of Alessa. Trois sculptures de chevaux sur mâts fixes, hub jaune vieilli, sous-face de canopy teal et plateau rouille. Aucun gaz, adversaire ou décor Cybil SH1.
- **nightmare_hospital_sh3** : réserve aux miroirs de Brookhaven Otherworld, 3F. Miroir de fond, bassin utilitaire et traces sombres fixes. Aucun reflet humain, couloir téléphonique ou bassin Leonard.
- **sewers** : passerelle du canal après usage du sèche-cheveux. Câble au bord, eau sous la passerelle, aucun ennemi vivant ou courant actif. La ligne d’appui y=82,5% tombe sur le treillis après une correction ciblée par imagegen.

## Vérification des sorties

Chaque source visuelle retenue a été inspectée avant génération ; chaque PNG sélectionné a été affiché et inspecté. Les mesures suivantes lisent les images sans modifier leurs pixels. Les SHA complets, chemins versionnés et prompts complets sont dans `delivery.json`.

| PNG | Dimensions | Octets | Alpha mesuré | SHA256 préfixe |
|---|---:|---:|---|---|
| `lakeside_sh3.happy-carousel-before-transition.png` | 1672×941 | 2,284,992 | opaque | `bdd844f50ec7` |
| `lakeside_sh3.near-canopy-poles.png` | 1672×941 | 214,606 | 0–255; centre/pieds max 1/1; alpha 0 95.53% | `4249d9b87185` |
| `nightmare_hospital_sh3.mirror-storeroom.png` | 1672×941 | 2,501,782 | opaque | `a60fa6d89fbf` |
| `nightmare_hospital_sh3.near-doorjambs.png` | 1672×941 | 391,266 | 0–255; centre/pieds max 1/1; alpha 0 90.23% | `1d8e55fb19ab` |
| `sewers.channel-after-dryer.png` | 1671×941 | 2,499,871 | opaque | `9572d9592225` |
| `sewers.near-basin-edges.png` | 1672×941 | 316,219 | 0–255; centre/pieds max 1/1; alpha 0 92.35% | `5698b0266f8c` |

Les trois descripteurs ont passé `validateStageBitmap` du moteur contre `data/stages.json` : deux couches, chemins versionnés, métadonnées valides, fond à parallaxe 0 et premier plan indépendant à 0,012. Les sources n’ont pas de `referencePolicy.sceneId` ; `runtimeSceneId:null` est conservé et `scene` est un libellé descriptif du bitmap. Les plans emploient `fit:cover`. Le fond des égouts a une largeur de 1671 px contre 1672 px pour son avant-plan : écart source de 1 px, pas de redimensionnement matériel.

**La QA de rendu du moteur appartient à la passe d’intégration parent ; elle n’a pas été exécutée par ce producteur.** Aucun duel, attaque, animation de décor ou reflet dynamique n’est revendiqué dans cette vérification de fichiers. Les images sont des reconstructions pour cadrage versus, au statut `integrated-candidate` / `unverified`. Pas de certification 1:1 ni UHD.

Les premiers plans possèdent un alpha réel 0–255, une géométrie limitée aux bordures et un résidu au plus 1/255 dans la bande centrale et celle des pieds. Ce résidu est mesuré et n’est pas présenté comme un alpha exactement nul. Les arrière-plans sont opaques. Aucun personnage, créature, HUD, montage ou texte ajouté n’est visible dans les sorties retenues ; les chevaux du carrousel sont des sculptures du lieu.

## Limites des références

La capture du pont des égouts montre l’architecture lors de la rencontre ; son état après sèche-cheveux est reconstruit selon le guide et la fiche exacte. La capture du miroir est native au jeu et correspond à la bonne pièce, mais sa plateforme et ses réglages ne sont pas vérifiés indépendamment. Les vues du carrousel montrent le manège avant sa transition. Les échelles, perspective latérale et zones de combat ont été adaptées ; ces fichiers ne sont pas des captures extraites du jeu.

## Reports explicites

- **nightmare_mall** : aucune vue native assez ouverte des six tunnels inspectée. Le gros plan du Split Worm masque le lieu ; les captures PC 10–14 montrent les salles précédentes. Aucune génération tentée à partir de ces vues inadéquates.
- **apartment_roof**, remplacement autorisé : le guide et les captures PC obtenues montrent des couloirs ou des gros plans du Missionary. Le rendu indépendant trouvé est isolé sur fond blanc. Les métadonnées d’une vidéo PC originale ont été trouvées ; l’extraction d’une image a échoué et les petites planches de contrôle n’ont pas été récupérées. Aucune vue lisible du toit validée, donc aucune génération ni `delivery-roof.json`.

Ce sont des reports de production visuelle, pas des stages marqués bloqués dans les données du jeu. Les trois descripteurs et six enregistrements d’assets remis initialement sont restés identiques ; seuls les champs de clôture et de QA extérieurs ont été actualisés. Tous les PNG sélectionnés restent des liens physiques vers les sorties originales, octets inchangés.

## Revue visuelle après intégration

Les trois captures natives finales `sewers.png`, `lakeside_sh3.png` et `nightmare_hospital_sh3.png` du dossier `stage-pass20-verification/native` ont été inspectées à 1280×720. Aucun blocage visuel concret : appuis sur treillis/plateau/carrelage, armes complètes, silhouettes lisibles, bordures aux extrémités et HUD dégagé. Le plan des égouts place bien les pieds sur le pont après correction.

La revue est détaillée avec SHA des captures dans `native-visual-review.json`. Elle porte sur ces images fixes et ne prétend pas démontrer le mouvement de parallaxe à partir d’une seule image. Les 356 contrôles runtime sont rapportés par le parent qui exécute le harness ; ce producteur n’a pas relancé la suite ni les duels. Aucun résultat d’attaque ou d’orientation non montré n’est inventé. Les six PNG et les trois descripteurs restent inchangés.
