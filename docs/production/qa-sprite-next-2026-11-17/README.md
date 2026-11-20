# Vérification visuelle des sprites — 17 novembre 2026

**175 contrôles réussis, zéro échec.** Le moteur réel `FightEngine` a exécuté dix duels d’attente de 120 ticks, avec permutation des côtés. Dix captures finales ont été inspectées et dix-huit portraits ont été rendus.

| Lot | Contrôles | Duels | Portraits | Rapport |
|---|---:|---:|---:|---|
| Récupération : Mama, Split Worm, Fighter, Pyramid Head, Brawler, Agile | 111 | 6 | 12 | [Rapport](recovered/report.json) |
| Nouveaux sprites : Eddie, Missionary, Double Head Arcade | 64 | 4 | 6 | [Rapport](new/report.json) |

Les empreintes SHA-256 des PNG transportés par HTTP correspondent aux fichiers du registre. Les portraits gardent leur image de sélection ; les duels dessinent exclusivement les images de combat. Les corps et extrémités sont cadrés entièrement des deux côtés. Aucune correction d’ancre n’est nécessaire pour les nouvelles images : l’écart mesuré au sol est d’environ 2,07 px pour Eddie, 0,39 px pour Missionary et 0,00 px pour Double Head au rendu 1280 × 720.

Les captures sont des rendus Canvas natifs du moteur avec introductions et simulation normales. **Ce ne sont pas des captures de navigateur.** La restriction Chromium documentée précédemment n’a pas été retentée. DOM, CSS, service worker, entrées de navigateur, attaques, collisions et animations complètes ne sont pas couverts par ce protocole. La fidélité visuelle 1:1 et les proportions originales restent non certifiées.

[Résumé machine](summary.json)
