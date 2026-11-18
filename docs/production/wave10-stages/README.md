# Vague 10 — deux décors de Silent Hill 2

Les deux scènes reprennent les lieux du jeu de 2001. Chaque arène emploie un fond fixe de 1672 × 941 et un accessoire indépendant de 1024 × 1536 à fond transparent. Le moteur dessine les combattants devant ces plans.

| Arène | État représenté | Accessoire en parallaxe | Course observée à 1280 × 720 |
| --- | --- | --- | --- |
| Cour de Toluca Prison | Avant le placement des trois plaques | Panneau frontal et montants du gibet | 22,7 pixels |
| Labyrinthe | Chambre de commande du puzzle | Cube à visages et support, au repos | 38,9 pixels |

Le cadrage latéral, la largeur du sol et les détails peu visibles dans les captures d’origine ont été reconstruits. Le cube reste immobile et les trois logements du panneau restent vides. Les paramètres de combat gardent la phase et le terrain de chaque fiche.

Deux duels entre Mumbler et Lying Figure ont été lancés depuis la sélection locale. Les contrôles comparent quinze positions fixes puis la marche des deux combattants au clavier. Les réglages de mouvement réduit et de désactivation des animations stabilisent le deuxième plan. [Captures et mesures](captures/report.json) · [Sources et provenance des images](provenance.json)

| Cour de Toluca Prison | Labyrinthe |
| --- | --- |
| [Combat](captures/toluca_prison-center.jpg) · [Déplacement](captures/toluca_prison-walking.webp) | [Combat](captures/labyrinth-center.jpg) · [Déplacement](captures/labyrinth-walking.webp) |

Le registre réunit désormais 13 arènes sur 123, 15 vues et 24 PNG. Parmi les 110 arènes encore dépourvues de vue bitmap, 95 disposent d’une référence de lieu et 15 attendent une identification dans le catalogue de la vague.

Pour reproduire les contrôles depuis le dépôt, définir les chemins de Chromium et de Playwright selon l’installation locale, puis exécuter la commande suivante.

```sh
QA_STAGE_OUTPUT_DIR=docs/production/wave10-stages/captures node docs/production/wave7-stages/verify.mjs toluca_prison labyrinth
```
