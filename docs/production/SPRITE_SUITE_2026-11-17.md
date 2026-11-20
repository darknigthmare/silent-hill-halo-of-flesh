# Suite des sprites — Steel Guardian, Anne et Juggernaut

Reprise du **17 novembre 2026**, depuis le commit `dfd9c7f3d0b082dc0794e9f502246ffb630269da`.

**171 profils illustrés sur 230, 59 encore sans image, 22 poses de combat latérales distinctes.** Ce lot ajoute quatre PNG : un personnage auparavant absent avec sa sélection et son combat séparés, plus deux nouvelles poses de combat pour des personnages déjà illustrés. Le [relevé courant](sprite-status-suite-2026-11-17.json) contient les 59 IDs manquants exacts ; les rapports précédents restent des photographies de leurs étapes.

## Quatre nouveaux fichiers indépendants

| Personnage et édition | Usage | Fichier | Dimensions natives |
|---|---|---|---|
| Anne Cunningham — Downpour | Combat latéral droit | [PNG](../../assets/sprites/downpour_anne_cunningham.23e6f56e2c49.png) | 1024 × 1536 |
| Prisoner Juggernaut — Downpour | Combat latéral droit | [PNG](../../assets/sprites/downpour_prisoner_juggernaut_110.08ce5a51a4d6.png) | 1239 × 1269 |
| Steel Guardian — Book of Memories | Sélection entière | [PNG](../../assets/sprites/bom_steel_guardian_146.34f6a40e4729.png) | 1774 × 887 |
| Steel Guardian — Book of Memories | Combat latéral droit | [PNG](../../assets/sprites/bom_steel_guardian_146.221d68a36f7a.png) | 1536 × 1024 |

Les portraits précédents d’Anne et du Juggernaut sont conservés à l’identique. Steel Guardian possède deux images indépendantes ; son clip de combat sélectionne exclusivement la vue latérale. Chaque image garde les octets et l’alpha de la sortie originale, sans agrandissement ni retouche des pixels.

**Il s’agit de poses fixes candidates.** Aucune nouvelle animation ni fidélité 1:1 n’est certifiée. Les dimensions ci-dessus sont les dimensions réelles, inférieures à l’UHD native. La direction gauche est le miroir de rendu du moteur ; elle n’est pas une vue indépendante de l’autre côté du modèle source.

## Steel Guardian : ce qui débloque le dossier

Le [modèle texturé de John Hershberg](https://www.silenthillmemories.net/sh_book_of_memories/arts/pics/sh_bom_art_20160221_hershberg_14_steel_boss.jpg) montre le corps, les griffes, les chaînes et la structure des ailes, mais coupe leurs extrémités latérales. Deux vues natives complémentaires du [longplay Book of Memories](https://www.youtube.com/watch?v=ruh4O2ZO7aA), à **14:18:10** et **14:18:30**, documentent séparément les extrémités manquantes. Le dossier du [créateur du modèle](https://bigjohn.artstation.com/projects/bPZno) identifie le boss du monde Steel.

Les deux vignettes vidéo font seulement **160 × 90 px**. Aucune ne montre seule toute la silhouette sans occultation. Leur complémentarité permet un candidat ailé entier ; elle ne certifie pas le nombre précis de lames, chaque maillon, les zones masquées ni les surfaces arrière. La pose latérale est recomposée. La sculpture grise sans ailes n’a pas servi à inventer une phase de jeu sans ailes.

Anne et le Juggernaut s’appuient sur leurs rendus originaux Downpour ([Anne](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120317_03_anne.png), [Juggernaut](https://www.silenthillmemories.net/sh8/arts/pics/sh_downpour_art_120422_13_pr_juggernaut.png)) et sur leurs sélections existantes. Tenues, équipements et édition restent attachés à leurs IDs exacts ; la pose de garde est nouvelle.

Les [imports avec empreintes](sprite-suite-imports-2026-11-17.json), [prompts et résultats](sprite-suite-generation-2026-11-17.json) et [recherches complémentaires](sprite-suite-reference-research-2026-11-17.json) gardent les sources et les réserves.

## Refus et dossiers restants

La génération du combat du **Butcher — Origins** a été refusée au stade `output`, catégorie `violence`, requête `ea87a46c-f8bb-4109-b400-474ab1ba8190` : **un appel, zéro image, aucun réessai**. Son entrée complète et son PNG existant sont inchangés. Ce refus nouveau ne réécrit pas les refus historiques. Le refus antérieur du combat de Robbie — tronçonneuse est également conservé, sans nouvel appel ; le relevé courant garde les deux arrêts de combat et renvoie aux dossiers précédents.

L’[audit initial des 60 dossiers](sprite-suite-reference-audit-2026-11-17.json) a été joint au ledger le plus récent, qui conserve notamment le refus ultérieur de Numb Body Arcade. Steel Guardian quitte ensuite la liste des manquants. Les 59 restants comprennent 26 arrêts ou refus hérités, 3 refus outils déjà documentés, 21 références incomplètes, 7 identités ou variantes non résolues et 2 formes immatérielles. Ce classement réconcilie les statuts ; il ne prétend pas qu’une nouvelle recherche indépendante a été faite sur les 59 sujets.

Les nouvelles vues de Wheelman laissent ses câbles inférieurs hors cadre. Les chaussures du costume final de Missionary Revelation, les branches hautes de Wood Guardian, la pose native des mèches de Phantom et le corps entier de Snarler restent insuffisamment établis. Aucun de ces dossiers n’est compté comme livré.

## Validation et préservation

| Contrôle | Résultat |
|---|---|
| `npm test` final | **1247 réussis, 0 échec** |
| Build vérifié | **313 fichiers, 42 JavaScript, 10 HTML** |
| Contrôles du moteur réel avec Canvas natif | **78 réussis, 0 échec** |
| Duels avec inversion des places | **4** |
| Rendus de sélection | **8** |
| Captures inspectées | **4 duels finaux + 2 portraits Steel** |
| PNG antérieurs préservés octet pour octet | **228 / 228** |
| Anciens portraits préservés | **170 / 170** |
| Anciens objets de registre inchangés | **168 / 170** ; seuls les combats d’Anne et du Juggernaut changent |
| Nouveaux PNG identiques aux originaux générés | **4 / 4** |
| `git diff --check` | **Conforme** |

La [QA visuelle](qa-sprite-suite-2026-11-17/README.md) exécute le vrai `FightEngine`, les introductions puis 120 ticks d’attente. Les personnages sont orientés l’un vers l’autre ; les images de sélection ne sont jamais dessinées en combat. Anne et le Juggernaut restent à moins de 2 px de la ligne de sol. Steel garde ses ailes et chaînes entières, avec **28,68 px de marge extérieure** et ses griffes **4,36 px au-dessus du sol** pour sa posture suspendue.

Ces rendus sont **natifs, pas des captures de navigateur**. Ils ne valident pas DOM, CSS, entrées navigateur, service worker, attaques complètes ou timings d’animation. Le [rapport de préservation](sprite-suite-preservation-2026-11-17.json) compare aussi le classeur, les anciens ledgers, les fragments et provenances : **311 fichiers antérieurs identiques**.

Le [diagnostic navigateur](BROWSER_QA_TIMEOUT_2026-11-17.md) conserve le précédent run annulé après 12 suites sur 16 et 977 contrôles réussis. La seule modification du job est son délai de 12 à 30 minutes. Aucun test n’est retiré. Le nouveau statut distant reste à consulter dans la PR ; le run antérieur n’est pas requalifié en validation complète.

## Reprise suivante

Utiliser `sprite-status-suite-2026-11-17.json` puis le registre courant. Conserver les **22 combats latéraux** et les quatre fichiers de ce lot ; **149 vues historiques** restent à examiner individuellement avant de leur attribuer ce statut. Ne pas régénérer les sorties livrées ni les sujets refusés.

Branche : `art/missing-fullbody-20261117` · [PR #6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6) · version du jeu **0.9.6**.
