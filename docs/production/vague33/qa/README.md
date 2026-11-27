# Recettes HTTP — vague 33

Ces contrôles utilisent le vrai jeu servi par HTTP, ses images natives, ses
commandes et son Dojo. Les captures doivent être inspectées visuellement en plus
des assertions. Ils ne certifient ni fidélité 1:1, ni animation ou timing source.

## Build temporaire

```sh
node scripts/build.mjs --verify --out-dir=/tmp/halo-wave33-build
node scripts/server.mjs 4173 --dist --out-dir=/tmp/halo-wave33-build
```

Sans `--out-dir`, le dossier reste le `dist` habituel. Le build génère toujours
les données du projet avant de copier les mêmes racines distribuées. Le chemin
de sortie est vérifié avant toute génération ou suppression : racines, projet,
parents et descendants source sont refusés ; les chemins canoniques empêchent
les redirections par liens vers ces emplacements. Un dossier externe rempli doit
porter le manifeste du même projet canonique, sinon son contenu reste conservé.
Le serveur exige ce même manifeste pour servir une sortie externe.

Le build et Chromium sont reproductibles et peuvent être temporaires. Les
scripts, les sources et les preuves doivent être conservés dans le dossier
persistant. Toutes les recettes acceptent **`--out=/chemin/absolu`** (alias `--out-dir`) : lorsqu'elles
s'exécutent depuis un cache du projet, cette option dirige directement les
captures et le rapport vers le dossier persistant. Elles refusent de remplacer
une sortie existante.

## Parcours

Avec le `dist` normal et un Chromium Playwright installé :

```sh
node docs/production/vague33/qa/http-poses.mjs --out=tests/http-wave33-characters
node docs/production/vague33/qa/http-stage.mjs --out=tests/http-wave33-stage
node docs/production/vague33/qa/http-calibration.mjs --phase=after --out=tests/http-wave33-calibration
node docs/production/vague33/qa/http-crawling-contact.mjs --expect-aligned --out=tests/http-wave33-contact
node docs/production/vague33/qa/http-crawling-combat.mjs --out=tests/http-wave33-combat
```

Ajouter `--build-dir=/tmp/halo-wave33-build` pour un build externe. La variable
`QA_BROWSER_EXECUTABLE` permet de choisir un véritable Chromium local lorsque
l'exécutable Playwright habituel n'est pas disponible. Les recettes sont
exécutées séquentiellement pour borner la consommation mémoire.

### Poses et conservation

`http-poses.mjs` lit les plans et baselines de `characters` et `characters-root` ;
le nombre de poses n'est pas codé en dur. Chaque pose est déclenchée au clavier
dans les deux orientations après la fin des présentations, puis son retour au
repos est capturé. Une fenêtre de plusieurs ticks est observée pendant son
activité. Pour une fenêtre d'un tick, le premier dessin du coup après le startup
est conservé sans ralentir le moteur ni déplacer son horloge.

Les contrôles portent sur les octets HTTP, les clips statiques, les dimensions,
le miroir, les appuis et le cadrage. Tous les champs historiques des portraits
sont conservés ; les mesures dérivées ajoutées par le générateur sont listées
séparément. Les seules exceptions de frame historique sont les calibrations
déclarées ci-dessous. Les autres champs restent contrôlés intégralement.

### Appui du Numb Body Medium

La preuve persistante `calibration-before/report.json` et ses deux captures
montrent l'ancienne ancre Y = 1. La nouvelle valeur est `903/1024`, correspondant
au bas visible mesuré. `http-calibration.mjs --phase=after` vérifie de nouveau
le SHA du même PNG, la géométrie conservée, les deux orientations et l'écart au
sol inférieur à un pixel.

La nouvelle pose `neutralSpecial` du Medium a les pieds levés et un appui virtuel
au bord inférieur de son canevas. Ce choix de présentation est distingué d'un
contact physique au sol.

### Présentation et contact du Lying Figure rampant

La déclaration `../crawling-calibration.json` conserve les trois frames avant et
après calibration. Leurs PNG sont inchangés. `bodyHeight=2.94` réduit leur échelle
monde par trois, avec ancre X = 0,4 et appuis Y mesurés. L'idle est calibré avec
les deux nouvelles poses pour éviter un changement d'échelle au retour au repos.

Le coup `neutralLight` de cette variante exacte devient bas. Le contrat complet
antérieur est conservé dans `../combat-profiles-before-crawling.json` ; la recette
de combat exige que **seul `level` change de `mid` à `low`**. Portée, dégâts,
startup, activité, récupération et tous les autres champs sont comparés.

`http-crawling-contact.mjs` utilise l'option native HITBOXES et observe les
rectangles réellement peints par le Dojo. Le point reproductible du front
`[60, 496.5]` est lié au SHA exact du PNG. Avec `--expect-aligned`, ce point doit
se trouver dans la vraie zone rouge et l'appui doit rester au sol, dans les deux
sens. Aucune superposition de remplacement n'est créée.

`http-crawling-combat.mjs` approche par les touches normales puis vérifie six
cas : frappe connectée, garde basse et garde debout, chacun dans les deux sens.
Les dégâts, l'érosion sous garde et le retour au repos sont observés dans le
moteur. La garde basse doit réduire les dégâts ; la garde debout doit laisser
passer ce coup bas. Le Dojo n'utilise ni auto-soin ni jauge libre.

L'enveloppe corporelle, la hurtbox et la poussée historiques restent des
adaptations versus. La correction ne revendique aucune géométrie de collision
ou échelle du jeu source. Le diagnostic historique antérieur au redémarrage de
l'environnement est explicitement distingué des nouvelles preuves conservées.

### Galerie Historical Society

`http-stage.mjs` lance normalement la scène. Les deux plans doivent être
réellement décodés, dessinés et maintenus dans le cache. La politique de scène
doit désactiver les anciens effets, dangers, règles de terrain et fatalités
automatiques. Le décor peint ne crée pas de plafond utilisable.

## Portée des résultats

Les contextes Chromium sont neufs et sans service worker. Les mises à jour hors
ligne, les matchs complets et une exécution de la CI distante ne sont pas déduits
de ces contrôles locaux. Le récit Lying Figure illustré reste distinct de son
parcours bloqué par l'adversaire exact non illustré, tel que documenté en vague32.

`validation.json` rassemble uniquement les rapports et captures effectivement
présents après la dernière exécution réussie. Une tentative perdue lors d'un
redémarrage ne remplace pas une preuve persistante.
