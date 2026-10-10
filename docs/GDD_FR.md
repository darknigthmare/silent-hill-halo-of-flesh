# Game Design Document — SILENT HILL: HALO OF FLESH v0.2.0

## 1. Vision

Un jeu de combat 2D de collection où les manifestations de Silent Hill s’affrontent dans des arènes issues de leurs mondes respectifs. La forme reprend la lisibilité et la profondeur modulaire de CQC Versus Legacy, puis transforme chaque combattant en dossier de manifestation : apparence, comportement source, adaptation, signature, trait, affliction, finisher et lieu.

## 2. Piliers

### Fidélité lisible

Chaque combattant doit rester identifiable par sa silhouette, sa posture, son rythme, sa signature et son contexte. La fiche distingue systématiquement le comportement de référence des choix d’équilibrage.

### Morphologies réellement différentes

Les humanoïdes, quadrupèdes, essaims, fantômes, insectes, masses, divinités et boss géants ne partagent ni exactement les mêmes proportions, ni les mêmes déplacements, ni les mêmes fenêtres défensives.

### Combat accessible, couches avancées

Le socle utilise mouvement, garde, frappe, lourd, saisie, technique, Super et esquive. La v0.2.0 ajoute garde parfaite, contres, annulations, traits, afflictions et dangers sans rendre les commandes plus complexes.

### Otherworld vivant

L’arène n’est pas un décor passif. La radio réagit à la proximité, la sirène transforme la scène et les dangers sont annoncés avant leur impact.

### Archive jouable

Le roster n’est pas une simple liste : les Chroniques, arènes, dossiers, finishers, systèmes et records relient le contenu.

## 3. Boucle principale

1. Choisir un mode depuis le Command Center.
2. Sélectionner P1, P2, l’arène et les règles.
3. Lire les forces du profil, son trait et son affliction.
4. Combattre en plusieurs manches en gérant garde, jauge et événements de scène.
5. Recevoir un rang et enregistrer les statistiques.
6. Débloquer ou améliorer la progression des Chroniques.
7. Consulter ou exporter les Archives.

## 4. Système de combat

- Mise à jour logique fixe : 60 Hz.
- Déplacement horizontal, saut et accroupissement.
- Garde avec jauge, garde parfaite et bris de garde.
- Frappe légère, lourd, saisie, technique, projectile selon profil et Super.
- Contres sur démarrage adverse.
- Routes d’annulation déclarées par coup.
- Jauge Nightmare de 0 à 100.
- Super avec arrêt cinématique et effet de scène.
- Esquive avec invulnérabilité et délai de récupération.
- Collisions corps à corps, projectiles, recul, hitstop, secousse et particules.
- Statuts persistants avec durée, tick et impact mécanique.
- Dangers d’arène télégraphiés.
- Transformation Otherworld progressive.
- IA à trois niveaux, adaptée à l’archétype et aux propriétés du profil.

## 5. Archétypes

- `balanced` : polyvalent.
- `rushdown` : très mobile, faible portée.
- `juggernaut` : lourd, résistant.
- `grappler` : saisies et proximité.
- `zoner` : projectiles et contrôle.
- `flyer` : mobilité aérienne.
- `swarm` : petit, rapide, pression basse.
- `ghost` : feintes et traversées.
- `puppet` : rythme irrégulier et chaînes.
- `trickster` : mobilité et pièges.
- `artillery` : portée maximale.
- `boss` : vitalité, garde et impact supérieurs.

Chaque archétype reçoit un trait par défaut, mais un profil peut le remplacer pour respecter une identité particulière.

## 6. Traits, afflictions et dangers

Les règles sont data-driven et exportées dans `data/combat-rules.json`.

- 12 traits modifient mobilité, armure, garde, projectile, esquive ou annulation.
- 8 afflictions agissent sur vitalité, déplacement, garde ou jauge Nightmare.
- 7 dangers d’arène combinent télégraphe, zone, dégâts et affliction.

Le détail complet se trouve dans [`COMBAT_SYSTEMS.md`](COMBAT_SYSTEMS.md).

## 7. Modes

### Versus

1P contre CPU ou 2P local. Règles personnalisables : manches, timer, difficulté, Otherworld, dangers et radio.

### Arcade

Sept adversaires et arènes tirés du catalogue. Le meilleur parcours est conservé localement.

### Grands Tourments

Six boss successifs, arènes à dominante Otherworld.

### Observation

Adversaire contrôlé ou inerte, timer infini, reset, hitboxes, soin automatique, jauge libre et transformation forcée.

### Chroniques

Quatorze routes. Chaque route dispose d’un prologue, d’adversaires, d’arènes et d’une conclusion. Le meilleur rang S–D et les meilleures statistiques sont conservés.

### Archives

Bestiaire, arènes, matrice de fidélité, finishers, systèmes, records et export JSON complet.

## 8. Rang de performance

Le rang combine :

- vitalité restante ;
- dégâts infligés et reçus ;
- combo maximal ;
- gardes parfaites ;
- contres ;
- dangers subis.

Le calcul est centralisé dans `chronicleGrade()` afin que résultats et Chroniques utilisent la même règle.

## 9. Direction artistique

- Palette : vert délavé, ivoire sale, noir, rouille et rouge de signal.
- Brume stratifiée et profondeur par plans.
- Silhouettes lisibles à faible saturation.
- Texture analogique, grain et scanlines optionnels.
- Otherworld interpolé plutôt que simple changement instantané.
- Interface de dossier/terminal originale, sans reproduire une UI officielle.

## 10. Audio

Tout l’audio est synthétisé en temps réel : interface, impacts, garde, garde parfaite, dangers, sirène, Super et KO. Aucun échantillon de la franchise n’est inclus.

## 11. Sauvegarde

Données persistantes dans `localStorage` : réglages, dernier front, records, adversaires documentés, meilleurs rangs et progression des Chroniques. Les clés v1 sont conservées afin de ne pas perdre la progression de la v0.1.0.

## 12. Production artistique suivante

Pour atteindre une fidélité visuelle finale :

1. fiche de référence autorisée par variante ;
2. proportions multi-vues ;
3. silhouette neutre ;
4. set de poses et animations ;
5. validation de lisibilité en jeu ;
6. validation de conformité et de provenance ;
7. intégration comme sprites originaux ou extension du renderer procédural.
