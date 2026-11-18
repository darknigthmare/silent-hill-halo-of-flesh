# Illustrations à poursuivre après la vague 7

Au 18 novembre 2026, le jeu compte **123 lieux**. **114** n’ont aucune entrée dans le manifeste de décors bitmap. Sur les **9** lieux inscrits, **7** affichent une illustration dans la scène actuellement retenue, et **2** ont une image historique pour une autre pièce. Pour **116 entrées du catalogue**, le jeu ne résout donc aucun décor bitmap correspondant à la pièce courante. Ce total comprend 15 fiches à la référence bloquée. Le rendu de décor programmé existe indépendamment des PNG. [Manifeste des décors](../../../src/stage-bitmap-manifest.js) · [Résolution de la scène active](../../../src/stage-bitmaps.js)

## 114 lieux sans entrée bitmap

Les identifiants reprennent le catalogue du jeu. La colonne des chapitres contient les lieux inscrits dans un parcours de chronique et dont la référence est ouverte. La dernière colonne rassemble les lieux pour lesquels le jeu signale une référence bloquée, y compris ceux utilisés par une chronique. Chaque identifiant figure une seule fois dans ce tableau. [Fiches des lieux](../../../data/stages.json) · [Parcours des chroniques](../../../data/chronicles.json)

| Œuvre | Total | Utilisés par une chronique | Autres lieux | Référence bloquée |
| --- | ---: | --- | --- | --- |
| Silent Hill | 6 | `nowhere` | `old_silent_hill`, `hospital_nightmare`, `midwich_nightmare`, `central_nightmare`, `sewer_resort` | — |
| Silent Hill 2 | 9 | `labyrinth`, `hotel_otherworld` | `blue_creek`, `brookhaven_sh2`, `toluca_prison`, `south_vale`, `historical_society`, `prison_meat_locker`, `baldwin_mansion` | — |
| Silent Hill 3 | 11 | `brookhaven_sh3`, `church` | `apartment_roof`, `sewers`, `nightmare_mall`, `hazel_subway`, `underpass_sh3`, `hilltop_center`, `nightmare_hilltop`, `nightmare_hospital_sh3`, `lakeside_sh3` | — |
| Silent Hill 4: The Room | 9 | `water_prison`, `apartment_world` | `subway_world`, `hospital_world`, `forest_world`, `building_world`, `outside_room_302`, `final_sacrament` | `wish_house` |
| Origins | 5 | `cedar_grove`, `antique_shop` | `alchemilla_origins`, `artaud_theater`, `nightmare_theater` | — |
| Homecoming | 11 | `shepherds_glen`, `grand_hotel`, `underground_hc` | `church_hc`, `nightmare_hospital_hc`, `police_station_hc`, `town_hall_hc`, `prison_hc`, `shepherd_house_hc`, `scarlet_chamber`, `curtis_shop` | — |
| Shattered Memories | 5 | `nightmare_school` | `frozen_streets`, `nightmare_hospital_sm`, `nightmare_mall_sm` | `lighthouse_sm` |
| Downpour | 7 | `overlook` | `devils_pit`, `centennial_building`, `st_marias`, `downpour_streets`, `otherworld_void` | `anne_fight` |
| The Arcade | 12 | — | `arcade_ship`, `arcade_city`, `arcade_hospital`, `arcade_hospital_roof`, `arcade_historical`, `arcade_prison`, `arcade_toluca_lake`, `arcade_1918`, `arcade_1993` | `arcade_graveyard`, `arcade_mall`, `arcade_amusement` |
| Book of Memories | 8 | `book_fire`, `book_wood`, `book_water`, `book_blood`, `book_steel` | `book_light`, `book_earth` | `book_zone` |
| P.T. | 1 | `looping_hall` | — | — |
| The Short Message | 3 | `villa` | `villa_rooftop`, `villa_stairwell` | — |
| Silent Hill f | 9 | `ebisugaoka`, `dark_shrine`, `school_shf` | `hinako_home`, `dark_shrine_corridors`, `shimizu_residence`, `dark_shrine_main`, `corrupted_ebisugaoka` | `festival_square` |
| Films | 8 | `film_midwich`, `film_hospital`, `film_church`, `film_sanctuary` | `return_streets`, `return_brookhaven` | `return_lakeview`, `return_portrait_room` |
| Ascension | 3 | `hope_junction`, `stilledalen`, `ascension_otherworld` | — | — |
| Townfall | 7 | `st_amelia_residential` | `alternate_facility` | `st_amelia_marina`, `townfall_medical`, `ceg_tower`, `clara_woods`, `clara_woods_different` |
| **Total** | **114** | **32** | **67** | **15** |

Le motif propre à chacun des 15 lieux à documenter figure dans `reference.locationStatus` de sa fiche. Les causes comprennent un sous-lieu à préciser, une variante à distinguer ou un nom à corroborer.

## Deux pièces actives à illustrer dans des lieux déjà inscrits

| Identifiant du lieu | Image historique conservée et scène du manifeste | Pièce choisie en jeu et scène attendue |
| --- | --- | --- |
| `woodside` | Couloir original sur PC · `original-pc-corridor` | Appartement 208, pièce de l’horloge · `woodside-208-clock-room` |
| `shopping_mall` | Helen’s Bakery · `normal-helens-bakery` | Happy Burger · `central-square-happy-burger` |

Le moteur conserve chaque PNG historique et écarte automatiquement sa scène lorsque l’identifiant de pièce diffère. Les nouvelles images doivent donc cibler les identifiants de la dernière colonne.

## 12 chroniques encore sans images d’ouverture et de fin après Origins

Le catalogue contient **15 chroniques**. Les paires de *Naître deux fois* (`heather_birth`) et des *Vingt-et-un Sacrements* (`room_21`), ainsi que la paire du lot Origins pour *Les Miroirs de Travis* (`travis_mirrors`), sont comptées à part. Les **12 routes** suivantes demandent **24 illustrations**, une ouverture et une fin pour chacune. [Attribution des images aux routes](../../../src/chronicle-art.js) · [Titres et textes des récits](../../../data/chronicles.json)

| Œuvre | Identifiant de la chronique | Titre affiché |
| --- | --- | --- |
| Silent Hill | `fog_of_alessa` | LA BRUME D’ALESSA |
| Silent Hill 2 | `james_sentence` | LA SENTENCE DE JAMES |
| Homecoming | `alex_home` | LE FILS QUI REVIENT |
| Shattered Memories | `harry_ice` | MÉMOIRE SOUS LA GLACE |
| Downpour | `murphy_rain` | PLUIE SUR RYALL |
| Book of Memories | `book_elements` | LES GARDIENS DU LIVRE |
| P.T. | `loop_204863` | 204863 |
| The Short Message | `maya_villa` | LES PÉTALES DE MAYA |
| Silent Hill f | `hinako_f` | LA PROCESSION D’HINAKO |
| Films | `ashes_of_alessa` | LES CENDRES D’ALESSA |
| Ascension | `trauma_together` | LE TRAUMA PARTAGÉ |
| Townfall | `static_beneath_st_amelia` | LE SIGNAL SOUS ST. AMELIA |
