# Passe 20 — groupe B : quatre arènes Silent Hill f

Trace de la livraison isolée avant intégration : **4 fonds opaques + 4 premiers plans à alpha réel**, tous en **1672 × 941**, soit **9 950 474 octets** de PNG. Les sorties natives ont été conservées sans traitement des pixels. Les huit fichiers intégrés se trouvent sous `assets/stages/` à la racine du dépôt ; ce dossier conserve leur provenance et leurs rapports.

`delivery.json` fournit les tableaux `stages` et `assets` demandés. Chaque asset inclut son chemin local de session, son chemin cible versionné par SHA, sa taille, ses dimensions, ses mesures d’alpha, le prompt complet, les références inspectées et leurs empreintes. `references.json` conserve les URL et empreintes des sources. Le répertoire `references/` contenant les captures et pages consultées appartenait au dossier de travail isolé et n'est pas embarqué dans le dépôt. Le contenu intégré est constitué des huit fichiers indiqués dans `assets` ; les autres fichiers de ce dossier sont des traces d’audit.

| ID | Scène du descripteur | Salle ou état retenu | Alpha nul du premier plan |
|---|---|---|---:|
| `dark_shrine` | `shrine-vault-forecourt-closed` | Parvis extérieur devant Shrine Vault fermé, petit Hokora latéral | 97,93 % |
| `school_shf` | `staff-room-key-cabinet` | Bureau du personnel au coffret de clés et tableau de planning | 94,98 % |
| `hinako_home` | `residence-i-entry-corridor` | Corridor de sortie de Residence I, porte quadrillée et plancher bois | 93,88 % |
| `corrupted_ebisugaoka` | `shimizu-forecourt-part5` | Parvis Shimizu de la partie 5, façade, pots, linge, vélo et flore rouge | 94,22 % |

Les politiques source ne comportaient pas de `sceneId`. Les chaînes `scene` ci-dessus sont donc des identifiants descriptifs nouveaux du bitmap, attachés aux lieux déjà documentés ; aucune politique du dépôt n’a été modifiée.

## Contrôles effectués

Les huit sorties et les cinq captures natives, y compris la capture écartée, ont été inspectées visuellement. Les quatre fonds sont des PNG RGB entièrement opaques. Les quatre premiers plans sont des PNG RGBA à alpha 0–255, avec de vrais espaces transparents.

La bande d’appui contrôlée correspond à x = 20–80 % et y = 80–86 % ; le sol du moteur est à y = 594/720 = 82,5 %. Elle ne contient **aucun pixel à alpha ≥ 32** dans les quatre premiers plans. Quelques résidus natifs de 1 à 3/255 subsistent par endroits dans les zones centrales et sont mesurés dans le manifeste ; ils n’ont pas été modifiés. Les détails opaques restent aux marges. Le vélo est coupé par le bord gauche comme dans la capture et laisse le centre libre.

`descriptor-validation.json` confirme l’acceptation des quatre descripteurs par les fonctions du dépôt `validateStageBitmap`, `stageBitmapFor` et `stageBitmapFrames`, avec huit frames uniques et des métadonnées/SHA conformes aux fichiers. Les quatre IDs étaient absents du registre lors de ce contrôle. Les références ont aussi été rehachées, et chaque PNG a le même SHA que sa sortie imagegen native.

Les deux couches de chaque arène sont statiques, avec une frame chacune, sans boucle ; le premier plan propose un décalage horizontal très faible (`parallaxX: 0.006`). **Aucun nouveau clip animé** n’est créé. Le contrôle composite effectué après intégration est consigné dans [native-visual-review.json](native-visual-review.json) ; il est distinct du relevé de livraison initial.

## Shimizu salle à manger : report documenté

La cible initiale `shimizu_residence` a été reportée pour incohérence d’état, puis remplacée par `corrupted_ebisugaoka` avec validation du parent.

Le contrat local désigne Residence I et la salle à manger du Yellowed Calendar (`data/stages.json`, champs `lore.premise` et `reference.locationNote`, lignes 34284/34419 au relevé ; `docs/production/research/extended.json`, `locationNote`, ligne 23674). Le [guide consulté](https://www.silenthillmemories.net/shf/walkthrough_11_shimizu_residence_en.htm) place la scène du calendrier jauni sous **Shimizu Residence II** : titre à la ligne 592 du HTML archivé, passage de salle à manger à la ligne 604, puis [capture associée](https://www.silenthillmemories.net/shf/walkthrough/pics/11_yellowed_calendar_a.jpg). La capture du corridor de sortie de Residence I est immédiatement avant ce titre et reste exploitable pour `hinako_home`.

La capture de remplacement est celle du [parvis devant Shimizu](https://www.silenthillmemories.net/shf/walkthrough/pics/10_shimizu_residence.jpg), documentée dans le [guide Ebisugaoka partie 5](https://www.silenthillmemories.net/shf/walkthrough_10_ebisugaoka_part_5_en.htm). La façade, les pots, la bicyclette à gauche et la végétation rouge ont été confirmés visuellement. Le manifeste conserve les deux jeux de preuves et leurs SHA.

## Limites de reconstruction

Les décors sont des candidats générés à partir de captures natives de la bonne pièce et du bon état. Le cadrage a été rapproché d’une vue latérale frontale, avec un sol praticable lisible. Les parties occultées, les marges, les proportions et la topologie complète sont reconstruits : aucune fidélité géométrique 1:1 ni UHD n’est certifiée.

Le bureau conserve ses repères architecturaux, avec retrait des clés portables et du ventilateur du prototype ; les petites inscriptions du planning ne sont pas une transcription certifiée. Dans le corridor, le petit calendrier est un repère et la prise murale générée n’est pas présentée comme une preuve d’accessoire source. Les jambages proches sont une adaptation des matériaux observés. Le vélo du parvis est déporté dans le premier plan séparé. La brume, la végétation, les lanternes et les autres éléments visibles restent figés dans les PNG.

Les scripts de session `build-delivery.py` et `validate-descriptors.mjs` appartenaient au dossier de travail isolé et ne sont pas fournis dans ce paquet Git. Leur résultat est conservé dans `delivery.json` et `descriptor-validation.json`. Aucun personnage, portrait, moveset, classeur, registre, moteur, test, commit ou publication n’a été modifié par ce groupe de production ; l'intégration est documentée dans le rapport parent.
