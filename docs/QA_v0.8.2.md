# QA v0.8.2 — 12 octobre 2026

## Tests du moteur et construction

`npm test` : **146 tests réussis sur 146**, zéro échec, zéro test ignoré. La base v0.8.1 récupérée et exécutée comptait 109 tests ; 37 tests de régression ont été ajoutés dans `tests/resolution-v082.test.mjs`.

Construction : **16 modules JavaScript, 9 pages HTML et 45 fichiers dans dist**. Les exports de données sont régénérés par les mêmes modules que le jeu.

Régressions principales : interruption et armure ; parade de mêlée et parade à distance ; trajectoire balayée des projectiles ; invulnérabilité et multi-coups ; vitalité bornée et dégâts effectifs ; attribution des afflictions ; double tick périodique létal ; transitions de boss ; arbitrage du chronomètre ; séparation de l'aléatoire cosmétique ; commande mémorisée pendant le gel d'impact ; purge des entrées en pause ; absence de dégâts hors round ; deck calme ; signaux non blessants ; attente des événements refusés ; changement de terrain seulement à l'impact.

## Rendu réel limité

**9 captures** du renderer v0.8.2 ont été produites avec Chromium dans une page en mémoire, sans navigation HTTP et avec des états injectés. Le rapport constate **0 exception JavaScript et 0 requête réseau** pour ce seul parcours. Ce n'est pas une partie jouée ni une validation du DOM des menus.

Les rendus de Brookhaven avec chariot et de St. Amelia avec avertissement de montée d'eau ont été inspectés visuellement. La brume intérieure a été rendue diffuse et les panneaux d'avertissement placés au premier plan. Les neuf captures et les rapports JSON sont livrés dans le paquet QA, pas utilisés comme preuve de fidélité graphique 1:1.

## Navigation non validée

Une tentative de navigation Chromium vers `http://127.0.0.1:4173/` a échoué avec **net::ERR_BLOCKED_BY_ADMINISTRATOR**. Aucun contournement n'a été appliqué. La navigation de l'application, la PWA, le service worker, le mobile physique, les manettes et les longues sessions ne sont pas certifiés dans cette passe. Les anciens rapports restent historiques.

## Reproduction

- Node >=20 : `npm test`, puis `npm start`.
- Sur un poste autorisant le serveur local : installer la dépendance de développement puis `npm run qa:browser`.
- Python Playwright et Chromium installés : `python scripts/canvas-qa-v082.py` produit le contrôle Canvas isolé sans réseau.

## Périmètre et fidélité

230 profils, 75 boss, 123 arènes et 4 600 actions conservés. Les 255 liens de dangers actifs remplacent les 335 liens de la version précédente ; les six profils de signaux historiques restent disponibles pour le diagnostic mais ne sont pas sélectionnés automatiquement. Les compteurs de canon et le marqueur `coverageComplete` sont hérités du catalogue interne et ne prouvent PAS un audit universel de Silent Hill. Les noms descriptifs ou spéculatifs restent à vérifier par média.

Les collisions, délais, enchaînements et interactions sont des adaptations Versus. Les dessins sont procéduraux et simplifiés. Les changements n'ajoutent aucun asset officiel extrait.

L'état GitHub, Vercel, Drive et Library est consigné dans le rapport de livraison après les retours des services, et non déduit de cette QA locale.
