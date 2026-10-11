# Rapport QA — v0.7.0

**Date : 11 octobre 2026**  
**Commande de référence : `npm test`**

## Résultat automatisé

- **71 tests exécutés.**
- **71 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification de **10 modules JavaScript** et **9 pages HTML**.
- Build final : **39 fichiers statiques**.
- Catalogue : **230 manifestations**, **75 boss**, **123 arènes**, **15 Chroniques**, **16 sources**.
- Doctrines : **4 600 actions**, soit **20 commandes par manifestation**.
- Fidélité : **447 actions directement attestées**, **3 694 composites lore-friendly**, **459 adaptations Versus explicitement signalées**.

## Directeur d’arènes

- **14 terrains** modifient mouvement, saut, esquive, friction, recul et récupération de garde.
- **15 langages de bascule** possèdent signal, durée, seuil, intensité radio et rendu distincts.
- **22 familles d’événements** et **29 dangers télégraphiés**.
- **446 événements**, **359 interactions** et **474 liens de danger** distribués dans 123 doctrines.
- **374 pistes d’animation** filtrées selon Fog World, transition ou Otherworld.
- Première interaction liée à l’impact lourd ou au délai initial.
- Deuxième interaction liée à la transformation Otherworld à mi-course.
- Troisième interaction liée à la vitalité critique ou à la fin de round.
- Déclencheur, historique, terrain temporaire, obscurité et événement actif exposés dans le snapshot.
- Les 123 prémisses de lieu sont lisibles en français et ne retombent plus sur les identifiants bruts du catalogue.

## Contrôles moteur

- Terrain inondé, glacé, boueux, étroit, instable, floral, rituel, métallique et impossible.
- Inertie, glissade, esquive, recul, garde et largeur utile de l’arène.
- Événements liés aux impacts lourds, à la bascule et à la pression de fin de round.
- Dangers globaux, circulaires, en anneau, au bord, en ligne, au centre et en balayage.
- Otherworld forcé, transformation progressive et stages commençant déjà transformés.
- Radio de proximité, visibilité, brume et obscurité temporaires.
- Projectiles, pièges, auras, saisies, contres, phases de boss, fatalités et Rites préservés.

## Rendu exhaustif

- 123 arènes rendues en Fog World, transition et Otherworld.
- Les 15 langages Otherworld sont rendus indépendamment.
- Les 22 événements peuvent injecter leur animation temporaire.
- 230 manifestations rendues dans quatre états et en portrait.
- Couche d’animation testée activée et désactivée sur chaque stage.

## QA navigateur

- **15 parcours couverts.**
- **26/26 assertions réussies.**
- **0 erreur console.**
- **0 avertissement console.**
- **0 exception JavaScript.**
- **0 requête échouée inattendue.**
- **0 débordement horizontal détecté.**

Les parcours couvrent le menu, les options terrain/directeur, l’export de mémoire, la PWA, le repli hors ligne, la vraie 404, les movesets, Townfall, la sélection, le dossier, Observation, le déclenchement CRTV de St. Amelia Marina, les 123 stages, l’archive détaillée et trois vues mobiles.

Détail : [`BROWSER_QA_v0.7.0.md`](BROWSER_QA_v0.7.0.md).

## Limites déclarées

- Les lieux, objets, climats et motifs servent de base lore ; les zones de dégâts, timings, déclencheurs et multiplicateurs restent des adaptations de versus originales.
- La fidélité artistique image par image exige une production graphique originale dédiée.
- Les composites et adaptations sont distingués des actions directement observées.
- La couverture complète reste limitée aux seize packs et aux règles d’inclusion documentées.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Les sons restent procéduraux ; aucun enregistrement ou asset officiel n’est redistribué.
