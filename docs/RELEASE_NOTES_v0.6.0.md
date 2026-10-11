# SILENT HILL: HALO OF FLESH — Notes de version 0.6.0

## Contextual Doctrine & Lore Integrity

La v0.6.0 corrige le principal écart de la version précédente : le projet annonçait une doctrine « complète » alors que le runtime exposait seize actions par manifestation. La nouvelle version aligne données, moteur, interface, documentation et tests sur **vingt commandes réellement jouables pour chacun des 230 profils**.

## Totaux

- 230 manifestations jouables.
- 75 boss.
- 16 packs média audités.
- 123 arènes.
- 15 Chroniques.
- 4 600 mouvements.
- 447 actions directement attestées.
- 3 694 composites lore-friendly.
- 459 adaptations versus.
- 460 fatalités de combattant.
- 123 fatalités d’arène.
- 374 animations d’arène.
- 150 transitions de boss.

## Quatre commandes contextuelles

### Projection arrière — `← + T`

- changement de côté ;
- chute dure ;
- trajectoire et nom adaptés à la morphologie ;
- statistiques dédiées.

### Riposte d’esquive — `ESQUIVE + L`

- disponible uniquement pendant la sortie d’esquive ;
- courte invulnérabilité ;
- annulations limitées ;
- identité différente par famille de manifestation.

### Contre de garde parfaite — `P-GUARD + H`

- fenêtre ouverte par une garde parfaite ;
- rupture d’armure ;
- restitution de l’initiative ;
- impossible à déclencher hors condition.

### Reversal de relevée — `RELEVÉE + S`

- fenêtre après projection ou knockdown ;
- invulnérabilité courte ;
- rebond au sol ;
- comportement et présentation propres à la manifestation.

## Fidélité et traçabilité

Chaque nouvelle commande est classée comme :

- directement attestée ;
- composite lore-friendly ;
- adaptation versus.

Les présences non combattues, set-pieces et formes passives restent explicitement signalés. Le projet ne présente pas une animation inventée comme canonique. Les appellations de *Townfall* issues de guides post-sortie sont conservées avec leur statut de nom visible.

## Interface

- Sujet I / Sujet II remplace les libellés génériques de joueurs.
- Navigation Retour à la Brume harmonisée.
- Menu CRTV/radio localisé.
- Salle d’Observation enrichie avec les compteurs de fenêtres contextuelles.
- HUD affichant la commande disponible au moment exact.
- Pause listant les vingt actions de chaque sujet.
- Archives mobiles corrigées pour conserver tous les onglets dans la largeur utile.

## QA

- 54 tests automatisés.
- 54 réussites.
- 11 parcours Chromium.
- 11 assertions navigateur réussies.
- 0 erreur console.
- 0 avertissement console.
- 0 exception JavaScript.
- 0 requête échouée.
- 0 débordement détecté.

## Limites

- La fidélité visuelle image par image reste une production artistique distincte.
- Les composites et adaptations sont des transpositions de fan-game, pas des animations officielles.
- La couverture complète reste limitée aux seize packs et aux règles d’inclusion documentées.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Le tactile vise principalement Sujet I.
- Tous les sons distribués sont procéduraux.
