# Vague 30 — compléter les manquants fixes

Révision du **25 novembre 2026**. Référence de comparaison : `9c426d7e230eaec464203acb9b43b63a420acf30`. Cette passe poursuit la production liée au [guide intégré à la bible](../../COMBAT_GAMES_GUIDE_INTEGRATION.md), sur la [PR 11 existante](https://github.com/darknigthmare/silent-hill-halo-of-flesh/pull/11).

## Contenu intégré

**14 PNG natifs indépendants, 17 083 537 octets ; zéro nouvelle animation.** Les images gardent le statut candidat et la fidélité non certifiée.

| Lot | Profils ou lieux | Raccord au jeu |
| --- | --- | --- |
| Trois poses | Sniffer Dog mâle SH4, Carrion Origins, Creeper SH1 | Deux `forwardSpecial` et un `walk` à frame unique ; anciens portraits et idles conservés. |
| Trois effets | Bogeyman Downpour, Straight-Jacket Origins, Incubus SH1 | Onde de poussière, boule acide jaune, éclair rouge ; sept commandes déjà actives reçoivent une image. |
| Six plans de décor | Shimizu Residence II, quai de Toluca Lake Arcade, prison Otherworld Arcade | Un fond opaque et un plan rapproché transparent par lieu. |
| Deux images de récit | Air Screamer SH1 | Introduction et conclusion devant la même maison de Levin Street. |

Les fichiers, dimensions, octets et SHA-256 sont réunis dans [assets.json](assets.json). Les dossiers [personnages](characters/README.md), [projectiles](projectiles/README.md), [décors](stages/README.md) et [récit](story/README.md) consignent prompts, références locales, observations et limites.

## Associations et couverture

La bible relie maintenant **445 entrées et 700 chemins d’image existants**. Les trois nouvelles associations de projectile restent attachées à leurs propriétaires exacts. Les images du récit se trouvent sous le profil SH1 d’Air Screamer. Les [compteurs calculés](../../combat-guide/status.json) et l’[inventaire par identifiant](inventory.json) permettent de distinguer fichier présent, rôle autorisé et contenu encore manquant.

| Couverture | Base `9c426d7` | Après cette passe |
| --- | --- | --- |
| Arènes avec bitmap candidat | 90 / 123 | **93 / 123** |
| Définitions de projectile illustrées | 8 | **11** |
| Commandes projectile illustrées | 24 / 86 | **31 / 86** |
| Récits individuels avec illustrations | 0 | **1**, avec deux images |
| Associations de bible | 442 | **445** |
| Nouveaux cycles animés | 0 | **0** |

Les profils, dégâts et commandes existants sont conservés. La salle à manger de Shimizu est corrigée vers **Residence II**, sur le parcours Ending 1 après le souvenir ; le corridor de Residence I reste distinct. La prison The Arcade représente un corridor de sa branche **Otherworld**, fixé dans cet état. Les plans peints ne créent ni nouvelle prise de plafond, ni danger.

Le récit d’Air Screamer affiche ses images à la sélection, au premier chapitre et, lorsque le récit est achevé, dans le composant de conclusion. Sa file de quatre rencontres reste inchangée, avec des raccords historiques de lieux encore à revoir. Après retour à la sélection, l’aperçu suit désormais le propriétaire choisi ; l’ancien parcours reste disponible via la reprise explicite. La scène contre le rival et la campagne globale restent des conceptions.

## Bible et classeurs

Les **30 rubriques**, **dix décisions de module** et **445 associations** sont reportées dans les feuilles « Guide combat » et « Associations guide » des deux XLSX. Les **13 feuilles historiques cumulées, 252 822 cellules et 87 formules** sont préservées, ainsi que les styles, annotations, validations et liens contenus dans leurs parties ZIP.

Les feuilles du guide ont été actualisées avec Artifact Tool, puis reportées dans les paquets d’origine pour préserver les données historiques. Le grand classeur dépassant la mémoire disponible au rendu intégral, sa revue emploie une projection temporaire : les parties retenues sont vérifiées identiques au candidat final. Le fichier livré conserve toutes ses feuilles. Les contrôles, empreintes, caches de formules et aperçus figurent dans la [validation des classeurs](workbooks/validation.json). L’[ancien handoff](characters/workbook-handoff.json) conserve la trace de l’interruption et de sa résolution.

## Vérifications observées

Les **1 318 tests Node** passent sur l’état local reconstruit de cette passe. Les 57 tests ciblés font partie de cette suite ; ils ne s’y ajoutent pas. Le contrat historique HTTP a également été vérifié en mode métadonnées : **81 contrôles, 80 sujets**. Les imports, générateurs runtime et générateurs de bible ont été exécutés ; les audits relient exactement les chemins, propriétaires, tailles et empreintes des nouveaux PNG.

La QA Chromium du [run 45660199560](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560), job `139367652764`, réussit **301 contrôles** et produit **27 captures**, toutes récupérées avec contrôle d’empreinte puis relues individuellement :

| Domaine | Contrôles | Captures | Portée |
| --- | --- | --- | --- |
| [Poses](characters/qa-http-review.md) | 114 | 12 | Trois profils, deux orientations, action ordinaire puis retour à l’idle. |
| [Projectiles](projectiles/qa-http-review.md) | 138 | 9 | Émission et vol de Bogeyman/Origins dans les deux sens ; six fixtures d’Incubus réunies dans une image isolée. |
| [Décors](stages/qa-http-review.md) | 37 | 3 | Trois duels lancés par l’interface, six plans natifs réellement dessinés. |
| [Récit](story/qa-http-review.md) | 12 | 3 | Sélection et premier chapitre ordinaires ; conclusion testée comme composant isolé. |

Le commit `a1f434ea1d53eb933879442b05f1971c767c197f` est la **source de ce run**. Le job a importé les poses et régénéré les données avant les tests : ces preuves ne prétendent donc pas que tous les fichiers générés étaient déjà présents dans ce commit. Les rapports et captures conservés sous [qa-http](qa-http/) sont la preuve de cette exécution. La dernière version du workflow teste les assets déjà inscrits au registre ; elle ne les réimporte plus avant la recette. Les résultats du commit final sont consultables dans les contrôles de la PR.

Les **708 fichiers d’assets antérieurs** sont identiques à la base ; les six modules protégés de résolution du combat et des parcours sont inchangés. L’import compare tout le registre et conserve les 201 autres propriétaires, les anciennes frames, les portraits et les clips. L’[inventaire](inventory.json) consigne ces comparaisons.

## Restes à traiter

- **30 arènes** sans bitmap candidat et **55 commandes de projectile** sans image associée.
- **26 profils sans portrait, 36 sans base de combat et quatre bases encore en vue historique** dans le catalogue complet ; leur rôle autorisé doit être vérifié avant toute production de duel.
- **3 079 commandes activées sans clip exact** parmi les profils admis disposant d’une vue latérale candidate. Ce nombre ne représente pas 3 079 images ou animations distinctes à générer.
- **229 profils sans illustrations de récit individuel** ; cette couverture se distingue des 48 images déjà présentes dans les Chroniques.
- Incubus reste sans sprite de combat ; son éclair autonome ne lui accorde aucune admission visuelle. La silhouette de Steel Guardian demeure insuffisamment documentée et Earth Guardian garde un effet partiel.
- Cedar Grove, le passage interne Green Lion et le pont du Little Baroness attendent une vue exacte du lieu retenu. La scène du rival d’Air Screamer et les raccords de sa route restent à revoir.

Ces catégories se recoupent. Les captures montrent des poses fixes et utilisent le miroir existant ; elles ne certifient ni animation, ni anatomie exacte, ni fidélité 1:1. Le Creeper reste peu contrasté sur la grille sombre. Les captures de décor sont prises près des positions initiales, sans recette de déplacement aux extrémités. Le terrain physique historique du quai est conservé malgré son apparence pavée. La conclusion du récit n’a pas été obtenue après quatre combats joués. Les service workers sont bloqués pendant la QA HTTP : les mises à jour hors ligne restent hors de cette vérification.

## Trace de reprise

L’exécution locale a été interrompue après la production. Les 14 PNG ont été récupérés à l’octet depuis les résultats ImageGen et sauvegardés comme objets Git. Les audits locaux antérieurs restent identifiés séparément ; les 152 contrôles natifs de projectile ne sont pas présentés comme des rapports ou captures récupérés. Après reprise, les sources, l’import réel, les dérivés, les classeurs et les preuves HTTP ont été restaurés et vérifiés. Aucun asset n’a été recadré, recoloré ou recompressé pour masquer cette interruption.
