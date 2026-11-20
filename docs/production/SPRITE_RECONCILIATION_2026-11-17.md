# Réunion des deux reprises de sprites — 17 novembre 2026

## État réconcilié avant les nouvelles générations

Deux reprises indépendantes partaient du même commit `c68a1a97f1680a38613ac92f00524b00c245df89` de la PR #6. Le premier dossier contenait 15 PNG et le raccord moteur séparant sélection et combat ; le second contenait 7 PNG supplémentaires et leurs preuves. Leur réunion récupère **22 PNG existants**, sans régénérer aucune image.

| Suivi | Résultat après réunion |
|---|---:|
| Profils du roster | 230 |
| Profils illustrés | **169** |
| Profils encore sans image | **61** |
| Portraits de sélection disponibles | 169 |
| Vues latérales de combat distinctes | **16** |
| Anciennes vues de combat à auditer | 153 |
| Nouvelles animations issues de cette réunion | 0 |
| Fidélités 1:1 certifiées | 0 |

Les six nouveaux profils récupérés sont **Hummer Arcade, Tremer Arcade, Tuberculosis, Mama, Split Worm Arcade et Fighter d’Ascension**. Les dix autres images de combat concernent des profils qui disposaient déjà d’une sélection. Le total 169 réunit les deux anciens totaux 166 : ils comprenaient chacun trois profils différents au-delà du socle commun de 163.

## Fichiers récupérés

Chaque PNG conserve exactement ses octets et son SHA-256 de provenance. Les 202 PNG de sprites présents au commit de départ sont également tous conservés à l’identique.

| Profil | Usage | Fichier | SHA-256 abrégé |
|---|---|---|---|
| Hummer — Arcade | Sélection | [arcade_hummer_arcade.488927e4b09b.png](../../assets/sprites/arcade_hummer_arcade.488927e4b09b.png) | `488927e4b09b` |
| Hummer — Arcade | Combat latéral | [arcade_hummer_arcade.f9d82ebc84a0.png](../../assets/sprites/arcade_hummer_arcade.f9d82ebc84a0.png) | `f9d82ebc84a0` |
| Mama | Sélection | [arcade_mama_117.10d203f5fa42.png](../../assets/sprites/arcade_mama_117.10d203f5fa42.png) | `10d203f5fa42` |
| Mama | Combat latéral | [arcade_mama_117.fcc669873d67.png](../../assets/sprites/arcade_mama_117.fcc669873d67.png) | `fcc669873d67` |
| Robbie the Rabbit — Axe | Combat latéral | [arcade_robbie_the_rabbit_axe.3bd102f8efdf.png](../../assets/sprites/arcade_robbie_the_rabbit_axe.3bd102f8efdf.png) | `3bd102f8efdf` |
| Split Worm — Arcade | Sélection | [arcade_split_worm_arcade.2f1eea0ab83a.png](../../assets/sprites/arcade_split_worm_arcade.2f1eea0ab83a.png) | `2f1eea0ab83a` |
| Split Worm — Arcade | Combat latéral | [arcade_split_worm_arcade.64f373c1ec8a.png](../../assets/sprites/arcade_split_worm_arcade.64f373c1ec8a.png) | `64f373c1ec8a` |
| Tremer — Arcade | Combat latéral | [arcade_tremer_arcade.b02634efb95b.png](../../assets/sprites/arcade_tremer_arcade.b02634efb95b.png) | `b02634efb95b` |
| Tremer — Arcade | Sélection | [arcade_tremer_arcade.f20804673e14.png](../../assets/sprites/arcade_tremer_arcade.f20804673e14.png) | `f20804673e14` |
| Tuberculosis | Sélection | [arcade_tuberculosis.05377508d32c.png](../../assets/sprites/arcade_tuberculosis.05377508d32c.png) | `05377508d32c` |
| Tuberculosis | Combat latéral | [arcade_tuberculosis.f0f6525955eb.png](../../assets/sprites/arcade_tuberculosis.f0f6525955eb.png) | `f0f6525955eb` |
| Fighter | Sélection | [ascension_fighter_179.429d47545e50.png](../../assets/sprites/ascension_fighter_179.429d47545e50.png) | `429d47545e50` |
| Fighter | Combat latéral | [ascension_fighter_179.f4cf31409885.png](../../assets/sprites/ascension_fighter_179.f4cf31409885.png) | `f4cf31409885` |
| Fire Guardian | Combat latéral | [bom_fire_guardian_137.711e8bf0b8c7.png](../../assets/sprites/bom_fire_guardian_137.711e8bf0b8c7.png) | `711e8bf0b8c7` |
| Prisoner Minion — Agile | Combat latéral | [downpour_prisoner_minion_agile_109.713f81af60dc.png](../../assets/sprites/downpour_prisoner_minion_agile_109.713f81af60dc.png) | `713f81af60dc` |
| Prisoner Minion — Brawler | Combat latéral | [downpour_prisoner_minion_brawler_108.a393e8d32549.png](../../assets/sprites/downpour_prisoner_minion_brawler_108.a393e8d32549.png) | `a393e8d32549` |
| Shadow | Combat latéral | [downpour_shadow_107.4a43797eb735.png](../../assets/sprites/downpour_shadow_107.4a43797eb735.png) | `4a43797eb735` |
| Armless Man | Combat latéral | [film_armless_man_170.a103ebba3cce.png](../../assets/sprites/film_armless_man_170.a103ebba3cce.png) | `a103ebba3cce` |
| Red Pyramid Thing — Return to Silent Hill | Combat latéral | [film_red_pyramid_thing_return_to_silent_hill.04809e40872a.png](../../assets/sprites/film_red_pyramid_thing_return_to_silent_hill.04809e40872a.png) | `04809e40872a` |
| Demon | Combat latéral | [origins_demon_084.abac0695168a.png](../../assets/sprites/origins_demon_084.abac0695168a.png) | `abac0695168a` |
| Red Pyramid Thing — Great Knife | Combat latéral | [sh2_red_pyramid_thing_great_knife_029.d21437cdebf4.png](../../assets/sprites/sh2_red_pyramid_thing_great_knife_029.d21437cdebf4.png) | `d21437cdebf4` |
| God | Combat latéral | [sh3_god_050.f6f8f72ed323.png](../../assets/sprites/sh3_god_050.f6f8f72ed323.png) | `f6f8f72ed323` |

## Raccord des registres

La seconde reprise utilisait encore une liste de deux frames : sélection à l’indice 0 et combat à l’indice 1. Le nouveau contrat distingue les usages et interdit qu’une image de sélection figure dans la liste des frames de combat. **Pyramid Head — Great Knife, Fighter, Mama et Split Worm Arcade** sont donc normalisés en un portrait inchangé et une frame de combat dédiée à l’indice 0.

Aucun PNG ni portrait n’est supprimé. Les métadonnées originales complètes des quatre entrées sont conservées dans le [rapport machine](sprite-reconciliation-2026-11-17.json), avec la provenance de sélection. Le changement d’indice de l’idle est un raccord technique, pas une nouvelle animation. Les sprites de sélection ne sont pas utilisés pour le rendu de combat de ces seize profils.

Le lecteur de livraisons reconnaît aussi le journal d’import indépendant des sept PNG. Il rattache chaque image par son identité, son édition, son usage et son empreinte, tout en conservant les exclusions de génération et les anciens blocages. Ce raccord corrige les huit échecs du premier contrôle complet ; le contrôle final réussit sans réécrire les historiques.

Les 165 autres entrées du registre de la première reprise restent identiques. Les anciens journaux, refus, restrictions de rôle, roster, classeur et version 0.9.6 sont conservés. Les rapports des deux passes restent des archives de leurs états respectifs ; leurs totaux 166 et 64 ne représentent plus l’état réunifié.

## Vérifications de la réunion

- Génération du manifeste, couverture et précache : réussie, **169/230**, **16 vues latérales**, **61 profils sans image**.
- Suites Node ciblées initiales : **167 tests réussis**, zéro échec.
- Après raccord du journal d’import indépendant : **45 contrôles ciblés** réussis, puis **`npm test` complet : 1 245 tests réussis**, zéro échec ; build vérifié de **305 fichiers**, dont 42 JavaScript et 10 HTML.
- Import et clips Python : **68 tests réussis**, zéro échec.
- Préservation des images : **22 PNG récupérés + 202 PNG du socle**, empreintes identiques aux sources locales.
- Aucune nouvelle vérification navigateur ni inspection visuelle du moteur n’est revendiquée par ce rapport. Les captures des deux passes sont conservées, et la suite de production pourra contrôler son état final séparément.

Le [rapport JSON](sprite-reconciliation-2026-11-17.json) donne les chemins, dimensions de provenance, empreintes, affectations, métadonnées avant normalisation et la liste exacte des 61 IDs encore sans image à cet instant. Les images demeurent des candidats statiques ; cette récupération ne valide ni UHD native ni fidélité 1:1.
