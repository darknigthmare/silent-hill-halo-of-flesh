# Sprites de sélection et de combat — 18 novembre 2026

**2 nouveaux profils disposent d’un portrait de sélection.** 4 autres personnages reçoivent une pose de combat distincte. La galerie atteint **174 profils illustrés sur 230**. Il reste **56 profils sans image**.

| Personnage | Édition | Usage | Dimensions | Fichier |
| --- | --- | --- | --- | --- |
| Feral | SILENT HILL: HOMECOMING | Combat latéral | 1774 × 887 | [PNG](../../assets/sprites/homecoming_feral_086.d944b0e329cf.png) |
| Needler | SILENT HILL: HOMECOMING | Combat latéral | 1774 × 887 | [PNG](../../assets/sprites/homecoming_needler_088.04a662ecb2cb.png) |
| Night Flutter | SILENT HILL | Combat latéral | 1448 × 1086 | [PNG](../../assets/sprites/sh1_night_flutter_002.4c283a4ddf49.png) |
| Floatstinger | SILENT HILL | Combat latéral | 1312 × 1199 | [PNG](../../assets/sprites/sh1_floatstinger_016.80344808d0d5.png) |
| Bubble Head Nurse — Return to Silent Hill | Return to Silent Hill (2026) | Sélection | 1068 × 1472 | [PNG](../../assets/sprites/film_bubble_head_nurse_return_to_silent_hill.4dfe1e93350e.png) |
| Creeper — Return to Silent Hill | Return to Silent Hill (2026) | Sélection | 1084 × 1451 | [PNG](../../assets/sprites/film_creeper_return_to_silent_hill.fc7cb9789eef.png) |

Le registre contient **34 combats latéraux distincts**, **138 vues de combat historiques**, **2 sélections seules** et **247 PNG de sprites**. Les nouvelles poses sont fixes. Le jeu conserve 1 clip animé au total. La fidélité visuelle 1:1 reste à vérifier pour les nouvelles images.

## Références des profils précédemment sans image

- **Bubble Head Nurse — Return to Silent Hill** — sélection intégrée depuis la figure de gauche éclairée à 1 min 08,750 s dans la bande-annonce 2026. La coiffe, la robe et les deux chaussures sont visibles. Le modèle précis de l’instrument et les doigts du bras arrière restent incertains.
- **Colin the Janitor** — génération refusée (violence), 1 tentative, zéro fichier importé.
- **Creeper — Return to Silent Hill** — sélection intégrée après examen des vues au sol et de la face ventrale de la créature du film 2026.
- **Joseph Schreiber — Victim 15** — le cadrage de l’apparition reste incomplet et le profil reste sans image.

Tri documentaire distinct pour Sewer Creature.

Les cadrages et limites propres à chaque profil sont consignés dans les dossiers de recherche. [Creeper, Joseph et tri documentaire](wave3-research-2026-11-18/README.md) · [Infirmière du film de 2026](wave3-research-2026-11-18/nurse/README.md) · [Colin du film de 2006](wave3-research-2026-11-18/colin/README.md)

## Vérifications

Le gate complet a passé **1254 tests sur 1254**, puis vérifié un build de **328 fichiers**, dont 42 JavaScript et 10 HTML. [Journal de npm test](qa-sprite-wave3-2026-11-18/npm-test.log.gz)

Les **111 tests Python** de la chaîne d’import ont réussi. [Journal des tests Python](qa-sprite-wave3-2026-11-18/python-art-tests.log.gz)

- **75 contrôles réussis** pour 4 duels et 8 rendus des portraits antérieurs. [Rapport du moteur](qa-sprite-wave3-2026-11-18/main/report.json)
- **20 contrôles réussis** pour 4 rendus des nouveaux portraits de sélection. [Rapport du moteur](qa-sprite-wave3-2026-11-18/selection/report.json)

Au total, les deux parcours natifs ont passé **95 assertions**. Les duels portent sur les quatre personnages dotés d’une nouvelle pose de combat. Les deux nouvelles sélections du film gardent leur rôle `unverified` et leurs entrées de combat désactivées.

Après ce gate, **31 tests ciblés sur 31 ont réussi** pour la correction des instantanés ART144 et ART92. Ils couvrent les profils avec sélection seule et l’attribution des images par frame ou par empreinte des pixels. Les contrôles du navigateur distant relèvent de la CI GitHub. [Captures et revue visuelle native](qa-sprite-wave3-2026-11-18/README.md)

Le roster est identique au commit de départ. Les **241 anciens PNG** ont conservé leurs octets et les **172 anciens portraits** leur affectation. Les empreintes des 6 nouveaux fichiers correspondent aux imports et aux sorties enregistrées.

## Reprise

[Inventaire courant et blocages](sprite-status-wave3-2026-11-18.json) · [Imports et références](sprite-wave3-imports-2026-11-18.json) · [Générations et arrêts](sprite-wave3-generation-2026-11-18.json) · [Inventaire précédent](sprite-status-complement-2026-11-18.json)
