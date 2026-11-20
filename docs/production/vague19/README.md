# Vague 19 — six vues BoM et quatre arènes en plans séparés

Production du 19 novembre 2026, à la suite de la [vague 18](../vague18/README.md).
**14 PNG actifs nouveaux** : six poses latérales de combat et huit plans pour
quatre lieux jusqu'ici sans bitmap. Deux premières versions sont conservées
hors runtime. Les **204 portraits existants restent inchangés**.

## Combattants — Book of Memories

| Profil | Fichier de combat retenu | Taille native |
| --- | --- | --- |
| Bogeyman | `assets/sprites/bom_bogeyman_122.47ff81e2ecb8.png` | 1024 × 1536 |
| Butcher | `assets/sprites/bom_butcher_123.67cd2f023ce2.png` | 1024 × 1536 |
| Double Head | `assets/sprites/bom_double_head_124.536da40f7758.png` | 1536 × 1024 |
| Pyramid Head | `assets/sprites/bom_pyramid_head_129.5d16d193b5e6.png` | 1536 × 1024 |
| Schism | `assets/sprites/bom_schism_130.e9fce1fd7658.png` | 1536 × 1024 |
| Straight Jacket | `assets/sprites/bom_straight_jacket_131.9d8fdb7602b9.png` | 1024 × 1536 |

Une créature et une pose par image, alpha réel, corps, armes et appuis entiers.
Chaque vue est orientée vers la droite ; le moteur assure la présentation
miroir à gauche. Les modèles BoM restent séparés de leurs équivalents dans les
autres jeux. Les anciens portraits ne servent plus de dessin de combat pour
ces six profils, mais restent disponibles dans la sélection.

Ces six images sont des **idles statiques candidats**. Elles n'ajoutent aucun
clip animé. Les corrections de Pyramid Head et Schism augmentent le dégagement
autour de la silhouette. Leurs premières versions restent dans `variants/`.

Les axes horizontaux suivent le bassin ou la zone d'appui, sans inclure la
longueur d'une arme. L'ancrage vertical est la borne basse exclusive de la
silhouette alpha ≥32. Le calibrage reste une adaptation de versus.

## Quatre lieux, huit plans

| Arène | Fond | Premier plan transparent |
| --- | --- | --- |
| Subway World, SH4 | Quai Lynch Street et voiture arrêtée, premier passage | Montants de quai proches |
| Forest World, SH4 | Clairière rocheuse du premier passage | Écorce et herbes de bord |
| Hilltop Center, SH3 | Bureau/réception de Monica, état normal | Bords d'armoires proches |
| Baldwin Mansion, Born from a Wish | Palier devant le Lounge fermé | Montants de bois proches |

Chaque plan conserve ses pixels natifs **1672 × 941**. Les fonds sont opaques et
les premiers plans possèdent leur propre canal alpha. Le fond est fixe et le
plan proche utilise `parallaxX: 0.012`. La bande centrale et les appuis restent
libres. Les règles de rôle, de terrain et de dégâts conservent leur état.

## Couverture du projet

| Indicateur | Vague 18 | Vague 19 |
| --- | ---: | ---: |
| Profils | 230 | 230 |
| Portraits disponibles | 204 | 204 |
| Portraits absents | 26 | 26 |
| Vues latérales candidates | 129 | 135 |
| Anciennes vues de combat à revoir | 64 | 58 |
| Images de combat absentes | 37 | 37 |
| Portraits distincts du combat | 130 | 136 |
| Arènes avec images | 28 / 123 | 32 / 123 |
| Clips réellement animés | 6 | 6 |
| Présentations animées | 0 | 0 |
| Fidélité 1:1 certifiée | 0 | 0 |

## Vérifications

- Importeur officiel du dépôt : identité et édition exactes, hash et pixels,
  alpha, cadrage, absence de clone et conservation des portraits.
- [Registres et plans de scène](sprite-and-stage-build.txt) : 135 vues latérales,
  32 arènes enregistrées et 62 PNG de décor référencés, dont 60 dans les
  compositions actives et deux conservés hors composition active.
- [Suite Node complète](node-tests.txt) : **1 290 tests réussis** sur les fichiers
  intégrés de cette vague.
- [Build](build-verification.txt) : **584 fichiers vérifiés**, 230 profils et
  123 lieux dans le catalogue.
- [Audit mémoire](memory-audit.json) : aucune régression parmi les **14 365
  combinaisons de duels illustrées** ; aucune paire de décors hors budget. Il
  s'agit d'un contrôle des ensembles d'images, pas de 14 365 parties jouées.
- [QA Canvas natif](qa-native/REVIEW.md) : **302 contrôles réussis**, 12 duels et 42 captures. Les
  six profils sont contrôlés des deux côtés avec les callbacks d'entrée réels,
  les quatre stages, le déplacement, le retour idle et la parallaxe. Les
  appuis mesurés sont alignés avec le sol. Dix captures ont été examinées.

Huit captures représentatives sont publiées avec leurs empreintes dans
[`qa-native/capture-selection.json`](qa-native/capture-selection.json) ; elles
couvrent les six sprites, les quatre arènes, les deux orientations et un
portrait historique. Le [rapport intégral](qa-native/native/report.json) reste
inchangé. La revue corrige explicitement sa phrase héritée sur les attaques,
qui n'ont pas été exercées ici. Les deux versions du harness sont conservées
avec leur SHA-256 et la correction documentaire postérieure à l'exécution est
déclarée.

Cette QA native ne remplace pas les contrôles Chromium de DOM, HTTP et service
worker. Aucune attaque ni animation nouvelle n'est exercée ou revendiquée dans
la vague 19. Les animations de la vague 18 ont leur propre rapport.

## Classeur actualisé

Le [classeur de production](../SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx)
et son [rapport canonique](../workbook-verification.json) ont été intégrés
ensemble. La mise à jour porte sur **330 cellules factuelles**, avec 151
hauteurs de lignes adaptées pour les annotations. Les **11 onglets, 10 tableaux,
80 formules et 177 blocs d'historique** sont préservés. La Synthèse reprend les
204 portraits, 135 vues latérales, six clips et 32 arènes bitmap.

La suite dédiée au classeur passe **10 tests** sur cette paire exacte
([log](../workbook-contract-tests.log)). L'[audit de conservation](workbook/workbook-semantic-preservation.json)
compare 250 550 cellules et les 38 parties natives du XLSX ; le
[reçu d'intégration](workbook/integration-receipt.json) vérifie les fichiers
copiés, les empreintes des journaux, le ZIP, les formules et les totaux en cache.
Les [aperçus](../previews/01-synthese.png) rendent la mise à jour consultable.

Cette édition actualise les disponibilités et les compteurs ; les rôles,
responsables, décisions de production et mesures source conservent leur état.
Les changements d'identifiants internes de relations dus à l'export sont
documentés et leurs cibles vérifiées. L'ancien plan complet garde son empreinte
historique ; aucun nouveau plan complet n'est prétendu appliqué. La fin de la
plus longue note préexistante reste consultable en ouvrant sa cellule.

## Contrôle navigateur des livraisons historiques

La campagne ART92 contient désormais une marche livrée pour Scarlet doll.
Le [correctif du harness](browser-check-update.md) conserve le test strict
d'absence pour les 67 autres candidats historiques des campagnes ART144/ART92,
et vérifie la timeline, les PNG servis et la lecture réelle du clip lorsqu'il
existe. Les fragments, décisions et compteurs des campagnes d'origine restent
inchangés. Le succès de ces nouvelles assertions sous Chromium doit être lu
dans les checks GitHub du commit publié ; aucune exécution Chromium locale
n'est revendiquée.

## Restants documentés

Le [triage des 37 absences de combat](missing-triage.json) distingue 18 profils
autorisés au combat et 19 hors duel. Vingt entrées portent un refus historique
direct ou de variante, huit manquent de références visuelles suffisantes et
neuf relèvent d'un phénomène immatériel, d'une catégorie collective, d'une
identité non résolue ou d'un usage de sélection seulement.

Les 26 portraits absents appartiennent à cet ensemble : dix-neuf refus
historiques, trois sources insuffisantes et quatre autres blocages. Ils ne sont
pas déclarés livrés. Les prochaines productions doivent aussi traiter les
**91 lieux encore sans bitmap**, les 58 vues anciennes et les mouvements dédiés.

## Sources et limites artistiques

- [Prompts, références et décisions des six sprites](fighter-generation.json).
- [Références d'édition](fighter-references.json) et
  [audit raster des sprites](fighters-raster-audit.json).
- [Prompts, références, descripteurs et alpha des huit plans](stage-generation.json).
- [Reçus d'import avec empreintes et portraits conservés](../sprite-wave19-imports-2026-11-19.json).

Les détails fins sont reconstruits lorsque la référence est petite : notamment
la proportion et l'épaisseur du Great Cleaver de Butcher, et certaines matières
de Schism. Bogeyman garde une légère rotation du torse pour la lisibilité des
mains. Les fonds adaptent leur cadrage et la largeur du sol au combat latéral ;
la référence Subway documente le vestibule de commande, pas l'intégralité du
quai. Les montants proches de Baldwin sont semi-opaques (alpha maximal 208).
Ces limites restent enregistrées ; ni UHD native ni fidélité 1:1 ne sont
certifiées par les contrôles techniques.

## Publication des images et preuves

Le commit distant
[`319c865`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/319c865b70ad3d684a5ddfbcaf8628369a058bc6)
contient les 14 PNG actifs, les deux variantes, les huit captures sélectionnées,
les manifestes et les rapports de cette vague. Son arbre Git est exactement
`794a700879f84259a776901186183c6b9e7f1aca`, identique au commit local vérifié.
Le [reçu de publication](publication.json) conserve le parent, les contrôles
d'intégrité et la mise à jour sans force de la branche de la PR #6.

La vague 18 a été publiée au préalable dans
[`23a8fee`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/23a8feeace8aca385c64237ed177c21242e2de55),
avec la même vérification d'égalité intégrale des arbres
([reçu](wave18-publication.json)). Les [chiffres consolidés](delivery.json)
distinguent les actifs des variantes et des captures QA.
