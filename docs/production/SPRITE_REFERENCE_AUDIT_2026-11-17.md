# Audit des sprites candidats contre leurs références documentées

Généré le 2026-11-17 par `npm run audit:references`. **Aucune comparaison de pixels avec une capture source n’est effectuée** : cet audit vérifie les métadonnées, l’identité, l’édition et le contrat de poses. Il ne certifie ni anatomie, ni silhouette, ni fidélité 1:1.

**154 candidats audités · 0 anomalie(s) bloquante(s) · 4 identité(s) à arbitrer · 1 édition(s) à vérifier · 0 calibrage(s) incomplet(s) · 2 champ(s) de registre recalculé(s) au build.**

## Résultats de contrôle

| Contrôle | Résultat |
|---|---|
| Clé de registre = `fighterId` = ID du roster | 154 / 154 |
| Source identique registre / roster / références | 154 / 154 |
| Présence dans le manifeste runtime | 154 / 154 |
| Clip `idle` présent | 154 / 154 |
| Clés de clips acceptées par le contrat | 154 / 154 |
| Compteur d’animations cohérent avec les pixels | 154 / 154 |
| Fidélité déclarée non vérifiée (aucune fausse certification) | 154 / 154 |

## 1. Identité — arbitrage requis

Ces profils sont illustrés alors que la couche de référence signale elle-même une identité à corriger, une édition à fixer ou une documentation partielle. Le sprite ne doit pas être présenté comme validé avant arbitrage.

| Profil | Nom | Statut documenté | Conséquence |
|---|---|---|---|
| `sh2_lying_figure_crawling_021` | Lying Figure — Crawling | `etat-canonique-edition-a-corriger` | « Crawling » est un état déjà présent en 2001, pas une exclusivité remake. Édition de la texture à fixer avant production. |
| `sh3_numb_body_medium` | Numb Body — Medium | `variante-taille-a-calibrer` | Plusieurs tailles sont attestées ; « Medium » reste un découpage de production à calibrer. |
| `film_lying_figure_return_to_silent_hill` | Lying Figure — Return to Silent Hill | `version-documentation-partielle` | La source générale ne valide pas le modèle ni le moveset1:1.; Pas d’héritage automatique film2006, jeu2001 ou remake2024. |
| `sh4_greedy_worm_069` | Greedy Worm | `presence-documentee-role-a-preciser` | Créature tubulaire de SH4 visible au métro et à Water Prison ; le guide de curiosités la décrit attaquable mais non tuable. La non-hostilité et la cause d’une invulnérabilité ne sont pas établies directement par cette preuve. Le blocage de duel conservateur demeure sans décision de rôle validée ; aucun comportement d’une autre œuvre n’est transféré. |

### Identités signalées mais non illustrées

Hors périmètre des 154, mais à traiter avant toute production :

| Profil | Statut |
|---|---|
| `ascension_stilledalen_stinger_184` | `variante-geographique-non-confirmee` |
| `film_bubble_head_nurse_return_to_silent_hill` | `version-documentation-partielle` |
| `film_creeper_return_to_silent_hill` | `version-documentation-partielle` |
| `film_fused_mattress_manifestation_return` | `composite-ou-nom-a-reconcilier` |
| `film_red_pyramid_thing_return_to_silent_hill` | `version-documentation-partielle` |
| `sh2_mannequin_ambusher_023` | `remake-2024-mal-etiquete` |
| `sh2_prisoner_035` | `presence-invisible-documentee-role-a-preciser` |
| `sh2_spider_mannequin` | `remake-2024-mal-etiquete` |
| `sh4_eileen_head_073` | `apparition-immobile-identite-nuancee` |
| `sh4_ghost_victim_066` | `famille-canonique-composite` |

## 2. Édition

| Profil | Écart |
|---|---|
| `film_mannequin_monster_176` | édition de référence « Silent Hill: Revelation (2012, film de Michael J. Bassett) » (2012) alors que le roster déclare 2006 |

Points d’édition relevés séparément :

- `sh2_creeper_025` : `baseId` pointe vers `sh1_creeper_009`, une autre œuvre. La politique interdit tout transfert de capacités, mais le lien de base inter-œuvres reste à confirmer comme simple rapprochement documentaire.
- `film_mannequin_monster_176` : la référence décrit Revelation (2012) alors que le roster porte l’année de la franchise film (2006). L’édition exacte doit être explicite avant toute capture.
- `sh2_lying_figure_crawling_021` : « Crawling » est un état attesté dès 2001, pas une exclusivité du remake ; l’édition de la texture reste à fixer.

## 3. Poses et calibrage

- 154/154 candidats possèdent un clip `idle`.
- 12 candidats possèdent des clips supplémentaires : `sh3_memory_of_alessa_049` (idle@sh3_memory_of_alessa_049:weapon:knife, idle@sh3_memory_of_alessa_049:weapon:handgun, idle@sh3_memory_of_alessa_049:weapon:pipe) · `sh1_split_head_014` (walk, hurt, ko) · `sh3_numb_body_small_037` (walk, hurt, ko) · `sh1_groaner_003` (walk, hurt, ko) · `sh1_wormhead_004` (walk, hurt, ko) · `sh4_hummer_055` (walk, hurt, ko) · `sh3_closer_036` (walk, hurt, ko) · `sh4_twin_victim_059` (taunt@sh4_twin_victim_059:taunt) · `sh3_slurper_042` (walk, hurt, ko) · `sh1_romper_010` (walk, hurt, ko) · `sh3_double_head_040` (walk, hurt, ko) · `sh4_sniffer_dog_female_054` (walk, hurt, ko).
- 0 clip(s) d’attaque et 1 clip(s) de présentation importés. Les attaques et séquences de fatalité restent donc jouées avec la pose disponible, sans animation dédiée.
- Les clips existants utilisent les poses : `idle` ×157, `walk` ×10, `hurt` ×10, `ko` ×10, `taunt` ×1.
- Aucun côté opposé n’est dessiné indépendamment : la politique de miroir reste « présentation seulement ».

### Registre source incomplet, sans conséquence runtime

Le build recalcule ces champs depuis le PNG ; ils manquent seulement à l’enregistrement d’authoring.

| Profil | Détail |
|---|---|
| `film_red_pyramid_film_175` | `visibleBounds` absent du registre source (frame 0), recalculé au build : aucune conséquence runtime |
| `film_red_pyramid_film_175` | `pixelSHA256` absent du registre source (frame 0), recalculé au build |

## 4. Structure des variantes

`variantOf` stocke un nom d’affichage, pas un ID : 11 rattachement(s) ne correspondent à aucun nom exact du roster.

- `film_red_pyramid_film_175` : `variantOf` « Red Pyramid Thing » ne correspond ni à un ID ni à un nom exact du roster
- `sh4_gum_head_new_type_058` : `variantOf` « Gum Head » ne correspond ni à un ID ni à un nom exact du roster
- `sh4_sniffer_dog_female_054` : `variantOf` « Sniffer Dog » ne correspond ni à un ID ni à un nom exact du roster
- `sh3_numb_body_large_038` : `variantOf` « Numb Body » ne correspond ni à un ID ni à un nom exact du roster
- `sh2_red_pyramid_thing_spear_030` : `variantOf` « Red Pyramid Thing » ne correspond ni à un ID ni à un nom exact du roster
- `homecoming_scarlet_spider_form_095` : `variantOf` « Scarlet » ne correspond ni à un ID ni à un nom exact du roster
- `arcade_gum_head_arcade` : `variantOf` « Gum Head » ne correspond ni à un ID ni à un nom exact du roster
- `arcade_red_pyramid_thing_arcade` : `variantOf` « Red Pyramid Thing » ne correspond ni à un ID ni à un nom exact du roster
- `arcade_robbie_the_rabbit_chainsaw` : `variantOf` « Robbie the Rabbit » ne correspond ni à un ID ni à un nom exact du roster
- `sh3_numb_body_medium` : `variantOf` « Numb Body » ne correspond ni à un ID ni à un nom exact du roster
- `bom_pyramid_head_129` : `variantOf` « Red Pyramid Thing » ne correspond ni à un ID ni à un nom exact du roster

Conséquence : une variante ne peut pas être reliée automatiquement à son profil parent, et deux œuvres différentes partageant un même nom restent indistinguables par ce champ. Une résolution par ID serait nécessaire pour verrouiller l’édition.

## 5. Ce que cet audit ne vérifie pas

- La ressemblance anatomique, la silhouette, les proportions et les accessoires face à une capture source.
- Les timings, les frames actives et les collisions : ils restent des adaptations de versus.
- L’absence d’éléments d’une autre édition dans le dessin lui-même.
- La fidélité 1:1 : **0 profil certifié**, y compris parmi les 154 candidats.

## 6. Corrections appliquées

Aucune donnée de production n’a été modifiée par cet audit. Les écarts signalés exigent soit une décision de rôle (statuts d’identité), soit une capture de référence (éditions), soit une revue visuelle humaine (calibrage et fidélité). Les corriger automatiquement reviendrait à inventer le lore.
