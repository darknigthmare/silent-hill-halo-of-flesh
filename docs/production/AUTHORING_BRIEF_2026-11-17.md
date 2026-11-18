# Dossier d’authoring — assets manquants et correspondance lore

Généré le 2026-11-17 depuis les données du dépôt. **76 profils sans image acceptée**, **117 arènes sans bitmap**, 154/230 sprites candidats intégrés, 0 fidélité 1:1 certifiée.

Statuts conservés séparément : identité documentée, comportement documenté, candidat importé, clip animé, fidélité vérifiée.

Une description documentée n’est ni une capture, ni une mesure de timing, ni une validation 1:1.

Une image ou un décor produit depuis ce dossier reste un **candidat** tant qu’une revue visuelle réelle ne l’a pas validé.

## Comment utiliser ce dossier

1. Choisir un profil ou une arène ci-dessous ; lire la base canonique, les gestes documentés et les contraintes.
2. Relever la capture ou la référence manquante avant de dessiner : la ligne « capture à relever » indique le blocage réel.
3. Produire une image individuelle transparente par pose, puis passer par `python scripts/import-sprite.py` (sprites) ou une entrée `STAGE_BITMAPS` (décors).
4. Après import : `npm run sprites:check`, `npm test`, puis revue visuelle en jeu. Un import réussi n’est pas une certification lore.

## Synthèse par œuvre

| Œuvre | Sprites manquants | Arènes sans bitmap |
|---|---:|---:|
| SILENT HILL (1999) | 2 | 7 |
| SILENT HILL 2 (2001) | 7 | 9 |
| SILENT HILL 3 (2003) | 4 | 11 |
| SILENT HILL 4: THE ROOM (2004) | 7 | 10 |
| SILENT HILL: ORIGINS (2007) | 2 | 6 |
| SILENT HILL: HOMECOMING (2008) | 3 | 11 |
| SILENT HILL: SHATTERED MEMORIES (2009) | 0 | 5 |
| SILENT HILL: DOWNPOUR (2012) | 6 | 7 |
| SILENT HILL: THE ARCADE (2007) | 15 | 12 |
| SILENT HILL: BOOK OF MEMORIES (2012) | 9 | 8 |
| P.T. (2014) | 1 | 1 |
| SILENT HILL: THE SHORT MESSAGE (2024) | 0 | 3 |
| SILENT HILL f (2025) | 6 | 9 |
| SILENT HILL — FILM UNIVERSE (2006) | 9 | 8 |
| SILENT HILL: ASCENSION (2023) | 5 | 3 |
| SILENT HILL: TOWNFALL (2026) | 0 | 7 |

## 1. Sprites manquants

Poses exigées par le moteur pour chaque profil : idle, walk, crouch, jump, guard, dodge, hurt, knockdown, ko, phase, gestes d’attaque (20 emplacements de moveset), intro, winRound, loseRound, winMatch, loseMatch, outro, finisher, finished, taunt. Une pose absente ne doit jamais être fabriquée en recyclant `idle`.

### `sh1_monster_cybil_017` — Monster Cybil

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `lakeside_amusement`
- **Comportement canonique déclaré :** Tirs de pistolet et pression rapprochée sous contrôle parasitaire.
- **Comportement lore :** Manifestation associée à SILENT HILL.
- **Références :** `CL_SH1_14_LAKESIDE_AMUSEMENT_PARK`, `CL_SH1_BOSSES`
- **Gestes documentés :**
  - **Tir** — Tir de pistolet qui renverse Harry ; la décompilation SH1 NTSC 1.1 associe cette balle à l’attaque 63 et à une projection de face ou de dos. (CL_SH1_14_LAKESIDE_AMUSEMENT_PARK, CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Contact armé** — Dans la phase où elle tient encore son pistolet, Cybil peut frapper Harry avec la crosse à courte distance ; ce geste reste distinct du tir et de la saisie désarmée. (CL_SH1_14_LAKESIDE_AMUSEMENT_PARK, CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Sans arme** — Après l’abandon du pistolet, tente surtout de saisir Harry au cou pour l’étrangler et peut aussi frapper du bras. Les commandes directionnelles et d’épaule accélèrent la libération dans SH1 ; aucune alternance libre entre arme et prise n’est canonisée. (CL_SH1_14_LAKESIDE_AMUSEMENT_PARK, CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Munitions épuisées** — Le guide décrit dix tirs puis l’abandon du pistolet et le passage aux attaques désarmées. Le nombre appartient à la rencontre SH1 documentée ; fenêtres et gestion de munitions du prototype doivent rester explicitement adaptées. (CL_SH1_14_LAKESIDE_AMUSEMENT_PARK, CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Résolution alternative** — L’Unknown Liquid récupéré à l’hôpital peut être utilisé à proximité pour expulser le parasite et sauver Cybil ; cette résolution de l’histoire n’est ni un projectile offensif ni une résurrection de manche. (CL_SH1_14_LAKESIDE_AMUSEMENT_PARK, CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Cybil possédée ; garder les phases armée/désarmée distinctes.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Service possédé [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 16 composites, 4 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh1_incubus_019` — Incubus

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `nowhere`
- **Comportement canonique déclaré :** Entité ailée lançant des salves électriques.
- **Comportement lore :** Manifestation associée à SILENT HILL.
- **Références :** `CL_SH1_BOSSES`, `CL_SH1_CREATURES`
- **Gestes documentés :**
  - **Foudre** — Série de décharges rouges. (CL_SH1_BOSSES, CL_SH1_CREATURES) — *documente-secondaire · capture-a-relever*
  - **État du boss** — Forme ailée suspendue ; branche différente. (CL_SH1_BOSSES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Forme ailée, en hauteur.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Foudre du démon [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_mannequin_022` — Mannequin

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `woodside`
- **Comportement canonique déclaré :** Reste immobile puis attaque avec ses membres doubles.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2_ENEMIES`, `CL_SH2_CREATURES`
- **Gestes documentés :**
  - **Frappe** — Coup de jambe supérieure. (CL_SH2_ENEMIES, CL_SH2_CREATURES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Deux paires de jambes ; ni tête ni bras humains.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Ciseaux de jambes [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_mannequin_ambusher_023` — Mannequin — Ambusher

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** CREATURE · variante de `Mannequin`
- **Rôle de combat :** combatant · identité : remake-2024-mal-etiquete
- **Note d’identité :** Profil de comportement du remake (2024) stocké sous source SH2 (2001). Séparer métadonnées et capture.
- **Arène d’affectation :** `woodside`
- **Comportement canonique déclaré :** Variante d’embuscade adaptée des rencontres du remake.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2R_MONSTERS`, `CL_SH2R_DEV`
- **Gestes documentés :**
  - **Embuscade** — Attend caché, puis frappe. (CL_SH2R_MONSTERS, CL_SH2R_DEV) — *documente-secondaire · capture-a-relever*
  - **Repli** — Se déplace entre les abris. (CL_SH2R_MONSTERS, CL_SH2R_DEV) — *documente-secondaire · capture-a-relever*
  - **Attente immobile** — Dissimulation avant réaction à l’approche. (CL_SH2R_MONSTERS) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Cachette et ambuscade ; aucune grimpe au plafond ajoutée sans profil Spider.
  - Deux paires de jambes ; ni tête ni bras humains.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Embuscade murale [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_flesh_lip_027` — Flesh Lip

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `brookhaven_sh2`
- **Comportement canonique déclaré :** Corps enfermé dans un cadre métallique, saisies et chutes verticales.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2_05_BROOKHAVEN_HOSPITAL`, `CL_SH2_CREATURES`, `CL_SH2_BOSSES`
- **Gestes documentés :**
  - **Pieds** — Dans le duel original2001 de Brookhaven, les pieds du Flesh Lip saisissent James, le soulèvent et l’étranglent lorsqu’il approche. Le guide conseille les commandes directionnelles et d’épaule pour se libérer plus vite. Ce maintien aérien reste distinct d’un plaquage au sol ou des pattes du remake. (CL_SH2_05_BROOKHAVEN_HOSPITAL, CL_SH2_CREATURES, CL_SH2_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Coup** — Le guide distingue une poussée ou un coup des pieds vers l’avant de la prise étrangleuse. Ne pas remplacer ces pieds par une arme, des bras offensifs ou une patte articulée de la version2024 ; contact, portée et recul restent à relever dans le jeu original. (CL_SH2_05_BROOKHAVEN_HOSPITAL, CL_SH2_CREATURES, CL_SH2_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Suspension 2001** — La rencontre2001 montre des créatures suspendues dans leurs cages au plafond ; le guide fait viser les armes vers le haut pour les atteindre. Cette hauteur propre ne prouve pas une marche, un saut libre, une chute récurrente ou l’ouverture d’une forme arachnéenne. (CL_SH2_05_BROOKHAVEN_HOSPITAL, CL_SH2_BOSSES) — *documente-secondaire · capture-a-relever*
  - **Rencontre multiple** — Le guide du jeu original décrit deux Flesh Lips au début puis une troisième créature qui tombe du plafond après les premières destructions, ou parfois plus tôt si le combat dure. Cette progression multi-adversaire ne crée pas un second corps à partir du combattant unique du versus. (CL_SH2_05_BROOKHAVEN_HOSPITAL, CL_SH2_BOSSES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Cage suspendue 2001 ; pas de pattes dépliantes du remake.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Cage suspendue [adapted-from-canonical-behavior] · NIGHTMARE — Suspension finale [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_mary_final_manifestation_034` — Mary — Final Manifestation

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : variante-documentee
- **Note d’identité :** Mary/Maria dépend de la branche de fin ; même famille de boss, contexte narratif à préserver.
- **Arène d’affectation :** `hotel_otherworld`
- **Comportement canonique déclaré :** Variante narrative de la manifestation finale.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2_BOSSES`, `CL_SH2_CREATURES`
- **Gestes documentés :**
  - **Renvoi au jeu de gestes de base** — Le guide original traite la rencontre finale sous le nom Mary/Maria et décrit les mêmes deux attaques : nuée de papillons et saisie par l’appendice sombre depuis le cadre aérien. Cette fiche garde son identité de fin distincte ; aucune capacité supplémentaire n’est déduite du changement de nom. (CL_SH2_BOSSES, CL_SH2_CREATURES) — *heritage-documente · capture-variante-a-relever*
- **Contraintes de référence :**
  - L’essaim de papillons peut entraver James ; la durée, la portée et le ralentissement du moteur sont des adaptations du versus, sans relevé officiel de frames.
  - Aucune identité finale universelle ; ne pas importer la version 2024 à pattes mécaniques.
  - Cage suspendue 2001 ; séparer identité de l’issue narrative.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Lit de souffrance [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_prisoner_035` — Prisoner

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** CREATURE
- **Rôle de combat :** noncombatant · identité : presence-invisible-documentee-role-a-preciser
- **Note d’identité :** Deux présences invisibles de Toluca Prison sont visables, vulnérables et tuables. Leur existence est documentée ; les pages relues ne prouvent pas directement leur non-hostilité. Le blocage du duel reste conservateur, sans décision de rôle validée.
- **Arène d’affectation :** `toluca_prison`
- **Comportement canonique déclaré :** Présences invisibles documentées, que James peut viser et tuer ; hostilité propre non confirmée, dossier hors duel.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_PRISONER`, `CL_SH2_CREATURES`, `EXT_SH2_FAQ_20261024`, `EXT_SH2_ODDITIES_20261024`
- **Gestes documentés :**
  - **Présence** — Deux présences invisibles se trouvent dans les blocs nord et sud de Toluca Prison ; James peut les viser, les blesser et les tuer, provoquant des cris humains. Les vocalisations sont perçues comme « ritual ». Ces pages ne prouvent pas explicitement leur non-hostilité. (CL_PRISONER, CL_SH2_CREATURES, EXT_SH2_FAQ_20261024, EXT_SH2_ODDITIES_20261024) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Aucun modèle visible à déclarer 1:1.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
  - La possibilité de viser, blesser et tuer la présence invisible ne prouve pas qu’elle attaque James ou qu’elle est inoffensive ; le rôle reste à décider faute de preuve directe.
- **Fatalités du profil (2) :** Rituel de clôture — Présence derrière les barreaux [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_spider_mannequin` — Spider Mannequin

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** CREATURE · variante de `Mannequin`
- **Rôle de combat :** combatant · identité : remake-2024-mal-etiquete
- **Note d’identité :** Remake 2024 ; le source/year général SH2 (2001) ne suffit pas.
- **Arène d’affectation :** `blue_creek`
- **Comportement canonique déclaré :** Variante du remake qui s’agrippe aux murs et plafonds avant de bondir.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2R_MONSTERS`, `CL_SH2R_DEV`
- **Gestes documentés :**
  - **Grimpe** — Parcourt murs et plafonds. (CL_SH2R_MONSTERS, CL_SH2R_DEV) — *documente-secondaire · capture-a-relever*
  - **Saut** — Bondit depuis un support élevé. (CL_SH2R_MONSTERS, CL_SH2R_DEV) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Variante remake 2024 ; supports de grimpe nécessaires.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Embuscade arachnéenne [adapted-from-canonical-behavior] · NIGHTMARE — Cocon du cauchemar [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh2_mandarin_floor_form` — Mandarin — Floor Form

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Catégorie :** CREATURE · variante de `Mandarin`
- **Rôle de combat :** unverified · identité : adaptation-non-canonique
- **Note d’identité :** « Floor Form » est une adaptation déclarée du projet, pas une variante canonique établie. Le commentaire de création du Mandarin original l’exclut de la surface ; il ne donne pas pour autant un rôle canonique à ce dossier inventé.
- **Arène d’affectation :** `hotel_otherworld`
- **Comportement canonique déclaré :** Forme au sol proposée pour le versus, sans identité canonique établie ; le Mandarin original reste suspendu sous les grilles. Dossier hors duel.
- **Comportement lore :** Manifestation associée à SILENT HILL 2.
- **Références :** `CL_SH2_ENEMIES`, `CL_SH2_CREATURES`
- **Gestes documentés :**
  - **Renvoi au jeu de gestes de base** — Renvoi documentaire seulement au Mandarin original suspendu sous la grille : le commentaire de création dit qu’il ne lui est pas permis de se tenir au-dessus du sol. La locomotion d’une « Floor Form » et son rôle canonique ne sont pas établis. (CL_SH2_ENEMIES, CL_SH2_CREATURES) — *heritage-source-seulement-adaptation-bloquee · capture-variante-a-relever*
- **Contraintes de référence :**
  - Aucun déplacement libre debout à certifier ; soit arène à grille, soit branche adaptation clairement nommée.
  - Suspendu sous un grillage ; support obligatoire.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
  - La source interdit au Mandarin original de se tenir au-dessus du sol ; ce constat ne prouve ni l’existence d’une variante Floor Form ni son rôle. Conserver la question P0 ouverte et le duel bloqué.
- **Fatalités du profil (2) :** Rituel de clôture — Langue du plancher proposée [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh3_nurse_pipe_043` — Nurse — Pipe

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `shopping_mall`
- **Comportement canonique déclaré :** Enchaînement de coups de tuyau.
- **Comportement lore :** Manifestation associée à SILENT HILL 3.
- **Références :** `CL_SH3_ENEMIES`, `CL_SH3_CREATURES`
- **Gestes documentés :**
  - **Tuyau** — Swing ou estoc en avançant. (CL_SH3_ENEMIES, CL_SH3_CREATURES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Visage/cheveux SH3 ; ne pas reprendre Bubble Head.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Tuyau clinique [adapted-from-canonical-behavior] · NIGHTMARE — Dernier protocole [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh3_god_050` — God

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `church`
- **Comportement canonique déclaré :** Entité gigantesque, griffes et colonnes de feu.
- **Comportement lore :** Manifestation associée à SILENT HILL 3.
- **Références :** `CL_SH3_BOSSES`, `CL_SH3_CREATURES`
- **Gestes documentés :**
  - **Bras** — Le guideSH3 distingue un balayage du bras dans la posture haute puis un balayage dangereux lorsque le God est sur mains et genoux. La marque en demi-cercle au sol borne l’approche physique ; elle ne constitue pas une mesure de portée pour l’arène2D et n’annule pas le feu à distance. (CL_SH3_BOSSES, CL_SH3_CREATURES) — *documente-secondaire · capture-a-relever*
  - **Tête** — Lorsque le God est abaissé sur mains et genoux, le guide décrit un heurt de tête si Heather reste devant son visage. Approcher la tête par le côté évite ce contact ; ne pas attribuer automatiquement ce heurt à la posture haute. (CL_SH3_BOSSES, CL_SH3_CREATURES) — *documente-secondaire · capture-a-relever*
  - **Flammes** — Depuis la posture basse, le God peut lancer du feu sur le sol au-delà de la zone de contact. Le guide décrit une augmentation du volume, de la dispersion et de la vitesse au fil de la rencontre ; ces variations de l’arène3D ne sont pas une mesure d’onde, de boule aérienne ou de cadence2D. (CL_SH3_BOSSES, CL_SH3_CREATURES) — *documente-secondaire · capture-a-relever*
  - **Changement de hauteur** — Le God débute droit avec le visage voilé, puis s’abaisse sur mains et genoux et expose sa tête aux coups. Le guide indique que sa défaite survient dans cette posture basse. Aucun pourcentage de phase ou invulnérabilité de la posture haute n’est déduit de cette seule progression. (CL_SH3_BOSSES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Bas du corps incomplet ; deux hauteurs.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Brasier divin [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh3_valtiel_051` — Valtiel

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Catégorie :** SECRET
- **Rôle de combat :** noncombatant · identité : non-combattant-canonique
- **Note d’identité :** Observateur et serviteur qui manipule les vannes et emporte Heather après certaines morts ; les deux descriptions indiquent qu’il ne l’attaque pas. Rôle sans combat, distinct de ses autres œuvres.
- **Arène d’affectation :** `church`
- **Comportement canonique déclaré :** Présence habituellement non combattue, adaptée en gardien rituel.
- **Comportement lore :** Manifestation associée à SILENT HILL 3.
- **Références :** `CL_SH3_CREATURES`, `CL_SH3_ENEMIES`
- **Gestes documentés :**
  - **Valve** — Manipule une vanne. (CL_SH3_CREATURES, CL_SH3_ENEMIES) — *documente-secondaire · capture-a-relever*
  - **Retrait** — Emporte Heather après certaines morts. (CL_SH3_CREATURES, CL_SH3_ENEMIES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - N’attaque pas Heather ; rôle d’observateur/serviteur.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Rotation du sceau [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh3_sewer_creature_052` — Sewer Creature

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** scripted-encounter · identité : obstacle-scripté-adapte
- **Note d’identité :** Rencontre scriptée sous la passerelle : traverser sans résoudre le danger tue Heather ; le sèche-cheveux branché puis jeté dans l’eau neutralise le monstre. Aucun corps complet ni kit de combat libre n’est établi.
- **Arène d’affectation :** `sewers`
- **Comportement canonique déclaré :** Tentacule aquatique attaquant depuis plusieurs conduits.
- **Comportement lore :** Manifestation associée à SILENT HILL 3.
- **Références :** `CL_SH3_05_UNDERPASS`
- **Gestes documentés :**
  - **Piège** — Attaque lors de la traversée. (CL_SH3_05_UNDERPASS) — *documente-secondaire · capture-a-relever*
  - **Résolution** — Neutralisé par le sèche-cheveux électrifié. (CL_SH3_05_UNDERPASS) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Créature sous l’eau ; anatomie complète non certifiée.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Tentacule du canal [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_ghost_victim_066` — Ghost — Victim

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : famille-canonique-composite
- **Note d’identité :** Profil collectif de production pour les fantômes anciens ; pas un 22e individu ajouté au canon.
- **Arène d’affectation :** `room_302`
- **Comportement canonique déclaré :** Victime immortelle qui traverse les obstacles et inflige une aura.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_SH4_ENEMIES`, `CL_SH4_VICTIMS`, `EXT12_SH4_VICTIM_01_MODEL_20261101`, `EXT12_SH4_VICTIM_01_FILE_20261101`
- **Gestes documentés :**
  - **Aura** — Dans SH4, tous les Ghosts infligent des dégâts de proximité distincts d’une frappe ; Saint Medallion supprime ce danger tout en les ralentissant. Le modèle Victim 01 et sa vue identifiée Jimmy Stone servent à contrôler une silhouette flottante, sans constituer un individu collectif canonique ni transférer ses vêtements aux cinq autres anciens Ghosts. Rayon, cadence et rendu d’aura du versus ne sont pas mesurés. (CL_SH4_ENEMIES, EXT12_SH4_VICTIM_01_MODEL_20261101, EXT12_SH4_VICTIM_01_FILE_20261101) — *documente-secondaire · capture-a-relever*
  - **Prise** — Le guide décrit pour les anciens Ghosts des saisies, coups, morsures et frappes lorsqu’une arme propre est présente. Cette liste commune ne prouve pas qu’un seul individu utilise tous ces gestes. Leurs jambes restent pendantes en flottement ; aucune garde de boxeur, impulsion de course ou traversée de mur filmée n’est déduite des vues fixes. Une prise exacte et ses appuis restent à capturer par victime. (CL_SH4_ENEMIES, EXT12_SH4_VICTIM_01_MODEL_20261101, EXT12_SH4_VICTIM_01_FILE_20261101) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Spectre flottant persistant.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Étreinte persistante [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_toby_archbolt_victim_14` — Toby Archbolt — Victim 14

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : variante-documentee
- **Note d’identité :** Toby Archbolt = victime 14/21. Gestes généraux hérités ; pas de technique individuelle supplémentaire certifiée.
- **Arène d’affectation :** `forest_world`
- **Comportement canonique déclaré :** Fantôme ancien contrôlant la distance par ondes de présence.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_SH4_VICTIMS`, `CL_SH4_ENEMIES`, `EXT12_SH4_VICTIM_14_MODEL_20261101`, `EXT12_SH4_VICTIM_14_FILE_20261101`
- **Gestes documentés :**
  - **Renvoi au jeu de gestes de base** — Victim Files identifie Toby Archbolt comme victime 14 et prêtre adulte. Enemies décrit chemise rouge, gilet noir et pantalon brun clair ; la vue assombrie ne doit pas devenir un costume emprunté à Jimmy ou Eric. Aucune arme, invocation ou attaque liée à la profession n’est attestée. Flottement et proximité sont des traits de la famille Ghost, tandis que les poses d’attaque propres restent à relever. (CL_SH4_VICTIMS, CL_SH4_ENEMIES, EXT12_SH4_VICTIM_14_MODEL_20261101, EXT12_SH4_VICTIM_14_FILE_20261101) — *heritage-documente · capture-variante-a-relever*
- **Contraintes de référence :**
  - Référence de modèle dédiée indispensable ; la biographie ne crée pas une capacité de combat.
  - Spectre flottant persistant.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Gloom du pasteur [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_joseph_schreiber_victim_15` — Joseph Schreiber — Victim 15

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** SECRET
- **Rôle de combat :** noncombatant · identité : non-combattant-canonique
- **Note d’identité :** Victime 15 non hostile ; ne doit pas recevoir automatiquement le kit des autres Ghosts.
- **Arène d’affectation :** `room_302`
- **Comportement canonique déclaré :** Présence non hostile dans le jeu source, adaptée comme combattant d’archive défensif.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_JOSEPH`, `CL_SH4_VICTIMS`, `EXT_SH4_SCRIPT_20261023`, `CL_SH4_12_ROOM_302_OF_THE_PAST`
- **Gestes documentés :**
  - **Transmission** — Buste inversé dans Room 302 of the Past ; conseille Henry et Eileen sur Walter, la localisation de son corps et le Crimson Tome. Apparition narrative, sans gestes offensifs hérités des Ghosts. (CL_JOSEPH, CL_SH4_VICTIMS, EXT_SH4_SCRIPT_20261023, CL_SH4_12_ROOM_302_OF_THE_PAST) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Fantôme non hostile ; silhouette plafond, pas bretteur.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Désespoir du témoin [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_jasper_gein_victim_17` — Jasper Gein — Victim 17

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `forest_world`
- **Comportement canonique déclaré :** Fantôme de nouvelle génération, lié au feu et aux attaques à distance.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_SH4_09_FOREST_WORLD_2ND_TIME`, `CL_SH4_ENEMIES`
- **Gestes documentés :**
  - **Chandelier** — Victim17 porte un chandelier métallique et peut l’utiliser pour frapper Henry ; ce n’est pas un club en bois ou un club de golf. La catégorie technique club du catalogue sert à son comportement de mêlée et ne valide pas un modèle d’arme différent. L’aura brûlante de proximité reste une observation séparée. (CL_SH4_09_FOREST_WORLD_2ND_TIME, CL_SH4_ENEMIES) — *documente-secondaire · capture-a-relever*
  - **Feu** — Aura brûlante de proximité qui retire de gros segments de santé, en plus des faibles dégâts passifs communs aux Ghosts ; les valeurs et délais du versus ne sont pas des mesures source. (CL_SH4_09_FOREST_WORLD_2ND_TIME, CL_SH4_ENEMIES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Corps en feu ; aura proche.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Candélabre enflammé [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_andrew_desalvo_victim_18` — Andrew DeSalvo — Victim 18

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : combat-documente
- **Note d’identité :** Identité présente dans la source de l’œuvre ; profil versus à produire.
- **Arène d’affectation :** `water_prison`
- **Comportement canonique déclaré :** Fantôme lourd et résistant, pression continue dans la prison.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_ANDREW`, `CL_SH4_ENEMIES`
- **Gestes documentés :**
  - **Roulade** — Victim18 peut se lancer vers Henry en roulant en tonneau tout en lévitant, distinct des prises standard et des faibles dégâts de proximité communs aux Ghosts. Son chant accompagne sa présence mais le guide ne l’identifie pas comme un projectile ou un cri offensif. Direction, hauteur et contrôle du versus restent adaptés. (CL_ANDREW, CL_SH4_ENEMIES) — *documente-secondaire · capture-a-relever*
  - **Aura** — Inflige de faibles dégâts simplement par proximité, indépendamment de sa charge en tonneau ou de ses prises. (CL_ANDREW, CL_SH4_ENEMIES) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Lévitation et corps lourd ; chant distinct du cri de super.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Watchfulness [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_sacrificed_walter_071` — Sacrificed Walter

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** scripted-encounter · identité : composant-rituel-non-mobile
- **Note d’identité :** Nom du projet pour le corps du Conjurer ; élément du combat final, pas second boss mobile établi.
- **Arène d’affectation :** `apartment_world`
- **Comportement canonique déclaré :** Corps monumental lié au rituel, invocations et ondes.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_SH4_13_OUTSIDE_ROOM_302`
- **Gestes documentés :**
  - **Rituel** — Le corps géant du Conjurer reçoit le cordon ombilical puis huit lances qui rendent vulnérable le Shadow Walter mobile ; ne pas lui attribuer les tirs et coups de tuyau de ce dernier. (CL_SH4_13_OUTSIDE_ROOM_302) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Corps du Conjurer fixé à la chambre finale ; pas marche libre.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Rituel des vingt-et-un [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `sh4_eileen_head_073` — Eileen Head

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Catégorie :** SET PIECE
- **Rôle de combat :** noncombatant · identité : apparition-immobile-identite-nuancee
- **Note d’identité :** Surnom « Eileen Head » utilisé notamment sur marchandise ; identité de l’objet à présenter avec nuance.
- **Arène d’affectation :** `hospital_world`
- **Comportement canonique déclaré :** Tête géante non combattue, adaptée en boss de décor.
- **Comportement lore :** Manifestation associée à SILENT HILL 4: THE ROOM.
- **Références :** `CL_EILEEN_HEAD`, `EXT_SH4_ODDITIES_20261023`
- **Gestes documentés :**
  - **Regard** — Tête géante dans une chambre du deuxième étage de Hospital World ; le regard suit le visiteur selon la fiche existante, et le guide de curiosités décrit un clignotement des yeux au Stun Gun. Identité de l’objet à conserver nuancée. (CL_EILEEN_HEAD, EXT_SH4_ODDITIES_20261023) — *documente-secondaire · capture-a-relever*
- **Contraintes de référence :**
  - Tête géante immobile ; identité exacte non certifiée par le nom du fichier.
  - Aucune valeur de frame data, dégâts, jauge ou invincibilité n’est canonisée par ce cahier.
  - Les 9 propositions sont des créations de mise en scène du projet ; validation visuelle séparée avant publication.
- **Fatalités du profil (2) :** Rituel de clôture — Regard monumental [adapted-from-canonical-behavior] · NIGHTMARE — Écrasement du souvenir [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `origins_memory_of_richard_grady_083` — Memory of Richard Grady

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : identite-documentee-secondaire
- **Note d’identité :** Corriger toute course/charge mobile : boss fixé au mur.; Arène et caméra spécialisées nécessaires.
- **Arène d’affectation :** `riverside_motel`
- **Comportement canonique déclaré :** Boss massif, coups directs et charge.
- **Comportement lore :** Manifestation associée à SILENT HILL: ORIGINS.
- **Références :** `EXT02`
- **Gestes documentés :**
  - **Jet à moyenne portée** — Le jet à moyenne portée reste un relevé hérité de la source de boss EXT02. Le concept Sad Daddy consulté montre une présence suspendue intégrée à un dispositif de pièce, pas un corps entier isolé ni le jet animé du boss commercial. Garder l’ancrage existant ; matière, origine du jet, portée et séquence originale restent à vérifier sur capture exacte. (EXT02, EXT11_REF_ORIGINS_DADDY_CONCEPT_20261028) — *documente-secondaire*
  - **Morsure en allonge** — La morsure en allonge reste un intitulé hérité EXT02 ; le concept de Sad Daddy montre une bouche et des masses dans le support, sans démontrer cette allonge en jeu. Il ne faut ni donner des jambes libres au boss fixé ni reconstruire l’anatomie masquée pour produire une garde de combattant debout. Départ, contact et retour restent non mesurés. (EXT02, EXT11_REF_ORIGINS_DADDY_CONCEPT_20261028) — *documente-secondaire*
  - **Tentacules étrangleurs** — Les tentacules étrangleurs restent un relevé hérité EXT02, non certifié par le concept de pièce consulté. Les conduits ou masses visibles ne prouvent pas quels appendices saisissent le héros, leur longueur ni leurs transitions. Une pose entière doit conserver le support attesté ; aucune saisie mobile indépendante ou anatomie hors champ n’est inventée. (EXT02, EXT11_REF_ORIGINS_DADDY_CONCEPT_20261028) — *documente-secondaire*
- **Contraintes de référence :**
  - Corriger toute course/charge mobile : boss fixé au mur.
  - Arène et caméra spécialisées nécessaires.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Poings du père [adapted-from-canonical-behavior] · NIGHTMARE — Écrasement du souvenir [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `origins_demon_084` — Demon

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Plongeon volant non attesté ici; ne pas copier Incubus SH1.
- **Arène d’affectation :** `antique_shop`
- **Comportement canonique déclaré :** Entité ailée, feu et frappes plongeantes.
- **Comportement lore :** Manifestation associée à SILENT HILL: ORIGINS.
- **Références :** `EXT02`
- **Gestes documentés :**
  - **Décharge d’énergie** — La décharge d’énergie demeure un intitulé hérité de la source de boss EXT02. Les concepts Final Boss de Jerad S. Marantz consultés explorent des anatomies et silhouettes différentes ; ils ne certifient pas le modèle commercial du Demon ni sa décharge. Le corps entier, ses appendices, l’origine du tir et les timings doivent être confrontés à la version jouée. (EXT02, EXT11_REF_ORIGINS_DEMON_CONCEPT_20261028) — *documente-secondaire*
  - **Pluie de feu** — La pluie de feu demeure un relevé hérité EXT02, sans capture originale mesurée dans ce lot. Une planche conceptuelle du boss final n’établit ni la disposition finale de ses membres ni les trajectoires du feu. Ne pas emprunter les flammes d’Incubus SH1, de God SH3 ou un rythme de jeu de versus pour remplir ces inconnues. (EXT02, EXT11_REF_ORIGINS_DEMON_CONCEPT_20261028) — *documente-secondaire*
  - **Frappes rapprochées** — Les frappes rapprochées du Demon restent un relevé hérité EXT02 à vérifier. Les croquis présentent plusieurs positions de bras, griffes et queue, sans garantir lesquels existent sur le boss commercial. Aucun membre caché, arme tenue, plongeon volant ou garde humaine n’est déduit du concept ; contacts et récupération source restent non mesurés. (EXT02, EXT11_REF_ORIGINS_DEMON_CONCEPT_20261028) — *documente-secondaire*
- **Contraintes de référence :**
  - Plongeon volant non attesté ici; ne pas copier Incubus SH1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Flammes du Flauros [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `homecoming_curtis_ackers` — Curtis Ackers

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Lieu du combat et chorégraphie à relever dans Underground; le junkyard est son lieu de rencontre, pas preuve du boss dans l’atelier.
- **Arène d’affectation :** `curtis_shop`
- **Comportement canonique déclaré :** Affrontement humain dans Underground, avec une scie circulaire.
- **Comportement lore :** Manifestation associée à SILENT HILL: HOMECOMING.
- **Références :** `EXT06`, `EXT11_REF_HC_CURTIS_RENDER_20261028`
- **Gestes documentés :**
  - **Scie circulaire — geste précis à relever** — Le guide Homecoming situe Curtis dans Room321 de la zone Underground et nomme une scie circulaire lorsqu’il attaque Alex après avoir quitté Elle. Le rendu entier de personnage consulté ne montre pas l’outil équipé : il établit identité et vêtements, pas modèle du disque, prise de main ou pose d’attaque. Aucun transfert de tronçonneuse de Walter ou d’arme d’un autre personnage n’est permis. (EXT06, EXT11_REF_HC_CURTIS_RENDER_20261028) — *a-verifier*
- **Contraintes de référence :**
  - Lieu du combat et chorégraphie à relever dans Underground; le junkyard est son lieu de rencontre, pas preuve du boss dans l’atelier.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Le guide situe le combat dans Room 321 Underground et nomme une scie circulaire ; le rendu entier de Curtis montre une pose neutre sans outil, donc ni modèle de scie ni prise n’y sont attestés. Les six présentations sont des compositions du versus, sans timing ni animation originale certifiés.
- **Fatalités du profil (2) :** Rituel de clôture — Scie de Curtis [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `homecoming_amnion_hanging_form_097` — Amnion — Hanging Form

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Respecter le nombre et les attaches des membres; pas de bond de géant générique.
- **Arène d’affectation :** `underground_hc`
- **Comportement canonique déclaré :** Boss arachnéen suspendu, frappes de pattes.
- **Comportement lore :** Manifestation associée à SILENT HILL: HOMECOMING.
- **Références :** `EXT05`, `EXT06`
- **Gestes documentés :**
  - **Frappe lourde** — Le guide Homecoming nomme en première phase une frappe de la patte avant d’Amnion et invite à observer la levée d’une ou des deux pattes pour esquiver. Ses pattes mécaniques propres et leur liaison au torse suspendu doivent rester visibles dans une pose entière ; aucune machine de la pièce précédente ne remplace son rig. Le mot lourde du catalogue ne fournit ni poids, rythme, dégâts ou animation source mesurée. (EXT05, EXT06) — *documente-secondaire*
  - **Frappe rapide** — La frappe rapide du catalogue renvoie à la même famille de mouvements des pattes avant décrite pour la première phase ; aucune comparaison de vitesse chiffrée n’est fournie. Le changement de posture et les deux pattes coincées au sol sont explicitement situés en seconde phase et ne doivent pas migrer ici. Une vue d’Amnion ne certifie ni son corps caché, ni un nombre d’appuis inventé, ni les articulations d’une phase exposée. (EXT05, EXT06) — *documente-secondaire*
  - **Projectile toxique** — En première phase, Amnion émet un jet noir depuis la bouche. Couleur exacte, trajectoire, statut toxique et durée du projectile versus restent à confronter aux plans ; le guide décrit le spray et son origine, sans frame-data. (EXT05, EXT06) — *documente-secondaire*
  - **Choc au sol** — Intitulé du catalogue conservé, sans validation d’un stomp en première phase : EXT06 documente explicitement l’écrasement à deux pattes, leur blocage dans le sol après une esquive et la fenêtre pour toucher le corps en seconde phase, réservée au profil 098. La présente ligne ne transfère pas ce comportement à097. (EXT05, EXT06) — *documente-secondaire*
- **Contraintes de référence :**
  - Respecter le nombre et les attaches des membres; pas de bond de géant générique.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Pattes de la mère [adapted-from-canonical-behavior] · NIGHTMARE — Cocon du cauchemar [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `homecoming_amnion_exposed_form_098` — Amnion — Exposed Form

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** La vulnérabilité exposée doit rester lisible.
- **Arène d’affectation :** `underground_hc`
- **Comportement canonique déclaré :** Seconde phase vulnérable mais agressive.
- **Comportement lore :** Manifestation associée à SILENT HILL: HOMECOMING.
- **Références :** `EXT05`, `EXT06`
- **Gestes documentés :**
  - **Saisie de seconde phase** — Seconde phase : Amnion tente de saisir Alex, balance ses pattes et émet un jet depuis le haut. Après l’écrasement à deux pattes esquivé, celles-ci peuvent rester coincées dans le sol, ouvrant une occasion de toucher le corps. Le guide distingue cette phase de la première ; aucune durée de blocage, de saisie ou de vulnérabilité du prototype n’est mesurée dans Homecoming. (EXT05, EXT06) — *documente-secondaire*
- **Contraintes de référence :**
  - La vulnérabilité exposée doit rester lisible.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Noyau exposé [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 14 composites, 6 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_shadow_107` — Shadow

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** CREATURE
- **Rôle de combat :** multi-body · identité : invocation-documentee
- **Note d’identité :** Dépendance à la Doll; pas une espèce indépendante.; Liste exacte des frappes à relever.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Projection invoquée par la Doll.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT10`
- **Gestes documentés :**
  - **Projection attaquante visible aux UV** — Projection attaquante visible aux UV (EXT10) — *documente-secondaire*
- **Contraintes de référence :**
  - Dépendance à la Doll; pas une espèce indépendante.
  - Liste exacte des frappes à relever.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Double intangible [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_prisoner_minion_brawler_108` — Prisoner Minion — Brawler

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Aucun art martial nommé attesté.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Combattant rapide au corps à corps.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT10`, `EXT11_REF_DP_MINION_FAMILY_20261028`
- **Gestes documentés :**
  - **Variante bagarreur attestée; frappes à relever** — Le bestiaire Downpour distingue un Prisoner Minion bagarreur et une version plus agile ; il décrit le cadre métallique facial et les convulsions au niveau de la famille. Le rendu partagé ne permet pas d’assigner sûrement sa morphologie au Brawler plutôt qu’à Agile. Cette entrée ne nomme aucun art martial ni enchaînement précis ; proportions, garde et frappes de cette variante restent à relever. (EXT10, EXT11_REF_DP_MINION_FAMILY_20261028) — *a-verifier*
- **Contraintes de référence :**
  - Aucun art martial nommé attesté.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Deux variantes sont décrites ; cadre facial et convulsions sont décrits pour leur famille. Le rendu familial ne certifie pas seul la variante, ses proportions ou une chorégraphie de boxe. Les six présentations sont des compositions du versus, sans timing ni animation originale certifiés.
- **Fatalités du profil (2) :** Rituel de clôture — Combo du prisonnier [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_prisoner_minion_agile_109` — Prisoner Minion — Agile

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : variante-documentee
- **Note d’identité :** Variante plus agile documentée; ne pas inventer téléportation.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Variante plus mobile.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT10`, `EXT11_REF_DP_MINION_FAMILY_20261028`
- **Gestes documentés :**
  - Aucun geste documenté dans les références consultées ; capture à relever.
- **Contraintes de référence :**
  - Variante plus agile documentée; ne pas inventer téléportation.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Variante plus agile attestée séparément de Brawler ; la photographie familiale n’établit pas des proportions, une téléportation, un art martial ou un cycle de pas propre. Les six présentations sont des compositions du versus, sans timing ni animation originale certifiés.
- **Fatalités du profil (2) :** Rituel de clôture — Esquive du prisonnier [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_void_113` — Void

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** environmental-obstacle · identité : phenomene-non-combattant
- **Note d’identité :** Phénomène environnemental, pas boss bipède; combat seulement mode défi adapté.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Poursuite de l’Otherworld adaptée en mur avançant.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT10`, `EXT_DP_PITSTOP_20261023`
- **Gestes documentés :**
  - **Poursuite lumineuse absorbante** — Lumière rouge qui poursuit Murphy dans l’Otherworld et absorbe ce qui se trouve sur son trajet ; le guide du Diner précise qu’on ne peut pas la blesser et qu’il faut fuir. (EXT10, EXT_DP_PITSTOP_20261023) — *documente-secondaire*
- **Contraintes de référence :**
  - Phénomène environnemental, pas boss bipède; combat seulement mode défi adapté.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - La mobilité du phénomène appartient à une poursuite de parcours ; impossibilité de le blesser dans la scène du Diner, sans kit de duel autonome.
- **Fatalités du profil (2) :** Rituel de clôture — Dévoration de l’espace [adapted-from-canonical-behavior] · NIGHTMARE — Effacement du signal [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_monocle_man_114` — Monocle Man

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** CREATURE
- **Rôle de combat :** noncombatant · identité : non-combattant-version-commerciale
- **Note d’identité :** Garder hors roster canonique; boss prototype restauré = contenu coupé à référencer séparément.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Apparition symbolique adaptée en combattant secret.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT10`, `EXT12`
- **Gestes documentés :**
  - **Apparition passive** — Apparition passive qui terrorise psychologiquement Murphy dans la version commerciale ; aucun kit du boss prototype n’est repris. (EXT10, EXT12) — *documente-secondaire*
- **Contraintes de référence :**
  - Garder hors roster canonique; boss prototype restauré = contenu coupé à référencer séparément.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Regard du monocle [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `downpour_wheelman_116` — Wheelman

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : identite-documentee-secondaire
- **Note d’identité :** Apparition en fauteuil et boss géant sont distincts.; Boss à mécanisme: quatre tubes vitaux à retirer sous projecteurs; pas duel mobile.; La foudre éteint les projecteurs; conserver leur rôle spatial.
- **Arène d’affectation :** `overlook`
- **Comportement canonique déclaré :** Boss final mécanisé, câbles et décharges.
- **Comportement lore :** Manifestation associée à SILENT HILL: DOWNPOUR.
- **Références :** `EXT66`, `EXT9_REF_DOWNPOUR_END_11_20261026`, `EXT9_REF_DOWNPOUR_END_12_20261026`
- **Gestes documentés :**
  - **Poings** — Dans la salle finale d’Overlook, le Wheelman peut frapper Murphy avec son poing, notamment s’il approche le système de soutien sans l’avoir neutralisé. Le boss central et les passerelles de matériel médical sont visibles dans les deux captures associées ; aucun déplacement libre de Wheel Chair SH4 n’en découle. (EXT66, EXT9_REF_DOWNPOUR_END_11_20261026, EXT9_REF_DOWNPOUR_END_12_20261026) — *documente-secondaire*
  - **Débris** — Le guide du boss Wheelman atteste une projection de débris dans la salle médicale d’Overlook. Les vues fixes ne montrent pas une salve complète et ne déterminent ni objet, nombre, trajectoire, cadence ou récupération ; ne pas remplacer ce matériau par une télékinésie générique ou un nouveau projectile magique. (EXT66, EXT9_REF_DOWNPOUR_END_11_20261026, EXT9_REF_DOWNPOUR_END_12_20261026) — *documente-secondaire*
  - **Foudre** — Un petit point lumineux au sol annonce l’endroit où la foudre de Wheelman va frapper ; le guide précise que ces attaques peuvent aussi désactiver les projecteurs. Le signal, l’impact et le matériel de la salle sont des phases distinctes. Leur rayon, retard et durée restent à mesurer, sans éclair instantané partout dans l’arène. (EXT66, EXT9_REF_DOWNPOUR_END_11_20261026, EXT9_REF_DOWNPOUR_END_12_20261026) — *documente-secondaire*
  - **Projecteurs** — La confrontation originale exige d’utiliser un projecteur depuis chaque plateforme de soufflet, puis de redescendre pour arracher un tube de survie ; le guide compte quatre tubes et indique que les coups directs ne blessent pas le boss. Le projecteur est un appareil du lieu utilisé par Murphy, pas un pouvoir lancé par Wheelman. (EXT66, EXT9_REF_DOWNPOUR_END_11_20261026, EXT9_REF_DOWNPOUR_END_12_20261026) — *documente-secondaire*
- **Contraintes de référence :**
  - Apparition en fauteuil et boss géant sont distincts.
  - Boss à mécanisme: quatre tubes vitaux à retirer sous projecteurs; pas duel mobile.
  - La foudre éteint les projecteurs; conserver leur rôle spatial.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Le boss original ne prend pas de dégâts directs : Murphy utilise les projecteurs et détache quatre tubes. Une barre de vie et un duel direct dans le versus restent une transposition du projet, sans reproduction de cet objectif complet.
- **Fatalités du profil (2) :** Rituel de clôture — Machine du Wheelman [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_mama_117` — Mama

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_ship`
- **Comportement canonique déclaré :** Boss unique de The Arcade, coups massifs et invocations.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`, `EXT16`
- **Gestes documentés :**
  - **Coups des bras** — Coups des bras (EXT13, EXT16) — *documente-secondaire*
  - **Phase rampante sol/plafond** — Phase rampante sol/plafond (EXT13, EXT16) — *documente-secondaire*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Étreinte de Mama [adapted-from-canonical-behavior] · NIGHTMARE — Écrasement du souvenir [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_phantom_118` — Phantom

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.; Téléportation de spectre humanoïde non attestée; ne pas déduire les pouvoirs du nom Phantom.
- **Arène d’affectation :** `arcade_ship`
- **Comportement canonique déclaré :** Boss fantomatique unique, téléportations et projectiles.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`, `EXT17`
- **Gestes documentés :**
  - **Boss colossal du lac; attaques à relever** — Boss colossal du lac; attaques à relever (EXT13, EXT17) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Téléportation de spectre humanoïde non attestée; ne pas déduire les pouvoirs du nom Phantom.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Assaut spectral [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_greedy_worm_arcade_119` — Greedy Worm — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_ship`
- **Comportement canonique déclaré :** Adaptation active du Greedy Worm pour l’arcade.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Présence Arcade documentée; offensives à relever** — Présence Arcade documentée; offensives à relever (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Tunnel de l’Arcade [adapted-from-canonical-behavior] · NIGHTMARE — Dévoration souterraine [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_split_worm_arcade` — Split Worm — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_ship`
- **Comportement canonique déclaré :** Retour du Split Worm dans un format rail-shooter.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`, `EXT15`
- **Gestes documentés :**
  - **Boss de Toluca Prison; morsure à relever** — Boss de Toluca Prison; morsure à relever (EXT13, EXT15) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Gueule du tunnel d’arcade [adapted-from-canonical-behavior] · NIGHTMARE — Dévoration souterraine [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_tremer_arcade` — Tremer — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_historical`
- **Comportement canonique déclaré :** Retour du Tremer dans les vagues de The Arcade.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Fourmillement du rail [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_double_head_arcade` — Double Head — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_city`
- **Comportement canonique déclaré :** Retour du Double Head dans les rues et couloirs de The Arcade.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Morsure sur rail [adapted-from-canonical-behavior] · NIGHTMARE — Traque achevée [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_insane_cancer_arcade` — Insane Cancer — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_hospital`
- **Comportement canonique déclaré :** Retour massif de l’Insane Cancer dans les séquences de tir.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Blocage du corridor [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_hummer_arcade` — Hummer — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_hospital`
- **Comportement canonique déclaré :** Retour des Hummers en essaims aériens.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Nuée de l’hôpital [adapted-from-canonical-behavior] · NIGHTMARE — Chute sans ciel [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_numb_body_arcade` — Numb Body — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_mall`
- **Comportement canonique déclaré :** Retour du Numb Body en vagues rapides.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Charge de la galerie [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_nurse_arcade` — Nurse — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_hospital`
- **Comportement canonique déclaré :** Retour des infirmières dans Brookhaven.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`, `EXT14`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13, EXT14) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Service de Brookhaven [adapted-from-canonical-behavior] · NIGHTMARE — Dernier protocole [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_creeper_arcade` — Creeper — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_prison`
- **Comportement canonique déclaré :** Retour des Creepers en groupes au ras du sol.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Essaim des égouts [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_toadstool_arcade` — Toadstool — Arcade

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** unverified · identité : presence-documentee-role-a-verifier
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_graveyard`
- **Comportement canonique déclaré :** Retour du Toadstool dans les zones souterraines.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`
- **Gestes documentés :**
  - **Mouvements de cette version à relever** — La présence de cette espèce est documentée; le pattern particulier de cette œuvre ne l’est pas encore dans les références consultées. (EXT13) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Spore du cimetière [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_tuberculosis` — Tuberculosis

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** unverified · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.; Ni locomotion ni masse détaillée certifiées par les extraits; rig et offense bloqués jusqu’à capture.
- **Arène d’affectation :** `arcade_hospital_roof`
- **Comportement canonique déclaré :** Boss de toit de Brookhaven, masse respiratoire qui attaque par souffle et appendices.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT13`, `EXT18`
- **Gestes documentés :**
  - **Boss du toit; protection d’Emilie** — Boss du toit; protection d’Emilie (EXT13, EXT18) — *a-verifier*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Ni locomotion ni masse détaillée certifiées par les extraits; rig et offense bloqués jusqu’à capture.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Poumon de Brookhaven [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_robbie_the_rabbit_axe` — Robbie the Rabbit — Axe

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_amusement`
- **Comportement canonique déclaré :** Mascotte hostile décrite avec une hache dans The Arcade ; forme et prise de l’outil à confirmer visuellement.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT19`
- **Gestes documentés :**
  - **Hache équipée** — Hache équipée (EXT19) — *documente-secondaire*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Hache de Robbie [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `arcade_robbie_the_rabbit_shotgun` — Robbie the Rabbit — Shotgun

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.; Séquence rail-shooter à relever avant validation1:1.
- **Arène d’affectation :** `arcade_amusement`
- **Comportement canonique déclaré :** Variante hostile portant une arme longue ; le modèle exact et la désignation shotgun du catalogue restent à confirmer dans les vues de The Arcade.
- **Comportement lore :** Manifestation associée à SILENT HILL: THE ARCADE.
- **Références :** `EXT19`
- **Gestes documentés :**
  - **Fusil équipé** — Fusil équipé (EXT19) — *documente-secondaire*
- **Contraintes de référence :**
  - Présence dans The Arcade documentée; ne pas copier automatiquement gestes/durées du jeu d’origine.
  - Séquence rail-shooter à relever avant validation1:1.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Décharge de Robbie [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_ghost_125` — Ghost

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_zone`
- **Comportement canonique déclaré :** Version Book of Memories.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT20`
- **Gestes documentés :**
  - **Présence toxique persistante** — Présence toxique persistante (EXT20) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Passage du livre [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_flesh_lips_134` — Flesh Lips

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_zone`
- **Comportement canonique déclaré :** Version Book of Memories.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT20`
- **Gestes documentés :**
  - **Descente; invocation** — Descente; invocation (EXT20) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Cage du livre [adapted-from-canonical-behavior] · NIGHTMARE — Suspension finale [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_mother_135` — Mother

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** environmental-obstacle · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_zone`
- **Comportement canonique déclaré :** Boss propre au Book of Memories, invocations et masse charnelle.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT20`
- **Gestes documentés :**
  - **Portail de petites créatures** — Masse féminine fixée au sol servant de portail à de petites créatures ; le bestiaire lui attribue « Weapon: None », sans attaque directe du corps. (EXT20) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Masse fixée au sol, portail de petites créatures et aucune arme selon le bestiaire ; ne pas attribuer les attaques des créatures générées au corps de Mother.
- **Fatalités du profil (2) :** Rituel de clôture — Matrice du livre [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_valtiel_136` — Valtiel

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** noncombatant · identité : non-combattant-documente
- **Note d’identité :** Messager rencontré au début de chaque zone, puis donneur de récompense si la mission est réussie. Retenu comme donneur de missions non combattant ; le statut de boss du catalogue n’est pas une preuve d’attaque.
- **Arène d’affectation :** `book_zone`
- **Comportement canonique déclaré :** Version boss de Valtiel.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT21`
- **Gestes documentés :**
  - **Donneur de missions** — Donneur de missions (EXT21) — *documente-secondaire*
- **Contraintes de référence :**
  - Corriger boss=true : donneur de missions et récompenses, aucune attaque attestée.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Gardien du livre [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_fire_guardian_137` — Fire Guardian

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_fire`
- **Comportement canonique déclaré :** Gardien élémentaire du feu.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT22`
- **Gestes documentés :**
  - **Lance-flammes de main** — Lance-flammes de main (EXT22) — *documente-secondaire*
  - **Bond** — Bond (EXT22) — *documente-secondaire*
  - **Explosion de feu corporelle** — Explosion de feu corporelle (EXT22) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Cercle de feu [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_wood_guardian_138` — Wood Guardian

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** stationary-boss · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_wood`
- **Comportement canonique déclaré :** Gardien élémentaire du bois.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT23`
- **Gestes documentés :**
  - **Attaque souterraine poursuivante** — Attaque souterraine poursuivante (EXT23) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Racines du bois [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 13 composites, 7 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_blood_guardian_143` — Blood Guardian

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** multi-body · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_blood`
- **Comportement canonique déclaré :** Gardien élémentaire du sang.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT20`
- **Gestes documentés :**
  - **Masse et marionnettiste** — Masse et marionnettiste (EXT20) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Marée de sang [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_blood_mama_145` — Blood Mama

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** CREATURE
- **Rôle de combat :** multi-body · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_blood`
- **Comportement canonique déclaré :** Créature de la zone sang.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT20`
- **Gestes documentés :**
  - **Ruée; bond** — Ruée; bond (EXT20) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Protection maternelle [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `bom_steel_guardian_146` — Steel Guardian

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
- **Arène d’affectation :** `book_steel`
- **Comportement canonique déclaré :** Gardien élémentaire de l’acier.
- **Comportement lore :** Manifestation associée à SILENT HILL: BOOK OF MEMORIES.
- **Références :** `EXT25`, `EXT26`, `EXT20`, `EXT12_REF_BOM_STEEL_GUARDIAN_146_VIEW_1_20261101`, `EXT12_REF_BOM_STEEL_GUARDIAN_146_VIEW_2_20261101`
- **Gestes documentés :**
  - **Lames contrôlées à distance** — Lames contrôlées à distance (EXT25, EXT26) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Book of Memories uniquement; ne pas transférer automatiquement les animations du titre parent.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Marteau d’acier [adapted-from-canonical-behavior] · NIGHTMARE — Écrasement du souvenir [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `pt_lisa_149` — Lisa

- **Œuvre / édition :** P.T. (2014) (`pt`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : poursuivant-non-affrontable-documente
- **Note d’identité :** Pas de moveset de combat dans P.T.; ne pas assimiler à Lisa Garland.; Animations cachées déduites par caméra modifiée séparées des apparitions vécues. Le billet Konami de 2014 documente la boucle du couloir et la progression par inspection/découverte ; il ne nomme pas Lisa et ne suffit pas à confirmer son rôle précis. Aucun rôle validé n’est déduit de l’absence d’une attaque dans ce billet.
- **Arène d’affectation :** `looping_hall`
- **Comportement canonique déclaré :** Apparition et saisie soudaine dans la boucle du couloir.
- **Comportement lore :** Manifestation associée à P.T..
- **Références :** `EXT27`, `EXT28`, `EXT_PT_KONAMI_TIPS_20261025`
- **Gestes documentés :**
  - **Apparition** — Apparition (EXT27, EXT28) — *documente-secondaire*
  - **Saisie surprise** — Saisie surprise (EXT27, EXT28) — *documente-secondaire*
  - **Retour de boucle** — Le billet Konami du31 octobre 2014 sur P.T. PS4 décrit le retour dans un même couloir dont les détails changent, puis une progression obtenue en inspectant et en découvrant les indices. Il ne décrit pas une attaque ou une téléportation propre à Lisa. (EXT27, EXT28, EXT_PT_KONAMI_TIPS_20261025) — *documente-secondaire*
- **Contraintes de référence :**
  - Pas de moveset de combat dans P.T.; ne pas assimiler à Lisa Garland.
  - Animations cachées déduites par caméra modifiée séparées des apparitions vécues.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Apparition derrière soi [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_ayakakashi_152` — Ayakakashi

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** CREATURE
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Téléportation/disparition non prouvée ici; ne pas confondre feinte visuelle et pouvoir.
- **Arène d’affectation :** `ebisugaoka`
- **Comportement canonique déclaré :** Feinte, disparition brève et frappe latérale.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT36`, `EXT33`
- **Gestes documentés :**
  - **Abattement de faucille** — Abattement de faucille (EXT36, EXT33) — *documente-secondaire*
- **Contraintes de référence :**
  - Téléportation/disparition non prouvée ici; ne pas confondre feinte visuelle et pouvoir.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Masque trompeur [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_corruptor_155` — Corruptor

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** CREATURE
- **Rôle de combat :** environmental-obstacle · identité : identite-documentee-secondaire
- **Note d’identité :** Corruptor est appellation descriptive, pas forcément nom officiel traduit.
- **Arène d’affectation :** `ebisugaoka`
- **Comportement canonique déclaré :** Propage des zones de corruption au sol.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT39`, `EXT33`
- **Gestes documentés :**
  - **Rejet liquide** — Rejet liquide (EXT39, EXT33) — *documente-secondaire*
  - **Entrave retardée au sol** — Entrave retardée au sol (EXT39, EXT33) — *documente-secondaire*
- **Contraintes de référence :**
  - Corruptor est appellation descriptive, pas forcément nom officiel traduit.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Floraison corruptrice [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_hatcher_156` — Hatcher

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** CREATURE
- **Rôle de combat :** environmental-obstacle · identité : identite-documentee-secondaire
- **Note d’identité :** Pas de saisie par ouverture de torse établie; nom descriptif de guide.
- **Arène d’affectation :** `ebisugaoka`
- **Comportement canonique déclaré :** Ouvre son corps pour saisir et libérer des rejetons.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT40`, `EXT33`, `EXT_SHF_EBISUGAOKA5_20261025`
- **Gestes documentés :**
  - **Cocons engendrant Kashimashi** — Le bestiaire décrit un géniteur à cocons ; le guide d’Ebisugaoka partie5 nomme les Hatcher et demande de vaincre ces géniteurs pour débloquer le chemin. Ces pages ne prouvent pas l’absence de locomotion autonome. (EXT40, EXT33, EXT_SHF_EBISUGAOKA5_20261025) — *documente-secondaire*
- **Contraintes de référence :**
  - Pas de saisie par ouverture de torse établie; nom descriptif de guide.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Éclosion charnelle [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_dark_hatcher_160` — Dark Hatcher

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** environmental-obstacle · identité : variante-documentee
- **Note d’identité :** Ennemi de génération, pas nécessairement boss; liste d’invocations à filmer.
- **Arène d’affectation :** `dark_shrine`
- **Comportement canonique déclaré :** Variante renforcée du Hatcher.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT33`
- **Gestes documentés :**
  - **Cocons de monstres du sanctuaire** — Cocons de monstres du sanctuaire (EXT33) — *documente-secondaire*
- **Contraintes de référence :**
  - Ennemi de génération, pas nécessairement boss; liste d’invocations à filmer.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Éclosion obscure [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_sakuko_like_entity_162` — Sakuko-Like Entity

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Entité ressemblante, ne pas déclarer automatiquement Sakuko réelle morte ou transformée.; Conserver passage obscur et changement de phase; effets sonores et nombre exact de feintes à filmer.
- **Arène d’affectation :** `school_shf`
- **Comportement canonique déclaré :** Manifestation boss associée à Sakuko.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT69`
- **Gestes documentés :**
  - **Masse** — trois balayages, prolongement possible (EXT69) — *documente-secondaire*
  - **Pique** — arme plantée puis arrachée (EXT69) — *documente-secondaire*
  - **Saisie** — ruée (EXT69) — *documente-secondaire*
  - **Feinte** — pas puis abattement retardé (EXT69) — *documente-secondaire*
  - **Arrière** — riposte brève (EXT69) — *documente-secondaire*
  - **Cloche** — téléportations et charge sonore (EXT69) — *documente-secondaire*
  - **Phase avancée** — combo mobile chaîne-masse (EXT69) — *documente-secondaire*
- **Contraintes de référence :**
  - Entité ressemblante, ne pas déclarer automatiquement Sakuko réelle morte ou transformée.
  - Conserver passage obscur et changement de phase; effets sonores et nombre exact de feintes à filmer.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Mémoire de Sakuko [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `shf_hinako_s_mother_165` — Hinako’s Mother

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** combatant · identité : identite-documentee-secondaire
- **Note d’identité :** Pas de zone magique attestée; scène d’origine duo, timings solo adaptés.; Couteau planté avant la saisie; dépendance au père pour la remise de cible.
- **Arène d’affectation :** `hinako_home`
- **Comportement canonique déclaré :** Manifestation parentale, saisies et zones.
- **Comportement lore :** Manifestation associée à SILENT HILL f.
- **Références :** `EXT71`
- **Gestes documentés :**
  - **Couteau** — deux tailles puis épaule (EXT71) — *documente-secondaire*
  - **Ruée** — taille ascendante (EXT71) — *documente-secondaire*
  - **Distance** — couteau lancé (EXT71) — *documente-secondaire*
  - **Saisie** — tire la cible au père (EXT71) — *documente-secondaire*
- **Contraintes de référence :**
  - Pas de zone magique attestée; scène d’origine duo, timings solo adaptés.
  - Couteau planté avant la saisie; dépendance au père pour la remise de cible.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Entrave de la mère [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 18 composites, 2 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_armless_man_170` — Armless Man

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Version2006 nommée Armless Man aux crédits ; corps sans bras libres, pas de modèle repris du jeu2001 ou du remake 2024. Son rôle dans la fiction filmée est distingué de l’adaptation de combat versus-scripted proposée par ce projet.
- **Arène d’affectation :** `film_midwich`
- **Comportement canonique déclaré :** Démarche contorsionnée, jet corrosif et pression lente.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT47`, `EXT48`
- **Gestes documentés :**
  - **Jet corrosif — détail à revoir** — Armless Man est nommé dans les crédits 2006 ; les notes de production décrivent le personnage sans bouche et les déformations du corps du danseur. Le jet corrosif et ses poses restent à relever sur le film exact. (EXT47, EXT48) — *a-verifier*
- **Contraintes de référence :**
  - Aucun bras libre; version2006, pas modèle2001/2024.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Projection corrosive [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_dark_nurse_171` — Dark Nurse

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Dark Nurses du film 2006, nommées dans les notes de production et les crédits. Activation par la lumière documentée ; instrument exact et gestes de lames à relever sur plan, sans importer la réaction au son de Revelation. Son rôle dans la fiction filmée est distingué de l’adaptation de combat versus-scripted proposée par ce projet.
- **Arène d’affectation :** `film_hospital`
- **Comportement canonique déclaré :** Reste immobile dans l’obscurité puis frappe en réaction à la lumière et au mouvement.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT47`, `EXT49`, `EXT48`
- **Gestes documentés :**
  - **Réveil à la lumière** — Les notes de production décrivent les Nurses figées puis activées par la lumière dans l’obscurité de l’hôpital ; leur mouvement de marionnette est aussi retouché temporellement en postproduction. Cela ne mesure ni le délai d’activation ni la durée des gestes. (EXT47, EXT49, EXT48) — *documente-secondaire*
  - **Gestes de lames** — Gestes de lames (EXT47, EXT49) — *documente-secondaire*
- **Contraintes de référence :**
  - Version2006 : relève instrument exact sur plan; éviter copier gestes Revelation déclenchés au son.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Réflexe à la lumière [adapted-from-canonical-behavior] · NIGHTMARE — Dernier protocole [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_grey_child_film_172` — Grey Child — Film

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Grey Child et horde du film 2006 documentés par notes de production/crédits ; conserver la créature surnaturelle et sa matière, avec chorégraphie précise encore à relever. Son rôle dans la fiction filmée est distingué de l’adaptation de combat versus-scripted proposée par ce projet.
- **Arène d’affectation :** `film_midwich`
- **Comportement canonique déclaré :** Se déplace en groupe et agrippe la cible dans les ruelles en flammes.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT47`, `EXT48`
- **Gestes documentés :**
  - **Encerclement — geste à revoir** — Grey Child est nommé aux crédits ; les notes de production décrivent une performance de danseuse multipliée en postproduction pour former une horde, avec peau translucide retravaillée. Elles ne mesurent pas l’encerclement ou la prise. (EXT47, EXT48) — *a-verifier*
- **Contraintes de référence :**
  - Créature surnaturelle du film; conserver sa matière, ne pas produire des enfants humains réalistes.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Étreinte carbonisée [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_colin_the_janitor_174` — Colin the Janitor

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Janitor/Colin du film 2006 nommé aux crédits et décrit dans les notes de production ; séparer état momifié et rampant vivant. Aucun pouvoir autonome de corrosion attribué sans plan. Son rôle dans la fiction filmée est distingué de l’adaptation de combat versus-scripted proposée par ce projet.
- **Arène d’affectation :** `film_midwich`
- **Comportement canonique déclaré :** Rampe, agrippe et propage la corruption autour de lui.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT49`, `EXT47`, `EXT48`
- **Gestes documentés :**
  - **Rampement contorsionné** — Les notes de production distinguent le Janitor momifié du monde de brume et la créature vivante, rampante et contorsionnée de l’obscurité ; les crédits associent Janitor/Colin. Ni une propagation autonome de corrosion ni son contrôle de la transformation du décor ne sont établis par ces notes. (EXT49, EXT47, EXT48) — *documente-secondaire*
- **Contraintes de référence :**
  - Aucun pouvoir autonome de corrosion attribué sans plan; transformation du décor n’est pas forcément son attaque.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Barbelés du gardien [adapted-from-canonical-behavior] · NIGHTMARE — Hantise sans retour [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_missionary_revelation_177` — Missionary — Revelation

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Version Revelation; ne pas copier boss Missionary SH3 ou Needler. Identité et rôle de scène corroborés pour l’édition2012 par les nouvelles transcriptions consultées ; adaptation versus jouable déclarée séparément. Aucune capacité ou image du jeuSH3 ou du film2006 transférée.
- **Arène d’affectation :** `film_sanctuary`
- **Comportement canonique déclaré :** Assauts rapides avec lames intégrées et parade agressive.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT50`, `EXT52`, `EXT_REVELATION_CREDITS_20261026`, `EXT_REVELATION_COMPARISON_20261026`
- **Gestes documentés :**
  - **Estoc** — Le Missionary du film2012 porte des lames intégrées ; le générique et la comparaison avecSH3 confirment son identité de scène liée à Claudia. L’estoc proposé doit encore être isolé et mesuré dans le film, sans emprunt au bossSH3. (EXT50, EXT52, EXT_REVELATION_CREDITS_20261026, EXT_REVELATION_COMPARISON_20261026) — *documente-secondaire*
  - **Taillades** — Les lames appartiennent à la silhouette du Missionary Revelation2012 ; la présence de la créature est corroborée, mais l’ordre, les poses et le contact de chaque taillade restent à relever dans cette édition filmée. (EXT50, EXT52, EXT_REVELATION_CREDITS_20261026, EXT_REVELATION_COMPARISON_20261026) — *documente-secondaire*
  - **Assaut frontal** — L’assaut reste une proposition à comparer au Missionary Revelation2012, dont les nouvelles preuves confirment l’identité et le rôle de scène ; elles ne mesurent ni charge, parade, récupération ou téléportation. (EXT50, EXT52, EXT_REVELATION_CREDITS_20261026, EXT_REVELATION_COMPARISON_20261026) — *documente-secondaire*
- **Contraintes de référence :**
  - Version Revelation; ne pas copier boss Missionary SH3 ou Needler.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
  - Rôle de scène du film2012 confirmé ; les commandes restent des propositions du versus, sans gameplay interactif original, art validé ni mesure d’animation source.
- **Fatalités du profil (2) :** Rituel de clôture — Couronne de lames [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_bubble_head_nurse_return_to_silent_hill` — Bubble Head Nurse — Return to Silent Hill

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE · variante de `Bubble Head Nurse`
- **Rôle de combat :** unverified · identité : version-documentation-partielle
- **Note d’identité :** La source générale ne valide pas le modèle ni le moveset1:1.; Pas d’héritage automatique film2006, jeu2001 ou remake2024.
- **Arène d’affectation :** `return_brookhaven`
- **Comportement canonique déclaré :** Interprétation cinématographique 2026 des Bubble Head Nurses.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT55`
- **Gestes documentés :**
  - **Présence/gestes film2026 à isoler précisément** — Présence/gestes film2026 à isoler précisément (EXT55) — *a-verifier*
- **Contraintes de référence :**
  - La source générale ne valide pas le modèle ni le moveset1:1.
  - Pas d’héritage automatique film2006, jeu2001 ou remake2024.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Service de Lakeview [adapted-from-canonical-behavior] · NIGHTMARE — Dernier protocole [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_creeper_return_to_silent_hill` — Creeper — Return to Silent Hill

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** CREATURE · variante de `Creeper`
- **Rôle de combat :** unverified · identité : version-documentation-partielle
- **Note d’identité :** La source générale ne valide pas le modèle ni le moveset1:1.; Pas d’héritage automatique film2006, jeu2001 ou remake2024.
- **Arène d’affectation :** `return_streets`
- **Comportement canonique déclaré :** Interprétation cinématographique 2026 des Creepers.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT55`
- **Gestes documentés :**
  - **Présence/gestes film2026 à isoler précisément** — Présence/gestes film2026 à isoler précisément (EXT55) — *a-verifier*
- **Contraintes de référence :**
  - La source générale ne valide pas le modèle ni le moveset1:1.
  - Pas d’héritage automatique film2006, jeu2001 ou remake2024.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Essaim du retour [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_red_pyramid_thing_return_to_silent_hill` — Red Pyramid Thing — Return to Silent Hill

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** BOSS · boss · variante de `Red Pyramid Thing`
- **Rôle de combat :** unverified · identité : version-documentation-partielle
- **Note d’identité :** La source générale ne valide pas le modèle ni le moveset1:1.; Pas d’héritage automatique film2006, jeu2001 ou remake2024.
- **Arène d’affectation :** `return_portrait_room`
- **Comportement canonique déclaré :** Interprétation cinématographique 2026 de Pyramid Head.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT55`
- **Gestes documentés :**
  - **Présence/gestes film2026 à isoler précisément** — Présence/gestes film2026 à isoler précisément (EXT55) — *a-verifier*
- **Contraintes de référence :**
  - La source générale ne valide pas le modèle ni le moveset1:1.
  - Pas d’héritage automatique film2006, jeu2001 ou remake2024.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Grand couteau du retour [adapted-from-canonical-behavior] · NIGHTMARE — Sentence de rouille [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `film_fused_mattress_manifestation_return` — Fused Mattress Manifestation — Return

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Catégorie :** BOSS · boss · variante de `null`
- **Rôle de combat :** unverified · identité : composite-ou-nom-a-reconcilier
- **Note d’identité :** Appellation du dépôt non attestée comme nom officiel.; Ne pas confondre Flesh Lip du plafond, Abstract Daddy/Angela et confrontation finale.
- **Arène d’affectation :** `return_lakeview`
- **Comportement canonique déclaré :** Manifestation fusionnant corps et structure de lit dans la conclusion du film 2026.
- **Comportement lore :** Manifestation associée à SILENT HILL — FILM UNIVERSE.
- **Références :** `EXT54`, `EXT55`, `EXT56`
- **Gestes documentés :**
  - **Scène de lit au plafond / Abstract Daddy à distinguer** — Scène de lit au plafond / Abstract Daddy à distinguer (EXT54, EXT55, EXT56) — *a-verifier*
- **Contraintes de référence :**
  - Appellation du dépôt non attestée comme nom officiel.
  - Ne pas confondre Flesh Lip du plafond, Abstract Daddy/Angela et confrontation finale.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Fusion du souvenir [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `ascension_wanderer_178` — Wanderer

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Aucun poing libre : silhouette sans bras selon source; attaques détaillées à revoir épisode canon. Le communiqué officiel Konami présente Ascension comme une série interactive dont l’audience influe sur le récit ; cette preuve générale ne confirme ni le nom propre ni le rôle individuel de cette créature, et ne convertit pas une absence de mise à mort décrite en innocence.
- **Arène d’affectation :** `hope_junction`
- **Comportement canonique déclaré :** Approche constante, coups irréguliers et pression de proximité.
- **Comportement lore :** Manifestation associée à SILENT HILL: ASCENSION.
- **Références :** `EXT58`, `EXT57`
- **Gestes documentés :**
  - **Déambulation, corps entravé** — Déambulation, corps entravé (EXT58) — *documente-secondaire*
- **Contraintes de référence :**
  - Aucun poing libre : silhouette sans bras selon source; attaques détaillées à revoir épisode canon.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Marche du deuil [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `ascension_fighter_179` — Fighter

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Scènes canoniques distinctes des variantes rejetées par vote et des Endure. Le communiqué officiel Konami présente Ascension comme une série interactive dont l’audience influe sur le récit ; cette preuve générale ne confirme ni le nom propre ni le rôle individuel de cette créature, et ne convertit pas une absence de mise à mort décrite en innocence.
- **Arène d’affectation :** `hope_junction`
- **Comportement canonique déclaré :** Manifestation humanoïde agressive, rafales courtes et poursuite.
- **Comportement lore :** Manifestation associée à SILENT HILL: ASCENSION.
- **Références :** `EXT58`, `EXT57`
- **Gestes documentés :**
  - **Espèce attestée; frappes à relever** — Espèce attestée; frappes à relever (EXT58) — *a-verifier*
- **Contraintes de référence :**
  - Scènes canoniques distinctes des variantes rejetées par vote et des Endure.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Assaut enveloppé [adapted-from-canonical-behavior] · NIGHTMARE — Dernière manifestation [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `ascension_snarler_180` — Snarler

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Catégorie :** CREATURE
- **Rôle de combat :** scripted-encounter · identité : identite-documentee-secondaire
- **Note d’identité :** Ne pas ajouter des tirs ou statut mystique au simple canidé. Le communiqué officiel Konami présente Ascension comme une série interactive dont l’audience influe sur le récit ; cette preuve générale ne confirme ni le nom propre ni le rôle individuel de cette créature, et ne convertit pas une absence de mise à mort décrite en innocence.
- **Arène d’affectation :** `stilledalen`
- **Comportement canonique déclaré :** Prédateur canin rapide qui bondit après une courte mise en joue.
- **Comportement lore :** Manifestation associée à SILENT HILL: ASCENSION.
- **Références :** `EXT59`, `EXT57`
- **Gestes documentés :**
  - **Bond renversant** — Bond renversant (EXT59) — *documente-secondaire*
- **Contraintes de référence :**
  - Ne pas ajouter des tirs ou statut mystique au simple canidé.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Traque de la meute [adapted-from-canonical-behavior] · NIGHTMARE — Traque achevée [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `ascension_the_collector_183` — The Collector

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Catégorie :** BOSS · boss
- **Rôle de combat :** noncombatant · identité : identite-documentee-secondaire
- **Note d’identité :** La source indique aucune mise à mort active montrée; finisher de capture/transport seulement.; Chorégraphie de porte et collecte à prendre dans canon, pas variantes. Le communiqué officiel Konami présente Ascension comme une série interactive dont l’audience influe sur le récit ; cette preuve générale ne confirme ni le nom propre ni le rôle individuel de cette créature, et ne convertit pas une absence de mise à mort décrite en innocence.
- **Arène d’affectation :** `ascension_otherworld`
- **Comportement canonique déclaré :** Entité à plusieurs bras qui attire, enferme et projette depuis son torse ouvert.
- **Comportement lore :** Manifestation associée à SILENT HILL: ASCENSION.
- **Références :** `EXT58`, `EXT60`, `EXT57`
- **Gestes documentés :**
  - **Portail de torse** — Portail de torse (EXT58, EXT60) — *documente-secondaire*
  - **Collecte et ouverture de porte** — Collecte et ouverture de porte (EXT58, EXT60) — *documente-secondaire*
- **Contraintes de référence :**
  - La source indique aucune mise à mort active montrée; finisher de capture/transport seulement.
  - Chorégraphie de porte et collecte à prendre dans canon, pas variantes.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Porte entre les mondes [adapted-from-canonical-behavior] · NIGHTMARE — Jugement de l’Otherworld [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

### `ascension_stilledalen_stinger_184` — Stilledalen Stinger

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Catégorie :** CREATURE
- **Rôle de combat :** unverified · identité : variante-geographique-non-confirmee
- **Note d’identité :** Stinger à Stilledalen attesté, espèce/variante autonome de ce nom non attestée.; Ne pas compter comme nouvelle race1:1 ni donner attaque hors écran propre. Le communiqué officiel Konami présente Ascension comme une série interactive dont l’audience influe sur le récit ; cette preuve générale ne confirme ni le nom propre ni le rôle individuel de cette créature, et ne convertit pas une absence de mise à mort décrite en innocence.
- **Arène d’affectation :** `stilledalen`
- **Comportement canonique déclaré :** Variante de Stinger orientée feinte et attaque hors écran.
- **Comportement lore :** Manifestation associée à SILENT HILL: ASCENSION.
- **Références :** `EXT58`, `EXT57`
- **Gestes documentés :**
  - Aucun geste documenté dans les références consultées ; capture à relever.
- **Contraintes de référence :**
  - Stinger à Stilledalen attesté, espèce/variante autonome de ce nom non attestée.
  - Ne pas compter comme nouvelle race1:1 ni donner attaque hors écran propre.
  - Fidélité 1:1 non validée sans clip de référence de cette œuvre, poses et mesures.
  - Dégâts, inputs, super, finisher et événements de manche sont des adaptations de versus, même si le geste de base est attesté.
- **Fatalités du profil (2) :** Rituel de clôture — Voile de tendons [adapted-from-canonical-behavior] · NIGHTMARE — Chute sans ciel [adapted-from-canonical-behavior]
- **Répartition des 20 gestes :** 0 directs, 0 composites, 20 adaptations.
- **État actuel :** 0 image(s) acceptée(s), 0 clip(s) animé(s), fidélité `not-assessed`.
- **Blocage à lever :** relever une capture ou une référence visuelle de cette édition, puis mesurer ancres, hauteur corporelle et orientations avant import.

## 2. Arènes sans bitmap

Chaque décor doit rester dans la pièce exacte décrite ci-dessous : aucun accessoire, météo, danger ou animation d’une pièce voisine ne doit être emprunté. Les propositions listées sont des mises en scène du projet, pas des observations.

### `old_silent_hill` — OLD SILENT HILL

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Rues du premier quartier de SH1 ; brouillard et neige distincts de la cendre du film.
- **Base canonique :** CL_SH1_01_OLD_SILENT_HILL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_01_OLD_SILENT_HILL`
- **Famille / météo :** street · snow
- **Accessoires autorisés :** road, shops, chasm
- **Danger d’arène :** staticBurst · animations : streetLightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Neige, visibilité réduite et rues coupées. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Deux nappes de brouillard glissent à des vitesses différentes ; silhouettes lointaines seulement. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un choc près de la devanture fait tinter l’enseigne du café, sans chute sur les combattants. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Une rafale de neige occulte brièvement le fond puis révèle la même rue intacte. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nowhere` — NOWHERE

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Espace composite sans carte de SH1 ; choisir les salles exactes avant assemblage.
- **Base canonique :** CL_SH1_15_NOWHERE
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_15_NOWHERE`
- **Famille / météo :** otherworld · flicker
- **Accessoires autorisés :** grates, chains, fans
- **Danger d’arène :** emberFall · animations : chainSway
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Des pièces de lieux antérieurs se succèdent. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Les lumières s’allument l’une après l’autre vers une porte impossible ; boucle espacée. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Le mur de fond laisse apparaître une trace de chambre puis revient à son matériau initial. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — À la fin de manche, travelling vers une porte et raccord vers une autre salle documentée ; sol de duel stable. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `lakeside_amusement` — LAKESIDE AMUSEMENT PARK

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Parc de SH1 et manège de Cybil ; distinguer explicitement le parc de SH3. Vue retenue : manège de Cybil SH1 original, distinct du Happy Carousel SH3. Rotation de fond lente et un cheval fixe sont une proposition versus ; pas Cybil, gaz/énigme 12 chevaux SH3, grande roue extérieure dans la même vue. Sculptures/caméra interprétées, matériau/humidité non déterminés.
- **Base canonique :** CL_SH1_14_LAKESIDE_AMUSEMENT_PARK
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_14_LAKESIDE_AMUSEMENT_PARK`
- **Famille / météo :** amusement · none
- **Accessoires autorisés :** carousel
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Cybil attend assise avant la rencontre du manège. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le manège vide avance lentement dans le fond, avec un cheval immobilisé pour repère visuel. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — La radio scénique grésille près du tourniquet ; aucun projectile ou monstre supplémentaire. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — L’éclairage du kiosque s’éteint dans le résultat puis une seule ampoule reprend. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `blue_creek` — BLUE CREEK — PALIER DE L’ESCALIER

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Palier de la rencontre Pyramid Head avant drainage ; marches vers l’eau au fond, duel sur un plateau sec adapté. Les vues montrent garde-corps, porte fermée et parois dégradées. Le guide confirme eau puis drainage, sans hauteur native mesurée. Le boss et sa sirène ne sont pas rejoués. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH2_03_BLUE_CREEK_APTS ; EXT12_REF_BLUE_CREEK_ROOM_2_20261101 ; EXT12_REF_BLUE_CREEK_ROOM_3_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_03_BLUE_CREEK_APTS`, `EXT12_REF_BLUE_CREEK_ROOM_2_20261101`, `EXT12_REF_BLUE_CREEK_ROOM_3_20261101`
- **Famille / météo :** apartment · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — La porte de fond du palier reste fermée, sans entrée ou départ automatique de PyramidHead ; la lumière y varie faiblement. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Quelques rides gardent un niveau constant au fond des marches ; hauteur et cadence sont des réglages du versus, sans drainage de manche. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un choc contre la rampe produit une vibration métallique et une goutte dans l’eau. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Un reflet révèle les taches de l’enduit au-dessus du garde-corps ; aucune sirène, chute de plâtre ou transition de pièce. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `brookhaven_sh2` — BROOKHAVEN — BASEMENT

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** SH2 original2001 : extrémité du couloir Otherworld B1 de Brookhaven, devant l’ascenseur pendant la poursuite de Pyramid Head. Le guide décrit une cutscène puis la remontée vers le premier étage ; la capture de cabine montre l’état après fermeture. Le maintien des portes entrouvertes avant cette fermeture est une suspension adaptée au versus, sans capture prouvant cette ouverture ni cycle original mesuré. Aucun trajet vers le lobby, décès de Maria ou poursuivant n’est rejoué automatiquement. Dimensions, caméra et battement des portes restent à comparer aux captures originales.
- **Base canonique :** CL_SH2_06_NIGHTMARE_HOSPITAL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_06_NIGHTMARE_HOSPITAL`
- **Famille / météo :** hospital · none
- **Accessoires autorisés :** elevator
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — La poursuite à la lance se termine devant l’ascenseur. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une porte d’ascenseur reste entrouverte avec bourdonnement mécanique cyclique. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Après impact près du mur, une lumière de maintenance oscille au bout du couloir. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Fermeture des portes sur une ombre distante pendant le résultat, sans rejouer le sort de Maria à chaque manche. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `toluca_prison` — TOLUCA — COUR DU GIBET

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Cour de TolucaPrison devant le panneau du gibet, avant placement des trois plaques ; hors blocs de cellules. Vue sombre montrant façade de bois et panneau : motifs illisibles abstraits. Haut du gibet et corde hors lumière non reconstruits ; aucune exécution, cellule ou victime ajoutée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH2_09_TOLUCA_PRISON ; EXT12_REF_TOLUCA_PRISON_ROOM_2_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_09_TOLUCA_PRISON`, `EXT12_REF_TOLUCA_PRISON_ROOM_2_20261101`
- **Famille / météo :** prison · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le panneau frontal et son encadrement de bois restent intacts ; une faible lueur expose leurs logements sans placer les trois plaques. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Balancement presque imperceptible d’une corde au fond de la cour, sans force surnaturelle attribuée à un combattant. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une porte de cellule vibre après impact proche ; les autres restent closes. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Un long frottement court derrière les portes, suivi d’un arrêt sec au début de la manche suivante. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `labyrinth` — LABYRINTHE — COMMANDE BOX OF FACES

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Pièce de commande BoxofFaces de SH2original, cube immobile avant manipulation ; hors salleAbstractDaddy et couloir des cordes. Cube à visage, pied circulaire sur table et panneaux perforés documentés. Le visage reste abstrait sans portrait copié ; aucune rotation automatique, crâne complet ou reconfiguration des collisions. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH2_10_THE_LABYRINTH ; EXT12_REF_LABYRINTH_ROOM_2_20261101 ; EXT12_REF_LABYRINTH_ROOM_3_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_10_THE_LABYRINTH`, `EXT12_REF_LABYRINTH_ROOM_2_20261101`, `EXT12_REF_LABYRINTH_ROOM_3_20261101`
- **Famille / météo :** labyrinth · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le cube demeure sur son pied circulaire et sa table ; un reflet local ne commande aucune rotation du labyrinthe. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le cube à face abstraite conserve son orientation ; seule sa lumière varie. Aucune rotation automatique ou face source inventée. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un éclairage lent reste sur les panneaux perforés de la pièce photographiée ; aucun fil qui se tend après impact. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Raccord de caméra vers une orientation différente du couloir au résultat ; garder les distances de combat constantes. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hotel_otherworld` — LAKEVIEW HOTEL — OTHERWORLD

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** État ruiné du Lakeview après la cassette, SH2 original.
- **Base canonique :** CL_SH2_13_NIGHTMARE_HOTEL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_13_NIGHTMARE_HOTEL`
- **Famille / météo :** hotel · water
- **Accessoires autorisés :** stairs
- **Danger d’arène :** emberFall · animations : lampFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le hall accueille les deux Pyramid Heads à lance. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Eau fine sur le carrelage et gouttes issues du plafond brûlé ; reflets à faible contraste. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une secousse détache seulement de la poussière du haut du mur, sans incendie inventé. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La caméra recule sur les traces des deux lances pendant le score ; les deux boss restent une rencontre dédiée. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `brookhaven_sh3` — BROOKHAVEN — FLOODED ROOM

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Salle d’eau du boss Leonard sous Brookhaven Otherworld, SH3.
- **Base canonique :** CL_SH3_12_NIGHTMARE_HOSPITAL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_12_NIGHTMARE_HOSPITAL`
- **Famille / météo :** hospital · water
- **Accessoires autorisés :** water, pipes, doors
- **Danger d’arène :** bloodTide · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Leonard plonge et refait surface dans l’eau. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Ondulations se propagent depuis un point de fond ; ne pas signaler une attaque du boss absent. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une poussée contre la grille projette une gerbe d’eau décorative limitée au bord. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le niveau reste constant ; baisse du bruit d’eau puis reprise des remous à la manche suivante. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `church` — CHURCH — CHAPELLE INITIALE

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Chapelle initiale avec autel, cierges et vitraux ; hors bibliothèque, couloirs mémoire et fosse du dieu. Autel en bois, cierges et triple vitrage documentés. Verres colorés abstraits sans figures ou texte religieux copié. Pas page tournée d’un livre non identifié, orgue ou invocation. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH3_14_CHURCH ; EXT12_REF_CHURCH_ROOM_2_20261101 ; EXT12_REF_CHURCH_ROOM_3_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_14_CHURCH`, `EXT12_REF_CHURCH_ROOM_2_20261101`, `EXT12_REF_CHURCH_ROOM_3_20261101`
- **Famille / météo :** church · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — L’autel conserve son panneau de bois et sa niche centrale ; un reflet remplace toute naissance automatique du dieu. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Les flammes restent sur les cierges de la chapelle photographiée ; leur très faible variation est originale au versus, sans dégâts. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une lueur douce traverse trois panneaux de verre coloré abstraits ; aucun livre dont une page tournerait sans référence. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le fond s’efface jusqu’aux vitraux puis retrouve sa profondeur ; aucune invocation automatique par manche. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `apartment_roof` — DAISY VILLA ROOFTOP

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Toit Daisy Villa du combat Missionary de SH3.
- **Base canonique :** CL_SH3_09_DAISY_VILLA_APARTMENTS
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_09_DAISY_VILLA_APARTMENTS`
- **Famille / météo :** roof · fog
- **Accessoires autorisés :** fence, water, antenna
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Missionary charge et combat au milieu des installations du toit. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une antenne plie légèrement dans le vent ; câbles tendus gardés hors collision. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un choc contre le coffre technique provoque une pluie brève d’étincelles sans dégâts supplémentaires. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Vent accentué et ombre passant sur le sol, puis retour au ciel stable avant la reprise. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `sewers` — SEWER CHANNEL

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Canal du piège Sewer Creature dans SH3 ; garder la créature majoritairement sous l’eau. Vue retenue : passerelle du canal APRÈS usage du sèche-cheveux, car le câble n’est installé qu’à ce moment. Eau sous la passerelle, sans ennemi vivant réintroduit ni courant électrique jouable. Vibrations du câble/remous proposés, pas plateau de duel inondé.
- **Base canonique :** CL_SH3_05_UNDERPASS
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_05_UNDERPASS`
- **Famille / météo :** sewer · dust
- **Accessoires autorisés :** canal, pipes, grates
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le sèche-cheveux branché électrifie le canal. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Remous sous la passerelle et petites vibrations du câble posé sur le sol. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Reconstitution du déclenchement électrique seulement dans une scène de danger annoncée ; pas effet passif en versus. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Après résultat, lumière du panneau électrique puis eau redevenue calme ; aucun monstre complet inventé. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `room_302` — ROOM302 — ENTRÉE ENCHAÎNÉE

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Entrée de Room302 au premier passage, porte enchaînée fermée et kitchenette adjacente ; hors salle de bain et hantises ultérieures. Porte et chaînes, plafonnier rond, réfrigérateur et placards visibles. Pas inscription copiée, voix, apparition ou trou de salle de bain déplacé dans l’entrée. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH4_01_ROOM_302 ; EXT12_REF_ROOM_302_ROOM_2_20261101 ; EXT12_REF_ROOM_302_ROOM_3_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_01_ROOM_302`, `EXT12_REF_ROOM_302_ROOM_2_20261101`, `EXT12_REF_ROOM_302_ROOM_3_20261101`
- **Famille / météo :** room · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — La porte reste fermée sous ses chaînes ; les maillons reçoivent une faible variation de reflet sans ouverture automatique. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le plafonnier rond photographié conserve sa place et une lumière douce ; aucune chaîne autonome qui pend depuis le plafond. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Le réfrigérateur, le carrelage et les placards restent fixes près de la porte ; un reflet remplace le trou de bain absent du cadrage. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — L’œil de caméra passe brièvement par le judas, puis revient au salon sans montrer une scène extérieure inventée. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `subway_world` — SUBWAY WORLD

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Subway World de SH4 ; trains traversables et escalator avec Wallmen. Vue retenue : premier passage, quai Lynch Street et voitures arrêtées aux portes commandées par bouton rouge ; ni escalator/Wallmen, ni arrivée du train de Hazel Street SH3. Le cycle visuel du panneau est une proposition versus, pas un automatisme du récit.
- **Base canonique :** CL_SH4_02_SUBWAY_WORLD
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_02_SUBWAY_WORLD`
- **Famille / météo :** subway · dust
- **Accessoires autorisés :** train, tiles
- **Danger d’arène :** chainSweep · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le bouton rouge commande les portes de certaines voitures. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Un panneau de porte tente de se fermer puis se rouvre, avec délai long et régulier. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — L’escalator de fond continue à tourner après choc ; une empreinte de bras paraît sous sa paroi. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Les néons des wagons s’éteignent en profondeur puis reviennent vers la caméra. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `water_prison` — WATER PRISON — SURVEILLANCE2F

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Salle centrale de surveillance2F au premier passage, avant rotation de la vanne ; hors roue hydrauliqueB2 et vanne de toit. Volant sur piédestal, œilletons circulaires et puits à échelle de la salle photographiée. Aucun gardien, cellule/étage tournant ou roue B2 ; accès en profondeur hors sol de duel. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH4_04_WATER_PRISON_WORLD ; EXT12_REF_WATER_PRISON_ROOM_2_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_04_WATER_PRISON_WORLD`, `EXT12_REF_WATER_PRISON_ROOM_2_20261101`
- **Famille / météo :** prison · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le volant posé sur son piédestal reste immobile ; une lueur sur le métal ne déclenche aucune rotation des cellules. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Les œilletons métalliques gardent leurs ouvertures sombres ; un reflet remplace la roueB2 située dans une autre pièce. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — L’ouverture circulaire et le haut de l’échelle restent derrière le plateau sec ; aucun mécanisme entraîné ni chute des combattants. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Un faisceau vertical rejoint une ouverture pendant le résultat, puis l’éclairage de combat reprend. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `apartment_world` — APARTMENT WORLD — BUREAU105

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Bureau du conciergeRoom105 au premier passage ApartmentWorld, près de la table aux clés ; hors couloir302 et appartementRichard. Bureau, chaise tubulaire et partition à barreaux visibles. Pas poupée, cordon, occupant, document lisible ou serrure du puzzle reproduite. Lumière, caméra et proportions composées pour le versus ; aucun minutage, volume ou mouvement original mesuré, fidélité1:1 non certifiée.
- **Base canonique :** CL_SH4_06_APARTMENT_WORLD ; EXT12_REF_APARTMENT_WORLD_ROOM_2_20261101 ; EXT12_REF_APARTMENT_WORLD_ROOM_3_20261101
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_06_APARTMENT_WORLD`, `EXT12_REF_APARTMENT_WORLD_ROOM_2_20261101`, `EXT12_REF_APARTMENT_WORLD_ROOM_3_20261101`
- **Famille / météo :** apartment · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le bureau reste à sa place avec des feuilles abstraites sans texte lisible ; le reflet ne résout aucune serrurerie. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — La chaise vide reste devant le bureau ; son reflet varie sans porte entrouverte ou couloir transporté dans la pièce. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Les barreaux photographiés restent en arrière-plan ; aucune chaîne de porte résonnante ou arrivée de Walter. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Des pas s’arrêtent derrière la porte 302 pendant la pause ; aucune entrée de Walter imposée. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hospital_world` — HOSPITAL WORLD

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Hôpital de SH4 aux chambres d’étage variables ; ne pas réutiliser un plan Brookhaven. Vue retenue : couloir des chambres au 2e étage, sans chambre de tête géante ni lits. Le fauteuil abstrait de fond est la proposition versus ; les Wheelchairs sont des ennemis dans SH4, leurs dégâts/IA ne sont pas importés par cette piste décorative. Aucun réarrangement des pièces actives.
- **Base canonique :** CL_SH4_07_HOSPITAL_WORLD
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_07_HOSPITAL_WORLD`
- **Famille / météo :** hospital · dust
- **Accessoires autorisés :** wheelchairs
- **Danger d’arène :** fallingDebris · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Les fauteuils vides circulent et la tête géante suit du regard. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Un fauteuil de fond roule jusqu’à une marque, pivote lentement puis s’immobilise. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — La porte d’une chambre entrouverte révèle seulement un œil qui se tourne vers le choc. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le couloir derrière les portes change de lumière pendant le score ; topologie active fixe. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `cedar_grove` — CEDAR GROVE — FEMALE TREATMENT

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Salle Female Treatment du Sanitarium, avant la traversée du miroir ; ni couloir entier ni chambre Momma. Le guide et les plans situent le miroir, sans vue native entière de cette pièce inspectée. Cadre, carreaux, profondeur, reflet et faible mouvement sont une reconstruction versus ; aucune géométrie ou bascule originale certifiée.
- **Base canonique :** EXT03 ; EXT02 ; EXT_ORIGINS_THEATER_GUIDE_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT03`, `EXT02`, `EXT_ORIGINS_THEATER_GUIDE_20261026`
- **Famille / météo :** hospital · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **cedar_grove_ambient_01** — Oscillation d’une lampe du couloir — *adaptation-animation-proposee*
  - **cedar_grove_ambient_02** — La surface du miroir conserve un voile de reflet fixe avec un glissement lumineux proposé ; aucun changement automatique du monde. — *adaptation-animation-proposee*
  - **cedar_grove_ambient_03** — Vibration distante de cage dans la zone d’Helen — *adaptation-animation-proposee*
  - **cedar_grove_round_transition** — Transition proposée pour CEDAR GROVE SANITARIUM : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `riverside_motel` — RIVERSIDE MOTEL

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Riverside Motel; cuisine du Butcher et chambre500 de Richard sont des sous-lieux distincts.
- **Base canonique :** EXT03 ; EXT02
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT03`, `EXT02`
- **Famille / météo :** motel · fog
- **Accessoires autorisés :** rooms, neon, pool
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **riverside_motel_ambient_01** — Enseigne motel clignotant irrégulièrement — *adaptation-animation-proposee*
  - **riverside_motel_ambient_02** — Rideau de chambre soulevé par un courant faible — *adaptation-animation-proposee*
  - **riverside_motel_ambient_03** — Vapeur de cuisine dérivant en arrière-plan — *adaptation-animation-proposee*
  - **riverside_motel_round_transition** — Transition proposée pour RIVERSIDE MOTEL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `shepherds_glen` — SHEPHERD’S GLEN

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Ville de Shepherd’s Glen; cadrage de rue à définir.
- **Base canonique :** EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`
- **Famille / météo :** street · fog
- **Accessoires autorisés :** road
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **shepherds_glen_ambient_01** — Brume qui traverse la chaussée — *adaptation-animation-proposee*
  - **shepherds_glen_ambient_02** — Affiches de disparus agitées sur panneau — *adaptation-animation-proposee*
  - **shepherds_glen_ambient_03** — Faisceau de lampadaire affaibli par le brouillard — *adaptation-animation-proposee*
  - **shepherds_glen_round_transition** — Transition proposée pour SHEPHERD’S GLEN : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `grand_hotel` — GRAND HOTEL

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Grand Hotel et rencontre Sepulcher; ne pas reproduire Lakeview.
- **Base canonique :** EXT06 ; EXT05
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`, `EXT05`
- **Famille / météo :** hotel · dust
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : lampFlicker
- **Motifs de référence :**
  - **grand_hotel_ambient_01** — Suspension du lustre — *adaptation-animation-proposee*
  - **grand_hotel_ambient_02** — Poussière près des passerelles endommagées — *adaptation-animation-proposee*
  - **grand_hotel_ambient_03** — Support du boss vibrant après impact — *adaptation-animation-proposee*
  - **grand_hotel_round_transition** — Transition proposée pour GRAND HOTEL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_school` — MIDWICH GELÉ — COUR PAPARAZZI

- **Œuvre / édition :** SILENT HILL: SHATTERED MEMORIES (2009) (`shattered`)
- **Prémisse lore :** Midwich High School, Nightmare3 : cour du premier point de photographie Paparazzi. Le guide situe une grande fenêtre éclairée en rouge ; la petite capture 3b montre surtout le téléphone cadrant cette fenêtre et ne relève pas toute la cour. Le versus retient le bâti et une ambiance glacée locale ; il ne rejoue ni couple, quête photo, poursuite ou ouverture finale. Aucun mouvement de givre original ni géométrie complète ne sont mesurés.
- **Base canonique :** EXT09 ; EXT10_SM_SCHOOL_GUIDE_20261026 ; EXT10_SM_SCHOOL_WINDOW_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT09`, `EXT10_SM_SCHOOL_GUIDE_20261026`, `EXT10_SM_SCHOOL_WINDOW_20261026`
- **Famille / météo :** ice · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **nightmare_school_ambient_01** — Cristaux de glace progressant sur une vitre — *adaptation-animation-proposee*
  - **nightmare_school_ambient_02** — Buée dans le faisceau — *adaptation-animation-proposee*
  - **nightmare_school_ambient_03** — Fissure lumineuse au sol après un choc — *adaptation-animation-proposee*
  - **nightmare_school_round_transition** — Transition proposée pour FROZEN SCHOOL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `overlook` — OVERLOOK PENITENTIARY

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Overlook Penitentiary version Downpour; ne pas reprendre le plan de Homecoming. Vue retenue : coursive BlockA de la prison normale Downpour, avant la cellule transformée en couloir inondé. Ombres des barreaux proposées pour le versus ; tours extérieures, showers/crime scene, workshop flooding et PrisonHC séparés.
- **Base canonique :** EXT11
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT11`
- **Famille / météo :** prison · dust
- **Accessoires autorisés :** cells
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **overlook_ambient_01** — Ombres de barreaux sur béton humide — *adaptation-animation-proposee*
  - **overlook_ambient_02** — Portes vibrant à distance — *adaptation-animation-proposee*
  - **overlook_ambient_03** — Ruissellement près des cellules — *adaptation-animation-proposee*
  - **overlook_round_transition** — Transition proposée pour OVERLOOK PENITENTIARY : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_ship` — LITTLE BARONESS

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Little Baroness; conserver l’époque et le point de vue du bateau choisi.
- **Base canonique :** EXT13 ; EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT13`, `EXT15`
- **Famille / météo :** ship · water
- **Accessoires autorisés :** deck, crates, chains
- **Danger d’arène :** bloodTide · animations : waves
- **Motifs de référence :**
  - **arcade_ship_ambient_01** — Tangage léger du pont — *adaptation-animation-proposee*
  - **arcade_ship_ambient_02** — Vapeur de cheminée — *adaptation-animation-proposee*
  - **arcade_ship_ambient_03** — Câble de bastingage tendu par la houle — *adaptation-animation-proposee*
  - **arcade_ship_round_transition** — Transition proposée pour LITTLE BARONESS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_zone` — BOOK OF MEMORIES — NEXUS

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Nexus est appellation de hub du projet; sept zones sont attestées, Nexus comme lieu canon reste à prouver.
- **Base canonique :** EXT21
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT21`
- **Famille / météo :** book · none
- **Accessoires autorisés :** pages, doors, altar
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **book_zone_ambient_01** — Livre ouvert comme interface diégétique proposée — *adaptation-animation-proposee*
  - **book_zone_ambient_02** — Lumière alternant Blood/Light autour du livre — *adaptation-animation-proposee*
  - **book_zone_ambient_03** — Marque de mission de Valtiel au bord du cadre — *adaptation-animation-proposee*
  - **book_zone_round_transition** — Transition proposée pour BOOK OF MEMORIES — NEXUS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `looping_hall` — P.T. — COULOIR ÉCLAIRÉ

- **Œuvre / édition :** P.T. (2014) (`pt`)
- **Prémisse lore :** Couloir P.T. éclairé, murs beige et plancher sombre, photographié le14août2014 ; numéro de boucle non déterminable. Reconstruction frontale versus de ses deux tronçons, sans réinitialisation de topologie. Trois vues natives inspectées : appliques et plinthes, lanterne et porte fermée, poste RADIO sur meuble. Aucun téléphone entier ou vibration attestée ; pas photographie de couple reproduite, Lisa, phase rouge, réfrigérateur suspendu, son capturé ou boucle source simulée.
- **Base canonique :** EXT27 ; EXT28 ; EXT11_REF_LOOPING_HALL_ROOM_1_20261028 ; EXT11_REF_LOOPING_HALL_ROOM_2_20261028 ; EXT11_REF_LOOPING_HALL_ROOM_3_20261028 ; EXT11_REF_LOOPING_HALL_ROOM_4_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT27`, `EXT28`, `EXT11_REF_LOOPING_HALL_ROOM_1_20261028`, `EXT11_REF_LOOPING_HALL_ROOM_2_20261028`, `EXT11_REF_LOOPING_HALL_ROOM_3_20261028`, `EXT11_REF_LOOPING_HALL_ROOM_4_20261028`
- **Famille / météo :** hall · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **looping_hall_ambient_01** — La lanterne suspendue du second tronçon reçoit une oscillation très faible ; cadence et angle du versus, sans extinction de boucle. — *adaptation-animation-proposee*
  - **looping_hall_ambient_02** — Le poste RADIO visible sur le meuble garde son boîtier fixe ; une variation de reflet remplace le téléphone vibrant non confirmé dans ce cadrage. — *adaptation-animation-proposee*
  - **looping_hall_ambient_03** — La porte de fond reste fermée dans le cadrage éclairé ; seule sa lumière varie doucement, sans rejouer une boucle ni ouvrir un passage. — *adaptation-animation-proposee*
  - **looping_hall_round_transition** — Transition proposée pour 204863 — LOOPING HALL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `villa` — KETTENSTADT VILLA

- **Œuvre / édition :** SILENT HILL: THE SHORT MESSAGE (2024) (`shortmessage`)
- **Prémisse lore :** Complexe abandonné The Villa dans Kettenstadt; couloirs et appartements à différencier.
- **Base canonique :** EXT30 ; EXT31
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT30`, `EXT31`
- **Famille / météo :** villa · dust
- **Accessoires autorisés :** graffiti, stairs, fence
- **Danger d’arène :** petalBloom · animations : lightFlicker
- **Motifs de référence :**
  - **villa_ambient_01** — Post-it soulevé par courant d’air — *adaptation-animation-proposee*
  - **villa_ambient_02** — Pulsation du téléphone hors plan — *adaptation-animation-proposee*
  - **villa_ambient_03** — Ombres de clôtures dans le labyrinthe — *adaptation-animation-proposee*
  - **villa_round_transition** — Transition proposée pour KETTENSTADT VILLA : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `ebisugaoka` — EBISUGAOKA — MAIN STREET

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Ebisugaoka; Japon années1960, rue exacte à fixer.
- **Base canonique :** EXT32
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT32`
- **Famille / météo :** village · fog
- **Accessoires autorisés :** shops, phone, flowers
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **ebisugaoka_ambient_01** — Brume entre toits — *adaptation-animation-proposee*
  - **ebisugaoka_ambient_02** — Fleurs rouges gagnant les bordures — *adaptation-animation-proposee*
  - **ebisugaoka_ambient_03** — Papier d’enseigne dans un courant faible — *adaptation-animation-proposee*
  - **ebisugaoka_round_transition** — Transition proposée pour EBISUGAOKA — MAIN STREET : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `dark_shrine` — DARK SHRINE — PARVIS DE SHRINE VAULT

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Dark Shrine Path : parvis extérieur devant la porte encore fermée du Shrine Vault. Le petit Hokora à gauche porte une corde et des papiers shide, près des lanternes et des marches. Ce cadrage ne fusionne pas les corridors, Main Hall ou Treasure Hall ; oscillation et éclairage du versus restent adaptés, sans vent ou mouvement original mesuré.
- **Base canonique :** EXT33 ; EXT34 ; EXT10_SHF_SHRINE_PATH_GUIDE_20261026 ; EXT10_SHF_SHRINE_HOKORA_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT33`, `EXT34`, `EXT10_SHF_SHRINE_PATH_GUIDE_20261026`, `EXT10_SHF_SHRINE_HOKORA_20261026`
- **Famille / météo :** shrine · none
- **Accessoires autorisés :** lanterns
- **Danger d’arène :** petalBloom · animations : aucune
- **Motifs de référence :**
  - **dark_shrine_ambient_01** — Lueur aux lanternes — *adaptation-animation-proposee*
  - **dark_shrine_ambient_02** — Oscillation de cordes rituelles — *adaptation-animation-proposee*
  - **dark_shrine_ambient_03** — Frémissement de papier de sanctuaire — *adaptation-animation-proposee*
  - **dark_shrine_round_transition** — Transition proposée pour DARK SHRINE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `school_shf` — EBISUGAOKA SCHOOL — BUREAU DU PERSONNEL

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Ebisugaoka Middle School : bureau du personnel au coffret de la Key to the Back Mountains. La capture montre un tableau mural de service à droite du coffret, une armoire et du bois au sol ; il ne s’agit pas d’une salle de classe ou d’un couloir à rideaux. Ne pas importer Hinako, la clé, sa prise, son arme ou des ennemis. Animation, caméra et dimensions restent à produire ou comparer.
- **Base canonique :** EXT32 ; EXT10_SHF_SCHOOL_GUIDE_20261026 ; EXT10_SHF_STAFF_ROOM_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT32`, `EXT10_SHF_SCHOOL_GUIDE_20261026`, `EXT10_SHF_STAFF_ROOM_20261026`
- **Famille / météo :** school · none
- **Accessoires autorisés :** flowers
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **school_shf_ambient_01** — Rideau de classe légèrement gonflé — *adaptation-animation-proposee*
  - **school_shf_ambient_02** — Poussière de craie — *adaptation-animation-proposee*
  - **school_shf_ambient_03** — Vitre progressivement couverte de flore — *adaptation-animation-proposee*
  - **school_shf_round_transition** — Transition proposée pour EBISUGAOKA MIDDLE SCHOOL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hinako_home` — SHIMIZU RESIDENCE I — CORRIDOR D’ENTRÉE

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Shimizu ResidenceI : corridor d’entrée/sortie avec plancher de bois et porte coulissante à panneaux translucides, cadré par la vue de fin de cette visite. Il s’agit de la même résidence que shimizu_residence, ici dans une pièce différente ; aucune seconde maison n’est inventée. Ni passage de porte, ouverture ou transition vers ResidenceII ne sont automatiquement rejoués.
- **Base canonique :** EXT34 ; EXT10_SHF_SHIMIZU_RESIDENCE_GUIDE_20261026 ; EXT10_SHF_RESIDENCE_ENTRY_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT34`, `EXT10_SHF_SHIMIZU_RESIDENCE_GUIDE_20261026`, `EXT10_SHF_RESIDENCE_ENTRY_20261026`
- **Famille / météo :** house · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **hinako_home_ambient_01** — Cloison coulissante vibrante — *adaptation-animation-proposee*
  - **hinako_home_ambient_02** — Ombre de branche sur tatami — *adaptation-animation-proposee*
  - **hinako_home_ambient_03** — Lumière du couloir au seuil familial — *adaptation-animation-proposee*
  - **hinako_home_round_transition** — Transition proposée pour HINAKO’S HOME : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `festival_square` — FESTIVAL SQUARE

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Place de festival : nom éditorial non confirmé par référence consultée.
- **Base canonique :** EXT32
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT32`
- **Famille / météo :** festival · none
- **Accessoires autorisés :** drums, stalls, lanterns
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **festival_square_ambient_01** — Lanternes et fanions proposés seulement après localisation — *bloque-reference*
  - **festival_square_ambient_02** — Traces de fête dans la brume à confirmer — *bloque-reference*
  - **festival_square_round_transition** — Transition proposée pour FESTIVAL SQUARE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_fire` — FIRE ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Fire attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : deux vues de la galerie datée16octobre2012 montrent des sols et parois industriels, grilles et lueurs chaudes. Elles guident un cadre de salle adapté au versus sans identifier toute la géométrie procédurale ; personnages, HUD, attaques et dangers des captures sont exclus.
- **Base canonique :** EXT21 ; EXT9_BOM_FIRE_VIEW_01_20261026 ; EXT9_BOM_FIRE_VIEW_02_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`, `EXT9_BOM_FIRE_VIEW_01_20261026`, `EXT9_BOM_FIRE_VIEW_02_20261026`
- **Famille / météo :** elemental · embers
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **book_fire_ambient_01** — Langues de flamme entre dalles — *adaptation-animation-proposee*
  - **book_fire_ambient_02** — Braises ascendantes — *adaptation-animation-proposee*
  - **book_fire_ambient_03** — Fumée s’interrompant au passage du Guardian — *adaptation-animation-proposee*
  - **book_fire_round_transition** — Transition proposée pour FIRE ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_wood` — WOOD ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Wood attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : la vue de galerie datée16octobre2012 montre une arène terreuse avec branches nues et pierres près du Wood Guardian. Le prototype peut reprendre les matériaux visibles sans importer le boss, ses rejetons, leur zone de contact ou une disposition procédurale prétendue fixe.
- **Base canonique :** EXT21 ; EXT9_BOM_WOOD_VIEW_06_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`, `EXT9_BOM_WOOD_VIEW_06_20261026`
- **Famille / météo :** elemental · spores
- **Accessoires autorisés :** roots, moss
- **Danger d’arène :** petalBloom · animations : aucune
- **Motifs de référence :**
  - **book_wood_ambient_01** — Branches frémissantes — *adaptation-animation-proposee*
  - **book_wood_ambient_02** — Racines parcourant la bordure — *adaptation-animation-proposee*
  - **book_wood_ambient_03** — Poussière d’écorce après impact — *adaptation-animation-proposee*
  - **book_wood_round_transition** — Transition proposée pour WOOD ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_light` — LIGHT ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Light attestée dans Book of Memories; salle procédurale précise à choisir.
- **Base canonique :** EXT21
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`
- **Famille / météo :** elemental · light
- **Accessoires autorisés :** mirrors, runes, pillars
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **book_light_ambient_01** — Pulsation du cœur lumineux de la salle — *adaptation-animation-proposee*
  - **book_light_ambient_02** — Trajet de lumière entre colonnes — *adaptation-animation-proposee*
  - **book_light_ambient_03** — Eclat décroissant après fin de manche — *adaptation-animation-proposee*
  - **book_light_round_transition** — Transition proposée pour LIGHT ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_water` — WATER ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Water attestée dans Book of Memories; salle procédurale précise à choisir.
- **Base canonique :** EXT21
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`
- **Famille / météo :** elemental · water
- **Accessoires autorisés :** pools, runes, bridges
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **book_water_ambient_01** — Ondes autour d’un pilier — *adaptation-animation-proposee*
  - **book_water_ambient_02** — Ruissellement le long des murs — *adaptation-animation-proposee*
  - **book_water_ambient_03** — Bouillonnement à l’entrée du Guardian — *adaptation-animation-proposee*
  - **book_water_round_transition** — Transition proposée pour WATER ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_earth` — EARTH ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Earth attestée dans Book of Memories; salle procédurale précise à choisir. Lot9 : la vue de galerie datée6juin2012 montre une pièce sombre avec matériaux terreux, bois et récipients. Il s’agit d’une préversion ; ni pièce finale, ni disposition, mouvement ou physique de la version commerciale ne sont confirmés. Aucun personnage, arme, HUD ou danger ne doit être importé.
- **Base canonique :** EXT21 ; EXT9_BOM_EARTH_VIEW_37_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`, `EXT9_BOM_EARTH_VIEW_37_20261026`
- **Famille / météo :** elemental · dust
- **Accessoires autorisés :** rocks, cracks
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **book_earth_ambient_01** — Graviers qui roulent — *adaptation-animation-proposee*
  - **book_earth_ambient_02** — Poussière des fissures — *adaptation-animation-proposee*
  - **book_earth_ambient_03** — Tremblement d’un bloc après impact — *adaptation-animation-proposee*
  - **book_earth_round_transition** — Transition proposée pour EARTH ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_blood` — BLOOD ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Blood attestée dans Book of Memories; salle procédurale précise à choisir.
- **Base canonique :** EXT21
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`
- **Famille / météo :** elemental · blood
- **Accessoires autorisés :** aucun
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **book_blood_ambient_01** — Surface liquide pulsante — *adaptation-animation-proposee*
  - **book_blood_ambient_02** — Mouvements des liens de décor — *adaptation-animation-proposee*
  - **book_blood_ambient_03** — Retrait lent d’une masse au bord de la scène — *adaptation-animation-proposee*
  - **book_blood_round_transition** — Transition proposée pour BLOOD ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `book_steel` — STEEL ZONE

- **Œuvre / édition :** SILENT HILL: BOOK OF MEMORIES (2012) (`bom`)
- **Prémisse lore :** Zone Steel attestée dans Book of Memories; salle procédurale précise à choisir.
- **Base canonique :** EXT21
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT21`
- **Famille / météo :** elemental · sparks
- **Accessoires autorisés :** gears, runes, chains
- **Danger d’arène :** chainSweep · animations : aucune
- **Motifs de référence :**
  - **book_steel_ambient_01** — Vibration de plaques — *adaptation-animation-proposee*
  - **book_steel_ambient_02** — Reflet parcourant une lame de décor — *adaptation-animation-proposee*
  - **book_steel_ambient_03** — Etincelles locales après impact — *adaptation-animation-proposee*
  - **book_steel_round_transition** — Transition proposée pour STEEL ZONE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `antique_shop` — GREEN LION — PASSAGE VERS LE RITUEL

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Passage après le trou de Green Lion Antiques, avant la confrontation finale Origins ; aucun stock de la boutique SH1 transporté ici. Le guide confirme le trou puis la confrontation, et illustre séparément le Flauros assemblé. Le passage, l’éclairage et la position scénique du volume géométrique restent des adaptations, pas une photographie du Flauros dans cette salle. Aucun personnage, corps rituel, symbole lisible ou grille d’inventaire.
- **Base canonique :** EXT02 ; EXT_ORIGINS_THEATER_GUIDE_20261026 ; EXT11_REF_ANTIQUE_SHOP_ROOM_2_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT02`, `EXT_ORIGINS_THEATER_GUIDE_20261026`, `EXT11_REF_ANTIQUE_SHOP_ROOM_2_20261028`
- **Famille / météo :** otherworld · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **antique_shop_ambient_01** — Quelques particules restent au bord du trou menant au passage intérieur ; aucun meuble de la boutique SH1 ajouté. — *adaptation-animation-proposee*
  - **antique_shop_ambient_02** — Une ombre douce accompagne une représentation abstraite du Flauros assemblé ; son emplacement est une composition versus à partir du motif du puzzle. — *adaptation-animation-proposee*
  - **antique_shop_ambient_03** — Une faible lueur de fond gagne le mur du passage, sans jouer un rituel ou révéler un corps ; éclairage original de versus. — *adaptation-animation-proposee*
  - **antique_shop_round_transition** — Transition proposée pour GREEN LION ANTIQUES : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `church_hc` — CHURCH OF THE HOLY WAY — NEF

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Nef et fond à orgue de Church of the Holy Way, avant la rupture de la fenêtre du chevalier ; pas confessionnal ou église du film. Le guide décrit la fenêtre, les plaques et le pentagone à la base de l’orgue ; les images montrent les cierges et le panneau. Tuyaux supérieurs non reconstruits faute de vue native attribuée. Cadres, teintes et ombres sont abstraits, sans dessin du chevalier ou Halo lisible, Siam, chute du vitrail ou activation du puzzle. La galerie seule ne certifie pas édition et instant de jeu.
- **Base canonique :** EXT07 ; EXT06 ; EXT11_REF_CHURCH_HC_ROOM_2_20261028 ; EXT11_REF_CHURCH_HC_ROOM_3_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT07`, `EXT06`, `EXT11_REF_CHURCH_HC_ROOM_2_20261028`, `EXT11_REF_CHURCH_HC_ROOM_3_20261028`
- **Famille / météo :** church · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **church_hc_ambient_01** — Flammes limitées aux cierges de la nef documentée, sans cérémonie ou dégâts passifs. — *adaptation-animation-proposee*
  - **church_hc_ambient_02** — Lueur abstraite à travers un vitrage de la nef avant sa rupture ; aucun Halo inventé au sol ni dessin du chevalier reproduit. — *adaptation-animation-proposee*
  - **church_hc_ambient_03** — Reflet lent sur les cinq logements du panneau de l’orgue ; les tentures et volets non attestés sont écartés et le puzzle ne se résout pas. — *adaptation-animation-proposee*
  - **church_hc_round_transition** — Transition proposée pour SHEPHERD’S GLEN CHURCH : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `underground_hc` — UNDERGROUND — ANTICHAMBRE DES FAMILLES

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Antichambre Founding Families Puzzle, après la confrontation Curtis et avant la salle Amnion ; sans hôpital du rêve, salle de torture ou boss. Quatre tablettes couvertes et porte à deux anneaux documentées. Espacement, couverture et lumière de fond reconstruits ; aucune inscription familiale copiée, résolution du puzzle, vapeur de conduite, lampe chirurgicale ou membre mécanique d’Amnion.
- **Base canonique :** EXT06 ; EXT11_REF_UNDERGROUND_HC_ROOM_2_20261028 ; EXT11_REF_UNDERGROUND_HC_ROOM_3_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`, `EXT11_REF_UNDERGROUND_HC_ROOM_2_20261028`, `EXT11_REF_UNDERGROUND_HC_ROOM_3_20261028`
- **Famille / météo :** lair · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **underground_hc_ambient_01** — La lumière glisse sur les quatre tablettes couvertes de l’antichambre Founding Families ; aucune vapeur de tuyau supposé. — *adaptation-animation-proposee*
  - **underground_hc_ambient_02** — Deux anneaux concentriques restent verrouillés sur leur porte ; seul un reflet varie, sans rotation de puzzle ou lampe d’atelier supposée. — *adaptation-animation-proposee*
  - **underground_hc_ambient_03** — Les quatre colonnes à droite des tablettes gardent leurs verrous intacts ; léger reflet proposé, sans insérer la dague ni enlever les couvertures. — *adaptation-animation-proposee*
  - **underground_hc_round_transition** — Transition proposée pour UNDERGROUND LAIR : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `film_midwich` — MIDWICH — FILM OTHERWORLD

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Ecole Midwich du film2006; sanitaires Colin et couloir Pyramid distincts.
- **Base canonique :** EXT49
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT49`
- **Famille / météo :** school · ash
- **Accessoires autorisés :** lockers, fence, chains
- **Danger d’arène :** fallingDebris · animations : lightFlicker, lockerRattle
- **Motifs de référence :**
  - **film_midwich_ambient_01** — Revêtements se décollant lors du changement — *adaptation-animation-proposee*
  - **film_midwich_ambient_02** — Poussière de cendre sur les grilles — *adaptation-animation-proposee*
  - **film_midwich_ambient_03** — Déplacement d’ombre dans la porte — *adaptation-animation-proposee*
  - **film_midwich_round_transition** — Transition proposée pour MIDWICH — FILM OTHERWORLD : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `film_hospital` — HÔPITAL DU FILM — CHAMBRE D’ALESSA

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Film Silent Hill de Christophe Gans2006 : chambre hospitalière d’Alessa, lit sous voile de tente médicale, parois carrelées abîmées et grille de sol visibles dans deux photos concordantes. Aucune preuve n’attribue le nom Brookhaven à cette pièce ; le catalogue conserve cet ancien libellé historique sans le transférer à la scène choisie. Pièce distincte du couloir des Dark Nurses ; aucune personne, apparition, attaque ou séquence de soin importée. Mouvement du voile, caméra et géométrie restent des adaptations à comparer, sans fidélité1:1 certifiée.
- **Base canonique :** EXT49 ; EXT9_FILM2006_ALESSA_ROOM_46_20261026 ; EXT9_FILM2006_ALESSA_ROOM_81_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT49`, `EXT9_FILM2006_ALESSA_ROOM_46_20261026`, `EXT9_FILM2006_ALESSA_ROOM_81_20261026`
- **Famille / météo :** hospital · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **film_hospital_ambient_01** — Voile de tente médicale qui respire — *adaptation-animation-proposee*
  - **film_hospital_ambient_02** — Faisceau réveillant un plan de nurses — *adaptation-animation-proposee*
  - **film_hospital_ambient_03** — Lampes des couloirs s’éteignant par sections — *adaptation-animation-proposee*
  - **film_hospital_round_transition** — Transition proposée pour BROOKHAVEN — DARK WARD : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `film_church` — CHURCH OF THE ORDER

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Eglise du film2006 et communauté Christabella; distinguer sa secte des versions jeux.
- **Base canonique :** EXT49
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT49`
- **Famille / météo :** church · dust
- **Accessoires autorisés :** altar
- **Danger d’arène :** chainSweep · animations : aucune
- **Motifs de référence :**
  - **film_church_ambient_01** — Cierges vacillants — *adaptation-animation-proposee*
  - **film_church_ambient_02** — Vitraux assombris par transformation — *adaptation-animation-proposee*
  - **film_church_ambient_03** — Grille du sol révélée au changement — *adaptation-animation-proposee*
  - **film_church_round_transition** — Transition proposée pour CHURCH OF THE ORDER : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `film_sanctuary` — SANCTUARY — REVELATION

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Sanctuaire du duel final de Revelation2012; séparer église2006.
- **Base canonique :** EXT50 ; EXT51
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT50`, `EXT51`
- **Famille / météo :** lair · dust
- **Accessoires autorisés :** chains, cages, altar
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **film_sanctuary_ambient_01** — Chandelles du sanctuaire — *adaptation-animation-proposee*
  - **film_sanctuary_ambient_02** — Poussière sur la table rituelle — *adaptation-animation-proposee*
  - **film_sanctuary_ambient_03** — Ombre des lames pendant duel de fond — *adaptation-animation-proposee*
  - **film_sanctuary_round_transition** — Transition proposée pour SANCTUARY — REVELATION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hope_junction` — HOPE’S JUNCTION

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Prémisse lore :** Hope’s Junction en Pennsylvanie; choisir quartier et branche canonique.
- **Base canonique :** EXT57 ; EXT60
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT57`, `EXT60`
- **Famille / météo :** street · fog
- **Accessoires autorisés :** road, shops, fence
- **Danger d’arène :** staticBurst · animations : streetLightFlicker
- **Motifs de référence :**
  - **hope_junction_ambient_01** — Brume sur chaussée — *adaptation-animation-proposee*
  - **hope_junction_ambient_02** — Lumière de fenêtre dans le lointain — *adaptation-animation-proposee*
  - **hope_junction_ambient_03** — Objets légers bougeant lors du passage Otherworld — *adaptation-animation-proposee*
  - **hope_junction_round_transition** — Transition proposée pour HOPE’S JUNCTION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `stilledalen` — STILLEDALEN WOODS

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Prémisse lore :** Stilledalen en Norvège; forêt, ferme et village ne sont pas interchangeables.
- **Base canonique :** EXT57 ; EXT60
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT57`, `EXT60`
- **Famille / météo :** village · rain
- **Accessoires autorisés :** trees, roots, lanterns
- **Danger d’arène :** fallingDebris · animations : fogDrift
- **Motifs de référence :**
  - **stilledalen_ambient_01** — Branches agitées par rafales — *adaptation-animation-proposee*
  - **stilledalen_ambient_02** — Sol humide reflétant l’Otherworld — *adaptation-animation-proposee*
  - **stilledalen_ambient_03** — Ombre aérienne du Stinger au fond — *adaptation-animation-proposee*
  - **stilledalen_round_transition** — Transition proposée pour STILLEDALEN WOODS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `ascension_otherworld` — ASCENSION — OPEN GATE

- **Œuvre / édition :** SILENT HILL: ASCENSION (2023) (`ascension`)
- **Prémisse lore :** Seuil collecté/ouvert par le Collector; OPEN GATE est un titre d’arène du projet.
- **Base canonique :** EXT58 ; EXT60
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT58`, `EXT60`
- **Famille / météo :** otherworld · flicker
- **Accessoires autorisés :** runes, chains
- **Danger d’arène :** emberFall · animations : chainSway
- **Motifs de référence :**
  - **ascension_otherworld_ambient_01** — Clés approchant les serrures — *adaptation-animation-proposee*
  - **ascension_otherworld_ambient_02** — Interstice lumineux de porte — *adaptation-animation-proposee*
  - **ascension_otherworld_ambient_03** — Mains du Collector en arrière-plan sans interférence — *adaptation-animation-proposee*
  - **ascension_otherworld_round_transition** — Transition proposée pour ASCENSION — OPEN GATE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hospital_nightmare` — ALCHEMILLA — NIGHTMARE WARD

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Alchemilla Otherworld de SH1, avec le Bloodsucker de la chambre 204.
- **Base canonique :** CL_SH1_07_NIGHTMARE_HOSPITAL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_07_NIGHTMARE_HOSPITAL`
- **Famille / météo :** hospital · flicker
- **Accessoires autorisés :** beds, chains, fans
- **Danger d’arène :** staticBurst · animations : lightFlicker, chainSway, fanSpin
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le paquet de sang détourne les tentacules. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une poche suspendue oscille au-dessus d’un récipient sans variation de collision. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Derrière une vitre, les tentacules se rapprochent d’une poche déplacée lors d’un impact de décor. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La lumière du couloir baisse et expose les reliefs rouillés pendant l’annonce de manche. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `midwich_nightmare` — MIDWICH — NIGHTMARE SCHOOL

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** École Otherworld de SH1 ; la chaufferie mène à Split Head. Vue retenue : arène de la chaufferie Otherworld, foyer ouvert central entouré de grilles, documenté dans captures sh1_boss_split_head_lizard/sh1_b01_01. Braises lumineuses contenues proposées pour le versus ; ni casiers/classes, sirène répétée, pluie de braises ou Split Head ajouté. Passage de duel devant le foyer et caméra adaptés, collisions non certifiées.
- **Base canonique :** CL_SH1_03_NIGHTMARE_SCHOOL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_03_NIGHTMARE_SCHOOL`
- **Famille / météo :** school · dust
- **Accessoires autorisés :** grates
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — L’affrontement de la chaufferie emploie le foyer central. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Les braises respirent sous la grille ; luminosité contrainte pour garder les silhouettes lisibles. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une frappe au bord fait vibrer un tuyau et lâcher une courte vapeur sans attaque automatique. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le feu réduit sa hauteur pendant le résultat puis reprend son rythme initial. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `central_nightmare` — CENTRAL SILENT HILL — OTHERWORLD

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Centre Otherworld de SH1 : galerie commerciale et toit associés à deux états du boss insecte.
- **Base canonique :** CL_SH1_09_NIGHTMARE_CENTRAL_SILENT_HILL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_09_NIGHTMARE_CENTRAL_SILENT_HILL`
- **Famille / météo :** street · dust
- **Accessoires autorisés :** road, chasm, fence
- **Danger d’arène :** emberFall · animations : streetLightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Twinfeeler quitte sa fosse après le combat. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Poussière fine au bord de la fosse avec bruit de frottement sous le plancher. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un panneau du centre commercial bascule lorsque la cible touche le bord, sans ouvrir un nouveau passage. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Ombre de grande aile sur le toit au résultat ; aucune apparition du boss à dégâts gratuits. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `sewer_resort` — SEWERS TO THE RESORT

- **Œuvre / édition :** SILENT HILL (1999) (`sh1`)
- **Prémisse lore :** Égouts qui conduisent à la zone touristique dans SH1.
- **Base canonique :** CL_SH1_10_SEWERS_TO_RESORT_AREA
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH1_10_SEWERS_TO_RESORT_AREA`
- **Famille / météo :** sewer · water
- **Accessoires autorisés :** water, grates, pipes
- **Danger d’arène :** bloodTide · animations : pipeSteam
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Hanged Scratchers occupent le plafond. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Gouttes individualisées dans le canal et reflet intermittent de la lampe. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Le fond de la grille résonne après un choc, suivi d’une silhouette retirant une patte au plafond. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Une poussée d’eau charrie de petits débris derrière la barrière pendant la pause de manche. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `south_vale` — SOUTH VALE STREETS

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** South Vale Est de SH2 original ; préciser rue exacte et limites de parcours.
- **Base canonique :** CL_SH2_01_EAST_SOUTH_SIDE
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_01_EAST_SOUTH_SIDE`
- **Famille / météo :** street · fog
- **Accessoires autorisés :** road, shops, fence
- **Danger d’arène :** staticBurst · animations : streetLightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Des traces conduisent au premier Lying Figure. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Brouillard rasant qui découvre une bordure de trottoir puis la recouvre. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une voiture garée craque après choc voisin, puis cesse ; aucune alarme constante. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Lointains pas hors champ pendant la pause, puis leur disparition sous le son de reprise. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `historical_society` — SILENT HILL HISTORICAL SOCIETY

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Bâtiment et descente de la Historical Society de SH2 original. Vue retenue : salles d’exposition du musée ; reflet de vitrage en proposition versus, sans reproduire ni animer le contenu d’un tableau officiel, escalier/puits séparés.
- **Base canonique :** CL_SH2_08_HISTORICAL_SOCIETY
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_08_HISTORICAL_SOCIETY`
- **Famille / météo :** museum · dust
- **Accessoires autorisés :** portraits, doors
- **Danger d’arène :** fallingDebris · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Une longue volée de marches descend vers le puits. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le reflet d’un tableau se déplace doucement malgré une source lumineuse presque fixe. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — L’appui près d’une plinthe libère une courte poussière vers l’escalier en profondeur. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Travelling arrière révélant une profondeur supplémentaire au résultat ; perspective sans déplacement des bornes de combat. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `prison_meat_locker` — LABYRINTH — MEAT LOCKER

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Libellé à corriger : la chambre froide du combat Eddie termine le Labyrinthe ; ne pas affirmer une salle ordinaire de Toluca Prison.
- **Base canonique :** CL_SH2_10_THE_LABYRINTH
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_10_THE_LABYRINTH`
- **Famille / météo :** prison · none
- **Accessoires autorisés :** hooks, freezer
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Les carcasses suspendues servent d’obstacles face à Eddie. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une seule carcasse oscille très lentement dans le fond pour éviter un écran visuel permanent. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une frappe proche transmet une secousse à un crochet et une courte volute de froid. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le compresseur s’arrête pendant le résultat, laissant le grincement des crochets audible. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `baldwin_mansion` — BALDWIN MANSION

- **Œuvre / édition :** SILENT HILL 2 (2001) (`sh2`)
- **Prémisse lore :** Manoir de Born from a Wish, campagne Maria de SH2 original. Vue retenue : palier devant la porte du Lounge d’Ernest, gardée fermée ; la bougie attestée au grenier ne doit pas être transportée ici. Réaction du battant = adaptation versus après impact local, sans corps.
- **Base canonique :** CL_SH2_BFAW02_BALDWIN_MANSION
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH2_BFAW02_BALDWIN_MANSION`
- **Famille / météo :** house · dust
- **Accessoires autorisés :** portraits, stairs
- **Danger d’arène :** fallingDebris · animations : floorCreak
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Ernest reste derrière sa porte pendant les échanges. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — La flamme d’une bougie penche vers la porte fermée puis se redresse. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Le battant réagit par un petit craquement après un choc voisin ; ne pas montrer un corps d’Ernest inventé. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La pièce s’assombrit par zones pendant la pause, en gardant la porte comme dernier repère éclairé. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_mall` — CENTRAL SQUARE — NIGHTMARE MALL

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Centre commercial Otherworld de SH3, comprenant l’arène souterraine de Split Worm.
- **Base canonique :** CL_SH3_03_NIGHTMARE_MALL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_03_NIGHTMARE_MALL`
- **Famille / météo :** mall · dust
- **Accessoires autorisés :** grates
- **Danger d’arène :** emberFall · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le ver utilise six ouvertures du mur. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Poussière expulsée d’une ouverture vide, accompagnée d’un frottement discret. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — La grille près du bord se déforme visuellement après une frappe lourde puis reprend lentement sa forme. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Les ouvertures s’assombrissent successivement pendant le score ; sol inchangé entre les manches. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hazel_subway` — HAZEL STREET SUBWAY

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Station Hazel Street de SH3 ; danger des voies distinct du métro SH4.
- **Base canonique :** CL_SH3_04_SUBWAY_STATION
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_04_SUBWAY_STATION`
- **Famille / météo :** subway · flicker
- **Accessoires autorisés :** rails, platform, lights
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le train et les rails forment un danger de parcours. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le souffle d’un train lointain déplace papier et cheveux sans obstacle traversant l’espace jouable. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Le panneau d’arrivée s’éclaire après impact proche, suivi d’un grondement hors champ. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Passage d’un train derrière une barrière pendant le résultat, puis retour au quai dégagé. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `underpass_sh3` — UNDERPASS

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Couloirs et locaux techniques avant le canal de SH3 ; sous-zone distincte du stage sewers.
- **Base canonique :** CL_SH3_05_UNDERPASS
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_05_UNDERPASS`
- **Famille / météo :** sewer · water
- **Accessoires autorisés :** water, pipes, grates
- **Danger d’arène :** bloodTide · animations : waterRipple
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le parcours alterne passages techniques et canaux. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Un ventilateur tourne lentement derrière une protection ; son ombre balaie un mur éloigné. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un robinet desserré libère trois jets de vapeur après choc proche, puis se referme. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La caméra suit une conduite vers une porte close pendant la pause, puis revient au plan de duel. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `hilltop_center` — HILLTOP CENTER

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Hilltop Center initial de SH3 ; bureaux, commerces et objets de travail. Store attesté dans le bureau/réception de Monica’s Dance Studio, capture sh3_07_hilltop_center_map_location.jpg ; la vue retient cette pièce normale, sans atelier ni baignoire/Otherworld. Oscillation = proposition versus.
- **Base canonique :** CL_SH3_07_HILLTOP_CENTER
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_07_HILLTOP_CENTER`
- **Famille / météo :** office · flicker
- **Accessoires autorisés :** desks, windows
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — La baignoire sert de seuil vers l’état Nightmare. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le store d’un bureau oscille légèrement devant une vitre opaque. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un meuble de l’atelier glisse de quelques centimètres après impact et reste hors aire active. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le cadrage révèle la porte de la salle de bain, sans imposer le passage Otherworld à chaque manche. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_hilltop` — HILLTOP CENTER — OTHERWORLD

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Hilltop Otherworld de SH3, avec le Glutton comme obstacle de progression.
- **Base canonique :** CL_SH3_08_NIGHTMARE_HILLTOP_CENTER
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_08_NIGHTMARE_HILLTOP_CENTER`
- **Famille / météo :** otherworld · dust
- **Accessoires autorisés :** grates, fans, blood
- **Danger d’arène :** emberFall · animations : fanSpin
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le récit du livre fait disparaître le Glutton. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une silhouette reste prisonnière derrière le treillis ; mouvement bref et non offensif. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une page de conte s’agite à un choc voisin ; la récitation complète appartient à la scène du puzzle. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La porte du fond paraît s’allonger par perspective pendant le résultat puis retrouve son volume initial. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_hospital_sh3` — BROOKHAVEN — NIGHTMARE HOSPITAL

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Brookhaven Otherworld de SH3 ; salle au miroir isolée du bassin Leonard.
- **Base canonique :** CL_SH3_12_NIGHTMARE_HOSPITAL
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_12_NIGHTMARE_HOSPITAL`
- **Famille / météo :** hospital · flicker
- **Accessoires autorisés :** beds, mirrors, chains
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le reflet se fige puis la contamination gagne la pièce. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une traînée sombre avance très lentement sur le miroir de fond, sans recouvrir les combattants. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Au passage proche, le reflet accuse un léger retard ; adaptation annoncée, pas capacité d’un personnage. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le reflet demeure un instant immobile pendant le résultat puis retrouve la pose de la scène. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `lakeside_sh3` — LAKESIDE AMUSEMENT PARK — SH3

- **Œuvre / édition :** SILENT HILL 3 (2003) (`sh3`)
- **Prémisse lore :** Parc de SH3 et carrousel de Memory of Alessa ; distinct du boss Cybil de SH1. Vue retenue : Happy Carousel SH3 AVANT sa transition et Memory of Alessa ; trois sculptures visibles sur mâts fixes interprètent une partie des douze chevaux. Va-et-vient proposé, ni gaz nocif/puzzle/Alessa ou Cybil ajouté. Plateau couvert distinct du béton humide extérieur ; physique et caméra non certifiées.
- **Base canonique :** CL_SH3_13_LAKESIDE_AMUSEMENT_PARK
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH3_13_LAKESIDE_AMUSEMENT_PARK`
- **Famille / météo :** amusement · none
- **Accessoires autorisés :** carousel
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Les chevaux émettent du gaz avant la rencontre Alessa. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Chevaux de fond montant et descendant avec un décalage fixe ; conserver leurs points d’ancrage. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une faible expiration de gaz reste derrière la rambarde, sans empoisonnement automatique. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le carrousel ralentit durant le score puis reprend ; passage d’état complet réservé à une scène validée. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `forest_world` — FOREST WORLD

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Forêt du premier passage SH4 ; séparer de Wish House brûlée au retour. Vue retenue : sentier/clairière arborée du premier passage, sans façade Wish House ni incendie du retour ; vent des herbes et branches proposé pour le versus.
- **Base canonique :** CL_SH4_03_FOREST_WORLD
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_03_FOREST_WORLD`
- **Famille / météo :** forest · fog
- **Accessoires autorisés :** trees, roots
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le parcours relie clairières, lac, tombes et orphelinat. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Branches lointaines et herbes proches bougent avec deux fréquences de vent. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un choc de clôture fait tomber une petite poussière sur une pierre gravée, sans animer les morts. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le brouillard se densifie sur le sentier menant au lac, puis se retire au signal de reprise. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `building_world` — BUILDING WORLD

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Building World de SH4, assemblage de toits et commerces.
- **Base canonique :** CL_SH4_05_BUILDING_WORLD
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_05_BUILDING_WORLD`
- **Famille / météo :** building · none
- **Accessoires autorisés :** stairs
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Des Gum Heads surgissent sur les toits. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une corde d’enseigne se tend au-dessus du vide tandis qu’un ventilateur tourne dans le fond. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Un volet de commerce reçoit le choc, se décroche d’un seul côté puis reste retenu. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le travelling révèle un escalier impossible en profondeur ; sol et bordures de l’arène inchangés. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `outside_room_302` — OUTSIDE ROOM 302

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Dernier parcours autour de 302 dans SH4, altéré après les retours.
- **Base canonique :** CL_SH4_13_OUTSIDE_ROOM_302
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_13_OUTSIDE_ROOM_302`
- **Famille / météo :** apartment · fog
- **Accessoires autorisés :** doors, windows, chains
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Des Wallmen occupent les surfaces du parcours final. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Une bosse avance sous le revêtement d’un mur puis s’arrête avant l’aire jouable. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — La grille vibre et une main s’y plaque après un impact de décor ; aucune saisie gratuite. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — La porte de 302 devient le seul point éclairé pendant le résultat puis les murs reprennent leur relief. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `wish_house` — WISH HOUSE

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Wish House existe avant puis après l’incendie ; l’état du stage doit être choisi explicitement.
- **Base canonique :** CL_SH4_03_FOREST_WORLD ; CL_SH4_09_FOREST_WORLD_2ND_TIME
- **Fidélité déclarée :** reference-bloquee
- **Références :** `CL_SH4_03_FOREST_WORLD`, `CL_SH4_09_FOREST_WORLD_2ND_TIME`
- **Famille / météo :** house · none
- **Accessoires autorisés :** trees, fence, altar
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Au retour, la maison est brûlée et le rituel de poupée ouvre une fosse. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Version brûlée proposée : petites braises dans les poutres déjà consumées, aucune propagation nouvelle. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une pièce de la poupée se soulève légèrement sous une secousse puis retombe ; assemblage complet réservé au récit. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Au score, fumée plus dense devant la façade ; conserver le même état incendié à la reprise. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `final_sacrament` — 21 SACRAMENTS — FINAL CHAMBER

- **Œuvre / édition :** SILENT HILL 4: THE ROOM (2004) (`sh4`)
- **Prémisse lore :** Chambre finale SH4 : Walter mobile, Conjurer fixé et Eileen soumis au rituel.
- **Base canonique :** CL_SH4_13_OUTSIDE_ROOM_302
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `CL_SH4_13_OUTSIDE_ROOM_302`
- **Famille / météo :** otherworld · blood
- **Accessoires autorisés :** altar, chains, runes
- **Danger d’arène :** bloodTide · animations : chainSway
- **Motifs de référence :**
  - **Motif du jeu à capturer** — Le cordon et huit lances retirent la protection de Walter. — *motif-documente-a-capturer · capture-a-relever*
  - **Boucle d’ambiance proposée** — Le dispositif central tourne à allure constante ; les armes rituelles restent dans leur état de phase. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Interaction proposée** — Une lance posée déclenche une vibration et une variation de lumière ; interaction réservée au mode scénario. — *adaptation-versus-proposee · storyboard-a-valider*
  - **Transition de manche proposée** — Le score suspend la progression mortelle d’Eileen ; reprise depuis un état validé, jamais reset inexpliqué du rituel. — *adaptation-versus-proposee · storyboard-a-valider*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `alchemilla_origins` — ALCHEMILLA HOSPITAL — ORIGINS

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Alchemilla Hospital dans Origins; garder plans2007 et miroir propre à cette œuvre.
- **Base canonique :** EXT03 ; EXT01
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT03`, `EXT01`
- **Famille / météo :** hospital · flicker
- **Accessoires autorisés :** beds, mirrors, lights
- **Danger d’arène :** staticBurst · animations : mirrorGlitch, lightFlicker
- **Motifs de référence :**
  - **alchemilla_origins_ambient_01** — Faisceau des néons sur le carrelage — *adaptation-animation-proposee*
  - **alchemilla_origins_ambient_02** — Reflet altéré dans un miroir intact — *adaptation-animation-proposee*
  - **alchemilla_origins_ambient_03** — Bord de rideau hospitalier qui tremble — *adaptation-animation-proposee*
  - **alchemilla_origins_round_transition** — Transition proposée pour ALCHEMILLA HOSPITAL — ORIGINS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `artaud_theater` — ARTAUD THEATER

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Artaud Theater, Origins : plateau normal après pose et activation des quatre ampoules du catwalk, puis lever du rideau depuis Curtain Control. Le guide distingue ensuite les configurations commandées par leviers et le passage du grand miroir, dont l’état menant au combat Caliban ; le prototype ne fusionne pas ces états. Éclairage fixe de la scène documenté, balayage cyclique et caméra du versus non mesurés.
- **Base canonique :** EXT03 ; EXT01 ; EXT_ORIGINS_THEATER_GUIDE_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT03`, `EXT01`, `EXT_ORIGINS_THEATER_GUIDE_20261026`
- **Famille / météo :** theater · none
- **Accessoires autorisés :** stage, curtains, spotlights
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **artaud_theater_ambient_01** — Balancement de poulie de coulisse — *adaptation-animation-proposee*
  - **artaud_theater_ambient_02** — Rideau respirant légèrement — *adaptation-animation-proposee*
  - **artaud_theater_ambient_03** — Glissement de lumière sur les décors peints — *adaptation-animation-proposee*
  - **artaud_theater_round_transition** — Transition proposée pour ARTAUD THEATER : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_theater` — ARTAUD THEATER — NIGHTMARE

- **Œuvre / édition :** SILENT HILL: ORIGINS (2007) (`origins`)
- **Prémisse lore :** Variation Otherworld d’Artaud; même théâtre, géométrie d’arène à reconstruire.
- **Base canonique :** EXT03 ; EXT02
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT03`, `EXT02`
- **Famille / météo :** theater · dust
- **Accessoires autorisés :** stage, chains, flesh
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **nightmare_theater_ambient_01** — Toiles de décor déformées lentement — *adaptation-animation-proposee*
  - **nightmare_theater_ambient_02** — Cordes d’Ariel en tension — *adaptation-animation-proposee*
  - **nightmare_theater_ambient_03** — Lumière de rampe révélant une seconde profondeur — *adaptation-animation-proposee*
  - **nightmare_theater_round_transition** — Transition proposée pour ARTAUD THEATER — NIGHTMARE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_hospital_hc` — ALCHEMILLA — HOMECOMING NIGHTMARE

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Cauchemar Alchemilla de Homecoming, avant le réveil d’Alex.
- **Base canonique :** EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`
- **Famille / météo :** hospital · dust
- **Accessoires autorisés :** aucun
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **nightmare_hospital_hc_ambient_01** — Décollement du revêtement pendant la transition — *adaptation-animation-proposee*
  - **nightmare_hospital_hc_ambient_02** — Bascule du témoin d’ascenseur — *adaptation-animation-proposee*
  - **nightmare_hospital_hc_ambient_03** — Rideaux et sangles d’un brancard qui remuent — *adaptation-animation-proposee*
  - **nightmare_hospital_hc_round_transition** — Transition proposée pour ALCHEMILLA — HOMECOMING NIGHTMARE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `police_station_hc` — SHEPHERD’S GLEN POLICE STATION

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Commissariat de Shepherd’s Glen.
- **Base canonique :** EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`
- **Famille / météo :** office · dust
- **Accessoires autorisés :** bars, lights
- **Danger d’arène :** fallingDebris · animations : lightFlicker
- **Motifs de référence :**
  - **police_station_hc_ambient_01** — Lumière de secours sur les cellules — *adaptation-animation-proposee*
  - **police_station_hc_ambient_02** — Fumée poussiéreuse dans le faisceau — *adaptation-animation-proposee*
  - **police_station_hc_ambient_03** — Réaction des grilles à un impact voisin — *adaptation-animation-proposee*
  - **police_station_hc_round_transition** — Transition proposée pour SHEPHERD’S GLEN POLICE STATION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `town_hall_hc` — SHEPHERD’S GLEN TOWN HALL

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Town Hall de Shepherd’s Glen; plans publics et passage de retour distincts. Vue retenue : premier passage normal, salle centrale publique avec podium et livre d’histoire derrière ; sous-sol et cérémonie de retour hors cadre. Lueur du pupitre proposée pour le versus, sans action du Founders Key.
- **Base canonique :** EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`
- **Famille / météo :** hall · dust
- **Accessoires autorisés :** portraits
- **Danger d’arène :** fallingDebris · animations : lightFlicker
- **Motifs de référence :**
  - **town_hall_hc_ambient_01** — Drapeau légèrement agité — *adaptation-animation-proposee*
  - **town_hall_hc_ambient_02** — Lueur changeante sur pupitre — *adaptation-animation-proposee*
  - **town_hall_hc_ambient_03** — Poussière du plafond entre les manches — *adaptation-animation-proposee*
  - **town_hall_hc_round_transition** — Transition proposée pour SHEPHERD’S GLEN TOWN HALL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `prison_hc` — OVERLOOK PENITENTIARY

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Nom à corriger : Overlook Penitentiary; même établissement nommé dans le guide Homecoming.
- **Base canonique :** EXT04 ; EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT04`, `EXT06`
- **Famille / météo :** prison · dust
- **Accessoires autorisés :** bars, lights
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **prison_hc_ambient_01** — Porte de cellule vibrant — *adaptation-animation-proposee*
  - **prison_hc_ambient_02** — Ombres de barreaux déplacées par la lampe — *adaptation-animation-proposee*
  - **prison_hc_ambient_03** — Passage de lumière de sécurité sur coursive — *adaptation-animation-proposee*
  - **prison_hc_round_transition** — Transition proposée pour SHEPHERD’S GLEN PENITENTIARY : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `shepherd_house_hc` — SHEPHERD HOUSE — ATTIC

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Grenier Shepherd House; état Otherworld dépend de l’étape. Vue retenue : grenier normal avant la conversation avec Lillian et la transformation ; séparer l’état Otherworld du chapitre08. Charpente/poussière sont une interprétation graphique de la proposition versus, pas une géométrie mesurée ; pas de masques/médailles/horloge de l’état altéré importés.
- **Base canonique :** EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`
- **Famille / météo :** house · dust
- **Accessoires autorisés :** aucun
- **Danger d’arène :** fallingDebris · animations : floorCreak
- **Motifs de référence :**
  - **shepherd_house_hc_ambient_01** — Oscillation d’objet suspendu — *adaptation-animation-proposee*
  - **shepherd_house_hc_ambient_02** — Poussière sous la charpente — *adaptation-animation-proposee*
  - **shepherd_house_hc_ambient_03** — Horloge brièvement dérèglée entre les manches — *adaptation-animation-proposee*
  - **shepherd_house_hc_round_transition** — Transition proposée pour SHEPHERD HOUSE — ATTIC : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `scarlet_chamber` — SCARLET’S CHAMBER

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Arène de Scarlet en Hell Descent; Scarlet’s Chamber est un nom éditorial.
- **Base canonique :** EXT05 ; EXT06
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT05`, `EXT06`
- **Famille / météo :** lair · dust
- **Accessoires autorisés :** dolls, flesh
- **Danger d’arène :** bloodTide · animations : aucune
- **Motifs de référence :**
  - **scarlet_chamber_ambient_01** — Vibrations de passerelle métallique — *adaptation-animation-proposee*
  - **scarlet_chamber_ambient_02** — Mouvement des câbles au plafond — *adaptation-animation-proposee*
  - **scarlet_chamber_ambient_03** — Poussière de porcelaine après impact — *adaptation-animation-proposee*
  - **scarlet_chamber_round_transition** — Transition proposée pour SCARLET’S CHAMBER : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `curtis_shop` — CURTIS — COMPTOIR DE L’ATELIER

- **Œuvre / édition :** SILENT HILL: HOMECOMING (2008) (`homecoming`)
- **Prémisse lore :** Comptoir de l’atelier où Curtis est assis lors de l’échange initial du pistolet ; distinct du combat ultérieur en Room321 Underground. La vue native montre le comptoir de bois, pendule ronde, livres et fenêtre à planches. Aucun corps ou siège occupé n’est rejoué, aucune ampoule ou machine rotative inventée. Chaîne générique antérieure non attestée dans ce cadrage retirée du rendu. Lumière et perspective frontale versus, non géométrie mesurée.
- **Base canonique :** EXT06 ; EXT11_REF_CURTIS_SHOP_ROOM_2_20261028 ; EXT11_REF_CURTIS_SHOP_ROOM_3_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT06`, `EXT11_REF_CURTIS_SHOP_ROOM_2_20261028`, `EXT11_REF_CURTIS_SHOP_ROOM_3_20261028`
- **Famille / météo :** workshop · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** chainSweep · animations : aucune
- **Motifs de référence :**
  - **curtis_shop_ambient_01** — Chaîne d’atelier qui oscille — *adaptation-animation-proposee*
  - **curtis_shop_ambient_02** — La pendule ronde et les livres restent sur le comptoir de l’échange initial ; une variation de reflet remplace l’ampoule non attestée. — *adaptation-animation-proposee*
  - **curtis_shop_ambient_03** — La lumière traverse les interstices des planches devant la fenêtre ; aucun outil en rotation ni scie circulaire transférée du combat Underground. — *adaptation-animation-proposee*
  - **curtis_shop_round_transition** — Transition proposée pour CURTIS’S JUNKYARD WORKSHOP : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `frozen_streets` — SILENT HILL — FROZEN STREETS

- **Œuvre / édition :** SILENT HILL: SHATTERED MEMORIES (2009) (`shattered`)
- **Prémisse lore :** Rues dans les séquences gelées SM; cadre d’itinéraire à choisir.
- **Base canonique :** EXT09
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT09`
- **Famille / météo :** ice · snow
- **Accessoires autorisés :** road, cars, ice
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **frozen_streets_ambient_01** — Neige soufflée près du bitume — *adaptation-animation-proposee*
  - **frozen_streets_ambient_02** — Vitrines gagnées par le givre — *adaptation-animation-proposee*
  - **frozen_streets_ambient_03** — Soulèvement lent d’une nappe glacée en transition — *adaptation-animation-proposee*
  - **frozen_streets_round_transition** — Transition proposée pour SILENT HILL — FROZEN STREETS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_hospital_sm` — ALCHEMILLA GELÉ — CHAMBRE ER

- **Œuvre / édition :** SILENT HILL: SHATTERED MEMORIES (2009) (`shattered`)
- **Prémisse lore :** Alchemilla, Nightmare4 : chambre accessible après l’entrée aux urgences, pendant le puzzle radio et avant la libération de la porte glacée. La capture 5a montre la pièce sombre, des lits et la porte obstruée ; la localisation et le puzzle sont établis par le guide. Le versus ne rejoue ni père/enfant gelés, radio, chanson ou bris de glace. La lumière froide adaptée n’atteste pas une séparation vitrée ou un rideau animé.
- **Base canonique :** EXT09 ; EXT10_SM_HOSPITAL_GUIDE_20261026 ; EXT10_SM_HOSPITAL_ROOM_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT09`, `EXT10_SM_HOSPITAL_GUIDE_20261026`, `EXT10_SM_HOSPITAL_ROOM_20261026`
- **Famille / météo :** ice · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **nightmare_hospital_sm_ambient_01** — Givre sur séparations vitrées — *adaptation-animation-proposee*
  - **nightmare_hospital_sm_ambient_02** — Rideau collé puis libéré de la glace — *adaptation-animation-proposee*
  - **nightmare_hospital_sm_ambient_03** — Lumière froide qui pulse dans l’épaisseur du mur — *adaptation-animation-proposee*
  - **nightmare_hospital_sm_round_transition** — Transition proposée pour FROZEN HOSPITAL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `nightmare_mall_sm` — TOLUCA MALL GELÉ — HALL GUMBALL

- **Œuvre / édition :** SILENT HILL: SHATTERED MEMORIES (2009) (`shattered`)
- **Prémisse lore :** Toluca Mall, Nightmare5 : hall du Gumball Shake Up après Garage Access South, avant la résolution du puzzle. La capture 6a montre le hall glacé et l’enseigne de la machine ; le guide distingue cette pièce de la statue de Tookie rencontrée auparavant. Le versus retient le bâti et un panneau abstrait givré ; ni machine interactive, personnages gelés, couleurs du puzzle, Tookie ou portes libérées ne sont produits. Aucun rythme de givre n’est mesuré.
- **Base canonique :** EXT09 ; EXT10_SM_MALL_GUIDE_20261026 ; EXT10_SM_MALL_GUMBALL_HALL_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT09`, `EXT10_SM_MALL_GUIDE_20261026`, `EXT10_SM_MALL_GUMBALL_HALL_20261026`
- **Famille / météo :** ice · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **nightmare_mall_sm_ambient_01** — Enseigne masquée peu à peu par le givre — *adaptation-animation-proposee*
  - **nightmare_mall_sm_ambient_02** — Poussière de glace sous une grille — *adaptation-animation-proposee*
  - **nightmare_mall_sm_ambient_03** — Réflexion brisée sur les vitrines — *adaptation-animation-proposee*
  - **nightmare_mall_sm_round_transition** — Transition proposée pour FROZEN MALL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `lighthouse_sm` — LIGHTHOUSE / THERAPY REVELATION

- **Œuvre / édition :** SILENT HILL: SHATTERED MEMORIES (2009) (`shattered`)
- **Prémisse lore :** Phare et révélation thérapeutique sont des lieux/plans différents; l’intitulé actuel les fusionne.
- **Base canonique :** EXT09
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT09`
- **Famille / météo :** lighthouse · none
- **Accessoires autorisés :** water, beam, ice
- **Danger d’arène :** frostWave · animations : aucune
- **Motifs de référence :**
  - **lighthouse_sm_ambient_01** — Rotation du faisceau du phare — *adaptation-animation-proposee*
  - **lighthouse_sm_ambient_02** — Mouvement de l’eau au pied de la structure — *adaptation-animation-proposee*
  - **lighthouse_sm_ambient_03** — Clôture par raccord de lumière vers la scène thérapeutique — *adaptation-animation-proposee*
  - **lighthouse_sm_round_transition** — Transition proposée pour LIGHTHOUSE / THERAPY REVELATION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `devils_pit` — DEVIL’S PIT

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Devil’s Pit; préciser attraction, mine ou arrivée ferroviaire. Vue retenue : cavité intérieure des roues hydrauliques/lift, depuis la coursive sèche ; poutres et conduites de l’illustration du puzzle Water Wheels. Gouttes de traverse proposées pour le versus ; attraction extérieure, cave inondée adjacente et trajet de train hors cadre, aucun puzzle ou pompe automatique.
- **Base canonique :** EXT11
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT11`
- **Famille / météo :** mine · dust
- **Accessoires autorisés :** cave
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **devils_pit_ambient_01** — Gouttes tombant des traverses — *adaptation-animation-proposee*
  - **devils_pit_ambient_02** — Vibration des panneaux miniers — *adaptation-animation-proposee*
  - **devils_pit_ambient_03** — Lumière mobile dans le tunnel — *adaptation-animation-proposee*
  - **devils_pit_round_transition** — Transition proposée pour DEVIL’S PIT : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `centennial_building` — CENTENNIAL BUILDING

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Centennial Building; séparer archives et salles administratives.
- **Base canonique :** EXT11
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT11`
- **Famille / météo :** office · dust
- **Accessoires autorisés :** desks, elevator, windows
- **Danger d’arène :** fallingDebris · animations : elevatorBlink, lightFlicker
- **Motifs de référence :**
  - **centennial_building_ambient_01** — Pages soulevées sur table — *adaptation-animation-proposee*
  - **centennial_building_ambient_02** — Poussière dans le puits de lumière — *adaptation-animation-proposee*
  - **centennial_building_ambient_03** — Roue de chariot d’archives qui tremble — *adaptation-animation-proposee*
  - **centennial_building_round_transition** — Transition proposée pour CENTENNIAL BUILDING : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `st_marias` — ST. MARIA’S MONASTERY

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** St Maria’s Monastery; cadrage de chapelle, théâtre ou orphelinat à fixer.
- **Base canonique :** EXT11
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT11`
- **Famille / météo :** church · dust
- **Accessoires autorisés :** altar, bells, windows
- **Danger d’arène :** fallingDebris · animations : bellSwing
- **Motifs de référence :**
  - **st_marias_ambient_01** — Tentures agitées près des fenêtres — *adaptation-animation-proposee*
  - **st_marias_ambient_02** — Bougies du sanctuaire vacillantes — *adaptation-animation-proposee*
  - **st_marias_ambient_03** — Ombre d’orgue glissant sur le mur — *adaptation-animation-proposee*
  - **st_marias_round_transition** — Transition proposée pour ST. MARIA’S MONASTERY : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `downpour_streets` — SILENT HILL — DOWNPOUR STREETS

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Rues Downpour; la pluie constitue une condition de scène, pas un pouvoir de tous les monstres.
- **Base canonique :** EXT11
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT11`
- **Famille / météo :** street · rain
- **Accessoires autorisés :** road, shops, cars
- **Danger d’arène :** fallingDebris · animations : streetLightFlicker, fogDrift
- **Motifs de référence :**
  - **downpour_streets_ambient_01** — Pluie oblique variable — *adaptation-animation-proposee*
  - **downpour_streets_ambient_02** — Ondes de flaques — *adaptation-animation-proposee*
  - **downpour_streets_ambient_03** — Gouttière débordant près d’une façade — *adaptation-animation-proposee*
  - **downpour_streets_round_transition** — Transition proposée pour SILENT HILL — DOWNPOUR STREETS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `otherworld_void` — DOWNPOUR — VOID CHASE

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Poursuites du Void; une arène versus fixe serait une adaptation.
- **Base canonique :** EXT10
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT10`
- **Famille / météo :** void · runes
- **Accessoires autorisés :** stairs, doors, void
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **otherworld_void_ambient_01** — Front lumineux progressif en arrière-plan — *adaptation-animation-proposee*
  - **otherworld_void_ambient_02** — Objets de décor absorbés dans le front — *adaptation-animation-proposee*
  - **otherworld_void_ambient_03** — Fuite des ombres vers la sortie — *adaptation-animation-proposee*
  - **otherworld_void_round_transition** — Transition proposée pour DOWNPOUR — VOID CHASE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `anne_fight` — FULL CIRCLE — ANNE’S CONFRONTATION

- **Œuvre / édition :** SILENT HILL: DOWNPOUR (2012) (`downpour`)
- **Prémisse lore :** Confrontation finale Anne/Murphy; point de vue et issue dépendent du scénario.
- **Base canonique :** EXT11
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT11`
- **Famille / météo :** prison · none
- **Accessoires autorisés :** bars, lights, water
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **anne_fight_ambient_01** — Clôtures carcérales vibrantes — *adaptation-animation-proposee*
  - **anne_fight_ambient_02** — Raccord lumineux au changement de point de vue — *adaptation-animation-proposee*
  - **anne_fight_ambient_03** — Immobilité de l’arrière-plan au choix final — *adaptation-animation-proposee*
  - **anne_fight_round_transition** — Transition proposée pour FULL CIRCLE — ANNE’S CONFRONTATION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_city` — THE ARCADE — CITY / JACK’S INN

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage1-1 City; Jack’s Inn documenté comme départ par entrée de parcours.
- **Base canonique :** EXT13 ; EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT13`, `EXT15`
- **Famille / météo :** street · fog
- **Accessoires autorisés :** road, shops, signs
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **arcade_city_ambient_01** — Brouillard traversant façade — *adaptation-animation-proposee*
  - **arcade_city_ambient_02** — Enseigne partiellement intermittente — *adaptation-animation-proposee*
  - **arcade_city_ambient_03** — Papiers le long du trottoir — *adaptation-animation-proposee*
  - **arcade_city_round_transition** — Transition proposée pour THE ARCADE — CITY / JACK’S INN : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_hospital` — THE ARCADE — BROOKHAVEN HOSPITAL

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage1-2 Brookhaven; premier combat Pyramid Head.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** hospital · flicker
- **Accessoires autorisés :** beds, elevator, lights
- **Danger d’arène :** staticBurst · animations : elevatorBlink, lightFlicker
- **Motifs de référence :**
  - **arcade_hospital_ambient_01** — Rideau de soin balançant — *adaptation-animation-proposee*
  - **arcade_hospital_ambient_02** — Lumière sur chariot — *adaptation-animation-proposee*
  - **arcade_hospital_ambient_03** — Ombre d’une porte qui s’ouvre au loin — *adaptation-animation-proposee*
  - **arcade_hospital_round_transition** — Transition proposée pour THE ARCADE — BROOKHAVEN HOSPITAL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_hospital_roof` — THE ARCADE — HOSPITAL ROOF

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage1-3 Brookhaven2/toit de Tuberculosis.
- **Base canonique :** EXT15 ; EXT18
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`, `EXT18`
- **Famille / météo :** roof · rain
- **Accessoires autorisés :** fence, vents, water
- **Danger d’arène :** fallingDebris · animations : rainSheets, lightning, ventSteam, lightFlicker
- **Motifs de référence :**
  - **arcade_hospital_roof_ambient_01** — Vent le long des grilles de toiture — *adaptation-animation-proposee*
  - **arcade_hospital_roof_ambient_02** — Nuages très bas — *adaptation-animation-proposee*
  - **arcade_hospital_roof_ambient_03** — Réaction de la structure aux pas du boss — *adaptation-animation-proposee*
  - **arcade_hospital_roof_round_transition** — Transition proposée pour THE ARCADE — HOSPITAL ROOF : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_historical` — THE ARCADE — HISTORICAL SOCIETY

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage2-1 Historical Society.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** museum · dust
- **Accessoires autorisés :** portraits, stairs, doors
- **Danger d’arène :** fallingDebris · animations : lightFlicker
- **Motifs de référence :**
  - **arcade_historical_ambient_01** — Poussière sous plafond — *adaptation-animation-proposee*
  - **arcade_historical_ambient_02** — Lueur oblique sur cadres — *adaptation-animation-proposee*
  - **arcade_historical_ambient_03** — Oscillation d’une chaîne d’escalier — *adaptation-animation-proposee*
  - **arcade_historical_round_transition** — Transition proposée pour THE ARCADE — HISTORICAL SOCIETY : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_prison` — THE ARCADE — TOLUCA PRISON

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage2-2 Toluca Prison; rencontre Split Worm.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** prison · flicker
- **Accessoires autorisés :** bars, chains, lights
- **Danger d’arène :** staticBurst · animations : chainSway, lightFlicker
- **Motifs de référence :**
  - **arcade_prison_ambient_01** — Poussière aux sorties de tunnel — *adaptation-animation-proposee*
  - **arcade_prison_ambient_02** — Vibration des barreaux — *adaptation-animation-proposee*
  - **arcade_prison_ambient_03** — Graviers après l’émergence du ver — *adaptation-animation-proposee*
  - **arcade_prison_round_transition** — Transition proposée pour THE ARCADE — TOLUCA PRISON : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_graveyard` — THE ARCADE — UNDERGROUND GRAVEYARD

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Le guide nomme Stage2-3 Under Ground Basement; terme Underground Graveyard du projet à corroborer.
- **Base canonique :** EXT15
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT15`
- **Famille / météo :** graveyard · none
- **Accessoires autorisés :** graves, roots, altar
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **arcade_graveyard_ambient_01** — Lumière entre structures souterraines — *adaptation-animation-proposee*
  - **arcade_graveyard_ambient_02** — Poussière dans les failles — *adaptation-animation-proposee*
  - **arcade_graveyard_ambient_03** — Appuis de Mama se reflétant sur une paroi — *adaptation-animation-proposee*
  - **arcade_graveyard_round_transition** — Transition proposée pour THE ARCADE — UNDERGROUND GRAVEYARD : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_toluca_lake` — THE ARCADE — TOLUCA LAKE

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Stage3-1 Toluca Lake.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** lake · water
- **Accessoires autorisés :** water, boat, fog
- **Danger d’arène :** bloodTide · animations : boatRock
- **Motifs de référence :**
  - **arcade_toluca_lake_ambient_01** — Houle sourde — *adaptation-animation-proposee*
  - **arcade_toluca_lake_ambient_02** — Brume dérivant au-dessus de l’eau — *adaptation-animation-proposee*
  - **arcade_toluca_lake_ambient_03** — Vibration de cordage — *adaptation-animation-proposee*
  - **arcade_toluca_lake_round_transition** — Transition proposée pour THE ARCADE — TOLUCA LAKE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_1918` — THE ARCADE — 1918

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** 1918/1993 est une séquence associée au Phantom, pas deux lieux géographiques.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** otherworld · water
- **Accessoires autorisés :** chains
- **Danger d’arène :** emberFall · animations : chainSway
- **Motifs de référence :**
  - **arcade_1918_ambient_01** — Objet du bateau apparaissant ancien — *adaptation-animation-proposee*
  - **arcade_1918_ambient_02** — Houle dans la pénombre — *adaptation-animation-proposee*
  - **arcade_1918_ambient_03** — Raccord visuel vers1993 entre manches — *adaptation-animation-proposee*
  - **arcade_1918_round_transition** — Transition proposée pour THE ARCADE — 1918 : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_1993` — THE ARCADE — 1993 PHANTOM FRONT

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Même séquence finale1918/1993; Phantom Front est une désignation éditoriale.
- **Base canonique :** EXT15
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT15`
- **Famille / météo :** otherworld · water
- **Accessoires autorisés :** lights
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **arcade_1993_ambient_01** — Retour des repères contemporains — *adaptation-animation-proposee*
  - **arcade_1993_ambient_02** — Dissolution d’un objet du bateau — *adaptation-animation-proposee*
  - **arcade_1993_ambient_03** — Front du lac changeant avec le boss — *adaptation-animation-proposee*
  - **arcade_1993_round_transition** — Transition proposée pour THE ARCADE — 1993 PHANTOM FRONT : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_mall` — THE ARCADE — SHOPPING MALL

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Centre commercial non retrouvé dans le parcours consulté; ne pas qualifier d’arène canonique Arcade.
- **Base canonique :** EXT15
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT15`
- **Famille / météo :** mall · none
- **Accessoires autorisés :** shops, escalator, lights
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **arcade_mall_ambient_01** — Aucune animation à lancer avant vérification d’un niveau Arcade correspondant — *bloque-reference*
  - **arcade_mall_round_transition** — Transition proposée pour THE ARCADE — SHOPPING MALL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `arcade_amusement` — THE ARCADE — AMUSEMENT PARK

- **Œuvre / édition :** SILENT HILL: THE ARCADE (2007) (`arcade`)
- **Prémisse lore :** Parc d’attractions non retrouvé dans le parcours consulté; Robbie ne prouve pas un parc jouable.
- **Base canonique :** EXT15
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT15`
- **Famille / météo :** amusement · none
- **Accessoires autorisés :** carousel, wheel, booths
- **Danger d’arène :** fallingDebris · animations : aucune
- **Motifs de référence :**
  - **arcade_amusement_ambient_01** — Aucune animation à lancer avant vérification d’un niveau Arcade correspondant — *bloque-reference*
  - **arcade_amusement_round_transition** — Transition proposée pour THE ARCADE — AMUSEMENT PARK : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `villa_rooftop` — KETTENSTADT VILLA — ROOFTOP

- **Œuvre / édition :** SILENT HILL: THE SHORT MESSAGE (2024) (`shortmessage`)
- **Prémisse lore :** Toit de la Villa; préserver rôle narratif, finisher mortel environnemental non automatique.
- **Base canonique :** EXT30
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT30`
- **Famille / météo :** rooftop · fog
- **Accessoires autorisés :** fence, antenna, flowers
- **Danger d’arène :** petalBloom · animations : windGust
- **Motifs de référence :**
  - **villa_rooftop_ambient_01** — Vent sur clôture — *adaptation-animation-proposee*
  - **villa_rooftop_ambient_02** — Variation de brume au-delà du toit — *adaptation-animation-proposee*
  - **villa_rooftop_ambient_03** — Lueur du téléphone sur les mains en clôture — *adaptation-animation-proposee*
  - **villa_rooftop_round_transition** — Transition proposée pour KETTENSTADT VILLA — ROOFTOP : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `villa_stairwell` — KETTENSTADT VILLA — STAIRWELL

- **Œuvre / édition :** SILENT HILL: THE SHORT MESSAGE (2024) (`shortmessage`)
- **Prémisse lore :** Escaliers de la Villa, sous-lieu du complexe.
- **Base canonique :** EXT30
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT30`
- **Famille / météo :** building · flicker
- **Accessoires autorisés :** stairs, graffiti, lights
- **Danger d’arène :** staticBurst · animations : lightFlicker
- **Motifs de référence :**
  - **villa_stairwell_ambient_01** — Ombre avançant sur palier — *adaptation-animation-proposee*
  - **villa_stairwell_ambient_02** — Grésillement du néon — *adaptation-animation-proposee*
  - **villa_stairwell_ambient_03** — Poussière soufflée par porte de secours — *adaptation-animation-proposee*
  - **villa_stairwell_round_transition** — Transition proposée pour KETTENSTADT VILLA — STAIRWELL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `dark_shrine_corridors` — DARK SHRINE — AUTEL INARI

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Petite salle de l’autel à statue manquante dans Dark Shrine Corridors, avant de restituer Inari ; hors arène Sakuko. La statue trouvée dans une autre pièce reste absente du socle retenu. Bougies, meuble et lueur rouge sont les seuls motifs ; aucun kusarigama, suzu de Sakuko, chaîne de décor, Halo ou symbole inventé.
- **Base canonique :** EXT34 ; EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_1_20261028 ; EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_2_20261028 ; EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_3_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT34`, `EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_1_20261028`, `EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_2_20261028`, `EXT11_REF_DARK_SHRINE_CORRIDORS_ROOM_3_20261028`
- **Famille / météo :** shrine · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** petalBloom · animations : aucune
- **Motifs de référence :**
  - **dark_shrine_corridors_ambient_01** — Un vacillement local reste sur les cierges du petit autel à statue manquante, sans chaîne du boss dans le décor. — *adaptation-animation-proposee*
  - **dark_shrine_corridors_ambient_02** — Une lueur rouge reste dans le fond du meuble de l’autel ; aucun Halo ou portail inventé dans le couloir. — *adaptation-animation-proposee*
  - **dark_shrine_corridors_ambient_03** — De faibles reflets suivent les boiseries et étagères de la même salle ; aucune cloche-suzu de Sakuko empruntée. — *adaptation-animation-proposee*
  - **dark_shrine_corridors_round_transition** — Transition proposée pour DARK SHRINE — CORRIDORS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `shimizu_residence` — SHIMIZU RESIDENCE I — SALLE À MANGER

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Shimizu ResidenceI : salle à manger du Yellowed Calendar, avec tatamis, table basse ronde, coussins et vaisselle. Cette pièce se distingue du corridor retenu pour hinako_home, sans créer une autre adresse. Elle n’est pas fusionnée avec la rencontre des parents, une variante ultérieure ou une scène de repas animée ; caméra et géométrie ne sont pas mesurées.
- **Base canonique :** EXT34 ; EXT41 ; EXT10_SHF_SHIMIZU_RESIDENCE_GUIDE_20261026 ; EXT10_SHF_RESIDENCE_DINING_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT34`, `EXT41`, `EXT10_SHF_SHIMIZU_RESIDENCE_GUIDE_20261026`, `EXT10_SHF_RESIDENCE_DINING_20261026`
- **Famille / météo :** house · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** petalBloom · animations : aucune
- **Motifs de référence :**
  - **shimizu_residence_ambient_01** — Vaisselle frémissante sur meuble — *adaptation-animation-proposee*
  - **shimizu_residence_ambient_02** — Panneaux coulissants sous les impacts — *adaptation-animation-proposee*
  - **shimizu_residence_ambient_03** — Silence des accessoires après la confrontation — *adaptation-animation-proposee*
  - **shimizu_residence_round_transition** — Transition proposée pour SHIMIZU RESIDENCE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `dark_shrine_main` — DARK SHRINE — PREMIÈRE CHAMBRE RITUELLE

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Seuil de la première chambre rituelle illustré par l’indice Crimson Water 1 ; hors jardin de cloches, seconde chambre et combat Rinko. L’image de l’indice appartient au parcours New Game+ ; l’état de porte, les deux braseros et les panneaux sont retenus sans importer le jardin ou ses cloches. Flamme et mouvement authored ; aucun corps, poupée activée, purification, inscription ou finisher de récit.
- **Base canonique :** EXT34 ; EXT11_REF_DARK_SHRINE_MAIN_ROOM_1_20261028 ; EXT11_REF_DARK_SHRINE_MAIN_ROOM_2_20261028 ; EXT11_REF_DARK_SHRINE_MAIN_ROOM_3_20261028
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT34`, `EXT11_REF_DARK_SHRINE_MAIN_ROOM_1_20261028`, `EXT11_REF_DARK_SHRINE_MAIN_ROOM_2_20261028`, `EXT11_REF_DARK_SHRINE_MAIN_ROOM_3_20261028`
- **Famille / météo :** shrine · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **dark_shrine_main_ambient_01** — Les deux braseros bordent le premier seuil rituel ; aucune poupée ou créature de fond ajoutée. — *adaptation-animation-proposee*
  - **dark_shrine_main_ambient_02** — Les panneaux du seuil restent en place et leur reflet varie faiblement ; aucun tissu rituel non confirmé. — *adaptation-animation-proposee*
  - **dark_shrine_main_ambient_03** — La lueur des braseros accompagne la porte fermée, sans geste de purification, déclenchement de boss ou ouverture automatique. — *adaptation-animation-proposee*
  - **dark_shrine_main_round_transition** — Transition proposée pour DARK SHRINE — MAIN HALL : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `corrupted_ebisugaoka` — EBISUGAOKA — PARVIS SHIMIZU

- **Œuvre / édition :** SILENT HILL f (2025) (`shf`)
- **Prémisse lore :** Ebisugaoka partie5 : parvis immédiatement devant Shimizu Residence, avec flore rouge, brouillard, façade, pots et bicyclette visibles. Corrupted Procession reste un libellé éditorial ; la capture ne prouve ni procession, ni croissance instantanée des fleurs, vent, terrain ralentissant ou état uniforme de toute Ebisugaoka. Le mouvement d’ambiance du versus reste une adaptation locale.
- **Base canonique :** EXT32 ; EXT_SHF_EBISUGAOKA5_20261025 ; EXT10_SHF_RESIDENCE_FORECOURT_20261026
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT32`, `EXT_SHF_EBISUGAOKA5_20261025`, `EXT10_SHF_RESIDENCE_FORECOURT_20261026`
- **Famille / météo :** festival · none
- **Accessoires autorisés :** aucun
- **Danger d’arène :** petalBloom · animations : aucune
- **Motifs de référence :**
  - **corrupted_ebisugaoka_ambient_01** — Croissance de vrilles en bordure — *adaptation-animation-proposee*
  - **corrupted_ebisugaoka_ambient_02** — Chute lente de pétales — *adaptation-animation-proposee*
  - **corrupted_ebisugaoka_ambient_03** — Brume passant du fond au premier plan — *adaptation-animation-proposee*
  - **corrupted_ebisugaoka_round_transition** — Transition proposée pour EBISUGAOKA — CORRUPTED PROCESSION : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `return_streets` — RETURN TO SILENT HILL — STREETS

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Rues Return to Silent Hill2026; pas copie automatique2006.
- **Base canonique :** EXT55
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT55`
- **Famille / météo :** street · ash
- **Accessoires autorisés :** road, shops, chasm
- **Danger d’arène :** staticBurst · animations : streetLightFlicker
- **Motifs de référence :**
  - **return_streets_ambient_01** — Cendres dans la profondeur de rue — *adaptation-animation-proposee*
  - **return_streets_ambient_02** — Feu de signalisation masqué par brume — *adaptation-animation-proposee*
  - **return_streets_ambient_03** — Transition de matière sur façade — *adaptation-animation-proposee*
  - **return_streets_round_transition** — Transition proposée pour RETURN TO SILENT HILL — STREETS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `return_brookhaven` — RETURN TO SILENT HILL — BROOKHAVEN

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Hôpital film2026; plans de nurses et lit plafond à relever séparément.
- **Base canonique :** EXT55 ; EXT56
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT55`, `EXT56`
- **Famille / météo :** hospital · flicker
- **Accessoires autorisés :** beds, elevator, lights
- **Danger d’arène :** staticBurst · animations : elevatorBlink, lightFlicker
- **Motifs de référence :**
  - **return_brookhaven_ambient_01** — Lit au plafond comme apparition ciblée — *adaptation-animation-proposee*
  - **return_brookhaven_ambient_02** — Ombre de nurse derrière une cloison — *adaptation-animation-proposee*
  - **return_brookhaven_ambient_03** — Faisceau vibrant sur carrelage — *adaptation-animation-proposee*
  - **return_brookhaven_round_transition** — Transition proposée pour RETURN TO SILENT HILL — BROOKHAVEN : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `return_lakeview` — RETURN TO SILENT HILL — BURNING LAKEVIEW

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Lakeview du film2026 : variation brûlée et scène à vérifier précisément.
- **Base canonique :** EXT55
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT55`
- **Famille / météo :** hotel · none
- **Accessoires autorisés :** portraits, fireplace, windows
- **Danger d’arène :** emberFall · animations : aucune
- **Motifs de référence :**
  - **return_lakeview_ambient_01** — Lueur de feu derrière rideau — *adaptation-animation-proposee*
  - **return_lakeview_ambient_02** — Poussière de plâtre — *adaptation-animation-proposee*
  - **return_lakeview_ambient_03** — Reflet d’eau/feu à réserver au plan attesté — *adaptation-animation-proposee*
  - **return_lakeview_round_transition** — Transition proposée pour RETURN TO SILENT HILL — BURNING LAKEVIEW : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `return_portrait_room` — RETURN TO SILENT HILL — PORTRAIT ROOM

- **Œuvre / édition :** SILENT HILL — FILM UNIVERSE (2006) (`film`)
- **Prémisse lore :** Portrait Room est nom éditorial; localisation et rapport à l’entité lit à confirmer.
- **Base canonique :** EXT55 ; EXT56
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT55`, `EXT56`
- **Famille / météo :** gallery · none
- **Accessoires autorisés :** portraits, elevator, lights
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **return_portrait_room_ambient_01** — Aucun effet de portrait animé avant plan de référence — *bloque-reference*
  - **return_portrait_room_ambient_02** — Eclairage respirant proposé en attente du relevé — *bloque-reference*
  - **return_portrait_room_round_transition** — Transition proposée pour RETURN TO SILENT HILL — PORTRAIT ROOM : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `st_amelia_marina` — ST. AMELIA MARINA

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** St Amelia attestée; appellation Marina et quai précis à relever dans la version commerciale.
- **Base canonique :** EXT61
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT61`
- **Famille / météo :** marina · none
- **Accessoires autorisés :** water, boats, crtv
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **st_amelia_marina_ambient_01** — Houle près des amarres — *adaptation-animation-proposee*
  - **st_amelia_marina_ambient_02** — Voile de brouillard salin — *adaptation-animation-proposee*
  - **st_amelia_marina_ambient_03** — Cordages frottant contre un mât — *adaptation-animation-proposee*
  - **st_amelia_marina_round_transition** — Transition proposée pour ST. AMELIA MARINA : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `st_amelia_residential` — ST. AMELIA — RESIDENTIAL DISTRICT

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Quartiers résidentiels de St Amelia; rue et enseignes à repérer.
- **Base canonique :** EXT61 ; EXT63
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT61`, `EXT63`
- **Famille / météo :** village · fog
- **Accessoires autorisés :** road, houses
- **Danger d’arène :** fallingDebris · animations : streetLightFlicker, fogDrift
- **Motifs de référence :**
  - **st_amelia_residential_ambient_01** — Rideau derrière vitre — *adaptation-animation-proposee*
  - **st_amelia_residential_ambient_02** — Banderoles dans la brume — *adaptation-animation-proposee*
  - **st_amelia_residential_ambient_03** — Faible grésillement d’un téléphone public — *adaptation-animation-proposee*
  - **st_amelia_residential_round_transition** — Transition proposée pour ST. AMELIA — RESIDENTIAL DISTRICT : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `townfall_medical` — ST. AMELIA MEDICAL CENTRE

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Medical Centre : nom du catalogue à corroborer dans carte/plan primaire.
- **Base canonique :** EXT61
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT61`
- **Famille / météo :** hospital · none
- **Accessoires autorisés :** beds, monitors, crtv
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **townfall_medical_ambient_01** — Tube fluorescent instable — *adaptation-animation-proposee*
  - **townfall_medical_ambient_02** — Volet de guichet vibrant — *adaptation-animation-proposee*
  - **townfall_medical_ambient_03** — CRTV de décor brièvement parasitée — *adaptation-animation-proposee*
  - **townfall_medical_round_transition** — Transition proposée pour ST. AMELIA MEDICAL CENTRE : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `ceg_tower` — CEG TOWER

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Tour de bureaux documentée par critique; nom CEG et étage exact à relever.
- **Base canonique :** EXT63
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT63`
- **Famille / météo :** office · none
- **Accessoires autorisés :** desks, elevator, crtv
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **ceg_tower_ambient_01** — Néon sur bureaux vides — *adaptation-animation-proposee*
  - **ceg_tower_ambient_02** — Ventilo d’ordinateur ancien qui ralentit — *adaptation-animation-proposee*
  - **ceg_tower_ambient_03** — Ascenseur derrière porte vitrée — *adaptation-animation-proposee*
  - **ceg_tower_round_transition** — Transition proposée pour CEG TOWER : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `clara_woods` — CLARA WOODS

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Clara Woods : nom non corroboré par sources lues.
- **Base canonique :** EXT61
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT61`
- **Famille / météo :** forest · none
- **Accessoires autorisés :** trees, roots, crtv
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **clara_woods_ambient_01** — Balancement de branches proposé en attente de localisation — *bloque-reference*
  - **clara_woods_ambient_02** — Brume forestière sans motif ajouté — *bloque-reference*
  - **clara_woods_round_transition** — Transition proposée pour CLARA WOODS : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `clara_woods_different` — CLARA WOODS — DIFFERENT

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Variante Different dépend du lieu Clara Woods non confirmé ici.
- **Base canonique :** EXT61
- **Fidélité déclarée :** reference-bloquee
- **Références :** `EXT61`
- **Famille / météo :** otherworld · none
- **Accessoires autorisés :** trees, metal, crtv
- **Danger d’arène :** staticBurst · animations : aucune
- **Motifs de référence :**
  - **clara_woods_different_ambient_01** — Variations de lumière à définir après comparaison des deux scènes — *bloque-reference*
  - **clara_woods_different_round_transition** — Transition proposée pour CLARA WOODS — DIFFERENT : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *bloque-reference*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

### `alternate_facility` — ST. AMELIA — ALTERNATE FACILITY

- **Œuvre / édition :** SILENT HILL: TOWNFALL (2026) (`townfall`)
- **Prémisse lore :** Centre de commande/auxiliary room documenté; nom Alternate Facility est éditorial à rapprocher du plan exact.
- **Base canonique :** EXT64
- **Fidélité déclarée :** lieu-reference / mise-en-scene-versus
- **Références :** `EXT64`
- **Famille / météo :** otherworld · flicker
- **Accessoires autorisés :** pipes, monitors, metal
- **Danger d’arène :** staticBurst · animations : pipeSteam, hospitalMonitor
- **Motifs de référence :**
  - **alternate_facility_ambient_01** — Voyants de conduites s’allumant séquentiellement — *adaptation-animation-proposee*
  - **alternate_facility_ambient_02** — Vibration d’ascenseur — *adaptation-animation-proposee*
  - **alternate_facility_ambient_03** — Souffle d’aération après ouverture de ligne — *adaptation-animation-proposee*
  - **alternate_facility_round_transition** — Transition proposée pour ST. AMELIA — ALTERNATE FACILITY : suspendre puis reprendre les boucles ci-dessus sans déplacer les collisions du plateau; préserver le lieu et sa phase. — *adaptation-animation-proposee*
- **État actuel :** aucun bitmap d’arène accepté ; rendu procédural de secours.
- **Blocage à lever :** relever une vue de la pièce exacte (géométrie, éclairage, matières), puis produire le fond et le déclarer en candidat séparé.

## 3. Limites explicites

- Ce dossier ne produit aucune image, aucun timing mesuré et aucune certification 1:1.
- Les propositions de mise en scène restent des adaptations de versus, distinctes des observations documentées.
- Les captures marquées « à relever » sont des blocages réels : les contourner reviendrait à inventer le lore.
- La revue visuelle en jeu reste obligatoire après chaque import (cadrage, armes, ancrage, arrière-plan).
