# Vague 22 — dix décors manquants

Ce lot ajoute **10 décors et 20 PNG**, soit **23 993 353 octets** d’images de production. Chaque décor possède un fond opaque et un premier plan distinct avec un véritable canal alpha. Les PNG sont conservés tels que générés, en **1672 × 941**, sans redimensionnement ni retouche de pixels. Les dix paires ont été intégrées par root ; leurs dix captures du moteur natif ont été inspectées et acceptées.

La couverture des décors passe de **55 à 65 sur 123**. Il reste **58 décors absents : 43 non bloqués et 15 bloqués**. Le producteur de ce lot n’a modifié aucun personnage, portrait, animation source, règle de terrain ou module du moteur.

## Pièces retenues

| ID | Œuvre et scène retenue | Capture du moteur natif |
| --- | --- | --- |
| `hazel_subway` | SH3, alcôve normale des machines à tickets dans le hall de Hazel Street. | [Hazel Street](../qa-native/cases/hazel_subway/hazel_subway.png) |
| `underpass_sh3` | SH3, pièce supérieure avec plan mural, tonneau et casier tombé, avant le canal. | [Underpass](../qa-native/cases/underpass_sh3/underpass_sh3.png) |
| `nightmare_hilltop` | SH3, galerie Otherworld devant *Flame Purifies All*, avant la combustion du tableau. Les figures peintes appartiennent à l’œuvre murale. | [Nightmare Hilltop](../qa-native/cases/nightmare_hilltop/nightmare_hilltop.png) |
| `outside_room_302` | SH4, corridor altéré final devant la porte 105 enchaînée du superintendent. | [Outside Room 302](../qa-native/cases/outside_room_302/outside_room_302.png) |
| `alchemilla_origins` | Origins, palier normal du niveau 1F devant l’ascenseur, rencontre avec Kaufmann avant la montée. | [Alchemilla Origins](../qa-native/cases/alchemilla_origins/alchemilla_origins.png) |
| `nightmare_hospital_hc` | Homecoming, rêve clinique initial devant la grille 2A, avant le miroir. | [Alchemilla Homecoming](../qa-native/cases/nightmare_hospital_hc/nightmare_hospital_hc.png) |
| `villa` | The Short Message, corridor normal du chapitre 1 devant l’appartement 214 de Maya. | [Villa](../qa-native/cases/villa/villa.png) |
| `nowhere` | SH1, salle du générateur derrière la porte Bethor, courant encore actif avant la récupération de la clé électrifiée. | [Nowhere](../qa-native/cases/nowhere/nowhere.png) |
| `central_nightmare` | SH1, toit du combat Floatstinger dans Central Silent Hill altéré. | [Central Nightmare](../qa-native/cases/central_nightmare/central_nightmare.png) |
| `nightmare_hospital_sm` | Shattered Memories, **version PSP US 2010**, chambre ER pendant le puzzle radio, avant le dégel de la porte. | [Chambre ER](../qa-native/cases/nightmare_hospital_sm/nightmare_hospital_sm.png) |

Le cadrage latéral place les appuis à **82,5 % de la hauteur**. Les deux plans restent statiques ; leurs facteurs de parallaxe horizontale sont respectivement **0** et **0,006**. Les premiers plans se limitent à des retours de matériaux observés, aux bords extrêmes. Leur centre et la bande d’appui ont un alpha maximal mesuré de **1/255**. Aucun nouveau clip d’animation n’est créé.

Les politiques existantes restent applicables. La paire Origins représente seulement son palier normal ; elle ne fournit pas de transformation visuelle. Le champ moteur `interior` existant de Villa reste inchangé, même si le lieu illustré est un corridor couvert. Le descripteur d’image précise séparément sa géométrie visuelle. Les détails sont conservés dans les quatre livraisons incrémentales.

## Preuves et limites de fidélité

Les références natives ont été ouvertes avant génération. Les [15 images sélectionnées pour publication](reference-inventory.json) totalisent **3 020 287 octets**. L’inventaire donne leurs URL, SHA256, dimensions et, pour les extraits, leur rectangle et leur source parente. Les prompts complets et les chemins des sources effectivement fournies au générateur figurent dans [delivery.json](delivery.json).

Les guides PDF complets, pages HTML et métadonnées vidéo restent des sources de travail. Leurs URL et empreintes sont conservées. Pour Origins, la publication retient trois vues pertinentes extraites de la page du guide utilisée ; pour Homecoming, une seule image native de la grille 2A. Les références ER sont trois cellules natives **318 × 180** du [longplay PSP](https://www.youtube.com/watch?v=2Ekz2eUCIbU), à environ 1:31:12, 1:31:22 et 1:32:12. Le guide établit la phase du puzzle. Cette nouvelle preuve permet d’identifier une colonne fixe de pavés de verre près de l’issue glacée ; elle n’atteste aucune cloison animée. Aucune image Wii n’a servi d’entrée visuelle à cette paire PSP.

Ces images sont des **reconstructions guidées par les sources et adaptées au duel**. L’élargissement de la caméra, l’échelle, l’éclairage et la géométrie masquée sont déclarés comme adaptations. Les petits textes, la texture exacte et les détails hors champ ne sont pas certifiés. La fidélité reste `unverified` : aucune certification **1:1** ou **UHD** n’est revendiquée.

Une correction ciblée par imagegen a retiré une petite trappe inventée sur le mur gauche du premier brouillon de Nowhere. Le brouillon est exclu des actifs livrés. Le lot représente **21 appels de génération pour 20 PNG retenus**, sans retouche manuelle de pixels.

## Vérification réellement effectuée

Les dix cas existants du moteur natif ont chacun réussi **46 assertions**, soit **460 contrôles** liés à **10 captures**. Ils vérifient l’entrée au combat, le dessin des plans exacts, le déplacement dans les deux directions par les commandes enregistrées, le retour à l’attente et les translations de parallaxe. Leurs rapports et SHA sont associés à chaque image dans la [revue visuelle finale](native-visual-review.json).

La revue a ouvert les dix captures et contrôlé les appuis, les armes visibles, la bande de combat, les limites des premiers plans, la cohérence de la pièce et la lisibilité du HUD. **Aucun défaut visuel concret n’est resté ouvert.** La capture seule ne démontre pas la parallaxe ; les mesures de déplacement figurent dans chaque rapport unitaire. Les références à ces rapports pointent vers les exécutions déjà réalisées, sans relance de test pendant la revue.

La portée est celle de **Canvas natif et du véritable FightEngine**. `browserTest`, `httpTest` et `actorStateInjected` restent `false`. Cette campagne stages ne revendique aucun test d’attaque, de garde, de contact, de finisher, de Chromium ou de clavier livré par un navigateur. Les champs `engineTest:false` des fiches d’actifs décrivent leur contrôle avant intégration ; la revue finale conserve le résultat moteur obtenu ensuite.

## Reports conservés

La [décision de sélection](selection-decisions.json) détaille les cibles non retenues. Les références de Final Sacrament masquent trop la chambre ; celles de Nightmare Theater ne séparent pas assez la vue large normale et les fragments Otherworld ; Prison Homecoming et Scarlet manquent de vues accessibles suffisamment lisibles. Les essais documentaires Villa rooftop, Villa stairwell, Cedar Grove et Frozen Streets n’ont pas donné une meilleure preuve du lieu précis. Aucun décor n’a été généré pour ces alternatives.

Les reports antérieurs `nightmare_mall`, `apartment_roof`, `shimizu_residence` et `police_station_hc` restent inchangés. La lecture supplémentaire du guide Cedar Grove confirme la différence entre Hydrotherapy et Female Treatment après miroir ; elle ne lève pas le manque de preuve de la salle normale demandée.

## Livrables

- [delivery.json](delivery.json) : consolidation des dix descripteurs, vingt actifs, références et prompts ; provenance complète, à ne pas réimporter sur des IDs déjà intégrés.
- [delivery-part1.json](delivery-part1.json), [delivery-part2.json](delivery-part2.json), [delivery-part3.json](delivery-part3.json), [delivery-part4.json](delivery-part4.json) : sous-lots incrémentaux figés, sans changement de leurs pixels ou descripteurs.
- [reference-inventory.json](reference-inventory.json) : seule liste de rasters documentaires à copier pour publication, sans guides complets.
- [native-visual-review.json](native-visual-review.json) : dix captures acceptées, empreintes et limites ; le [point de contrôle des neuf premières](native-visual-review-first9.json) reste conservé.
- [selection-decisions.json](selection-decisions.json) et [evidence-inventory.json](evidence-inventory.json) : choix, reports, empreintes et inventaire final.

L’intégration et les cas natifs ont été conduits par root. Aucun commit, push ou changement distant n’a été effectué par le producteur de ce lot.
