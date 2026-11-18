# La nef de Holy Way et l’autel Inari

| Arène | État du lieu | Plan mobile | Déplacement mesuré |
| --- | --- | --- | ---: |
| Church of the Holy Way, *Silent Hill: Homecoming* | Nef avant la rupture du vitrail | Porte-cierge sur pied, à gauche du plateau | 28,08 px |
| Dark Shrine Corridors, *Silent Hill f* | Autel avant la restitution de la statue d’Inari | Étagère en bois avec coffres laqués | 36,72 px |

Les quatre PNG d’origine sont intégrés au jeu à leur résolution native. Chaque fond mesure 1 672 × 941 pixels. Chaque accessoire occupe un PNG transparent de 1 024 × 1 536 pixels. Le registre donne pour chaque fichier son nom d’origine, son chemin dans le jeu et son empreinte SHA-256. Les références de chaque salle proviennent de sa fiche de production. [Registre de provenance](rooms-provenance.json)

## Contrôle en duel

Mumbler affronte Lying Figure dans le moteur de combat à 1 280 × 720. Les PNG des personnages et des arènes ont été décodés depuis les fichiers locaux et affichés avec le moteur Canvas 2D natif Skia. Le contrôle relève les coordonnées de dessin des deux plans à quinze positions des combattants. Le fond garde son abscisse tandis que le porte-cierge ou l’étagère suit la caméra. Les deux joueurs ont également marché vers la droite pendant 96 mises à jour en utilisant les commandes du moteur. L’option de réduction des mouvements et la désactivation des animations de décor immobilisent chacune le premier plan.

- [Nef en duel](rooms-qa/church_hc.jpg) · [Mesures de la nef](rooms-qa/church_hc.json)
- [Autel Inari en duel](rooms-qa/dark_shrine_corridors.jpg) · [Mesures de l’autel](rooms-qa/dark_shrine_corridors.json)

Le cadrage latéral, les volumes et les distances correspondent à une adaptation pour le versus. La comparaison géométrique avec les scènes d’origine reste à établir. La vérification locale couvre le moteur natif. L’ouverture de Chromium a échoué lors de la création de son socket.
