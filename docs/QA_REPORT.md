# Rapport QA — v0.3.0

**Date : 10 octobre 2026**  
**Commande de référence : `npm test`**

## Résultat global

- **36 tests exécutés.**
- **36 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification de **8 modules JavaScript** et **7 pages HTML**.
- Catalogue : **184 manifestations**, **68 boss**, **53 arènes**, **14 Chroniques**, **15 sources**.
- Règles : **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA**, **136 transitions de boss**.

## Couverture des tests

### Données et références — 11 tests

- Totaux v0.3.0 synchronisés.
- Identifiants uniques.
- Résolution des sources, arènes, traits et afflictions.
- Résolution des dangers, Chroniques, films et Ascension.
- Métadonnées de dossier complètes.
- Profils jouables, bornés et liés.
- Représentation des familles de règles.
- Deux phases ordonnées par boss et aucune phase sur les profils réguliers.
- Métadonnées lisibles pour chaque rite et personnalité IA.

### Moteur headless — 6 tests

- Avancement et rendu du moteur.
- Transformation Otherworld forcée.
- Modification des options d’Observation sans reconstruction.
- Phase de boss forcée et visible dans le snapshot.
- Endurance, jauge et démarrage Otherworld injectés par rite.
- Dette de sang appliquée à cadence déterministe.

### Gameplay et équilibrage structurel — 12 tests

- Identité de durabilité et puissance des boss.
- Projectiles à distance.
- Bonus de saisie et Entrave.
- Profil bas.
- Échelle des projectiles.
- Résolution des effets vers les afflictions.
- Rang S et pénalités.
- Ordre des seuils S–D.
- Conservation de la signature dans les Supers.
- Parité entre phases catalogue et profil de combat.
- Multiplicateurs de rite bornés.

### Release, PWA et accessibilité — 5 tests

- Version synchronisée entre données, package, interface et service worker.
- Exports JSON identiques au runtime.
- Documentation générée avec les totaux réels.
- Cache PWA composé uniquement de fichiers existants.
- Landmarks, langue et titres présents.

### Rendu exhaustif — 2 tests

- Rendu des 53 arènes en Fog World, transition et Otherworld.
- Rendu des 184 manifestations dans quatre états et en portrait.

## QA navigateur

Sept vues ont été chargées et capturées dans Chromium via DevTools : Command, sélection Rites, combat Rites, Observation avec phase forcée, Archives Systèmes, Command mobile et sélection mobile.

- **7/7 pages chargées.**
- **0 exception JavaScript.**
- **0 erreur de ressource.**
- Affichage desktop et mobile validé.
- Audio et vibrations correctement différés avant interaction.

Détail : [`BROWSER_QA_v0.3.0.md`](BROWSER_QA_v0.3.0.md).

## Vérifications du build

`scripts/build.mjs` contrôle : unicité, bornes de vitalité, profils IA, phases, routes d’annulation, afflictions, rites, statistiques exportées, fichiers requis, syntaxe JavaScript, références HTML et manifeste SHA-256 de `dist/`.

## Routes HTTP contrôlées

- `/`
- `/modules/unified-versus.html?mode=ritual`
- `/modules/unified-versus.html?mode=training&autostart=1`
- `/modules/chronicles.html`
- `/modules/archive.html`
- `/data/content-stats.json`
- `/data/combat-rules.json`
- `/service-worker.js`
- `/manifest.webmanifest`

## Limites connues

- La fidélité artistique finale reste une phase de production distincte.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Les replays complets ne sont pas inclus.
- Le tactile cible principalement le joueur 1.
- Les sons restent procéduraux et ne reproduisent aucun enregistrement officiel.
