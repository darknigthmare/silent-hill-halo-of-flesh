# Game Design Document — SILENT HILL: HALO OF FLESH v0.3.0

## 1. Vision

Un jeu de combat 2D de collection où les manifestations de Silent Hill s’affrontent dans des arènes issues de leurs mondes respectifs. La forme reprend la lisibilité et la profondeur modulaire de CQC Versus Legacy, puis transforme chaque combattant en dossier : apparence, comportement source, adaptation, signature, trait, affliction, IA, phases, finisher et lieu.

## 2. Piliers

### Fidélité lisible

Chaque combattant doit rester identifiable par sa silhouette, sa posture, son rythme, sa signature et son contexte. La fiche distingue systématiquement le comportement de référence des choix d’équilibrage.

### Morphologies réellement différentes

Les humanoïdes, quadrupèdes, essaims, fantômes, insectes, masses, divinités et boss géants ne partagent ni exactement les mêmes proportions, ni les mêmes déplacements, ni les mêmes fenêtres défensives.

### Combat accessible, couches avancées

Le socle utilise mouvement, garde, frappe, lourd, saisie, technique, Super et esquive. Les couches avancées ajoutent garde parfaite, contres, annulations, traits, afflictions, dangers, rites, endurance et phases sans multiplier les commandes.

### Otherworld vivant

L’arène n’est pas un décor passif. La radio réagit à la proximité, la sirène transforme la scène, les dangers sont annoncés et certains rites imposent immédiatement un état plus hostile.

### Adversaires apprenants

L’IA combine un profil d’archétype et une lecture des répétitions du joueur. Elle doit punir une habitude claire sans lire les inputs de manière injuste.

### Archive jouable

Le roster n’est pas une simple liste : Chroniques, arènes, dossiers, finishers, rites, systèmes, phases et records relient le contenu.

## 3. Boucle principale

1. Choisir un mode depuis le Command Center.
2. Sélectionner P1, P2, l’arène, le rite et les règles.
3. Lire les forces du profil, son trait, son affliction et son IA.
4. Combattre en gérant garde, jauge, phase de boss et événements de scène.
5. Recevoir un rang et enregistrer les statistiques.
6. Continuer un run avec endurance persistante ou améliorer une Chronique.
7. Consulter ou exporter les Archives.

## 4. Système de combat

- Mise à jour logique fixe : 60 Hz.
- Déplacement horizontal, saut et accroupissement.
- Garde avec jauge, garde parfaite et bris de garde.
- Frappe légère, lourd, saisie, technique, projectile selon profil et Super.
- Contres sur démarrage adverse.
- Routes d’annulation déclarées par coup.
- Jauge Nightmare de 0 à 100, coût modifiable par rite.
- Super avec arrêt cinématique et effet de scène.
- Esquive avec invulnérabilité et délai de récupération.
- Collisions corps à corps, projectiles, recul, hitstop, secousse et particules.
- Statuts persistants avec durée, tick et impact mécanique.
- Dangers d’arène télégraphiés.
- Transformation Otherworld progressive ou forcée.
- Santé et jauge initiales injectables pour les runs à endurance.
- IA à trois niveaux, profilée par archétype et optionnellement adaptative.

## 5. Archétypes et IA

Les douze archétypes sont `balanced`, `rushdown`, `juggernaut`, `grappler`, `zoner`, `flyer`, `swarm`, `ghost`, `puppet`, `trickster`, `artillery` et `boss`.

Chaque personnalité IA déclare :

- portée préférée ;
- agressivité et défense ;
- propension à garder, esquiver, saisir et tirer ;
- délai de réaction ;
- réponse aux répétitions du joueur.

L’adaptation ne prédit pas l’avenir : elle s’appuie uniquement sur un historique limité d’actions déjà observées.

## 6. Traits, afflictions, dangers et rites

Les règles sont data-driven et exportées dans `data/combat-rules.json`.

- 12 traits modifient mobilité, armure, garde, projectile, esquive ou annulation.
- 8 afflictions agissent sur vitalité, déplacement, garde ou jauge Nightmare.
- 7 dangers combinent télégraphe, zone, dégâts et affliction.
- 9 rites, standard inclus, modifient les règles globales du combat.

Le détail complet se trouve dans [`COMBAT_SYSTEMS.md`](COMBAT_SYSTEMS.md).

## 7. Phases de boss

Les 68 boss possèdent deux transitions ordonnées. Une phase comprend :

- seuil de vitalité ;
- nom et message d’alerte ;
- multiplicateurs de puissance, vitesse et armure ;
- gain de jauge ;
- déclenchement éventuel de l’Otherworld ;
- accélération ou forçage d’un danger.

Une phase ne se déclenche qu’une fois par round. Une courte invulnérabilité évite qu’un boss soit éliminé pendant sa transition.

## 8. Modes

### Versus

1P contre CPU ou 2P local. Manches, timer, difficulté, rite, Otherworld, dangers, radio et IA adaptative sont configurables.

### Arcade

Sept adversaires et arènes tirés du catalogue. Le meilleur parcours est conservé localement.

### Rites du Jugement

Huit combats, un rite actif différent par combat, deux rencontres de boss en fin de parcours et endurance persistante. La récupération entre les combats reste volontairement limitée.

### Grands Tourments

Six boss successifs, arènes à dominante Otherworld et endurance persistante.

### Observation

Timer infini, reset, hitboxes, soin automatique, jauge libre, transformation forcée, phase forcée et données d’inputs.

### Chroniques

Quatorze routes avec prologue, adversaires, arènes et conclusion. Le meilleur rang S–D et les meilleures statistiques sont conservés.

### Archives

Bestiaire, arènes, matrice de fidélité, finishers, traits, afflictions, dangers, rites, profils IA, phases, records et export JSON.

## 9. Rang de performance

Le rang combine vitalité restante, dégâts infligés et reçus, combo maximal, gardes parfaites, contres et dangers subis. Le calcul est centralisé dans `chronicleGrade()`.

## 10. Direction artistique

- Palette : vert délavé, ivoire sale, noir, rouille et rouge de signal.
- Brume stratifiée et profondeur par plans.
- Silhouettes lisibles à faible saturation.
- Texture analogique, grain et scanlines optionnels.
- Otherworld interpolé plutôt qu’un changement instantané.
- Interface de dossier originale, sans reproduire une UI officielle.

## 11. Audio et haptique

Tout l’audio est synthétisé en temps réel : interface, impacts, garde, dangers, sirène, Super et KO. Aucun échantillon de la franchise n’est inclus. AudioContext et vibrations restent désactivés tant qu’aucune interaction utilisateur n’a été détectée.

## 12. Sauvegarde

`localStorage` conserve réglages, dernier front, records, meilleurs rangs, progression des Chroniques, meilleur Arcade, meilleur Boss Rush, meilleur run de Rites et nombre de phases traversées. Les clés historiques sont conservées pour éviter une perte de progression.

## 13. Production artistique suivante

1. Fiche de référence autorisée par variante.
2. Proportions multi-vues.
3. Silhouette neutre.
4. Set de poses et animations.
5. Validation de lisibilité en jeu.
6. Validation de conformité et de provenance.
7. Intégration comme sprites originaux ou extension du renderer procédural.
