# Vague 22 — personnages et stages manquants

État du 19 novembre 2026. Base de comparaison : `80db2a9fdda7032bcaf110df79915be598290f08`, sur la PR [#6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

**16 vues latérales dédiées et 10 stages auparavant sans bitmap sont intégrés, soit 36 nouveaux PNG actifs.** Le catalogue atteint **151 vues latérales candidates et 65 arènes bitmap sur 123**. Les profils existaient déjà dans le moteur : cette passe complète leur image latérale. Elle n’ajoute aucun profil, portrait de sélection ou clip animé.

La demande de fidélité est traitée par édition, silhouette, équipement, sous-lieu et phase documentés. Les PNG restent des reconstructions candidates avec `fidelity: unverified`. Les références partielles, la nouvelle caméra de combat, les côtés cachés et le miroir empêchent de les présenter comme une reproduction 1:1 certifiée.

## Personnages livrés

| Œuvre et édition | Vues ajoutées | Usage conservé |
| --- | --- | --- |
| Silent Hill, original 1999 | Grey Child | Combat, modèle Grey Child ; aucune substitution par Mumbler |
| Silent Hill 2, original 2001 | Twin Pyramid Heads | Un profil collectif, deux corps et deux lances dans un PNG |
| Silent Hill 4: The Room | Bottom ; One Truth | Bottom mobile ; One Truth attaché à son propre cadre et stationnaire |
| Silent Hill: Origins | Memory of Helen Grady | Boss stationnaire, voile et dispositif conservés |
| Silent Hill: Homecoming | Sepulcher ; Asphyxia | Sepulcher stationnaire ; corps composé d’Asphyxia entier |
| Silent Hill: Shattered Memories, Wii | Raw Shock Feminine ; Abstract ; Atrophied | Trois références de poursuite, hors duel |
| Silent Hill: Book of Memories | Light Guardian ; Water Guardian ; Earth Guardian ; Air Screamer ; Insane Cancer | Cinq vues propres à cette édition |
| Silent Hill: The Short Message | Sakura Head | Référence du poursuivant, hors duel |

Cela représente **12 vues pour des profils déjà admissibles au combat et 4 vues d’atelier hors duel**. Le classement des 151 candidats dans le registre d’images inclut ces références ; il ne signifie pas 151 nouveaux combattants jouables. Les nouvelles images deviennent la frame idle statique dédiée ; leur portrait antérieur reste celui de la sélection. Les autres poses et les définitions des clips existants sont conservées.

Le cas Twin Pyramid Heads est explicite : deux sujets visuels, un seul profil moteur collectif préexistant. Le manifeste source conserve `singleSubjectReviewed: false`, `singleCollectiveProfileReviewed: true` et `subjectCount: 2`. L’exception de l’adaptateur est limitée à cet identifiant, à sa source SH2 et à sa composition `canonical-encounter-duo` préexistante. La conformité à l’édition vient des références et de la revue manuelle ; aucun acteur autonome supplémentaire n’est créé. Le registre conserve sa convention technique de revue par profil (`singleSubjectReviewed: true`) ; ses notes et le reçu d’import précisent les deux corps réellement revus.

Les trois Raw Shock reprennent les morphologies commerciales Wii. Leurs anciens portraits de concepts restent des documents distincts. L’écart est consigné et les paramètres du prototype restent identiques. Le petit gabarit d’Atrophied dans l’atelier résulte de la présentation existante ; il ne mesure pas sa hauteur canonique.

Sources, prompts, variantes, dimensions, SHA et limites par image : [groupe A](characters-a/delivery-final.json), [groupe B](characters-b/delivery-final.json). Les [décisions A](characters-a/selection-decisions.json) et les [reports B](characters-b/deferred-targets.json) conservent les cibles écartées. Les fichiers `evidence-copy.json` rattachent les chemins d’origine aux copies conservées dans ce dossier.

## Stages livrés

Chaque lieu reçoit **deux PNG natifs indépendants de 1672×941 pixels** : fond opaque et premier plan transparent. Le décalage horizontal existant les met en parallaxe. Cela reste deux plans fixes, sans nouveau cycle animé, danger, transformation ou collision.

| Identifiant du catalogue | Sous-lieu et phase effectivement représentés |
| --- | --- |
| `hazel_subway` | SH3 original, Hazel Street normal : alcôve du hall avec quatre distributeurs, avant les quais ; aucune rame ni voie SH4. |
| `underpass_sh3` | SH3 original, Underpass normal : salle supérieure de la carte et du casier renversé, avant le canal de Sewers. |
| `nightmare_hilltop` | SH3 original, Hilltop Center Otherworld : galerie d'art 5F, mur Flame Purifies All avant combustion du tableau. |
| `outside_room_302` | SH4 original : dernier parcours Outside Room302, couloir altéré1F devant la porte105 du superintendent encore chaînée ; pas le premier Apartment World. |
| `alchemilla_origins` | Silent Hill Origins2007 : palier de l’ascenseur au1F normal, rencontre de Kaufmann avant la montée au2F ; aucune chambre205 ni salle d’une autre édition. |
| `nightmare_hospital_hc` | Homecoming2008 : couloir clinique2F du rêve initial devant la grille2A et son clavier, AVANT le miroir et la transformation ; pas l’ascenseur final. |
| `villa` | The Short Message PS5, chapitre1 normal : couloir devant la porte214 de Maya, avant entrée dans son atelier et avant la deuxième poursuite. |
| `nowhere` | SH1 original1999, Nowhere : Generator Room derrière la porte Bethor, courant encore présent avant la coupure nécessaire à la clé électrifiée. |
| `central_nightmare` | SH1 original1999, Central Silent Hill Otherworld : toit du combat Floatstinger, sans la galerie/sablière de Twinfeeler. |
| `nightmare_hospital_sm` | Silent Hill: Shattered Memories, version PSP US 2010 uniquement : chambre ER d’Alchemilla, Nightmare 4, pendant le puzzle radio et avant le dégel de la porte de sortie. |

Les sous-lieux sont volontairement précis. Par exemple, Nowhere montre la salle du générateur derrière Bethor avant la coupure du courant ; Central Nightmare montre le toit du combat Floatstinger. Ces vues ne prétendent pas réunir tout Nowhere ou toute la ville. Le cauchemar initial de Homecoming conserve sa présentation clinique avant le miroir, conformément à la phase existante du moteur.

Les perspectives et la largeur de scène sont adaptées au versus. Les petits retours de mur du premier plan sont des adaptations de caméra déclarées ; ils ne prouvent pas une géométrie nouvelle. Les sources, prompts et traces des sorties rejetées sont dans le [dossier des stages](stages/). Les guides complets, pages HTML de recherche et le premier brouillon de Nowhere ne sont pas incorporés au livrable ; seules les références utiles et leurs empreintes sont conservées.

## Fidélité et corrections réellement effectuées

Les sorties retenues conservent leurs octets natifs. Les corrections d’images ont été réalisées dans imagegen ; aucune retouche de pixels, suppression de fond par script, mise à l’échelle du PNG actif ou interpolation vers une résolution annoncée supérieure n’a été appliquée.

La revue a notamment corrigé le voile trop opaque d’Helen, les espaces fermés entre les segments d’Abstract, des détails des Guardians et une petite trappe non attestée dans Nowhere. Les variantes écartées restent identifiables et ne sont pas actives. L’alpha réel a été vérifié sur des compositions de contrôle puis dans le rendu du moteur.

Les quatre mains et la bordure de One Truth sont entières. Le duo montre ses deux casques, quatre bottes et deux lances. Certaines marges restent inférieures aux 8 % demandés dans les prompts : 28 pixels au seuil alpha 32 pour le duo, 26 pour One Truth. Aucune extrémité n’est coupée dans les captures retenues, mais cette limite n’est pas masquée par une validation automatique.

La profondeur du duo, le cadre arrière de One Truth, certains petits détails et les côtés cachés restent reconstruits depuis des vues partielles. Les vues de gauche utilisent le miroir existant. Les ancrages servent à la présentation ; ils ne changent ni les hitboxes ni une mesure de taille canonique.

## Vérifications

| Vérification | Résultat observé |
| --- | --- |
| Suite du projet `npm test` | 1292 tests Node, 0 échec ; génération et vérification du build terminées avec code 0 |
| Importeur raster Python | 115 tests, code de sortie 0 |
| Rendu natif et commandes | 26 processus réussis, 1402 exécutions d’assertions, 106 captures conservées |
| Couverture native des profils | 24 cas de duel pour les 12 profils admissibles, 8 aperçus d’atelier pour les 4 références hors duel |
| Couverture native des décors | 10 stages observés avec leurs deux plans et leur parallaxe |
| Préservation | 328 contrôles ; 230 définitions, 204 portraits, clips et anciens PNG préservés |
| Mémoire | 14 365 paires illustrées admissibles ; aucune régression, budgets indépendants de 64 Mio conservés |
| Classeur Corpus / Stages | Deux tables, sept formules ; recalcul après modification puis restauration, export relu et aperçus inspectés |

Les contrôles natifs utilisent le véritable `FightEngine` et Canvas, avec entrée normale en combat, commande de déplacement autorisé ou rejet du déplacement des profils stationnaires, puis retour à l’idle. Les deux orientations sont observées. Les profils hors duel sont rendus uniquement dans l’atelier. Les dangers et changements de terrain sont neutralisés pour isoler l’art ; le libellé de terrain du HUD n’est pas une certification du matériau dessiné.

Les captures ne testent pas la matrice complète d’attaques, contacts, gardes, finishers ou timings originaux. Le navigateur local a échoué avant le chargement d’une page à cause d’une restriction de socket ; aucun succès Chromium, HTTP, DOM/CSS ou service worker local n’est revendiqué. Les exécutions distantes doivent être lues sur le commit exact de la PR. Les succès de la base `80db2a9` sont archivés séparément et ne valent pas validation de cette passe.

Une première tentative Grey Child a rencontré le manifeste précédent parce que sa génération n’était pas terminée. Elle s’est arrêtée avant tout rendu ; sa trace est conservée dans `qa-native/attempts`. Le manifeste terminé a ensuite été utilisé pour le cas réussi. Cette tentative n’entre pas dans les totaux de succès.

Le premier lancement de `npm test` s’est arrêté avant les tests Node : la copie partielle du dépôt omettait le dossier `modules/`. Les modules et les fixtures historiques de `docs/production/batches/` ont été restaurés depuis le même commit. Cette tentative est archivée dans `validation/attempts/partial-checkout-no-modules`.

La première exécution complète a ensuite exposé deux besoins de suivi : le validateur historique ART92 ne pouvait pas encore relier les nouveaux idles au portrait préservé, et un test procédural utilisait désormais le bitmap d’Alchemilla. Le [journal d’import de la vague 22](../sprite-wave22-imports-2026-11-19.json) fournit la preuve attendue par le contrat existant, sans modifier le validateur ou les anciens journaux. Le test de politique des stages isole désormais le rendu procédural et vérifie séparément les deux plans réels du palier normal. Le moteur et ses règles restent identiques. Les neuf échecs de cette première exécution (1 263 tests enregistrés, dont 1 254 réussis) sont archivés et exclus des résultats finaux ; seuls les résultats de la relance réussie figurent dans le tableau. Les contrôles ciblés des deux corrections restent dans `validation/continuation-fix` et `validation/stage-fixture-fix`.

Preuves : [résultats des suites](validation/gates.json), [audit de préservation et mémoire](final-audit.json), [agrégation native](qa-native/report.json), [revue visuelle A complète](characters-a/native-visual-review-final.json), [revue B](characters-b/native-visual-review.json), [vérification du classeur](workbook/workbook-verification.json).

## Bible et absences restantes

La [bible du corpus](../../BIBLE_CORPUS_SILENT_HILL.md) et son [registre JSON](../franchise-corpus.json) conservent leurs **66 notices**, comprenant Silent Hill Transmission, les éditions et récits dérivés déjà ajoutés. Transmission reste un programme officiel documenté ; son inclusion n’invente pas un stage ou un personnage autonome.

Le [classeur Corpus / Stages](../SILENT_HILL_CORPUS_BIBLE.xlsx) est actualisé sur les 65 arènes actives. L’export précédent est archivé dans `baseline/`. Le grand classeur historique des movesets et animations demeure inchangé ; ses états antérieurs gardent leur date et ne sont pas présentés comme le compteur courant.

| Compteur courant | Avant | Après |
| --- | ---: | ---: |
| Portraits disponibles | 204 | 204 |
| Vues latérales candidates, atelier compris | 135 | 151 |
| Anciennes vues encore à revoir | 58 | 42 |
| Images de combat réellement absentes | 37 | 37 |
| Portraits absents | 26 | 26 |
| Clips réellement animés | 6 | 6 |
| Stages bitmap actifs | 55 | 65 |
| Stages sans bitmap | 68 | 58 |
| Fidélités 1:1 certifiées | 0 | 0 |

Parmi les 58 stages sans bitmap, **43 ont une référence ouverte et 15 une référence bloquée**. Une fiche ouverte ne signifie pas que toutes les vues nécessaires à sa reconstruction ont été trouvées. Les reports motivés par une mauvaise phase, un angle trop partiel ou une identité incertaine restent visibles.

Les 26 portraits absents et les 37 images de combat absentes ne sont pas déclarés résolus : les nouvelles vues remplaçaient des images encore partagées entre sélection et présentation latérale. Les refus antérieurs ne sont pas relancés sous une autre identité. Le relevé détaillé des absences et des 42 vues anciennes reste dans [l’audit final](final-audit.json) et [la couverture du registre](../../../data/sprite-coverage.json).
