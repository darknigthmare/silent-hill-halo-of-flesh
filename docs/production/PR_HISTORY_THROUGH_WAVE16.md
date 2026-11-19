# Historique de la description de la PR #6 avant la vague 17

Photographie du texte de la PR au début de la reprise du 19 novembre 2026, branche `art/missing-fullbody-20261117`, commit `96cbd9c49233230e8ddaed08f6f6063734aef96e`.

## Vague 16 — 19 novembre 2026

**Sept nouvelles images actives sont publiées dans le commit [bb121da](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/bb121da6aac7c7386dfc3f8a7a5270a34ae3be53).** Les quatre portraits historiques sont conservés ; le moteur reçoit quatre nouvelles attentes latérales, une garde dédiée et deux plans de décor.

| Livraison | Résultat |
| --- | --- |
| Faceless Nurse — Origins | Profil droit entier à la seringue et image séparée de garde ; retour vers l’attente au relâchement de la garde. |
| Scarlet — Homecoming | Vue latérale de la forme verticale à coque de porcelaine, distincte de la forme arachnide. |
| Incubator — Silent Hill (1999) | Présentation de profil en robe blanche ; restrictions de rôle du projet conservées. |
| Scraper — The Arcade | Vue latérale avec le voile, la tunique et les deux lames de cette édition. |
| Brookhaven — Silent Hill 2 (2001) | Terminus Otherworld devant l’ascenseur : fond opaque et huisserie gauche transparente en parallaxe. |
| Sources | Deux essais non retenus archivés, prompts et empreintes des fichiers documentés. Un rendu intermédiaire de correction reste non récupéré après l’indisponibilité du poste ; aucun transfert de ses octets n’est revendiqué. |

**Audit des anciens fichiers : 222 PNG de génération distincts rapprochés dans sept anciens dossiers locaux correspondent à des fichiers déjà présents dans la PR.** Cela inclut les 11 PNG du dernier lot retrouvé. Le portrait de Colin, la marche de Scarlet arachnide et les treize scènes de la vague 12 étaient déjà publiés à la base `67d8df2c`.

**Couverture actuelle : 204 portraits / 230 ; 123 profils latéraux ; 70 anciennes vues à revoir ; 37 profils sans sprite de combat ; 24 arènes bitmap / 123 ; 48 illustrations de chroniques.** Il reste 26 portraits et 99 arènes sans bitmap. Les nouveaux sprites sont des poses statiques candidates ; le nombre de clips animés reste à deux et aucune fidélité 1:1 n’est certifiée.

[Rapport et inventaire](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/vague16/README.md) · [Prompts et références des cinq poses](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/vague16/fighter-generation.json) · [Plans de Brookhaven](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/vague16/brookhaven-sh2.json) · [Anciennes images retrouvées](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/vague16/recovered-files.json)

Les PNG actifs ont été décodés et inspectés : CRC, dimensions, transparence, limites du sujet et empreintes sont contrôlés. Les portraits et scènes antérieurs sont conservés. Le moteur Canvas natif a réussi **83 contrôles**, avec quatre duels dans les deux orientations et huit portraits ; les captures ont été inspectées. Ce contrôle reste distinct du navigateur. Sur le commit [40201737](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/40201737c77ad12a0563251d6e7da8205c41d16f), la compilation, **1 276 tests JavaScript et 115 tests Python** ainsi que le contrôle de cohérence des fichiers générés réussissent. [Validation Node/Python](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44457223720). **Suite navigateur complète réussie** : le contrôle de cette vague compte **41 vérifications et 11 captures**, dont les quatre duels, la garde maintenue puis relâchée et la parallaxe au clavier. [Exécution](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44457223630) · [Captures et rapports](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44457223630/artifacts/14500425842).

---

## Reprise du 18 novembre 2026

**Les 211 PNG originaux distincts retrouvés dans les dossiers de génération des séances précédentes figurent dans cette PR.** Les fichiers locaux et les fichiers inscrits dans Git ont été rapprochés par SHA-256. Les 211 chemins, tailles et identifiants d’objet ont également été vérifiés sur GitHub. [Inventaire des originaux](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/reprise-visuels-2026-11-18/originaux.json)

| Livraison | Disponible dans le jeu |
| --- | --- |
| Combattants | 21 sprites récupérés dans les vagues 12 et 13. L’infirmière au tuyau a un dessin de repos, un de garde et un de réaction à un coup. Le Mandarin de *Silent Hill 2* et le Siam de *Homecoming* ont chacun une nouvelle garde latérale distincte de leur portrait. [Duels et poses](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-vagues-12-13/README.md) |
| Arènes | Wood Zone, la nef de Church of the Holy Way et l’autel Inari ont chacun leur fond et leur premier plan de parallaxe. Wood Zone conserve sa composition de fin de manche. [Wood Zone](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/wave13-stages/WOOD_ZONE.md) · [Nef et autel](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/wave13-stages/NEF_ET_AUTEL_INARI.md) |
| Chroniques | Les 13 WebP récupérés ajoutent 10 rencontres de rivaux et 3 observations. Le dossier des Pétales de Maya montre aussi Sakura Head sur le palier de la Villa. Les 48 PNG natifs des chroniques des vagues 7 à 12 sont archivés avec leur provenance. [Reprise des illustrations](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/wave12-story/generation.json) |
| Variantes | Sept anciens essais de combattants et une variante du Remnant figurent dans les archives de production. |

Le registre compte **203 portraits sur 230**, **113 profils avec une vue latérale distincte**, **78 anciennes vues à revoir** et **39 profils sans image de combat**. **21 des 123 arènes** ont un décor bitmap. Les **46 illustrations de chroniques** couvrent 15 introductions, 15 fins, 12 scènes de rivalité, 3 observations et une illustration de dossier. Les poses et décors restent des adaptations dont la fidélité exacte aux œuvres sources est à vérifier.

[Planche du Mandarin, du Siam, de Wood Zone et de Sakura Head](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/wave13-preview/planche.jpg) · [Captures du moteur pour les combattants récupérés](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-vagues-12-13/README.md)

La compilation et les 1 390 tests locaux passent, dont 1 275 tests JavaScript et 115 tests Python. Chromium a affiché le Mandarin et le Siam dans Wood Zone puis l’illustration et la légende de Sakura Head dans le dossier de Maya. [Captures du jeu dans Chromium](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44381517178/artifacts/14464636613)

## Vagues 10 et 11 du 18 novembre 2026

**38 nouveaux visuels en jeu** et **3 variantes de travail archivées**. Les 359 fichiers de la version livrée jusqu’à la vague 9 correspondent au commit `f82737a`. Les 41 dessins sources des deux dernières vagues sont rapprochés de leur usage dans le jeu ou de leur variante conservée.

| Lot | Livraison |
| --- | --- |
| Personnages | 3 portraits de sélection et 11 vues latérales. Cybil possédée, Curtis Ackers et Phantom ont chacun leur portrait et leur garde. Dix personnages utilisent leur nouvelle garde en duel. Joseph Schreiber a sa vue de profil dans l’atelier. |
| Arènes | 8 calques pour 4 lieux avec parallaxe. Cour de Toluca Prison, salle de contrôle du Labyrinthe, salle de surveillance de Water Prison et bureau 105 du concierge de South Ashfield. |
| Chroniques | 14 illustrations achèvent les 15 paires d’ouverture et de fin. Deux interludes supplémentaires illustrent les rencontres avec Memory of Alessa et Walter Sullivan. |

La couverture atteint 194 portraits sur 230, 101 profils avec une vue latérale distincte et 15 arènes bitmap sur 123. Il reste 36 portraits à produire, 46 profils sans image de combat et 83 vues anciennes à examiner. Les gardes livrées sont statiques. La fidélité exacte aux modèles d’origine reste à valider.

[Aperçu des vagues 10 et 11](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/Silent_Hill_Combat_vagues_10_11.jpg) · [Rapport et identifiants des manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_WAVES_10_11_2026-11-18.md) · [Trois variantes archivées](https://github.com/darknigthmare/silent-hill-halo-of-flesh/tree/art/missing-fullbody-20261117/docs/production/variantes-vagues-10-11)

## Vague 9

La chapelle initiale de *Silent Hill 3*, trois vues latérales et les deux illustrations de *Trauma partagé* représentent sept fichiers supplémentaires par rapport à la vague 8. [Rapport de la vague 9](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_WAVE9_2026-11-18.md)

## Vague 8 du 18 novembre 2026

**26 visuels intégrés au jeu**. Trois premiers portraits, sept nouvelles gardes de duel, une vue de profil en atelier, une pose de vol horizontal, six calques pour trois arènes et huit illustrations pour quatre chroniques.

- **Personnages.** Le Wheelman géant d’Overlook entre dans la sélection et le versus. Monocle Man et la Sewer Creature entrent dans les dossiers. Le petit Numb Body, Memory of Alessa au couteau, la Sniffer Dog femelle, Eric Walsh, Sharon Blake et le Swarm ont une garde de profil. Le fauteuil vide de SH4 a sa vue d’atelier. L’Air Screamer emploie sa nouvelle pose pendant le déplacement et retrouve son animation de repos dès le relâchement.
- **Décors.** L’appartement 208 de Wood Side, la salle du Happy Burger et le palier inondé de Blue Creek ont chacun un fond et un premier plan en parallaxe. Les déplacements mesurés à 1 280 × 720 sont de 37,8, 59,4 et 48,6 pixels.
- **Chroniques.** *Pluie sur Ryall* a cinq combats, avec le Wheelman en quatrième position et le Void en dossier. *Le signal sous St. Amelia* en a trois. Leurs fins apparaissent au bilan. *Mémoire sous la glace* et *Les pétales de Maya* proposent leurs deux images en archive, sans créer de victoire.
- **Couverture.** 191 portraits sur 230, 87 profils avec une vue latérale distincte, 10 lieux sur 123 avec un décor bitmap actif, 7 chroniques illustrées à l’ouverture et à la fin sur 15. Les 306 anciens PNG et les 188 anciens portraits sont préservés. La fidélité visuelle exacte des reconstitutions reste à établir.
- **Contrôles en jeu.** Huit duels normaux dans les deux ordres au total, 168 contrôles du rendu natif, 24 contrôles des arènes et 109 contrôles du mode histoire. Les 14 illustrations des deux dernières vagues ont été décodées et vérifiées par empreinte hors ligne.

[Trois décors et mouvements en jeu](https://github.com/darknigthmare/silent-hill-halo-of-flesh/tree/art/missing-fullbody-20261117/docs/production/wave8-stages) · [Illustrations des chroniques](https://github.com/darknigthmare/silent-hill-halo-of-flesh/tree/art/missing-fullbody-20261117/docs/production/wave8-story)

## Vague 7 du 18 novembre 2026

**22 nouvelles images sont intégrées au jeu.** Sad Daddy reçoit son premier portrait et une pose de combat indépendante. Les six adversaires des *Miroirs de Travis* disposent ainsi de leur sprite de combat et la chronique atteint son bilan final en mode normal.

- **10 sprites de personnage.** Un portrait et neuf poses statiques de duel pour Groaner, Wormhead, Split Head, Romper, Slurper, Hummer, Steve Garland, Cynthia Velasquez et Sad Daddy.
- **6 plans de décor dans 3 arènes.** Le manège de Cybil, l’appartement 302 et le Riverside Motel ont chacun un fond et un premier plan avec sa propre vitesse de défilement.
- **6 illustrations d’histoire.** Les chroniques de Heather, Henry et Travis montrent leur ouverture dans les archives et en début de parcours, puis leur dénouement après la dernière victoire.

Le registre compte **188 portraits sur 230** et **79 vues latérales**. Il reste 42 fiches sans portrait, 114 lieux sans décor bitmap, deux décors historiques associés à une autre pièce et 12 chroniques sans leur paire d’illustrations. Les 296 PNG historiques et les 187 portraits précédents ont été vérifiés.

Le build a passé 10 duels en Chromium, 24 contrôles de parallaxe, 121 contrôles des chroniques et de leurs images hors ligne, 1 262 tests JavaScript et 114 tests de la chaîne graphique. Les KO du parcours de vérification sont accélérés.

[Rapport illustré](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/c28c7a3b282404adbe6dd117a6a792e1c4f9e5cc/docs/production/SPRITE_WAVE7_2026-11-18.md) · [Décors animés](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/c28c7a3b282404adbe6dd117a6a792e1c4f9e5cc/docs/production/wave7-stages/README.md) · [Illustrations du mode histoire](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/c28c7a3b282404adbe6dd117a6a792e1c4f9e5cc/docs/production/wave7-story/README.md) · [Inventaire à poursuivre](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/c28c7a3b282404adbe6dd117a6a792e1c4f9e5cc/docs/production/wave7-stages/backlog.md)

---

## Vague 6 du 18 novembre 2026

**187 fiches sur 230 ont une illustration.** Cette vague livre 14 PNG pour 14 fiches, dont trois premières sélections. Il reste **43 fiches sans image**. [Rapport illustré](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/SPRITE_WAVE6_2026-11-18.md) · [Inventaire des fiches sans image](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/sprite-status-wave6-2026-11-18.json)

- Le Greedy Worm de *Silent Hill: The Arcade* apparaît de face, en fort raccourci, dans la prison de Toluca. [Capture en sélection](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/arcade-selection/selection-arcade_greedy_worm_arcade_119-right.png)
- Le Void de *Silent Hill: Downpour* conserve son rôle de danger environnemental. Le portrait montre le centre sombre et le rayonnement rouge de la distorsion au Devil’s Pitstop. [Capture en sélection](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/selection/selection-downpour_void_113-right.png)
- Le Stinger de Stilledalen est représenté dans son apparition en Norvège, ailes repliées, d’après *Silent Hill: Ascension*. L’image documente cette apparition régionale. [Capture en sélection](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/selection/selection-ascension_stilledalen_stinger_184-right.png)

**Onze vues latérales** complètent Mumbler, Creeper de *Silent Hill 2*, la forme rampante de Lying Figure, Closer, Double Head de *Silent Hill 3*, Jimmy Stone, les deux Tremer de *Silent Hill 4*, Ariel, le Bogeyman de *Homecoming* et le soldat de l’Ordre. Le catalogue atteint **70 vues latérales** et **296 PNG**. Huit de ces poses servent d’idle en duel. Les Tremer bleu et rouge de *Silent Hill 4* et le Bogeyman de *Homecoming* se consultent dans l’atelier, conformément à leurs rôles. [Closer et Double Head dans l’arène](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/additional/duel-sh3_closer_036--sh3_double_head_040-tick120.png)

Les **251 contrôles du lot** couvrent 8 duels, 22 présentations de portraits et 8 vues orientées dans l’atelier. Le build a passé **1 261 tests JavaScript et 114 tests Python**. Chromium a réussi **324 contrôles HTTP du build** et **410 contrôles ART92**. La campagne **ART144 a réussi 1 004 contrôles sur 40 duels**. Ces nouveaux dessins sont des poses fixes candidates dont la fidélité exacte reste à vérifier. [Planche des trois sélections](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/trois-selections.png) · [Rapport Chromium](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/browser-sprites.json) · [Rapport ART92](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/art92-browser.json.gz) · [Rapport ART144](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/a0f319d2b3d31109e9c610d30b0f4927d4887da3/docs/production/qa-sprite-wave6-2026-11-18/art144-browser.json.gz)

## Historique des livraisons antérieures à la vague 6

Les chiffres des sections suivantes correspondent aux lots publiés à ces dates.

## Vague 5 du 18 novembre 2026

**184 fiches sur 230 ont une illustration.** Les trois nouveaux portraits sont le Ghost de *Book of Memories* dans sa forme Dark Ghost, Joseph Schreiber (Victim 15) de *Silent Hill 4* et l’entité ressemblant à Sakuko de *Silent Hill f*. Il reste **46 fiches sans image**. [Rapport illustré des 15 PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/SPRITE_WAVE5_2026-11-18.md) · [Inventaire des fiches restantes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/sprite-status-wave5-2026-11-18.json)

**12 poses latérales** rejoignent le combat. Le Ghost et l’entité ressemblant à Sakuko ont chacun une sélection et une pose de combat indépendante. Joseph apparaît la tête en bas dans le plafond, comme dans sa scène d’origine, et conserve son rôle non combattant. Les dix autres poses complètent Puppet Doctor, Creeper, les deux types de Gum Head, Smog, Split Worm, Lying Figure, Lurker, Straight-Jacket et Caliban. [Duel Sakuko et Ghost au tick 120](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/qa-sprite-wave5-2026-11-18/additional/duel-shf_sakuko_like_entity_162--bom_ghost_125-tick120.png) · [Joseph en sélection](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/qa-sprite-wave5-2026-11-18/selection/selection-sh4_joseph_schreiber_victim_15-right.png)

La vague ajoute **15 PNG pour 13 profils**. Le catalogue atteint **282 PNG et 59 vues latérales distinctes**. Les 267 anciens PNG et les 181 portraits déjà attribués ont conservé leur contenu. Les nouveaux dessins sont des poses fixes candidates, de fidélité non certifiée.

Le build a passé **1 259 tests JavaScript et 111 tests Python**. Les **240 contrôles natifs** comprennent 233 assertions Canvas et 7 vérifications des rôles, avec 12 duels et 26 rendus de portraits. Sur le build, Chromium a réussi **310 contrôles HTTP** et **413 contrôles ART92**, dont la vérification du portrait historique de Split Worm et de son nouvel idle en combat. [Revue des captures](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/qa-sprite-wave5-2026-11-18/README.md) · [Rapport Chromium](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/qa-sprite-wave5-2026-11-18/browser-sprites.json) · [Rapport ART92](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/318b8856ab8f0c8e18d2e25a066bc8dbad505748/docs/production/qa-sprite-wave5-2026-11-18/art92-browser.json.gz)

## Historique des livraisons antérieures à la vague 5

Les chiffres de chaque section ci-dessous correspondent au lot publié à cette date.

## Vague 4 du 18 novembre 2026

**181 fiches sur 230 ont une illustration.** Les sept premières sélections sont Snarler, Wanderer, The Collector (*Ascension*), Wood Guardian (*Book of Memories*), Eileen Head (*Silent Hill 4*), Creeper et Toadstool (*The Arcade*). Il reste **49 fiches sans image**. [Rapport et tableau des 20 PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/SPRITE_WAVE4_2026-11-18.md) · [Inventaire des fiches restantes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/sprite-status-wave4-2026-11-18.json)

**Treize poses latérales de combat** complètent les sélections de Snarler, Wanderer, Creeper et Wood Guardian, ainsi que les neuf portraits déjà en place de Hanged Scratcher, Sniffer Dog mâle, Schism, Pendulum, Insane Cancer, Carrion, Twinfeeler, Red Pyramid Thing à la lance et Numb Body de grande taille. Les 20 nouveaux PNG portent le total à **267**. Le catalogue contient désormais **47 vues latérales distinctes**, **129 vues historiques de combat**, cinq fiches illustrées réservées à la sélection et un clip animé. Les nouveaux sprites sont fixes. Le nombre de reconstitutions certifiées à l’identique reste nul. [Journal des imports](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/sprite-wave4-imports-2026-11-18.json)

Les **1 256 tests JavaScript**, **111 tests Python** et **280 contrôles natifs** ont réussi. Le moteur a rendu **14 duels et 32 portraits**. Les 247 anciens PNG sont identiques octet pour octet et les 174 portraits antérieurs gardent leur affectation. Sur le build final, la suite HTTP ciblée `scripts/http-qa-sprites.mjs` a exécuté **295 assertions dans Chromium 153.0.8010.0**, toutes réussies. Dans la chronique `fog_of_alessa`, le jeu a signalé le sprite manquant d’un adversaire ultérieur, bloqué le lancement et conservé la sauvegarde existante octet pour octet. La QA GitHub du commit final a également réussi. [QA GitHub](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44270357060) · [Suite navigateur complète sur GitHub](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44270356861). [Capture du duel Numb Body et Wood Guardian](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/qa-sprite-wave4-2026-11-18/additional/duel-sh3_numb_body_large_038--bom_wood_guardian_138-tick120.png) · [Contrôles GitHub de la PR](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6/checks)

La silhouette du Wood Guardian reprend les captures sur PS Vita. La profondeur de la vue latérale et certains détails arrière restent interprétés. Le Collector reprend les vues du chapitre 21 d’*Ascension*, avec une incertitude sur les pointes du sceptre et la gravure du sceau. La tentative du Grey Child du film de 2006 a été refusée en sortie et a produit zéro sprite. [Sources visuelles](https://github.com/darknigthmare/silent-hill-halo-of-flesh/tree/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/wave4-references) · [Journal des générations](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/67fbe03d79124ac88d86a508a41f1eba745086c7/docs/production/sprite-wave4-generation-2026-11-18.json)

---

## Historique des livraisons antérieures à la vague 4

Les chiffres ci-dessous décrivent l’état de chaque publication à sa date.

## Deux nouveaux portraits et quatre poses de combat — 18 novembre 2026

Bubble Head Nurse et Creeper du film *Return to Silent Hill* (2026) entrent en sélection. Le roster atteint **174 profils illustrés sur 230**, contre 172 à la publication précédente. **56 profils restent sans image**. Feral, Needler, Night Flutter et Floatstinger disposent chacun d’une nouvelle image de combat, distincte de leur portrait. [Rapport de la vague](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/SPRITE_WAVE3_2026-11-18.md) · [Inventaire des 56 profils encore sans image](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/sprite-status-wave3-2026-11-18.json)

| Personnage | Édition | Usage | Dimensions natives | Fichier |
| --- | --- | --- | --- | --- |
| Bubble Head Nurse | Return to Silent Hill (2026) | Sélection | 1068 × 1472 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/film_bubble_head_nurse_return_to_silent_hill.4dfe1e93350e.png) |
| Creeper | Return to Silent Hill (2026) | Sélection | 1084 × 1451 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/film_creeper_return_to_silent_hill.fc7cb9789eef.png) |
| Feral | Homecoming | Combat latéral | 1774 × 887 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/homecoming_feral_086.d944b0e329cf.png) |
| Needler | Homecoming | Combat latéral | 1774 × 887 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/homecoming_needler_088.04a662ecb2cb.png) |
| Night Flutter | Silent Hill (1999) | Combat latéral | 1448 × 1086 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/sh1_night_flutter_002.4c283a4ddf49.png) |
| Floatstinger | Silent Hill (1999) | Combat latéral | 1312 × 1199 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/assets/sprites/sh1_floatstinger_016.80344808d0d5.png) |

Le registre compte **34 combats latéraux distincts**, **138 vues historiques de combat** et **2 portraits réservés à la sélection**, pour **247 PNG de sprites**. Les six nouvelles images sont des poses fixes candidates, avec une fidélité visuelle 1:1 encore à vérifier. Le rôle des deux nouveaux profils du film demeure `unverified`. [Journal des imports](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/sprite-wave3-imports-2026-11-18.json)

La bande-annonce du distributeur montre l’infirmière de la coiffe aux chaussures à **1 min 08,750 s**. Le modèle précis de son instrument et les doigts du bras arrière restent incertains. Les vues au sol et de la face ventrale ont permis d’identifier un Creeper isolé. Ces deux profils, Joseph Schreiber et Colin the Janitor constituent les **quatre dossiers absents examinés en détail**. L’apparition de Joseph reste incomplète. La génération de Colin a été refusée pour violence après un appel, sans fichier livré. Sewer Creature a fait l’objet d’un tri séparé. [Sources de l’infirmière](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/wave3-research-2026-11-18/nurse/README.md) · [Sources de Creeper et Joseph](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/wave3-research-2026-11-18/README.md) · [Sources de Colin](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/wave3-research-2026-11-18/colin/README.md) · [Journal des générations](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/sprite-wave3-generation-2026-11-18.json)

### Vérifications du lot

- Le gate complet a réussi **1 254 tests sur 1 254**, avec un build vérifié de **328 fichiers**, dont 42 JavaScript et 10 HTML. **111 tests Python** de la chaîne d’import ont également réussi. [Log du gate](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/qa-sprite-wave3-2026-11-18/npm-test.log.gz) · [Log Python](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/qa-sprite-wave3-2026-11-18/python-art-tests.log.gz)
- La QA native a passé **95 assertions**. Elle couvre **4 duels** et **12 rendus de portraits**, dont 4 pour les deux nouveaux sujets. Le roster et les **172 anciens portraits** sont préservés, ainsi que les octets des **241 anciens PNG**. [Captures et revue visuelle](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/docs/production/qa-sprite-wave3-2026-11-18/README.md)
- Après le gate, **31 tests ciblés sur 31** ont validé la correction des instantanés historiques ART144 et ART92 pour les profils de sélection seule. La comparaison reconnaît les images par frame ou par empreinte des pixels. [Contrôle HTTP](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/scripts/http-qa-art144.mjs) · [Tests ciblés](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9/tests/art-campaign-review.test.mjs)

### Vérifications GitHub

Le commit précédent `91fac577` a réussi la QA générale et la QA navigateur avec le délai de 45 minutes. [QA du parent](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44258347578) · [Navigateur du parent](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44258347677)

Au relevé du 2026-11-18 07:53:49 UTC, les contrôles du commit `0da04c7d608aa491e4b0fe6c14d15f56adfaa4f9` sont les suivants.

- QA — **en cours**. [Exécution 44262396086](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44262396086)
- HTTP browser QA — **en cours**. [Exécution 44262396170](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44262396170)
- Vercel — **en attente**. [Statut](https://vercel.com/darknigthmares-projects/silent-hill-halo-of-flesh/4QZaGoJ7QgNzoPYiuHbzsQuseoBc)

---

## Historique des publications précédentes

Les sections suivantes conservent les chiffres et les relevés de CI tels qu’ils figuraient dans la description avant cette vague. Les compteurs courants sont ceux du commit `0da04c7d` en tête.

## Complément actuel — Screamer et Leonard (18 novembre 2026)

Cette seconde publication ajoute les **vues de combat indépendantes** de Screamer — Downpour et de Leonard Wolf sous sa forme monstrueuse — SH3 original. Avec Scraper, Richard et Weeping Bat du premier sous-lot, la reprise du 18 novembre livre **cinq nouveaux PNG de combat**, avec les sélections antérieures conservées.

- **172 profils illustrés sur 230 ; 58 encore sans image.**
- **30 profils avec une vue de combat distincte ; 142 vues historiques restent à examiner individuellement.**
- **241 PNG de sprites** dans le dépôt ; **48 ajoutés au total dans cette PR**.
- Commit publié : `91fac5778c8fa2882df82eaea0aef79d70fd6221`, parent `e4de8d957cbb2d23856f4cb158a79785c7eba258` ; version **0.9.6**.

### Les deux nouveaux PNG

| Personnage et édition | Pose | Dimensions natives | Fichier |
|---|---|---|---|
| Screamer — Silent Hill: Downpour | Combat vers la droite, griffes et deux pieds entiers | 1197 × 1315 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/downpour_screamer_104.6d78871316ed.png) |
| Leonard Wolf — Silent Hill 3 original, forme monstrueuse | Combat vers la droite, deux bras pointus et deux pieds entiers | 1536 × 1024 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/sh3_leonard_wolf_048.cdbe5f879519.png) |

Screamer conserve sa robe sombre, ses cheveux noirs, ses griffes et ses appuis bandés. Leonard conserve sa tête irrégulière, son corps brun-ocre, ses appendices pointus intégrés aux bras et ses jambes sombres. Les gardes sont légèrement obliques pour rendre les deux bras lisibles.

Chaque référence native apporte un seul angle de l’édition exacte. Les gardes sont recomposées et les surfaces non observées restent non certifiées. Les PNG conservent les octets de génération, sans retouche ni agrandissement. Le fond brun de Leonard visible en ignorant l’alpha ne s’affiche pas dans Canvas. L’échelle relative conserve les paramètres existants du moteur et reste à confronter aux sources.

### Validation du complément et cumul de la reprise

- **Gate complet `npm test` : 1 253 tests réussis, 0 échec, code de sortie 0.**
- **Build vérifié : 322 fichiers, dont 42 JavaScript et 10 HTML.**
- **39 contrôles du vrai moteur avec Canvas natif réussis** pour ce complément ; **2/2 duels inversés et 4/4 portraits** inspectés.
- Les deux sous-lots cumulent **103 contrôles natifs réussis (64 + 39), 6 duels et 10 portraits inspectés**, pour **5 nouveaux PNG**.
- **239/239 anciens PNG, 172/172 portraits et 310/310 fichiers historiques de production et de provenance préservés**. Les trois PNG et les rapports du premier sous-lot sont inclus dans cette préservation.
- Les **170 autres objets du registre sur 172** restent identiques ; seuls les combats de Screamer et Leonard changent. Les deux fichiers importés correspondent aux sorties originales.
- Le roster, le classeur et les anciens journaux sont conservés. Le lecteur de livraisons reconnaît le nouveau journal, et sa régression paramétrée passe.
- **`git diff --check` conforme.**

Les 103 contrôles sont des assertions natives, pas 103 scénarios de gameplay distincts. Les captures vérifient les contours, l’orientation, les appuis, les introductions, 120 mises à jour d’attente et la pause. Elles ne valident pas DOM/CSS, les entrées du navigateur, le service worker, les attaques complètes ou les timings d’animation.

Les cinq images restent **des poses fixes candidates**, sans nouvelle animation, sans UHD native et sans certification 1:1. Le côté opposé utilise le miroir du moteur et ne fournit pas un angle documentaire supplémentaire.

### Cinq dossiers sans image recherchés, aucun débloqué

Le complément examine **Monocle Man — Downpour commercial** et **The Collector — Ascension**. Les vues natives ne suffisent toujours pas : extrémités perdues dans le cadre ou le tunnel pour Monocle Man ; plan large trop sombre et gros plans coupés pour Collector. Le boss prototype restauré de Monocle Man reste exclu.

Avec **Wanderer — Ascension**, **Missionary — Revelation** et **Sad Daddy — Origins PS2** étudiés dans le premier sous-lot, cette reprise documente **cinq dossiers sans image, zéro débloqué**. Aucune génération n’a utilisé ces références insuffisantes. Les rôles hors duel restent inchangés, notamment le statut noncombattant de Monocle Man et de Collector. Tous les refus historiques sont conservés, sans nouvelle tentative.

### CI précédente et durée du navigateur

La [QA du premier sous-lot](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785248), sur `e4de8d9`, est **réussie**. Son [run navigateur](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785154) était encore en cours à 07:15:48 UTC. Le workflow conserve `cancel-in-progress: true` : le nouveau head peut remplacer un run encore actif ; une telle annulation doit rester distinguée de l’ancien arrêt proche de trente minutes.

Sur le head antérieur `fd5b6d8`, l’assertion navigateur de continuation du troisième Rite a explicitement réussi, mais le job global est resté annulé après le rapport positif de son dernier script. La cause liée au délai reste une **inférence**, sans annotation GitHub explicite. Le premier sous-lot a porté le délai du job à **45 minutes**, sans retirer aucune assertion ni modifier les seize scripts. Ce complément ne modifie pas le workflow.

### Preuves et point de reprise

- [Rapport courant du complément](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_COMPLEMENT_2026-11-18.md)
- [Relevé courant des 58 profils manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-status-complement-2026-11-18.json)
- [Imports, usages, références et empreintes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-complement-imports-2026-11-18.json)
- [Journal des deux générations](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-complement-generation-2026-11-18.json)
- [Préservation des PNG, portraits et historiques](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-complement-preservation-2026-11-18.json)
- [Gate complet et log compressé](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/validation-sprite-complement-2026-11-18/summary.json)
- [QA native du complément et captures](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-sprite-complement-2026-11-18/README.md)
- [Recherches Monocle Man et Collector](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-complement-reference-research-2026-11-18.json)
- [Premier sous-lot : Scraper, Richard et Weeping Bat](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_RESUME_2026-11-18.md)
- [Clôture du navigateur précédent et durée du job](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/BROWSER_QA_COMPLETION_2026-11-18.md)

### CI du nouveau head — première lecture

- [HTTP browser QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44258347677) : **en cours**.
- [QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44258347578) : **en cours**.
- [Vercel](https://vercel.com/darknigthmares-projects/silent-hill-halo-of-flesh/564U8G3n6f7DNcNC84XjBNZTHe9d) : **pending**.

Lecture du commit `91fac5778c8fa2882df82eaea0aef79d70fd6221` à **2026-11-18 07:23:39 UTC**. Les statuts ci-dessus sont ceux de cette lecture ; aucune réussite globale du navigateur n’est anticipée.

---

## Historique — premier sous-lot et publications antérieures

**Les chiffres, validations et premières lectures de CI ci-dessous sont historiques. Le premier sous-lot du 18 novembre correspond au commit `e4de8d9` : 28 combats distincts et 239 PNG. Les compteurs actuels du complément, ainsi que les cumuls de la reprise, figurent en tête.**

### Premier sous-lot — Scraper, Richard et Weeping Bat (18 novembre 2026)

Trois personnages déjà illustrés disposent maintenant d’une **vue de combat indépendante de leur sélection**. Le lot conserve les portraits précédents et complète leur rendu en duel.

- **172 profils illustrés sur 230 ; 58 encore sans image.**
- **28 profils avec une vue de combat distincte ; 144 vues historiques restent à examiner individuellement.**
- **3 nouveaux PNG**, soit **239 PNG de sprites dans le dépôt** et **46 ajoutés au total dans cette PR**.
- Commit publié : `e4de8d957cbb2d23856f4cb158a79785c7eba258` ; version du jeu **0.9.6**.

### Les trois vues de combat

| Personnage et édition | Pose | Dimensions natives | Fichier |
|---|---|---|---|
| Scraper — SH3 original | Garde basse vers la droite, deux lames courtes entières | 1435 × 1096 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/sh3_scraper_045.827b9a459105.png) |
| Richard Braintree, Victim 19 — SH4 original | Garde suspendue vers la droite, tuyau courbé entier | 1160 × 1355 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/sh4_richard_braintree_victim_19.845daa5b3742.png) |
| Weeping Bat — Downpour | Garde bipède vers la droite, deux longs bras et deux jambes | 1536 × 1024 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/downpour_weeping_bat_105.b30525a06086.png) |

Richard conserve volontairement ses chaussures légèrement au-dessus du sol. Les armes et les extrémités restent dans le cadre, les personnages regardent leur adversaire et les portraits de sélection ne sont pas utilisés en duel. Weeping Bat a été inspecté dans Canvas : **aucun halo ni rectangle de fond visible**.

Les images conservent les octets natifs de génération, sans retouche ni agrandissement. Les gardes latérales sont recomposées depuis les références documentées. Les rendus Weeping Bat établissent des angles de face ou de trois quarts ; **aucune vue de dos n’est établie**. Les surfaces arrière, les détails fins et le côté opposé obtenu par miroir restent non certifiés.

### Validation et préservation

- **Gate complet `npm test` : 1 252 tests réussis, 0 échec, code de sortie 0.**
- **Build vérifié : 320 fichiers, dont 42 JavaScript et 10 HTML.**
- **64 contrôles du vrai moteur avec Canvas natif réussis**, quatre duels avec inversion des places, **4/4 captures finales** et **6/6 portraits** inspectés.
- **236/236 anciens PNG et 172/172 anciens portraits préservés**, ainsi que **256/256 fichiers historiques de production et de provenance** ; les trois nouveaux PNG correspondent exactement aux sorties générées.
- Les **169 autres objets de registre sur 172** restent identiques. Le roster et le classeur sont conservés.
- Le lecteur de livraisons reconnaît le nouveau journal par son fichier et son empreinte exacts ; sa régression paramétrée passe. L’outil de QA native est conservé sans ajout de dépendance au package ou au lockfile.
- **`git diff --check` conforme.**

Ces preuves sont des rendus du moteur avec Canvas natif ; elles ne valident pas les parcours DOM/CSS, les entrées navigateur ou le service worker. Les nouveaux PNG restent **trois poses fixes candidates**, sans nouvelle animation, sans UHD native et sans certification 1:1.

### Recherches sur les profils encore absents

Trois dossiers ont été réexaminés sans génération ni nouveau profil débloqué :

| Profil exact | Réserve conservée |
|---|---|
| Wanderer — Ascension | Huit vues natives officielles examinées ; obscurité, détails et appuis encore insuffisants. |
| Missionary — Revelation (2012) | Galerie du distributeur et making-of officiel examinés ; chaussures du costume final toujours non établies. |
| Memory of Richard Grady / Sad Daddy — Origins PS2 | Les vues du boss coupent encore le haut du modèle et sa suspension ; vidéo aux textures et à la lumière modifiées. |

Les preuves sont conservées pour la reprise. Les refus historiques, notamment Patient SH4, Robbie à la tronçonneuse et Butcher Origins, restent actifs et n’ont pas été retentés dans ce lot.

### Résultat navigateur précédent et marge de durée

Sur le head précédent `fd5b6d8`, la **QA générale a réussi** : 1251 tests Node et 111 tests de l’importeur. Le contrôle navigateur **« Rite 3 advances from a coherent match end to its next prepared encounter » a explicitement réussi**, à 23:14:16 UTC le 17 novembre.

Le job navigateur global reste **annulé**, après le rapport positif de son dernier script, art92 (**424 contrôles et 47 captures**). Le minutage est cohérent avec la limite de trente minutes ; cette cause reste une **inférence**, sans annotation explicite GitHub.

La seule modification du workflow porte `jobs.browser.timeout-minutes` de **30 à 45 minutes** pour laisser une marge de fermeture des processus et de variabilité du runner. Les seize scripts, toutes leurs assertions, les permissions et les artefacts sont inchangés. Aucun test supplémentaire n’a été lancé pour cette ligne de configuration, et le run annulé n’est pas présenté comme une réussite globale.

### Preuves et reprise

- [Rapport du lot, sources, limites et trois PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_RESUME_2026-11-18.md)
- [Relevé courant des 58 profils manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-status-resume-2026-11-18.json)
- [Imports, usages et empreintes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-resume-imports-2026-11-18.json)
- [Journal des générations](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-resume-generation-2026-11-18.json)
- [Préservation des fichiers et portraits](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-resume-preservation-2026-11-18.json)
- [Gate complet et log compressé](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/validation-sprite-resume-2026-11-18/summary.json)
- [QA native et captures](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-sprite-2026-11-18/README.md)
- [Recherche des trois profils absents](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-resume-reference-research-2026-11-18.json)
- [Clôture de la CI précédente et durée du job](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/BROWSER_QA_COMPLETION_2026-11-18.md)

### CI du nouveau head — première lecture

- [QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785248) : **en cours**.
- [HTTP browser QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44256785154) : **en cours**.
- [Vercel](https://vercel.com/darknigthmares-projects/silent-hill-halo-of-flesh/Gx58ogUq2FwXfR3TW3y8PEfeQEWU) : **success**.

Lecture du commit `e4de8d957cbb2d23856f4cb158a79785c7eba258` à **07:12 UTC le 18 novembre**. La CI complète de ce nouveau head n’est pas encore déclarée réussie.

---

## Historique — état avant la reprise du 18 novembre

**Tous les chiffres, validations et premières lectures de CI ci-dessous sont historiques. Le lot immédiatement précédent correspond au commit `fd5b6d8` : 172 profils illustrés, 25 vues de combat distinctes et 236 PNG. Les compteurs courants et la clôture de sa CI figurent en tête.**

### Suite historique — Insane Cancer Arcade, Walter et Bogeyman Downpour

Cette suite complète un profil encore absent, ajoute deux vues de combat distinctes et corrige un défaut de cache qui pouvait bloquer la continuation d’un Rite entre deux adversaires individuellement admissibles.

- **172 profils illustrés sur 230 ; 58 encore sans image.**
- **25 profils avec une vue de combat distincte de la sélection ; 147 vues historiques restent à auditer individuellement.**
- **4 nouveaux PNG** dans ce lot ; **236 PNG de sprites dans le dépôt**, dont **43 ajoutés au total dans la PR**.
- Commit publié : `fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4` ; version du jeu **0.9.6**.

### Les quatre nouveaux PNG

| Personnage et édition | Usage | Dimensions natives | Fichier |
|---|---|---|---|
| Insane Cancer — The Arcade | Sélection entière | 1199 × 1312 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/arcade_insane_cancer_arcade.af065e6db36b.png) |
| Insane Cancer — The Arcade | Combat latéral droit | 1297 × 1212 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/arcade_insane_cancer_arcade.05cd8a4b7672.png) |
| Walter Sullivan adulte — SH4 original | Combat latéral droit, deux pistolets | 1024 × 1536 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/sh4_walter_sullivan_072.f7a3056ad30d.png) |
| Bogeyman — Downpour | Combat latéral droit, masse entière | 1024 × 1536 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/downpour_bogeyman_115.f6de13b5497f.png) |

Les portraits antérieurs de Walter et de Bogeyman sont conservés. Insane Cancer possède une sélection et un combat indépendants, associés précisément à l’édition Arcade. Sa référence associe la capture native Arcade15 à la carte explicitement nommée du modèle extrait à 6:30 et à ses vues continues de 6:40 à 7:30. Les vignettes de cette démonstration font **120 × 90 px**, et les fichiers natifs y sont convertis en MDL7 : elles établissent les jambes et les pieds visibles, sans certifier les détails fins ou la géométrie 1:1.

### Continuation des Rites : cache corrigé

Le précédent head `c2a9fc4a` a passé la QA générale, mais son job HTTP navigateur a échoué sur l’assertion de continuation du troisième Rite. Le seed exact de ce run n’est pas disponible ; le diagnostic distingue ce constat du cas reproduit.

La transition valide **Air Screamer + Numb Body → Air Screamer + Split Head** retenait toute l’ancienne paire et toute la nouvelle : **69 209 432 octets décodés**, au-delà du budget de **67 108 864 octets (64 MiB)**. Après la fin du match, le code conserve les clips finaux encore nécessaires et prépare la nouvelle paire complète : **50 336 864 octets**.

Un combat encore actif ou une manche réversible conserve toutes ses poses. Une sortie animée garde toutes ses frames ; les images du décor précédent restent disponibles. Les erreurs de décodage et les annulations conservent les images utiles de l’ancien résultat. **Le budget, les règles de progression et l’assertion navigateur restent inchangés.**

### Validation de cette suite

- **Tests Node complets : 1 251 réussis, 0 échec.**
- **110 tests ciblés réussis** pour le cache, les présentations et les clips ; régression sur la transition Numb Body → Split Head, attente et échec de décodage, restauration, réessai et respect du budget.
- **Gate complet `npm test` : code de sortie 0 ; build vérifié de 317 fichiers, dont 42 JavaScript et 10 HTML.** Après un premier échec de copie du build dû à `ENOSPC`, le gate entier a réussi dans un snapshot sous `/tmp` : **820 fichiers d’entrée identiques**, aucun écart produit par les générateurs ou tests, et empreintes de distribution conformes.
- **78 contrôles du vrai moteur avec Canvas natif réussis** : quatre duels dans les deux ordres, huit rendus de portraits ; captures finales inspectées.
- **232 / 232 PNG antérieurs et 171 / 171 anciens portraits préservés**, ainsi que les anciens journaux, le roster et le classeur.
- **`git diff --check` conforme.**

Les preuves Canvas sont des rendus natifs du moteur. Elles ne constituent pas une validation DOM/CSS/service worker ni une réussite de la nouvelle CI navigateur. Les PNG restent des **poses fixes candidates**, sans nouvelle animation, sans UHD native et sans certification 1:1.

Le combat du **Patient — SH4** a été refusé au stade `output`, catégories `sexual` et `violence` : **un appel, zéro image, aucun réessai**. Son entrée existante et son portrait sont préservés. Wood Guardian BoM, Greedy Worm Arcade, Toadstool Arcade et Ghost BoM conservent leurs réserves de source, d’identité ou d’anatomie ; aucune substitution d’une autre édition n’a été faite.

### Preuves et reprise

- [État de cette suite et sources](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_FOLLOWING_2026-11-17.md)
- [Relevé courant des profils manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-status-following-2026-11-17.json)
- [Imports, usages et empreintes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-following-imports-2026-11-17.json)
- [Préservation des fichiers et portraits](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-following-preservation-2026-11-17.json)
- [Gate complet, log compressé et empreintes du snapshot](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/validation-sprite-following-2026-11-17/summary.json)
- [QA native de cette suite](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-sprite-following-2026-11-17/README.md)
- [Diagnostic du cache des Rites](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/BROWSER_QA_RITE_CACHE_2026-11-17.md)
- [Recherche des références et réserves conservées](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-following-reference-research-2026-11-17.json)

### CI du nouveau head

- [QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059644) : **en cours**.
- [HTTP browser QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44197059597) : **en cours**.
- Vercel : **success** — [statut](https://vercel.com/darknigthmares-projects/silent-hill-halo-of-flesh/CRvPVq6xqeFztBCqJ2Vidi68VT45).

Lecture du commit `fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4` à 23:12 UTC : QA et HTTP navigateur en cours, Vercel réussi. La CI complète du nouveau head n’est pas encore déclarée réussie ; le contrôle navigateur de continuation des Rites reste à observer.

---

## Historique — état publié avant cette suite

**Les chiffres et validations ci-dessous sont historiques. La suite immédiatement précédente correspond au commit `c2a9fc4acf1934294bb39d29e6759c747e90d87d` : 171 profils illustrés, 59 manquants, 22 vues de combat distinctes. Les compteurs actuels figurent en tête. Les statuts CI cités dans l’ancienne section sont sa première lecture à la publication ; le diagnostic actuel ci-dessus décrit le résultat final observé.**

### Suite précédente — Steel Guardian, Anne et Juggernaut (171/230)

Cette suite complète un profil encore sans image et ajoute les poses de combat distinctes de deux personnages déjà illustrés.

- **171 profils illustrés sur 230 ; 59 encore sans image.**
- **22 profils avec une pose de combat latérale distincte de la sélection ; 149 vues historiques restent à auditer individuellement.**
- **4 nouveaux PNG** dans ce lot ; **39 PNG ajoutés au total dans la PR**.
- Commit publié : `c2a9fc4acf1934294bb39d29e6759c747e90d87d` ; version du jeu **0.9.6**.

### Les quatre nouveaux PNG

| Personnage et édition | Usage | Dimensions natives | Fichier |
|---|---|---|---|
| Anne Cunningham — Downpour | Combat latéral droit | 1024 × 1536 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/downpour_anne_cunningham.23e6f56e2c49.png) |
| Prisoner Juggernaut — Downpour | Combat latéral droit | 1239 × 1269 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/downpour_prisoner_juggernaut_110.08ce5a51a4d6.png) |
| Steel Guardian — Book of Memories | Sélection entière | 1774 × 887 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/bom_steel_guardian_146.34f6a40e4729.png) |
| Steel Guardian — Book of Memories | Combat latéral droit | 1536 × 1024 | [PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/assets/sprites/bom_steel_guardian_146.221d68a36f7a.png) |

Les portraits précédents d’Anne et du Juggernaut sont conservés. Steel Guardian possède deux images indépendantes ; son clip de combat utilise exclusivement la vue latérale.

Les références Steel combinent le modèle texturé de John Hershberg et deux vues natives de Book of Memories, à 14:18:10 et 14:18:30 du longplay documenté. Les vignettes vidéo font seulement **160 × 90 px** et se complètent : le nombre précis de lames, les maillons, les parties masquées et les surfaces arrière ne sont pas certifiés. La pose latérale est recomposée.

### Validation de cette suite

- **`npm test` : 1 247 réussis, 0 échec** ; build vérifié de 313 fichiers.
- **78 contrôles du vrai moteur avec Canvas natif réussis** : 4 duels dans les deux orientations, 8 rendus de portraits ; 4 captures finales de duel et 2 portraits Steel inspectés.
- **228 / 228 PNG antérieurs et 170 / 170 anciens portraits préservés** ; les quatre nouveaux fichiers correspondent aux sorties générées.
- **`git diff --check` conforme.**
- Le délai du job navigateur passe de **12 à 30 minutes**, sans suppression ni raccourcissement de tests. Le précédent run s’est arrêté après 12 suites sur 16 ; les éléments relevés rendent le dépassement du délai très probable, sans annotation GitHub formelle de cause.

Ces preuves Canvas sont des rendus natifs du moteur ; elles ne constituent pas des captures de navigateur. Les nouveaux PNG sont des **poses fixes candidates** : aucune nouvelle animation complète, aucune UHD native et aucune certification 1:1.

Le combat du **Butcher — Origins** a été refusé au stade `output`, catégorie `violence` : **un appel, zéro image, aucun réessai**. Son sprite existant reste conservé ; les refus historiques gardent leurs dossiers distincts.

### Preuves et reprise

- [SPRITE_SUITE : état actuel, sources, limites et quatre PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_SUITE_2026-11-17.md)
- [Relevé courant des 59 profils manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-status-suite-2026-11-17.json)
- [Imports et empreintes](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-suite-imports-2026-11-17.json)
- [Rapport de préservation](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-suite-preservation-2026-11-17.json)
- [QA native de cette suite](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-sprite-suite-2026-11-17/README.md)
- [Diagnostic du délai navigateur](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/BROWSER_QA_TIMEOUT_2026-11-17.md)

### CI du nouveau head — première lecture après publication

- [QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44190615216) : **en cours**.
- [HTTP browser QA](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44190615221) : **en cours**.
- Statut Vercel : **pending**.

Ces statuts correspondent à la première lecture du commit `c2a9fc4a` ; la CI complète n’est pas encore déclarée réussie.

---

## Historique des lots précédents

**Les chiffres et résultats ci-dessous décrivent l’état antérieur à cette suite, au commit `dfd9c7f3d0b082dc0794e9f502246ffb630269da`.** Les compteurs actuels et la validation du nouveau lot sont ceux de la section en tête.

### Pourquoi

Les créations de deux reprises locales n’étaient pas toutes présentes dans la PR : leurs registres séparés pouvaient faire paraître des sprites déjà produits comme manquants. Cette suite récupère ces fichiers, sépare les usages sélection/combat et poursuit la génération sur les références disponibles.

### Résultat historique avant cette suite — 170/230

- **170 profils illustrés sur 230 ; 60 profils encore sans image.**
- **19 profils avec un sprite de combat latéral distinct de leur sélection.**
- **151 vues historiques de combat restent à auditer individuellement.**
- **35 PNG ajoutés dans l’ensemble de cette PR** : 9 premiers PNG, 22 originaux récupérés, 4 nouveaux PNG.
- Version du jeu conservée : **0.9.6**.

#### Nouveau lot : quatre PNG

| Profil | Sélection | Combat |
|---|---|---|
| Double Head — The Arcade | Nouvelle image entière | Nouveau profil latéral vers la droite |
| Eddie Dombrowski — SH2 original | Portrait antérieur conservé | Nouveau profil latéral avec revolver |
| Missionary — SH3 | Portrait antérieur conservé | Nouveau profil latéral avec deux lames |

Double Head est reconstruit depuis une capture attribuée à The Arcade ; aucune variante SH3/Book of Memories ne lui est substituée. Eddie et Missionary gardent leur édition, leur portrait et leur équipement.

#### Récupération des reprises

Les **22 originaux récupérés** comprennent les sélections et combats de Hummer, Tremer, Tuberculosis, Mama, Split Worm Arcade et Fighter d’Ascension, le combat de Pyramid Head Great Knife et les neuf premiers ajouts de combat. Leurs empreintes sont préservées.

Le moteur et l’atelier distinguent désormais les portraits de sélection et les frames de combat. Les quatre entrées de la seconde reprise ont été normalisées pour que leurs portraits ne soient plus tirés comme des frames de duel. Les journaux d’import sont liés aux fichiers par ID, édition, usage et SHA-256 ; les blocages et exclusions historiques restent archivés.

### Vérifications historiques des lots précédents

- **`npm test` final : 1 246 réussis, 0 échec.**
- Build final vérifié : **309 fichiers**, 42 JavaScript, 10 HTML.
- Tests Python import/clips de récupération : **68 réussis**.
- QA HTTP et rendu natif du vrai `FightEngine` : **175 contrôles réussis**, 18 portraits, 10 duels dans les deux orientations, 10 captures finales inspectées après les introductions et 120 ticks d’attente.
- Silhouettes, lames, pieds et queues complets ; orientation face à l’adversaire ; sélection jamais utilisée à la place du nouveau combat ; transparence et appuis vérifiés.
- Les **224 PNG antérieurs au nouveau lot sont inchangés** ; les quatre nouveaux fichiers correspondent exactement aux sorties générées.
- **`git diff --check` réussi.**

### Limites conservées

Ces PNG sont des **poses fixes candidates**, sans nouveau cycle animé ni fidélité 1:1 certifiée. Les quatre nouveaux fichiers ont pour dimensions natives 1536×1024, 1774×887, 1024×1536 et 1436×1096 ; aucune UHD native revendiquée.

Les preuves de rendu utilisent un canevas natif du vrai moteur : **aucune session navigateur n’est revendiquée**. Le blocage Chromium antérieur n’a pas été retenté. DOM, CSS, entrées navigateur, service worker et animations complètes ne sont pas validés par ce protocole.

La nouvelle génération de combat de Robbie à la tronçonneuse a été refusée par l’outil au stade output, catégorie other ; un appel, aucune image livrée, aucun réessai. Sa sélection reste conservée. Les autres refus historiques restent distincts.

Le classeur de production, les identifiants, les règles de combat et les anciennes animations sont préservés. La PR reste ouverte en brouillon ; aucun déploiement ni fusion effectué.

### Reprise et preuves

- [État courant et quatre nouveaux PNG](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_NEXT_2026-11-17.md)
- [Relevé machine des 60 manquants](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-status-next-2026-11-17.json)
- [Récupération des 22 originaux](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/SPRITE_RECONCILIATION_2026-11-17.md)
- [Imports, empreintes et références](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/sprite-next-imports-2026-11-17.json)
- [Captures et rapports du moteur](https://github.com/darknigthmare/silent-hill-halo-of-flesh/blob/art/missing-fullbody-20261117/docs/production/qa-sprite-next-2026-11-17/README.md)


### Vérification CI historique du commit dfd9c7f

Le commit `dfd9c7f3d0b082dc0794e9f502246ffb630269da` fixe le runner du job navigateur sur **Ubuntu 24.04**, pris en charge par la version Playwright 1.57 du projet. Le runner `ubuntu-latest` était passé à Ubuntu 26.04 et échouait avant les tests. Seule cette ligne de configuration a changé.

- [QA GitHub du commit final](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44184519686) : **réussie**, y compris le code, les fichiers générés et l’import des sprites.
- [HTTP navigateur du commit précédent](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/44184519620) : **annulée après 12 suites sur 16** ; les rapports complets totalisent 977 contrôles réussis, sans échec. Cette exécution partielle ne vaut pas validation complète. Le diagnostic et le passage de 12 à 30 minutes sont documentés dans la suite actuelle.

Les résultats locaux et les preuves du rendu natif listés ci-dessus restent distincts de ces exécutions CI.
