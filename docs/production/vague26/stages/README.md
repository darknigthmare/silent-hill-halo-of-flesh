# Vague 26 — quatre décors manquants

Deux livraisons indépendantes et immuables proposent **quatre nouvelles arènes**, soit **huit PNG natifs de 1672 × 941** : un fond opaque et un avant-plan RGBA par scène. Les octets du générateur sont conservés sans recadrage, redimensionnement, retouche, modification alpha ou recompression. Le total est de **10 429 844 octets**. Aucun nouveau clip animé n’est produit.

| Livraison | Identifiant | Sous-lieu et preuve | Limite principale |
| --- | --- | --- | --- |
| `integration-delivery-a.json` | `nightmare_theater` | Caverne de Caliban derrière le miroir d’Artaud ; captures du guide officiel Origins, PDF p. 82, page imprimée 81. | Caméra latérale, largeur et surfaces cachées adaptées. Ce n’est pas l’auditorium normal. |
| `integration-delivery-a.json` | `nightmare_school` | Cour de Midwich, premier point Paparazzi ; capture 3b et contexte du chapitre Nightmare 3 de Shattered Memories. | La source de 200 × 150 montre surtout le téléphone et sa fenêtre cible ; la cour entière n’est pas relevée. Aucun couple ou puzzle n’est reproduit. |
| `integration-delivery-a.json` | `nightmare_mall_sm` | Hall Gumball gelé après Garage Access South ; capture 6a et chapitre Nightmare 5. | La source de 200 × 150 limite les détails ; ni distributeur, personnages gelés, couleurs du puzzle, Tookie ni dégel. |
| `integration-delivery-b.json` | `frozen_streets` | Voie extérieure glacée sans nom, capture Wii n° 38 de la galerie datée du 31 juillet 2009. | Image promotionnelle antérieure à la sortie : rue précise et correspondance avec le jeu final non certifiées. La pente source devient un sol horizontal de versus. |

## Contrôle de ces livraisons

Les huit images ont été inspectées directement. Les quatre sols restent continus et dégagés ; les avant-plans visibles restent aux bords. La transparence totale des avant-plans va de **97,30 % à 98,77 %**. Quelques traces natives subsistent dans la zone centrale avec un alpha maximal de **1 ou 2 sur 255** ; elles sont mesurées dans `native-plate-review.json` et conservées. Il ne serait pas exact de déclarer chaque pixel central strictement nul.

Chaque scène propose une ligne de pieds à `y = 0.87`, un léger déplacement du plan proche (`parallaxX = 0.006`) et aucun changement de collision, rôle, état du monde ou mécanique. Il s’agit d’une revue des images natives. La QA dans FightEngine et le navigateur appartient à la phase d’intégration et doit être référencée séparément.

Les références, leur SHA-256, les sorties originales, les prompts exacts et le détail de l’analyse alpha figurent dans les deux fichiers de livraison. Tous les actifs restent des **candidats `fidelity: unverified`**. Ni géométrie 1:1, animation source, cadence ni résolution UHD ne sont certifiées.

## Deux réserves non générées

`cedar_grove` demande Female Treatment **avant le miroir**. La page inspectée situe le miroir mais montre la pièce après la traversée ; la salle d’hydrothérapie est une autre pièce. `antique_shop` demande le **passage intérieur après le trou** de Green Lion : les rendus disponibles de la façade et de la salle du culte ne remplacent pas ce passage. Aucune génération de ces deux scènes n’a été lancée dans ce lot. Les preuves déjà trouvées et l’action suivante sont conservées dans `reserved-stage-dispositions.json` ; les drapeaux source du jeu ne changent pas.
