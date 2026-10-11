# Rapport QA — v0.6.0

**Date : 11 octobre 2026**
**Commande de référence : `npm test`**

## Résultat automatisé

- **54 tests exécutés.**
- **54 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification de **9 modules JavaScript** et **7 pages HTML**.
- Build final : **35 fichiers statiques**.
- Catalogue : **230 manifestations**, **75 boss**, **123 arènes**, **15 Chroniques**, **16 sources**.
- Doctrines : **4 600 actions**, soit **20 commandes par manifestation**.
- Fidélité : **447 actions directement attestées**, **3 694 composites lore-friendly**, **459 adaptations Versus explicitement signalées**.
- Mise en scène : **460 fatalités de combattant**, **123 fatalités d’arène**, **374 animations d’arène**.
- Règles : **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA**, **150 transitions de boss**.

## Données, doctrine et provenance

- Totaux v0.6.0 synchronisés et identifiants uniques.
- Résolution de chaque source, arène, trait, affliction, danger, rite et personnalité IA.
- Exactement vingt actions pour chacun des 230 profils.
- Input, nom, frame data, portée, dégâts, coût, effet, base canonique et niveau de fidélité obligatoires.
- Toute annulation pointe vers une action existante.
- Chaque combattant non adapté possède au moins une action directement attestée.
- Les set-pieces, présences passives et entités normalement non combattues restent signalés comme adaptations.
- Compatibilité des anciens identifiants et sauvegardes.
- Exports `roster.json`, `movesets.json`, `combat-rules.json`, `content-stats.json`, `coverage-audit.json` et `fatalities.json` identiques au runtime.

## Moteur headless

- Avancement et rendu du moteur.
- Transformation Otherworld forcée.
- Options Observation modifiables sans reconstruire le match.
- Phases de boss forcées et reflétées dans le snapshot.
- Endurance, jauge et Otherworld injectés par les rites.
- Dette de sang déterministe.
- Fatalité d’arène, fatalité Signature et KO classique.
- Résolution des variantes avant, basse, aérienne et directionnelle.
- Nightmare accessible uniquement sous son seuil de vitalité documenté.
- Projectiles, pièges et postures de contre issus de leurs slots dédiés.
- Snapshot contenant input, nom, fidélité et fenêtre contextuelle de l’action active.

## Quatre ripostes contextuelles

- **Projection arrière** : changement de côté et chute dure.
- **Riposte d’esquive** : disponible uniquement dans la fenêtre post-esquive avec invulnérabilité bornée.
- **Contre de garde parfaite** : ouverture après perfect guard et rupture d’armure.
- **Attaque de relevée** : reversal pendant le relevé et rebond au sol.
- Les quatre contrats sont validés pour l’intégralité des 230 manifestations.
- Les compteurs `backThrows`, `dodgeAttacks`, `guardCounters`, `wakeupAttacks`, `armorBreaks` et `groundBounces` persistent dans les résultats et les Archives.

## Gameplay et équilibrage structurel

- Boss plus résistants et puissants en moyenne.
- Projectiles cohérents pour les profils à distance.
- Saisies renforcées pour les grapplers.
- Profils bas, armure, Entrave, projectiles et effets résolus.
- Phases catalogue/profil identiques.
- Multiplicateurs de rites bornés.
- Rangs S–D ordonnés.
- Bonus de maîtrise contextuelle borné afin de ne pas écraser la performance principale.

## Release, PWA et accessibilité

- Version synchronisée entre package, interface, manifeste et service worker.
- Documentation générée depuis les données vivantes.
- Cache PWA composé uniquement de fichiers existants.
- Landmarks, langue, titres, options Fatality, onglet Movesets et navigation mobile vérifiés.
- Build bloqué si une action, source, arène, fatalité, animation, alias ou documentation générée est incohérente.

## Rendu exhaustif

- 123 arènes rendues en Fog World, transition et Otherworld.
- 230 manifestations rendues dans quatre états et en portrait.
- Couche d’animation testée activée et désactivée sur chaque stage.

## QA navigateur

La passe Chromium / Playwright v0.6.0 est reproductible via `npm run qa:browser`.

- **11 parcours et 11 assertions réussis.**
- **0 erreur console.**
- **0 avertissement console.**
- **0 exception JavaScript.**
- **0 requête échouée.**
- **0 débordement horizontal détecté.**

Elle couvre le menu principal, les options CRTV/radio, le registre des movesets, la fiche Townfall de The Weight, la sélection Versus, le dossier à vingt actions, l’Observation contextuelle, la galerie des stages et trois vues mobiles.

Détail : [`BROWSER_QA_v0.6.0.md`](BROWSER_QA_v0.6.0.md).

## Limites connues

- La fidélité artistique image par image exige une production graphique originale dédiée.
- Les composites et adaptations sont explicitement distingués des actions directement observées dans les œuvres sources.
- La couverture complète reste limitée aux seize packs et aux règles d’inclusion documentées.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Le tactile cible principalement le joueur 1.
- Les sons restent procéduraux ; aucun enregistrement officiel n’est redistribué.
