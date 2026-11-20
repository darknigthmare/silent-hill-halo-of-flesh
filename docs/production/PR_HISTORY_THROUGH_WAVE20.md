## Vague 20 — uniquement les stages manquants

Le jeu disposait de 32 arènes bitmap sur 123. Cette passe ajoute **11 lieux avec leurs deux plans indépendants**, soit **22 PNG natifs**, puis vérifie leur composition et leur parallaxe dans le moteur existant. La couverture atteint **43/123** ; il reste **80 stages sans bitmap**, dont 65 non bloqués et 15 bloqués par leur fiche.

Publication : [`2c16796`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/2c16796e6b99bb71f79fdfcf45b9cd2a84838581).  
[Rapport complet et captures](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2c16796e6b99bb71f79fdfcf45b9cd2a84838581/docs/production/vague20/README.md) · [Audit et inventaire restant](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2c16796e6b99bb71f79fdfcf45b9cd2a84838581/docs/production/vague20/final-audit.json).

### Décors ajoutés

| Œuvre | Stages et scènes retenues |
| --- | --- |
| Silent Hill 3 | `sewers` : passerelle après le sèche-cheveux ; `lakeside_sh3` : Happy Carousel avant transition ; `nightmare_hospital_sh3` : réserve au miroir de Brookhaven Otherworld. |
| Silent Hill f | `dark_shrine` : parvis fermé de Shrine Vault ; `school_shf` : bureau du personnel ; `hinako_home` : corridor de Residence I ; `corrupted_ebisugaoka` : parvis Shimizu, Part 5. |
| Silent Hill 4 | `hospital_world` : couloir du deuxième étage, chambres fermées. |
| Silent Hill: Origins | `artaud_theater` : scène normale éclairée avec décor peint de forêt. |
| Silent Hill: Downpour | `devils_pit` : roues à eau vues de la passerelle sèche ; `overlook` : Block A / Cells A2 avant la vision inondée. |

Chaque lieu possède un fond opaque et un premier plan transparent. Les fichiers conservent leurs pixels natifs, dimensions et SHA ; les cadres font 1672 × 941 ou 1671 × 941. Le service worker reçoit les chemins des nouveaux assets et la révision de cache générée. Les anciens descripteurs et leurs variantes restent identiques.

### Contrôles et portée

- **137 tests ciblés réussis**, aucun échec : stages et rendu Canvas.
- **356 contrôles dans le vrai FightEngine avec Canvas natif** : onze duels, onze captures, intro normale, entrées gauche/droite via les callbacks enregistrés, parallaxe réelle et retour à l'idle. Aucun état d'acteur injecté.
- **Onze captures inspectées visuellement** : appuis, transparence, zone centrale, plans proches et HUD.
- **Build source `--verify-only` réussi** ; pas de `dist` local annoncé comme construit.
- **15 fichiers protégés identiques**, notamment roster, sprites, movesets, moteur, règles des stages et classeur.
- **946 paires de stages actifs et 1 035 paires de pièces stockées admises** dans le budget existant de 64 Mio.
- GitHub Actions sur ce commit : [QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44525987478) et [HTTP browser QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44525987451) **en cours** au relevé après publication ; aucun succès nouveau n'est encore revendiqué.

Le contrôle Canvas natif ne vaut pas un test Chromium/HTTP. Les captures désactivent le terrain et les dangers ; leur libellé neutre « BÉTON SEC » vient de cette configuration. Aucun nouveau danger, clip animé, timing source ou certificat de fidélité 1:1/UHD n'est annoncé.

### Périmètre et reports

Les combattants restent à **204 portraits, 135 vues latérales candidates et six clips animés**. Le classeur demeure identique à la vague 19, dont le dernier relevé de décors était 32 ; les 43 arènes courantes sont suivies dans le rapport spécifique de la vague 20.

Trois cibles restent reportées après vérification des sources : `nightmare_mall` et `apartment_roof` faute de vue architecturale suffisante ; `shimizu_residence` pour le conflit entre la fiche Residence I et la scène du Yellowed Calendar documentée en Residence II. Les sources, prompts, empreintes et décisions sont joints au dossier.

### Historique préservé

La description complète précédente des vagues 18/19 et leurs livraisons est conservée dans [PR_HISTORY_THROUGH_WAVE19.md](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2c16796e6b99bb71f79fdfcf45b9cd2a84838581/docs/production/PR_HISTORY_THROUGH_WAVE19.md). Leurs deux workflows avaient réussi sur la base `2db0c78` ; ces résultats ne sont pas attribués au nouveau commit.

PR conservée ouverte et en brouillon. Aucune fusion ni mise en production.
