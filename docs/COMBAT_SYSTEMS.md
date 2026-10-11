# Systèmes de combat — v0.6.0

La v0.6.0 réunit **4600 coups documentés**, **12 traits**, **8 afflictions**, **7 dangers**, **9 rites**, **12 personnalités IA** et **150 transitions de boss**, **460 fatalités de combattant**, **123 fatalités d’arène** et **374 animations d’arène**.

## Architecture des movesets

Chaque manifestation possède **20 commandes** : huit attaques normales contextuelles, deux saisies, trois ripostes de situation, cinq techniques, un Nightmare et une attaque Otherworld de désespoir.

Répartition : **447 directement attestées**, **3694 composites lore-friendly**, **459 adaptations versus**.

Chaque coup contient son input, ses frames de démarrage/activité/récupération, dégâts, portée, niveau de garde, propriétés, routes d’annulation et base canonique.

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

## Rites du Jugement

| Identifiant | Nom | Effet |
|---|---|---|
| `none` | AUCUN RITE | Règles équilibrées sans altération supplémentaire. |
| `denseFog` | BRUME ÉPAISSE | Radio plus nerveuse, réaction de l’IA accélérée et transformation Otherworld plus précoce. |
| `bloodDebt` | DETTE DE SANG | La vitalité s’érode lentement, mais les dégâts et la jauge augmentent. |
| `fragileGuard` | GARDE FISSURÉE | La garde est réduite, récupère plus lentement et les dégâts de garde sont renforcés. |
| `staticStorm` | ORAGE PARASITE | Les dangers surviennent plus souvent et la radio devient presque permanente. |
| `sacredSilence` | SILENCE SACRÉ | La radio se tait, la jauge monte moins vite, mais les techniques signatures frappent plus fort. |
| `executionNight` | NUIT DE L’EXÉCUTION | Les Nightmare coûtent moins cher, commencent plus tôt et deviennent plus destructeurs. |
| `noEscape` | AUCUNE ÉCHAPPATOIRE | L’arène se resserre et les déplacements sont plus rapides. |
| `redJudgment` | JUGEMENT ROUGE | Le combat commence dans l’Otherworld ; les boss et les dangers deviennent plus menaçants. |

## Personnalités IA

| Archétype | Nom | Distance | Agressivité | Défense |
|---|---|---:|---:|---:|
| `balanced` | LECTURE PRUDENTE | 145 | ×1 | ×1 |
| `rushdown` | POURSUITE DIRECTE | 92 | ×1.28 | ×0.76 |
| `juggernaut` | PRESSION LOURDE | 112 | ×1.08 | ×1.24 |
| `grappler` | CAPTURE RITUELLE | 68 | ×1.16 | ×0.9 |
| `zoner` | CONTRÔLE DU SIGNAL | 330 | ×0.92 | ×1.08 |
| `flyer` | TRAJECTOIRE AÉRIENNE | 245 | ×1.05 | ×0.76 |
| `swarm` | PRESSION DE MEUTE | 78 | ×1.35 | ×0.64 |
| `ghost` | APPARITION DIFFÉRÉE | 210 | ×0.94 | ×1.12 |
| `puppet` | RYTHME CONVULSIF | 132 | ×1.12 | ×0.92 |
| `trickster` | FAUSSE OUVERTURE | 182 | ×1 | ×1.08 |
| `artillery` | SUPPRESSION DISTANTE | 390 | ×0.88 | ×1.14 |
| `boss` | JUGEMENT ADAPTATIF | 126 | ×1.18 | ×1.16 |

## Phases de boss

Les **75 boss** possèdent deux transitions, soit **150 phases déclenchables**. Les seuils sont documentés dans chaque dossier et modifient puissance, vitesse, armure, jauge, Otherworld ou danger d’arène.

## Règles avancées

- **Garde parfaite** : bloquer dans la fenêtre d’impact neutralise davantage de pression, produit un signal visuel/sonore distinct et ouvre une réponse rapide.
- **Projection arrière** : maintenir la direction opposée pendant la saisie change de côté et impose une chute dure.
- **Riposte d’esquive** : une attaque légère pendant la fenêtre de sortie d’esquive déclenche une action propre à la manifestation.
- **Contre de garde** : une attaque lourde après une garde parfaite consomme la fenêtre de riposte et brise les armures actives.
- **Reversal de relevée** : une technique pendant la reprise au sol déclenche une action invulnérable documentée séparément.
- **Contre** : toucher pendant le démarrage adverse augmente l’impact et alimente les statistiques de rang.
- **Annulations** : les chaînes autorisées sont déclarées coup par coup dans le profil de combat.
- **Otherworld dynamique** : une sirène annonce la transformation progressive de l’arène pendant le combat.
- **Radio de proximité** : l’intensité des parasites augmente avec la proximité et le danger immédiat.
- **Dangers télégraphiés** : les arènes annoncent une zone avant l’impact afin de rester évitables et lisibles.
- **Rang de Chronique** : S à D selon vitalité restante, dégâts, combo, gardes parfaites, contres et dangers subis.
- **Observation** : hitboxes, historique des inputs, soin automatique, jauge libre, reset, transformation Otherworld et phase de boss forcées.
- **Rites du Jugement** : huit combats à modificateur tournant, vitalité et jauge partiellement conservées.
- **IA adaptative** : le CPU repère les actions répétées et choisit distance, garde, esquive ou contre.
- **Fatalités signature** : deux séquences data-driven par manifestation, déclenchées par coup décisif, avec base canonique et statut de fidélité.
- **Fatalités d’arène** : chaque lieu possède une exécution environnementale originale dérivée de ses dangers et de sa mise en scène.
- **Arènes animées** : éclairages, sirènes, chaînes, eau, météo, machineries, ombres et décors réagissent au temps et à l’Otherworld.
