# Décors de combat en parallaxe

| Arène | Première utilisation dans une chronique | Plan rapproché | Déplacement relatif sur le balayage de contrôle à 1280 × 720 |
| --- | --- | --- | --- |
| [Manège de Cybil, Silent Hill (1999)](carousel/provenance.json) | *La Brume d’Alessa*, chapitre 2 | Cheval de bois et mât | 97,2 px vers la gauche |
| [Entrée de Room 302, Silent Hill 4](room302/provenance.json) | *Les Vingt-et-un Sacrements*, chapitre 1 | Chaise du séjour | 69,12 px vers la gauche |
| [Cour du Riverside Motel, Silent Hill: Origins sur PSP](riverside/provenance.json) | *Les Miroirs de Travis*, chapitre 2 | Portillon en fer | 48,6 px vers la gauche |

Les trois nouveaux décors apparaissent dans les pièces actives de leurs chroniques. Le manifeste compte 9 arènes et 12 PNG. Le moteur affiche 7 de ces décors dans les pièces actuellement choisies. Les deux images antérieures de Wood Side et Central Square correspondent respectivement au couloir et à la boulangerie.

Le cadrage suit le centre entre les combattants. Quand les deux avancent vers la droite, le plan rapproché se décale vers la gauche par rapport au fond. Chaque arène possède un fond opaque et un objet indépendant sur fond transparent. Le moteur dessine ensuite les deux combattants. Les collisions, les appuis et les dangers gardent les coordonnées du combat.

Les captures proviennent d’un duel lancé dans l’interface du jeu, avec Mumbler et Lying Figure. Les 24 contrôles Chromium ont réussi. Le contrôle de cadrage compare quinze positions imposées au même instant de simulation. Les extraits animés montrent ensuite 126 ticks de déplacement avec les commandes clavier des deux joueurs. Chaque extrait dure 2,1 secondes. Les options de mouvement réduit et de désactivation des animations de décor figent le décalage additionnel. La galerie présente la vue centrée. [Mesures et vérifications Chromium](captures/report.json)

| Arène | Vue en jeu à 1280 × 720 | Marche des deux joueurs |
| --- | --- | --- |
| Manège de Cybil | [Centre](captures/lakeside_amusement-center.jpg) | [Extrait animé](captures/lakeside_amusement-walking.webp) |
| Room 302 | [Centre](captures/room_302-center.jpg) | [Extrait animé](captures/room_302-walking.webp) |
| Riverside Motel | [Centre](captures/riverside_motel-center.jpg) | [Extrait animé](captures/riverside_motel-walking.webp) |

Les deux plans d’une même arène restent des dessins fixes. Le mouvement et l’écartement des objets servent la caméra de profil du versus. La géométrie complète des lieux d’origine et leur fidélité exacte restent à vérifier. Les dossiers par arène contiennent les vues sources, les instructions de génération et les empreintes des PNG.

Depuis la racine du dépôt, la commande suivante rejoue les mesures et restitue les captures avec Chromium, Playwright Core et Python/Pillow.

```sh
node docs/production/wave7-stages/verify.mjs
```
