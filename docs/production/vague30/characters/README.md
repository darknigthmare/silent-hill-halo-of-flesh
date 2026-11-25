# Vague 30 — trois poses fixes de profils établis

Date de préparation : 25 novembre 2026. Baseline : `9c426d7e230eaec464203acb9b43b63a420acf30`.

## Périmètre et état

Les trois PNG ont été générés avec ImageGen, puis inspectés avec leurs références source et les idles déjà intégrés. Leurs octets originaux ont été sauvegardés en objets Git après l'indisponibilité du service d'exécution. L'import local interrompu n'est pas compté comme une validation.

| Propriétaire exact | Source | Pose ajoutée | Geste |
|---|---|---|---|
| sh4_sniffer_dog_male_053 | sh4 | forwardSpecial | Bond puis morsure |
| origins_carrion_076 | origins | forwardSpecial | Poursuite puis percussion |
| sh1_creeper_009 | sh1 | walk | Pas rampant |

Il s'agit de trois images fixes, une par fichier et par clip. Aucun personnage, portrait, modèle de base ou cycle animé supplémentaire n'est revendiqué. Les portraits et idles existants restent les références antérieures. Aucun sujet ou parent ayant fait l'objet d'un refus explicite n'a été réessayé.

**État à la préparation de ce dossier : import reproductible et QA en attente d'exécution CI.** Les résultats de CI doivent être joints avant de considérer l'intégration vérifiée. Ce document décrit ce qui est préparé ; il ne transforme pas une vérification non exécutée en réussite.

## Reprise reproductible

Prérequis : checkout incluant la baseline Git (fetch-depth: 0), Python avec Pillow et les trois PNG du plan.

```sh
python docs/production/vague30/characters/import-reviewed.py
python docs/production/vague30/characters/import-reviewed.py --check
npm run build
node docs/production/vague30/characters/qa-http.mjs
```

Le script d'import appelle `scripts/import-sprite.py`. Il calcule à nouveau l'audit RGBA réel et compare l'empreinte, les dimensions, les bornes visibles, la fraction transparente et l'objet Git des PNG avec le plan relu. Les fichiers temporaires conservent les noms UUID originaux d'ImageGen pour que la provenance des nouvelles frames reste exacte.

L'import est idempotent : une pose déjà présente avec le contenu exact est vérifiée et conservée ; une différence provoque un échec explicite. Le script compare tout le registre final à la baseline avec les seuls trois ajouts autorisés. Les 201 autres propriétaires, les anciens portraits, toutes les anciennes frames, les clips antérieurs et leurs métadonnées doivent être identiques. Chaque nouveau clip possède une frame, ticksPerFrame=1, loop=false et n'ajoute aucun animatedClip.

Les deux rapports calculés après l'import sont :

- `import-receipts.json` : audit exact des PNG, choix de clip, calibration et provenance.
- `registry-preservation.json` : empreintes avant/après et preuve de conservation complète.

Le script ne génère ni image ni manifeste dérivé et ne publie aucun commit.

## Vérification du jeu

Le harness HTTP reprend la méthode de vague 28 : application construite, assets HTTP réels, contextes Chromium neufs, sélection par l'interface et commandes clavier ordinaires. Il observe passivement drawImage, sans substituer de module, d'image, d'acteur ou d'horloge.

Il prépare six cas, soit les trois propriétaires dans les deux orientations. Pour Sniffer et Carrion, il attend la phase active du forwardSpecial. Pour Creeper, il vérifie que l'entrée directionnelle produit la marche au sol. Il contrôle les octets HTTP, le PNG réellement dessiné, les orientations, l'appui au pixel près et le retour à l'idle d'origine après relâchement. Le hurt encore absent reste signalé comme fallback explicite. Il retient douze captures du canvas natif 1280 × 720 et un rapport dans `tests/http-wave30-characters/`.

Les captures doivent encore être inspectées visuellement après une exécution réussie. La validation HTTP et les calculs d'appui ne certifient ni l'anatomie source ni la fidélité 1:1. Le test bloque les service workers et ne couvre donc pas les mises à jour hors ligne.

## Sources et limites

Les prompts exacts sont dans `prompts.json`. Les URLs, empreintes des références téléchargées, PNG d'idle utilisés, bornes inspectées et limites propres à chaque sujet sont dans `source-review.json`. Les deux images Carrion montrent la même pose et ne comptent pas comme deux angles indépendants. La vue de source du Creeper est dorsale ; son adaptation latérale reste celle du profil déjà établi. Le mâle Sniffer conserve ses oreilles, sa fourrure jaune et sa langue rouge ; les vues femelles ou de variante indéterminée sont exclues.

Une prévisualisation de Sniffer avait montré des couleurs dans des pixels entièrement transparents. La composition native Canvas sur fonds clair et sombre a confirmé l'absence de halo visible ; aucun nettoyage alpha ni nouvelle génération n'a été appliqué. Les PNG livrés ne sont ni recadrés, ni redimensionnés, ni recolorés, ni recompressés.

## Classeurs

Les deux XLSX de la bible restent aux objets Git de la baseline. Le rafraîchissement des onglets Guide combat et Associations guide est différé : le runtime Artifact Tool et la compétence Spreadsheets de l'environnement sont indisponibles. Aucune exception permettant de remplacer l'authoring Artifact Tool par openpyxl n'a pu être confirmée. `workbook-handoff.json` consigne leurs objets Git et la procédure de reprise. Les JSON du guide pourront être actualisés séparément ; cela ne signifie pas que les onglets ont été rafraîchis.
