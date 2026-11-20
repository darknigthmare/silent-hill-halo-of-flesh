# Revue indépendante — vague 18

**Résultat : aucun défaut bloquant constaté sur le périmètre examiné.**

- 32 tests ciblés réussis, aucun échec : retrait du résultat terminé, bitmaps et compositions d’arènes.
- 286 contrôles natifs réussis, huit duels et 61 captures.
- Sept captures inspectées visuellement : Nurse attaque et garde, Scraper marche, Scarlet idle et marche, Mannequin Monster, aperçu de rendu Return.
- Aucun fichier source ni asset modifié par cette revue. Les empreintes de la QA native confirment leur conservation.

## Code

Le retrait des images d’un résultat terminé dépend du résultat visible, de son état settled, de la phase matchEnd et de la fin de l’outro. Il intervient après le préchargement global réussi et la validation du jeton de sélection. La nouvelle paire doit tenir seule dans le budget de 64 Mio ; seul le dépassement causé par l’union avec l’ancien résultat autorise ce retrait. Le résultat Canvas et les octets de sauvegarde demeurent disponibles après un échec de décodage final ; les tests couvrent le nouvel essai Continuer et le retour sélection.

Le scintillement Midwich est limité aux cellules de feu de l’image dont l’empreinte est explicitement attendue. Il suit l’horloge fournie par la présentation. Le HUD impose une largeur maximale aux textes centraux : les captures inspectées ne montrent plus de chevauchement avec les jauges.

## Visuel

Les contours, accessoires et appuis sont entiers dans les captures inspectées. Les trois cycles de marche emploient leurs images réellement distinctes et reviennent à l’idle après relâchement. Les traces donnent un décalage vertical d’appui de 0 sur toutes les frames de marche échantillonnées des deux côtés. Les plans proches des deux décors gardent la piste de combat lisible.

## Limites

Cette campagne utilise Canvas natif, pas Chromium : elle ne valide pas DOM/CSS, service worker, réseau ni livraison des événements par un navigateur. L’attaque est observée à vide, sans prétendre couvrir toute la matrice contact/garde/interruption. L’examen visuel a porté sur sept captures et ne certifie pas la fidélité 1:1. Le dépassement du cache d’arènes seul est encore rejeté sans optimisation ; les deux nouveaux décors n’atteignent pas ce cas.

Détails : `independent-review.json`, `targeted-tests.tap`, `native/report.json`.
