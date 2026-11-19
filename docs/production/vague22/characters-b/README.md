# Vague 22 — personnages B

## Livraison fermée

Six PNG natifs retenus, 6 861 960 octets, produits par onze appels à `image_gen__imagegen`. Cinq sorties intermédiaires sont archivées et exclues de l'intégration. Aucun pixel des sorties retenues n'a été recadré, redimensionné, peint ou retraité par script ; les fichiers de livraison sont des liens physiques aux sorties natives.

Le manifeste consolidé est `delivery-final.json`. Les sous-lots incrémentaux `delivery-part2.json` et `delivery-part3.json` contiennent uniquement leurs nouveaux IDs. Le parent a figé le premier sous-lot lors de son import. `prompts.json` conserve les onze prompts, références locales et chemins des sorties. `raster-audit.json` et `final-verification.json` enregistrent les bornes alpha, ancrages proposés, empreintes et contrôles réalisés.

| ID | Vue retenue | Usage |
| --- | --- | --- |
| `bom_light_guardian_140` | Profil droit v2 | Pose statique de présentation en combat ; bras-masse et appuis complets |
| `bom_water_guardian_141` | Profil droit v3 | Masse aquatique à base fermée ; deux bras, aucune jambe ajoutée |
| `bom_earth_guardian_142` | Profil droit v2 | Tête rocheuse et segments flottants ; aucun tronc ou appui humain ajouté |
| `bom_air_screamer_121` | Profil droit v1 | Pose de vol statique ; deux ailes et deux serres entières |
| `bom_insane_cancer_126` | Profil droit v2 | Masse entière avec deux petits pieds visibles ; bras éloigné occulté par le corps |
| `shortmessage_sakura_head_150` | Profil droit v1 | Présentation/atelier ; poursuivant scripté toujours hors duel autonome |

## Références et fidélité

Les gardiens, Air Screamer et Insane Cancer utilisent les portraits du bestiaire et les captures natives de l'édition PS Vita Book of Memories archivés sur Silent Hill Memories. Les portraits sont de faible résolution ; les captures plus larges sont en perspective de jeu. La transformation en vue de profil, les surfaces fines et les proportions de profondeur sont donc des reconstructions signalées comme `fidelity: unverified`.

Sakura Head utilise deux captures du modèle final de The Short Message, complétées pour le revers, les attaches et les extrémités par les photographies de la figurine officielle Gecco supervisée par Masahiro Ito. La page primaire est <https://gecco.co.jp/en/product/sakura-head/>. Ces photographies sont un support secondaire par rapport au modèle en jeu. Le concept à tête plus courte et baskets a été inspecté puis exclu de la génération car il ne correspond pas au costume final.

Les références visuelles téléchargées gardent leur URL, empreinte SHA256 et chemin dans `references/manifest.json`. Chaque image effectivement utilisée a été inspectée avant son appel. La génération ne reproduit pas des pixels originaux du jeu et ne certifie aucune fidélité 1:1. Les PNG ne sont pas des animations ; aucun timing ou geste original n'est validé par leur production.

## Cibles initiales reportées

`deferred-targets.json` conserve la décision pour les six absences initialement prioritaires. Numb Body Arcade, Nurse Arcade, Dark Nurse 2006 et Hinako's Mother ont un refus historique direct ou apparenté ; aucun de ces sujets n'a été retenté. Missionary Revelation reste reporté faute de référence complète aux chaussures du costume final. Robbie Shotgun reste reporté parce que l'identité exacte de l'arme n'est pas résolue face au modèle nommé Rifle. Ces deux cas ne sont pas présentés comme des refus de génération.

## Intégration et limites techniques

Les six portraits existants sont conservés. Les six entrées avaient zéro clip animé ; aucun clip existant ni rôle, ID, moveset ou règle n'est modifié par cette livraison. Le parent réalise l'intégration et la QA Canvas. Les ancrages et hauteurs sont des propositions de présentation, avec les bornes alpha≥32 réelles ; ils ne mesurent pas une échelle source. Les marges demandées au générateur n'ont pas toujours été atteintes et les valeurs mesurées sont reportées. Le faible bruit alpha hors silhouette reste inchangé dans les pixels natifs.

La revue des captures réellement exécutées par le parent est consignée séparément dans `native-visual-review.json` dès la fin de ses six cas. Elle ne remplace pas un relevé d'animation source ou une validation 1:1.
