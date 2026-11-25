# État des lieux — Silent Hill: Halo of Flesh

Commit de base inspecté : `2af87b6a1a8740a0759ce7c8c2746be19c48f4af`. Rapport déterministe produit par `docs/production/vague29/build-inventory.mjs`.

Les chiffres décrivent les manifestes actuels. Les images statiques, leur présence dans Git, leur rôle de combat et leur fidélité sont des états distincts. Cet audit ne décode pas les PNG et ne remplace pas la vérification visuelle.

## Couverture par partie

| Partie | Présent | Référence / total | Reste | Couverture |
| --- | --- | --- | --- | --- |
| Portraits de sélection | 204 | 230 | 26 | 88,7 % |
| Sprites de base de profil candidats | 190 | 230 | 36 absents + 4 anciens à revoir | 82,6 % |
| Boss : sprites de base candidats | 57 | 75 | 15 absents + 3 anciens | 76,0 % |
| Arènes avec scène bitmap active | 85 | 123 | 38 | 69,1 % |
| Commandes de projectile avec image dédiée | 14 | 86 | 72 | 16,3 % |
| Profils projectile avec au moins une image | 5 | 31 | 26 | 16,1 % |
| Intros de chroniques | 15 | 15 | 0 | 100,0 % |
| Endings de chroniques | 15 | 15 | 0 | 100,0 % |
| Scènes rival / observation | 15 | 15 | 0 | 100,0 % |
| Idles des contextes d’armes déclarés | 3 | 4 | 1 | 75,0 % |
| Clips avec plusieurs images distinctes | 6 | Périmètre final non défini | Non chiffré | — |
| Fidélité certifiée | 0 | 230 | Validation des sources nécessaire | 0,0 % |

Les 5 images de projectile couvrent 14 commandes : ces deux unités ne sont pas interchangeables. 1 profil(s) restent partiellement couverts.

Décors : 87 pièces/variantes enregistrées, 168 plans bitmap au total ; 166 plans sont sélectionnés dans les scènes par défaut. 81 scènes par défaut déclarent une parallaxe. Parmi les 38 arènes absentes, 15 ont un blocage de référence explicite et 23 n’en ont pas ; cette dernière valeur n’atteste pas que les références suffisent.

## Détail par œuvre / pack runtime

| Œuvre | Profils | Portraits | Sprites de profil | Anciens à revoir | Arènes | Projectiles : commandes |
| --- | --- | --- | --- | --- | --- | --- |
| SILENT HILL | 20 | 19/20 | 19/20 | 0 | 9/9 | 3/14 |
| SILENT HILL 2 | 18 | 13/18 | 12/18 | 1 | 12/12 | 3/13 |
| SILENT HILL 3 | 20 | 19/20 | 18/20 | 0 | 12/12 | 4/9 |
| SILENT HILL 4: THE ROOM | 32 | 30/32 | 29/32 | 0 | 9/10 | 0/6 |
| SILENT HILL: ORIGINS | 11 | 11/11 | 11/11 | 0 | 4/6 | 0/11 |
| SILENT HILL: HOMECOMING | 17 | 15/17 | 15/17 | 0 | 11/11 | 0/7 |
| SILENT HILL: SHATTERED MEMORIES | 5 | 5/5 | 5/5 | 0 | 4/5 | Sans commande par défaut |
| SILENT HILL: DOWNPOUR | 14 | 14/14 | 12/14 | 0 | 5/7 | 0/5 |
| SILENT HILL: THE ARCADE | 19 | 16/19 | 13/19 | 1 | 2/12 | 0/3 |
| SILENT HILL: BOOK OF MEMORIES | 28 | 24/28 | 23/28 | 1 | 5/8 | 4/13 |
| P.T. | 1 | 1/1 | 1/1 | 0 | 1/1 | Sans commande par défaut |
| SILENT HILL: THE SHORT MESSAGE | 1 | 1/1 | 1/1 | 0 | 3/3 | Sans commande par défaut |
| SILENT HILL f | 19 | 15/19 | 15/19 | 0 | 7/9 | 0/2 |
| SILENT HILL — FILM UNIVERSE | 13 | 9/13 | 5/13 | 1 | 1/8 | Sans commande par défaut |
| SILENT HILL: ASCENSION | 7 | 7/7 | 6/7 | 0 | 0/3 | 0/3 |
| SILENT HILL: TOWNFALL | 5 | 5/5 | 5/5 | 0 | 0/7 | Sans commande par défaut |

## Catégories du roster

| Catégorie | Profils | Portraits | Profil candidat | Ancien à revoir | Combat absent |
| --- | --- | --- | --- | --- | --- |
| CREATURE | 149 | 136 | 129 | 1 | 19 |
| BOSS | 75 | 63 | 57 | 3 | 15 |
| SET PIECE | 3 | 3 | 2 | 0 | 1 |
| SECRET | 2 | 1 | 1 | 0 | 1 |
| HUMAN ENEMY | 1 | 1 | 1 | 0 | 0 |

## Costumes, variantes et armes

79 fiches possèdent un champ variant ou variantOf : 67 portraits, 60 profils candidats, 2 vues anciennes et 17 absences. Elles sont déjà incluses dans les 230 profils. Ces fiches décrivent aussi des armes, tailles, formes et éditions ; elles ne constituent pas un catalogue exhaustif de costumes. Aucun pourcentage de costumes n’est calculé.

| Profil | Kit / contexte | Idle exact |
| --- | --- | --- |
| Memory of Alessa | idle@sh3_memory_of_alessa_049:weapon:knife | Présent |
| Memory of Alessa | idle@sh3_memory_of_alessa_049:weapon:handgun | Présent |
| Memory of Alessa | idle@sh3_memory_of_alessa_049:weapon:pipe | Présent |
| Memory of Alessa | idle@sh3_memory_of_alessa_049:weapon:smg | Absent — génération précédemment refusée |

Le refus documenté de la variante SMG de Memory of Alessa est conservé dans art/reference-provenance-alessa.json. Aucun autre idle d’arme ne remplace cette image manquante.

Les 4 kits d’armes réutilisent des clés de commandes. Ils n’ajoutent pas de personnages et ne définissent pas un nombre d’images d’attaque à produire.

## Histoires et illustrations

48 images sont référencées sur 15 parcours : 15 intros, 15 endings, 12 rivaux, 3 observations et 3 apparitions supplémentaires. Le périmètre est celui des parcours configurés, pas une histoire pour chacun des 230 profils.

| Parcours | Pack | Images prévues dans le manifeste |
| --- | --- | --- |
| LA BRUME D’ALESSA | sh1 | intro, ending, rival |
| LA SENTENCE DE JAMES | sh2 | sighting, intro, ending, rival |
| NAÎTRE DEUX FOIS | sh3 | sighting, intro, ending, rival |
| LES VINGT-ET-UN SACREMENTS | sh4 | intro, ending, rival |
| LES MIROIRS DE TRAVIS | origins | intro, ending, rival |
| LE FILS QUI REVIENT | homecoming | intro, ending, rival |
| MÉMOIRE SOUS LA GLACE | shattered | intro, ending, observation |
| PLUIE SUR RYALL | downpour | intro, ending, rival |
| LES GARDIENS DU LIVRE | bom | intro, ending, rival |
| 204863 | pt | intro, ending, observation |
| LES PÉTALES DE MAYA | shortmessage | sighting, intro, ending, observation |
| LA PROCESSION D’HINAKO | shf | intro, ending, rival |
| LES CENDRES D’ALESSA | film | intro, ending, rival |
| LE TRAUMA PARTAGÉ | ascension | intro, ending, rival |
| LE SIGNAL SOUS ST. AMELIA | townfall | intro, ending, rival |

## Assets et autres systèmes

Les manifestes référencent 673 fichiers distincts : 452 fichiers de personnages/portraits, 168 plans de décors, 5 projectiles et 48 illustrations de chronique. Les portraits et frames partagent parfois un même fichier ; 204 + 252 ne constitue donc pas un total distinct.

Dans le commit de base, 673 fichiers référencés sont présents ; 0 autres sont locaux et pas encore dans ce commit. 0 référence(s) absente(s) à la fois du commit et du disque. Le checkout peut être partiel : l’absence d’un PNG sur disque ne prouve pas son absence du dépôt.

Bible : 66 notices documentaires, 16 packs runtime. Les 4600 commandes, 460 définitions de fatalité et 150 phases de boss relèvent des données de gameplay ; ce ne sont pas des images ou des animations achevées.

Les props isolés, les VFX hors projectiles, les effets d’impact et les costumes n’ont pas de catalogue séparé suffisamment défini pour calculer une complétion. Les éléments de premier plan sont inclus dans les plans de décors. Le son est synthétisé par Web Audio ; aucun total final de fichiers SFX n’est établi.

## Écarts avec les états précédents

| Comparaison | Valeur enregistrée | Recalcul | Lecture |
| --- | --- | --- | --- |
| vague28/summary.json:characters.portraits | 204 | 204 | Identique |
| vague28/summary.json:characters.sideViews | 190 | 190 | Identique |
| vague28/summary.json:characters.legacyToReview | 4 | 4 | Identique |
| vague28/summary.json:characters.missingCombat | 36 | 36 | Identique |
| vague28/summary.json:stages.active | 85 | 85 | Identique |
| vague28/summary.json:stages.activePNG | 168 | 168 | Identique |
| vague28/summary.json:projectiles.illustratedSlots | 14 | 14 | Identique |
| vague28/summary.json:characters.animatedClips | 6 | 6 | Identique |

Le compteur historique activePNG inclut les variantes de pièce. coverageComplete décrit les fiches du catalogue, pas la complétion des assets. Les anciens champs local-only ou not-run décrivent leur exécution historique ; le statut des PR et de la CI doit être vérifié séparément sur GitHub.

## Profils de base à compléter ou revoir

| ID | Nom | Portrait | Vue combat | Motif documenté |
| --- | --- | --- | --- | --- |
| sh1_incubus_019 | Incubus | Absent | missing | Refus antérieur explicite de génération de l’Incubus SH1 ; aucune nouvelle tentative, reformulation ou variante de remplacement. |
| sh2_mannequin_ambusher_023 | Mannequin — Ambusher | Absent | missing | Même sujet Mannequin SH2 que le refus antérieur ; aucune variante Ambusher utilisée pour reprendre la génération refusée. |
| sh2_maria_final_manifestation_033 | Maria — Final Manifestation | Présent | legacy-unreviewed | Le candidat Maria précède le refus explicite Mary Final Manifestation. Le sujet apparenté n’a pas été régénéré sous l’autre nom. |
| sh2_mary_final_manifestation_034 | Mary — Final Manifestation | Absent | missing | Refus explicite de l’outil image pour Mary Final Manifestation SH2, catégorie output violence, requête aab0fa5c-0b16-4cc5-b4b7-8969f7bbdc30. Un seul appel ; aucune nouvelle requête ou autre identité utilisée après le refus. |
| sh2_prisoner_035 | Prisoner | Absent | missing | La FAQ SH2 relue qualifie la présence de « invisible unknown creature » et décrit dégâts/cris, sans apparition corporelle. Ce signal peut être ciblé mais ne fournit aucun extérieur visible ; ni silhouette de prisonnier inventée, ni corps du remake transféré. |
| sh2_spider_mannequin | Spider Mannequin | Absent | missing | Même famille de sujet Mannequin SH2 précédemment refusée ; variante Spider non utilisée comme nouvel essai ni substitution. |
| sh2_mandarin_floor_form | Mandarin — Floor Form | Absent | missing | Le commentaire de création original relu décrit la suspension par les bras puis dit explicitement « it is not permitted to stand above ground ». Aucun modèle propre de Floor Form n’est identifié dans la source ; adaptation non canonique toujours sans apparence validable, pas de réemploi du Mandarin suspendu. |
| sh3_valtiel_051 | Valtiel | Absent | missing | Refus antérieur explicite de génération de Valtiel SH3 ; aucune nouvelle tentative ou substitution. |
| sh3_sewer_creature_052 | Sewer Creature | Présent | missing | Les trois nouvelles vues associées à Underpass montrent l’emplacement du mémo, sa carte et Heather avec le sèche-cheveux, aucune silhouette entière du monstre. Le guide établit un danger scripté sous la passerelle et sa neutralisation, pas son contour corporel. Aucun corps caché déduit de l’eau ni confusion avec la sewer lady de l’Extra New Game. |
| sh4_ghost_victim_066 | Ghost — Victim | Absent | missing | Galerie SH4 correcte arts_monsters consultée et cinq arts supplémentaires inspectés :01/02 montrent des bustes pris dans une paroi/substance, avec bas caché ;06/07/39 sont explicitement Cynthia selon les légendes de galerie. Aucun extérieur entier propre au dossier collectif des anciens Ghosts ainsi découvert. Le corps d’une victime nommée n’est pas réétiqueté, et aucun membre de la famille refusé n’est repris sous le nom collectif. |
| sh4_sacrificed_walter_071 | Sacrificed Walter | Absent | missing | La nouvelle illustration native Final Boss38 complète le visage/torse ; avec la capture des Final Sacraments, les extrémités latérales restent hors cadre. L’union ne fournit pas tout l’extérieur du Conjurer et de ses attaches ; aucun transfert du Shadow Walter mobile. |
| sh4_eileen_head_073 | Eileen Head | Présent | missing | La nouvelle capture presse SH4 de juin 2004 montre la tête géante, mais le personnage masque encore bouche, menton et raccord au sol. Le contour entier reste inconnu ; aucun corps de duel ajouté. |
| homecoming_amnion_hanging_form_097 | Amnion — Hanging Form | Absent | missing | Refus antérieur Amnion conservé ; aucune nouvelle requête pour ce sujet. |
| homecoming_amnion_exposed_form_098 | Amnion — Exposed Form | Absent | missing | Même sujet Amnion déjà refusé ; la phase Exposed ne sert pas de variante de contournement. Aucune requête. |
| downpour_void_113 | Void | Présent | missing | Le Void est une lumière/consommation du décor, sans corps fini dans la capture native. Le rendre comme un monstre entier ou inventer une extrémité du phénomène n’aurait pas de support visuel ; rôle environnemental conservé. |
| downpour_monocle_man_114 | Monocle Man | Présent | missing | La référence nommée résout la membrane faciale et le monocle, mais les rayons, rubans et chaîne sortent du cadre. Aucune nouvelle vue complémentaire exacte de leurs extrémités ; pas de corps humain ajouté. |
| arcade_greedy_worm_arcade_119 | Greedy Worm — Arcade | Présent | missing | Les31 captures Arcade montrent un gros plan de créature vermiforme mais ne prouvent pas son extérieur entier. Les nouveaux rendus Greedy Worm SH4 appartiennent à une autre œuvre et ne sont pas transférés à ce profil Arcade. |
| arcade_numb_body_arcade | Numb Body — Arcade | Absent | missing | Aucun modèle entier Numb Body nommément attribuable à Arcade trouvé parmi les galeries et captures consultées. Les figures humanoïdes attestées dans ces vues sont Gum Head/Scraper ou restent non attribuées ; elles ne sont pas renommées Numb Body. |
| arcade_nurse_arcade | Nurse — Arcade | Absent | missing | Sujet déjà arrêté dans ART144 : le modèle Nurse Arcade correspond au design SH3 Pipe précédemment refusé. Aucun nouvel appel, réétiquetage ou autre variante pour contourner ce refus ; aucun modèle indépendant distinct établi. |
| arcade_red_pyramid_thing_arcade | Red Pyramid Thing — Arcade | Présent | legacy-unreviewed | La source Arcade est identifiée et distincte, mais l’arrêt explicite des raffinements Pyramid apparentés suit le refus du profil film en vague23. Aucun refus propre à cet ID Arcade n’est retrouvé. |
| arcade_toadstool_arcade | Toadstool — Arcade | Présent | missing | Les cartes Arcade nomment Toadstool, mais leurs pictogrammes représentent des positions de parcours, pas le corps du monstre. Aucune silhouette entière Arcade identifiée dans les captures consultées ; pas de champignon SH4 importé par défaut. |
| arcade_robbie_the_rabbit_shotgun | Robbie the Rabbit — Shotgun | Absent | missing | Conflit de variante : le modèle est nommé Robbie_Rifle.obj et le port décrit un rifle, alors que le profil actuel indique Shotgun. Aucun fusil attribué arbitrairement à ce profil. |
| bom_swarm_132 | Swarm | Présent | legacy-unreviewed | Le bestiaire et le PNG actif représentent un petit insecte individuel, malgré le nom Swarm et le prose du corpus évoquant un essaim. La source native 127×127 en vue dorsale oblique ne résout pas le profil et les volumes cachés. |
| bom_mother_135 | Mother | Absent | missing | Refus explicite antérieur Mother BoM, catégories sexual/violence, requête a78228ad-d44c-40b7-8a8e-214bf0b7508e. Aucun nouvel essai ni modification d’élément ou emprunt d’un autre sujet après ce refus. Aucun PNG livré dans ART92. |
| bom_valtiel_136 | Valtiel | Absent | missing | Refus antérieur du sujet Valtiel respecté. Aucun appel ART92 sous une autre édition ou apparence, aucune reprise d’anatomie ni relabel BoM pour contourner le refus. Aucun rôle ou pouvoir ajouté. |
| bom_blood_guardian_143 | Blood Guardian | Absent | missing | Non tenté : Blood Guardian contient la même Blood Mama dans son état sur la masse multi-bras. Le refus nouveau Blood Mama b6688211-2810-4d1e-ae1c-963cc64a7ea9 interdit un essai de cet autre état comme variante ou substitut ; aucune image demandée ni importée pour Blood Guardian. |
| bom_blood_mama_145 | Blood Mama | Absent | missing | Génération individuelle refusée ; aucun réessai, variante, relabel ou substitution. |
| shf_corruptor_155 | Corruptor | Absent | missing | Refus/arrêt antérieur maintenu, aucune nouvelle génération pour ce sujet ni variante. Génération individuelle refusée par le système de sécurité. Aucun réessai, variante, relabel ou substitution. |
| shf_hatcher_156 | Hatcher | Absent | missing | Refus/arrêt antérieur maintenu, aucune nouvelle génération pour ce sujet ni variante. Génération individuelle refusée par le système de sécurité. Aucun réessai, variante, relabel ou substitution. |
| shf_dark_hatcher_160 | Dark Hatcher | Absent | missing | Refus/arrêt antérieur maintenu, aucune nouvelle génération pour ce sujet ni variante. Dark Hatcher est une variante du Hatcher refusé dans ce lot (sexual + violence, 5cb09bcb-9e8b-40be-b3c2-391e62900d5e). Aucun prompt, variante ou réessai utilisé pour contourner ce refus. Portrait sombre inspecté seulement. |
| shf_hinako_s_mother_165 | Hinako’s Mother | Absent | missing | Refus/arrêt antérieur maintenu, aucune nouvelle génération pour ce sujet ni variante. Génération individuelle refusée par le système de sécurité. Aucun réessai, variante, relabel ou substitution. |
| film_dark_nurse_171 | Dark Nurse | Absent | missing | Des références entières du costume original 2006 ont été inspectées. L’appel de génération a été refusé à la sortie (violence) ; aucune image livrée ni réessai. |
| film_grey_child_film_172 | Grey Child — Film | Absent | missing | Les nouveaux PSP «thegraychild» et wallpapers2006 n°05/13 ne montrent que visage/torse. Les maquettes16–18 de fabrication terminent les jambes sur des supports de prothèse ; les22scans Score n’apportent aucun pied final. Identité enfant-like surnaturelle conservée ; aucune génération ni relabel adulte. |
| film_colin_the_janitor_174 | Colin the Janitor | Présent | missing | Les nouveaux PSP «thejanitor1/2», wallpapers2006 n°02/15/16, Score47 et Fangoria253/49 montrent Colin entravé dans les toilettes, avec pieds et segments des jambes masqués. Les notes décrivent des jambes tordues ; aucune nouvelle pièce n’établit les membres cachés et aucun rampant complet n’est inventé. |
| film_red_pyramid_film_175 | Red Pyramid — Film | Présent | legacy-unreviewed | Le raffinement exact du Red Pyramid film a été refusé en sortie pour violence en vague23. Aucun PNG produit ni importé ; l’ancienne sélection et l’ancien idle restent présents. |
| film_missionary_revelation_177 | Missionary — Revelation | Absent | missing | Costume de production identifié dans les collections Cineloggia/HSPPA, mais les nouvelles photos accessibles ne montrent pas les pieds du Missionary. Photo pertinente inaccessible (402) ; chaussure finale toujours non établie. |
| film_bubble_head_nurse_return_to_silent_hill | Bubble Head Nurse — Return to Silent Hill | Présent | missing | Les références finales de Return to Silent Hill (2026) ont été retrouvées : costume entier, chaussures, tête et petit maillet, corroborés par le making-of officiel et un extrait licencié. L’unique appel imagegen a ensuite été refusé en sortie (moderation_blocked, catégorie other) ; aucun PNG produit, aucun réessai ni changement de nom. |
| film_creeper_return_to_silent_hill | Creeper — Return to Silent Hill | Présent | missing | Présence du Creeper et bouche humanoïde sous le corps corroborées dans les comptes rendus du film. Aucun visuel entier attribué obtenu ; téléchargement presse VVS arrêté après 403. |
| film_fused_mattress_manifestation_return | Fused Mattress Manifestation — Return | Absent | missing | La fusion Angela/Joshua en manifestation de matelas est corroborée. Le rapprochement avec Abstract Daddy reste une inférence ; aucune vue finale entière ni correspondance officielle exacte du libellé. |
| ascension_stilledalen_stinger_184 | Stilledalen Stinger | Présent | missing | Le concept entier retrouvé appartient au Stinger standard déjà représenté. Aucune anatomie régionale indépendante n’est attestée ; aucune duplication ou recoloration. |

## Arènes sans scène bitmap active

| ID | Nom | Pack | Blocage de référence | Scène requise |
| --- | --- | --- | --- | --- |
| cedar_grove | CEDAR GROVE — FEMALE TREATMENT | origins | Pas de flag | female-treatment-mirror |
| arcade_ship | LITTLE BARONESS | arcade | Pas de flag | — |
| book_zone | BOOK OF MEMORIES — NEXUS | bom | Oui | — |
| festival_square | FESTIVAL SQUARE | shf | Oui | — |
| book_light | LIGHT ZONE | bom | Pas de flag | — |
| book_steel | STEEL ZONE | bom | Pas de flag | — |
| antique_shop | GREEN LION — PASSAGE VERS LE RITUEL | origins | Pas de flag | green-lion-inner-passage |
| film_midwich | MIDWICH — FILM OTHERWORLD | film | Pas de flag | — |
| film_church | CHURCH OF THE ORDER | film | Pas de flag | — |
| film_sanctuary | SANCTUARY — REVELATION | film | Pas de flag | — |
| hope_junction | HOPE’S JUNCTION | ascension | Pas de flag | — |
| stilledalen | STILLEDALEN WOODS | ascension | Pas de flag | — |
| ascension_otherworld | ASCENSION — OPEN GATE | ascension | Pas de flag | — |
| wish_house | WISH HOUSE | sh4 | Oui | — |
| lighthouse_sm | LIGHTHOUSE / THERAPY REVELATION | shattered | Oui | — |
| otherworld_void | DOWNPOUR — VOID CHASE | downpour | Pas de flag | — |
| anne_fight | FULL CIRCLE — ANNE’S CONFRONTATION | downpour | Oui | — |
| arcade_hospital | THE ARCADE — BROOKHAVEN HOSPITAL | arcade | Pas de flag | — |
| arcade_historical | THE ARCADE — HISTORICAL SOCIETY | arcade | Pas de flag | — |
| arcade_prison | THE ARCADE — TOLUCA PRISON | arcade | Pas de flag | — |
| arcade_graveyard | THE ARCADE — UNDERGROUND GRAVEYARD | arcade | Oui | — |
| arcade_toluca_lake | THE ARCADE — TOLUCA LAKE | arcade | Pas de flag | — |
| arcade_1918 | THE ARCADE — 1918 | arcade | Pas de flag | — |
| arcade_1993 | THE ARCADE — 1993 PHANTOM FRONT | arcade | Pas de flag | — |
| arcade_mall | THE ARCADE — SHOPPING MALL | arcade | Oui | — |
| arcade_amusement | THE ARCADE — AMUSEMENT PARK | arcade | Oui | — |
| shimizu_residence | SHIMIZU RESIDENCE I — SALLE À MANGER | shf | Pas de flag | — |
| return_streets | RETURN TO SILENT HILL — STREETS | film | Pas de flag | — |
| return_brookhaven | RETURN TO SILENT HILL — BROOKHAVEN | film | Pas de flag | — |
| return_lakeview | RETURN TO SILENT HILL — BURNING LAKEVIEW | film | Oui | — |
| return_portrait_room | RETURN TO SILENT HILL — PORTRAIT ROOM | film | Oui | — |
| st_amelia_marina | ST. AMELIA MARINA | townfall | Oui | — |
| st_amelia_residential | ST. AMELIA — RESIDENTIAL DISTRICT | townfall | Pas de flag | — |
| townfall_medical | ST. AMELIA MEDICAL CENTRE | townfall | Oui | — |
| ceg_tower | CEG TOWER | townfall | Oui | — |
| clara_woods | CLARA WOODS | townfall | Oui | — |
| clara_woods_different | CLARA WOODS — DIFFERENT | townfall | Oui | — |
| alternate_facility | ST. AMELIA — ALTERNATE FACILITY | townfall | Pas de flag | — |

## Commandes de projectile sans image

| Profil | Pack | Commandes absentes |
| --- | --- | --- |
| Twinfeeler | sh1 | neutralSpecial, super, desperation |
| Floatstinger | sh1 | neutralSpecial, airSpecial, super, desperation |
| Monster Cybil | sh1 | neutralSpecial |
| Incubus | sh1 | neutralSpecial, super, desperation |
| Eddie Dombrowski | sh2 | neutralSpecial, downSpecial, super, desperation |
| Maria — Final Manifestation | sh2 | neutralSpecial, super, desperation |
| Mary — Final Manifestation | sh2 | neutralSpecial, super, desperation |
| Nurse — Revolver | sh3 | neutralSpecial, forwardSpecial, backSpecial, super, desperation |
| Man with the Coat | sh4 | neutralSpecial, super, desperation |
| Walter Sullivan | sh4 | neutralSpecial, super, desperation |
| Straight-Jacket | origins | neutralSpecial, super, desperation |
| Two-Back | origins | neutralSpecial |
| Memory of Richard Grady | origins | neutralSpecial, super, desperation |
| Demon | origins | neutralSpecial, downSpecial, super, desperation |
| Asphyxia | homecoming | neutralSpecial, super, desperation |
| Amnion — Hanging Form | homecoming | neutralSpecial |
| Amnion — Exposed Form | homecoming | neutralSpecial, super, desperation |
| Bogeyman | downpour | neutralSpecial |
| Wheelman | downpour | neutralSpecial |
| Anne Cunningham | downpour | neutralSpecial, super, desperation |
| Robbie the Rabbit — Shotgun | arcade | neutralSpecial, super, desperation |
| Straight-Jacket | bom | neutralSpecial, super, desperation |
| Earth Guardian | bom | downSpecial, super, desperation |
| Steel Guardian | bom | neutralSpecial, super, desperation |
| Rinko-Like Entity | shf | neutralSpecial |
| Hinako’s Mother | shf | neutralSpecial |
| The Immolator | ascension | neutralSpecial, super, desperation |

## Reproduction

```bash
node docs/production/vague29/build-inventory.mjs --output-prefix baseline-inventory
node docs/production/vague29/build-inventory.mjs --output-prefix baseline-inventory --check
```

Le JSON joint contient les identifiants, chemins, états, comparaisons et SHA-256 des sources. Le script refuse un changement de source pendant le recensement. Il écrit uniquement les deux rapports demandés.
