# Silent Hill Combat — Ascension, vues latérales manquantes

Deux vues latérales candidates produites le 20 novembre 2026 pour les profils existants Stinger et The Immolator. Leurs portraits de sélection existent déjà et doivent être conservés. Chaque PNG sélectionné contient un seul corps entier, orienté vers la droite, sur fond réellement transparent.

## Livrables

- `png/ascension_stinger_181.side.png` : 1199 × 1312 pixels, quatre terminaisons de bras en crochet et deux pieds distincts. Le masque est fermé.
- `png/ascension_the_immolator_182.side.png` : 1254 × 1254 pixels, vue de flanc corrigée, deux poings et deux pieds visibles, cage-brasier, flammes, réservoir et tuyaux complets.
- `variants/ascension_the_immolator_182.threequarter.png` : premier résultat conservé, écarté de l’import latéral parce que l’orientation restait trop trois-quarts.
- `delivery.json` : métadonnées `selected[]` utilisables par l’importeur de vague 24, empreintes SHA-256, alpha, calibration proposée, examen visuel et limites.
- `generation-receipts.json`, `prompts/` et `references/` : trois appels réels et leurs références exactes conservés.

## Références et vérification

Les planches promotionnelles originales portent le copyright Konami et proviennent des références de production déjà récupérées. La planche `_09.jfif` représente Stinger et `_10.jfif` représente The Immolator : cette association a été vérifiée visuellement, car un ancien plan de prompt les associait ensemble à Immolator.

Les PNG ont été inspectés visuellement et leurs dimensions, empreintes, canaux alpha et marges mesurés en lecture seule. Aucun pixel n’a été retouché par un script. Aucun pixel d’alpha supérieur ou égal à 32 n’atteint un bord ; de très faibles résidus alpha de valeur 1 existent sur certains bords et restent inchangés. La calibration doit encore être examinée dans le moteur par l’intégrateur.

Les ailes partiellement repliées du Stinger et la géométrie latérale des tuyaux/réservoir de l’Immolator sont des reconstructions à partir de concepts. La fidélité reste `unverified`. Ce lot n’ajoute aucun clip animé et ne constitue pas une extraction du modèle original.

## Reports explicites

The Collector et Stilledalen Stinger conservent leurs portraits existants. Les références retenues ne suffisent pas à établir une géométrie latérale nouvelle avec la précision demandée : le premier est documenté surtout de face et par détails du torse/pieds, le second par de petites vues de sa rencontre régionale. Aucun nouveau corps ni aucune espèce régionale n’ont été inventés ; leurs rôles restent inchangés.

Le contrôle des 26 portraits encore absents dans le registre n’a pas dégagé de candidat immédiatement exploitable : chaque entrée possède un arrêt antérieur ou une limite d’identité/de source intégrale documentée dans les dossiers `art/provenance-art144-*.json` et `art/provenance-art92-*.json`. Aucun de ces refus n’a été relancé et aucune silhouette non attestée n’a été présentée comme un portrait fidèle.
