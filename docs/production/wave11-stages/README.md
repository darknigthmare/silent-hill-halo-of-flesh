# Deux salles de Silent Hill 4 en combat

| Arène | Décor et phase | Plan mobile | Déplacement horizontal mesuré à 1 280 × 720 |
| --- | --- | --- | --- |
| Water Prison World | Salle centrale de surveillance du deuxième étage, avant la rotation des cellules | Volant immobile sur son piédestal | 23,76 px |
| Apartment World | Bureau du concierge au 105 de South Ashfield, premier passage | Chaise vide devant le bureau | 19,44 px |

Les fiches de référence identifient les pièces et leurs accessoires. Les illustrations reprennent les matières et les objets visibles. La caméra, la largeur du sol et les zones hors champ ont été adaptées au duel. La fidélité à l’image près reste à valider. Le [registre de provenance](provenance.json) contient les identifiants du projet, les sources visuelles, les consignes de génération et les empreintes des images.

Les captures montrent Mumbler contre Lying Figure dans le moteur de combat. Pour chaque salle, le contrôle fait avancer le duel jusqu’au premier round, déplace la caméra entre quinze positions et vérifie que le décor fixe et le plan mobile sont dessinés avec les deux combattants. Les réglages de réduction de mouvement et de désactivation des animations immobilisent le deuxième plan. Les PNG ont été décodés localement et le rendu a été réalisé avec le Canvas 2D Skia. L’exécution Chromium de ce lot reste à confirmer.

| Water Prison | Bureau 105 |
| --- | --- |
| [Combat](captures/water_prison-center.jpg) · [Mesures](captures/water_prison-metrics.json) | [Combat](captures/apartment_world-center.jpg) · [Mesures](captures/apartment_world-metrics.json) |

Le registre commun contient 15 arènes illustrées sur 123, 17 vues et 28 PNG. Pour régénérer le cache après une modification des ressources, exécuter `node scripts/build-stage-bitmaps.mjs`.
