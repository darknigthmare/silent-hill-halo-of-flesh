# Vague 30 — trois projectiles fixes indépendants

## Livraison

Trois nouveaux PNG transparents habillent sept commandes de projectile déjà actives. Le code des attaques, leur propriétaire, leur édition, leurs conditions, leur vitesse, leur durée, leurs dégâts et leurs collisions sont conservés. Le manifeste ajoute uniquement des illustrations et leurs paramètres de présentation.

| Effet | Profil exact | Édition | Commandes | Image native | Présentation |
|---|---|---|---|---|---|
| Onde poussiéreuse du Bogeyman | `downpour_bogeyman_115` | `downpour` | `neutralSpecial` | 2172 × 724 | Au sol, `source-over` |
| Boule acide du Straight-Jacket | `origins_straight_jacket_074` | `origins` | `neutralSpecial`, `super`, `desperation` | 1774 × 887 | Centrée, `source-over` |
| Foudre rouge d’Incubus | `sh1_incubus_019` | `sh1` | `neutralSpecial`, `super`, `desperation` | 2172 × 724 | Centrée, `screen` |

Chaque illustration est un **candidat statique intégré**, avec `fidelity: unverified`. Aucun clip animé et aucune certification de fidélité ne sont ajoutés. Les trois PNG totalisent **2 490 635 octets**. La résolution native, le canal alpha et les pixels produits sont conservés.

Les ajouts portent le registre de 8 à **11 illustrations**, de 8 à **11 profils illustrés**, et de 24 à **31 commandes illustrées**. Ces compteurs désignent les routes du manifeste ; ils ne constituent pas un taux de fidélité.

## Références : Bogeyman, Downpour

La page du [guide Prima consacrée à St. Maria’s Monastery](https://primagames.com/eguides/silent-hill-downpour-eguide/walkthrough/campaign/st-marias-monastery) décrit les ondes envoyées au marteau. Sa [capture 02i-084](https://primagames.com/eguides/media/_w/700/files/silent-hill-downpour/02i-084.jpg), consultée à **700 × 392**, montre une traînée de poussière gris-brun et des fissures sombres le long du sol. Cette image ne montre pas d’aura bleue ou violette.

L’image produite transpose cette observation en une poussée basse vue de côté, avec une crête à droite, une traîne plus fine à gauche et quelques petits débris. La fissure est un élément du PNG qui accompagne le projectile ; elle ne modifie pas le sol du stage. Le changement de point de vue, la forme précise du nuage, sa longueur, sa densité et sa lisibilité sont des décisions du versus.

L’effet s’applique uniquement à `neutralSpecial`. Le mouvement existant est un projectile au sol ; `anchor: ground` respecte cette qualification. Le repère natif `groundBaseline: 0.735` place sa ligne de contact à environ **532,14 px** dans l’image de 724 px de haut. Cette mesure concerne l’illustration générée, pas le jeu source. Aucun effet de la phase de mise à genoux n’est ajouté.

## Références : Straight-Jacket, Origins

Le [guide officiel Silent Hill: Origins](https://www.silenthillmemories.net/publications/guides/silent_hill_origins_official_strategy_guide.pdf), **page imprimée 141, page PDF 142**, documente un crachat corrosif à distance. Le [bestiary Origins](https://www.silenthillmemories.net/sh0/creatures_en.htm), déjà enregistré sous `EXT01`, confirme l’émission d’acide.

Le [guide d’AngelOfRoom302](https://www.neoseeker.com/silent-hill-origins/faqs/223107-c.html) précise, dans ses sections Straight-Jacket et premier boss, qu’il s’agit de boules jaunes. Cette description est une **source secondaire**. Elle sert à distinguer le projectile compact du nuage continu associé à d’autres éditions ; elle ne fournit aucune mesure de couleur.

Une [capture de la rencontre à 5:55](https://www.youtube.com/watch?v=-LV9LrDb81I&t=355) du longplay de Quadraxis14 a été consultée à sa taille native de **240 × 180**. Elle provient du storyboard public de la vidéo, échantillonné toutes les cinq secondes. Le corps et le contexte d’attaque sont visibles, mais l’image est trop sombre et trop petite pour certifier le contour isolé du crachat. Elle n’est donc pas présentée comme une preuve de texture, de palette RGB ou de silhouette exacte.

Le PNG produit est une boule jaune-ocre à traîne courte. Son contour, sa matière humide et nébuleuse, les gouttelettes et les nuances sont une **reconstruction artistique statique** fondée sur ces descriptions. Le même fichier est utilisé seulement par les trois commandes actives de ce profil Origins. Il ne devient pas une illustration de la Lying Figure de SH2 ou du Straight-Jacket de Book of Memories. La portée bornée et les conditions d’origine restent inchangées.

## Références : Incubus, Silent Hill original

Le [guide Nowhere de Silent Hill Memories](https://www.silenthillmemories.net/sh1/walkthrough_15_nowhere_en.htm) distingue les décharges rouges d’Incubus des décharges bleues d’Incubator. La [vidéo du combat dédiée, à 3:04](https://www.youtube.com/watch?v=VYrT1-Z4N6Y&t=184), montre des branches anguleuses à cœur clair, bordées de rouge-orangé. L’extraction consultée faisait **320 × 180**, sans agrandissement, à partir d’un storyboard public échantillonné toutes les deux secondes.

L’effet généré reprend cette identité lumineuse générale, puis l’oriente horizontalement pour le projectile existant du versus. Le tracé précis des branches, leur largeur et le halo sont reconstruits. Les pixels d’origine, le cycle de décharges, la cadence et la propagation ne sont pas reproduits ou mesurés.

La demande porte sur **un effet électrique autonome**, sans créature, corps, ailes, main ou élément anatomique. Le blocage antérieur de la génération du personnage Incubus reste ouvert ; aucune requête refusée de personnage n’a été réutilisée ou reformulée pour ce lot. L’éclair bleu d’Incubator reste une entrée distincte et n’a pas été recoloré.

## Candidats étudiés et laissés manquants

**Steel Guardian — Book of Memories.** Le dossier de [vague 28](../../vague28/projectiles/source-review.md) indique que le contour d’une lame commandée à distance reste insuffisamment lisible. Les lames des ailes, la couronne et l’épée de butin ne sont pas assimilées à un projectile. Aucun nouveau PNG Steel n’est produit ou associé.

**Onde du poing de l’Earth Guardian — Book of Memories.** Le comportement est documenté dans les sources `EXT24` et `EXT26`. Les miniatures du [longplay à partir de 8:43:54](https://www.youtube.com/watch?v=ruh4O2ZO7aA&t=31434) ont été examinées ; leur résolution de 160 × 90 ne permet pas ici de séparer de façon fiable le contour de l’onde de certains effets autour du joueur. Aucun PNG d’onde n’est donc ajouté. Le rocher existant conserve son association à `neutralSpecial` ; le profil reste partiellement illustré.

## Génération, fichiers et provenance

Les trois images ont été obtenues séparément avec **`image_gen__imagegen`**, `transparent_background: true`, puis affichées avec `generatedImage`. Il n’y a eu ni génération par API/CLI de secours, ni retouche, ni détourage, ni recoloration ou redimensionnement du résultat.

Les prompts exacts se trouvent dans [prompts](prompts/). Le [reçu d’intégration](integration-delivery.json) contient les propriétés natives, les SHA-256, les propriétés observées des commandes réellement résolues. Le [relevé des références](references/source-files.json) conserve les URL, dimensions, coordonnées d’extraction et empreintes des captures. Les deux extractions de storyboard sont de simples découpes natives de références ; elles n’ont pas été agrandies.

Une réinitialisation de l’environnement a supprimé les fichiers de travail pendant la passe. Le résultat Downpour a été récupéré à l’octet depuis le `image_url` déjà retourné par l’outil ; les résultats Origins et Incubus ont été recopiés depuis les PNG natifs revenus dans `generated_images`. Aucune nouvelle génération n’a remplacé ces résultats. Les fichiers de référence avaient été récupérés à nouveau depuis les mêmes URL publiques et leurs empreintes avaient été consignées. Après une seconde coupure, leurs copies binaires et les captures de QA native ne sont plus accessibles. Le présent lot récupère leurs URL, leurs métadonnées et les résultats effectivement observés, sans déclarer ces copies binaires présentes dans Git.

Les noms des fichiers de jeu suivent la convention du registre : `assets/projectiles/<id>.<sha256 sur 12 caractères>.png`. Les bornes de cadrage sont celles calculées par `auditRaster`, qui conserve l’alpha connecté à la forme visible. Elles ne constituent pas une modification des pixels ni une nouvelle hitbox.

## Validation

Les **8 tests ciblés** des projectiles ont réussi. Le contrôle natif des duels Bogeyman et Origins a réussi **152 contrôles, 4 scènes et 8 captures**. Cinq captures ont été effectivement relues avant la panne : les quatre vues Bogeyman et Origins à l’émission vers la droite. Les trois autres vues Origins et le rendu isolé d’Incubus restent à contrôler. Les captures natives et le rapport complet ne sont pas récupérés dans ce lot ; aucun lien vers ces fichiers absents n’est publié.

Voir [validation.json](validation.json) pour cet état précis. Le script [qa-http-projectiles.mjs](qa-http-projectiles.mjs) prépare une nouvelle preuve HTTP à produire en CI : deux profils admissibles, contrôlés dans les deux orientations avec commandes normales, puis le renderer Incubus dans une surface isolée sans lancer de duel. **La présence du script ne signifie pas que son exécution a réussi.**

Après `npm run build`, commande :

```sh
node docs/production/vague30/projectiles/qa-http-projectiles.mjs --port=4291 --out=tests/http-wave30-projectiles
```

La sortie contient un rapport JSON et des captures de canvas. Le navigateur est Playwright Chromium, avec `QA_BROWSER_EXECUTABLE` facultatif. Le script démarre et arrête son propre serveur local sur un port libre. La régénération des documents dérivés et du cache hors ligne est coordonnée au niveau de la vague 30. Aucun résultat non exécuté n’est déclaré ici.
