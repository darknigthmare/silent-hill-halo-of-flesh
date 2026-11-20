# Description de la PR avant la passe de stages 20

Copie historique de la description au head `2db0c78284f681d641d439c62e1bd4487838677e`.
Les deux workflows de ce head ont depuis terminé en succès ; le texte ci-dessous
conserve son état au moment de la livraison précédente.

## Vagues 18 et 19 — production publiée le 19 novembre 2026

Les anciennes images de sélection et plusieurs arènes n’avaient pas encore leurs vues de combat ou leurs plans dédiés. Cette suite récupère la vague 18 restée locale, ajoute la vague 19, raccorde les actifs au jeu et remet le classeur à jour.

**27 PNG actifs publiés : 13 récupérés et 14 nouveaux, plus 9 variantes conservées hors runtime.** Le head est [`2db0c78`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/2db0c78284f681d641d439c62e1bd4487838677e). Les arbres publiés ont été vérifiés identiques aux commits locaux validés.

### Livraison

| Ensemble | Contenu |
|---|---|
| Six vues Book of Memories | Bogeyman, Butcher, Double Head, Pyramid Head, Schism et Straight Jacket ; images latérales individuelles, corps et équipement entiers, portraits historiques conservés |
| Deux vues cinéma | Mannequin Monster du film 2006 et Lying Figure de Return to Silent Hill ; le dossier Lying Figure conserve son rôle hors duel |
| Trois nouveaux clips animés | Marche de Scraper Arcade, marche de Scarlet doll Homecoming et attaque `neutralSpecial` de l’infirmière Origins ; une garde statique Scraper est aussi ajoutée |
| Six arènes en plans séparés | Midwich Nightmare, Building World, Subway World, Forest World, Hilltop Center et Baldwin Mansion |
| Classeur | 330 cellules factuelles actualisées, 151 hauteurs de lignes adaptées, 11 onglets, 10 tableaux, 80 formules et 177 blocs d’historique préservés |

Les quatre nouveaux lieux de vague 19 utilisent leur édition et leur état documentés : quai Lynch Street au premier passage SH4, première clairière Forest World, réception Monica normale SH3 et palier devant le Lounge fermé de Born from a Wish. Chaque décor possède un fond et un premier plan distinct ; les règles de terrain et les rôles ne sont pas modifiés par les images.

La reprise corrige également la libération d’images après un résultat de match terminé : le préchargement suivant conserve les budgets de 64 Mio, le résultat visible et le checkpoint gagné, avec un retry si le décodage échoue. Le texte central du HUD dispose d’une largeur bornée.

### Couverture actuelle

| Indicateur | Avant cette suite publiée | Après |
|---|---:|---:|
| Profils | 230 | 230 |
| Portraits disponibles | 204 | 204 |
| Vues latérales candidates | 127 | **135** |
| Anciennes vues de combat à revoir | 66 | **58** |
| Images de combat absentes | 37 | 37 |
| Portraits distincts du combat | 128 | **136** |
| Arènes illustrées | 26 / 123 | **32 / 123** |
| Clips réellement animés | 3 | **6** |
| Présentations animées | 0 | 0 |
| Fidélité 1:1 certifiée | 0 | 0 |

Les **204 portraits existants sont conservés octet pour octet avec leurs métadonnées**. Les nouvelles vues remplacent des visuels anciens ; elles ne sont pas comptées comme des profils entièrement nouveaux.

### Vérifications réalisées

- **1 290 tests Node réussis**, build de **584 fichiers vérifiés**.
- **115 tests Python réussis** sur la reprise, puis **10/10 tests dédiés au classeur** sur la paire XLSX + rapport finale.
- **108 tests ciblés réussis** après adaptation du harness ART144/ART92 : une marche réellement importée est contrôlée par ses fichiers HTTP, sa timeline et sa lecture UI ; les marches absentes gardent leur assertion stricte.
- **Canvas natif vague 18 : 286 contrôles réussis, 8 duels.**
- **Canvas natif vague 19 : 302 contrôles réussis, 12 duels, 42 captures produites, 10 examinées et 8 publiées.** Les six sprites sont contrôlés dans les deux orientations ; les quatre décors, les appuis et la parallaxe sont exercés.
- Audit mémoire : **14 365 combinaisons de duels illustrées restent admises**, sans augmentation des budgets ; il s’agit d’un audit des ensembles d’images, pas de 14 365 matchs joués.
- Le XLSX final a été vérifié sur 250 550 cellules et les 38 parties natives. Son SHA256 est `4016c8e34463b43931618f7fe01ffc0c16e519515ef8a299437ce70d41725871`.

**QA du head final : terminée avec succès.** Les jobs `test` et `sprite-importer`, la suite complète et la vérification des fichiers générés sont verts : [QA — 44507254604](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44507254604). La [campagne HTTP/Chromium — 44507254574](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44507254574) est encore en cours ; Chromium est installé et l’étape « Build and test the actual HTTP interface » est lancée. Son succès final et celui des nouvelles assertions UI ne sont pas encore confirmés. Aucun Chromium local n’a été exécuté.

### Restants et limites

Il reste **91 arènes sans bitmap, 58 vues anciennes à reprendre, 37 images de combat absentes et 26 portraits absents**. Le [triage des absences](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/vague19/missing-triage.json) conserve les refus historiques, les références insuffisantes et les identités collectives ou hors duel ; 19 des 37 profils absents sont actuellement hors combat.

Les six nouvelles vues BoM sont des idles statiques. Les clips ajoutés sont de courts cycles de versus ; aucun moveset complet, timing commercial mesuré, UHD native ou fidélité 1:1 n’est certifié. La QA native vague 19 porte sur idle, déplacement et retour idle ; elle ne revendique pas une matrice d’attaques ou de finishers.

### Rapports et historique

- [Vague 19 : actifs, couverture, limites, classeur et preuves](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/vague19/README.md)
- [Vague 18 : récupération, animations et corrections](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/vague18/README.md)
- [Captures de combat et revue indépendante](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/vague19/qa-native/REVIEW.md)
- [Classeur actualisé](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/SILENT_HILL_HALO_OF_FLESH_PHASE1_MOVESETS_ANIMATIONS.xlsx)
- [Audit de conservation du classeur](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/vague19/workbook/README.md)
- [Description de PR conservée jusqu’à la vague 17](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/2db0c78284f681d641d439c62e1bd4487838677e/docs/production/PR_HISTORY_THROUGH_WAVE17.md)

La PR reste ouverte en brouillon.
