# Changelog

## 0.5.0 — 11 octobre 2026

### Movesets lore-first

- Remplacement des six attaques génériques par **seize actions par manifestation**.
- Catalogue porté à **3 680 mouvements** : 425 directement attestés, 2 796 composites lore-friendly et 459 adaptations versus.
- Ajout de `src/movesets.js` et de l’export `data/movesets.json`.
- Frame data, dégâts, portée, niveau, annulations, déplacements, armor, invulnérabilité, projectiles, pièges, auras, téléportations, lancement et knockdown documentés.
- Ajout du Nightmare et d’un mouvement de désespoir conditionnel à faible vitalité.

### Moteur et IA

- Résolution des variantes neutres, avant, basses et aériennes.
- Ajout des projectiles multiples, trajectoires, gravité, homing, pièges persistants, auras et postures de contre.
- IA mise à jour pour sélectionner les slots réels du moveset selon la distance et les propriétés du combattant.
- Observation enrichie avec input, mouvement actif et niveau de fidélité.

### Archives et interface

- Nouvel onglet **Movesets 1:1** couvrant les 230 profils.
- Dossiers Versus et Bestiaire enrichis avec les seize actions.
- Command Center remanié comme registre CRTV/radio avec fréquence, niveau de signal, codes de dossier et fiche de preuve.
- Palette et hiérarchie visuelle recentrées sur la brume, la rouille, l’ivoire sale et le rouge de signal.

### Documentation et QA

- Nouveau document exhaustif `docs/MOVESETS.md`.
- Mise à jour du GDD, des contrôles, de la provenance, de la parité CQC et du rapport QA.
- Suite portée à **49 tests automatisés**, tous réussis.
- Tests dédiés aux commandes directionnelles, au désespoir, aux projectiles, aux pièges et aux postures de contre.
- Service worker migré vers `halo-of-flesh-v0.5.0`.

## 0.4.0 — 10 octobre 2026

### Couverture et fidélité

- Audit source par source porté à **230 manifestations**, **75 boss**, **16 sources** et **15 Chroniques**.
- Ajout des fantômes nommés de *Silent Hill 4*, de variantes distinctes de *Silent Hill 2* et *Silent Hill 3*, d’adversaires de *Homecoming*, *The Arcade*, des films récents et de *Townfall*.
- Ajout de `catalogueStatus`, `nameStatus` et `evidenceTier` pour distinguer nom établi, variante visible et appellation descriptive.
- Ajout de `data/coverage-audit.json` et d’un audit généré bloquant la release en cas de lacune connue dans le périmètre défini.
- Conservation des identifiants v0.3 comme alias de sauvegarde.

### Fatalités

- Deux fatalités data-driven pour chaque manifestation : Signature et Nightmare.
- **460 fatalités de combattant** et **123 fatalités d’arène**.
- Nouvelle phase moteur `fatality` avec caméra, poses, effets, Otherworld, audio, vibrations, statistiques et résultat.
- Sélection automatique entre fatalité Signature et fatalité environnementale selon le coup décisif, le danger et la position.
- Options indépendantes pour fatalités Signature et fatalités d’arène.

### Arènes

- Catalogue porté à **123 arènes dédiées**.
- Ajout de **374 animations** : éclairage, radio, écrans, chaînes, machineries, eau, météo, ombres, trains, véhicules, pétales, cendres et Otherworld.
- Option permettant de couper les animations sans retirer l’arène.
- Galerie, dossiers et Archives enrichis avec animation, danger et fatalité propres au stage.

### Interface, données et QA

- Dossiers de manifestation enrichis avec fatalités, séquences, base documentaire et statut de fidélité.
- Résultats et records enrichis avec fatalités et fatalités d’arène.
- Export `data/fatalities.json`.
- Documentation générée pour le roster, la couverture, les fatalités et les stages.
- Service worker migré vers `halo-of-flesh-v0.4.0` avec les nouveaux exports hors ligne.

## 0.3.0 — 10 octobre 2026

### Modes et progression

- Ajout de **Rites du Jugement**, gauntlet de huit combats à modificateurs tournants.
- Ajout de huit rites actifs et d’un profil standard, soit neuf configurations exportées.
- Santé et jauge partiellement persistantes dans Rites du Jugement et Grands Tourments.
- Résultats enrichis avec rite courant, progression du run et statistiques de phase.

### Boss et IA

- Deux transitions pour chacun des 68 boss, soit **136 phases**.
- Seuils data-driven avec modification de vitesse, puissance, armure, jauge, dangers et Otherworld.
- Ajout de douze personnalités IA associées aux archétypes.
- IA adaptative capable de reconnaître les répétitions de saisie, lourd et technique.
- Bouton Observation permettant de forcer la phase de boss suivante.

### Combat et interface

- Sélecteur de rite dans la configuration de match.
- Dossiers enrichis avec personnalité IA et phases ordonnées.
- Archives étendues aux rites, profils IA et transitions de boss.
- Panneau Observation enrichi avec état, coup actif, distance, statut, phase et historique d’inputs.
- Durcissement de l’audio et des vibrations avant interaction utilisateur.
- Responsive validé sur Command Center et sélection mobile.

### Technique et QA

- Suite portée à **36 tests automatisés**.
- Tests supplémentaires sur rites, IA, phases, endurance, dette de sang et démarrage Otherworld.
- Sept captures navigateur v0.3.0, sans exception JavaScript.
- Exports JSON, documentation et manifeste de build étendus aux nouvelles règles.
- Cache PWA migré vers `halo-of-flesh-v0.3.0`.

## 0.2.0 — 10 octobre 2026

### Contenu

- Extension à **184 manifestations**, **68 boss**, **53 arènes**, **14 Chroniques** et **15 sources**.
- Ajout des ensembles Film Universe et *Silent Hill: Ascension*.
- Ajout de sept nouvelles arènes et de deux routes narratives.
- Enrichissement de chaque dossier avec trait, affliction, finisher et danger d’arène associé.

### Combat

- Ajout de douze traits de manifestation.
- Ajout de huit afflictions persistantes.
- Ajout de sept dangers d’arène télégraphiés.
- Ajout de la transformation Otherworld dynamique accompagnée d’une sirène procédurale.
- Ajout de la radio de proximité et de son brouillage visuel.
- Ajout de la garde parfaite, des contres et des routes d’annulation.
- IA adaptée aux archétypes et aux propriétés de coups.
- Ajout des rangs S à D et de statistiques de performance détaillées.

### Interface et archives

- Nouveaux réglages Otherworld, dangers, radio et secousse d’écran.
- Filtres et favoris étendus dans le roster.
- Nouveau panneau Systèmes dans les Archives.
- Résultats enrichis : rang, combo, dégâts, contres, gardes parfaites et dangers subis.
- Progression des Chroniques enrichie avec meilleur rang et meilleures statistiques.

### Technique

- Suite portée à 29 tests automatisés, incluant trois tests headless du moteur.
- Build et exports JSON synchronisés avec les règles de combat.
- Documentation roster, matrice et systèmes générée automatiquement.
- Cache PWA migré vers `halo-of-flesh-v0.2.0`.

## 0.1.0 — 10 octobre 2026

- Création du Command Center inspiré de CQC Versus Legacy v0.56.
- Ajout du moteur de combat canvas à pas fixe.
- Ajout de 169 manifestations, 63 boss, 46 arènes et 12 Chroniques.
- Ajout des modes Versus, Arcade, Grands Tourments et Observation.
- Ajout des Archives, de la matrice de fidélité et des rituels de clôture.
- Ajout du clavier 2P, des gamepads et du tactile P1.
- Ajout de la sauvegarde locale, des records et de la progression.
- Ajout du build Vercel, de la PWA, des tests et des exports JSON.
