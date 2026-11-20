# Vague 21 — décors manquants et bible documentaire

**Douze décors auparavant absents sont intégrés avec deux plans distincts chacun : 24 PNG, soit 28 001 765 octets.** La couverture passe de **43 à 55 stages actifs sur 123**. Il reste **68 stages sans décor actif : 53 non bloqués et 15 bloqués par leur fiche de référence**. Les comptes proviennent de [l’intégration](integration.json) et de [l’audit final](final-audit.json).

Chaque paire comprend un fond opaque et un premier plan avec transparence réelle. Ce sont des images statiques adaptées au duel, avec parallaxe dans le moteur existant. **Aucun combattant, portrait, moveset ou nouveau clip animé n’est ajouté.** Les images restent des candidats de fidélité non vérifiée ; aucune certification 1:1 ou UHD n’est revendiquée. Le [manifeste synthétique](delivery.json) relie les fichiers, empreintes et preuves détaillées des [groupes A](group-a/delivery.json) et [B](group-b/delivery.json).

## Douze lieux précisément délimités

Les liens de la dernière colonne ouvrent les captures du moteur du projet, avec ses combattants existants et son HUD. Ce ne sont ni des captures natives des jeux sources, ni des captures de navigateur.

| Stage | Œuvre et sous-lieu retenu | Capture du projet |
|---|---|---|
| `old_silent_hill` | SH1 : maison à la niche de Levin Street, façade et bande de rue immédiate ; neige et brouillard | [Voir](qa-native/old_silent_hill.png) |
| `hospital_nightmare` | SH1 : chambre 204 d’Alchemilla Otherworld, livrée sans Bloodsucker | [Voir](qa-native/hospital_nightmare.png) |
| `sewer_resort` | SH1 : baie de conduites du cul-de-sac sud au niveau supérieur des égouts vers Resort Area | [Voir](qa-native/sewer_resort.png) |
| `south_vale` | SH2 original : Neely’s Bar, angle nord-est Neely/Sanders, South Vale Est | [Voir](qa-native/south_vale.png) |
| `hotel_otherworld` | SH2 original : couloir après les portes aux œufs et le duo Pyramid Head, avant l’escalier final, après la cassette | [Voir](qa-native/hotel_otherworld.png) |
| `prison_meat_locker` | SH2 original : seconde chambre froide du combat Eddie, à la fin du Labyrinthe | [Voir](qa-native/prison_meat_locker.png) |
| `grand_hotel` | Homecoming : atrium Otherworld sans Sepulcher | [Voir](qa-native/grand_hotel.png) |
| `town_hall_hc` | Homecoming : salle publique du premier passage normal | [Voir](qa-native/town_hall_hc.png) |
| `shepherd_house_hc` | Homecoming : grenier normal avant transformation | [Voir](qa-native/shepherd_house_hc.png) |
| `centennial_building` | Downpour : salle principale de la bibliothèque normale | [Voir](qa-native/centennial_building.png) |
| `st_marias` | Downpour : chapelle normale devant la grille fermée de l’autel | [Voir](qa-native/st_marias.png) |
| `shepherds_glen` | Homecoming : trottoir du panneau de disparus de la rencontre avec Elle, sans personnage | [Voir](qa-native/shepherds_glen.png) |

Pour **Grand Hotel**, l’image représente bien l’atrium Otherworld sans Sepulcher. La politique moteur existante `worldState: fixed-normal` reste inchangée ; le libellé « ATRIUM SANS SEPULCHER » et le `locationScope` définissent le périmètre retenu. Cette vague n’ajoute aucune transformation du moteur. Les précisions de provenance et de cadrage figurent dans le [dossier B](group-b/README.md).

`police_station_hc` est reporté : les vues inspectées ne documentaient pas suffisamment une architecture de cellule. Il a été remplacé par le lieu sourcé `shepherds_glen`. Nightmare Mall et Daisy Villa n’ont pas été retentés sans nouvelle preuve. Les [décisions de sélection](selection-decisions.json) conservent ces raisons.

## Vérifications obtenues

| Preuve | Résultat et portée |
|---|---|
| [Tests ciblés](stage-tests.txt) | **137 tests réussis, 0 échec**, aucun test annulé ou ignoré |
| [Vérification du build](build-verification-receipt.json) et [journal](build-verification.log) | **`--verify-only` réussi** : 45 fichiers JS et 10 HTML vérifiés, sans création de `dist` ; les dix JSON resynchronisés gardent un contenu identique |
| [Audit final](final-audit.json) | **45 contrôles réussis** : 15 fichiers protégés inchangés, intégration des seuls stages prévus, PNG conservés et budget du cache existant respecté |
| [QA native consolidée](qa-native/report.json) | **12 cas, 12 captures, 552 exécutions de contrôle**, 26 assets uniques vérifiés — 24 décors et 2 sprites existants — et 7 fichiers source suivis inchangés |
| [Revue visuelle A](group-a/native-visual-review.json) et [revue B](group-b/native-visual-review.json) | **6 + 6 captures inspectées**, sans défaut bloquant d’appui, cadrage, transparence, lisibilité ou HUD |

Les 552 contrôles comprennent les assertions communes répétées dans chaque cas ; ce nombre ne désigne pas 552 assertions distinctes. Le harness utilise réellement `FightEngine.update/render`, Canvas natif et les callbacks normaux d’`InputState` : introduction, idle, déplacement à droite puis à gauche et retour au repos. Il contrôle les deux plans effectivement peints, leur parallaxe selon le mouvement et l’absence de portrait de sélection utilisé comme sprite de combat. Aucun état, position ou temps d’acteur n’est injecté.

**`browserTest: false` et `httpTest: false`.** Cette campagne ne valide pas Chromium, DOM/CSS, service worker ou réception réelle des touches par un navigateur. Elle n’exerce pas attaque, contact, garde, finisher ou danger de stage. Terrain, directeur, hazards et changements de monde sont neutralisés dans ce harness : son texte de terrain n’atteste pas le matériau original de la salle.

## Mémoire et historique des tentatives

Les onze premiers cas retenus utilisent `--max-old-space-size=128` et le harness avec traces RSS. Seul `shepherds_glen` utilise la variante avec `--expose-gc --max-old-space-size=64 --max-semi-space-size=1`, collecte après décodage Sharp et avant préflight natif, puis traces séparées de préflight, création du moteur, introduction et rendu. Les SHA256, flags et versions propres à ces deux harness sont conservés dans le [rapport consolidé](qa-native/report.json). Les onze cas déjà réussis n’ont pas été rejoués.

Trois interruptions restent enregistrées séparément : campagne initiale groupée avec code 137 ; premier essai unitaire Old Silent Hill avec SIGKILL après 1 046 ms ; essai Shepherd’s Glen à 128 Mio avec SIGKILL après 1 520 ms. Elles ne sont jamais comptées comme réussies. Le diagnostic intermédiaire Old Silent Hill, réussi avec 46 contrôles, est également **exclu du total final de 552**. L’[historique détaillé](qa-native/attempt-history.json) préserve les circonstances et les archives. Les conditions de tas, collecte, attachement et charge concurrente ayant changé, aucune cause unique du SIGKILL n’est affirmée.

Les PNG de production n’ont pas été réencodés : l’adaptation au décodeur natif se fait uniquement en mémoire, avec comparaison des pixels RGBA avant/après. Les douze captures finales sont liées à celles des cas et vérifiées par SHA256. Le [script d’agrégation](qa-native/aggregate-successful-cases.py) peut reconstruire le rapport à partir des preuves existantes sans rejouer le moteur.

## Bible et classeur complémentaire

Le [corpus documentaire](../franchise-corpus.json) compte **66 notices**, avec **41 absences dans l’index initial** conservées comme historique. Ces notices documentaires ne créent aucun nouvel identifiant de source runtime. Le [classeur SILENT_HILL_CORPUS_BIBLE.xlsx](../SILENT_HILL_CORPUS_BIBLE.xlsx) contient deux feuilles, **Corpus** et **Stages** : 66 notices et le registre des 123 stages, avec 55 actifs, 53 absents non bloqués et 15 bloqués.

Le fichier fait **47 348 octets**. Sa [vérification](workbook/workbook-verification.json) atteste deux tables filtrables, sept formules, volets figés, réouverture et recalcul, ainsi que trois rendus représentatifs inspectés. Le classeur historique des movesets reste inchangé. La revue visuelle du compagnon porte sur les plages enregistrées ; elle ne prétend pas constituer une session native Excel ni une inspection individuelle de chaque cellule. Les [preuves d’intégration du corpus](corpus-integration.json) et sa [revue documentaire](corpus-audit/integration-review.json) restent distinctes de la QA des décors.

## Portée des résultats distants

Les deux workflows de la **base publiée `2c16796e6b99bb71f79fdfcf45b9cd2a84838581`** ont été relevés réussis le 19 novembre 2026 : [QA générale, run 44525987478](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44525987478) et [HTTP browser QA, run 44525987451](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44525987451). Ce constat concerne exclusivement cette base ; il ne valide pas un futur commit de la vague 21.
