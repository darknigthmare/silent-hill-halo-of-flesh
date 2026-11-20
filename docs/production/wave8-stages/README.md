# Vague 8 — trois décors de combat en parallaxe

| Arène jouable | Édition de référence | Plan rapproché | Déplacement à 1280 × 720 | En jeu |
| --- | --- | --- | --- | --- |
| Wood Side, appartement 208 avant le déplacement de l’horloge | Silent Hill 2, 2001 | Horloge en bois sombre, porte fermée | 37,8 px vers la gauche | [Vue centrale](captures/woodside-center.jpg) · [Marche](captures/woodside-walking.webp) |
| Central Square, salle du Happy Burger | Silent Hill 3, 2003 | Table avec condiments et plateau | 59,4 px vers la gauche | [Vue centrale](captures/shopping_mall-center.jpg) · [Marche](captures/shopping_mall-walking.webp) |
| Blue Creek, palier avant le drainage de l’escalier | Silent Hill 2, 2001 | Tronçon de rampe longeant les marches | 48,6 px vers la gauche | [Vue centrale](captures/blue_creek-center.jpg) · [Marche](captures/blue_creek-walking.webp) |

Les six PNG sont des images natives indépendantes. Chaque fond a une résolution de 1672 × 941. Les trois objets ont un canal alpha et se déplacent selon le centre du duel. Le moteur dessine les combattants devant eux. Le couloir de Wood Side et la boulangerie Helen’s Bakery gardent leurs images pour les sélections qui demandent explicitement ces pièces. Blue Creek reçoit son premier décor bitmap.

Les volets, le papier peint et l’horloge reprennent les vues de l’appartement 208. Les stores ambrés et le mobilier viennent de la salle où Heather se réveille. La table indépendante est à gauche pour dégager le centre et équilibrer le mobilier déjà peint à droite. À Blue Creek, le plan des marches, la largeur de la zone sèche et l’écartement des rampes sont adaptés à la caméra de profil. Les couleurs, proportions et détails occultés des trois lieux restent des interprétations. Les captures de référence, leurs empreintes et les six prompts sont consultables dans le [dossier de provenance](provenance.json).

Les sols et la logique des phases sont ceux des fiches d’arène. Le plafond dessiné n’atteste aucun point de fixation pour une fatalité. Les images de remplacement couvrent les anciens motifs animés dessinés sur Canvas. Le cadran reste fixe, la table demeure en place dans le restaurant et l’eau garde son niveau sur le palier.

Le registre contient désormais 10 lieux disposant d’un décor actif sur les 123 de la sélection. Il réunit 12 vues et 18 PNG, dont les deux vues historiques. Il reste 113 lieux sans décor bitmap actif.

## Vérification dans le jeu

Chromium a lancé trois duels locaux avec Mumbler et Lying Figure. Quinze positions par arène ont permis de mesurer le déplacement relatif indiqué dans le tableau. Pendant les trois extraits de 2,1 secondes, les touches de déplacement des deux combattants sont maintenues pendant 126 ticks. Les 24 contrôles portent sur le dessin effectif des plans, l’alpha, les positions, la marche, le mouvement réduit, la désactivation des animations et les exceptions de page. Les images latérales, les coordonnées des combattants et chaque appel de dessin mesuré accompagnent le [rapport des trois duels](captures/report.json).

Pour reproduire les captures depuis la racine du dépôt avec Chromium, Playwright Core et Python/Pillow, exécuter la commande suivante.

```sh
QA_STAGE_OUTPUT_DIR=docs/production/wave8-stages/captures node docs/production/wave7-stages/verify.mjs woodside shopping_mall blue_creek
```
