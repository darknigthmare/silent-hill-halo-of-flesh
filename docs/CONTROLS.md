# Contrôles et règles — v0.6.0

## Clavier

### Sujet I

| Action | Touche |
|---|---|
| Gauche / droite | ← / → |
| Saut / accroupi | ↑ / ↓ |
| Garde / garde parfaite | Espace |
| Léger / lourd / technique | J / K / I |
| Saisie / Nightmare | U / O |
| Esquive | L |

### Sujet II

| Action | Touche |
|---|---|
| Gauche / droite | Q / D |
| Saut / accroupi | Z / S |
| Garde / garde parfaite | A |
| Léger / lourd / technique | F / G / H |
| Saisie / Nightmare | R / T |
| Esquive | V |

Échap met le combat en pause ou ferme le panneau courant. Entrée valide la sélection.

## Vingt commandes par manifestation

Les boutons restent identiques, mais la direction, l’état du corps et les fenêtres de combat déterminent l’action :

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
| `T` | saisie avant |
| `← + T` | projection arrière avec changement de côté |
| `ESQUIVE + L` | riposte pendant la fenêtre de sortie d’esquive |
| `P-GUARD + H` | contre après garde parfaite |
| `RELEVÉE + S` | reversal pendant la fenêtre de relevée |
| `S` | technique neutre |
| `→ + S` | technique avant |
| `← + S` | technique arrière |
| `↓ + S` | technique basse |
| `AIR + S` | technique aérienne |
| `N` | Nightmare à 100 de jauge |
| `≤ 30 % HP + N` | mouvement de désespoir |

`L`, `H`, `S`, `T` et `N` désignent les fonctions, pas des touches supplémentaires. Sur Sujet I, elles correspondent à J, K, I, U et O ; sur Sujet II à F, G, H, R et T.

## Fenêtres contextuelles

### Riposte d’esquive

Après le déclenchement d’une esquive, une courte fenêtre autorise `L`. La riposte possède son propre démarrage, sa propre invulnérabilité et ses routes d’annulation. Une pression trop tardive produit simplement le léger correspondant à la situation courante.

### Contre de garde parfaite

Une garde activée juste avant l’impact ouvre une fenêtre `P-GUARD`. Appuyer sur `H` déclenche une riposte dédiée. Elle peut rompre l’armure active et ne peut pas être lancée hors de cette fenêtre.

### Reversal de relevée

Après une projection, une chute dure ou un rebond au sol, `S` peut être pressé pendant la fenêtre de relevée. La manifestation se relève avec une courte invulnérabilité et une attaque dédiée. Sans input, elle reste au sol jusqu’à la fin de sa récupération.

### Projection arrière

Maintenir la direction opposée à l’adversaire et utiliser `T` déclenche une projection distincte. Elle inverse les positions et impose une chute dure. La prise neutre conserve sa trajectoire avant.

## Propriétés de coups

Les Archives indiquent pour chaque action : démarrage, activité, récupération, dégâts, portée, niveau haut/bas/overhead/throw/unblockable, coût, annulations, projectiles, armure, rupture d’armure, invulnérabilité, déplacement, changement de côté, lancement, chute dure, rebond, piège, aura, téléportation et niveau de fidélité.

## Gamepad

- Stick gauche / croix : mouvement, bas et saut.
- Bouton gauche : léger.
- Bouton haut : lourd.
- Bouton droit : technique.
- Gâchettes : saisie et Nightmare.
- Épaules : garde.
- Bouton central secondaire : esquive.

Les deux premiers gamepads reconnus contrôlent Sujet I et Sujet II. Les combinaisons contextuelles utilisent les mêmes boutons.

## Interface tactile

**TACTILE SUJET I** affiche les commandes du premier sujet. Les directions tactiles donnent accès aux variantes et aux projections arrière. Les ripostes d’esquive, de garde et de relevée utilisent leurs boutons ordinaires pendant la fenêtre affichée. Le tactile Sujet II n’est pas prévu dans cette version.

## Garde, garde parfaite et posture de contre

La garde consomme une jauge dédiée. À zéro, le combattant subit un bris de garde. Une garde déclenchée juste avant l’impact devient parfaite et ouvre la riposte lourde. Toucher pendant le démarrage adverse déclenche un contre standard. Certaines manifestations disposent en plus d’une technique de posture de contre attestée ou lore-friendly.

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

Le CPU mémorise un historique court et sélectionne les variantes du moveset selon la distance et l’état du combat. Il peut exploiter une riposte de garde, une attaque de relevée, une sortie d’esquive, une projection arrière, un projectile, un assaut, un piège, une saisie ou une attaque aérienne sans lire l’avenir.

## Salle d’Observation

- Hitboxes.
- Auto-soin.
- Jauge libre.
- Forcer Otherworld.
- Phase boss suivante.
- Reset.
- Historique des inputs.
- Nom, input, frame active et niveau de fidélité du mouvement courant.
- Compteurs des fenêtres `DODGE`, `P-GUARD` et `RISE`.
