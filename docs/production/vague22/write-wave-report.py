"""Write the French delivery summary from the final, successful evidence files."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[3]
BASE = Path(__file__).resolve().parent
def read(path):
    return json.loads(path.read_text())

audit = read(BASE / 'final-audit.json')
qa = read(BASE / 'qa-native/report.json')
gates = read(BASE / 'validation/gates.json')
workbook = read(BASE / 'workbook/workbook-verification.json')
assert audit['passed'] and qa['passed'] and gates['passed']
assert workbook['exportReadback'] == 'passed' and workbook['visualReview'] == 'passed'
c = audit['coverage']; s = c['stages']; n = qa['counts']
assert workbook['stages']['bitmapActive'] == s['afterActive']
stage_rows = []
for path in sorted((BASE / 'stages').glob('delivery-part*.json')):
    stage_rows.extend(read(path)['stages'])
assert len(stage_rows) == s['added']
stage_table = '\n'.join(f"| `{x['stageId']}` | {x['selectedSubLocation']} |" for x in stage_rows)
node = next(x for x in gates['gates'] if x['name'] == 'node-project')
python = next(x for x in gates['gates'] if x['name'] == 'python-art-importer')
assert node['counts']['fail'] == 0
f = c['sprites']; a = c['newCharacters']; total_png = len(audit['assets'])
text = f'''# Vague 22 — personnages et stages manquants

État du 19 novembre 2026. Base de comparaison : `80db2a9fdda7032bcaf110df79915be598290f08`, sur la PR [#6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

**{a['total']} vues latérales dédiées et {s['added']} stages auparavant sans bitmap sont intégrés, soit {total_png} nouveaux PNG actifs.** Le catalogue atteint **{f['combatSideViewCandidates']} vues latérales candidates et {s['afterActive']} arènes bitmap sur 123**. Les profils existaient déjà dans le moteur : cette passe complète leur image latérale. Elle n’ajoute aucun profil, portrait de sélection ou clip animé.

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

Cela représente **{a['combatCandidates']} vues pour des profils déjà admissibles au combat et {a['referenceOnly']} vues d’atelier hors duel**. Le classement des 151 candidats dans le registre d’images inclut ces références ; il ne signifie pas 151 nouveaux combattants jouables. Les nouvelles images deviennent la frame idle statique dédiée ; leur portrait antérieur reste celui de la sélection. Les autres poses et les définitions des clips existants sont conservées.

Le cas Twin Pyramid Heads est explicite : deux sujets visuels, un seul profil moteur collectif préexistant. Le manifeste source conserve `singleSubjectReviewed: false`, `singleCollectiveProfileReviewed: true` et `subjectCount: 2`. L’exception de l’adaptateur est limitée à cet identifiant, à sa source SH2 et à sa composition `canonical-encounter-duo` préexistante. La conformité à l’édition vient des références et de la revue manuelle ; aucun acteur autonome supplémentaire n’est créé. Le registre conserve sa convention technique de revue par profil (`singleSubjectReviewed: true`) ; ses notes et le reçu d’import précisent les deux corps réellement revus.

Les trois Raw Shock reprennent les morphologies commerciales Wii. Leurs anciens portraits de concepts restent des documents distincts. L’écart est consigné et les paramètres du prototype restent identiques. Le petit gabarit d’Atrophied dans l’atelier résulte de la présentation existante ; il ne mesure pas sa hauteur canonique.

Sources, prompts, variantes, dimensions, SHA et limites par image : [groupe A](characters-a/delivery-final.json), [groupe B](characters-b/delivery-final.json). Les [décisions A](characters-a/selection-decisions.json) et les [reports B](characters-b/deferred-targets.json) conservent les cibles écartées. Les fichiers `evidence-copy.json` rattachent les chemins d’origine aux copies conservées dans ce dossier.

## Stages livrés

Chaque lieu reçoit **deux PNG natifs indépendants de 1672×941 pixels** : fond opaque et premier plan transparent. Le décalage horizontal existant les met en parallaxe. Cela reste deux plans fixes, sans nouveau cycle animé, danger, transformation ou collision.

| Identifiant du catalogue | Sous-lieu et phase effectivement représentés |
| --- | --- |
{stage_table}

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
| Suite du projet `npm test` | {node['counts']['tests']} tests Node, {node['counts']['fail']} échec ; génération et vérification du build terminées avec code 0 |
| Importeur raster Python | {python['counts']['tests']} tests, code de sortie 0 |
| Rendu natif et commandes | {n['successfulProcesses']} processus réussis, {n['checkExecutions']} exécutions d’assertions, {n['captures']} captures conservées |
| Couverture native des profils | {n['duelCases']} cas de duel pour les {n['combatProfiles']} profils admissibles, {n['referencePreviews']} aperçus d’atelier pour les {n['referenceOnlyProfiles']} références hors duel |
| Couverture native des décors | {n['stageCases']} stages observés avec leurs deux plans et leur parallaxe |
| Préservation | {len(audit['checks'])} contrôles ; 230 définitions, 204 portraits, clips et anciens PNG préservés |
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

Le [classeur Corpus / Stages](../SILENT_HILL_CORPUS_BIBLE.xlsx) est actualisé sur les {s['afterActive']} arènes actives. L’export précédent est archivé dans `baseline/`. Le grand classeur historique des movesets et animations demeure inchangé ; ses états antérieurs gardent leur date et ne sont pas présentés comme le compteur courant.

| Compteur courant | Avant | Après |
| --- | ---: | ---: |
| Portraits disponibles | 204 | {f['selectionAvailable']} |
| Vues latérales candidates, atelier compris | 135 | {f['combatSideViewCandidates']} |
| Anciennes vues encore à revoir | 58 | {f['combatLegacyUnreviewed']} |
| Images de combat réellement absentes | 37 | {f['combatMissing']} |
| Portraits absents | 26 | {f['selectionMissing']} |
| Clips réellement animés | 6 | {f['animatedClips']} |
| Stages bitmap actifs | 55 | {s['afterActive']} |
| Stages sans bitmap | 68 | {s['remaining']} |
| Fidélités 1:1 certifiées | 0 | 0 |

Parmi les {s['remaining']} stages sans bitmap, **{s['remainingUnblocked']} ont une référence ouverte et {s['blocked']} une référence bloquée**. Une fiche ouverte ne signifie pas que toutes les vues nécessaires à sa reconstruction ont été trouvées. Les reports motivés par une mauvaise phase, un angle trop partiel ou une identité incertaine restent visibles.

Les 26 portraits absents et les 37 images de combat absentes ne sont pas déclarés résolus : les nouvelles vues remplaçaient des images encore partagées entre sélection et présentation latérale. Les refus antérieurs ne sont pas relancés sous une autre identité. Le relevé détaillé des absences et des 42 vues anciennes reste dans [l’audit final](final-audit.json) et [la couverture du registre](../../../data/sprite-coverage.json).
'''
(BASE / 'RAPPORT_VAGUE22_PERSONNAGES_STAGES.md').write_text(text)
(BASE / 'README.md').write_text(f'''# Vague 22 — personnages et stages manquants

**16 vues latérales dédiées, {s['added']} stages et {total_png} PNG actifs ajoutés.** Le catalogue atteint 151 vues candidates et {s['afterActive']} arènes bitmap sur 123. Les 204 portraits et les six clips animés sont préservés. Aucun nouveau profil moteur ou certificat de fidélité 1:1.

[Rapport complet, sources, résultats et limites](RAPPORT_VAGUE22_PERSONNAGES_STAGES.md) · [Audit final](final-audit.json) · [QA native](qa-native/report.json) · [Suites de tests](validation/gates.json) · [Classeur Corpus / Stages](../SILENT_HILL_CORPUS_BIBLE.xlsx).
''')

intro = f'''## Personnages et stages manquants — 19 novembre 2026, vague 22

**16 vues latérales dédiées et {s['added']} stages sont ajoutés : 151 vues candidates et
{s['afterActive']} arènes bitmap sur 123.** La [vague 22](docs/production/vague22/README.md)
complète 12 profils déjà admissibles au combat et quatre références d’atelier
hors duel. Les 204 portraits et six clips animés sont préservés.

Les {s['remaining']} stages sans bitmap, 42 anciennes vues à revoir, 26 portraits absents
et 37 images de combat absentes restent suivis dans [l’audit courant](docs/production/vague22/final-audit.json).
Les images sont des reconstructions candidates ; aucune fidélité 1:1 n’est certifiée.
La bible conserve ses 66 notices, dont Transmission ; le [classeur Corpus / Stages](docs/production/SILENT_HILL_CORPUS_BIBLE.xlsx)
est actualisé sur cette passe.

'''
path = ROOT / 'README.md'; old = path.read_text()
assert '## Personnages et stages manquants — 19 novembre 2026, vague 22' not in old
first, rest = old.split('\n', 1); path.write_text(first + '\n\n' + intro + rest.lstrip('\n'))
path = ROOT / 'docs/production/README.md'; old = path.read_text()
assert '## État actuel — vague 22' not in old
head = f'''## État actuel — vague 22 du 19 novembre 2026

La [vague 22](vague22/README.md) ajoute **16 vues latérales dédiées et {s['added']} stages**,
soit {total_png} nouveaux PNG actifs. Le catalogue atteint **151 vues candidates et
{s['afterActive']} arènes bitmap sur 123**. Douze vues servent des profils déjà admissibles
au combat ; quatre restent des références hors duel. Les 204 portraits et six
clips animés sont conservés. Aucun nouveau profil moteur ou certificat 1:1.

Il reste {s['remaining']} stages sans bitmap ({s['remainingUnblocked']} ouverts, {s['blocked']} bloqués), 42 vues anciennes
à revoir, 26 portraits absents et 37 images de combat absentes. Le [rapport complet](vague22/RAPPORT_VAGUE22_PERSONNAGES_STAGES.md)
distingue les vrais manquants des nouvelles vues de profils déjà illustrés.
Le [classeur Corpus / Stages](SILENT_HILL_CORPUS_BIBLE.xlsx) reflète les {s['afterActive']} lieux actifs ;
les 66 notices du corpus et le classeur historique des animations sont préservés.

'''
old = old.replace('## État actuel — vague 21 du 19 novembre 2026', head + '## État précédent — vague 21 du 19 novembre 2026', 1)
path.write_text(old)
print(json.dumps({'report': str(BASE / 'RAPPORT_VAGUE22_PERSONNAGES_STAGES.md'), 'characters': 16, 'stages': s['added'], 'activePNG': total_png}))
