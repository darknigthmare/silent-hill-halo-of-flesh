# QA navigateur — v0.3.0

**Date : 10 octobre 2026**  
**Navigateur : Chromium 144 headless, protocole DevTools**  
**Résolution desktop : 1600 × 1000**  
**Résolution mobile : 430 × 932**

## Parcours capturés

1. Command Center v0.3.0.
2. Sélection Rites du Jugement.
3. Combat Rites du Jugement avec Otherworld actif.
4. Observation avec phase de boss forcée.
5. Archives — onglet Systèmes.
6. Command Center mobile.
7. Sélection mobile.

## Contrôles

- Chargement complet de chaque page.
- Absence d’exception JavaScript.
- Absence d’erreur de ressource locale.
- Affichage du nouveau mode et de la version.
- Démarrage automatique du combat pour le test moteur.
- Activation de la phase de boss depuis le panneau Observation.
- Présence des rites, profils IA et phases dans les Archives.
- Responsive sans chevauchement bloquant sur les deux vues mobiles.
- Audio et vibrations silencieux avant interaction.

## Résultat

Les sept parcours se terminent sans exception console. Les avertissements d’autoplay observés lors du premier prototype de capture ont été supprimés en différant l’initialisation audio jusqu’à une activation utilisateur réelle.

Les PNG et la planche de contact sont conservés dans `tests/captures-v030/` dans la livraison complète et dans le dossier Google Drive de la release.
