# Contrôles et règles — v0.5.0

## Clavier

### Joueur 1

| Action | Touche |
|---|---|
| Gauche / droite | ← / → |
| Saut / accroupi | ↑ / ↓ |
| Garde / garde parfaite | Espace |
| Léger / lourd / technique | J / K / I |
| Saisie / Nightmare | U / O |
| Esquive | L |

### Joueur 2

| Action | Touche |
|---|---|
| Gauche / droite | Q / D |
| Saut / accroupi | Z / S |
| Garde / garde parfaite | A |
| Léger / lourd / technique | F / G / H |
| Saisie / Nightmare | R / T |
| Esquive | V |

Échap met le combat en pause ou ferme le panneau courant. Entrée valide la sélection.

## Seize commandes par manifestation

Les boutons restent identiques, mais la direction et l’état du personnage déterminent le coup :

| Input abstrait | Action |
|---|---|
| `L` | léger neutre |
| `→ + L` | léger avant |
| `↓ + L` | léger bas |
| `AIR + L` | léger aérien |
| `H` | lourd neutre |
| `→ + H` | lourd avant |
| `↓ + H` | lourd bas |
| `AIR + H` | lourd aérien |
| `T` | saisie |
| `S` | technique neutre |
| `→ + S` | technique avant |
| `← + S` | technique arrière |
| `↓ + S` | technique basse |
| `AIR + S` | technique aérienne |
| `N` | Nightmare à 100 de jauge |
| `≤ 30 % HP + N` | mouvement de désespoir |

`L`, `H`, `S`, `T` et `N` désignent les fonctions, pas des touches supplémentaires. Sur P1, elles correspondent à J, K, I, U et O ; sur P2 à F, G, H, R et T.

## Propriétés de coups

Les Archives indiquent pour chaque action : démarrage, activité, récupération, dégâts, portée, niveau haut/bas/overhead/throw/unblockable, annulations, projectiles, armure, invulnérabilité, déplacement, lancement, knockdown, piège, aura, téléportation et niveau de fidélité.

## Gamepad

- Stick gauche / croix : mouvement, bas et saut.
- Bouton gauche : léger.
- Bouton haut : lourd.
- Bouton droit : technique.
- Gâchettes : saisie et Nightmare.
- Épaules : garde.
- Bouton central secondaire : esquive.

Les deux premiers gamepads reconnus contrôlent P1 et P2.

## Interface tactile

**TOUCH P1** affiche les commandes du joueur 1. Les directions tactiles donnent accès aux mêmes variantes contextuelles. Le tactile P2 n’est pas prévu dans cette version.

## Garde, garde parfaite, contre et posture de contre

La garde consomme une jauge dédiée. À zéro, le combattant subit un bris de garde. Une garde déclenchée juste avant l’impact devient parfaite. Toucher pendant le démarrage adverse déclenche un contre. Certaines manifestations disposent en plus d’un mouvement de posture de contre attesté ou lore-friendly.

## Nightmare et désespoir

Les coups portés et reçus alimentent la jauge. À 100, le Nightmare devient disponible. Sous le seuil propre au profil, généralement 30 % de vitalité, la même commande déclenche le mouvement de désespoir. Les rites peuvent modifier coût, gain et puissance.

## Afflictions

- **Hémorragie** : perte périodique de vitalité.
- **Parasites radio** : vitesse réduite et jauge brouillée.
- **Entrave** : déplacement et esquive limités.
- **Corrosion** : garde érodée.
- **Brûlure** : dégâts périodiques intenses.
- **Effroi** : dissipation de Nightmare.
- **Gel** : vitesse réduite.
- **Floraison** : ralentissement accentué au centre.

## Otherworld, arènes et fatalités

La sirène annonce la transformation progressive. Chaque danger est télégraphié. Une victoire peut devenir fatalité Signature ou fatalité environnementale selon la position et le coup décisif. Otherworld, radio, danger, animation et fatalité restent configurables, sauf lorsqu’un rite impose une règle.

## IA adaptative

Le CPU mémorise un historique court et sélectionne désormais les variantes du moveset : projectile neutre, assaut avant, spécial de retraite, attaque basse, piège, saisie ou attaque aérienne. Désactiver l’option conserve la personnalité d’archétype sans lecture des répétitions.

## Observation

- Hitboxes.
- Auto-soin.
- Jauge libre.
- Forcer Otherworld.
- Phase boss suivante.
- Reset.
- Historique des inputs.
- Nom, input, frame active et niveau de fidélité du mouvement courant.
