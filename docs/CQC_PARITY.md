# Matrice de parité — CQC Versus Legacy v0.56

La reprise concerne l’organisation fonctionnelle, les modes, la navigation modulaire et la lisibilité du projet de référence. Le code, les données, l’interface et l’univers ont été reconstruits pour *Silent Hill*.

| Fonction CQC | Halo of Flesh v0.6.1 | Statut |
|---|---|---|
| Front de commande plein écran | registre CRTV/radio et navigation « Brume » | Étendu |
| Fond animé procédural | brume, signal et manifestations | Complet |
| Modules dans un player dédié | iframe `module-player` | Complet |
| Reprise du dernier cauchemar | sauvegarde locale versionnée | Complet |
| Chroniques | 15 routes, rangs S–D | Étendu |
| Unified Versus | Confrontation dans `modules/unified-versus.html` | Complet |
| Sélection latérale | Sujet I / Sujet II, cartes et dossiers | Étendu |
| Grille filtrable | 230 profils, pagination, favoris | Étendu |
| Choix d’arène | 123 stages animés | Étendu |
| CPU / deux joueurs locaux | modes de sélection | Complet |
| Manches et timer | 1/2/3, 60/99/∞ | Complet |
| Difficulté IA | Brume / Otherworld / Cauchemar | Complet |
| Arcade | 7 combats | Complet |
| Boss circuit | 6 boss à endurance | Étendu |
| Modificateurs | 9 rites | Étendu |
| Combat Academy | Salle d’Observation | Étendu |
| Hitboxes et data | input, frame, fidélité, phase et fenêtres contextuelles | Étendu |
| Roster Command | Archives + route compatible | Complet |
| Finisher Archive | 460 fatalités + 123 stages | Étendu |
| Dossier détaillé | 20 coups, provenance et règles | Étendu |
| Commandes deux joueurs | clavier et deux gamepads | Complet |
| Tactile | overlay Sujet I | Complet |
| Sauvegarde | progression, relevés et réglages | Étendu |
| Build statique / PWA | `dist/` et cache hors ligne | Complet |
| GitHub Actions QA | `.github/workflows/qa.yml` | Complet |
| Vercel | `vercel.json` | Complet |

## Extensions propres à Halo of Flesh

1. Otherworld dynamique, radio et parasites.
2. 230 morphologies et 4 600 mouvements documentés.
3. Vingt commandes par manifestation.
4. Projection arrière, riposte d’esquive, contre de garde parfaite et reversal de relevée.
5. Trois niveaux de fidélité visibles mouvement par mouvement.
6. Douze traits, huit afflictions et sept dangers.
7. Neuf rites et douze personnalités IA.
8. IA utilisant les propriétés et fenêtres réelles du moveset.
9. Deux phases pour chacun des 75 boss.
10. 123 arènes, 374 animations et 123 fatalités environnementales.
11. 460 fatalités individuelles.
12. Exports JSON et documents générés depuis la même source de données.

## Différences volontaires

1. Aucun asset *Metal Gear* ou *Silent Hill* n’est réutilisé.
2. Les combattants non humains nécessitent des volumes et hitboxes très variés.
3. Les fatalités, frame data, annulations et ripostes contextuelles sont des adaptations explicites lorsqu’elles ne sont pas directement attestées.
4. Les Chroniques couvrent plusieurs continuités et médias.
5. La direction visuelle privilégie brume, radio, CRTV, rouille, fleurs et dossiers de preuve plutôt qu’un HUD militaire.
