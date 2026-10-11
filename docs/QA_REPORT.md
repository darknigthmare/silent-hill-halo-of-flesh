# Rapport QA — v0.6.1

**Date : 11 octobre 2026**
**Commande de référence : `npm test`**

## Résultat automatisé

- **63 tests exécutés.**
- **63 réussites.**
- **0 échec, 0 test ignoré.**
- Build statique produit avec succès dans `dist/`.
- Vérification de **9 modules JavaScript** et **9 pages HTML**.
- Build final : **37 fichiers statiques**.
- Catalogue : **230 manifestations**, **75 boss**, **123 arènes**, **15 Chroniques**, **16 sources**.
- Doctrines : **4 600 actions**, soit **20 commandes par manifestation**.
- Fidélité : **447 actions directement attestées**, **3 694 composites lore-friendly**, **459 adaptations Versus explicitement signalées**.
- Mise en scène : **460 fatalités de combattant**, **123 fatalités d’arène**, **374 animations d’arène**.
- Règles : **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA**, **150 transitions de boss**.

## Données, doctrine et provenance

- Totaux v0.6.1 synchronisés et identifiants uniques.
- Résolution de chaque source, arène, trait, affliction, danger, rite et personnalité IA.
- Exactement vingt actions pour chacun des 230 profils.
- Input, nom, frame data, portée, dégâts, coût, effet, base canonique et niveau de fidélité obligatoires.
- Toute annulation pointe vers une action existante.
- Chaque combattant non adapté possède au moins une action directement attestée.
- Les set-pieces, présences passives et entités normalement non combattues restent signalés comme adaptations.
- Compatibilité des anciens identifiants et sauvegardes.
- Exports JSON identiques aux données vivantes du moteur.

## Moteur headless

- Avancement, rendu, Otherworld, rites et phases de boss.
- Fatalité d’arène, fatalité Signature et KO classique.
- Variantes avant, basse, aérienne et directionnelle.
- Projectiles, pièges, auras, téléportations, saisies et postures de contre.
- Projection arrière, riposte d’esquive, contre de garde parfaite et reversal de relevée.
- Snapshot contenant input, nom, fidélité, phase et fenêtre contextuelle.
- Statistiques contextuelles et rangs bornés.

## Durcissement de plateforme — neuf contrôles dédiés

1. Normalisation et import/export sécurisé des sauvegardes.
2. Manifeste PWA complet, identifiant stable, langue, portée et raccourcis.
3. Service worker à caches séparés et shell initial léger.
4. Absence de préchargement du lourd `movesets.json`.
5. Page hors ligne déclarée et présente dans le build.
6. Véritable page 404 et réponse HTTP correspondante.
7. En-têtes de sécurité cohérents sur serveur local et Vercel.
8. Absence de scripts intégrés dans les pages HTML distribuées.
9. Communications iframe et messages du service worker contrôlés.

## Accessibilité et résilience

- Lien d’évitement et landmarks.
- État ARIA des bascules.
- Fenêtre d’options avec piège de focus, fermeture Échap et restauration du focus.
- Région de statut système en direct.
- Export et import de mémoire vérifiés.
- Purge et réarmement du cache hors ligne.
- Respect du mouvement réduit et suspension des animations hors vue.
- Serveur GET/HEAD, code 405 pour les écritures et protection de chemin.

## Rendu exhaustif

- 123 arènes rendues en Fog World, transition et Otherworld.
- 230 manifestations rendues dans quatre états et en portrait.
- Couche d’animation testée activée et désactivée sur chaque stage.

## QA navigateur

La passe Chromium / Playwright v0.6.1 est reproductible via `npm run qa:browser` après installation des dépendances de développement.

- **13 parcours couverts.**
- **20/20 assertions réussies.**
- **0 erreur console.**
- **0 avertissement console.**
- **0 exception JavaScript.**
- **0 requête échouée inattendue.**
- **0 débordement horizontal détecté.**

Elle couvre le menu, les options et le focus, l’export de mémoire, le service worker, le cache critique, le repli hors ligne, la vraie 404, le registre des movesets, la fiche Townfall, la sélection Versus, le dossier complet, l’Observation contextuelle, la galerie des stages et trois vues mobiles.

Détail : [`BROWSER_QA_v0.6.1.md`](BROWSER_QA_v0.6.1.md).

## Limites connues

- La fidélité artistique image par image exige une production graphique originale dédiée.
- Les composites et adaptations sont explicitement distingués des actions directement observées.
- La couverture complète reste limitée aux seize packs et aux règles d’inclusion documentées.
- Le multijoueur réseau et le rollback ne sont pas inclus.
- Le tactile cible principalement Sujet I.
- Les sons restent procéduraux ; aucun enregistrement officiel n’est redistribué.
