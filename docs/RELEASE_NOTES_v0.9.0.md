# Halo of Flesh v0.9.0 — Parcours joueur, commandes et sauvegardes

## Ce qui change réellement
- Les parcours Descente, Grands Tourments, Rites et Chroniques ont un checkpoint versionné, incluant l'ordre des rencontres, le sujet choisi, les règles et l'endurance. Une interruption en plein combat reprend au début de cette rencontre ; une victoire enregistrée reprend à la suivante. Le bouton Continuer du menu retrouve ce parcours.
- Les 15 Chroniques utilisent leur dossier de référence et non une file d'adversaires arbitraire fournie par l'URL. Les parcours aléatoires associent les adversaires à des lieux de leur source selon le catalogue existant, sans nouvelle certification canonique.
- Les résultats identifient le vainqueur par sujet I/II : perdre contre la même manifestation ne devient plus une victoire. Les compteurs de performance appartiennent au joueur, pas à l'IA victorieuse. Une répétition du callback ne double plus les compteurs. Les rangs de Chronique sont attribués à la fin du parcours et calculés sur toutes ses rencontres gagnées.
- Sauvegardes à schémas contrôlés, copie précédente récupérable, import entièrement validé avant écriture et annulation avec tentative de restauration en cas d'erreur. Les erreurs de stockage sont visibles ; le combat reste accessible sans stockage.
- Remappage des 11 actions pour chacun des deux joueurs ; conflits refusés, zone morte réglable, libellés consultables. La manette garde son attribution malgré des index navigateur clairsemés ; une déconnexion suspend le combat et Start gère la pause/reprise. Les boutons maintenus à la connexion n'injectent pas d'attaque.
- Saut tactile corrigé (`up` ne correspondait pas à l'action attendue), ajout de l'accroupissement, capture du pointeur et relâchement à l'annulation. Dialogues natifs pour pause et commandes, navigation clavier et restauration du focus. Correction du débordement du bouton de lancement sur la sélection desktop.

## Validation
202/202 tests Node et 16/16 assertions UI/Canvas isolées. La navigation HTTP locale est bloquée ; le workflow HTTP séparé doit être consulté pour son état réel. Voir `docs/QA_v0.9.0.md`.

## Statut du produit
Prototype en développement, pas une version déclarée commercialisable. Les compteurs restent 230 manifestations, 75 boss et 123 stages ; ils ne prouvent ni exhaustivité canonique ni qualité artistique finale. Aucune ressource visuelle 1:1 n'a été produite dans cette passe. `npm run release:check` échoue volontairement tant que les conditions de sortie ne sont pas documentées et approuvées.
