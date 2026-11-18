# Reprise des sprites — Scraper, Richard et Weeping Bat

Lot du **18 novembre 2026**, repris depuis le commit publié `fd5b6d8969a8dc7f1bdcb92ed07a28a8c1c4abd4` sur la même [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

**Trois nouvelles vues de combat indépendantes sont intégrées et vérifiées.** Le suivi atteint **28 combats latéraux candidats**, avec **172 profils illustrés sur 230** et **58 profils encore sans image**. Ce lot complète les usages de personnages déjà illustrés ; il ne débloque pas de nouveau profil entier. Le [relevé courant](sprite-status-resume-2026-11-18.json) conserve les 58 IDs manquants et tous les arrêts antérieurs.

## Fichiers ajoutés

| Personnage et édition | Pose de combat | PNG indépendant | Dimensions natives |
| --- | --- | --- | --- |
| Scraper — Silent Hill 3 original | Garde basse vers la droite, deux lames courtes entières | [Scraper](../../assets/sprites/sh3_scraper_045.827b9a459105.png) | 1435 × 1096 |
| Richard Braintree, Victim 19 — Silent Hill 4: The Room | Garde suspendue vers la droite, tuyau courbé entier | [Richard](../../assets/sprites/sh4_richard_braintree_victim_19.845daa5b3742.png) | 1160 × 1355 |
| Weeping Bat — Silent Hill: Downpour | Garde bipède vers la droite, deux bras longs et deux jambes | [Weeping Bat](../../assets/sprites/downpour_weeping_bat_105.b30525a06086.png) | 1536 × 1024 |

Les trois sélections antérieures restent identiques. Le moteur dessine les nouvelles poses en duel et les portraits précédents en sélection. Les PNG conservent les octets de génération et leur transparence, sans agrandissement ni retouche des pixels. L’ancrage de Richard maintient volontairement ses chaussures légèrement au-dessus du sol.

| Suivi | Avant ce lot | Après ce lot |
| --- | ---: | ---: |
| Profils illustrés | 172 | **172** |
| Profils sans image | 58 | **58** |
| Combats latéraux candidats distincts | 25 | **28** |
| Vues historiques restant à examiner | 147 | **144** |
| Fichiers PNG de sprites | 236 | **239** |
| Clips animés au total | 1 | **1** |
| Fidélités 1:1 certifiées | 0 | **0** |

Il s’agit de **trois images fixes candidates**, sans nouvelle animation et sans UHD native. Le côté opposé utilise le miroir du moteur et ne constitue pas un second angle documentaire.

## Références et limites artistiques

Les [cinq références natives conservées](references-sprite-resume-2026-11-18/README.md) ont été inspectées avant génération. Chaque image est reliée à sa source, à ses dimensions et à son empreinte dans le [journal d’import](sprite-resume-imports-2026-11-18.json). Le [journal des trois générations](sprite-resume-generation-2026-11-18.json) conserve les prompts, les entrées et les sorties exactes.

Scraper s’appuie sur le [rendu original SH3](https://www.silenthillmemories.net/sh3/arts/pics/sh3_art_creature_08_scraper.jpg), de 709 × 542 px, et sur sa sélection existante. Le sujet conserve sa tête couverte, ses avant-bras rouges, ses vêtements sombres et ses deux lames indépendantes. Sa garde latérale est recomposée depuis un seul angle documentaire ; la vue n’est pas transférée de Missionary.

Richard utilise le [modèle Victim 19](https://www.silenthillmemories.net/sh4/monsters/victim_19.png), de 300 × 350 px, et son portrait antérieur. Sa chemise à carreaux, son tuyau courbé, ses genoux fléchis et ses deux chaussures sont conservés. La pose suspendue et les surfaces non documentées restent candidates.

Les rendus Downpour de Weeping Bat [05](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120422_05_weeping_bat.png), [06](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120422_06_weeping_bat.png) et [07](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120422_07_weeping_bat.png) montrent des angles de face ou de trois quarts. **Aucune vue de dos n’est établie.** Les noms temporaires `side` et `back` retracés dans le prompt ne prouvent pas ces angles ; les copies conservées portent les numéros du modèle. La nouvelle garde est une recomposition latérale. Les surfaces arrière restent non certifiées.

## Trois dossiers sans image réexaminés

La [recherche complémentaire](sprite-resume-reference-research-2026-11-18.json) porte sur les trois dossiers ci-dessous. Elle ne prétend pas couvrir à nouveau les 58 manquants. Aucun de ces dossiers n’a donné lieu à une génération.

| Profil exact | Nouvelle preuve examinée | Limite persistante |
| --- | --- | --- |
| Wanderer — Ascension | Scènes officielles Genvid *Please Come Home* et *The End of Joy* ; huit vues natives de 320 × 180 examinées en détail | Vues trop sombres, détails et appuis encore insuffisants. Attribution nominative secondaire recoupée ; rôle `scripted-encounter` conservé. |
| Missionary — Revelation (2012) | 29 images de la galerie du distributeur Metropolitan et planches natives du making-of officiel Open Road | Aucune nouvelle vue ne fixe les chaussures du costume final. Concepts concurrents, maquette inutilisée et modèle fan restent exclus. |
| Memory of Richard Grady / Sad Daddy — Origins PS2 | Onze échantillons de la nouvelle vidéo de David Link05, dont trois vues du boss à 11:10, 11:30 et 11:50 | Haut du modèle et suspension coupés dans chaque vue du boss. Textures et lumière modifiées par l’auteur ; aucun contour entier validé. |

Les [pièces de recherche conservées](references-missing-resume-2026-11-18/README.md) permettent de reprendre ces dossiers sans confondre une piste trouvée avec une référence suffisante. Les arrêts historiques et récents restent actifs, dont les refus de combat de Patient SH4, Robbie tronçonneuse Arcade et Butcher Origins. Aucun de ces sujets n’a été retenté dans ce lot.

## Validation et préservation

| Contrôle | Résultat |
| --- | --- |
| Gate complet `npm test` | **1252 réussis, 0 échec, sortie 0** |
| Build vérifié | **320 fichiers, 42 JavaScript, 10 HTML** |
| Contrôles du moteur réel avec Canvas natif | **64 réussis, 0 échec** |
| Duels avec inversion des places | **4** |
| Captures de combat finales inspectées | **4 / 4** |
| Portraits rendus et inspectés | **6 / 6** |
| Anciens PNG identiques octet pour octet | **236 / 236** |
| Anciens portraits préservés | **172 / 172** |
| Anciens objets de registre inchangés | **169 / 172**, seuls les trois combats de ce lot changent |
| Nouveaux PNG identiques aux sorties de génération | **3 / 3** |
| Fichiers historiques de production et de provenance préservés | **256 / 256** |

La [validation structurée](validation-sprite-resume-2026-11-18/summary.json) conserve le log du gate et les empreintes du registre et du manifeste. Le lecteur des livraisons reconnaît le nouveau journal par son fichier et son empreinte exacts ; la régression paramétrée correspondante passe. Le [rapport de préservation](sprite-resume-preservation-2026-11-18.json) confirme aussi que le roster et le classeur de production restent inchangés.

La [QA native](qa-sprite-2026-11-18/README.md) exécute les introductions réelles, 120 mises à jour d’attente et la pause. Les armes et les extrémités restent dans le cadre, les combattants regardent leur adversaire, et les portraits de sélection ne sont pas utilisés en duel. L’écart au sol est de **+0,18 px pour Scraper**, **−0,11 px pour Weeping Bat** et **−8,76 px pour Richard**, volontairement suspendu. Aucun recalage supplémentaire n’a été nécessaire. Le rendu de Weeping Bat est transparent en Canvas, sans halo ni rectangle de fond ; des couleurs non visibles peuvent subsister dans les pixels d’alpha nul du PNG original.

Les captures utilisent **Canvas natif**, pas Chromium. Elles ne valident pas les parcours DOM/CSS, les entrées navigateur, le service worker, les attaques complètes ou les timings d’animation. Le nouvel outil `scripts/qa-sprite-candidates-native.mjs` est conservé dans le dépôt pour les reprises suivantes, sans ajout de dépendance au package ou au lockfile.

## Résultat distant précédent et durée du job navigateur

Le [relevé CI de clôture](BROWSER_QA_COMPLETION_2026-11-18.md) confirme que le head précédent passe ses tests Node et importeur. L’assertion de passage du troisième Rite au suivant porte explicitement `passed: true` dans le navigateur distant. Le job navigateur global demeure toutefois **annulé**, après le rapport positif du dernier script.

Son minutage est cohérent avec la limite de trente minutes ; cette cause reste une **inférence**, pas une annotation explicite de GitHub. Le timeout du seul job navigateur est porté à **45 minutes**. Les seize scripts, toutes leurs assertions, les permissions et la conservation des résultats restent identiques. Une nouvelle exécution doit encore confirmer une sortie globale normale.

## Point de reprise

Partir de [sprite-status-resume-2026-11-18.json](sprite-status-resume-2026-11-18.json), puis du registre courant. Conserver les **28 combats latéraux**, les **239 PNG**, tous les portraits et les arrêts documentés. Les **144 vues historiques** exigent toujours une revue individuelle. Le [lot précédent](SPRITE_FOLLOWING_2026-11-17.md) reste inchangé.

Branche : `art/missing-fullbody-20261117` · PR **#6**, ouverte en brouillon · version **0.9.6**.
