# Rapport QA — v0.2.0

**Date : 10 octobre 2026**
**Commande de référence : `npm test`**

## Résultat global

- **29 tests exécutés.**
- **29 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification réussie de **8 modules JavaScript** et **7 pages HTML**.
- Catalogue contrôlé : **184 manifestations**, **68 boss**, **53 arènes**, **14 Chroniques**, **15 sources**.
- Règles contrôlées : **12 traits**, **8 afflictions**, **7 dangers**.

## Couverture des tests

### Données et références — 9 tests

- Totaux v0.2.0 synchronisés.
- Identifiants uniques.
- Résolution de chaque source, arène, trait et affliction.
- Résolution de chaque danger d’arène.
- Résolution de tous les adversaires et lieux des Chroniques.
- Présence des ensembles Film Universe et Ascension.
- Métadonnées de dossier complètes.
- Six coups jouables et bornés pour chaque profil.
- Représentation effective de toutes les familles de règles.

### Moteur headless — 3 tests

- Avancement et rendu du moteur avec un contrat de canvas simulé.
- Transformation Otherworld forcée jusqu’à l’état final rendu.
- Modification des options d’Observation sans reconstruction du combat.

### Gameplay et équilibrage structurel — 10 tests

- Identité de durabilité et de puissance des boss.
- Projectiles des archétypes à distance.
- Bonus de saisie et Entrave du trait de constriction.
- Modificateur de profil bas.
- Échelle des projectiles pour Champ statique et Suppression.
- Résolution de tous les effets vers une affliction existante.
- Rang S pour une performance propre.
- Pénalités de rang liées aux dangers et à la faible vitalité.
- Ordre cohérent des seuils S–D.
- Conservation de la signature dans tous les Supers.

### Release, PWA et accessibilité — 5 tests

- Version synchronisée entre données, package, interface et service worker.
- Exports JSON identiques aux données runtime.
- Documentation générée avec les totaux réels.
- Cache PWA composé uniquement de fichiers existants.
- Landmarks, langue et titres présents sur les quatre pages principales.

### Rendu exhaustif — 2 tests

- Rendu des **53 arènes** en Fog World, transition et Otherworld.
- Rendu des **184 manifestations** dans quatre états et dans leur portrait.

## Vérifications du build

Le script `scripts/build.mjs` contrôle avant publication :

- unicité des identifiants ;
- limites de vitalité et complétude des profils ;
- validité des routes d’annulation ;
- validité des afflictions de coups et de dangers ;
- cohérence des statistiques exportées ;
- présence des fichiers requis ;
- syntaxe de tous les modules JavaScript ;
- résolution des ressources `src` et `href` locales ;
- génération du manifeste SHA-256 de `dist/`.

## Vérification HTTP locale

Le build a été servi sur `127.0.0.1:4173`. Les routes suivantes ont répondu en HTTP 200 :

- `/`
- `/modules/unified-versus`
- `/modules/chronicles`
- `/modules/archive`
- `/data/content-stats.json`
- `/data/combat-rules.json`
- `/service-worker.js`
- `/manifest.webmanifest`

Le fichier `content-stats.json` renvoie bien les valeurs `184 / 68 / 15 / 53 / 14`.

## Captures

Les captures de la v0.1.0 et leur planche de contact restent archivées dans le dossier Google Drive de QA afin de ne pas alourdir le dépôt source. Le navigateur automatisé local de cette session a refusé l’accès aux URL localhost par politique d’administration ; aucune nouvelle capture v0.2.0 n’a donc été présentée comme ayant été produite. La validation v0.2.0 s’appuie sur les tests de rendu exhaustifs, le moteur headless, les contrôles HTTP locaux et la vérification de production après déploiement.

## Limites connues

- La fidélité artistique finale reste une phase de production distincte ; les visuels actuels sont des silhouettes procédurales originales.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Les replays complets ne sont pas inclus.
- Le tactile cible principalement le joueur 1.
- Les sons restent procéduraux et ne reproduisent aucun enregistrement officiel.
