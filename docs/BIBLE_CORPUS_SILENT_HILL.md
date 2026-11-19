# Bible du corpus — Silent Hill

**Audit documentaire au 19 novembre 2026 — version `2026-11-19-final-66`.**

Cette bible indexe **66 œuvres, éditions, programmes et supports** dans le périmètre convenu. Elle complète les **16 groupes de sources du moteur** du projet. Elle ne signifie ni 66 jeux supplémentaires, ni 66 nouveaux bestiaires à produire. Le [registre structuré](production/franchise-corpus.json), le [classeur Corpus / Stages](production/SILENT_HILL_CORPUS_BIBLE.xlsx) et le [dossier de recherche](production/vague21/corpus-audit/research.json) donnent les alias, références, liens avec le moteur et prochaines études.

La colonne **« Couverture avant ajout »** décrit la base immuable `ca25d04196b73d6229cdef4dd572eb76846ca7ad`, avant cette passe. Après intégration, toutes les lignes sont indexées dans la bible ; leur présence documentaire ne les rend pas pour autant jouables.

## Ce que la passe corrige

Le projet couvrait déjà Silent Hill f, Townfall, Ascension et les trois films. Townfall était déjà traité après sa sortie dans le guide des sources ; KONAMI confirme sa publication le **24 septembre 2026**. Les films étaient regroupés dans le pack `film`, ce qui explique pourquoi une recherche limitée à `data/sources.json` pouvait masquer leur détail. [Lancement officiel de Townfall](https://www.konami.com/games/eu/en/topics/19323/).

Les manques les plus nets concernaient **Play Novel**, les jeux mobiles, **The Experience**, les récits imprimés ou numériques, les programmes promotionnels et certaines notices d’édition. Play Novel est attesté dans le catalogue Nintendo du **21 mars 2001**. **Mobile DX** est l’adaptation mobile japonaise de 2006 ; **Orphan / Mobile** désigne une autre œuvre, publiée en Europe en 2007. Ces noms ne doivent pas être fusionnés. [Nintendo](https://www.nintendo.co.jp/n08/before/01_0306.html) · [Annonce contemporaine Mobile DX](https://www.itmedia.co.jp/mobile/articles/0607/05/news092.html) · [Notice Orphan](https://www.silenthillmemories.net/sh_orphan/info_en.htm).

**SILENT HILL Transmission est un programme officiel d’actualités de la franchise.** Il sert à documenter les annonces et les présentations des œuvres. Ce n’est pas un jeu ni une source autonome de combattants. KONAMI décrit explicitement cette fonction dans sa présentation de la quatrième émission. La recherche du mot « transmission » dans le classeur historique rencontrait des mentions narratives de Joseph Schreiber ; elles ne prouvaient pas la présence du programme. [Définition et quatrième émission par KONAMI](https://www.konami.com/games/corporate/ja/news/topics/20260213s/). La [seconde émission de 2024](https://www.konami.com/games/eu/fr/topics/17897/) possède également son communiqué officiel ; les quatre années de présentation documentées sont reliées à la fiche du programme.

L’audit a aussi retrouvé un ajout promotionnel publié : le **mini-jeu SILENT HILL f × Urban Myth Dissolution Center**, disponible depuis le **9 septembre 2026**, avec sa propre page officielle. Il est indexé comme collaboration distincte, sans lui attribuer automatiquement une autorité sur la continuité du jeu principal. [Communiqué KONAMI](https://prtimes.jp/main/html/rd/p/000001493.000050711.html) · [Confirmation Shueisha Games](https://shueisha-games.com/news/20260909_umdc_silenthill-f/) · [Site officiel du mini-jeu](https://shf-umdc-specialminigame.shueisha-games.com/).

### Bilan de couverture avant cette passe

| État relevé | Nombre | Sens |
|---|---:|---|
| Présent | 15 | Œuvres déjà raccordées aux packs runtime |
| Présent dans un pack agrégé | 3 | Les trois films, réunis sous `film` |
| Partiel | 4 | SH2 remake, Born from a Wish, livre et DVD Lost Memories |
| Non indexé | 40 | Entrées documentaires absentes du périmètre inspecté |
| Mention seule | 1 | Silent Hills, signalé comme campagne non sortie |
| Édition non indexée | 2 | Extension BoM et coffret PS2 2006 |
| Programme non indexé | 1 | SILENT HILL Transmission |
| **Total** | **66** | État historique, distinct de l’indexation après ajout |

## Répertoire des 66 entrées

Les liens ci-dessous servent à identifier les œuvres et leurs éditions. La qualité de chaque preuve — primaire, bibliographique, contemporaine ou spécialisée — figure dans le JSON. Une notice spécialisée ne devient pas une source primaire du seul fait qu’elle décrit un produit officiel.

### Jeux et série interactive déjà présents

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `sh1_original_1999` | SILENT HILL | Jeu | 1999 | Présent | [Source 1](https://www.konami.com/games/eu/en/products/silenthill/) |
| `sh2_original_2001` | SILENT HILL 2 | Jeu | 2001 | Présent | [Source 1](https://www.silenthillmemories.net/sh2/versions_en.htm) |
| `sh3_original_2003` | SILENT HILL 3 | Jeu | 2003 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `sh4_the_room_2004` | SILENT HILL 4: THE ROOM | Jeu | 2004 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `origins_2007` | SILENT HILL: ORIGINS | Jeu | 2007 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `homecoming_2008` | SILENT HILL: HOMECOMING | Jeu | 2008 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `shattered_memories_2009` | SILENT HILL: SHATTERED MEMORIES | Jeu | 2009 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `downpour_2012` | SILENT HILL: DOWNPOUR | Jeu | 2012 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `the_arcade_2007` | SILENT HILL: THE ARCADE | Jeu | 2007 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `book_of_memories_2012` | SILENT HILL: BOOK OF MEMORIES | Jeu | 2012 | Présent | [Source 1](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `pt_2014` | P.T. | Teaser jouable | 2014 ; retiré ensuite | Présent | [Source 1](https://www.gamespot.com/articles/silent-hills-cancelled-konami-confirms/1100-6426919/) · [Source 2](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `the_short_message_2024` | SILENT HILL: THE SHORT MESSAGE | Jeu | 2024-01-31 | Présent | [Source 1](https://blog.playstation.com/2024/01/31/silent-hill-the-short-message-now-available-free-on-ps5-new-silent-hill-2-remake-trailer-revealed/) |
| `silent_hill_f_2025` | SILENT HILL f | Jeu | 2025-09-25 | Présent | [Source 1](https://www.konami.com/games/eu/en/products/silenthill_f/) · [Source 2](https://www.konami.com/games/eu/en/topics/18839/) |
| `ascension_2023` | SILENT HILL: ASCENSION | Série interactive | 2023 | Présent | [Source 1](https://www.konami.com/games/eu/fr/topics/16705/) · [Source 2](https://www.silenthillmemories.net/lore/releases_en.htm) |
| `townfall_2026` | SILENT HILL: TOWNFALL | Jeu | 2026-09-24 | Présent | [Source 1](https://www.konami.com/games/eu/en/topics/19323/) |

### Jeux mobiles et Play Novel à documenter

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `play_novel_2001` | Play Novel: Silent Hill | Jeu | 2001-03-21 | Non indexé | [Source 1](https://www.nintendo.co.jp/n08/before/01_0306.html) |
| `mobile_dx_2006` | Silent Hill: Mobile DX | Jeu mobile | 2006-07-05 | Non indexé | [Source 1](https://www.itmedia.co.jp/mobile/articles/0607/05/news092.html) · [Source 2](https://www.silenthillmemories.net/sh_dx/info_en.htm) |
| `orphan_mobile_2007` | Silent Hill: Orphan | Jeu mobile | 2007 | Non indexé | [Source 1](https://www.silenthillmemories.net/sh_orphan/info_en.htm) |
| `mobile_2_2008` | Silent Hill: Mobile 2 | Jeu mobile | 2008 | Non indexé | [Source 1](https://www.silenthillmemories.net/sh_mobile2/info_en.htm) |
| `mobile_3_2010` | Silent Hill: Mobile 3 | Jeu mobile | 2010 | Non indexé | [Source 1](https://www.silenthillmemories.net/sh_mobile3/info_en.htm) |
| `the_escape_mobile_2007` | SILENT HILL: The Escape | Jeu mobile | 2007-12-19 | Non indexé | [Source 1](https://game.watch.impress.co.jp/docs/20071219/shte.htm) · [Source 2](https://www.4gamer.net/games/080/G008092/20081224057/) |

### Éditions, scénarios, compilations et projets

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `sh2_remake_2024` | SILENT HILL 2 — remake | Remake | 2024-10-08 | Partiel | [Source 1](https://www.konami.com/games/us/en/topics/2681/) |
| `sh2_born_from_a_wish` | SILENT HILL 2: Born from a Wish | Scénario additionnel | 2001 | Partiel | [Source 1](https://www.silenthillmemories.net/sh2/versions_en.htm) |
| `sh_hd_collection_2012` | Silent Hill HD Collection | Compilation remasterisée | 2012 | Non indexé | [Source 1](https://www.konami.com/games/eu/en/products/shhd/) |
| `sh1_remake_announced` | SILENT HILL — remake du premier jeu | Remake annoncé | Annonce 2025 ; en développement | Non indexé | [Source 1](https://www.konami.com/games/ca/en/topics/2890/) · [Source 2](https://img.konami.com/ir/en/ir-data/statements/2026/en0129_cf84s6.pdf) |
| `silent_hills_cancelled` | Silent Hills | Projet annulé | Annonce 2014 ; annulé en 2015 | Mention seule | [Source 1](https://www.gamespot.com/articles/silent-hills-cancelled-konami-confirms/1100-6426919/) |
| `bom_expansion_2013` | Silent Hill: Book of Memories — Expansion Pack | Extension | 2013-03-19 | Édition non indexée | [Source 1](https://blog.playstation.com/2013/03/19/playstation-store-update-283/) · [Source 2](https://blog.playstation.com/archive/2013/03/20/heads-up-playstation-store-update-20th-march-2013) |
| `collection_ps2_2006` | The Silent Hill Collection | Coffret de jeux | 2006-04-21 | Édition non indexée | [Source 1](https://crimson-ceremony.net/lostreleases/item.php?id=shgame_shbox-eur-collection) · [Source 2](https://www.silenthillmemories.net/collections/sh_collection_en.htm) |

### Films et novélisations

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `film_silent_hill_2006` | Silent Hill | Film | 2006 | Présent dans un pack agrégé | [Source 1](https://www.sonypictures.com/movies/silenthill) |
| `film_revelation_2012` | Silent Hill: Revelation | Film | 2012 | Présent dans un pack agrégé | [Source 1](https://www.universalpicturesathome.com/movies/silent-hill-revelation) |
| `film_return_2026` | Return to Silent Hill | Film | 2026-01-23 | Présent dans un pack agrégé | [Source 1](https://returntosilenthillmovie.com/welcome-back/) · [Source 2](https://s202.q4cdn.com/484194886/files/doc_news/Return-to-Silent-Hill-from-Cineverse-Premieres-on-Hulu-2026.pdf) |
| `novel_sh1_2006` | Silent Hill: The Novel | Novélisation | 2006 | Non indexé | [Source 1](https://www.kinokuniya.co.jp/f/dsg-01-9784861558153) · [Source 2](https://www.silenthillmemories.net/publications/books_en.htm) |
| `novel_sh2_2006` | Silent Hill 2: The Novel | Novélisation | 2006 | Non indexé | [Source 1](https://www.hanmoto.com/bd/isbn/9784861558320) · [Source 2](https://www.silenthillmemories.net/publications/books_en.htm) |
| `novel_sh3_2007` | Silent Hill 3: The Novel | Novélisation | 2007 | Non indexé | [Source 1](https://store-tsutaya.tsite.jp/search/item/sell_book/40664107/9784861558429) · [Source 2](https://www.silenthillmemories.net/publications/books_en.htm) |
| `novel_film_silent_hill_2006` | Silent Hill — novélisation du film | Novélisation | 2006-06-24 | Non indexé | [Source 1](https://www.kadokawa.co.jp/product/200604000197/) |
| `novel_film_revelation_2013` | Silent Hill: Revelation — novélisation | Novélisation | 2013 | Non indexé | [Source 1](https://www.abebooks.com/9784812495148/Michael-Bassett-Kiyomi-Abe-4812495148/plp) · [Source 2](https://www.silenthillmemories.net/publications/books_en.htm) |
| `novel_silent_hill_f_2025` | Silent Hill f — roman | Novélisation | 2025-10-30 | Non indexé | [Source 1](https://www.kadokawa.co.jp/product/322507000131/) |
| `novel_return_2026` | Return to Silent Hill: The Official Movie Novelization | Novélisation | 2026-01-27 | Non indexé | [Source 1](https://titanbooks.com/72540-return-to-silent-hill-the-official-movie-novelization/) |

### Comics et mangas

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `comic_dying_inside_2004` | Silent Hill: Dying Inside | Comic sous licence | 2004 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_among_the_damned_2004` | Silent Hill: Among the Damned | Comic sous licence | 2004 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_paint_it_black_2005` | Silent Hill: Paint It Black | Comic sous licence | 2005 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_grinning_man_2005` | Silent Hill: The Grinning Man | Comic sous licence | 2005 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_dead_alive_2005` | Silent Hill: Dead/Alive | Comic sous licence | 2005 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_sinners_reward_2008` | Silent Hill: Sinner’s Reward | Comic sous licence | 2008 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_past_life_2010` | Silent Hill: Past Life | Comic sous licence | 2010 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_annes_story_2014` | Silent Hill Downpour: Anne’s Story | Comic sous licence | 2014 | Non indexé | [Source 1](https://comics.lib.msu.edu/rri/irri/idwm.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_hunger_2006` | Silent Hill: Hunger | Comic numérique | 2006 | Non indexé | [Source 1](https://www.silenthillmemories.net/she/info_en.htm) · [Source 2](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `manga_cage_of_cradle_2006` | Silent Hill: Cage of Cradle | Manga mobile | 2006 | Non indexé | [Source 1](https://www.silenthillmemories.net/publications/comics_en.htm) · [Source 2](https://www.itmedia.co.jp/mobile/articles/0607/05/news092.html) |
| `manga_double_under_dusk_2007` | Silent Hill: Double under Dusk | Manga mobile | 2007 | Non indexé | [Source 1](https://www.silenthillmemories.net/publications/comics_en.htm) |
| `comic_white_hunter_2008` | White Hunter | Comic bonus | 2008 | Non indexé | [Source 1](https://www.silenthillmemories.net/publications/sh_white_hunter_en.htm) |
| `comic_dock_house_2026` | SILENT HILL: Townfall – The Dock House | Comic sous licence | 2026-09-16 | Non indexé | [Source 1](https://www.konami.com/games/eu/en/topics/19315/) · [Source 2](https://atomicbooks.com/products/2000-ad-prog-2500) |
| `comic_comx_unreleased_1999` | Silent Hill — projet de roman graphique Com.X | Comic non publié | Annonce 1999 ; non publié | Non indexé | [Source 1](https://www.silenthillmemories.net/publications/comics_en.htm) |

### Supports multimédias et documentaires

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `the_experience_2006` | The Silent Hill Experience | Collection multimédia | 2006 | Non indexé | [Source 1](https://www.silenthillmemories.net/she/info_en.htm) · [Source 2](https://www.gamespot.com/articles/silent-hill-gets-experience/1100-6143103/) |
| `dvd_art_silent_hill_2001` | Art of Silent Hill | DVD multimédia | 2001-11-22 | Non indexé | [Source 1](https://silenthillheaven.com/aosh/) · [Source 2](https://www.crimson-ceremony.net/lostreleases/shostv/video.php) |
| `dvd_lost_memories_2003` | Lost Memories: The Art & Music of Silent Hill | DVD multimédia | 2003-07-03 | Partiel | [Source 1](https://www.silenthillmemories.net/dvd_lm/info_en.htm) · [Source 2](https://www.crimson-ceremony.net/lostreleases/shostv/video.php) |
| `book_lost_memories_2003` | Lost Memories: Silent Hill Chronicle | Guide officiel | 2003 | Partiel | [Source 1](https://www.silenthillmemories.net/lost_memories/info_en.htm) · [Source 2](https://www.hanmoto.com/bd/isbn/9784757181458) |
| `making_of_sh2_2001` | The Making of Silent Hill 2 | Documentaire de création | 2001 | Non indexé | [Source 1](https://www.silenthillmemories.net/sh2/mosh2_info_en.htm) · [Source 2](https://crimson-ceremony.net/lostreleases/item.php?id=shgame_sh2-ps2-eur1) |

### Communications officielles et collaborations

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `silent_hill_transmission` | SILENT HILL Transmission | Programme promotionnel | 2022 | Programme non indexé | [Source 1](https://www.konami.com/games/eu/fr/topics/16705/) · [Source 2](https://www.konami.com/games/eu/en/topics/18565/) |
| `konami_press_start` | KONAMI PRESS START | Programme éditeur | 2025 | Non indexé | [Source 1](https://www.konami.com/games/ca/en/topics/2890/) · [Source 2](https://www.konami.com/games/eu/en/topics/19272/) |
| `crossover_dead_by_daylight_2020` | Dead by Daylight — chapitre Silent Hill | Crossover sous licence | 2020-06-16 | Non indexé | [Source 1](https://deadbydaylight.com/game/chapters/silent-hill/) · [Source 2](https://www.youtube.com/watch?v=nsJ5igHp1hc) |
| `crossover_bomberman` | Super Bomberman — personnages Silent Hill | Crossover sous licence | 2017 | Non indexé | [Source 1](https://www.konami.com/games/eu/en/topics/14217/) · [Source 2](https://www.konami.com/games/bomberman/online/us/en/character/) |
| `crossover_dark_deception_2021` | Dark Deception: Monsters & Mortals — Silent Hill DLC | Crossover sous licence | 2021-03-23 | Non indexé | [Source 1](https://store.steampowered.com/news/posts/?appgroupname=Dark+Deception%3A+Monsters+%26+Mortals&appids=1266690&enddate=1703286695&feed=steam_community_announcements) · [Source 2](https://steamdb.info/app/1508810/subs/) |
| `crossover_urban_myth_2026` | SILENT HILL f × Urban Myth Dissolution Center — Special Mini-Game | Mini-jeu promotionnel | 2026-09-09 | Non indexé | [Source 1](https://prtimes.jp/main/html/rd/p/000001493.000050711.html) · [Source 2](https://shueisha-games.com/news/20260909_umdc_silenthill-f/) |

### Machines sous licence

| ID stable | Œuvre ou support | Nature | Publication / statut | Couverture avant ajout | Preuve |
|---|---|---|---|---|---|
| `machine_pachislot_2015` | SILENT HILL — pachislot TAKASAGO | Machine sous licence | 2015-10-05 | Non indexé | [Source 1](https://www.konami.com/amusement/psm/archive/psm_archive_title.html?kinds=ps&title=silenthill) · [Source 2](https://www.konami.com/amusement/psm/portal/magihallo/blog_mh/2015/mhs_blog_151027.html) |
| `machine_silent_hill_escape` | Silent Hill Escape — machine à sous | Machine sous licence | Annonce 2019 ; objectif T1 2020 | Non indexé | [Source 1](https://www.konamigaming.com/games/all-games/details/silent-hill-escape) · [Source 2](https://www.fantiniresearch.com/images/pdf/KNM_Pre-NIGA2020_MediaBrief.pdf) |
| `machine_silent_hill_return` | Silent Hill Return — machine à sous | Machine sous licence | Annonce 2019 ; objectif T1 2020 | Non indexé | [Source 1](https://www.konamigaming.com/games/all-games/details/silent-hill-return) · [Source 2](https://www.fantiniresearch.com/images/pdf/KNM_Pre-NIGA2020_MediaBrief.pdf) |

## Distinctions à conserver dans la bible

### Édition, scénario et œuvre

**Born from a Wish** appartient aux éditions enrichies de **SH2 original**. Les intitulés Restless Dreams, Inner Fears, Saigo no Uta et Director’s Cut renvoient à des éditions et régions ; ils ne justifient pas de multiplier automatiquement les œuvres ou leurs personnages. L’audit ne déduit aucun DLC du remake 2024 depuis cette histoire éditoriale. La page spécialisée des versions contient également une date erronée de HD Collection : pour cette compilation, la fiche KONAMI de **2012** prévaut. [Historique des éditions SH2](https://www.silenthillmemories.net/sh2/versions_en.htm) · [Fiche KONAMI HD Collection](https://www.konami.com/games/eu/en/products/shhd/).

Le coffret européen **The Silent Hill Collection** de 2006 réunit SH2 original, SH3 et SH4. Son disque SH2 ne doit pas être présumé enrichi de Born from a Wish. Il reste distinct de HD Collection. [Archive matérielle du coffret](https://crimson-ceremony.net/lostreleases/item.php?id=shgame_shbox-eur-collection).

Le **SH2 remake de 2024** n’était pas entièrement oublié : les lignes `Combattants!A29:D29` et `A42:D42` du classeur historique signalent déjà deux profils de cette édition. Il faut améliorer les raccords documentaires sans renommer ou dupliquer ces IDs. Les ports du remake restent des éditions de la même œuvre. [Lancement officiel du remake](https://www.konami.com/games/us/en/topics/2681/).

L’**extension Book of Memories** de 2013 est attestée par PlayStation. Le communiqué mentionne du contenu additionnel, notamment deux types d’ennemis et deux salles « forsaken ». Il ne prouve pas à lui seul que ces éléments manquent aux fiches du projet : la comparaison de contenu reste à faire. [Annonce du contenu sur PlayStation](https://blog.playstation.com/2013/03/19/playstation-store-update-283/).

### Sortie, annonce et annulation

Le remake du premier Silent Hill est classé **annoncé / en développement**. L’annonce de PRESS START en juin 2025 et le rapport KONAMI de janvier 2026 ne sont pas une preuve de sortie. Ses champs de publication restent vides. **Silent Hills** est un projet annulé ; **P.T.** reste un teaser jouable historiquement publié, ensuite retiré. [PRESS START 2025](https://www.konami.com/games/ca/en/topics/2890/) · [Rapport KONAMI janvier 2026](https://img.konami.com/ir/en/ir-data/statements/2026/en0129_cf84s6.pdf) · [Déclaration d’annulation rapportée](https://www.gamespot.com/articles/silent-hills-cancelled-konami-confirms/1100-6426919/).

La présence actuelle des machines **Silent Hill Escape** et **Silent Hill Return** au catalogue fabricant confirme les produits, sans fixer leur première date d’exploitation. Leur annonce de **2019**, leur objectif **T1 2020** et leur catalogue sont donc des champs distincts ; `releaseYear` reste `null`. La première n’est pas The Escape mobile, la seconde n’est pas le film Return to Silent Hill. [Catalogue Escape](https://www.konamigaming.com/games/all-games/details/silent-hill-escape) · [Catalogue Return](https://www.konamigaming.com/games/all-games/details/silent-hill-return) · [Dossier fabricant annonçant l’objectif](https://www.fantiniresearch.com/images/pdf/KNM_Pre-NIGA2020_MediaBrief.pdf).

### Supports narratifs et documentaires

**The Experience** est une collection multimédia UMD. Le récit **Hunger** y est individualisé, tandis que Dying Inside conserve son origine éditoriale. Les recueils Three Bloody Tales et Omnibus regroupent des récits déjà indexés : ils ne produisent pas un second exemplaire de chaque histoire. [The Experience](https://www.silenthillmemories.net/she/info_en.htm) · [Bibliographie institutionnelle IDW](https://comics.lib.msu.edu/rri/irri/idwm.htm).

Le livre **Lost Memories: Silent Hill Chronicle** et le DVD **Lost Memories: The Art & Music of Silent Hill** sont deux supports distincts. Le premier était déjà une référence régulière de `docs/MOVESETS.md` et `docs/production/research/classic.json`. Des images du second étaient déjà citées dans plusieurs rapports de sprites. Leur couverture est donc partielle, et leur nouvelle notice relie des preuves existantes. Les traductions en ligne du livre sont non officielles ; les passages sensibles demandent la page japonaise de l’édition. [Notice du livre](https://www.silenthillmemories.net/lost_memories/info_en.htm) · [Notice du DVD](https://www.silenthillmemories.net/dvd_lm/info_en.htm).

Les sept novélisations sont distinctes des jeux et films adaptés. Les éditeurs confirment notamment le roman **Silent Hill f du 30 octobre 2025** et **Return to Silent Hill du 27 janvier 2026**. Pour les romans KONAMI historiques, les jours de mise en vente et les mois d’édition divergent entre notices : l’année suffit au présent registre. [KADOKAWA, f](https://www.kadokawa.co.jp/product/322507000131/) · [Titan Books, Return](https://titanbooks.com/72540-return-to-silent-hill-the-official-movie-novelization/).

**Townfall – The Dock House** est annoncé officiellement comme récit compagnon dans 2000 AD Prog 2500, et sa publication est corroborée par le sommaire paru et la notice du libraire. Les dates britannique et américaine sont conservées séparément. Cet audit ne prétend pas avoir lu toutes ses pages. [KONAMI](https://www.konami.com/games/eu/en/topics/19315/) · [Sommaire du 16 septembre 2026](https://graphicpolicy.com/2026/09/16/preview-2000-ad-prog-2500/) · [Notice de publication américaine](https://atomicbooks.com/products/2000-ad-prog-2500).

### Crossovers et disponibilité

Les apparitions dans Dead by Daylight, Bomberman, Dark Deception et le mini-jeu Urban Myth gardent la provenance de leur jeu hôte. Elles ne définissent pas automatiquement de nouveaux pouvoirs ou une nouvelle chronologie pour les œuvres originales. Une publication historique peut survivre à la fin d’un service : R Online a cessé son service en 2022 ; la fiche Silent Hill de Monsters & Mortals est signalée retirée de la vente par SteamDB. Ces constats ne modifient pas l’existence passée de ces collaborations. [Fin de R Online](https://www.konami.com/games/bomberman/online/eu/en/news/) · [Métadonnées de la fiche du DLC](https://steamdb.info/app/1508810/subs/).

## Raccord au projet et travail restant

La [passe de stages 21](production/vague21/README.md) intègre **12 nouveaux lieux et 24 PNG**, portant le registre à **55 arènes bitmap sur 123**. Les **68 absences** restantes, dont **15 références bloquées**, figurent dans l’onglet Stages et dans [l’inventaire courant](production/vague21/final-audit.json). Ces chiffres concernent les décors du jeu, indépendamment des 66 entrées du corpus documentaire.

Le registre de franchise complète `docs/GDD_FR.md` et `docs/SOURCES.md`. Il doit rester séparé de `data/sources.json`, qui configure les packs exécutables et leurs stages par défaut. L’indexation d’un programme, d’un roman ou d’un coffret ne doit pas créer un faux pack jouable.

Le complément de classeur **Corpus / Stages** reprend les IDs stables, la nature, le statut de publication, les liens runtime, la qualité de preuve et la prochaine étude. La colonne « Couverture avant ajout » préserve la réalité de l’audit. Le classeur de production historique conserve ses onze onglets et son contenu ; son empreinte observée est :

```text
4016c8e34463b43931618f7fe01ffc0c16e519515ef8a299437ce70d41725871
```

Les études les plus utiles après l’indexation sont parallèles et bornées :

1. **Play Novel** : identifier les scénarios effectivement publiés et les captures par édition, à partir du catalogue et du guide disponibles.
2. **Extension BoM** : rapprocher précisément ses contenus des fiches déjà présentes avant de déclarer des ennemis ou lieux manquants.
3. **The Dock House** : consulter les pages exactes et distinguer les éléments nouveaux de ceux de Townfall déjà couverts.
4. **Jeux mobiles** : réunir les captures, identités et états de salle des éditions exactes avant toute production visuelle.

Aucun personnage, moveset, stage ou portrait n’est ajouté par ce travail documentaire. Une preuve de titre et de date ne remplace pas les références nécessaires à une image. Les restrictions documentaires des fiches restent inchangées.

## Périmètre et limites de preuve

Cette passe couvre les catégories demandées et les supports majeurs confirmés. Elle ne crée pas une ligne pour chaque OST, produit dérivé, port identique, costume, réimpression ou ouvrage critique indépendant. Les rumeurs et les fanworks sans licence établie restent hors du corpus validé.

Les notices officielles sont privilégiées. Les œuvres anciennes dont les sites ont disparu utilisent des archives spécialisées ou des catalogues bibliographiques, explicitement signalés dans les données. Les comics, mangas, romans et DVD ne sont pas revendiqués comme intégralement lus ou visionnés.

L’audit initial du classeur a réussi en lecture seule. Une seconde importation destinée à des mots-clés complémentaires a été interrompue par le runtime ; elle n’est pas comptée comme résultat négatif. Les cinq nouveaux supports ont été confrontés aux fichiers texte de la base immuable, et les occurrences documentaires trouvées sont conservées dans le rapport local. Le classeur n’a été ni modifié ni réexporté.

Ce corpus est un état documenté au 19 novembre 2026. Il organise les preuves et les prochaines études, sans promettre un inventaire mondial de toute exploitation commerciale de la marque.

