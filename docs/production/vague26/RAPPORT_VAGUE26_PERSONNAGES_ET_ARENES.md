# Vague 26 — trois profils latéraux et quatre arènes

Date : 20 novembre 2026. Reprise de la PR #6 depuis `8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb`, arbre `6a91576644a19bd0fb2ac23278e8584071e61dca`.

Cette passe remplit la vue latérale jusque-là absente de **The Collector**, remplace les anciennes vues de **Stalker** et du **Creeper Swarm du film de 2006**, et ajoute **quatre compositions de décor**. Les trois personnages étaient déjà présents dans le roster. Collector reste une référence hors duel ; les deux autres conservent leurs permissions existantes.

Les PNG sélectionnés sont les octets natifs issus de la génération. Leurs dimensions, empreintes, calibrations, références et reçus d'import sont conservés dans les [livraisons](#preuves-principales). Les anciens portraits et les clips antérieurs sont préservés. Ces nouvelles vues sont **statiques** et restent des **candidates de fidélité non vérifiée**.

## Couverture après intégration

| Mesure | Avant | Après |
| --- | ---: | ---: |
| Profils du roster | 230 | 230 |
| Portraits de sélection disponibles | 204 | 204 |
| Vues latérales candidates | 187 | **190** |
| Anciennes vues à reprendre | 6 | **4** |
| Vues de combat absentes | 37 | **36** |
| Sélections et vues latérales séparées | 187 | **190** |
| Clips réellement animés | 6 | **6** |
| Profils certifiés fidèles à 1:1 | 0 | **0** |
| Arènes avec composition active | 75 / 123 | **79 / 123** |
| Arènes sans composition active | 48 | **44** |

Les 26 portraits manquants sont compris dans les profils sans vue de combat ; ils ne s'ajoutent pas aux 40 dossiers restants. Le compteur de vues latérales inclut les références d'atelier hors duel. Les données exactes figurent dans [l'audit final](final-audit.json) et le [registre des dossiers restants](remaining-evidence.json).

## Personnages

### The Collector — Silent Hill: Ascension

Identifiant : `ascension_the_collector_183`. Première idle statique distincte du portrait, **1024 × 1536**. Collector conserve son rôle non combattant et son absence de duel.

La recherche a retrouvé le sculpt retenu de Rodion Vlasov et rapproché celui-ci des captures du chapitre 21 déjà conservées dans la vague 4. La variante rejetée du sculpt n'est pas utilisée. Le corps, les pieds, la cape, la couronne et le bâton constituent la référence choisie, en posture fermée au repos ; aucune capacité du corpus n'est réécrite.

La première génération avait une extrémité de cape environ 32 pixels natifs sous les semelles. Une correction par génération d'image a relevé cette extrémité. Dans les deux captures finales d'atelier, les pieds visibles reposent sur le sol à y430 et la cape reste au-dessus. La frange de faible alpha dépasse d'environ 1,17 pixel de rendu, sans pan opaque sous le sol.

L'ornement exact du bâton, les matières et le côté opposé ne sont pas certifiés. [Livraison Collector](characters/collector/delivery.json) · [Revue de l'atelier](qa-native/collector/visual-review.json).

### Stalker — Silent Hill original

Identifiant : `sh1_stalker_008`. Nouvelle vue statique **1024 × 1536**, distincte du portrait historique.

L'identité est ancrée dans les données originales **CLD2** et leur attribution dans les sources de décompilation. Les fichiers de modèle, texture et animation, les formats publiés et les rendus documentaires du modèle sont conservés. Cette référence distingue Stalker de Larval Stalker, Grey Child et Mumbler. Les rendus documentaires ne sont pas comptés comme des créations d'imagegen.

La première version était trop opaque. La seconde contient une transparence interne effective : alpha médian 181, maximum 213 ; environ 78,03 % de pixels entièrement transparents. Dans le moteur, le décor reste visible à travers le corps, la silhouette entière est lisible dans les deux orientations et la semelle visible repose à y594. La frange de faible alpha dépasse d'environ 1,53 pixel de rendu.

Cette opacité constitue une interprétation visuelle ; elle ne reproduit pas exactement le mélange soustractif de la PlayStation ou la cadence originale. Aucun clip animé n'est ajouté. [Livraison Stalker](characters/stalker/delivery.json) · [Revue dans le moteur](qa-native/stalker/visual-review.json).

### Creeper Swarm — Silent Hill, film de 2006

Identifiant : `film_creeper_swarm_film_173`. Nouvelle vue statique **2172 × 724**. Le profil reste une rencontre scénarisée, avec combat autorisé et super désactivée.

La référence de production comprend une vue latérale Maya de Mr. X, l'entretien d'Evan Jacobs et des vues du film et de l'accessoire. Le court extrait source est une référence documentaire ; il n'est pas importé comme une animation du jeu.

Le PNG représente **un profil collectif composé de trois corps complets**. Cette présentation reprend les trois individus déjà visibles dans l'ancien portrait. Elle ne certifie pas le nombre d'individus de l'essaim dans le film et n'ajoute pas trois acteurs indépendants au moteur. Les métadonnées distinguent explicitement la revue du collectif de celle d'un sujet individuel. Le lecteur générique des livraisons conserve donc `reviewedWithSource:false` pour cette composition, tout en acceptant son journal et son statut de candidate.

Dans un rendu de 1280 × 720, le groupe occupe environ 158 × 19 pixels. Les trois corps sont séparés et reposent au sol ; les détails du visage ventral demandent un zoom et le contraste est faible sur certains sols sombres. Les faibles traces d'alpha natives en bordure sont conservées. [Livraison film](film/integration-delivery.json) · [Revue dans le moteur](qa-native/creeper/visual-review.json).

## Quatre arènes

Chaque composition comprend deux PNG natifs de **1672 × 941** : un fond opaque et un avant-plan transparent. La parallaxe légère utilise le fonctionnement existant. Les règles, collisions, dangers et permissions des lieux sont inchangés.

| Identifiant | Œuvre et scène retenue | Limite de référence |
| --- | --- | --- |
| `nightmare_theater` | Origins, caverne de Caliban derrière le miroir d'Artaud | Cadrages du guide officiel ; largeur adaptée au jeu de combat |
| `nightmare_school` | Shattered Memories, première cour du puzzle Paparazzi à Midwich | Capture source de 200 × 150, insuffisante pour certifier toute la géométrie |
| `nightmare_mall_sm` | Shattered Memories, hall Gumball gelé après Garage Access South | Capture source de 200 × 150 ; prolongement latéral interprété |
| `frozen_streets` | Shattered Memories, extérieur gelé d'une capture promotionnelle Wii du 31 juillet 2009 | Rue exacte et correspondance avec la version finale non certifiées |

Les premiers plans restent très transparents dans la zone centrale de combat. Les petites traces natives de 1 à 2 niveaux d'alpha sur 255 sont documentées. Aucun personnage n'est incorporé aux décors.

Les lieux `cedar_grove` et `antique_shop` ont été examinés mais ne reçoivent pas d'image : les références disponibles ne prouvent pas les phases précises attendues. Leurs flags de blocage ne sont pas modifiés. [Livraison de trois arènes](stages/integration-delivery-a.json) · [Livraison de l'extérieur gelé](stages/integration-delivery-b.json) · [Lieux réservés](stages/reserved-stage-dispositions.json).

## Générations et conservation

**13 sorties natives réussies : 11 actives et deux variantes antérieures archivées.** Les actives sont trois vues statiques de personnages et huit plans de décor. Les deux variantes archivées sont les premières versions de Collector et de Stalker. Aucun nouveau portrait ou clip animé n'est compté. Le détail et les empreintes figurent dans [native-dispositions.json](native-dispositions.json).

L'audit final réussit **320 contrôles**, dont la conservation de **59 fichiers protégés** et de **591 PNG antérieurs** identiques octet pour octet. Le roster, les portraits, les rôles, les permissions, les clips existants, les classeurs de production et les anciennes compositions sont préservés.

L'admission mémoire réussit pour **337 paires de combattants affectées**, avec un maximum de **44 046 656 octets**, et **324 associations des nouvelles arènes avec les compositions stockées**, maximum **25 174 376 octets**, sous les budgets de 64 Mio. Ce sont des vérifications d'admission en cache, pas des matchs joués. [Audit et détail mémoire](final-audit.json).

## Vérifications

### Exécution du moteur et revue visuelle

Les sept processus Canvas natifs réussissent **364 assertions** : quatre cas de combat pour les personnages, quatre cas d'arène et deux aperçus d'atelier pour Collector. Ils produisent **21 captures**. Dix captures finales distinctes ont été ouvertes et examinées par l'agent principal ; les quatre captures d'arène ont aussi une revue de l'agent qui les a produites, non recomptée comme quatre nouvelles captures.

L'agrégation finale réussit **258 revalidations** des rapports, processus, harnais, entrées testées, modules, actifs et captures contre l'état final. Elle ne lance pas de nouveaux matchs. Les commandes passent par `InputState` et le vrai `FightEngine`, sans injection d'état d'acteur. [Agrégation des preuves](native-evidence-final.json).

### Suite générale et correctifs

La commande complète `npm test` réussit : **1292 tests Node**, zéro échec, annulation, omission ou `todo`, avec les builds et la vérification finale du paquet. La suite Python complète réussit **115 tests**. Les 65 fichiers suivis par le contrôleur sont identiques avant et après l'exécution, et le diff Git suivi n'a pas changé. [Résultat complet et empreintes des logs](full-checks-final.json).

Le test de cache des stages attendait encore l'ancien PNG frontal d'Air Screamer. Une seule attente de chemin est mise à jour vers le PNG latéral déjà publié dans la vague 25 ; le moteur est inchangé. Le [diagnostic CI de la base](ci-base-status.json) et le [résultat ciblé](ci-regression-result.json) conservent ce constat.

Un premier passage de la suite complète a aussi révélé une erreur du nouveau journal : les champs `kind` et `sha256` manquaient au premier niveau. Les neuf échecs avaient cette cause commune. L'exception au chargement d'un module remplaçait ses 29 tests par un seul échec de fichier, expliquant le total provisoire de 1264 au lieu de 1292. Les champs requis ont été repris des livraisons sans modifier le validateur, puis les 85 tests consommateurs ont réussi. Le passage échoué reste conservé ; les tests ciblés ne sont pas ajoutés une seconde fois au total de la suite générale. [Diagnostic du journal](ci-journal-regression-result.json) · [Premier passage](full-checks.json).

### Navigateur HTTP

Le lancement Chromium local est bloqué avant l'ouverture du navigateur par `socket() failed: Operation not permitted`. Cet essai ne compte aucune vérification de l'application dans un navigateur et ne produit aucune capture. Son rapport, son observation de processus et le harnais exact utilisé sont conservés dans [qa-http/batch-a](qa-http/batch-a/report.json).

La CI `HTTP browser QA` reçoit une étape qui teste les trois personnages et les quatre arènes de cette vague sur le build servi en HTTP. Le harnais utilise les contrôles ordinaires de l'interface, vérifie les octets PNG reçus, la sélection distincte, les deux orientations, l'absence de lecture animée des vues statiques, les permissions de Collector et le dessin des plans dans le vrai canvas de jeu. Il ne substitue ni images ni modules et n'injecte pas l'état des acteurs.

Les résultats distants du commit publié sont suivis dans la PR après publication. À la date de ce snapshot local, cette nouvelle exécution distante n'est pas revendiquée réussie. Le contrôle utilise des contextes frais avec service workers bloqués et ne certifie pas les mises à jour hors ligne. [Harnais HTTP](qa-http-native-assets.mjs) · [Entrée CI](run-ci-browser-check.mjs).

## Dossiers encore ouverts

Le [registre rapproché](remaining-evidence.json) contient **40 profils** : quatre anciennes vues et 36 vues de combat absentes. Ses **100 pointeurs vers 26 fichiers de preuve** ont été vérifiés. Les motifs principaux sont 14 sources insuffisantes, 12 refus directs, neuf arrêts apparentés et cinq divergences de corpus.

Pour la Nurse de **Return to Silent Hill (2026)**, les nouvelles références ont résolu le manque de source visuelle. L'unique tentative de génération a néanmoins été refusée par le service, requête `b468e2dc-c90c-4431-ab93-83f40574d77c`, sans image produite. Elle n'a pas été relancée ; aucun PNG n'est importé. Le registre distingue ce refus direct de ceux concernant d'autres œuvres. Il conserve séparément le SHA du fichier de prompt avec LF terminal et celui de la chaîne effectivement envoyée sans cet unique LF. [Reçu du refus](film/receipt-nurse-return-refused.json) · [Récupération des sources](film/source-recovery-nurse-return.json).

Il reste également **44 arènes** sans composition active : 29 sans blocage déclaré et 15 bloquées. L'absence de blocage ne certifie pas à elle seule que la référence visuelle nécessaire a été trouvée.

## Preuves principales

- [Journal des trois imports](../sprite-wave26-imports-2026-11-20.json)
- [Synthèse vérifiée](verification-summary.json)
- [Audit final](final-audit.json) et [preuves natives agrégées](native-evidence-final.json)
- [Disposition des treize images](native-dispositions.json)
- [Collector](characters/collector/delivery.json), [Stalker](characters/stalker/delivery.json), [Creeper](film/integration-delivery.json)
- [Trois premières arènes](stages/integration-delivery-a.json) et [extérieur gelé](stages/integration-delivery-b.json)
- [Registre des quarante profils restants](remaining-evidence.README.md)

La branche de travail alimente la PR #6 ; aucune fusion ni mise en production n'est effectuée par cette passe. Les empreintes du commit et de l'arbre publiés, ainsi que les résultats CI distants, figurent dans le corps de la PR après vérification.
