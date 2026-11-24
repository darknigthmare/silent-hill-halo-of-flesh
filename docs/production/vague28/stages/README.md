# Vague 28 — trois arènes manquantes

Livraison de **trois candidats statiques**, chacun composé de deux PNG natifs indépendants : fond opaque et avant-plan RGBA. Aucun fichier généré n’a été recadré, redimensionné, recoloré, détouré ou recompressé. Statut de fidélité : **unverified** ; aucune certification 1:1 ou UHD.

| ID | Scène sélectionnée | Références visuelles |
|---|---|---|
| `final_sacrament` | Chambre finale sous Room 302, périmètre en pierre et bassin rituel | Capture du puzzle et gameplay à 30:20 / 34:00 |
| `scarlet_chamber` | Salle réelle de Scarlet au fond de Hell Descent | Gameplay à 2:41:40 / 2:45:40 / 2:46:10 |
| `arcade_hospital_roof` | Toit de Brookhaven, Stage 1 Area 3, phase normale dans la brume grise | Gameplay à 3:30 / 5:50 ; capture 2007 pour la clôture uniquement |

## Pièces livrées

- `integration-delivery.json` : métadonnées, empreintes, dimensions, plans, prompts, références et propositions de chemins d’intégration.
- `png/` : six originaux natifs 1672 × 941 copiés octet pour octet.
- `prompts-background.json`, `prompts-foreground.json` : consignes exactes transmises au générateur.
- `generation-results-background.json`, `generation-results-foreground.json` : reçus et chemins des sorties d’origine.
- `references/sources.json` : neuf images observées avec URL, horodatage, empreinte, dimensions et recadrage source documenté.
- `references/source-sheets/` : planches natives complètes dont proviennent les sept cellules vidéo ; aucun agrandissement des sources.
- `source-review.json` : choix de phase, erreurs de référence écartées et limites visuelles.
- `build-delivery.py` : vérifie les octets et l’alpha puis prépare le contrat de livraison sans modifier les registres.

## Choix et limites

La caméra latérale et la largeur de la zone de marche sont des adaptations pour le moteur de combat. La chambre SH4 conserve ses repères visibles, mais la répartition des stèles et la répétition de leur peinture, le dôme et les anneaux ne sont pas une restitution mesurée du modèle original. Le bassin et le mécanisme restent derrière les combattants.

Les références de Sepulcher anciennement associées à Scarlet sont écartées. Les nouveaux plans ne déduisent aucun câble, miroir ou effet de poupée de cette attribution erronée. Le rythme des rails, les dimensions des grilles et l’éclairage restent interprétés à partir de petites images de la salle exacte.

Le toit Arcade utilise la phase grise observée autour de l’affrontement. La capture orangée sert uniquement à vérifier la structure de la clôture. Une autre capture portant explicitement le libellé « Stage 3 Area 1 Toluca Lake » a été écartée. La façade d’accès et le nombre de travées de clôture restent non vérifiés.

Les acteurs, monstres, interfaces et sous-titres des sources sont exclus. Aucun événement, collision, finisher, mouvement de rituel ou état de monde n’est modifié. La validation du moteur est effectuée séparément après l’import par l’intégrateur.

## Contrôles après intégration

Le **contrôle final sous le code courant** a exécuté **109 contrôles réussis** dans le vrai `FightEngine` avec Canvas natif. Le [rapport final](qa-native-final/report.json), sa [revue visuelle](qa-native-final/visual-review.json) et l’[index des empreintes](qa-native-final/evidence-index.json) couvrent les trois scènes et les deux combattants existants `bom_pyramid_head_129` et `bom_butcher_123`, chargés par leur sélection normale.

Ce passage utilise le cache de combat final de **72 Mio (75 497 472 octets)** ; le cache des arènes reste à **64 Mio (67 108 864 octets)**. Déplacements dans les deux sens, parallaxe attendue et retour à l’arrêt sont vérifiés sans injection de position, de santé ou de phase. Les empreintes du code suivi, des entrées exactes des trois arènes, des deux combattants et des huit PNG employés sont archivées. Les fichiers suivis restent inchangés pendant ce passage.

Le [rapport initial à 108 contrôles](qa-native/report.json) et sa [revue visuelle initiale](qa-native/visual-review.json) sont conservés sans modification. Le 109e contrôle final ajoute la vérification de l’empreinte avant/après de `src/sprite-system.js`, le module du cache modifié. **Les trois captures finales ont été inspectées à nouveau et sont identiques octet pour octet aux trois captures initiales.** Les entrées exactes des arènes et des deux acteurs sont également inchangées entre les passages.

Ces contrôles sont natifs : ils ne valident ni Chromium, ni HTTP, ni les événements clavier d’un navigateur réel. Ils ne certifient aucune animation, attaque, collision nouvelle ou fidélité artistique 1:1.
