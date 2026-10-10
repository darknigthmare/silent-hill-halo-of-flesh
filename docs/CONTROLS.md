# Contrôles et règles — v0.2.0

## Clavier

### Joueur 1

| Action | Touche |
|---|---|
| Aller à gauche / droite | ← / → |
| Sauter | ↑ |
| S’accroupir | ↓ |
| Garder | Espace |
| Frappe légère | J |
| Attaque lourde | K |
| Technique signature | I |
| Saisie | U |
| Super Nightmare | O |
| Esquive | L |

### Joueur 2

| Action | Touche |
|---|---|
| Aller à gauche / droite | Q / D |
| Sauter | Z |
| S’accroupir | S |
| Garder | A |
| Frappe légère | F |
| Attaque lourde | G |
| Technique signature | H |
| Saisie | R |
| Super Nightmare | T |
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

Le mapping suit l’ordre normalisé de l’API Gamepad du navigateur. Les deux premiers gamepads reconnus contrôlent respectivement P1 et P2.

## Interface tactile

Le bouton **TOUCH P1** affiche ou masque les commandes tactiles du joueur 1. Le tactile du joueur 2 n’est pas prévu dans cette version.

## Garde et garde parfaite

La garde absorbe les attaques normales mais consomme une jauge dédiée. À zéro, le combattant subit un bris de garde et devient vulnérable.

Une garde déclenchée dans la courte fenêtre précédant l’impact devient une **garde parfaite** :

- pression réduite sur la jauge de garde ;
- feedback sonore et visuel distinct ;
- fenêtre de réponse plus favorable ;
- contribution positive au rang de Chronique.

## Contres et annulations

Toucher un adversaire pendant le démarrage de son attaque déclenche un **contre**. Certains coups peuvent être annulés vers un autre coup ; les routes autorisées sont affichées dans le dossier de la manifestation.

## Nightmare

Les coups portés et reçus alimentent la jauge Nightmare. À 100, le Super devient disponible. Certaines afflictions ou certains traits peuvent accélérer, réduire ou perturber cette jauge.

## Afflictions

- **Hémorragie** : perte périodique de vitalité.
- **Parasites radio** : vitesse réduite et jauge brouillée.
- **Entrave** : déplacement et esquive fortement limités.
- **Corrosion** : garde bloquée puis érodée.
- **Brûlure** : dégâts périodiques plus intenses.
- **Effroi** : dissipation progressive de Nightmare.
- **Gel** : vitesse et accélération réduites.
- **Floraison** : ralentissement accentué au centre de l’arène.

## Otherworld dynamique

Lorsque l’option est active, une sirène annonce la transformation progressive de l’arène. La bascule est visuelle et mécanique : elle modifie l’ambiance, intensifie la radio et autorise les événements de scène prévus par le combat.

## Dangers d’arène

Chaque arène possède un danger cohérent avec sa famille visuelle. Une zone est d’abord télégraphiée, puis l’impact inflige dégâts et affliction. Le danger peut être désactivé dans les règles de sélection.

## Observation

- **Hitboxes** : affiche les zones de vulnérabilité et d’impact.
- **Auto-soin** : restaure progressivement les deux profils.
- **Jauge libre** : maintient Nightmare à 100.
- **Forcer Otherworld** : déclenche immédiatement la transformation.
- **Reset** : réinitialise le match sans reconstruire le module.
