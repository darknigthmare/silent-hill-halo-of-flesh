# Systèmes de combat — v0.2.0

La v0.2.0 ajoute **12 traits**, **8 afflictions** et **7 dangers d’arène** au moteur fixe à 60 Hz.

## Traits de manifestation

| Identifiant | Nom | Effet |
|---|---|---|
| `echo` | ÉCHO PERSISTANT | Profil équilibré : la jauge monte légèrement lorsque la manifestation varie ses attaques. |
| `relentless` | POURSUITE OBSESSIONNELLE | Gagne de la jauge en avançant vers sa cible et conserve mieux son élan. |
| `rustArmor` | ARMURE DE ROUILLE | Absorbe périodiquement une partie du recul et du hitstun. |
| `constriction` | CONSTRICTION | Les saisies infligent davantage de dégâts et appliquent Entrave. |
| `staticField` | CHAMP PARASITE | Les projectiles sont plus larges et appliquent Parasites radio. |
| `aerialInstinct` | INSTINCT AÉRIEN | Saut plus haut et esquive plus longue. |
| `lowProfile` | PROFIL RAMPANT | Hurtbox réduite au sol et attaque basse accélérée. |
| `phaseWalk` | MARCHE SPECTRALE | L’esquive traverse plus longtemps les attaques et applique Effroi sur technique. |
| `convulsion` | CONVULSION | Les chaînes frappe → lourd → technique disposent d’une fenêtre d’annulation élargie. |
| `falsePresence` | FAUSSE PRÉSENCE | Une esquive parfaite rend brièvement intangible et accélère la prochaine technique. |
| `suppression` | SUPPRESSION | Projectiles lourds, garde adverse davantage entamée. |
| `nightmareArmor` | ARMURE DU CAUCHEMAR | Résistance accrue au recul et au hitstun tant que la vitalité dépasse un tiers. |

## Afflictions

| Identifiant | Nom | Durée | Effet |
|---|---|---:|---|
| `bleed` | HÉMORRAGIE | 180 frames | Perd périodiquement de la vitalité. |
| `static` | PARASITES RADIO | 150 frames | Vitesse réduite et brouillage de jauge. |
| `bind` | ENTRAVE | 90 frames | Déplacement et esquive fortement limités. |
| `decay` | CORROSION | 180 frames | La garde ne se régénère plus et s’érode. |
| `burn` | BRÛLURE | 150 frames | Dégâts réguliers plus intenses. |
| `dread` | EFFROI | 150 frames | La jauge Nightmare se dissipe progressivement. |
| `frost` | GEL | 120 frames | Vitesse et accélération réduites. |
| `bloom` | FLORAISON | 135 frames | Ralentissement qui s’intensifie près du centre de l’arène. |

## Dangers d’arène

| Identifiant | Nom | Télégraphe | Rayon | Dégâts | Affliction |
|---|---|---:|---:|---:|---|
| `staticBurst` | SURSAUT RADIO | 85 f | 165 | 34 | PARASITES RADIO |
| `fallingDebris` | CHUTE DE DÉBRIS | 90 f | 118 | 62 | CORROSION |
| `bloodTide` | MARÉE DE SANG | 105 f | 220 | 45 | HÉMORRAGIE |
| `frostWave` | VAGUE DE GEL | 95 f | 205 | 26 | GEL |
| `petalBloom` | FLORAISON ROUGE | 100 f | 190 | 38 | FLORAISON |
| `emberFall` | PLUIE DE CENDRES | 82 f | 135 | 50 | BRÛLURE |
| `chainSweep` | BALAYAGE DE CHAÎNES | 76 f | 145 | 58 | ENTRAVE |

## Règles avancées

- **Garde parfaite** : bloquer dans la fenêtre d’impact neutralise davantage de pression, produit un signal visuel/sonore distinct et ouvre une réponse rapide.
- **Contre** : toucher pendant le démarrage adverse augmente l’impact et alimente les statistiques de rang.
- **Annulations** : les chaînes autorisées sont déclarées coup par coup dans le profil de combat.
- **Otherworld dynamique** : une sirène annonce la transformation progressive de l’arène pendant le combat.
- **Radio de proximité** : l’intensité des parasites augmente avec la proximité et le danger immédiat.
- **Dangers télégraphiés** : les arènes annoncent une zone avant l’impact afin de rester évitables et lisibles.
- **Rang de Chronique** : S à D selon vitalité restante, dégâts, combo, gardes parfaites, contres et dangers subis.
- **Observation** : hitboxes, soin automatique, jauge libre, reset et transformation Otherworld forcée.
