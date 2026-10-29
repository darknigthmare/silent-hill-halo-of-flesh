# Plan d'exécution — première tranche jouable vérifiable

## Objectif

Terminer **un duel de référence** avant d'étendre le roster : deux personnages dont les références sont établies, un stage existant, toutes les interactions de base vérifiées en jeu. Ne pas déduire qu'un personnage est fini parce qu'il possède une image idle.

## Ordre des travaux

| Priorité | Travail | Condition de validation |
|---|---|---|
| P0 | Audit des deux combattants et de leurs images existantes | IDs, source, arme, échelle et poses réellement présentes listés |
| P0 | Animations idle, marche, garde, attaque, dégâts, chute et KO | Images distinctes importées, ancrages stables, aucun faux cycle |
| P0 | Combat et collisions | Startup/active/recovery, interruptions, garde, projectiles et KO couverts par tests |
| P1 | Présentations et finishers | Contexte du vainqueur, victime, arme et stage exact; aucun fallback trompeur |
| P1 | VFX et audio | Signaux d'impact, danger et radio lisibles, sans masquer l'action |
| P1 | UX et accessibilité | Clavier/manette P1/P2, réglages de contraste, motion réduite, volumes |
| P2 | Optimisation | Captures comparables et mesure de frametime sur mêmes scènes |

## Protocole de recette

1. Vérifier le point de départ : `npm test` (tests Node et build), puis `npm run test:art` (tests Python; Python/Pillow requis).
2. Construire : `npm run build`; lancer le serveur avec `npm start`.
3. Exécuter `npm run qa:browser` avec Chromium/Playwright installés; comparer les captures du duel, de la sélection et des présentations.
4. Vérifier deux manches, victoire au temps, KO, interruption de chaque type d'attaque, arme changée et retour au menu.
5. Classer chaque asset comme **absent**, **candidat statique**, **clip réellement animé**, **intégré et testé** ou **fidélité visuelle vérifiée**. Ces états ne sont pas interchangeables.
6. Consigner les écarts dans les fichiers de production existants, sans écraser les décisions historiques.

## Limites

Les scripts automatiques vérifient la structure et les règles; seuls les contrôles visuels et les références sourcées peuvent étayer la fidélité de silhouette, d'arme et de décor. Ne pas déclarer une fidélité 1:1 certifiée par une suite de tests réussie.
