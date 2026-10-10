# Game Design Document — SILENT HILL: HALO OF FLESH v0.5.0

## 1. Vision

Un jeu de combat 2D de collection où les manifestations, boss et adversaires significatifs de Silent Hill s’affrontent dans des lieux issus de leurs mondes respectifs. L’organisation de produit reprend la lisibilité modulaire de CQC Versus Legacy, tandis que chaque combattant devient un dossier complet : provenance, morphologie, comportement source, adaptation, seize mouvements, trait, affliction, IA, phases, fatalités et arène.

## 2. Piliers

### Fidélité démontrable

Un profil ne doit pas seulement porter un nom reconnaissable. Sa posture, sa taille relative, son rythme, ses armes, ses attaques et son contexte doivent produire une identité de jeu. Chaque mouvement affiche son niveau de preuve : directement attesté, composite lore-friendly ou adaptation versus.

### Morphologies réellement différentes

Humanoïdes, quadrupèdes, essaims, fantômes, insectes, masses, divinités, créatures murales, formes aériennes et boss géants ne partagent ni exactement les mêmes volumes, ni les mêmes déplacements, ni les mêmes solutions défensives.

### Seize actions, six boutons

Le joueur conserve un schéma accessible : mouvement, garde, léger, lourd, technique, saisie, Nightmare et esquive. La direction et l’état au sol ou en l’air développent ce socle en seize actions par manifestation, sans créer une interface de commandes surchargée.

### Otherworld vivant

L’arène participe au combat. La radio réagit à la proximité, la sirène transforme la scène, les éléments de décor sont animés, les dangers sont télégraphiés et les fatalités environnementales utilisent le lieu.

### Adversaires apprenants

L’IA combine personnalité, distance préférée, propriétés du moveset et lecture des répétitions du joueur. Elle choisit entre projectile neutre, assaut directionnel, retraite spéciale, piège, saisie ou attaque aérienne sans lire l’avenir.

### Archive jouable

Le roster, les Chroniques, les arènes, les fatalités, les movesets, les rites, les systèmes, les phases et les records forment un registre cohérent plutôt qu’une liste indépendante.

## 3. Boucle principale

1. Choisir un mode depuis le Command Center radio/CRTV.
2. Sélectionner P1, P2, l’arène, le rite et les règles.
3. Lire le dossier, la provenance, le trait, l’affliction et le moveset.
4. Combattre en gérant garde, jauge, distance, propriétés de coups, phase de boss et événements de scène.
5. Déclencher un KO, une fatalité Signature ou une fatalité d’arène.
6. Recevoir un rang et enregistrer les statistiques.
7. Continuer un run ou consulter les Archives.

## 4. Architecture des movesets

Chaque profil possède exactement seize entrées :

| Groupe | Actions |
|---|---|
| Légers | neutre, avant, bas, air |
| Lourds | neutre, avant, bas, air |
| Prise | saisie |
| Techniques | neutre, avant, arrière, bas, air |
| Nightmare | Super à jauge pleine |
| Désespoir | variante à jauge pleine sous 30 % de vitalité |

Chaque entrée peut déclarer : startup, active, recovery, dégâts, portée, niveau de garde, chip, garde, déplacement, déplacement vertical, armor, invulnérabilité, multi-coups, intervalle, projectile, nombre, vitesse, taille, arc, gravité, durée, homing, piège, aura, posture de contre, téléportation, lancement, knockdown, affliction, coût/gain de jauge et annulations.

### Niveaux de fidélité

- `direct-canonical` : geste, attaque, arme ou comportement directement attesté.
- `behavior-composite` : recomposition de comportements attestés pour produire une commande jouable.
- `versus-adaptation` : action nécessaire au versus, signalée comme telle.

Les 230 profils totalisent 3 680 actions : 425 directes, 2 796 composites et 459 adaptations.

## 5. Système de combat

- Mise à jour logique fixe : 60 Hz.
- Déplacement horizontal, saut et accroupissement.
- Garde avec jauge, garde parfaite et bris de garde.
- Résolution contextuelle des coups selon direction et état aérien.
- Contres pendant le démarrage adverse et postures de contre dédiées.
- Routes d’annulation déclarées par mouvement.
- Jauge Nightmare de 0 à 100, coût modifiable par rite.
- Nightmare et désespoir avec arrêt cinématique.
- Esquive avec invulnérabilité et délai de récupération.
- Corps à corps, projectiles, pièges, auras, téléportations, lancer, recul, hitstop et particules.
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
- propriété du coup disponible ;
- projectile neutre à longue distance ;
- spécial avant pour fermer la distance ;
- spécial arrière défensif ou téléporté à courte distance ;
- piège/attaque basse à portée intermédiaire ;
- saisie des archétypes lourds ;
- Nightmare ou désespoir lorsque les conditions sont remplies ;
- répétitions récentes du joueur.

## 7. Traits, afflictions, dangers et rites

Les règles sont data-driven et exportées dans `data/combat-rules.json`.

- 12 traits modifient mobilité, armure, garde, projectile, esquive ou annulation.
- 8 afflictions agissent sur vitalité, déplacement, garde ou jauge Nightmare.
- 7 dangers combinent télégraphe, zone, dégâts et affliction.
- 9 rites, standard inclus, modifient les règles globales.

## 8. Phases de boss

Les 75 boss possèdent deux transitions ordonnées, soit 150 passages de phase. Une phase comprend seuil de vitalité, nom, message, puissance, vitesse, armure, jauge, Otherworld et danger éventuel. Elle ne se déclenche qu’une fois par round et protège brièvement le boss.

## 9. Modes

- **Confrontation / Versus** : 1P CPU ou 2P local, règles configurables.
- **Descente / Arcade** : sept combats aléatoires.
- **Rites du Jugement** : huit combats à modificateurs et endurance.
- **Grands Tourments** : six boss à endurance.
- **Salle d’Observation** : timer infini, hitboxes, jauge libre, reset, Otherworld et phase forcés, données de mouvement.
- **Chroniques de la Brume** : quinze routes avec score et rang persistant.
- **Archives** : bestiaire, 3 680 mouvements, arènes, fatalités, couverture, règles, IA, phases et records.

## 10. Direction artistique et UI

- Palette : vert de moniteur délavé, ivoire sale, noir, rouille et rouge de signal.
- Menu asymétrique proche d’un registre de surveillance et d’un récepteur CRTV.
- Fréquence, intensité du signal, codes de dossier et cartes de preuve.
- Brume stratifiée et profondeur par plans.
- Grain, parasites, scanlines et vignetage optionnels.
- Otherworld interpolé.
- Interface originale : aucune reproduction d’un menu officiel.

## 11. Audio et haptique

Tout l’audio est synthétisé en temps réel : radio, interface, impacts, garde, dangers, sirène, Nightmare et KO. Aucun échantillon officiel n’est inclus. AudioContext et vibrations restent différés jusqu’à une interaction utilisateur.

## 12. Sauvegarde

`localStorage` conserve réglages, dernier front, favoris, records, meilleurs rangs, progression des Chroniques et runs. Les alias historiques évitent la perte de progression après renommage d’une entrée.

## 13. Production artistique suivante

1. Référence autorisée par variante.
2. Proportions multi-vues.
3. Silhouette neutre originale.
4. Set de poses correspondant aux seize actions.
5. Animation propre à la locomotion et aux coups directement attestés.
6. Validation de lisibilité, échelle, source et droits.
7. Intégration en sprites originaux ou extension du renderer procédural.
