# Le trauma partagé — Silent Hill: Ascension

Dans **Chroniques**, choisir **Le trauma partagé**. L’ouverture présente Rachel Hernandez dans une rue de Hope’s Junction et Astrid Johansen devant les habitations de Stilledalen. Le diptyque rapproche les deux communautés décrites dans le prologue. Après le dernier combat, une porte entrouverte laisse voir le symbole circulaire et les bougies de la salle rituelle. La scène accompagne le dénouement écrit pour cette chronique. [Ouverture et dénouement](overview.jpg)

Les portraits de l’édition 2023 ont guidé les traits de Rachel et d’Astrid. Les lieux s’appuient sur les peintures de production de Terraform Studios, créditées à Sergio Castaneda, Andrej Rempel et Alben Tan. La porte au premier plan et la juxtaposition des deux lieux ont été composées pour ce jeu. Le journal conserve les références visuelles, les prompts, les dimensions ainsi que les empreintes des fichiers. [Journal de génération](generation.json) · [Portraits de l’édition](https://www.silenthillmemories.net/sh_ascension/characters_en.htm) · [Décors de Terraform Studios](https://www.silenthillmemories.net/sh_ascension/art_en.htm#Environment_Locations)

Le parcours compte trois combats, dans l’ordre **Wanderer**, **Fighter** et **The Immolator**. Le quatrième chapitre, **The Collector**, reste accessible comme dossier. L’archive et le premier combat affichent l’ouverture. Le dénouement s’affiche au bilan du troisième combat remporté. [Ouverture en jeu](qa/trauma_together-opening.jpg) · [Écran de fin](qa/trauma_together-ending.jpg)

## Vérification

Sous Chromium 153, les 71 contrôles ont réussi. Le parcours HTTP lance la chronique à partir de l’archive avec Snarler. Il prépare les K.-O. décisifs dans le moteur afin de vérifier les résultats intermédiaires, les transitions, la sauvegarde et l’affichage final. Le test contrôle aussi le retour depuis une fenêtre mobile de 390 pixels de large et le décodage des seize illustrations sur les quinze chroniques après le passage hors ligne. [Rapport Chromium](qa/report.json)

```sh
npm run build
QA_STORY_ROUTES=trauma_together QA_OUTPUT=docs/production/wave9-story/qa node scripts/http-qa-chronicle-art.mjs
```
