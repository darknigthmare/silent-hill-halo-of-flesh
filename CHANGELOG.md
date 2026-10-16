## 0.9.2 — Inspection et cadrage des images

- Inspecteur intégré : poses présentes/absentes, chronologie, orientation, repères,
  calibration exportable et application atomique sur empreintes exactes.
- Caméra partagée par le monde et les collisions ; HUD indépendant ; enveloppes
  des images complètes, sans déformer individuellement les personnages.
- Horloges de poses déterministes, pause/gel d’impact, états garde/esquive/KO/phase.
- Audit complet des PNG et décodage WebP via Pillow ; transparence, CRC, filtres,
  troncature et réencodage de copies vérifiés.
- Aucun nouveau sprite individuel accepté. Voir docs/SPRITE_CONTINUATION_v0.9.2.md.

## 0.9.0 — 14 octobre 2026
Parcours persistants et reprises, résultats par emplacement du joueur (duels miroir corrigés), statistiques personnelles, rangs de Chroniques de bout en bout, commandes reconfigurables, saut/accroupissement tactile, pause accessible, sauvegardes/imports validés et conditions de sortie explicites. 202 tests Node ; les détails et limites de navigateur figurent dans `docs/QA_v0.9.0.md`.

# v0.8.2 — Impacts, avertissements et ambiance

- Interruption réelle des coups ; armure et parades cohérentes ; pas de contre physique à distance sur un projectile.
- Trajet complet des projectiles et sens d’impact conservé ; dégâts bornés, attribution des afflictions, fin de round avant les actions post-mortem.
- Transitions automatiques de boss séquentielles ; Observation conserve son passage manuel.
- Ambiance radio/CRTV/sirène/cloches/portraits/projecteurs séparée des dégâts ; aucune attaque de secours dans un stage calme.
- Deux avertissements automatiques maximum ; événements refusés non consommés ; terrain changé seulement à l’impact annoncé.
- Aléatoire cosmétique séparé du gameplay ; mémoire de commande de huit frames pendant hitstop ; touches purgées sur pause, perte de focus et nouveau round.

# v0.8.1 — Corps, collisions et lieux cohérents

Voir [les notes détaillées](docs/RELEASE_NOTES_v0.8.1.md). 30 régressions supplémentaires ; 109 tests passent. Corrections des collisions, sols, dangers mobiles, motifs des lieux et intérieurs. Navigation navigateur non validée ici.

# v0.8.0 — Living Stage Cinematography

- 22 chorégraphies de décors originaux réellement animées et liées aux événements des 123 stages.
- Un objet de scène visible accompagne les dangers (rame, chariot, casier, racines, glace, CRTV, etc.) dans les mêmes zones télégraphiées.
- IA capable d’éviter les dangers annoncés ou de garder lorsqu’aucune voie de fuite n’existe.
- Contrôle de déterminisme du gameplay indépendant du nombre de rendus graphiques.
- Codex détaillé des chorégraphies avec provenance déclarée ; prévisualisation à mi-événement.
- Respect des options animations désactivées et mouvement réduit.
- Conservation du catalogue 230 combattants / 123 stages / 4 600 mouvements.

# Changelog

## 0.7.0 — 11 octobre 2026

### Gameplay environnemental lore-first

- Ajout de **14 profils de terrain** agissant sur déplacement, saut, esquive, friction, recul et récupération de garde.
- Ajout de **15 styles de bascule** adaptés aux sources et lieux au lieu d’un Otherworld rouillé universel.
- Ajout de **22 événements environnementaux** et de leur mise en scène moteur.
- Extension à **29 dangers** avec formes de zone, cible, télégraphe, blocage et affliction propres.
- Ajout de **446 événements**, **359 interactions** et **474 liens de danger** sur les 123 arènes.
- Terrain temporaire pendant la montée des eaux, le gel, la floraison, le rituel et l’attraction du vide.
- Cadence, visibilité, radio, largeur utile et départ éventuel en Otherworld définis par stage.

### Stages et animations

- Rendu différencié pour rouille, décomposition, chair, hantise, miroir, glace, orage, élément, boucle, floraison, sanctuaire, cendre, rituel, signal CRTV et vide.
- Animation filtrée selon Fog World, transition ou Otherworld.
- Événement actif injecté dans les couches animées du stage.
- Galerie d’Archives transformée en registre détaillé : terrain, bascule, dangers, événements, interactions, animations et base lore.
- Sélection et dossiers enrichis avec doctrine environnementale complète.

### QA et traçabilité

- Export `data/stage-director.json` et règles complètes dans `data/combat-rules.json`.
- Documentation automatique `docs/STAGE_DIRECTOR.md`.
- Tests dédiés aux terrains, bascules, événements, formes de danger et rendu de toutes les doctrines.

## 0.6.1 — 11 octobre 2026

### Résilience PWA et récupération

- Séparation du cache statique et du cache runtime.
- Shell initial allégé ; `movesets.json` n’est plus préchargé pendant l’installation.
- Navigation et données en network-first, ressources statiques en stale-while-revalidate.
- Ajout d’une page hors ligne indépendante et d’une vraie page HTTP 404.
- Mise à jour, purge et réarmement du service worker pilotables depuis l’interface.
- Manifeste enrichi avec identité stable, langue, portée et raccourcis PWA.

### Mémoire et accessibilité

- Export JSON versionné de la progression, des réglages et des relevés.
- Import avec validation de schéma et liste blanche des clés autorisées.
- Réinitialisation globale des données du projet.
- Lien d’évitement, région de statut, focus visible et états ARIA synchronisés.
- Modale d’options avec piège de focus, fermeture Échap et restauration du focus.
- Animation suspendue hors vue et notifications repositionnées sur mobile.

### Serveur et sécurité

- Serveur limité à GET/HEAD, réponse 405 pour les méthodes d’écriture et protection contre la traversée de chemin.
- En-têtes CSP, frame protection, COOP/CORP, nosniff, référent et permissions alignés entre local et Vercel.
- Communications iframe validées par fenêtre source et origine.
- Suppression des scripts intégrés dans les routes HTML de compatibilité.

### QA

- Suite portée à **63 tests automatisés**, tous réussis.
- Vérification de 9 modules JavaScript, 9 pages HTML et 37 fichiers statiques.
- QA Chromium : 13 parcours, 20 assertions, zéro erreur console, avertissement, exception, échec réseau inattendu ou débordement horizontal.

## 0.6.0 — 11 octobre 2026

### Doctrine contextuelle

- Passage de seize à **vingt actions par manifestation**.
- Catalogue porté à **4 600 mouvements** : 447 directement attestés, 3 694 composites lore-friendly et 459 adaptations versus.
- Ajout de la projection arrière, de la riposte d’esquive, du contre après garde parfaite et de l’attaque de relevée.
- Contrats moteur explicites : changement de côté, chute dure, rupture d’armure, invulnérabilité de reversal et rebond au sol.
- Noms, bases canoniques, frame data et fidélité conservés pour les 230 doctrines.

### Moteur, IA et score

- Fenêtres contextuelles réellement exécutables et refusées hors condition.
- IA capable d’exploiter ripostes, relevées et projections arrière.
- HUD de combat et Salle d’Observation enrichis avec les fenêtres `DODGE`, `P-GUARD` et `RISE`.
- Statistiques persistantes : ripostes de garde, ripostes d’esquive, relevées, projections arrière, ruptures d’armure et rebonds.
- Bonus de maîtrise contextuelle borné dans le calcul des rangs.
- Présentations d’introduction et lignes de victoire issues des doctrines.

### Interface Silent Hill

- Désignation Sujet I / Sujet II dans la sélection et les résultats.
- Navigation « Retour à la Brume » harmonisée.
- Libellés CRTV/radio localisés et compteur de Chroniques corrigé à quinze.
- Onglets d’Archives mobiles repliés sur plusieurs lignes au lieu de sortir de l’écran.
- Registre des vingt commandes et propriétés contextuelles dans les Archives et dossiers Versus.

### Provenance, QA et build

- Description de *The Weight* ajustée aux comportements de recherche, chasse et agrippement observés après la sortie de *Townfall* ; appellations de guides toujours signalées.
- Validation de chaque contrat contextuel dans `scripts/build.mjs`.
- Suite automatisée étendue à **54 tests**.
- QA Chromium : 11 parcours, 11 assertions, zéro erreur console, zéro exception, zéro échec réseau et zéro débordement.
- Cache PWA, exports JSON, documentation et build statique migrés vers v0.6.0.

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
