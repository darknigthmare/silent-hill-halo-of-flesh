# Vague 27 — attaques, projectiles et trois arènes

Date : **24 novembre 2026**. Reprise de `main` après la fusion de la PR6,
base `fbd109d39ac843620e6c0fde1284480bc51a66d3`.

Cette livraison ajoute **11 images PNG distinctes** au jeu : **2 poses d’attaque,
3 effets de projectile et 6 plans de décor pour 3 arènes**. Chaque sortie est
indépendante et ses octets natifs sont conservés. Aucun nouveau personnage,
portrait ou clip animé n’est compté.

## Contenu intégré

| Ajout | Œuvre / identité | Intégration |
| --- | --- | --- |
| Pose du jet thoracique | Lying Figure, SH2 original | `sh2_lying_figure_020` / `neutralSpecial` ; PNG 1536 × 1024 |
| Pose de bond et morsure | Double Head, SH3 original | `sh3_double_head_040` / `forwardSpecial` ; PNG 1774 × 887 |
| Brume acide jaune pâle | Lying Figure, SH2 original | 3 slots existants ; PNG transparent 1536 × 1024 |
| Décharge bleue | Incubator, SH1 original | 3 slots existants ; PNG transparent 1536 × 1024 |
| Flammes au sol | God, SH3 original | 4 slots existants ; PNG transparent 1536 × 1024 |
| Première cellule du commissariat | Homecoming, avant libération par Wheeler | `police_station_hc` ; fond et avant-plan 1672 × 941 |
| Première visite du toit dans la brume | The Short Message, mural de Maya et mémorial | `villa_rooftop` ; fond et avant-plan 1672 × 941 |
| Escalier normal d’accès au toit | The Short Message | `villa_stairwell` ; fond et avant-plan 1672 × 941 |

Les deux poses d’attaque utilisent chacune **une seule image**. Les mouvements
du corps et des projectiles restent ceux du moteur ; cette livraison ne simule
pas de nouvelles images intermédiaires. Les portraits et les idles existants
restent inchangés.

## Projectiles : rendu propre à chaque attaque

Le nouveau [manifeste](../../../src/projectile-bitmap-manifest.js) rattache
chaque effet à son personnage, son édition et une liste explicite de commandes.
Le [rendu](../../../src/projectile-bitmaps.js) conserve le repli procédural si
le PNG n’est pas chargé ou ne peut pas être affiché. Son cache de 32 Mio est
indépendant des ressources des combattants et des décors. Les PNG sont inclus
dans le paquet et la révision de cache du service worker.

Les dégâts, collisions, trajectoires, coûts et durées ne sont pas modifiés.
La ligne lumineuse de la flamme de God est alignée sur le sol réel, sans utiliser
la limite basse de son halo comme point d’appui. Un même effet sert les commandes
existantes de son profil ; dix slots couverts ne signifient pas dix images.

## Références et fidélité

Les références, prompts et reçus sont conservés dans les dossiers
[personnages](characters/delivery.json), [projectiles](projectiles/prompts.json)
et [stages](stages/README.md). Le modèle original de Double Head et les sprites
déjà intégrés ont été inspectés. Pour Lying Figure, les anciennes images de
référence n’ont pas pu être récupérées lors de cette passe ; la pose suit
l’asset existant et le contrat d’attaque documenté.

Les scènes de Homecoming et The Short Message reposent sur des captures réelles
de gameplay avec URL et horodatage. Les extraits disponibles sont de faible
résolution : le cadrage latéral, la largeur des pièces, le palier de combat et
le redessin du mural restent des adaptations du mode versus. Le dossier
[source-review.json](stages/source-review.json) distingue les observations des
extensions dessinées.

Une erreur historique a été repérée : `sh5_screen_060.jpg`, auparavant associée
au commissariat, représente l’ouverture d’Alchemilla avec Alex et Joshua.
Cette image est exclue des références de la cellule ; les anciennes pièces ne
sont pas réécrites.

Pour les projectiles, les sources attestent les types d’attaque :
[décharges d’Incubator](https://www.silenthillmemories.net/sh1/bosses_en.htm),
[brume toxique de Lying Figure dans le guide Lost Memories](https://www.silenthillmemories.net/lost_memories/guide/048-049_en.htm)
et [feu au sol de God](https://www.silenthillmemories.net/sh3/bosses_en.htm).
Les deux captures de boss conservées dans `projectiles/references/` servent
seulement au contexte d’identité ; elles ne montrent pas les attaques.
Les textures, tracés et cadences originales n’ont pas été mesurés.

**Tous les nouveaux assets restent `fidelity: unverified`. Aucune fidélité
visuelle 1:1, géométrie opposée ou cadence originale n’est certifiée.**

## Vérifications

- **1 300 tests Node réussis**, dont huit nouveaux tests du pipeline projectile ; voir [journal final](node-tests-final.txt).
- **105 tests Python des outils d’art réussis** ; voir [journal](python-art-tests.txt).
- **332 contrôles Canvas natifs réussis**, avec 21 captures : [134 contrôles des poses](characters/qa-native/report.json), [90 des projectiles](projectiles/qa-native-final/report.json) et [108 des stages](stages/qa-native/report.json).
- Les contrôles utilisent le moteur réel et ses callbacks d’entrée, sans injection de position, d’attaque ou de projectile. Les captures ont été inspectées visuellement ; elles ne certifient pas la fidélité aux jeux d’origine.
- [Audit de conservation](summary.json) : **672 anciens fichiers d’assets identiques octet pour octet**, 204 portraits et leurs frames/clips antérieurs, 79 compositions de décor et 17 fichiers de règles ou classeurs préservés.
- [Vérification de construction](verify-final.txt) : génération des données et validation du paquet avec la commande `npm run verify`.

Le premier essai Python complet a été interrompu par une limite de ressources
pendant les tests des classeurs inchangés (`exit 137`). Son journal est conservé
dans [python-suite-resource-limit.txt](python-suite-resource-limit.txt). La
suite des outils d’art a ensuite été exécutée séparément et passe.

Chromium local est bloqué avant ouverture de page par `socket() Operation not
permitted`. Aucune réussite HTTP locale n’est revendiquée. Le workflow existant
est complété par un [contrôle HTTP dédié](run-ci-browser-check.mjs) des huit
scènes d’action et des trois nouveaux décors. Les résultats distants définitifs
doivent être lus sur la PR ; ce document décrit les preuves locales avant envoi.

## Couverture et travail restant

| Catégorie | État après livraison | À compléter / contrôler |
| --- | --- | --- |
| Portraits | 204 / 230 | 26 absents |
| Vues de combat latérales | 190 / 230 | 36 absentes et 4 anciennes vues à revoir |
| Arènes avec composition active | 82 / 123 | 41 : 26 ouvertes, 15 bloquées par leurs références |
| Projectiles, profils par défaut | 3 / 31 illustrés | 28 profils sans effet dédié |
| Projectiles, slots actifs par défaut | 10 / 86 illustrés | 76 slots sans effet dédié |
| Clips réellement animés | 6, inchangés | Les nouvelles poses restent statiques |

Les 26 portraits absents sont inclus dans les 40 profils de combat ouverts ;
ces quantités ne s’additionnent pas. Le périmètre projectile exclut les variantes
d’armes par phase, les pièges et les effets d’impact, qui demandent un suivi
complémentaire.

L’[inventaire complet des manquants](remaining-assets.json) conserve les motifs
des profils ouverts et les IDs des stages et commandes encore sans bitmap.
Le [registre détaillé antérieur](../vague26/remaining-evidence.json) reste la
source des preuves pour les quarante profils non résolus.
