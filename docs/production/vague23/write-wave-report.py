"""Write the wave23 report from completed, preserved verification evidence."""
from pathlib import Path
import datetime
import json

ROOT = Path(__file__).resolve().parents[3]
FOLDER = Path(__file__).resolve().parent
def read(name):
    return json.loads((FOLDER / name).read_text())
def number(value):
    return f"{value:,}".replace(",", " ")
audit = read("final-audit.json")
qa = read("qa-native/report.json")
gates = read("validation/gates.json")
workbook = read("workbook/workbook-verification.json")
assert audit["passed"] and qa["passed"] and gates["passed"]
assert workbook["exportReadback"] == "passed" and workbook["formulaErrors"] == 0
assert workbook["counts"] == {"corpus": 66, "active": 71, "openMissing": 37, "blocked": 15, "stages": 123}
node = next(g for g in gates["gates"] if g["name"] == "node-project")
python = next(g for g in gates["gates"] if g["name"] == "python-art-importer")
c = audit["coverage"]
q = qa["counts"]
sprite_bytes = sum(a["bytes"] for a in audit["assets"] if a["path"].startswith("assets/sprites/"))
stage_bytes = sum(a["bytes"] for a in audit["assets"] if a["path"].startswith("assets/stages/"))
prior_png = next(x["detail"]["files"] for x in audit["checks"] if x["name"] == "Every previously referenced PNG remains byte-identical")
text = f"""# Vague 23 — huit vues latérales et six décors manquants

Date : 19 novembre 2026. Base publiée : `{audit['baseCommit']}`.
[PR de livraison no 6](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/6).

## Résultat

Cette passe remplace huit images idle anciennes par des vues latérales dédiées et ajoute six décors auparavant absents. Les vingt PNG actifs sont les sorties natives conservées sans recadrage, redimensionnement, peinture ou modification de l’alpha. Ils représentent **{number(sprite_bytes + stage_bytes)} octets**.

| Indicateur | Avant | Après |
| --- | ---: | ---: |
| Portraits disponibles | 204 | 204 |
| Vues latérales candidates | 151 | 159 |
| Vues anciennes non qualifiées | 42 | 34 |
| Portraits distincts de l’image de combat | 152 | 160 |
| Images de combat entièrement absentes | 37 | 37 |
| Portraits absents | 26 | 26 |
| Clips réellement animés | 6 | 6 |
| Arènes bitmap actives | 65 / 123 | 71 / 123 |
| Arènes encore sans bitmap actif | 58 | 52 |
| Notices du Corpus | 66 | 66 |

Les huit profils existaient déjà. Quatre sont admissibles aux duels, quatre gardent leur usage de référence dans l’atelier. Les nouveaux PNG sont des poses statiques ; la parallaxe des décors ne compte pas comme une animation originale. Tous les ajouts restent `fidelity: unverified`, sans certification 1:1 ni UHD.

Sources des chiffres : [audit final](final-audit.json), [journal des huit imports](../sprite-wave23-imports-2026-11-19.json), [QA native](qa-native/report.json).

## Vues latérales

| Œuvre exacte | Sujet | Usage conservé |
| --- | --- | --- |
| Silent Hill 3 | Glutton | Obstacle passif, référence hors duel |
| Silent Hill 4: The Room | Greedy Worm | Référence hors duel |
| Silent Hill 4: The Room | Toadstool | Obstacle environnemental, hors duel |
| Silent Hill 4: The Room | Whitestool | Obstacle environnemental, hors duel |
| Silent Hill: Origins | Remnant | Combattant existant |
| Silent Hill: Book of Memories | Tremer | Combattant au sol |
| Silent Hill: Book of Memories | Wood Sapling | Combattant existant |
| Silent Hill: The Arcade | Gum Head | Combattant existant, sans arme SH4 ajoutée |

Les huit fichiers sont des RGBA natifs de **1 254 × 1 254 pixels**, pour **{number(sprite_bytes)} octets**. Les sujets, extrémités et appuis sont visibles. Les marges effectivement obtenues sont enregistrées, y compris lorsqu’elles sont inférieures à la consigne de génération. Les fines franges d’alpha natives n’ont pas été effacées.

Le portrait antérieur, les autres frames et les définitions des clips de chaque profil sont conservés. L’ancrage est une calibration de présentation dans le versus ; il ne mesure pas la hauteur d’origine. La vue opposée reste un miroir de présentation. Les sources parfois petites ou obliques ne valident pas les détails cachés.

Remnant comprend déjà une ombre humaine plate dans son PNG. La proposition `shadowScale: 0` de la livraison n’existe pas dans le contrat moteur et n’a pas été appliquée. L’ellipse native du moteur reste active ; la revue à 1 280 × 720 n’a pas montré de seconde ombre détachée. Cette limite est consignée, sans modification du moteur.

Preuves : [inventaire des sept sujets du lot principal](characters/README.md), [revue indépendante des huit imports](characters/integration-review.json), [livraison Glutton](characters-extra/delivery-part1.json).

## Décors

| Stage | Scène retenue | État et référence |
| --- | --- | --- |
| Ebisugaoka | Rue devant la boutique d’angle | Fog World normal, images PlayStation officielles |
| Fire Zone | Salle de travail avec établi | Capture de lancement du 16 octobre 2012 |
| Earth Zone | Galerie de soutènement bois et pierre | Préversion E3 du 6 juin 2012, vue 37 |
| Water Zone | Toit technique, grilles, portes et ventilations | Capture DLC après sortie, vue 37 |
| City / Jack’s Inn | Entrée couverte et rue dans la brume | Début du parcours Arcade, captures officielles 2007 et Konami Europe 2010 |
| Blood Zone | Plateforme, disque intégré et porte nervurée | Préversion E3 du 6 juin 2012, vue 22 |

Chaque décor comporte **deux plans indépendants**, un fond opaque et un premier plan transparent. Les douze PNG représentent **{number(stage_bytes)} octets**. Les six fonds sont en 1 672 × 941 ; quatre premiers plans ont cette dimension, celui de City mesure 1 671 × 941 et celui de Blood 1 672 × 940. Ces variations natives d’un pixel ont été conservées. Le moteur les ajuste par le `fit: cover` existant.

Les premiers plans restent aux extrêmes ; leur centre et la bande des pieds ont un alpha maximal de 1/255. Leur déplacement relatif a été contrôlé après les entrées gauche/droite. Les adaptations de perspective, largeur et profondeur ne sont pas des plans certifiés du jeu original. Les dangers, collisions et règles de transition restent inchangés.

Earth et Blood conservent explicitement leur statut de préversion. Pour Water, la galerie est datée du 15 mars 2013 alors que le fichier porte `20130115_37` : cette divergence est enregistrée. Le portfolio du créateur sert au recoupement de l’identité et des matériaux, sans imposer sa géométrie à la salle choisie.

L’illustration proposée pour Brookhaven Arcade a été écartée faute de localisation et de phase suffisamment sûres. Light et Steel restent en attente d’une salle précisément documentée. Aucune scène écartée n’entre dans le manifeste.

Preuves : [inventaire et sources des décors](stages/README.md), [validation des douze PNG](stages/production-summary.json), [décisions d’exclusion](stages/rejected-candidates.json), reçus [1](stages-import-part1.json), [2](stages-import-part2.json), [3](stages-import-part3.json) et [4](stages-import-part4.json).

## Validation terminée

| Contrôle | Résultat |
| --- | --- |
| Suite Node et build vérifié | {number(node['counts']['tests'])} tests, {node['counts'].get('fail', 0)} échec, sortie {node['exitCode']} |
| Tests Python de l’importeur | {python['counts']['tests']} tests, sortie {python['exitCode']} |
| QA Canvas native | {q['checkExecutions']} exécutions d’assertions, {q['successfulBatches']} lots réussis |
| Duels des quatre profils admissibles | {q['duelCases']} cas, deux orientations par profil |
| Atelier des quatre profils hors duel | {q['referencePreviews']} aperçus, aucun duel ajouté |
| Nouveaux décors | {q['stageCases']} cas dans FightEngine |
| Captures conservées | {q['captures']}, dont {q['visuallyInspectedCaptures']} effectivement inspectées dans les revues |
| Préservation, provenance et mémoire | {len(audit['checks'])} contrôles réussis |
| Revue indépendante personnages | 13 contrôles réussis |

La QA native couvre l’idle, le déplacement statique autorisé ou son rejet pour un profil stationnaire, le relâchement, les appuis, l’intégrité de la silhouette et les plans de décor. Elle ne certifie pas une matrice complète d’attaques, contacts, gardes, finishers ou timings originaux. Elle n’est pas un test Chromium, HTTP, DOM ou CSS ; les résultats navigateur du commit publié sont suivis séparément dans la PR.

Les **58 fichiers de périmètre protégés** restent identiques, dont les 230 définitions, règles de combat, rôles, stages, corpus et classeur historique de movesets. Les 204 portraits, clips existants et **{prior_png} PNG historiquement référencés** sont conservés. Le manifeste sprites correspond au registre, hors les cinq champs raster recalculés. Les livraisons et reçus ont été vérifiés par SHA256 ; les candidats non sélectionnés ne sont pas importés.

Les deux budgets de cache de **64 Mio** restent inchangés. Les **{number(audit['memory']['fighterPairs']['previouslyAdmitted'])} paires de combattants illustrées** auparavant admissibles le restent. Les {number(audit['memory']['activeStagePairs']['pairsIncludingSelf'])} paires d’arènes actives et {number(audit['memory']['allStoredRoomPairs']['pairsIncludingSelf'])} paires de compositions conservées passent l’admission mémoire.

La première tentative de lancement s’est arrêtée avant les tests : la copie partielle du dépôt n’avait pas encore matérialisé les deux fichiers de recherche suivis par Git. Les originaux ont été récupérés sans modification de contenu. Cette tentative est conservée dans [validation-attempt1](validation-attempt1/resolution.json) et exclue des totaux de succès.

Preuves d’exécution : [tests complets](validation/gates.json), [QA agrégée](qa-native/report.json), [audit final](final-audit.json).

## Classeur actualisé

Le [classeur Corpus / Stages](../SILENT_HILL_CORPUS_BIBLE.xlsx) a été importé, puis seules les cellules Bitmap, Action et PNG des six stages nouvellement actifs ont été mises à jour. L’ordre des lignes, les 66 notices, les deux tables, les sept formules, les validations et les styles existants sont conservés. Les hauteurs des seules lignes modifiées ont été adaptées si nécessaire.

L’export a été rouvert. Les résultats affichent **71 actifs, 37 absents ouverts et 15 bloqués** sur 123. Un changement temporaire de statut a fait varier les compteurs, puis a été restauré avant export. Aucun résultat n’est figé à la place d’une formule. La synthèse et les six lignes modifiées ont été rendues et inspectées.

Preuves : [vérification du classeur](workbook/workbook-verification.json), [revue structurelle](workbook/structure-review.json), [revue visuelle](workbook/visual-review.json). L’état précédent est conservé dans `baseline/` ; le classeur historique de movesets n’a pas été modifié.

## Blocages et reste à produire

- **52 stages sans bitmap actif** : 37 ouverts et 15 bloqués par leur référence. La liste complète figure dans l’audit final.
- **34 vues anciennes** à reprendre, selon la qualité des sources et les contraintes déjà enregistrées.
- **37 images de combat et 26 portraits absents** : cette passe n’en crée pas. Le triage antérieur reste applicable aux refus, sources insuffisantes et problèmes d’identité ou de rôle.
- **6 clips réellement animés** dans le catalogue : aucun nouveau cycle d’animation n’est revendiqué dans cette vague.

La génération de Red Pyramid du film de 2006 a été refusée par le service d’images, sans PNG produit. Aucun nouvel appel n’a repris cette demande. Le candidat Arcade créé avant ce refus reste non sélectionné pour son cadrage trop frontal ; la correction préparée a été annulée avant appel. Les deux entrées de catalogue et leurs fichiers précédents sont inchangés.

Preuves : [refus Film](characters-extra/film-red-pyramid-generation-blocked.json), [disposition Arcade](characters/red-pyramid-disposition.json), [audit des absences](final-audit.json). Les nouvelles références, prompts, sorties retenues et décisions d’exclusion restent disponibles pour une reprise précisément ciblée.
"""
out = FOLDER / "RAPPORT_VAGUE23_PERSONNAGES_STAGES.md"
with out.open("x") as f:
    f.write(text)
readme = """# Vague 23 — livraison personnages et décors

[Rapport de livraison](RAPPORT_VAGUE23_PERSONNAGES_STAGES.md) · [Audit et absences restantes](final-audit.json) · [QA native](qa-native/report.json) · [Tests complets](validation/gates.json) · [Classeur vérifié](workbook/workbook-verification.json).

Cette vague ajoute huit vues latérales dédiées et six stages manquants, soit vingt PNG actifs. Le catalogue atteint 159 vues latérales candidates, 71 stages bitmap sur 123 et conserve ses 204 portraits et six clips animés.

Les sources, sorties natives, reçus d’import, captures et limites sont conservés. Aucun rôle, identifiant, règle de combat, portrait antérieur ou clip n’est remplacé. Le rapport distingue les quatre profils admissibles au duel des quatre références hors duel, les scènes de préversion, le refus de génération et les candidats écartés.

## Rejouer les contrôles

Les scripts d’import sont des outils de production incrémentale : ne pas réimporter les livraisons déjà traitées. Le journal des huit imports est conservé au niveau supérieur. Les scripts de QA et d’audit ciblent l’état de cette vague.

- `audit-final.mjs` : périmètre, provenance, correspondance registre/manifeste et mémoire.
- `aggregate-native.mjs` : consolidation des rapports natifs existants par empreintes exactes.
- `run-validation-gates.py` : suite du projet et tests de l’importeur, avec sorties archivées.
- `update-corpus-workbook.mjs` / `verify-corpus-workbook.mjs` : mise à jour ciblée et réouverture du classeur via Artifact Tool.
- `write-wave-report.py` : rapport depuis les preuves réussies, sans écraser une livraison existante.
"""
with (FOLDER / "README.md").open("x") as f:
    f.write(readme)
print(json.dumps({"report": str(out), "nodeTests": node["counts"]["tests"], "pythonTests": python["counts"]["tests"], "png": len(audit["assets"]), "bytes": sprite_bytes+stage_bytes}, ensure_ascii=False))

