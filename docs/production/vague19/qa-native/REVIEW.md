# Revue indépendante — vague 19

**302 contrôles réussis ; 12 duels ; 42 captures créées ; 10 captures inspectées visuellement.**

Les six personnages Book of Memories ont été rendus dans les deux sens avec les vrais modules FightEngine et Canvas natif. Les mouvements utilisent les callbacks InputState enregistrés, sans modification directe de position, état, orientation ou horloge des acteurs. Les six portraits historiques sont conservés et distincts des images de combat.

## Résultats

- Aucun rectangle noir, halo alpha visible à 1280×720 ou découpage d’arme/appui observé dans les dix captures examinées.
- Pyramid Head v2 se décode et se rend dans les deux orientations. Sharp adapte seulement l’encodage PNG en mémoire ; les octets RGBA avant/après sont identiques.
- Les douze positions de repos ont leur borne visible basse exactement à y=594, avec un décalage aux appuis de 0 pixel.
- Les quatre arènes sont effectivement dessinées avec deux plans. Le plan de fond reste fixe ; le plan proche se décale de ±0,5112 à ±0,988416 pixel durant les douze ticks de mouvement contrôlés, conformément au coefficient proposé.
- Tous les fichiers source et PNG restent inchangés après la QA. Aucun code ou asset corrigé par cette revue.

## Captures examinées

| Capture | Observation |
|---|---|
| `bom_bogeyman_122-right-idle.png` | Subway World : marteau, tête, silhouette et appuis entiers ; deux plans visibles. |
| `bom_bogeyman_122-left-idle.png` | Forest World : orientation vers gauche correcte ; contours propres sur rocher et sol. |
| `bom_butcher_123-right-idle.png` | Hilltop Center : couteau et pieds entiers ; zone centrale du bureau dégagée. |
| `bom_butcher_123-left-idle.png` | Baldwin Mansion : porte fermée, personnage entièrement visible ; pas de bloc alpha. |
| `bom_double_head_124-right-idle.png` | Double Head : animal entier et quatre appuis visibles ; absence de boîte de fond. |
| `bom_pyramid_head_129-right-idle.png` | Pyramid Head v2 décodé : casque et grande lame entiers, aucun rectangle noir. |
| `bom_pyramid_head_129-left-movement-static-idle.png` | Pyramid Head à gauche après mouvement réel : miroir et lame complets, aucune substitution portrait. |
| `bom_schism_130-left-idle.png` | Schism entier : appendices céphaliques lisibles, mains et pieds présents ; découpe propre à taille gameplay. |
| `bom_straight_jacket_131-left-idle.png` | Straight-jacket entier : tête, enveloppe et pieds présents ; aucune frange rectangulaire. |
| `selection-bom_pyramid_head_129.png` | Portrait historique distinct conservé, décodage et cadrage de sélection intacts. |

## Portée et limites

Cette campagne vérifie le rendu natif, idle, le déplacement avec une image statique et le retour à idle. Elle ne vérifie ni Chromium/DOM/HTTP/service worker, ni attaques/contact/garde/fatalités. La phrase héritée du rapport brut indiquant des attaques whiff est une métadonnée obsolète ; aucune attaque n’a été exercée dans cette vague. Le rapport brut est conservé sans réécriture et cette synthèse corrige explicitement sa portée.

Les miroirs sont calculés par le moteur. Les vues latérales, cadrages, proportions et décors restent candidats ; aucune fidélité 1:1 ni UHD native n’est certifiée. Les petits fragments de bois de Baldwin restent semi-opaques (alpha maximal 208/255), sans gêne observée au centre du combat.

Preuves : `native/report.json` ; synthèse structurée : `review-summary.json`. Les images restent dans `native/` afin d’éviter toute duplication inutile.

## Huit captures conseillées pour la publication

| Fichier | Sujet | Stage | Orientation / usage |
|---|---|---|---|
| `bom_bogeyman_122-right-idle.png` | `bom_bogeyman_122` | `subway_world` | right |
| `bom_butcher_123-left-idle.png` | `bom_butcher_123` | `baldwin_mansion` | left |
| `bom_double_head_124-right-idle.png` | `bom_double_head_124` | `subway_world` | right |
| `bom_pyramid_head_129-right-idle.png` | `bom_pyramid_head_129` | `hilltop_center` | right |
| `bom_pyramid_head_129-left-movement-static-idle.png` | `bom_pyramid_head_129` | `baldwin_mansion` | left |
| `bom_schism_130-left-idle.png` | `bom_schism_130` | `forest_world` | left |
| `bom_straight_jacket_131-left-idle.png` | `bom_straight_jacket_131` | `baldwin_mansion` | left |
| `selection-bom_pyramid_head_129.png` | `bom_pyramid_head_129` | `—` | selection-portrait |

## Correction documentaire du harness

Après exécution, une copie du harness corrige uniquement la phrase héritée prétendant exercer des attaques. Les assertions et le flux de contrôle n’ont pas changé ; aucun nouveau résultat de test n’est revendiqué. Le rapport brut reste inchangé. Le script exact exécuté est également conservé.

- SHA-256 exécuté : `a1e524411c6e98a51f0a7116fff50b7a4f86d4a99acc9d71ec4fa4cc9c56590c`
- SHA-256 livré, documentation corrigée : `264012b2cf690cfe5a270b5cccc34ad8772157239bd3df454496a5c4b587979e`
