# Vague 9 — la chapelle initiale de Silent Hill 3

Le troisième lieu de la chronique de Heather, *Naître deux fois*, reçoit son premier décor bitmap. L’arène représente la chapelle de *Silent Hill 3* (2003), devant l’autel, avant le départ de la pièce.

Le fond de 1672 × 941 réunit les trois vitraux, les deux colonnes, les boiseries et le tabernacle. Une table de prière avec son livre ouvert et ses trois cierges occupe le côté droit. Ce deuxième PNG, transparent, mesure 1536 × 1024 et défile en fonction de la position des combattants. Dans le cadrage de référence à 1280 × 720, la table se décale de 48,6 pixels vers la gauche quand le centre du duel se déplace vers la droite. Les combattants restent visibles devant elle. [Vue centrale](captures/church-center.jpg) · [Marche des deux joueurs](captures/church-walking.webp)

Les deux images ont été créées à partir de vues de l’autel et de la sortie publiées dans le guide du jeu original. Le cadrage frontal, la largeur de la zone de combat, les détails des vitraux et les pieds de la table sont reconstruits. Les cierges restent allumés sur le plan fixe. Les trois effets d’ambiance de l’ancienne vue Canvas sont couverts par le nouveau décor. La scène conserve le sol neutre et la phase unique de la fiche et ne fournit aucun point de suspension pour les fatalités. [Captures sources, empreintes et prompts](provenance.json)

Un duel lancé depuis le menu avec Mumbler et Lying Figure a satisfait les huit contrôles sous Chromium. Le test compare quinze positions à un instant de simulation fixe, puis enregistre les déplacements réels des deux joueurs pendant 126 ticks. L’extrait comprend 21 images sur 2,1 secondes. Les modes de mouvement réduit et de désactivation des animations stabilisent la table. [Mesures, captures latérales et contrôles](captures/report.json)

Après cette arène, le registre compte **11 lieux sur 123** avec un décor bitmap actif, **13 vues** et **20 PNG**. Les deux vues historiques de Wood Side et de Central Square restent comptées dans ces 13 vues.

Pour reproduire la vérification depuis la racine du dépôt avec Chromium, Playwright Core et Python/Pillow, exécuter la commande suivante.

```sh
QA_STAGE_OUTPUT_DIR=docs/production/wave9-stages/captures node docs/production/wave7-stages/verify.mjs church
```
