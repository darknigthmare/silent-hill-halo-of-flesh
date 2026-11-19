# Vague 18 — animations, deux vues de films et deux décors

Cette reprise du 19 novembre 2026 récupère la production locale postérieure au
commit `167abf6` de la PR #6. Elle ajoute **13 PNG actifs** et conserve **7 variantes**
non sélectionnées. Les **204 portraits antérieurs restent identiques**.

## Livraison

| Ensemble | Fichiers actifs nouveaux | Utilisation |
| --- | ---: | --- |
| Scraper, The Arcade | 3 | Deux dessins de marche et une garde, en complément de l'idle existant. |
| Scarlet, forme poupée de Homecoming | 2 | Deux dessins pour son cycle de marche debout. |
| Faceless Nurse, Origins | 2 | Préparation et contact de l'attaque à la seringue. |
| Mannequin Monster, film | 1 | Nouvelle vue de combat, portrait conservé. |
| Lying Figure, Return to Silent Hill | 1 | Vue latérale de dossier, rôle hors combat conservé. |
| Midwich Nightmare, SH1 | 2 | Chaufferie : fond du foyer et grille proche transparente. |
| Building World, SH4 | 2 | Grand escalier et retours de maçonnerie proches. |

Trois clips effectivement animés s'ajoutent : les marches de Scraper et Scarlet,
et l'attaque de l'infirmière. Ces montages sont des adaptations de versus ; ils
ne mesurent pas les timings des œuvres. Aucun sprite fixe n'est compté comme un
clip animé. Les deux stages utilisent des fichiers distincts pour leurs plans.

## Intégration et correctifs

Les nouveaux fichiers sont raccordés aux registres, au manifeste runtime et au
cache du service worker. Le foyer peint de Midwich reçoit sa propre composition
lumineuse. Les libellés centraux du HUD restent contenus entre les jauges.

Pour enchaîner les rencontres les plus chargées, un résultat déjà révélé et
définitivement terminé peut conserver les pixels de son canvas après libération
de ses images. Le préchargement global, la sélection et les limites de mémoire
restent vérifiés. Si le dernier décodage échoue, le résultat et la progression
gagnée restent consultables et un nouvel essai est possible. Les deux caches
gardent leur budget de 64 Mio.

Le suivi ART92 est corrigé pour reconnaître un idle historique après ajout de
poses latérales valides. Le fragment historique reste statique et immuable ;
les nouveaux clips sont contrôlés séparément. Des compteurs d'animation inventés,
des fichiers attribués à un autre profil, des frames orphelines et un idle devenu
animé ne passent pas ce contrôle.

## Couverture après cette vague

| Indicateur | Nombre |
| --- | ---: |
| Profils | 230 |
| Portraits disponibles / absents | 204 / 26 |
| Vues latérales candidates | 129 |
| Anciennes vues de combat à revoir | 64 |
| Images de combat absentes | 37 |
| Portraits distincts du combat | 130 |
| Arènes avec bitmaps | 28 / 123 |
| Clips réellement animés | 6 |
| Présentations animées | 0 |
| Fidélité 1:1 certifiée | 0 |

Les compteurs d'absence incluent aussi des profils de dossier et des rôles non
combattants. Ils ne correspondent pas à une liste de combattants à débloquer.

## Preuves

- [Empreintes des 13 PNG actifs et des 7 variantes](../sprite-wave18-imports-2026-11-19.json).
- [Revue indépendante](verification/REVIEW.md) : 32 tests ciblés réussis,
  286 contrôles Canvas natif, huit duels et 61 captures.
- [Rapport natif réexécuté](verification/native-rerun-report.json) et
  [captures du lot](qa-native/).
- [Régression du suivi de production](verification/tracking-regression.txt) :
  75 tests réussis après correction du suivi des animations.
- [Tests Python](verification/python-tests.txt) : 115 tests réussis.
- [Suite Node et build](verification/npm-test.txt) : **1 290 tests réussis**, puis
  build de 570 fichiers vérifié. Le premier échec du suivi est conservé dans
  [le journal initial](verification/npm-test-initial.txt).

La QA native utilise les callbacks d'entrée et le moteur réels, mais ne remplace
pas Chromium pour le DOM, HTTP ou le service worker. Les contrôles techniques ne
certifient ni la fidélité artistique 1:1, ni une résolution UHD native, ni un
moveset d'animation complet.

Les prompts, références, décisions de sélection et limites de chaque sous-lot
sont conservés dans les fichiers `*-provenance.json` de ce dossier.
