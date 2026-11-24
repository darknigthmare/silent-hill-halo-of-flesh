# Vague 27 — intégration des projectiles raster

Trois PNG transparents natifs sont raccordés à **trois profils exacts et dix slots existants**. Ils restent des candidats visuels statiques, avec `fidelity: unverified`. Les descriptions documentaires établissent le type d'attaque ; aucune capture de l'attaque d'origine suffisamment précise n'a été retrouvée pour certifier la texture, la forme, les couleurs exactes ou l'animation à l'identique.

## Raccordements explicites

| Profil et édition | Effet | Slots autorisés | Références du registre |
| --- | --- | --- | --- |
| `sh1_incubator_018` · `sh1` | Décharge bleue | `neutralSpecial`, `super`, `desperation` | `CL_SH1_BOSSES` |
| `sh2_lying_figure_020` · `sh2` | Jet thoracique jaunâtre | `neutralSpecial`, `super`, `desperation` | `CL_SH2_ENEMIES`, `CL_SH2_CREATURES` |
| `sh3_god_050` · `sh3` | Flamme au sol | `neutralSpecial`, `downSpecial`, `super`, `desperation` | `CL_SH3_BOSSES`, `CL_SH3_CREATURES` |

Les slots désignent les actions versus déjà présentes. Leur présence au tableau ne certifie pas que ces trois attaques possèdent des variantes « super » ou « desperation » dans les jeux d'origine. Aucun raccordement par famille ou par ressemblance ne transfère ces images à une autre édition, à la forme rampante du Lying Figure, à Incubus ou à un autre combattant.

Les fichiers d'origine, dimensions, tailles et SHA-256 sont conservés dans `generation-receipts.json` et dans `src/projectile-bitmap-manifest.js`. Les trois PNG font 1536 × 1024 pixels, possèdent un canal alpha réel et sont utilisés sans réécriture de leurs octets. Le cadrage de rendu est calculé à partir de leurs bornes alpha connectées, puis déclaré et vérifié dans le manifeste.

## Comportement du moteur

`src/projectile-bitmaps.js` choisit une image seulement pour le triplet exact combattant/édition/slot. Il utilise un cache LRU indépendant limité à 32 Mio et deux chargements simultanés. Les caches et réservations des combattants et des décors restent indépendants. Les données invalides, les images absentes et les erreurs de décodage ou de dessin laissent fonctionner le rendu procédural existant. Un échec de chargement ne provoque pas une nouvelle requête à chaque image ; la préparation explicite du prochain combat peut retenter le chargement.

Le moteur fournit la position, le rayon et la vitesse du projectile existant. Le dessin conserve le rapport d'aspect et suit le signe de la vitesse émise, même si le combattant se retourne ensuite. Aucune trajectoire, collision, durée de vie, ressource ou valeur de dégâts n'est modifiée.

Pour God, la ligne lumineuse de la flamme générée se situe au-dessus du halo transparent. Une baseline native normalisée de `0.735` fixe cette ligne au sol réel `groundY + radius` (594 dans les scènes de contrôle). Le halo peut dépasser sous cette ligne ; il n'est pas utilisé comme point de contact. Ce réglage est une calibration du PNG candidat, pas une mesure du jeu d'origine.

## Validation technique

Le constructeur `scripts/build-projectile-bitmaps.mjs` vérifie avant toute écriture : l'identité et l'édition, les slots de projectile activés, l'accord entre ancrage au sol et politique de combat existante, les références connues, le chemin versionné, le SHA-256, la taille, les dimensions, le décodage PNG statique, l'alpha et les bornes de cadrage. Il met à jour uniquement le bloc dédié du service worker. `build-sprites.mjs` l'appelle avant le constructeur des décors, dont la révision de cache inclut maintenant le manifeste projectile. Les anciennes fixtures sans ce manifeste restent acceptées.

Commande de vérification exécutée le 24 novembre 2026 :

```sh
node --test tests/projectile-bitmaps.test.mjs tests/stage-bitmap-build.test.mjs tests/engine-smoke.test.mjs tests/service-worker-recovery.test.mjs
```

**46 tests réussis, aucun échec** : 8 tests dédiés, 21 tests moteur, 6 tests constructeur de décors et 11 tests de récupération du service worker. Ils couvrent notamment l'absence de transfert entre profils, le budget mémoire, le retournement de l'émetteur, la baseline au sol, les échecs de décodage/dessin, le maintien du fallback, le cache hors ligne et les fixtures historiques. `git diff --check` est également passé.

## Contrôle visuel natif

`qa-native.mjs` exécute le vrai `FightEngine` avec les callbacks clavier d'`InputState`, attend la fin normale de l'introduction, déclenche `neutralSpecial`, attend l'émission, avance cinq ticks puis dessine. Aucun état de combattant ou de projectile n'est injecté. Chaque effet est contrôlé dans les deux emplacements joueurs.

Le rapport `qa-native-final/report.json` atteste **90 contrôles réussis et 6 captures de 1280 × 720**. Les six captures ont été relues visuellement : éclair lisible, jet thoracique orienté vers l'adversaire, flamme calée au sol dans les deux sens. La vérification constate le dessin du chemin PNG exact, l'orientation liée à la vitesse, le respect du budget, et l'absence de changement de position, de durée de vie et de santé pendant le dessin. Les SHA-256 des modules et manifestes contrôlés figurent dans le rapport afin de borner cette preuve à sa révision.

Le premier passage natif a échoué sur le décodage d'un ancien PNG de combattant par le backend Canvas ; son rapport `qa-native/report.json` est conservé. Le passage abouti adapte seulement l'encodage PNG en mémoire avec Sharp, vérifie l'égalité stricte des pixels RGBA avant/après, puis transmet ces mêmes pixels au backend. Les fichiers sources restent identiques. Cette adaptation ne constitue pas un changement du chemin de chargement dans le navigateur.

Ce contrôle natif n'est ni un test HTTP ni une exécution Chromium. Le lancement Chromium local a été bloqué avant la page par `process_singleton socket(): Operation not permitted` ; la vérification navigateur relève du workflow CI existant. Les six scènes couvrent l'émission normale et le dessin, pas l'ensemble des interactions coup/garde de tous les slots. Aucun clip animé ni certificat de fidélité visuelle 1:1 n'est produit par cette livraison.
