# Vague 23 — préparation de QA ciblée

## Décision

La voie disponible est le **rendu natif du vrai FightEngine**, via les deux harnesses de la vague 22. Leur chargement des modules de production et des PNG est réutilisable sans modifier les sources. Les sorties doivent aller dans un dossier neuf et être limitées aux IDs réellement importés dans cette vague.

Le contrôle d'environnement est dans [environment-probe.json](environment-probe.json). Il **n'est pas un test du produit** : aucun écran du jeu, serveur HTTP ou duel n'a été lancé pendant cette préparation.

## État constaté

| Élément | Résultat |
|---|---|
| Node fourni par le runtime | Disponible via `CODEX_PRIMARY_RUNTIME_NODE` |
| `@napi-rs/canvas` | Version 0.1.100 ; création et encodage PNG réussis sur un canevas de contrôle 8×8 |
| `sharp` | Version 0.35.5 ; décodage RGBA du contrôle réussi |
| `playwright` / `playwright-core` | Version 1.62.1 |
| Chromium système | Lanceur `/usr/bin/chromium` et binaire `/usr/lib/chromium/chromium` présents |
| Chromium attendu par Playwright | Absent à `/home/agent/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome` |
| Lancement Chromium système | Échec avant ouverture de page : `socket() failed: Operation not permitted (1)` |
| Téléchargement / installation | Aucun |
| Suite de base / test produit | Aucun |

Un seul lancement ordinaire du navigateur système a été tenté, sans URL produit. L'erreur et son contexte sont conservés. Aucune tentative de contournement des restrictions de sockets n'a été effectuée.

La collecte initiale de version de `sharp` utilisait son sous-chemin `package.json`, masqué par les exports du paquet. Le rapport conserve la correction : le module se charge et sa version est disponible dans `sharp.versions.sharp`. Aucun second lancement de Chromium n'a été nécessaire.

## Harnesses applicables

### Stages

Chemin : `docs/production/vague22/qa-stages-native.mjs`.

Le harness :

- résout les IDs exacts des stages et prépare leurs assets via les fonctions du moteur ;
- exécute réellement `FightEngine.update()` et `render()` ;
- observe les appels natifs `drawImage`, les deux plans déclarés et leur parallaxe pendant des entrées de mouvement ;
- sauvegarde le rendu 1280×720 avec deux combattants déjà intégrés ;
- vérifie les empreintes des PNG et l'absence de modification des sources.

Conditions : le décor doit avoir **deux plans indépendants**, un fond statique et un premier plan parallaxe, conformément au contrat actuel. Les combattants de référence sont `bom_pyramid_head_129` et `bom_butcher_123`.

Commande à exécuter depuis la racine du dépôt, **après remplacement de `ID_STAGE` par un ID importé** :

```bash
HALO_QA_ROOT="$PWD" "$CODEX_PRIMARY_RUNTIME_NODE" --expose-gc \
  docs/production/vague22/qa-stages-native.mjs \
  --stages=ID_STAGE \
  --out=docs/production/vague23/qa-native/cases/ID_STAGE
```

### Personnages

Chemin : `docs/production/vague22/qa-characters-native.mjs`.

Le harness vérifie la séparation entre portrait de sélection et sprite de combat. Pour un rôle autorisé au combat, il exécute le vrai duel des deux côtés, l'idle, les entrées de mouvement ou leur rejet pour un rôle stationnaire, puis le retour à l'idle. S'il existe un clip walk ou guard, son chemin propre est vérifié. Pour les rôles déjà exclus du combat, seules les vues du renderer de l'atelier sont produites ; aucun rôle n'est changé.

Conditions :

- l'ID doit exister dans la baseline `docs/production/vague22/scope-baseline.json` ;
- son portrait doit être inchangé par rapport à cette baseline ;
- les assets et le stage choisis doivent déjà figurer dans les manifests reconstruits ;
- la baseline inspectée contient **204 entrées de sprites** : cela ne garantit pas la présence d'un futur nouvel ID ;
- le rôle runtime existant détermine si le contrôle est un duel ou un aperçu de référence.

Commande, **après remplacement de `ID_PERSONNAGE` par un ID importé et vérifié dans la baseline** :

```bash
HALO_QA_ROOT="$PWD" "$CODEX_PRIMARY_RUNTIME_NODE" --expose-gc \
  docs/production/vague22/qa-characters-native.mjs \
  --ids=ID_PERSONNAGE \
  --stages=hazel_subway \
  --out=docs/production/vague23/qa-native/cases/ID_PERSONNAGE
```

Exécuter un personnage ou un stage par processus limite le pic mémoire et isole les preuves. Ne pas remplacer les captures déjà produites : chaque nouvelle tentative utilise un chemin neuf. Les rapports gardent le label de leur harness vague 22 ; leur dossier de sortie, l'ID testé, les empreintes des entrées et le hash du harness établissent la provenance de la nouvelle exécution.

## Scripts HTTP existants

Les scripts `scripts/http-qa*.mjs` emploient `playwright-core` et, pour le navigateur, `QA_BROWSER_EXECUTABLE`. Cette option pourrait désigner `/usr/bin/chromium`, mais le lancement ordinaire échoue actuellement au niveau système.

En outre :

- `http-qa-stage-bitmaps.mjs` injecte des fixtures 4×4 et un manifest de test pour éprouver le chargement ; il ne prouve pas la présence visuelle des nouveaux décors ;
- `http-qa-wave17.mjs` observe les vrais assets, mais cible des IDs et contrats de la vague 17 ;
- plusieurs scripts ont un dossier de sortie fixe et des cas historiques ; les relancer ne constitue pas une validation ciblée de la vague 23.

Aucun de ces scripts HTTP n'a été lancé dans cette préparation.

## Portée exacte des futurs résultats natifs

Une réussite démontrera les assets réellement sélectionnés et dessinés par le moteur dans le contexte natif testé. Elle ne démontrera pas :

- le rendu DOM/CSS, la distribution HTTP, le service worker ou les entrées clavier d'un navigateur ;
- toutes les attaques, collisions, fatalités et transitions non exercées ;
- la fidélité artistique 1:1 aux références ;
- une animation complète lorsqu'une image idle statique est utilisée pendant le déplacement.

Une inspection visuelle des PNG de capture reste nécessaire pour la silhouette complète, l'échelle, les pieds, les appendices, les armes et la lisibilité du décor. Aucun contrôle produit n'est revendiqué avant l'exécution sur les IDs définitifs.
