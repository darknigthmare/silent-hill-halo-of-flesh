# Vague 25 — personnages latéraux et quatre arènes

**20 novembre 2026 — Silent Hill Combat / Halo of Flesh — PR nº 6**

Cette vague complète **12 profils existants** : onze nouvelles vues latérales statiques et les trois poses de l’idle déjà animé d’Air Screamer. Elle ajoute aussi **quatre arènes**, chacune constituée de deux plans bitmap. Les portraits de sélection, les identités et les règles propres aux œuvres restent conservés.

Le point de départ est le commit distant [`ebca8aa`](https://github.com/darknigthmare/silent-hill-halo-of-flesh/commit/ebca8aa25d943692ae78837ea81b07cc229eeea5), dont l’arbre `12bb301c51be56fccd8a2ffd9834468f2f56a9b8` correspond exactement au point de reprise local `941ebe70`. Les publications antérieures et l’ancien corps de PR sont conservés dans [pr6-before.json](pr6-before.json).

## Résultat et couverture

| Indicateur | Début de vague | État vérifié |
| --- | ---: | ---: |
| Profils du roster | 230 | 230 |
| Portraits disponibles | 204 | 204 |
| Vues latérales candidates | 175 | **187** |
| Anciennes vues de combat à reprendre | 18 | **6** |
| Images de combat absentes | 37 | 37 |
| Portraits absents | 26 | 26 |
| Arènes avec bitmap actif | 71 / 123 | **75 / 123** |
| Clips réellement animés | 6 | **6** |
| Profils certifiés fidèles à 1:1 | 0 | **0** |

Ces compteurs décrivent des usages différents. Les 26 portraits absents font partie des profils déjà dépourvus d’image de combat ; ils ne s’ajoutent pas comme 26 identités supplémentaires. Aucun nouveau portrait ou profil du roster n’est compté pour cette vague.

**26 sorties natives imagegen sont conservées : 22 retenues et quatre supersédées.** Les 22 images actives correspondent à onze vues statiques de personnage, trois images du cycle existant d’Air Screamer et huit plans de décor. Le [registre de disposition](native-dispositions.json) relie chaque sortie à son SHA, ses dimensions, son usage actif ou son motif d’archivage. Les références, les copies d’un même fichier et les captures de QA ne sont pas comptées comme de nouvelles générations.

## Personnages complétés

| Œuvre | Profil | Usage conservé | Production retenue |
| --- | --- | --- | --- |
| Silent Hill original | Air Screamer | Combat, profil volant | Trois poses latérales pour l’idle existant |
| Silent Hill original | Larval Stalker | Référence d’atelier hors duel | Une silhouette latérale sombre et translucide |
| Downpour | Tormented Soul | Référence d’atelier hors duel | Cage et effigie entières, vue latérale |
| Downpour | Wall Corpse | Référence d’atelier hors duel | Torse et supports muraux entiers |
| Book of Memories | Blood Baby | Combat, rôle multi-body et super désactivée conservés | Un individu entier en profil droit |
| Silent Hill f | Rinko-Like Entity | Combat | Profil droit entier, couvre-chef, robe et chaîne |
| Silent Hill f | Hinako’s Father | Combat | Profil droit entier, arme et deux appuis |
| Townfall | Lunger | Combat | Profil droit entier, bras retenus et tête continue |
| Townfall | Sorrowful | Combat | Profil droit entier, mains près du torse et petit tube |
| Townfall | Fallen | Combat | Concept final debout, deux bras et deux pieds |
| Townfall | Widow | Référence d’atelier hors duel | Profil entier avec ses bandes et petit morceau de bois |
| Townfall | The Weight | Rencontre scénarisée, combat actif et super désactivée conservés | Forme poursuivante du modèle 08, sans bras libres inventés |

Les onze imports statiques sont détaillés dans le [journal des imports](../sprite-wave25-imports-2026-11-20.json). Le cas animé possède son [reçu dédié final](receipt-air-screamer-corrected.json) et sa [livraison corrigée](air-screamer/integration-delivery-corrected.json).

### Références et réserves artistiques

Les sources Townfall récemment retrouvées dans le dossier ART92-e ont permis de dépasser les anciennes mentions d’absence de source d’ART144. Les huit fichiers de référence ont été comparés aux SHA historiques et examinés avant la génération. La distinction entre modèles finaux, concepts et autres formes est conservée dans [l’inventaire Townfall](townfall/references/source-inventory.json).

Lunger et Sorrowful restent des reconstructions latérales à partir de vues non orthographiques. Les marges verticales de Lunger sont étroites, environ 8 et 19 pixels au seuil visible utilisé, mais ses extrémités sont entières et le moteur les cadre correctement. Pour Fallen, la source retenue est le concept final **debout** ; l’ancien libellé de rig « rampant » n’a pas servi à inventer une quadrupédie.

The Weight suit le modèle poursuivant 08. Le concept 06 sert seulement à comprendre certains matériaux ; ses têtes alternatives et son filament ne sont pas assemblés au modèle final. Widow reste hors duel. La présence de RGB brun ou gris sous alpha zéro n’a pas été prise pour un fond opaque : aucun nettoyage procédural des images n’a été appliqué.

Larval Stalker a reçu une correction native de matière, du rendu initial trop clair vers une ombre charbon translucide. Sa faible visibilité sur un fond très sombre demeure une limite déclarée. La source de Tormented Soul ne mesure que 300 × 300 pixels : la profondeur de cage et les détails cachés ne sont pas attestés. Wall Corpse conserve son anatomie et ses supports, sans jambes inventées.

Hinako’s Father et Blood Baby ont reçu une correction d’orientation après leurs premiers essais en trois quarts. Pour le père, la pointe de l’arme dépasse les semelles d’environ 8,4 pixels dans le rendu contrôlé ; les pieds restent calés au sol. Le trajet exact des appendices éloignés et l’épaisseur de la vue latérale ne sont pas certifiés. Les quatre variantes supersédées restent entières dans les archives.

## Air Screamer : cycle conservé et défaut de sol corrigé

L’ancien déplacement utilisait déjà une vue latérale, mais les trois images de l’idle montraient le sujet de face. Cette passe remplace seulement les indices **0, 1 et 2** par un neutre, des ailes hautes et des ailes basses. Le portrait et le frame 3 du déplacement restent strictement identiques.

La séquence demeure `[0, 1, 0, 2]`, avec six ticks par étape, une boucle de 24 ticks et le walk statique `[3]`. Le compteur de clips animés n’augmente donc pas. L’importeur statique du projet n’a pas été modifié : un helper dédié verrouille les trois remplacements, les clips, les autres champs et les anciens fichiers.

La première QA a confirmé la cadence et la stabilité du corps, mais la revue des captures a trouvé un vrai défaut : la pointe basse descendait environ 24 à 25 pixels sous le plan physique du sol. Ce candidat a été tenu en réserve. Une édition imagegen a relevé la partie distale de l’aile ; un réglage commun de l’ancre de `0.735` à `0.745` a ensuite relevé les trois idles d’environ **3,629 pixels écran**, avec `anchorX: 0.51` et `bodyHeight: 0.42` constants.

La nouvelle QA observe une limite visible à **592,638** et une frange à **592,993**, pour un sol à **594**, dans les deux orientations. La pointe reste donc au-dessus du sol, avec environ **1,007 pixel de marge pour la frange**. Le contrôle de sol conserve sa tolérance de deux pixels. Aucun critère n’a été assoupli pour accepter le résultat.

Deux cycles complets ont été exécutés dans chaque orientation par les véritables commandes du moteur. Le déplacement maximal des repères corporels entre poses est de **0,9754 pixel monde**. Les six vues d’idle et les deux vues de déplacement ont été inspectées, puis relues indépendamment. Le nouvel idle flotte légèrement plus haut que le glide historique : ses repères de pieds sont environ 5,632 à 9,176 pixels au-dessus du point visible le plus bas du glide. Cette petite différence de posture est acceptée pour le profil volant et reste documentée.

[Rapport moteur corrigé](qa-native/air-screamer-corrected/report.json) · [Revue primaire](qa-native/air-screamer-corrected/visual-review.json) · [Revue indépendante](qa-native/air-screamer-corrected/peer-visual-review.json).

L’entrée provisoire a été retirée sous verrou et contrôle du SHA du registre complet, puis réimportée depuis son baseline exact avec le helper initial inchangé. Cette itération ne supprime aucun PNG et ne touche aucune autre entrée : [reçu de restauration](receipt-air-provisional-restoration.json). Le rapport technique antérieur et son avis visuel de réserve sont conservés séparément.

## Quatre arènes ajoutées

| ID | Œuvre et lieu retenu | Éléments de reconstruction |
| --- | --- | --- |
| `apartment_roof` | SH3, toit de Daisy Villa, rencontre Missionary | Dalles grises, garde-corps bas, local technique, ciel nocturne |
| `nightmare_mall` | SH3, arène du Split Worm | Trois ouvertures de tunnel visibles sur le mur du fond, galerie rouillée ; les autres ouvertures sont hors de ce cadrage |
| `prison_hc` | Homecoming, Overlook Penitentiary, Cell Block B | Cellules à barreaux, levier et passerelle grillagée de l’état normal |
| `downpour_streets` | Downpour, Pearl Creek, secteur Brite/Lansdale Bank | Façade de banque, bordure, arbre nu et échafaudage |

Les huit PNG natifs mesurent **1672 × 941**. Chaque arène utilise un fond et un avant-plan transparent, avec une faible parallaxe du second plan. Les compositions déjà présentes restent inchangées. Les images ne contiennent pas de combattants ajoutés au décor et le centre de l’aire de jeu reste lisible.

La caméra latérale et les détails cachés sont reconstruits ; les storyboards vidéo ne certifient pas chaque matériau, édition ou mesure de perspective. Ces deux plans statiques et leur parallaxe ne constituent pas une nouvelle animation source. [Livraison et références](stages/integration-delivery.json) · [Reçu d’intégration](receipt-stages.json) · [Revue des quatre captures](qa-native/stages/visual-review.json).

## Vérification finale

| Contrôle | Résultat retenu |
| --- | --- |
| Suites Node ciblées des sprites | **159 tests réussis**, zéro échec, annulation ou test ignoré |
| Suites Node ciblées des stages | **52 tests réussis**, zéro échec, annulation ou test ignoré |
| Build des manifestes et vérification des données | Réussis |
| Audit exact des imports et de la conservation | **384 contrôles réussis** |
| Fichiers protégés par le baseline | **59 identiques**, dont corpus et classeurs |
| PNG déjà référencés avant cette vague | **572 fichiers identiques octet pour octet** |
| Processus natifs retenus | **16 / 16 réussis** |
| Assertions natives retenues | **1 085** |
| Cas FightEngine | **16 cas de personnage et quatre cas d’arène** |
| Aperçus de référence d’atelier | **8**, pour quatre profils hors duel |
| Captures retenues dans la validation finale | **74**, dont **34 réellement inspectées** |
| Validation des preuves contre les fichiers finaux | **639 contrôles d’intégrité réussis** |

Le contrôle mémoire admet **1 324 paires de combattants affectées** sous le budget existant de 64 Mio ; le maximum décodé est de 62 919 680 octets. Pour les stages, **308 associations entre une nouvelle arène et une composition stockée** passent le même budget ; le maximum est de 25 174 376 octets. Ce sont des contrôles d’admission mémoire, pas autant de matchs joués.

Les processus utilisent le véritable `FightEngine`, le rendu Canvas natif et les callbacks existants d’`InputState`. Ils n’assignent pas directement les positions, orientations, horloges, phases ou états des acteurs. Les jeux de PNG, les entrées de catalogue utilisées, les modules du moteur, les captures et les décisions visuelles sont liés par SHA. Les imports ultérieurs sans rapport n’invalident pas artificiellement un rapport dont tous les éléments réellement testés restent exacts.

[Tests et vérification finale](final-checks.json) · [Tests des stages](targeted-stage-tests.tap) · [Audit de conservation](final-audit.json) · [Agrégation des preuves natives](native-evidence-final.json) · [Synthèse structurée](verification-summary.json).

Les anciens essais ne gonflent pas les totaux. Le lancement Air arrêté avant toute capture à cause d’un chemin de harness inexistant est conservé dans `qa-native/air-screamer`. Le passage technique d’Air avant correction, tenu en réserve par la revue visuelle, reste dans `qa-native/air-screamer-final`. Seul `qa-native/air-screamer-corrected` est retenu pour les statistiques finales d’Air. Les tests répétés de 159 cas ne sont comptés qu’une fois, avec les 52 cas de stage.

Une collision du verrou de validation a aussi interrompu le premier import Townfall B avant toute insertion ; le lot complet a ensuite été importé séquentiellement. Le reçu incomplet et le reçu réussi sont conservés. Un premier wrapper de synthèse attendait du TAP alors que Node avait produit le format spec ; la vérification finale force explicitement le reporter TAP et possède un code de sortie zéro enregistré.

## Ce qui reste à produire

Il reste **six anciennes vues**, **37 vues de combat absentes**, dont **26 portraits également absents**, et **48 arènes sans bitmap actif**. Parmi les arènes restantes, 33 ne sont pas bloquées par la politique de référence et 15 le sont.

Le [registre des manques](remaining-evidence.json) contient **43 profils** et leurs preuves : 16 cas de sources insuffisantes, 11 refus historiques directs, neuf arrêts liés à des refus apparentés et sept divergences du corpus ou de l’identité. Ses 90 pointeurs vers 17 fichiers de preuve ont été résolus et vérifiés. Les anciens refus n’ont pas été contournés en changeant de nom ou de phase.

Les six vues anciennes restantes sont Stalker de SH1, Maria Final Manifestation, Red Pyramid Thing de l’Arcade, Swarm de Book of Memories, Creeper Swarm du film et Red Pyramid du film. Le registre précise les différences entre sources distinctes, refus propres à un ID, refus apparentés et ambiguïtés de groupe. Par exemple, le Swarm de Book of Memories est illustré comme un insecte individuel ; sa source dorsale oblique de 127 pixels et la divergence avec la prose du corpus restent insuffisantes pour qualifier un profil exact.

## Portée des conclusions

Toutes les nouvelles vues gardent `fidelity: unverified`. La caméra opposée est obtenue par miroir de présentation et n’est pas une seconde anatomie sourcée. Les géométries cachées, les petites textures et le timing de l’œuvre d’origine ne sont pas certifiés. Les onze poses statiques et les plans de décor restent statiques ; le seul travail animé remplace les images d’un clip déjà existant.

La QA Canvas native ne couvre pas Chromium, le DOM/CSS, la livraison des touches par un navigateur réel, HTTP ou le service worker. Les suites globales Node et Python ne sont pas revendiquées comme relancées localement pour cette vague. Les deux workflows distants du point de départ `ebca8aa` ont été observés réussis dans [base-ci-status.json](base-ci-status.json) ; les exécutions déclenchées par le nouveau commit doivent être distinguées et relevées sur la PR elle-même.
