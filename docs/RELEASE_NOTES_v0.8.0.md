# Silent Hill: Halo of Flesh — v0.8.0 « Living Stage Cinematography »

Cette version complète la v0.7.0 par **la mise en scène physique des dangers et de la transformation** plutôt que la seule signalétique abstraite.

## Modifications vérifiables

- 22 familles d'événements dotées d'objets et transformations procéduraux distincts.
- 123 stages reliés à leur plan de mise en scène, avec ancrage stable par lieu et code de fidélité.
- Animation des événements actifs pendant le combat : train, chariot médical, casiers, miroirs, CRTV, racines, eau, glace, cendres, manège, cloche, rituels, effondrements, etc.
- Silhouettes physiques synchronisées aux formes de collision des dangers, au premier plan du décor et derrière les combattants.
- IA défensive réagissant uniquement aux événements télégraphiés et lisibles par un joueur, selon le niveau de difficulté.
- RNG du gameplay découplé du rendu des secousses de caméra : résultat identique à nombre d'images affichées différent.
- Archive enrichie : fiches de chorégraphies et vignette d'événement, fidélité canon/mise en scène séparée.
- Cache PWA précharge le nouveau module pour maintenir le fonctionnement hors ligne.

## Périmètre préservé

230 manifestations, 75 boss, 123 arènes, 4 600 mouvements (447 directs, 3 694 composites, 459 adaptations), 29 dangers, 374 pistes d'animation, 446 événements distribués, 15 bascules Otherworld, 14 terrains.

## QA

Voir `tests/stage-cinematics.test.mjs`, `docs/STAGE_CINEMATICS_v0.8.0.md` et le rapport de release. Ne pas assimiler « tests réussis » à une certification qualité commerciale, laquelle exigerait tests manette, mobile et longues sessions.
