# Registre de sources et provenance — v0.6.1

## Principe

Le projet construit un registre de fan-game à partir de manifestations et lieux publiquement documentés. Les descriptions sont reformulées, les comportements sont transposés et les visuels sont produits par code. Aucun fichier média officiel n’est embarqué.

## Périmètre

Silent Hill ; Silent Hill 2 et ses formes distinctes ; Silent Hill 3 ; Silent Hill 4: The Room ; Origins ; Homecoming ; Shattered Memories ; Downpour ; The Arcade ; Book of Memories ; P.T. ; The Short Message ; Silent Hill f ; adaptations cinématographiques dont Return to Silent Hill ; Ascension ; Townfall.

## Hiérarchie de vérification

1. Sources officielles publiques : pages de jeu, bandes-annonces, communiqués, manuels, crédits et descriptions éditeur.
2. Jeu ou média : noms affichés, sous-titres, trophées, menus, dossiers, combats et séquences observables.
3. Guides de sortie, ouvrages et bases secondaires reconnues pour croiser noms, variantes et attaques.
4. Wikis communautaires comme index de travail, pas comme unique preuve lorsqu’une source primaire existe.

## Métadonnées conservées

- `catalogueStatus` : canon rencontré, variante, humain hostile, passif adapté ou set-piece.
- `nameStatus` : officiel, établi, guide/trophée, variante qualifiée ou descriptif.
- `evidenceTier` : niveau de preuve.
- `canonicalBehavior` : comportement source reformulé.
- `adaptation` : traduction en règles de versus.
- `canonicalBasis` : base d’un mouvement ou d’une fatalité.
- `fidelity` : direct, composite ou adaptation.

## Validation d’un profil

1. Confirmer source, identité et statut.
2. Séparer une variante seulement si morphologie, arme, comportement, phase ou fonction diffère réellement.
3. Relever échelle, posture et signes distinctifs sans copier d’asset.
4. Résumer les actions observables.
5. Construire vingt commandes et attribuer un niveau de fidélité à chacune.
6. Réserver `direct-canonical` aux actions attestées.
7. Documenter les composites et adaptations sans les présenter comme officiels.
8. Associer arène, trait, affliction, IA, phases et fatalités cohérentes.
9. Vérifier les références croisées et l’absence d’asset officiel.

## Townfall après sortie

*Silent Hill: Townfall* est traité comme un jeu sorti, et non plus uniquement comme une préversion. St. Amelia, le CRTV, les séquences de combat et d’évasion sont intégrés au dossier. L’éditeur ne publiant pas de bestiaire officiel complet dans les sources utilisées, les noms Lunger, Sorrowful, Fallen et The Weight sont balisés comme établis par guides de sortie ; Widow possède également un ancrage trophée/guide. Cette nomenclature n’est pas présentée comme une liste officielle Konami.

## Silent Hill f

Les mouvements spécifiques ajoutés aux principaux adversaires sont dérivés des attaques observées et décrites : enchaînements de lames, frappes descendantes, cris, flailing attacks, charges, armes rituelles, contres et formes de boss. Les noms anglais affichés dans certaines fiches sont conservés lorsqu’ils servent à identifier une attaque publiée ou communément documentée ; l’animation du prototype reste originale.

## Apparitions passives et humains hostiles

Une apparition passive ou un humain peut être jouable lorsque sa présence, sa morphologie et son rôle sont suffisamment documentés. Son dossier conserve le statut d’adaptation. L’absence de mouvement directement attesté n’est jamais masquée par un faux label canonique.

## Films

Les variantes cinématographiques sont séparées lorsque silhouette, comportement ou mise en scène diffère. Chaque entrée conserve son média exact.

## Systèmes originaux

Rites, statistiques, IA, frame data, routes d’annulation, phases de boss, fatalités et équilibre sont des systèmes de fan-game. Ils s’appuient sur les comportements et symboles de la source mais ne sont pas revendiqués comme mécaniques canoniques.

## Visuels et audio

Portraits, combattants, stages, effets, menus et audio sont procéduraux ou originaux. Les captures QA ne contiennent aucun sprite, modèle, son, texture ou décor extrait.
