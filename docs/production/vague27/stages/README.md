# Vague 27 — trois arènes, six plans natifs

Livraison de trois lieux absents à la base `fbd109d39ac843620e6c0fde1284480bc51a66d3`. Chaque arène possède un fond opaque et un avant-plan RGBA indépendant, tous deux en 1672 × 941 pixels. Les six PNG représentent 7 220 549 octets. Aucun registre global ni ancien dossier de production n’est modifié par cette livraison.

## Sous-lieux retenus

| ID | Sous-lieu et phase | Éléments directement observés | Adaptations explicites |
| --- | --- | --- | --- |
| `police_station_hc` | Première cellule du commissariat de Shepherd’s Glen, avant libération par Wheeler | Cage et porte à barreaux gris, murs gris vert, béton dégradé | Caméra latérale, portée complète des barreaux, proportions de porte et sol dégagé élargi |
| `villa_rooftop` | Première visite du toit de la Villa dans la brume | Mural de Maya, bouquets, mur béton, parapet et garde-corps | Mural redessiné, disposition des fleurs, largeur du toit, proportions et caméra latérale |
| `villa_stairwell` | Cage d’escalier normale vers le toit, après la sortie du labyrinthe | Volée droite en béton, murs deux tons gris vert/teal, main courante, plafond bas, porte à panneaux | Élévation latérale, profil de la volée, nombre de marches et palier inférieur élargi |

Les références sont des pixels réels des jeux dans des vidéos publiques de gameplay, extraits sans agrandissement ni retouche depuis leurs images de prévisualisation. Les captures utiles font 320 × 180 pixels ; elles attestent l’identité des pièces et leurs motifs, pas une géométrie exacte ou un matériau en haute définition. Les PNG produits sont donc des **candidats de fidélité non vérifiée**. Aucune certification 1:1 ni UHD n’est donnée.

## Sources vérifiées

- Cellule : [longplay Homecoming, 1:47:30](https://www.youtube.com/watch?v=7ozGzBI6oT4&t=6450s), [1:48:30](https://www.youtube.com/watch?v=7ozGzBI6oT4&t=6510s), [1:48:40](https://www.youtube.com/watch?v=7ozGzBI6oT4&t=6520s).
- Toit : [première visite, 21:40](https://www.youtube.com/watch?v=5F33MhsMbkQ&t=1300s), [21:50](https://www.youtube.com/watch?v=5F33MhsMbkQ&t=1310s), [22:40](https://www.youtube.com/watch?v=5F33MhsMbkQ&t=1360s).
- Escalier : [Chase 2, 50 s](https://www.youtube.com/watch?v=rr9YYc8ZpsM&t=50s), [51 s](https://www.youtube.com/watch?v=rr9YYc8ZpsM&t=51s), [Chase 4, 100 s](https://www.youtube.com/watch?v=NgNuc0xyHJY&t=100s).
- Contexte de route : [guide The Short Message](https://www.silenthillmemories.net/sh_the_short_message/walkthrough_en.htm) et [guide Homecoming](https://www.silenthillmemories.net/sh5/walkthrough_en.htm).

Les fichiers `references/sources.json` conservent les URL, horodatages, cellules, coordonnées d’extraction, dimensions et SHA-256. Les planches sources correspondantes sont conservées à côté des neuf extraits.

### Correction de source policière

L’ancienne URL `https://www.silenthillmemories.net/sh5/screens/pics/sh5_screen_060.jpg`, citée dans le lot 9, montre **Alex en tenue d’hôpital et Joshua avec Robbie derrière des barreaux dans l’ouverture d’Alchemilla**. Elle ne représente pas la cellule de la rencontre avec Wheeler. Elle a été inspectée et exclue des prompts de cette vague. Le constat, son empreinte et les captures de remplacement sont consignés dans `source-review.json`. L’ancien dossier reste intact.

## Contrôle des plans natifs

| Avant-plan | Pixels entièrement transparents | Alpha maximal dans les 86 % centraux | Pixels centraux d’alpha > 2 |
| --- | ---: | ---: | ---: |
| Cellule | 96,7327 % | 1 | 0 |
| Toit | 98,8354 % | 0 | 0 |
| Escalier | 94,2094 % | 1 | 0 |

Les traces d’alpha 1 de la cellule et de l’escalier sont conservées telles que produites. Les six images ont été inspectées individuellement. Chaque fond reste opaque et laisse une ligne d’appui continue à `y = 0.87`. Les avant-plans n’apportent que de minces bords latéraux ; ils ne masquent pas la zone centrale de combat.

Les PNG sont des copies identiques des sorties natives de l’outil intégré `image_gen.imagegen`. Aucune découpe, mise à l’échelle, correction couleur, suppression d’alpha ou recompression n’a été appliquée aux sorties générées. Les seuls recadrages concernent les références de gameplay, et sont documentés comme tels.

## Intégration

`integration-delivery.json` fournit `stages[]`, `assets[]`, `references[]` et les six prompts complets. Il est compatible avec le format de livraison de la vague 26. Les destinations proposées sont hachées sous `assets/stages/`. `generation-results-background.json` et `generation-results-foreground.json` identifient les sorties natives et leurs copies de livraison. `build-delivery.py` calcule les métriques et refuse d’écraser un reçu existant.

Statut attendu : `integrated-candidate`, `fidelity: unverified`, deux calques statiques indépendants, `loop: false`. La cellule et l’escalier sont couverts (`ceiling: true`), le toit est ouvert (`ceiling: false`). Les politiques existantes de phase normale, absence de danger et absence de finisher automatique demeurent actives. Le tableau peint sur le toit ne constitue pas un acteur.

### Résultat après intégration

La passe racine a intégré les six chemins, puis le harnais `qa-native.mjs` a contrôlé les trois arènes dans le véritable `FightEngine` avec Canvas natif : **108 contrôles réussis et trois captures de combat**, toutes inspectées. Le mouvement par les callbacks clavier d’origine fonctionne dans les deux sens, le relâchement revient à l’attente, les deux plans exacts sont peints, la parallaxe suit le déplacement et les PNG restent inchangés.

Les résultats sont dans `qa-native/report.json` et la lecture visuelle dans `qa-native/visual-review.json`. Le sol demeure lisible sur les trois scènes et aucun avant-plan ne masque les personnages au centre. Ce contrôle natif ne couvre pas Chromium, le DOM, HTTP, le service worker ou la livraison réelle d’événements clavier par un navigateur. Il ne certifie pas les adaptations géométriques ou le mural en fidélité 1:1.
