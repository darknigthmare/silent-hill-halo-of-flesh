# Matrice de parité — CQC Versus Legacy v0.56

La reprise concerne l’organisation fonctionnelle, les modes, la navigation modulaire et la lisibilité du projet de référence. Le code, les données, l’interface et l’univers ont été reconstruits pour Silent Hill.

| Fonction CQC | Halo of Flesh v0.5.0 | Statut |
|---|---|---|
| Front de commande plein écran | registre CRTV/radio dans `index.html` | Étendu |
| Fond animé procédural | brume, signal et manifestations | Complet |
| Modules dans un player dédié | iframe `module-player` | Complet |
| Reprise du dernier front | sauvegarde locale versionnée | Complet |
| Chroniques | 15 routes, rangs S–D | Étendu |
| Unified Versus | `modules/unified-versus.html` | Complet |
| Sélection P1/P2 latérale | cartes et dossiers | Complet |
| Grille filtrable | 230 profils, pagination, favoris | Étendu |
| Choix d’arène | 123 stages animés | Étendu |
| 1P CPU / 2P local | modes de sélection | Complet |
| Manches et timer | 1/2/3, 60/99/∞ | Complet |
| Difficulté IA | Brume / Otherworld / Cauchemar | Complet |
| Arcade | 7 combats | Complet |
| Boss circuit | 6 boss à endurance | Étendu |
| Modificateurs | 9 rites | Étendu |
| Combat Academy | Salle d’Observation | Étendu |
| Hitboxes et data | input, frame, fidélité, phase | Étendu |
| Roster Command | Archives + route compatible | Complet |
| Finisher Archive | 460 fatalités + 123 stages | Étendu |
| Dossier détaillé | 16 coups, provenance et règles | Étendu |
| Commandes 2P | clavier et deux gamepads | Complet |
| Tactile | overlay P1 | Complet |
| Sauvegarde | progression, records et réglages | Étendu |
| Build statique / PWA | `dist/` et cache hors ligne | Complet |
| GitHub Actions QA | `.github/workflows/qa.yml` | Complet |
| Vercel | `vercel.json` | Complet |

## Extensions propres à Halo of Flesh

1. Otherworld dynamique, radio et parasites.
2. 230 morphologies et 3 680 mouvements documentés.
3. Seize commandes contextuelles par manifestation.
4. Trois niveaux de fidélité visibles mouvement par mouvement.
5. Douze traits, huit afflictions et sept dangers.
6. Neuf rites et douze personnalités IA.
7. IA utilisant les propriétés réelles du moveset.
8. Deux phases pour chacun des 75 boss.
9. 123 arènes, 374 animations et 123 fatalités environnementales.
10. 460 fatalités individuelles.
11. Exports JSON et documents générés depuis la même source de données.

## Différences volontaires

1. Aucun asset Metal Gear ou Silent Hill n’est réutilisé.
2. Les combattants non humains nécessitent des volumes et hitboxes très variés.
3. Les fatalités, frame data et annulations sont des adaptations explicites.
4. Les Chroniques couvrent plusieurs continuités et médias.
5. La direction visuelle privilégie brume, radio, CRTV, rouille, fleurs et dossiers de preuve plutôt qu’un HUD militaire.
