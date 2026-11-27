# Extensions du guide — Silent Hill: Halo of Flesh

**Révision : 27 novembre 2026.** Référence de lecture du dépôt : `f01622bf097fb980f354f7f0fb55df3685f4e92a`.

Les deux extensions sont rattachées à la [bible de combat](../../COMBAT_GAMES_GUIDE_INTEGRATION.md), au [GDD](../../GDD_FR.md), à la [bible du corpus](../../BIBLE_CORPUS_SILENT_HILL.md) et à la campagne documentaire [Le Registre des absences](../CAMPAGNE_ET_DENOUEMENTS.md). Elles couvrent les **38 sections 30–67** qui prolongent les 30 sections du guide général.

Cette intégration fournit des décisions de conception, **48 fiches reliées au catalogue** et **40 scénarios de recette préparés**. Elle ne produit pas à elle seule de nouvelles images, de clips, de système de tag ou de connexion d’abonnement. Les bases déjà présentes dans le code sont signalées séparément.

## 1. Sources et usage

| Source originale | Sections | Taille | SHA256 |
| --- | --- | ---: | --- |
| [Guide général](../source/Combat_Games_Guide_General_v1.0.txt) | 00–29 | 55 172 octets | `4844584616072ac0d52d37c2fab4365e1ec489240f17a721ee216e223b0355b7` |
| [Extension 01 — Tag, taunts et bonus](../source/Combat_Games_Extension_01_Tag_Taunts_Bonus_v1.0.txt) | 30–49 | 60 589 octets | `330fb7485a7a52b2a20f855646c940aaac0fcd9510032bc84b2e17c518edd25f` |
| [Extension 02 — Verrous et déblocages](../source/Combat_Games_Extension_02_Slots_Verrouilles_Deblocages_Abonnes_v1.0.txt) | 50–67 | 47 334 octets | `08b57ea542e83c487fef3276997a612d4657f2ee9ed4f8e46b0bf65a2778038b` |

Les copies sont identiques aux fichiers sources récupérés. Les identifiants et liens d’origine sont conservés dans [requirements.json](requirements.json), avec les limites de lignes de chaque section. Le guide général était déjà présent ; les deux extensions sont ajoutées sans réécriture de leur texte.

La source d’autorité des nouvelles exigences est **requirements.json**. Elle contient décision, priorité, adaptation Silent Hill, observation, fichiers concernés, limites et critères. Les [48 fiches](examples.json) décrivent les sujets concrets. La [matrice commune](../MATRICE.md) et les classeurs doivent être produits par la chaîne existante, sans recopier manuellement ces 38 sections dans le fichier historique.

Les états de fidélité du JSON sont `canon-atteste`, `adaptation-jouable`, `original-compatible`, `alternatif-crossover` et `a-confirmer`. Aucun des nouveaux montages de cette passe n’est étiqueté comme une scène canonique. Une observation déjà présente dans le dossier garde son niveau de preuve secondaire et ses captures manquantes.

## 2. Les règles propres à ce projet

Le moteur reste JavaScript/Canvas 2D. La phase artistique reste celle des images fixes ; les besoins d’animation sont écrits pour leur phase de production. Les IDs de personnages, lieux et Chroniques sont conservés. Un nouveau nom d’attitude, d’épreuve ou de scène reçoit un ID documentaire `SHCGX_…`, jamais un faux ID de combattant livré.

Le roster réunit des manifestations, boss et autres profils précisément définis. Un personnage humain absent du roster ne devient pas jouable pour compléter un modèle de campagne. Un dossier hors duel conserve son rôle. En particulier, `downpour_doll_106` reste un **obstacle environnemental** stationnaire ; `sh4_wall_man_056` reste un **boss lié à son support mural** ; `sh2_twin_pyramid_heads_031` demeure un **profil à plusieurs corps**, sans fusion en géant ni membre de réserve gratuit.

Une identité de nom ou un groupe source ne suffit pas à confondre les versions. SH2 original, remake, films et variantes conservent leurs armes, gestes et silhouettes. Le groupe `film` n’atteste pas une continuité unique entre ses films. Aucune étape de déblocage ne permet de contourner une restriction de `combatReferencePolicy`.

Les noms **Dénouements**, **Résonance**, **Archives du Registre** et ceux des fiches nouvelles sont des créations de ce jeu. Ils n’ajoutent pas une terminologie officielle à Silent Hill. Les références d’autres jeux du guide inspirent des systèmes ; elles ne prouvent aucun pouvoir ou comportement des créatures de Silent Hill.

## 3. Attitudes et cycle de sélection

La commande `taunt` existe déjà dans [player-input.js](../../../src/player-input.js). [Fight.beginTaunt](../../../src/fight.js) crée une piste d’au moins 66 ticks de simulation ; les commandes et interruptions autorisées annulent la présentation. Cette base ne valide pas les dessins ni les clips.

Les huit fiches d’attitude proposent entrée, tenue, sortie, sons, contraintes et contrôle d’interruption. Un découpage de 12 + 30 + 24 ticks est une hypothèse compatible avec ce minimum, pas une mesure canonique. Aucun taunt de ce premier lot ne donne de ressource, d’invulnérabilité ou de dégâts.

| Profil existant | Attitude proposée | Détail à préserver |
| --- | --- | --- |
| `sh1_air_screamer_001` | Ailes en suspens | Déploiement et cri, sans onde sonique. |
| `sh1_groaner_003` | Menace basse | Quatre appuis, gueule et grattement ; aucun maintien au sol déduit du bond. |
| `sh2_lying_figure_020` | Torse contrarié | Bras enfermés, aucun jet actif pendant la provocation. |
| `sh2_mannequin_022` | Immobilité décalée | Deux paires de jambes, aucune tête ou main ajoutée. |
| `sh2_bubble_head_nurse_024` | Saccade du regard absent | Uniforme et tuyau SH2 original, pas la Nurse d’un film. |
| `sh3_closer_036` | Tête au-dessus des bras | Masse des bras conservée, aucun effet d’aura. |
| `sh3_double_head_040` | Appel sans réponse | Un seul chien à tête fendue, aucun renfort invoqué. |
| `sh4_wall_man_056` | Le bras immobile | Torse fixé au mur, aucun corps libre inventé. |

Chaque sujet possède aussi une fiche de sélection : focus, aperçu, confirmation, attente, changement de costume, désélection complète, sortie abrégée, éventuelle validation d’équipe et départ vers le combat. La désélection est un geste propre, pas automatiquement l’animation de confirmation jouée à l’envers.

Le choix logique est pris en compte immédiatement. Chaque curseur garde son propre aperçu et invalide les résultats d’une ancienne animation. Le retrait nettoie voix, particules, ombres, support et entités de l’aperçu. Les poses fixes du mode à mouvements réduits donnent les mêmes informations. L’aperçu d’un sujet ne change pas son admission au combat.

## 4. Équipes, interventions et Dénouements collectifs

### Profil cible

La fiche `SHCGX_TEAM_HYBRID_V0` prépare deux membres : un actif et une réserve, chacun avec sa vie ; l’équipe perd après les deux KO. Nightmare reste une ressource individuelle. La jauge d’équipe **Résonance** est une proposition distincte, avec ses coûts, cooldowns et état du partenaire.

Les valeurs initiales du JSON — capacité 100, départ 50, gains/couts et durées — sont des hypothèses de prototype à équilibrer. Elles ne modifient aucun mode existant par leur seule présence dans la bible. Un refus avant engagement ne prélève rien ; un engagement validé ne dépense qu’une fois. Un partenaire en assistance ou en sortie ne peut simultanément entrer dans un tag ou un super. Le survivant rejoint gratuitement après KO lorsque la règle l’exige.

Le premier relais volontaire conserve vie, munitions, Nightmare, cooldowns, statuts et historique de combo. Un tag n’efface pas les rebonds déjà consommés. Le contrôle est transféré à un tick précis, une seule fois. Les relais de combo et de secours restent différés ; aucune guérison automatique de réserve n’est supposée.

### Six assistances et trois duos

Les six assistances réutilisent une **action individuelle déjà activée** : griffure planée d’Air Screamer, bond mordu de Groaner, jet thoracique de Lying Figure, jambes supérieures de Mannequin, poussée du bras de Closer, bond et morsure brève de Double Head. Chaque fiche définit appel, arrivée, action, sortie, cooldown, dégâts reçus et interruption. Une assistance n’est pas un troisième combattant gratuit.

| Duo de conception | Participants et lieu | Contribution et statut |
| --- | --- | --- |
| **Cercle dans la brume** | Groaner + Air Screamer ; `old_silent_hill` | Bond mordu puis griffure planée. Coopération de versus originale ; pas une alliance attestée. |
| **Angle mort** | Lying Figure + Mannequin ; `woodside` | Jet thoracique puis jambes supérieures. Aucun bras libéré ni nouveau visage. |
| **Issue obstruée** | Double Head + Closer ; `shopping_mall` | Bond bref puis poussée du bras. Pas de transformation du bond en prise prolongée ni d’aura. |

Les deux membres doivent être disponibles et admis. Une longue chorégraphie démarre seulement après confirmation d’une ouverture sur une cible compatible. Garde et échec reçoivent une résolution courte, avec le coût et la récupération prévus. Les participants sont réservés pendant la scène ; positions, membre actif et ressources de sortie sont déterminés.

Les Dénouements collectifs se déroulent après résultat acquis. Les fins conditionnelles vérifient les versions, le lieu et la disponibilité des membres. Priorité proposée : **conditionnel exact → collectif compatible → individuel compatible → victoire simple**. Une cible géante, immatérielle, fixe ou en essaim reçoit le remplacement prévu. Aucun membre KO ne revient implicitement participer ; une scène de présentation ne change pas le vainqueur.

## 5. Clashes et entités : limites concrètes

Le clash de départ est un miroir de Bubble Head Nurse avec contact réel entre deux attaques au tuyau. Il s’agit d’une **règle de versus originale**. Le profil stable sépare les sujets sans QTE. Un profil spectacle facultatif peut employer un appui bref remappé, avec fenêtre commune, égalité, absence de réponse et interruption définies. Le martèlement n’est pas imposé.

Simultanéité, fréquence et priorité des collisions se calculent dans la simulation. Le troisième projectile ou l’assistance arrivant au même tick doit suivre une résolution reproductible indépendante du côté. Horloge, entités et ressources sont gelées ou poursuivies selon une seule règle commune. Passer la scène mène au même état final.

Trois fiches évitent d’appliquer aveuglément un modèle de compagnon :

- **Doll / Shadows** : rencontre fixe, propriétaire identifié, projections distinctes, disparition après destruction du mannequin selon le dossier existant. La fiche ne lui accorde pas de marche, d’attaque directe ni de contrôle libre de combattant. La salle exacte et les captures primaires restent à établir ; `overlook` est un contexte de catalogue, pas une preuve de localisation.
- **Twin Pyramid Heads** : deux corps et deux lances sous un profil de rencontre. Aucun passage automatique à deux slots de tag. Le stage `hotel_otherworld` ne prouve pas à lui seul que la salle finale exacte est produite.
- **Jet thoracique de Lying Figure** : propriétaire stable après relais, impacts uniques, durée et retrait définis. Aucun guidage, reflet, sol empoisonné persistant ou nuage de mort du remake n’est ajouté sans référence et règle distincte.

Pour chaque entité, les fiches définissent propriétaire touché, en réserve ou KO, transition, nouvelle manche, scène et futur replay. Une image d’illusion ne devient pas un acteur avec collision par défaut. Les limites de présence sont des paramètres de projet à tester, pas des quantités canoniques.

## 6. Bonus et Archives du Registre

| Épreuve documentaire | Raccord | But et conséquence |
| --- | --- | --- |
| **Trace dans la rue** | `SHC_CAM_01` / `SHC_CAM_08`, Air Screamer, `old_silent_hill` | Parcourir trois repères avec les déplacements autorisés ; épreuve facultative, sans projectile ajouté. |
| **Le poids du passage** | `SHC_CAM_02`, grande lame, `blue_creek` | Trois contacts mesurés contre des repères d’essai originaux puis récupération ; aucun véhicule ou prisonnier inventé comme fait officiel. |
| **Ce qui ne se bat pas** | `SHC_CAM_06`, dossiers `harry_ice` et `maya_villa` | Identifier deux observations de poursuite ; aucun point de vie, faux KO ou promotion des présences en combattants. |
| **Deux mouvements, une ouverture** | Prototype de versus alternatif SH2 | Deux relais sûrs et une ouverture de duo ; dépend du système d’équipe réellement implémenté. |

Les chronos et scores proposés sont des réglages, pas des mesures des jeux sources. Chaque épreuve décrit début, objectif, succès/échec, reprise, ressource transmise et deux illustrations fixes à produire. Un échec facultatif permet de continuer. Une récompense n’est attribuée qu’après évaluation de sa règle et ne se duplique pas à la reprise.

La rubrique horde du guide reste couverte : elle demande un budget, des apparitions lisibles et une solution pour les kits limités. Aucune horde canonique artificiellement fragilisée n’est créée dans cette passe. Une éventuelle épreuve de destruction ou de foule doit d’abord avoir ses références ou être clairement annoncée comme simulation originale.

Les **Archives du Registre** prolongent la campagne déjà conçue. C’est une carte 2D de consultation avec vestibule, dossiers séparés par œuvre et zone d’observation. Ses connexions sont des liens d’archive, pas des portes physiques qui relieraient arbitrairement tous les Silent Hill. Toute future pièce réelle, seuil ou passage de stage exige une référence géographique.

Les récompenses sont ciblées, liées au catalogue commun et enregistrées avant la révélation. Une clé ne dépend jamais du contenu qu’elle ouvre. La consultation utile et l’apprentissage existant restent accessibles. Réouvrir un dossier ne facture rien une seconde fois.

## 7. Verrous et droits : quatre dimensions

| Dimension | États ou question |
| --- | --- |
| **Découverte** | Secret, indice/silhouette, identifié. |
| **Droit d’accès** | Aucun, à réclamer, permanent, temporaire actif, vérification en attente, retiré/expiré. |
| **Installation** | Fichiers prêts et compatibles, installation requise, erreur ou indisponibilité. |
| **Compatibilité** | Rôle, mode, édition, équipe et dépendances autorisent-ils l’utilisation ? |

Le champ descriptif `unlock` du catalogue ne remplace pas ces axes. `combatEnabled` est une décision de rôle, pas une preuve de propriété. Une silhouette reconnaissable ne convient pas à un secret complet : le slot emploie alors un emblème neutre, y compris dans le texte accessible, les notifications et la voix.

La direction UI proposée emploie dossiers scellés, plaques opaques et marques de fermeture lisibles. Cette métaphore originale ne transforme pas un cadenas en objet canonique et n’invente pas un sens magique à un symbole de la série. Icône, texte et focus portent ensemble l’état. Mouvements réduits et absence de flash transmettent les mêmes informations.

Un slot verrouillé reste consultable. La confirmation ouvre la condition, elle n’ajoute pas un choix interdit. La sélection aléatoire évalue les contenus utilisables. Un costume acquis avant son personnage reste acquis ; un costume qui change le kit doit être classé comme variante. Aucune nouvelle tenue officielle n’est inventée pour remplir le module : sa source et ses assets restent requis avant production.

Pour un stage, sélection et participation sont distinctes. Toutes les destinations nécessaires sont préparées avant le match. Une version statique de confort n’est pas conditionnée à un abonnement. Les modes existants, options et entraînement ne sont pas rétroactivement verrouillés ; les premières règles portent sur de nouveaux contenus de collection ou défis additionnels.

### Conditions et attribution

Les règles structurées utilisent `all` et `any` : le dossier Air Screamer peut demander **(chapitre terminé OU épreuve réussie) ET dossier consulté** ; la présentation du duo peut venir d’un **défi permanent OU d’un droit temporaire futur vérifié**. La consultation n’exige pas la possession du dossier, ce qui évite un cycle.

Chaque source de droit est enregistrée séparément. La fin du temporaire n’efface pas le permanent. L’attribution est automatique ou à réclamer selon la fiche ; « Récompense disponible » n’est affiché que pour cette seconde étape. Une fermeture pendant la révélation conserve le gain. La rétroactivité se fonde uniquement sur des traces réellement enregistrées.

## 8. Soutien : un contrat préparé, sans activation commerciale

La fiche `SHCGX_SUPPORTER_CATALOGUE_DRAFT` décrit un catalogue temporaire éventuel. **Fournisseur, campagne, niveaux, prix et connexion ne sont pas configurés.** L’état `commercialAuthorized: false` du projet reste inchangé ; voir [COMMERCIAL_READINESS](../../COMMERCIAL_READINESS.md). Cette documentation ne crée pas d’offre, de paiement ou de lien de souscription.

Le même contenu peut avoir une voie de défi donnant une acquisition permanente. Une éventuelle récompense permanente d’abonnement ou un lot de période possède son propre contrat ; il ne doit pas être confondu avec le catalogue temporaire.

La future liaison serait volontaire, via le parcours officiel du fournisseur et un service de confiance. Aucun mot de passe ou secret n’entre dans le client Canvas. Compte lié et avantage confirmé sont distincts. Les événements sont vérifiés, dédupliqués et réconciliés ; les modalités et références techniques seront revérifiées lors de l’implémentation.

Une panne signifie vérification indisponible, pas abonnement terminé. Annulation, baisse de niveau, retrait, déliaison et suppression de compte restent des événements différents. Les durées hors ligne restent à définir ; aucune date non établie n’est promise. Une partie autorisée conserve sa configuration jusqu’au résultat, puis le prochain match réévalue les droits. Préférences, progression et sources permanentes restent conservées.

## 9. Recette et bilan documentaire

Les 18 cas de la section 47 et les 22 cas de la section 64 sont adaptés dans `acceptanceTests` avec **Given / When / Then**, sections liées et résultat `not-run`. Ils couvrent notamment sélection rapide, interruption, simultanéité de commandes, coûts, KO du soutien, échec de super, mauvais contexte de conclusion, clash tiers, propriétaires d’entités, récompenses, secrets, ET/OU, dépendances, expiration, panne et migration.

Le contrôle documentaire ne fait passer aucun de ces cas de jeu. [validation.json](validation.json) expose seulement intégrité des sources, sections, références et structure des fiches.

| Unité de cette intégration | Quantité | État |
| --- | ---: | --- |
| Sources d’extension | 2 | Copies exactes contrôlées. |
| Sections ajoutées | 38 | Décisions et adaptations documentées. |
| Fiches détaillées | 48 | 16 familles de modèles couvertes ; IDs reliés. |
| Taunts / cycles de sélection | 8 / 8 | Conception ; pas de nouveaux clips livrés. |
| Assistances / duos / bonus | 6 / 3 / 4 | Propositions à implémenter et produire. |
| Cas de recette | 40 | Préparés, non exécutés comme systèmes complets. |
| Nouveaux assets ou clips de cette passe documentaire | 0 | Les productions artistiques parallèles se comptent dans leur propre lot. |
| Fidélités 1:1 certifiées par ces documents | 0 | Références et contrôle visuel restent nécessaires. |

### Ordre proposé

1. Maintenir la matrice, les sources et les liens aux classeurs.
2. Produire une attitude et un cycle de sélection complets sur un sujet déjà admis, puis vérifier interruption et nettoyage.
3. Valider un état d’accès gratuit permanent avec sauvegarde et quatre axes.
4. Prototyper une assistance et un relais à deux membres, sans modifier les règles des modes historiques.
5. Ajouter une super duo, ses échecs et une conclusion de remplacement.
6. Construire une épreuve et un dossier explorable avec reprise avant d’étendre leurs contenus.
7. Étudier service externe et réseau seulement dans leurs chantiers dédiés.

Chaque étape se termine avec des preuves propres à son périmètre. Une ligne de bible, une pose, une animation, une intégration, une recette et une publication restent six résultats différents.
