# Rapport QA — v0.5.0

**Date : 11 octobre 2026**
**Commande de référence : `npm test`**

## Résultat automatisé

- **49 tests exécutés.**
- **49 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit dans `dist/`.
- Vérification de **9 modules JavaScript** et **7 pages HTML**.
- Catalogue : **230 manifestations**, **75 boss**, **123 arènes**, **15 Chroniques**, **16 sources**.
- Movesets : **3 680 mouvements**, dont **425 directs**, **2 796 composites** et **459 adaptations versus**.
- Mise en scène : **460 fatalités de combattant**, **123 fatalités d’arène**, **374 animations d’arène**.
- Règles : **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA**, **150 transitions de boss**.

## Données et provenance

- Totaux v0.5.0 synchronisés et identifiants uniques.
- Résolution de chaque source, arène, trait, affliction, danger, rite et IA.
- Seize mouvements exactement pour chaque profil.
- Input, nom, frame data, portée, dégâts, base canonique et fidélité obligatoires.
- Toute annulation pointe vers un mouvement existant.
- Chaque combattant source non adapté possède au moins une action directement attestée.
- Les set-pieces adaptés restent signalés.
- Audit de couverture sans lacune connue dans le périmètre documenté.
- Compatibilité des anciens identifiants.

## Moteur headless

- Avancement et rendu du moteur.
- Transformation Otherworld forcée.
- Options Observation sans reconstruction du match.
- Phase de boss forcée.
- Endurance, jauge et Otherworld injectés par rite.
- Dette de sang déterministe.
- Fatalité d’arène, fatalité Signature et KO classique.
- Résolution des variantes avant, basse et aérienne.
- Nightmare remplacé par le désespoir sous le seuil de vitalité.
- Projectiles et pièges issus de leurs slots dédiés.
- Posture de contre activée pendant la technique correspondante.
- Snapshot contenant input, nom et fidélité du mouvement actif.

## Gameplay et structure

- Boss plus résistants et puissants en moyenne.
- Projectiles sur archétypes à distance.
- Saisies renforcées pour grapplers.
- Profils bas, armure, Entrave et effets cohérents.
- Afflictions toutes résolues.
- Phases catalogue/profil identiques.
- Multiplicateurs de rites bornés.
- Rangs S–D ordonnés.

## Release, PWA et accessibilité

- Version synchronisée entre package, interface et service worker.
- Exports JSON identiques au runtime, dont `movesets.json`.
- Documentation générée avec les totaux vivants.
- Cache PWA composé uniquement de fichiers existants.
- Landmarks, langue, titres, options Fatality et onglet Movesets présents.
- Build bloqué si un mouvement, une source, une arène, une animation ou un alias est incohérent.

## Rendu exhaustif

- 123 arènes rendues en Fog World, transition et Otherworld.
- 230 manifestations rendues en quatre états et en portrait.
- Couche d’animation testée activée et désactivée sur chaque stage.

## QA navigateur

La passe Chrome for Testing v0.5.0 est reproductible via `npm run qa:browser`. Elle vérifie le nouveau Command Center, les options CRTV/radio, l’onglet Movesets, le dossier complet, la sélection, l’Observation, la galerie des arènes et les formats mobiles. Le rapport mesuré et les captures sont consignés dans `BROWSER_QA_v0.5.0.md` et `tests/captures-v050/` par la CI de publication.

## Limites connues

- La fidélité graphique image par image nécessite une production artistique originale dédiée.
- Les composites et adaptations ne sont pas présentés comme animations officielles.
- La couverture complète reste limitée aux seize packs et aux règles d’inclusion documentées.
- Multijoueur réseau et rollback non inclus.
- Tactile principalement P1.
- Sons procéduraux, aucun enregistrement officiel.
