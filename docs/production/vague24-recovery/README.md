# Reprise : réunion des deux livraisons locales de la vague 23

Cette reprise réunit les deux sessions qui avaient travaillé depuis le même
commit publié `cffb58bbcb78c2bdb1381965ea0efb3e5fb54994`. Leur production était
présente localement, mais la branche distante de la PR nº 6 restait sur ce commit
lors de la vérification de reprise. Aucune nouvelle image n'est générée par cette
opération de récupération.

## Choix d'intégration

| Livraison originale | Commit local conservé | Traitement |
| --- | --- | --- |
| Session A, huit vues et six décors | `aa97ffba2c6ca0b6d6bdc61ee1c17dc091933231` | Base active de la reprise ; ses choix d'images et de décors sont conservés |
| Session B, six vues et quatre décors | `c0eea6d1185cee0575c407aaf1e5854e9077db10` | Raw Shock et Gray Child de Book of Memories deviennent actifs ; les douze PNG qui doublonnent un choix A restent conservés hors manifeste actif |
| Archives de production de la vague 22 | `6757168e36aaf9e99d5889197da05a28abd7c698` | Les 57 fichiers du commit sont récupérés à leur chemin original |

La fusion locale conserve les trois historiques. Elle choisit explicitement
l'état A, puis ajoute les fichiers et les deux vues uniques de B. Aucun manifeste
ancien n'est recopié en bloc sur le catalogue actuel.

Les deux vues récupérées sont réimportées avec l'importeur existant. Le portrait
de sélection, les clips, les poses supplémentaires, la source Book of Memories
et le rôle de chaque profil sont préservés. Les douze autres PNG actifs de B sont
conservés sous leurs chemins à empreinte, sans être référencés par le manifeste
actif. Les décisions de sélection originales restent consultables dans les deux
dossiers historiques.

## Fichiers conservés

Le [manifeste de récupération](recovery-manifest.json) relie **305 fichiers** à
leur provenance, leur destination, leur taille et leur SHA256 : **86 465 727
octets** copiés à l'identique. Il couvre les 233 fichiers modifiés par B, les 57
archives de vague 22, les douze scripts ou états encore non suivis de l'ancien
worktree, deux inventaires de publication et le PNG de Brookhaven écarté.

- Les documents B originaux sont dans
  [vague23-session-6101](../vague23-session-6101/README.md). Les rapports et reçus
  n'ont pas été réécrits : leurs résultats décrivent leur session d'origine.
- Les états B qui entraient en conflit avec A sont dans
  `session-6101-original-state/`. Ce sont des instantanés de référence, pas du
  code ou des manifestes chargés par le jeu.
- Les scripts locaux non suivis sont dans `loose-wave23-scripts/`, hors des
  commandes de build du jeu.
- Le candidat `rejected/arcade-hospital-unverified-location.png` est conservé
  comme proposition écartée. Son identification de lieu reste insuffisante et
  il ne devient pas un décor actif. La décision d'origine est conservée dans
  [rejected-candidates.json](../vague23/stages/rejected-candidates.json).
- Les [archives de vague 22](../vague23/recovered-wave22/README.md) comprennent
  également le brouillon Nowhere précédemment écarté.

## Couverture réunie

| Indicateur | Base publiée | Après réunion locale |
| --- | ---: | ---: |
| Vues latérales candidates | 151 | 161 |
| Anciennes vues à reprendre | 42 | 32 |
| Portraits distincts de l'image de combat | 152 | 162 |
| Portraits disponibles | 204 | 204 |
| Images de combat absentes | 37 | 37 |
| Portraits absents | 26 | 26 |
| Clips réellement animés | 6 | 6 |
| Stages avec bitmap actif | 65 / 123 | 71 / 123 |
| Stages sans bitmap actif | 58 | 52 |
| Fidélités 1:1 certifiées | 0 | 0 |

Le résultat actif des deux sessions correspond à **dix vues latérales uniques**
et **six décors à deux plans**, soit **22 PNG actifs** ajoutés depuis la base
publiée. Les PNG alternatifs sont disponibles pour comparaison, mais ne gonflent
pas la couverture active. Les dix vues incluent les quatre références d'atelier
de A ; aucun rôle hors combat n'est transformé en combattant.

## Vérification de cette reprise

Le [reçu d'import](characters-recovered-receipt.json) concerne uniquement les
deux vues B récupérées. Le [journal de vague 24](../sprite-wave24-imports-2026-11-19.json)
signale explicitement qu'elles ont été générées dans la vague 23, puis réunies
dans cette reprise. Les nouvelles entrées de provenance pointent vers les
documents conservés dans ce dépôt.

Le script existant `scripts/build-sprites.mjs` régénère les données dérivées.
[reconciliation-assertions.json](reconciliation-assertions.json) consigne la
vérification des 305 empreintes, de la préservation des images A, des deux seuls
changements de registre, des portraits et clips, des contrats de gameplay, de
la couverture et du budget de cache avec les adversaires illustrés.

Cette vérification de récupération ne rejoue pas les anciennes suites de tests
et ne présente pas leurs résultats comme nouveaux. La vérification complète
du lot à publier appartient à la passe suivante. Les nouveaux PNG restent des
poses statiques candidates, `fidelity: unverified`. Les captures et tests
historiques des deux sessions restent datés et limités à leurs périmètres.
