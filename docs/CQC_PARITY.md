# Matrice de parité — CQC Versus Legacy v0.56

Le projet de référence analysé est **CQC Versus Legacy v0.56**. La reprise concerne sa structure de produit, ses modes, sa navigation, son organisation modulaire et sa lisibilité générale. Le code, les données et l’habillage ont été reconstruits pour l’univers Silent Hill.

| Fonction CQC | Halo of Flesh v0.4.0 | Statut |
|---|---|---|
| Front de commande plein écran | `index.html` | Complet |
| Fond animé procédural | `src/command.js` | Complet |
| Modules chargés dans un player dédié | iframe `module-player` | Complet |
| Reprise du dernier front | sauvegarde locale versionnée | Complet |
| Chroniques | 14 routes, rangs S–D | Étendu |
| Unified Versus | `modules/unified-versus.html` | Complet |
| Sélection P1/P2 latérale | cartes latérales | Complet |
| Grille centrale filtrable | 184 profils, pagination, favoris | Étendu |
| Choix d’arène | galerie de 53 arènes | Étendu |
| 1P CPU / 2P local | modes de sélection | Complet |
| Manches et timer | 1/2/3 manches, 60/99/∞ | Complet |
| Difficulté IA | Brume / Otherworld / Cauchemar | Complet |
| Arcade | parcours de 7 combats | Complet |
| Boss circuit | Grands Tourments, 6 boss à endurance | Étendu |
| Mode modificateurs | Rites du Jugement, 8 combats | Nouveau |
| Combat Academy | Observation enrichie | Étendu |
| Hitboxes et données d’entraînement | panneau Observation | Complet |
| Roster Command | Archive/Bestiaire + route compatible | Complet |
| Finisher Archive | 184 finishers documentés + route compatible | Étendu |
| Dossier détaillé | trait, affliction, IA, phases et coups | Étendu |
| Commandes 2P | deux mappings clavier | Complet |
| Gamepad | deux gamepads | Complet |
| Tactile | overlay P1 | Complet |
| Sauvegarde locale | progression, rangs, runs, records et réglages | Étendu |
| Build statique | `dist/` | Complet |
| GitHub Actions QA | `.github/workflows/qa.yml` | Complet |
| Déploiement Vercel | `vercel.json` | Complet |

## Extensions propres à Halo of Flesh

La v0.4.0 dépasse volontairement la parité stricte sur les points suivants :

1. Otherworld dynamique en cours de round.
2. Radio de proximité et parasites visuels.
3. Douze traits, huit afflictions et sept dangers.
4. Neuf rites, standard inclus.
5. Douze personnalités IA et lecture adaptative des habitudes.
6. Deux phases pour chacun des 68 boss.
7. Endurance persistante dans Rites du Jugement et Grands Tourments.
8. Garde parfaite, contres et routes d’annulation.
9. Rang S–D et statistiques détaillées de Chronique.
10. Export séparé de toutes les règles dans `data/combat-rules.json`.

## Différences volontaires

1. Aucun asset de Metal Gear ou de Silent Hill n’est réutilisé.
2. Les combats sont construits autour de morphologies non humaines très différentes.
3. Les finishers sont des concepts cinématiques originaux et documentés.
4. Les Chroniques couvrent plusieurs continuités et médias.
5. La direction visuelle emploie brume, cendres, rouille, pétales et lumière synthétique calculés en Canvas.
