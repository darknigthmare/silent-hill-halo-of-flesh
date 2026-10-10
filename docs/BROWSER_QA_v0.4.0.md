# QA navigateur — v0.4.0

**Date : 10 octobre 2026**  
**Commit applicatif testé : `abadd5adf5a3a4efa4e26cdf76acafffb3e31697`**  
**HEAD propre validé : `ef115d578915902ba1c9251414261e55e6d64415`**

## Méthode

Chromium 144 headless a chargé la build statique produite par le même arbre source que le commit GitHub v0.4.0. Le serveur local n'ajoute aucune logique : il sert directement les fichiers de `dist/`. La production Vercel a été vérifiée séparément après déploiement du HEAD propre.

Les événements DevTools suivants ont été collectés pendant chaque parcours :

- exceptions JavaScript non interceptées ;
- messages console de niveau `error` ou `warning` ;
- échecs réseau non annulés ;
- présence des écrans et contrôles attendus.

## Résultat

- **11 vues capturées.**
- **0 exception JavaScript.**
- **0 erreur console.**
- **0 avertissement console.**
- **0 ressource manquante.**
- **0 échec réseau.**

## Vues contrôlées

| N° | Capture | Dimensions | Contrôle principal |
|---:|---|---:|---|
| 1 | `01-command-v040.png` | 1440 × 900 | Command Center, version et navigation complète |
| 2 | `02-roster-audit-selection-v040.png` | 1600 × 1000 | sélection Townfall, filtres et nouvelles règles |
| 3 | `03-dossier-fatalities-v040.png` | 1600 × 1000 | provenance, deux fatalités, arène et animations |
| 4 | `04-signature-fatality-v040.png` | 1600 × 1000 | fatalité Signature réellement exécutée par le moteur |
| 5 | `05-stage-fatality-v040.png` | 1600 × 1000 | fatalité environnementale propre à l'arène |
| 6 | `06-stage-gallery-v040.png` | 1600 × 1000 | galerie des 123 stages avec animations et fatalités |
| 7 | `07-fatality-archive-v040.png` | 1600 × 1000 | archive des 460 fatalités de combattant |
| 8 | `08-coverage-matrix-v040.png` | 1600 × 1000 | matrice des seize sources et règles de nommage |
| 9 | `09-animated-stages-v040.png` | 1600 × 1000 | archive des décors dédiés et animés |
| 10 | `10-command-mobile-v040.png` | 430 × 932 | menu mobile lisible sans chevauchement |
| 11 | `11-selection-mobile-v040.png` | 430 × 932 | fiche, filtres et grille mobile |

## Parcours moteur instrumentés

La passerelle de QA n'est exposée qu'avec le paramètre `?qa=1`. Elle a été utilisée pour atteindre des états déterministes sans modifier les règles normales :

- lancement d'un combat Observation ;
- déclenchement forcé d'une fatalité Signature ;
- déclenchement forcé d'une fatalité d'arène ;
- lecture du snapshot moteur ;
- contrôle de la phase `fatality`, de la mise en scène, des acteurs et de la fin de séquence.

## Contrôle visuel

- Les modales restent dans le viewport desktop et leurs textes demeurent lisibles.
- Les silhouettes ne sortent pas du cadre pendant les fatalités capturées.
- Les panneaux Observation ne masquent pas l'action centrale.
- Les cartes de stages restent alignées et leurs métadonnées ne se chevauchent pas.
- La version mobile empile correctement le profil, les filtres et la grille.
- Le menu mobile conserve les neuf modules sans débordement horizontal.

## Production

Le déploiement Vercel correspondant au HEAD propre est passé à l'état `READY`. Les routes principales et les exports `content-stats.json`, `coverage-audit.json` et `fatalities.json` sont contrôlés séparément sur l'URL de production.
