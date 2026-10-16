# v0.9.1 — Sprites bitmap individuels, première intégration

## Base et objectif

Continuation depuis `main` `17026291e97a1719658ac2fa1eb6f538391c7d68`, après fusion de la PR #3. Arbre source de référence : `f23f2a4d461767db538722de58c186f7619b4092`. Le but est de remplacer les monstres géométriques par des images individuelles, pas de supprimer les feuilles de style de l'interface.

## Ce qui est effectivement dans cette livraison

Deux PNG natifs transparents de 1 536 × 1 024 pixels, récupérés des images déjà produites dans la conversation. Chaque fichier représente un seul sujet dans une seule pose. Les 230 fiches du catalogue sont conservées : 2 ont une image candidate intégrée, 228 n'ont pas d'image acceptée, 0 sont certifiées fidèles 1:1 et 0 ont une animation complète. Les images miroir sont une commodité de présentation, pas deux créations indépendantes.

| Identifiant exact | Image | Statut |
| --- | --- | --- |
| `sh1_air_screamer_001` | Créature volante détaillée | Candidat ; anatomie/proportions SH1 à valider |
| `film_red_pyramid_film_175` | Red Pyramid de type cinématographique | Candidat Film uniquement ; casque, bottes et harnais à corriger/valider |

Le second PNG n'est **pas** affecté aux variantes SH2, lance, Arcade, Book of Memories ou Return to Silent Hill. La représentation officielle licenciée du Red Pyramid Thing original constitue une référence distincte : <https://gecco.co.jp/en/product/misty-day-remains-of-the-judgment-red-pyramid-thing/>. Cette référence ne certifie pas le PNG intégré.

Les anciennes planches contenant plusieurs personnages, les silhouettes schématiques et les Pyramid Head redondants ne sont pas découpés pour gonfler le compteur. Leur exclusion et leur empreinte figurent dans `art/rejected.json`. Il s'agit d'un audit des fichiers récupérés, pas d'une étude canonique exhaustive.

## Rendu et interface

`src/sprite-system.js` remplace les anciens dessins de membres, armes, têtes et silhouettes dans les combats, la sélection, les portraits d'archives, les chroniques et l'accueil. L'asset est choisi par identifiant et source exacts. Le moteur conserve ses règles, ses dimensions physiques de collision, ses sauvegardes et ses parcours v0.9.0 ; aucune statistique n'a été rééquilibrée pour s'adapter à un dessin.

Les PNG sont affichés avec leur véritable alpha, leur ratio d'origine, une ancre au sol et une calibration corporelle explicite. Une image debout n'est pas écrasée, tordue ou tournée pour fabriquer une animation de marche, de coup ou de mort. Les poses manquantes retombent sur la pose statique disponible. **Cela signifie que l'image ne représente pas encore tous les états physiques du combattant**, notamment l'accroupissement et le KO. Le diagnostic peut afficher le nom de la pose à produire.

L'atelier `modules/sprite-workshop.html` expose les 230 identifiants, le filtre de source, les images disponibles, la file des manquants, la recherche, la pagination, les liens de duel miroir et l'export du suivi JSON. Ses compteurs sont dérivés des fichiers réellement référencés.

Les menus conservent leur CSS. Les décors d'arène, les interfaces, les particules, l'audio et les télégraphes de danger restent procéduraux : cette livraison **ne les remplace pas par une collection complète d'illustrations**.

## Chargement et sauvegardes

Un cache partagé déduplique les images, limite les décodeurs simultanés à quatre et évince les images non épinglées par LRU. Le budget de 64 Mio concerne les images décodées conservées, pas un plafond absolu du processus navigateur pendant le décodage. Les images du combat en cours sont épinglées. Les erreurs et les délais d'attente restent contrôlés ; une erreur n'est pas relancée à chaque image du jeu.

Avant un combat normal, le chargement et le décodage sont vérifiés. Avant un nouveau parcours, tous ses identifiants sont contrôlés **avant** de remplacer une sauvegarde ou de compter une tentative. Une modification de sélection pendant le chargement annule le lancement obsolète. La sélection aléatoire normale utilise uniquement les images intégrées.

Les anciens parcours nécessitant des monstres encore sans PNG ne sont plus présentés comme des parcours graphiquement finalisés. Ils restent testables via la case **Diagnostic moteur**, avec des cartouches explicites à la place des images manquantes. Cette autorisation n'est pas mémorisée silencieusement ; pour reprendre un ancien parcours dans ce mode, cocher la case puis utiliser **Reprendre le parcours**. Aucune sauvegarde n'est effacée par l'absence d'un sprite.

Les noms de fichiers incluent leur SHA-256 tronqué. Les deux PNG sont précachés avec les modules nécessaires. La liste du service worker est régénérée depuis le registre. Le jeu utilise des chemins locaux : il ne dépend pas d'un service de génération ou d'un CDN tiers à l'exécution.

## Ajouter les prochaines poses

Le traitement n'appelle aucun modèle de génération. Il importe des PNG/WebP déjà créés et inspectés. Installer Pillow dans l'environnement de travail, puis consulter :

```bash
python scripts/import-sprite.py --help
```

Exemple avec un fichier réellement produit pour l'identifiant indiqué :

```bash
python scripts/import-sprite.py mon-sprite.png \
  --fighter sh1_air_screamer_001 --source sh1 \
  --single-subject-reviewed --anchor-x 0.52 --anchor-y 0.95 \
  --body-height 0.58 --dry-run
```

Un identifiant déjà présent nécessite `--append` ou `--replace`. `--append --pose walk --ticks 5 --loop` ajoute une pose distincte à un clip de marche ; un clip n'est compté animé qu'après au moins deux empreintes d'image différentes. `--replace` réinitialise explicitement les poses de cet identifiant et exige une pose `idle`.

`--body-height` est une calibration **équivalente à la hauteur debout**, rapportée à la hauteur complète du fichier ; ce n'est pas la boîte visible d'un personnage momentanément accroupi. Les ancres doivent être mesurées pour chaque pose. Il reste nécessaire de vérifier le résultat en jeu, de dos et de face, près des murs, en saut et dans toutes les positions de combat.

L'importeur refuse les identifiants/sources incompatibles, les fichiers sans vrai alpha, les dimensions insuffisantes, les images vides ou excessives, les pixels visibles coupés au bord, les conteneurs animés, les liens symboliques de sortie, les répétitions de frames et la réutilisation d'un même bitmap pour un autre profil. La présence d'un seul sujet est une confirmation de revue humaine, **pas une prétendue détection automatique de poster**.

Après import :

```bash
npm run sprites:check
npm test
python -m unittest discover -s tests -p 'test_sprite_import.py' -v
npm run build
```

## Validation locale et limites

- 233/233 tests Node réussis, dont 31 nouveaux contrôles du pipeline raster.
- 15/15 tests de l'importeur réussis. Leurs rectangles synthétiques sont des fixtures techniques ; ils ne sont jamais installés comme art de production.
- 13/13 contrôles Chromium d'interface isolée réussis, 6 captures et aucune exception JavaScript. Les modules sont chargés en mémoire, les URL d'assets et le stockage sont substitués : **ce n'est pas une validation HTTP ou PWA**.
- La navigation HTTP locale est refusée par `ERR_BLOCKED_BY_ADMINISTRATOR`. Aucune politique de navigateur n'a été modifiée. Le workflow GitHub effectue les tests HTTP et hors-ligne indépendamment.

Les scripts `http-qa-v090.mjs` et `http-qa-sprites.mjs` distinguent les tests historiques de parcours (diagnostic explicite et fixture de résultat) des nouveaux tests de chargement de PNG, erreurs, reprise, affichage, sauvegarde et hors-ligne. Leur succès distant doit être vérifié dans la PR.

La fidélité 1:1, les 228 visuels restants, les animations, les angles opposés réellement dessinés, les masques/hitboxes adaptés aux futures animations et le cadrage de toutes les armes au bord des arènes restent à produire ou valider. Aucune partie intégrale de toutes les chroniques, aucun téléphone/manette physique ni aucune autorisation de commercialisation ne sont annoncés.
