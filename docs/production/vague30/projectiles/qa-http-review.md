# Vague 30 — revue visuelle des projectiles en HTTP

Date : 25 novembre 2026. Statut : **138 contrôles HTTP réussis, neuf captures récupérées et neuf images inspectées individuellement à 1280 × 720 ; aucun défaut visuel bloquant observé dans ce périmètre.**

Cette revue ajoute une preuve navigateur indépendante à la QA native antérieure. Elle conserve les candidats fixes comme `integrated-candidate` / `unverified`. Elle ne certifie ni une animation, ni la fidélité 1:1 aux jeux source, ni l’admission en combat d’Incubus.

## Provenance vérifiable

- Commit exécuté : [`a1f434ea1d53eb933879442b05f1971c767c197f`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/a1f434ea1d53eb933879442b05f1971c767c197f).
- [Run 45660199560](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560), [job 139367652764](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560/job/139367652764), [artefact 15045286963](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560/artifacts/15045286963).
- SHA-256 du ZIP consigné par le coordinateur lors de sa récupération : `6ada019a87812fefec31116529ffb13ff44024066a0f383ad1942a65ec86ae65`.
- [Rapport HTTP extrait](../qa-http/http-wave30-projectiles/report.json), SHA-256 revérifié : `2ef25414ae2c15ace5d9b650823f08efdefbdfc7045b3702b5eddb8744ff081c`.
- Exécution du 25 novembre 2026, de 17:07:22.850 à 17:07:42.083 UTC, Chromium `143.0.7499.4`, serveur dédié port `4291`.

Les neuf SHA-256, tailles en octets et dimensions des PNG extraits correspondent exactement au rapport. Les huit fichiers source suivis par le test possèdent les mêmes empreintes avant et après son exécution ; leurs empreintes correspondent aussi au dépôt restauré lors de cette revue. Ces vérifications portent notamment sur les manifestes projectiles/personnages, le renderer, les données, les movesets, la politique de référence, FightEngine et le script de QA.

## Méthode et portée

Le [script exécuté](qa-http-projectiles.mjs) sert le build réel par HTTP. Pour Bogeyman et Straight-Jacket Origins, il ouvre le jeu normalement, lance quatre cas de duel via l’interface avec le Creeper comme adversaire, et utilise les touches effectivement configurées. Un observateur de dessin relève le PNG réellement décodé et dessiné. Le projectile, ses coordonnées et le rendu ne sont pas remplacés par des fixtures dans ces duels.

Chaque paire présente l’émission puis le même projectile après au moins douze ticks de jeu. Les captures conservent le HUD et les mentions d’entrée de manche : le rapport confirme déjà la phase `fight`, et ces mentions ne masquent pas les effets inspectés. Le décor visible est Midwich Elementary, Fog World. Les collisions à l’impact, la garde et les autres stages ne sont pas couverts par ces images.

Incubus est contrôlé dans une surface indépendante sans application de combat ni FightEngine. Le test appelle le renderer réel sur six fixtures explicites, après avoir vérifié que le chargement normal du personnage reste bloqué par son illustration manquante. Cette capture n’est pas une scène de duel.

## Lecture des neuf captures

| Capture native | Observation visuelle | Résultat dans le périmètre |
|---|---|---|
| [Bogeyman — émission droite](../qa-http/http-wave30-projectiles/downpour_bogeyman_115-right-emission.png) | Traînée gris-beige basse, proche des pieds et posée sur la ligne du sol ; lobe principal orienté vers la droite. Aucun rectangle de fond visible. | Conforme au contrat de rendu au sol. |
| [Bogeyman — vol droite](../qa-http/http-wave30-projectiles/downpour_bogeyman_115-right-flight.png) | Onde détachée du personnage, déplacée vers l’adversaire ; même hauteur et traînée derrière le lobe. | Progression lisible et ancrage stable. |
| [Bogeyman — émission gauche](../qa-http/http-wave30-projectiles/downpour_bogeyman_115-left-emission.png) | Onde à gauche du personnage du joueur 2 ; lobe et traînée correctement inversés. | Orientation gauche cohérente. |
| [Bogeyman — vol gauche](../qa-http/http-wave30-projectiles/downpour_bogeyman_115-left-flight.png) | Onde plus proche du centre, détachée des pieds, toujours au sol et sans contour rectangulaire. | Progression et miroir cohérents. |
| [Origins — émission droite](../qa-http/http-wave30-projectiles/origins_straight_jacket_074-right-emission.png) | Globule jaune-ocre compact devant le haut du torse ; masse principale vers la droite, petites gouttes derrière. | Effet lisible ; origine anatomique exacte non certifiée. |
| [Origins — vol droite](../qa-http/http-wave30-projectiles/origins_straight_jacket_074-right-flight.png) | Globule séparé du personnage, à hauteur constante, silhouette et traînée lisibles sur le décor gris. | Déplacement dans le bon sens. |
| [Origins — émission gauche](../qa-http/http-wave30-projectiles/origins_straight_jacket_074-left-emission.png) | Masse principale à gauche et gouttes du côté du personnage ; aucune bordure opaque. | Miroir correct de l’effet. |
| [Origins — vol gauche](../qa-http/http-wave30-projectiles/origins_straight_jacket_074-left-flight.png) | Projectile détaché vers le centre, à hauteur constante, avec la traînée dirigée vers le lanceur. | Progression et lisibilité confirmées. |
| [Incubus — renderer isolé](../qa-http/http-wave30-projectiles/sh1_incubus_red_lightning-isolated.png) | Six éclairs ramifiés à cœur clair et halo rouge-orangé ; lisibles sur fonds sombre et gris, sans rectangle autour de l’effet. Les trois tailles et les deux orientations sont présentes. | Rendu autonome validé visuellement ; aucun corps ou duel représenté. |

Les déplacements relevés dans le rapport corroborent les paires de captures : Bogeyman passe de `x=356` à `476` vers la droite, et de `924` à `804` vers la gauche, en douze ticks ; Origins passe de `354` à `458` vers la droite en treize ticks, et de `926` à `830` vers la gauche en douze ticks. L’identifiant de l’attaque reste le même dans chaque paire. Il s’agit des coordonnées du jeu actuel, pas de mesures issues des jeux Silent Hill d’origine.

## Associations et limites conservées

| Propriétaire et édition | Image fixe | Routes associées | Ce qui est effectivement vérifié ici |
|---|---|---|---|
| `downpour_bogeyman_115` / `downpour` | `downpour_bogeyman_ground_shockwave` | `neutralSpecial` | Attaque jouée normalement dans les deux orientations ; émission, progression et ancrage au sol visibles. |
| `origins_straight_jacket_074` / `origins` | `origins_straight_jacket_acid_ball` | `neutralSpecial`, `super`, `desperation` | `neutralSpecial` joué dans les deux orientations ; deux autres routes contrôlées comme descripteurs, sans exécution en duel revendiquée. |
| `sh1_incubus_019` / `sh1` | `sh1_incubus_red_lightning` | `neutralSpecial`, `super`, `desperation` | Trois routes et deux orientations dessinées en fixtures isolées ; admission normale toujours bloquée. |

L’onde garde son apparence poussiéreuse et son ancrage au sol, mais la pose fixe de Bogeyman ne constitue pas une animation de marteau synchronisée à l’émission. Le globule Origins apparaît devant le torse du sprite existant ; cette passe ne prétend pas résoudre l’alignement exact d’un crachat avec une bouche animée. Sa couleur repose sur la description textuelle secondaire documentée, tandis que la miniature vidéo ne certifie toujours pas la silhouette ou la texture isolée. Ces limites restent inscrites dans la [provenance des références](references/source-files.json).

Les branches lumineuses d’Incubus restent rouges/orangées, avec une apparence plus pâle sur le fond gris du test. Le résultat est lisible aux trois tailles testées. Le rendu isolé conserve les fixtures sans mutation et rejette une autre édition, un slot inactif ou non associé, un piège et une attaque non projectile. Il ne débloque ni le corps manquant ni le personnage en combat et ne reprend aucune génération de corps refusée.

Le test utilise Chromium headless avec les service workers bloqués. Il ne démontre pas le cache hors ligne, une animation source, un parcours complet de combat, une fidélité 1:1 ou toutes les situations de coup, garde, décors et transformations. Aucun pixel des trois images de jeu, aucune physique, aucun dégât et aucune condition d’activation n’ont été changés par cette revue.

## Historique de validation préservé

Les huit tests ciblés des projectiles et les 152 contrôles natifs précédemment réussis restent consignés dans [validation.json](validation.json). La revue native historique reste à cinq captures sur huit, car ses trois autres images et le rapport complet n’ont pas été récupérés. La preuve HTTP ci-dessus est une nouvelle exécution : ses huit vues de duel et son image isolée sont disponibles et relues, sans convertir les preuves natives perdues en preuves récupérées.
