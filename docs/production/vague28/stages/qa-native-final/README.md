# Arènes — contrôle natif final Wave28

**109 contrôles réussis, trois scènes, trois captures inspectées.** Le contrôle supplémentaire par rapport au passage initial porte sur l’empreinte avant/après de `src/sprite-system.js`.

Le cache réel de combat est de **75 497 472 octets (72 Mio)** ; le cache des arènes reste à **67 108 864 octets (64 Mio)**. Les scènes sont `final_sacrament`, `scarlet_chamber` et `arcade_hospital_roof`, avec les deux acteurs existants `bom_pyramid_head_129` et `bom_butcher_123`.

Les chargements, images exactes, déplacements ordinaires, parallaxes et retours à l’arrêt passent sous le code final. Les empreintes des huit fichiers de production suivis restent stables durant le passage. Le rapport archive aussi les entrées exactes des deux acteurs, celles des trois arènes et les huit PNG employés.

Les trois captures finales sont identiques octet pour octet aux captures initiales et ont été inspectées à nouveau. Leurs zones de marche, silhouettes, armes et avant-plans restent lisibles. Le dossier initial `../qa-native/` et son harnais sont conservés sans modification.

- `report.json` : contrôles exécutés, budget réel, code, entrées et actifs testés.
- `visual-review.json` : observations finales et comparaison au passage initial.
- `evidence-index.json` : index des empreintes et liens de provenance.
- Les trois PNG : sorties du vrai `FightEngine` à 1280 × 720.

Ce passage utilise Canvas natif. Il ne constitue ni une validation Chromium/HTTP, ni une certification de cadence d’animation, de nouvelles collisions ou de fidélité artistique 1:1.
