# Vague 30 — trois décors fixes et leurs plans de parallaxe

Ce lot contient **trois scènes candidates et six PNG indépendants** pour le [manifeste des décors](../../../../src/stage-bitmap-manifest.js). Chaque scène possède un fond opaque et un élément rapproché transparent. Les images ont été produites avec imagegen intégré, affichées dans la conversation puis importées sans modification de pixels.

Le statut reste `integrated-candidate` et `fidelity: unverified`. Les lieux et éléments observés sont documentés ; la caméra latérale, l’espace du duel et les parties masquées dans les sources sont des adaptations du projet. Aucune géométrie à l’identique n’est certifiée.

**État après reprise, 25 novembre 2026 : 37 contrôles HTTP réussis sur le build `dist`, six plans natifs réellement dessinés et trois captures de combat inspectées séparément.** La [revue visuelle](qa-http-review.md) confirme les appuis, la visibilité des plans et les libellés aux positions de départ ; elle conserve les limites des captures prises à l’annonce « FIGHT », sans certifier les déplacements aux extrémités, la parallaxe dans le temps ou la fidélité 1:1.

## Scènes

| ID conservé | Scène retenue | Plans | Plafond gameplay conservé |
|---|---|---|---|
| `shimizu_residence` | Shimizu Residence **II**, salle à manger du Yellowed Calendar, voie Ending 1 après le souvenir | Fond et coussin proche | Oui |
| `arcade_toluca_lake` | The Arcade, **Stage 3 Area 1**, quai d’entrée du lac | Fond et fragment de pilier | Non |
| `arcade_prison` | The Arcade, corridor de cellules en état **Otherworld** | Fond et jambage proche | Non |

Le quai et la prison appartiennent à The Arcade. Aucune vue de Silent Hill 2 n’a servi à les produire. Shimizu conserve une pièce et une phase précises ; le corridor d’entrée `hinako_home` demeure distinct.

## Sources et adaptations

### Shimizu Residence II

La [capture du Yellowed Calendar](https://www.silenthillmemories.net/shf/walkthrough/pics/11_yellowed_calendar_a.jpg) montre les tatamis à bordures vertes, la table ronde basse, le pot, les bols, les coussins et le siège à dossier quadrillé. Le [guide du chapitre](https://www.silenthillmemories.net/shf/walkthrough_11_shimizu_residence_en.htm) rattache cette vue à Residence II après le souvenir, sur la voie Ending 1. D’autres parcours placent le calendrier ailleurs.

L’ancien libellé du projet Residence I — salle à manger a été réconcilié vers **Residence II** pour cette seule entrée ; le corridor de Residence I ne change pas de phase. La vue frontale, les panneaux, la largeur de tatami, la place des meubles et l’interprétation radio/TV restent une reconstruction versus. Ni Hinako, ni ses parents, ni souvenir rejoué, ni date lisible ne sont inclus.

### Toluca Lake

La [capture Konami Europe n°08](https://www.silenthillmemories.net/sh_arcade/screens/pics/sh_arcade_20100221_08.jpg) porte le carton **STAGE 3 AREA 1 / Toluca Lake**. On y observe des piliers gris, couvre-murs, garde-corps sombre, réverbère à globe et brouillard pâle. La [galerie d’archive](https://www.silenthillmemories.net/sh_arcade/screens_en.htm) attribue la série au matériel Konami Europe du 21 février 2010 ; l’hébergement Silent Hill Memories est non officiel.

Les personnages masquent une partie de la vue originale. Le dallage, la répétition des piliers, le nombre de lampes et la largeur du passage sont reconstruits. Aucun navire, élément de la séquence 1918/1993 ou mouvement de mer n’est ajouté. Le brouillard appartient au fond fixe.

### Toluca Prison

La [capture n°05](https://www.silenthillmemories.net/sh_arcade/screens/pics/sh_arcade_20100221_05.jpg) montre des portes à barreaux et un corridor rouge/turquoise. Son rattachement à la prison recoupe le [catalogue des stages](https://www.silenthillmemories.net/sh_arcade/stages_en.htm) et la [carte commentée de Stage 2-2](https://www.speedrun.com/shac/guides/v3x3b), qui décrit une branche Otherworld. **Le point exact du parcours n’est pas certifié** : la capture n’affiche pas elle-même de carton de stage.

La façade de trois portes, leur entraxe, le plafond et l’aire dégagée sont des adaptations de la vue oblique partiellement masquée. Aucun élément de la cour SH2, de la salle du Split Worm ou d’une salle d’exécution n’est transposé.

L’état est fixe, sans nouvelle condition de branche ni transition. Le plafond peint ne donne aucun nouvel appui : `geometry.ceiling` reste **false**, comme le contrat antérieur déduit des motifs cells/chains/watchtower/bars/lights.

## Import

| Propriété | Valeur |
|---|---|
| Fichiers | Six PNG, un par plan |
| Dimensions natives | 1672 × 941 |
| Formats | Trois RGB opaques et trois RGBA avec alpha réel |
| Poids total | 7 650 389 octets |
| Rectangle | `[0, 0, 1, 1]`, `fit: cover` |
| Parallaxe | Fond `0` ; proche `0.006` |
| Horloge | Un frame, `ticksPerFrame: 1`, `loop: false` |
| Provenance | `conversation-image-generation` |
| Mode | `replace` |

Les noms suivent `assets/stages/<stageId>.vague30.<plan>.<sha12>.png`, conformément au validateur. Les pixels sont ceux des sorties imagegen, sans recadrage, redimensionnement, recoloration ou création d’alpha après génération.

Quelques pixels natifs d’alpha égal à 1 subsistent hors de l’objet proche. Ils sont conservés ; le reçu fournit les pixels transparents et les limites à alpha ≥ 2 qui ont été mesurés. Les objets significatifs restent aux bords. Le lot ne change ni les collisions, ni le sol physique, ni les attaques, ni les événements ou dangers autorisés. Les trois contrats de plafond restent respectivement true, false et false.

## Preuves et reprise après interruption

- [generation-prompts.json](generation-prompts.json) : six prompts complets et sorties d’origine.
- [sources.json](sources.json) : provenance, observations, limites et hashes des trois captures natives récupérées à l’octet depuis le cache restauré.
- [integration-delivery.json](integration-delivery.json) : fichiers, SHA-256, dimensions, poids, informations d’alpha et SHA des blobs Git.
- [validation.json](validation.json) : historique des contrôles et preuve HTTP ajoutée après reprise.
- [qa-http-review.md](qa-http-review.md) : inspection séparée des trois captures, provenance CI et limites de portée.
- [SELECTION_ET_DIFFERES.md](SELECTION_ET_DIFFERES.md) : raisons des cibles reportées.

Avant l’indisponibilité de l’executor, les six PNG ont passé `auditStageBitmaps`, les trois scènes étaient sélectionnées et les **90 anciennes entrées** du manifeste étaient strictement inchangées. La reconstruction depuis la baseline Git a confirmé une seconde fois leur conservation. Le manifeste préparé comporte 93 entrées pour 123 IDs d’arènes.

À la coupure, les raccords de phase définitifs, la compilation complète et la QA HTTP restaient à effectuer. **Aucune capture Chromium de ce lot n’avait été produite avant cette panne ; aucune capture antérieure à la panne n’est revendiquée comme récupérée.** Les PNG générés ont été sauvegardés sous forme de blobs Git immuables depuis les données exactes conservées en session.

Après reprise, les scènes et leurs phases ont été réconciliées, puis la CI a exécuté le wrapper sur le build `dist`. Le [rapport original](../qa-http/http-wave30-stages/report.json) et le [résumé vague 30](../qa-http/http-wave30-stages/wave30-summary.json) consignent **37 contrôles réussis, trois arènes et zéro erreur navigateur**. Les trois nouvelles captures ont été récupérées, vérifiées à l’octet et relues ; elles constituent une preuve postérieure à la panne. Le commit source du run est `a1f434ea1d53eb933879442b05f1971c767c197f` ; la revue distingue ce commit du module de références régénéré avant la QA et conserve les empreintes réellement testées.

## Captures de référence conservées

Les trois fichiers ci-dessous sont les images inspectées avant génération. Ils ont été copiés à l’octet depuis le cache restauré, sans conversion ni modification de pixels ; leurs URL d’origine, dimensions, poids et SHA-256 figurent dans [sources.json](sources.json).

- [Shimizu Residence II — Yellowed Calendar](references/11_yellowed_calendar_a.jpg).
- [The Arcade — Toluca Lake, Stage 3 Area 1](references/sh_arcade_20100221_08.jpg).
- [The Arcade — corridor de cellules rouge/cyan](references/sh_arcade_20100221_05.jpg).

Ces captures sources restent distinctes des preuves de lancement HTTP du jeu de combat. Leur présence ne vaut pas validation du rendu final ni certification géométrique.

## QA ciblée et résultat HTTP

Le [test des trois scènes](../../../../tests/stage-wave30.test.mjs) contrôle les sélecteurs de pièces, les phases fixes, la conservation des plafonds, l’absence de nouveaux dangers et les six fichiers natifs exacts :

```sh
node --test tests/stage-wave30.test.mjs
```

Après une construction fraîche de `dist`, le [wrapper HTTP](qa-http-stages.mjs) vérifie d’abord que les modules de `dist` correspondent aux sources puis appelle le harness existant :

```sh
node docs/production/vague30/stages/qa-http-stages.mjs
```

Il transmet exactement `--stages=shimizu_residence,arcade_toluca_lake,arcade_prison --build=dist --out=tests/http-wave30-stages --port=4292` à `docs/production/vague28/qa-http-stages.mjs`. Le dossier de preuves doit être neuf. Le harness lance réellement chaque combat par l’interface, vérifie les requêtes des PNG et produit trois captures.

Le rapport original du harness conserve sa valeur historique `wave: 28`. Le wrapper ne la réécrit pas : il produit un `wave30-summary.json` séparé après succès et contrôle les hashes des trois captures. Ces nouveaux scripts avaient seulement été relus et analysés avant la panne ; **ils n’avaient pas été exécutés dans la session interrompue**. La preuve CI postérieure est désormais disponible dans les rapports liés ci-dessus et dans `postRecoveryHttpValidation` de [validation.json](validation.json).

Un deuxième plan fixe ne compte pas comme une animation, une nouvelle arène ou une pose de combattant. Aucune fidélité 1:1, cadence de combat ni mise à jour hors ligne du service worker n’est certifiée par ce lot.
