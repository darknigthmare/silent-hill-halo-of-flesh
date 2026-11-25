# Air Screamer — Dernier passage

Deux illustrations fixes pour le récit individuel du profil `sh1_air_screamer_001`, source `sh1`, décor `old_silent_hill`. Composition originale compatible avec les références de Silent Hill (1999), statut `integrated-candidate`, fidélité `unverified`.

| Moment | Image native | Fonction |
| --- | --- | --- |
| Introduction | [sh1_air_screamer_001.intro.7ed088410461.png](../../../../assets/stories/sh1_air_screamer_001.intro.7ed088410461.png) | Un Air Screamer entier traverse devant la maison de Levin Street, dans la neige et la brume. |
| Conclusion | [sh1_air_screamer_001.ending.2aa5dbd07554.png](../../../../assets/stories/sh1_air_screamer_001.ending.2aa5dbd07554.png) | Le sujet a quitté la même composition. La rue reste vide, sans éclaircie annonçant une délivrance. |

## Raccord au mode Récit

Le registre [story-art.js](../../../../src/story-art.js) associe les fichiers à ce profil exact. La sélection montre l’introduction ; l’entrée dans le premier chapitre l’utilise dans le panneau narratif existant ; une partie de récit achevée peut afficher la conclusion. Un simple combat gagné, une défaite, une Chronique ou l’Air Screamer de Book of Memories ne sélectionnent pas ces images.

La file de rencontres, les sauvegardes, les adversaires et les arènes du récit ne changent pas. Les anciens raccords de lieu décrits dans [la conception narrative](../../../combat-guide/CAMPAGNE_ET_DENOUEMENTS.md) restent à revoir. La scène de rivalité contre Split Head n’est pas produite. La campagne globale n’est pas implémentée par ces deux images.

## Sources et production

- [Illustration native du Air Screamer SH1](https://www.silenthillmemories.net/sh1/arts/pics/sh1_art_cre_03.jpg) : identité, silhouette, deux jambes et ailes entières. Illustration de l’œuvre archivée sur un site non officiel.
- [Capture de la maison et de la niche de Levin Street](https://www.silenthillmemories.net/sh1/walkthrough/pics/sh1_01_house_key_a.jpg) : façade, niche, marches, boîte aux lettres et contexte neigeux. Capture native utilisée comme référence, pas comme cadrage final mesuré.
- [Décor déjà intégré de cette façade](../../../../assets/stages/old_silent_hill.levin-street-house.b24f46cfebac.png) : continuité spatiale et style du projet, sans valeur indépendante de preuve canonique.

Les copies natives et leurs empreintes sont maintenant conservées dans [references/sources.json](references/sources.json).

Les deux références natives et le décor ont été inspectés avant génération. L’introduction utilise les trois références ; la conclusion est une édition de l’introduction supprimant la créature. Les PNG retenus conservent exactement les octets de sortie ImageGen. Les [prompts complets](generation-prompts.json) et les [empreintes](integration-delivery.json) sont conservés.

## Vérification et limites

Les deux images ont été relues visuellement après génération : sujet complet dans l’introduction, absence complète dans la conclusion, façade et accessoires cohérents, pas de texte intégré. L’architecture demeure une interprétation picturale et quelques textures diffèrent entre les deux images. Ce contrôle ne certifie pas une correspondance1:1.

Le pipeline [build-story-art.mjs](../../../../scripts/build-story-art.mjs) audite les fichiers, hashes, tailles, dimensions, identité et source, puis enregistre les deux chemins pour le cache hors ligne. La révision de cache inclut le module narratif. La QA HTTP vérifie le chargement réel de l’introduction et un rendu isolé de la conclusion ; ce dernier ne représente pas une campagne jouée jusqu’au terme. Les **12 contrôles réussis et trois captures relues** sont consignés dans [la revue HTTP](qa-http-review.md) et [la validation structurée](validation.json). Les résultats de la vague sont réunis dans [le rapport général](../README.md).
