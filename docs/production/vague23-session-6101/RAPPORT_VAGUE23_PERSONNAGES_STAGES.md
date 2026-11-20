# Vague 23 — personnages et stages manquants

Date : **19 novembre 2026**. Référence publiée avant cette passe : `cffb58bbcb78c2bdb1381965ea0efb3e5fb54994`, branche `art/missing-fullbody-20261117`, [PR nº 6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

## Résultat livré

La passe ajoute **six vues latérales dédiées et quatre décors**, soit **14 PNG actifs natifs** pour **14 739 246 octets**. Elle remplace six anciennes vues non revues et illustre quatre fiches de stage déjà présentes. Elle ne crée aucun profil moteur, portrait, mouvement, pouvoir, collision ou clip animé.

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| Profils moteur | 230 | 230 |
| Portraits de sélection disponibles | 204 | 204 |
| Vues latérales candidates, atelier compris | 151 | **157** |
| Anciennes vues à revoir | 42 | **36** |
| Images de combat absentes | 37 | 37 |
| Portraits absents | 26 | 26 |
| Clips animés existants | 6 | 6 |
| Stages actifs avec bitmap | 65 / 123 | **69 / 123** |
| Stages sans bitmap, hors références bloquées | 43 | **39** |
| Références de stage bloquées | 15 | 15 |
| Notices de la bible du corpus | 66 | 66 |
| Fidélités 1:1 certifiées | 0 | 0 |

Les comptes sont calculés par l’[audit final](final-audit.json). Les 71 compositions stockées incluent deux variantes historiques qui ne correspondent pas aux scènes actives : **136 PNG sont référencés dans l’ensemble stocké, dont 134 dans les scènes actives**. Ces nombres ne doivent pas être confondus avec les 69 arènes sélectionnables illustrées.

## Six vues dédiées

| Profil existant | Œuvre | Taille native | Usage conservé |
| --- | --- | ---: | --- |
| `bom_wood_sapling_139` | Book of Memories | 1199 × 1312 | Combat, idle statique |
| `bom_tremer_133` | Book of Memories | 1774 × 887 | Combat, idle statique |
| `bom_raw_shock_148` | Book of Memories | 1199 × 1312 | Combat, idle statique |
| `bom_gray_child_147` | Book of Memories | 1536 × 1024 | Combat, idle statique |
| `sh4_toadstool_061` | Silent Hill 4 | 1031 × 1525 | Référence environnementale d’atelier, hors duel |
| `sh4_whitestool_062` | Silent Hill 4 | 1040 × 1512 | Référence environnementale d’atelier, hors duel |

Les six images représentent **5 305 819 octets**. Le portrait historique reste distinct de la nouvelle vue. Chaque sujet est entier, avec ses extrémités dans le canevas ; le côté opposé est une présentation miroir du même PNG, sans seconde reconstruction indépendante.

Les références de petite taille guident l’identité et la silhouette, sans établir tous les détails de dos, textures, articulations ou ramifications. La pose latérale est une reconstruction. Les faibles résidus d’alpha sont conservés dans les fichiers natifs ; Gray Child possède un alpha maximal de 254. Les composites et captures de jeu ne montrent pas de grand fond opaque, mais cela ne vaut pas certification d’un détourage parfait à toute échelle.

Une édition de détourage de Whitestool reste archivée et inactive : elle modifiait des pointes sans amélioration démontrée. Les prompts exacts, variantes, sources et contrôles sont dans la [livraison personnages](characters/README.md), le [contrat gelé](characters/delivery.json), le [reçu d’import](fighter-integration-bom-sh4.json) et le [journal de provenance](../sprite-wave23-imports-2026-11-19.json).

## Quatre scènes de Book of Memories

Chaque décor utilise un fond opaque et un premier plan transparent indépendant, tous deux en **1672 × 941 pixels natifs**. Les huit plans représentent **9 433 427 octets**.

| Stage | Scène retenue | Référence conservée |
| --- | --- | --- |
| `book_fire` | Salle industrielle Fire, meuble d’atelier et grille en retrait | Capture du lancement US du 16 octobre 2012, image 01 |
| `book_earth` | Galerie rocheuse à soutènements de bois et récipients | Capture E3 du 6 juin 2012, image 37, **préversion** |
| `book_blood` | Plateforme de l’arène Blood Guardian, boss exclu | Capture E3 du 6 juin 2012, image 31, **préversion** |
| `book_water` | Bassin carrelé de l’arène Water Guardian, boss exclu | Capture E3 du 6 juin 2012, image 50, **préversion** |

Les fichiers de référence inspectés, leurs adresses et leurs empreintes sont conservés dans l’[inventaire des sources](stages/reference-inventory.json). Les trois vues E3 ne sont pas présentées comme des plans certifiés de l’édition commerciale. Caméra, largeur et zones cachées sont adaptées au combat 2D ; Blood garde une perspective plongeante plus marquée que les autres décors.

Les premiers plans occupent les marges et laissent le couloir de combat dégagé. Leur alpha maximal mesuré dans la bande centrale des pieds vaut 0 ou 1 sur 255, selon le fichier. Les surfaces rouges, l’eau et les reflets restent peints dans des images fixes. La parallaxe du moteur ne constitue pas une nouvelle animation de l’œuvre d’origine.

Les essais Fire avec rebord et bandes jaunes, puis Blood avec disque central extrapolé, sont archivés comme variantes inactives. Les sorties retenues proviennent de corrections par l’outil de génération, sans retouche externe, agrandissement ou recadrage des PNG. Voir la [livraison des stages](stages/README.md), le [contrat gelé](stages/delivery.json) et le [reçu d’intégration](stage-integration-bom.json).

## Vérifications exécutées

### Tests et préservation

- **1 292 tests Node réussis**, suivis du build avec vérification complète.
- **115 tests Python réussis**, dont les contrôles d’import et de classeur de production.
- **296 contrôles d’audit réussis** : périmètre des imports, intégrité des PNG, conservation des rôles et admission dans les caches.
- **58 fichiers protégés** et **536 PNG historiques** restent identiques à la référence publiée. Le classeur historique des movesets et animations, la bible centrale et les 230 définitions de profils sont préservés.

Les journaux et codes retour observés figurent dans [qa/gates.json](qa/gates.json). Les plafonds existants de 64 Mio par cache sont inchangés. Les 14 365 paires de combattants illustrées admissibles et les 2 415 paires de scènes actives passent le contrôle d’admission mémoire, sans régression. Il s’agit de vérifications de descripteurs et budgets, et non de milliers de duels rendus.

### Rendu natif du moteur

**Dix processus réussis, 512 exécutions d’assertions et 38 captures conservées** couvrent :

- huit cas de duel, soit les quatre vues BoM dans les deux emplacements ;
- quatre cas de stage avec les deux plans réellement dessinés et les déplacements ordinaires ;
- quatre aperçus d’atelier, soit les deux références SH4 dans les deux orientations ;
- les six portraits historiques de sélection décodés et capturés.

Le véritable `FightEngine` effectue son introduction, ses mises à jour et son rendu Canvas. Les entrées passent par les callbacks `InputState` enregistrés ; aucune position, santé, orientation ou phase d’acteur n’est injectée. Les contrôles vérifient notamment le choix du PNG, le cadrage entier, la translation autorisée, le retour au repos, les plans de décor et leur parallaxe.

Les références SH4 utilisent le renderer de l’atelier à son placement habituel. Elles ne reçoivent pas de duel. Les captures, rapports individuels, processus et copies exactes des deux harnesses sont liés dans le [rapport natif agrégé](qa-native/report.json). Une [revue visuelle complémentaire](qa-native/parent-visual-review.json) couvre Tremer, Whitestool, Blood et Water.

La [revue des personnages](characters/NATIVE_QA.md) inspecte les 34 captures correspondantes ; la [revue des décors](stages/NATIVE_GAMEPLAY_REVIEW.md) inspecte les quatre captures de stage. Aucun correctif de PNG ou d’ancre n’a été demandé à l’issue de ces revues dans le périmètre testé.

Ce contrôle natif n’exerce pas Chromium, le DOM/CSS, la livraison HTTP, le service worker ou un vrai clavier de navigateur. Le lancement local ordinaire de Chromium a échoué avant de charger l’application, avec une erreur système de socket ; la [preuve d’environnement](qa-preparation/environment-probe.json) conserve cet échec. Les suites GitHub Actions associées au commit publié sont à consulter dans la PR. Les succès d’une révision antérieure ne valident pas cette passe.

Les nouveaux idles ne font pas l’objet d’une nouvelle matrice d’attaque, garde, contact ou fatalité. Aucun timing source, animation originale, fidélité 1:1 ou rendu UHD n’est déduit de ces contrôles.

## Classeur et corpus

Le [classeur Corpus / Stages](../SILENT_HILL_CORPUS_BIBLE.xlsx) suit les quatre nouveaux stages. Le workflow conserve les 66 notices et 123 fiches de stage, ne change que les cellules D/G/J de ces quatre lignes et les deux résultats de synthèse calculés, et adapte leur hauteur pour rendre les notes lisibles. Les preuves de recalcul, de réouverture et de préservation du format sont dans [workbook/workbook-verification.json](workbook/workbook-verification.json) et [workbook/package-preservation.json](workbook/package-preservation.json).

Une perte d’attribut de remplissage des règles conditionnelles importées a été corrigée par réapplication des quatre règles originales via l’API du classeur. Le comparateur indépendant, inchangé, ne constate ensuite aucune différence hors périmètre autorisé. Le [diagnostic et le correctif](workbook/conditional-format-resolution.md) sont conservés ; aucun XML du classeur n’a été retouché.

Le [complément documentaire](corpus/README.md) ajoute quatre apports de preuve au dossier des œuvres existantes. Il conserve les identifiants et les 66 notices : aucun nouveau jeu, personnage ou lieu n’est déduit de Transmission ou d’un intitulé ambigu.

## Travail restant et limites conservées

Il reste **54 stages sans bitmap**, dont 39 ouverts et 15 bloqués, ainsi que **36 anciennes vues**, **26 portraits absents** et **37 images de combat absentes**. Les listes exactes sont dans l’[audit final](final-audit.json).

Remnant reste différé faute de référence résolvant suffisamment sa cage ; Bloodsucker n’a pas reçu de nouvelle référence entière inspectée dans ce lot. Les pistes Daisy Villa, Cedar Grove, Green Lion, commissariat et escalier de la Villa conservent leurs réserves de sous-lieu ou de phase. Les blocages historiques de génération restent conservés ; une variante d’arme ne peut pas être remplacée par une autre pour combler une ligne.

Le premier précontrôle de l’import personnages a refusé une référence complémentaire historique en HTTP avant toute mutation. Le contrat conserve maintenant cette URL exacte, valide ses octets locaux et exige toujours au moins une référence HTTPS inspectée par profil. Le journal d’échec initial reste archivé ; il n’est pas compté parmi les imports ou les tests réussis.

Cette passe fournit de nouveaux candidats intégrés et vérifiables. Le travail de fidélité, de mouvement, de timing et de complétude du catalogue reste ouvert.
