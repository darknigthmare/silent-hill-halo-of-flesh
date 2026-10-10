# Rapport QA — v0.4.0

**Date : 10 octobre 2026**  
**Commande de référence : `npm test`**

## Résultat automatisé

- **44 tests exécutés.**
- **44 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification de **8 modules JavaScript** et **7 pages HTML**.
- Catalogue : **230 manifestations**, **75 boss**, **123 arènes**, **15 Chroniques**, **16 sources**.
- Mise en scène : **460 fatalités de combattant**, **123 fatalités d’arène**, **374 animations d’arène**.
- Règles : **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA**, **150 transitions de boss**.

## Couverture des tests

### Données, catalogue et provenance — 14 tests

- Totaux v0.4.0 synchronisés et identifiants uniques.
- Résolution de chaque source, arène, trait, affliction, danger et profil IA.
- Résolution des quinze Chroniques.
- Présence des packs films, Ascension et Townfall.
- Métadonnées de dossier, traçabilité et deux fatalités par profil.
- Profils jouables, bornés et liés.
- Représentation de toutes les familles de règles.
- Deux phases ordonnées pour chacun des 75 boss.
- Audit de couverture complet dans le périmètre défini.
- Compatibilité des anciens identifiants v0.3.
- Totaux fatalités et animations recalculés depuis les données vivantes.

### Moteur headless — 9 tests

- Avancement et rendu du moteur.
- Transformation Otherworld forcée.
- Options d’Observation modifiables sans reconstruire le match.
- Phase de boss forcée et visible dans le snapshot.
- Endurance, jauge et Otherworld initial injectés par rite.
- Dette de sang déterministe.
- Fatalité d’arène déclenchée et terminée.
- Fatalité Signature déclenchée hors zone environnementale.
- Retour au KO classique lorsque les fatalités sont désactivées.

### Gameplay et équilibrage structurel — 13 tests

- Identité de durabilité et de puissance des boss.
- Projectiles, saisies, Entrave, profils bas et échelle des tirs.
- Résolution des effets vers les afflictions.
- Rangs S–D, pénalités et bonus fatalité borné.
- Conservation des signatures dans les Supers.
- Parité entre phases catalogue et profil de combat.
- Multiplicateurs de rites bornés.

### Release, PWA et accessibilité — 5 tests

- Version synchronisée entre données, package, interface et service worker.
- Exports JSON identiques au runtime.
- Documentation générée avec les totaux réels.
- Cache PWA composé uniquement de fichiers existants, y compris couverture et fatalités.
- Landmarks, langue, titres et contrôles Fatality présents.

### Rendu exhaustif — 3 tests

- Rendu des 123 arènes en Fog World, transition et Otherworld.
- Rendu des 230 manifestations dans quatre états et en portrait.
- Couche d’animation activable ou désactivable pour les 123 stages.

## Vérifications du build

`scripts/build.mjs` bloque la release si une source, une arène, une fatalité, une animation, un alias ou un document généré est incohérent. Il vérifie également la syntaxe JavaScript, les références HTML, les exports JSON et le manifeste SHA-256 de `dist/`.

## QA navigateur

La passe navigateur v0.4.0 couvre le Command Center, le roster audité, les dossiers, les fatalités Signature et d’arène, la galerie de stages, les Archives, la matrice de couverture et deux vues mobiles.

Détail : [`BROWSER_QA_v0.4.0.md`](BROWSER_QA_v0.4.0.md).

## Limites connues

- La fidélité artistique image par image reste une production distincte.
- Les fatalités sont des adaptations de fan-game lorsqu’aucune séquence canonique équivalente n’existe.
- La couverture complète se limite aux seize packs média et aux règles d’inclusion documentées.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Le tactile cible principalement le joueur 1.
- Les sons restent procéduraux et ne reproduisent aucun enregistrement officiel.
