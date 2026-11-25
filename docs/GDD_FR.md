# Game Design Document — SILENT HILL: HALO OF FLESH v0.7.0

## Production fixe — vague30, 25 novembre 2026

[Lot de quatorze images, intégration et limites](production/vague30/README.md) : trois poses, trois effets, six plans de décor et l’introduction/conclusion du récit individuel d’Air Screamer. La bible et les deux classeurs sont rafraîchis : 445 associations, 93 arènes illustrées et 31 commandes projectile couvertes. Les feuilles historiques et leurs formules sont préservées. [Inventaire restant](production/vague30/inventory.json). Aucun nouveau cycle animé ni certification 1:1.

**Intégration du 25 novembre 2026 :** le [guide commun de combat](COMBAT_GAMES_GUIDE_INTEGRATION.md)
complète ce document avec la [matrice des 30 rubriques](combat-guide/MATRICE.md),
les [associations aux données réelles](combat-guide/associations.json), les
[campagnes et Dénouements](combat-guide/CAMPAGNE_ET_DENOUEMENTS.md), les
[fiches de production](combat-guide/FICHES_ET_VALIDATION.md) et un
[bilan calculé](combat-guide/ETAT_DES_LIEUX.md). Les sections historiques décrivent
la conception v0.7 ; les états actuels et écarts sont explicités dans cette
intégration, sans compter les propositions comme fonctionnalités livrées.

**Complément de corpus du 19 novembre 2026 :** la [bible des œuvres Silent Hill](BIBLE_CORPUS_SILENT_HILL.md)
recense les jeux, éditions, récits dérivés et programmes officiels, avec leur
statut, leurs sources et leur place dans la production. Le catalogue documentaire
et le catalogue jouable sont suivis séparément.

## 1. Vision

Un jeu de combat 2D de collection où les manifestations, boss et adversaires significatifs de *Silent Hill* s’affrontent dans des lieux issus de leurs mondes respectifs. L’organisation de produit reprend la lisibilité modulaire de CQC Versus Legacy, tandis que chaque combattant devient un dossier complet : provenance, morphologie, comportement source, adaptation, vingt mouvements, trait, affliction, IA, phases, fatalités et arène.

Le projet ne cherche pas à transformer toutes les créatures en combattants humanoïdes standards. Il adapte leurs comportements à une arène versus tout en conservant leurs limites, leur rythme et leur fonction symbolique.

## 2. Piliers

### Fidélité démontrable

Un profil ne doit pas seulement porter un nom reconnaissable. Sa posture, sa taille relative, son rythme, ses armes, ses attaques et son contexte doivent produire une identité de jeu. Chaque mouvement affiche son niveau de preuve : directement attesté, composite lore-friendly ou adaptation versus.

### Morphologies réellement différentes

Humanoïdes, quadrupèdes, essaims, fantômes, insectes, masses, divinités, créatures murales, formes aériennes et boss géants ne partagent ni exactement les mêmes volumes, ni les mêmes déplacements, ni les mêmes solutions défensives.

### Vingt actions, commandes accessibles

Le joueur conserve un schéma compact : mouvement, garde, léger, lourd, technique, saisie, Nightmare et esquive. La direction, l’état au sol ou en l’air et quatre fenêtres contextuelles développent ce socle en vingt actions par manifestation sans ajouter vingt boutons.

### Otherworld vivant

L’arène participe au combat. La radio réagit à la proximité, la sirène transforme la scène, les éléments de décor sont animés, les dangers sont télégraphiés et les fatalités environnementales utilisent le lieu.

### Adversaires apprenants

L’IA combine personnalité, distance préférée, propriétés du moveset, fenêtres disponibles et lecture des répétitions du joueur. Elle choisit sans lire l’avenir entre projectile, assaut directionnel, retraite spéciale, piège, saisie, projection arrière, riposte ou attaque aérienne.

### Archive jouable

Le roster, les Chroniques, les arènes, les fatalités, les movesets, les rites, les systèmes, les phases et les relevés forment un registre cohérent plutôt qu’une liste indépendante.

## 3. Boucle principale

1. Choisir un mode depuis le registre radio/CRTV.
2. Accrocher Sujet I, Sujet II, l’arène, le rite et les règles.
3. Lire le dossier, la provenance, le trait, l’affliction et la doctrine.
4. Combattre en gérant garde, jauge, distance, propriétés de coups, fenêtres contextuelles, phase de boss et événements de scène.
5. Déclencher un KO, une fatalité Signature ou une fatalité d’arène.
6. Recevoir un rang et enregistrer les statistiques.
7. Continuer un run ou consulter les Archives.

## 4. Architecture des movesets

Chaque profil possède exactement vingt entrées :

| Groupe | Actions |
|---|---|
| Légers | neutre, avant, bas, air |
| Lourds | neutre, avant, bas, air |
| Projections | saisie avant, projection arrière |
| Ripostes contextuelles | sortie d’esquive, contre de garde parfaite, attaque de relevée |
| Techniques | neutre, avant, arrière, basse, aérienne |
| Nightmare | Super à jauge pleine |
| Désespoir | variante à jauge pleine sous 30 % de vitalité |

Chaque entrée peut déclarer : startup, active, recovery, dégâts, portée, hauteur, chip, garde, coût, déplacement horizontal et vertical, armure, rupture d’armure, invulnérabilité, multi-coups, intervalle, projectile, nombre, vitesse, taille, arc, gravité, durée, homing, piège, aura, posture de contre, téléportation, changement de côté, lancement, knockdown, chute dure, rebond, affliction, gain de jauge et annulations.

### Contrats contextuels

- **Projection arrière** : exige la direction opposée et la saisie, inverse les positions et impose une chute dure.
- **Riposte d’esquive** : disponible seulement pendant la sortie d’esquive, avec courte invulnérabilité et annulations limitées.
- **Contre de garde parfaite** : disponible après une parade, brise l’armure et restitue l’initiative.
- **Attaque de relevée** : disponible pendant la récupération au sol, possède une invulnérabilité courte et provoque un rebond.

### Niveaux de fidélité

- `direct-canonical` : geste, attaque, arme ou comportement directement attesté.
- `behavior-composite` : recomposition de comportements attestés pour produire une commande jouable.
- `versus-adaptation` : action nécessaire au versus, signalée comme telle.

Les 230 profils conservent **4 600 emplacements d'action**. Au relevé du
25 novembre 2026, **3 499 commandes sont activées** et **1 101 sont désactivées**
par les politiques de référence. Ces emplacements ne sont pas autant de
techniques officielles ni d'animations produites. Les niveaux de preuve et
l'admission au combat sont suivis séparément dans le [bilan calculé](combat-guide/ETAT_DES_LIEUX.md).

## 5. Système de combat

- Mise à jour logique fixe : 60 Hz.
- Déplacement horizontal, saut et accroupissement.
- Garde avec jauge, garde parfaite et bris de garde.
- Résolution des coups selon direction, orientation, état aérien et fenêtre contextuelle.
- Contres pendant le démarrage adverse et postures de contre dédiées.
- Projection arrière avec changement de côté.
- Chute dure, attaque de relevée et rebond au sol.
- Rupture d’armure par riposte de garde parfaite.
- Routes d’annulation déclarées par mouvement.
- Jauge Nightmare de 0 à 100, coût modifiable par rite.
- Nightmare et désespoir avec arrêt cinématique.
- Esquive avec invulnérabilité, délai de récupération et riposte.
- Corps à corps, projectiles, pièges, auras, téléportations, lancers, recul, hitstop et particules.
- Statuts persistants avec durée, tick et impact mécanique.
- Dangers d’arène télégraphiés.
- Transformation Otherworld progressive ou forcée.
- Santé et jauge injectables pour les runs à endurance.

## 6. IA

Les douze personnalités correspondent aux archétypes `balanced`, `rushdown`, `juggernaut`, `grappler`, `zoner`, `flyer`, `swarm`, `ghost`, `puppet`, `trickster`, `artillery` et `boss`.

L’IA évalue :

- portée préférée ;
- agressivité, défense et mobilité ;
- menace du coup adverse ;
- propriétés disponibles ;
- fenêtre de riposte après esquive ;
- fenêtre de contre après garde parfaite ;
- récupération au sol et reversal ;
- projection arrière des grapplers ;
- projectile neutre à longue distance ;
- technique avant pour fermer la distance ;
- technique arrière défensive ou téléportée ;
- piège ou attaque basse à portée intermédiaire ;
- Nightmare ou désespoir lorsque les conditions sont remplies ;
- répétitions récentes du joueur.

## 7. Traits, afflictions, dangers et rites

Les règles sont data-driven et exportées dans `data/combat-rules.json`.

- 12 traits modifient mobilité, armure, garde, projectile, esquive ou annulation.
- 8 afflictions agissent sur vitalité, déplacement, garde ou jauge Nightmare.
- 29 dangers combinent télégraphe, forme de zone, cible, blocage, dégâts et affliction.
- 14 terrains modifient mouvement, saut, esquive, friction, recul et récupération de garde.
- 15 bascules Otherworld possèdent signal, seuil, durée, radio et langage visuel propres.
- 22 événements environnementaux activent animation, obscurité, radio, danger et parfois terrain temporaire.
- 9 rites, standard inclus, modifient les règles globales.

## 8. Phases de boss

Les 75 boss possèdent deux transitions ordonnées, soit 150 passages de phase. Une phase comprend seuil de vitalité, nom, message, puissance, vitesse, armure, jauge, Otherworld et danger éventuel. Elle ne se déclenche qu’une fois par round et protège brièvement le boss.

## 9. Modes

- **Confrontation** : Sujet I contre CPU ou deux sujets locaux, règles configurables.
- **Descente** : sept combats aléatoires.
- **Rites du Jugement** : huit combats à modificateurs et endurance.
- **Grands Tourments** : six boss à endurance.
- **Salle d’Observation** : timer infini, hitboxes, jauge libre, reset, Otherworld et phase forcés, données de mouvement et fenêtres contextuelles.
- **Chroniques de la Brume** : quinze routes avec score et rang persistant.
- **Récits de manifestation** : structures individuelles avec intro, épreuves,
  rival et clôture ; 186 profils ont actuellement une file de rencontres
  admissible. Les autres restent consultables.
- **Le Rite des Huit** : tournoi de huit participants, trois duels du joueur.
- **Archives** : bestiaire, 4 600 mouvements, arènes, fatalités, couverture, règles, IA, phases et relevés.

Les Chroniques comprennent désormais des dossiers hors combat conservés dans
leur ordre narratif : 13 ont des rencontres, deux sont entièrement consultables.
La [campagne globale Le Registre des absences](combat-guide/CAMPAGNE_ET_DENOUEMENTS.md)
est une conception distincte, à implémenter. « Dénouements » est le vocabulaire
de bible retenu pour les conclusions Signature, Cauchemar et de lieu ; les clés
historiques du moteur restent inchangées.

## 10. Direction artistique et UI

- Palette : vert de moniteur délavé, ivoire sale, noir, rouille et rouge de signal.
- Menu asymétrique proche d’un registre de surveillance et d’un récepteur CRTV.
- Fréquence, intensité du signal, codes de dossier et cartes de preuve.
- Désignation Sujet I / Sujet II et navigation Retour à la Brume.
- Brume stratifiée et profondeur par plans.
- Grain, parasites, scanlines et vignetage optionnels.
- Otherworld interpolé.
- Prompts contextuels discrets dans le HUD.
- Interface originale : aucune reproduction d’un menu officiel.

## 11. Audio et haptique

Tout l’audio est synthétisé en temps réel : radio, interface, impacts, garde, dangers, sirène, Nightmare et KO. Aucun échantillon officiel n’est inclus. AudioContext et vibrations restent différés jusqu’à une interaction utilisateur.

## 12. Sauvegarde

`localStorage` conserve réglages, dernière confrontation, favoris, relevés, meilleurs rangs, progression des Chroniques et runs. Les alias historiques évitent la perte de progression après renommage d’une entrée. Les nouveaux relevés incluent projections arrière, ripostes d’esquive, contres de garde, relevées, ruptures d’armure et rebonds.

## 13. Production artistique suivante

**Phase courante — 25 novembre 2026 :** compléter les sprites de base, décors,
projectiles et illustrations fixes. La production de nouvelles animations
des étapes ci-dessous est différée ; leurs besoins restent documentés. Une
vue de sélection n'est pas un sprite de combat latéral et un candidat ne
constitue pas une validation 1:1. Voir les [fiches et critères](combat-guide/FICHES_ET_VALIDATION.md).

1. Référence autorisée par variante.
2. Proportions multi-vues.
3. Silhouette neutre originale.
4. Set de poses correspondant aux vingt actions.
5. Animation propre à la locomotion et aux coups directement attestés.
6. Transitions de chute, relevée et changement de côté adaptées à chaque morphologie.
7. Validation de lisibilité, échelle, source et droits.
8. Intégration en sprites originaux ou extension du renderer procédural.

## 14. Corpus de franchise et règle d'admission

La bible couvre les œuvres principales et les branches moins représentées :
jeux mobiles, expériences interactives, scénarios additionnels, remakes,
compilations, films, romans, bandes dessinées et collaborations officielles.
Le [registre détaillé](BIBLE_CORPUS_SILENT_HILL.md) distingue chaque œuvre, ses
alias, son édition, son état de publication et les sources effectivement
consultées. Son [équivalent structuré](production/franchise-corpus.json) et le
[classeur Corpus / Stages](production/SILENT_HILL_CORPUS_BIBLE.xlsx) rendent les
absences et prochaines actions filtrables.

**Silent Hill Transmission** est référencé comme programme officiel de
présentations de Konami. Ses annonces sont des preuves datées sur les œuvres
présentées ; le nom du programme ne crée pas à lui seul un univers jouable, un
monstre ou une arène. La même règle vaut pour les programmes promotionnels et
les produits de collection documentés dans le registre.

Un titre ajouté à la bible ne devient pas automatiquement une source du moteur.
Les seize groupes de sources existants conservent leurs identifiants. Un jeu
original, son remake, une adaptation filmée et une collaboration restent
distincts dans les références, même lorsque le runtime les regroupe encore.
Le libellé « officiel » décrit la provenance éditoriale ; il ne prouve pas une
continuité narrative commune entre ces médias.

Avant d'ajouter un combattant ou un lieu issu d'une branche nouvellement
documentée, la production doit disposer de :

1. l'œuvre, l'édition et la séquence précises ;
2. une preuve de l'identité et de la présence du sujet ou du lieu ;
3. vues lisibles de la silhouette ou de l'architecture nécessaires au cadrage ;
4. une distinction entre comportement observé et adaptation versus ;
5. références, limites et statut de validation conservés dans le dossier.

Les projets annulés et les contenus non publiés gardent ce statut. Une annonce
ne permet pas de reconstituer une campagne, un bestiaire ou des salles qui ne
sont pas documentés. Les adaptations littéraires et les crossovers constituent
des dossiers à étudier selon leurs propres références, sans transfert implicite
de leurs éléments vers un autre épisode.

### Suivi des stages manquants

La passe courante concerne les décors absents du catalogue existant. Chaque
livraison associe un lieu et un état précis à un fond et un premier plan
transparent indépendants, intégrés avec leurs dimensions et pixels natifs.
La parallaxe de deux plans fixes ne vaut pas validation d'une animation source.
Les restrictions de lieu et de phase restent celles de la fiche du moteur.

Les chiffres courants, les captures et les reports sont consignés dans le
[suivi de production](production/README.md). L'onglet **Stages** du complément
de bible expose les 123 lieux, la présence d'un bitmap actif, les blocages
documentaires et la prochaine action. Le classeur historique des movesets et
animations conserve ses annotations et sa date de référence.
