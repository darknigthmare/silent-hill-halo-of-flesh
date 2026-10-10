# Contrôles et règles — v0.4.0

## Clavier

### Joueur 1

| Action | Touche |
|---|---|
| Aller à gauche / droite | ← / → |
| Sauter / s’accroupir | ↑ / ↓ |
| Garder | Espace |
| Frappe légère / lourd / technique | J / K / I |
| Saisie / Super Nightmare | U / O |
| Esquive | L |

### Joueur 2

| Action | Touche |
|---|---|
| Aller à gauche / droite | Q / D |
| Sauter / s’accroupir | Z / S |
| Garder | A |
| Frappe légère / lourd / technique | F / G / H |
| Saisie / Super Nightmare | R / T |
| Esquive | V |

Échap met le combat en pause ou ferme le panneau courant. Entrée valide la sélection et lance le combat.

## Gamepad

- Stick gauche / croix directionnelle : mouvement.
- Bouton bas : saut.
- Bouton gauche : frappe légère.
- Bouton haut : attaque lourde.
- Bouton droit : technique signature.
- Gâchettes : saisie et Super.
- Épaules : garde.
- Bouton central secondaire : esquive.

Les deux premiers gamepads reconnus contrôlent respectivement P1 et P2.

## Interface tactile

Le bouton **TOUCH P1** affiche ou masque les commandes tactiles du joueur 1. Le tactile du joueur 2 n’est pas prévu dans cette version.

## Garde, garde parfaite et contres

La garde consomme une jauge dédiée. À zéro, le combattant subit un bris de garde. Une garde déclenchée juste avant l’impact devient une garde parfaite, réduit la pression et ouvre une réponse. Toucher pendant le démarrage adverse déclenche un contre.

## Nightmare

Les coups portés et reçus alimentent la jauge. À 100, le Super devient disponible. Les rites peuvent modifier le coût, la vitesse de gain ou la puissance du Nightmare.

## Afflictions

- **Hémorragie** : perte périodique de vitalité.
- **Parasites radio** : vitesse réduite et jauge brouillée.
- **Entrave** : déplacement et esquive limités.
- **Corrosion** : garde bloquée puis érodée.
- **Brûlure** : dégâts périodiques intenses.
- **Effroi** : dissipation de Nightmare.
- **Gel** : vitesse et accélération réduites.
- **Floraison** : ralentissement accentué au centre.

## Otherworld et dangers

La sirène annonce la transformation progressive de l’arène. Chaque danger est télégraphié avant l’impact. Otherworld, radio et dangers sont désactivables dans les règles, sauf lorsqu’un rite impose explicitement un état.

## Rites du Jugement

Le sélecteur **RITE** permet d’appliquer un modificateur à un match. Dans le mode Rites du Jugement, les huit rites actifs tournent automatiquement. La vitalité et une partie de la jauge sont conservées entre les combats.

## Phases de boss

Les boss traversent deux seuils de vitalité. La transition est annoncée, applique brièvement une protection et modifie le profil de combat. Le dossier détaille les deux phases.

## IA adaptative

L’option **IA ADAPTATIVE** permet au CPU de mémoriser un historique court. Répéter trop souvent lourd, saisie ou technique augmente la probabilité d’une réponse dédiée. Désactiver l’option conserve uniquement la personnalité d’archétype.

## Observation

- **Hitboxes** : zones de vulnérabilité et d’impact.
- **Auto-soin** : restaure les deux profils.
- **Jauge libre** : maintient Nightmare à 100.
- **Forcer Otherworld** : déclenche la transformation.
- **Phase boss suivante** : déclenche la prochaine transition disponible.
- **Reset** : réinitialise le match.
- **Observation Data** : état, coup, distance, trait, statut, phase et inputs.
