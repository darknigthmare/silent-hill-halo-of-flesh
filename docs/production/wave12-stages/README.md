# Vague 12 · Trois arènes en parallaxe

| Arène | Plan mobile | Écart mesuré | En combat |
| --- | --- | ---: | --- |
| Couloir éclairé de P.T. | Meuble, poste de radio, plante et cadre photo | 23,76 px | [Centre](captures/looping_hall-center.jpg) · [Marche](captures/looping_hall-walking.webp) · [Mesures](captures/looping_hall-metrics.json) |
| Atelier de Curtis, Silent Hill Homecoming | Comptoir de l’échange initial et objets posés dessus | 34,56 px | [Centre](captures/curtis_shop-center.jpg) · [Marche](captures/curtis_shop-walking.webp) · [Mesures](captures/curtis_shop-metrics.json) |
| Seuil de la première chambre rituelle, Silent Hill f | Brasero de gauche devant les panneaux de bois | 19,44 px | [Centre](captures/dark_shrine_main-center.jpg) · [Marche](captures/dark_shrine_main-walking.webp) · [Mesures](captures/dark_shrine_main-metrics.json) |

Six images composent les trois salles. Le fond de chacune mesure 1 672 × 941 pixels. L’accessoire a son propre PNG transparent et sa position varie avec celle des combattants. Le deuxième brasero de la chambre rituelle apparaît sur le mur du fond. La référence de P.T. documente le couloir éclairé du 14 août 2014 sans identifier le numéro de boucle. Les pièces, les sources et les empreintes des fichiers sont réunies dans le [registre de provenance](provenance.json).

Les captures de Mumbler contre Lying Figure proviennent du moteur de combat à 1 280 × 720, avec rendu Canvas 2D Skia. Pour chaque arène, le contrôle suit les coordonnées des deux PNG au cours de quinze cadrages et conserve les vues gauche, centre et droite. Il fait ensuite marcher les deux combattants par leurs commandes de déplacement et enregistre dix-huit images du duel. La réduction de mouvement et la désactivation des animations ont chacune immobilisé le plan mobile sans le masquer. Les objets et les flammes sont représentés dans une pose fixe.

Les matériaux et les accessoires visibles ont été travaillés à partir des captures du jeu d’origine. La perspective, l’éclairage et la largeur du plateau sont adaptés au duel. Une certification au pixel près reste à établir.

L’audit du registre complet décode 34 PNG pour 18 des 123 arènes du jeu. En comptant les variantes de pièces, le registre contient 20 vues.
