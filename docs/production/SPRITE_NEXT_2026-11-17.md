# Suite des sprites manquants — 17 novembre 2026

**État courant : 170 profils illustrés sur 230 ; 60 sans image ; 19 profils avec une image de combat latérale distincte de leur sélection.** Le [relevé machine](sprite-status-next-2026-11-17.json) est le point de reprise de ce lot. Les rapports plus anciens conservent leurs chiffres historiques.

Cette continuation réunit **22 PNG déjà créés mais dispersés dans deux reprises locales**, puis produit et intègre **4 nouveaux PNG**. Aucun de ces 22 originaux n’a été régénéré.

## Les quatre nouveaux PNG

| Profil exact | Usage | Fichier | Dimensions natives |
|---|---|---|---|
| Double Head — The Arcade | Sélection entière | [PNG](../../assets/sprites/arcade_double_head_arcade.ec8280e04d4f.png) | 1536 × 1024 |
| Double Head — The Arcade | Combat latéral droit | [PNG](../../assets/sprites/arcade_double_head_arcade.43246b06e708.png) | 1774 × 887 |
| Eddie Dombrowski — SH2 original | Combat latéral droit | [PNG](../../assets/sprites/sh2_eddie_dombrowski_032.31e07d7ed871.png) | 1024 × 1536 |
| Missionary — SH3 | Combat latéral droit | [PNG](../../assets/sprites/sh3_missionary_047.820d3acca65f.png) | 1436 × 1096 |

Eddie et Missionary conservent exactement leurs portraits précédents. Double Head possède deux images indépendantes ; seul son second PNG est exécuté par le clip de combat. Les quatre fichiers conservent les octets et l’alpha des sorties originales.

Les images sont **des poses fixes candidates**, sans nouveau cycle animé ni fidélité 1:1 certifiée. Leurs dimensions réelles sont indiquées ci-dessus ; elles ne constituent pas de l’UHD native. Le retournement gauche/droite est réalisé par le moteur, sans prétendre disposer d’une nouvelle vue source du côté opposé.

## Références et limites

- **Double Head Arcade :** [capture attribuée à The Arcade](https://retrocatalog.com/games/silent-hill-the-arcade), [image IGDB sc8983](https://images.igdb.com/igdb/image/upload/t_1080p/sc8983.jpg). La capture présente les corps entiers, les quatre pattes, les queues et les bandages. La vue latérale, le dessous et les détails cachés restent des reconstructions ; aucune variante SH3 ou Book of Memories n’est substituée.
- **Eddie original :** [illustration de personnage SH2](https://www.silenthillmemories.net/sh2/arts/pics/sh2_art_character_06_eddie.jpg), [vue du combat](https://www.silenthillmemories.net/sh2/walkthrough/sh2_w10_boss_4a_eddie.jpg) et sélection existante. Pose de garde recomposée, costume et revolver conservés.
- **Missionary SH3 :** [modèle original](https://www.silenthillmemories.net/sh3/arts/pics/sh3_art_creature_12_missionary.jpg) et sélection existante. Le modèle source est peu défini ; les détails fins des armes et du revêtement ne sont pas certifiés.

Les références originales servent à la revue et ne sont pas ajoutées comme textures de jeu. Les [prompts et résultats](sprite-next-generation-2026-11-17.json), [imports avec empreintes et sources](sprite-next-imports-2026-11-17.json) et [recherches complémentaires](sprite-next-reference-research-2026-11-17.json) sont conservés.

### Robbie — tronçonneuse

L’appel de génération de sa nouvelle pose de combat a été refusé au stade **output**, catégorie **other**, requête `333364f3-aefb-4947-a66d-2c18ed7ca72d`. Un seul appel, aucune image livrée, aucun réessai. Sa sélection existante est conservée. Ce refus est distinct des refus historiques, qui ne sont pas réinterprétés comme des appels de ce lot.

## Récupération des deux reprises

Le [rapport de réconciliation](SPRITE_RECONCILIATION_2026-11-17.md) détaille les 22 originaux récupérés : Hummer, Tremer, Tuberculosis, Mama, Split Worm Arcade, Fighter d’Ascension, Pyramid Head Great Knife et les neuf premiers ajouts de combat.

La réunion donne 169 profils et 16 vues latérales distinctes ; le nouveau lot passe ensuite à 170 et 19. Les 224 PNG présents après cette réunion sont inchangés, octet pour octet. Les 167 profils non concernés par les nouvelles vues d’Eddie et de Missionary gardent leurs entrées de registre identiques.

Le lecteur de suivi accepte les deux journaux d’import explicitement nommés et rattache les sorties par ID, édition, usage et SHA-256. Il conserve les blocages archivés et les exclusions de génération. Le classeur de production, les IDs du roster et les règles de combat sont préservés.

## Vérification finale

| Contrôle | Résultat |
|---|---|
| `npm test`, état 170 / 19 | **1246 réussis, 0 échec** |
| Build vérifié | **309 fichiers, 42 JavaScript, 10 HTML** |
| Import/clips Python, récupération | **68 réussis** |
| Contrôles natifs du moteur + HTTP | **175 réussis, 0 échec** |
| Portraits rendus | **18** |
| Duels réels avec inversion des places | **10** |
| Captures finales inspectées | **10** |
| Préservation des 224 PNG précédents | **Conforme** |
| `git diff --check` | **Conforme** |

Les [preuves visuelles et rapports](qa-sprite-next-2026-11-17/README.md) exécutent le vrai `FightEngine`, ses introductions puis 120 ticks d’attente, avec un canevas natif. Les images de sélection ne sont jamais utilisées comme sprites pendant ces duels. La transparence, les silhouettes complètes, les armes, l’orientation et la pause sont contrôlées. Les écarts au sol du nouveau lot restent inférieurs à 2,1 pixels à 1280 × 720.

**Ce ne sont pas des captures d’une session navigateur.** Le blocage Chromium précédemment documenté n’a pas été retenté ; DOM, CSS, entrées navigateur, service worker et rendu web ne sont pas validés par ce protocole. Les attaques et animations complètes ne sont pas certifiées par les essais d’attente.

## Prochaine reprise

1. Lire `sprite-status-next-2026-11-17.json`, puis le registre courant. Les **60 IDs sans image** y sont listés exactement.
2. Conserver les **19 vues latérales déjà produites**. Les **151 vues historiques** restent à auditer individuellement avant de leur attribuer un statut de combat latéral.
3. Consulter les pistes documentées pour Phantom Arcade, Snarler, Collector, Steel Guardian et Wheelman. Les nouvelles recherches ne lèvent pas encore leurs lacunes de référence.
4. Ne pas recommencer les images récupérées ni les sujets refusés. Les 60 dossiers n’ont pas tous été réexaminés pendant ce lot.

Branche de continuation : `art/missing-fullbody-20261117`, [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6). Version du jeu : **0.9.6**.
