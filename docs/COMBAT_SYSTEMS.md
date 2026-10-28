# Systèmes de combat — v0.9.6

La v0.9.6 réunit **4600 coups documentés**, **12 traits**, **8 afflictions**, **29 dangers**, **9 rites**, **12 personnalités IA** et **150 transitions de boss**, **460 fatalités de combattant**, **123 fatalités d’arène** et **64 animations d’arène**, **28 événements**, **14 terrains** et **15 types de bascule**.

## Architecture des movesets

Chaque fiche conserve **20 emplacements** : huit attaques normales contextuelles, deux saisies, trois ripostes de situation, cinq techniques, un Nightmare et une attaque Otherworld de désespoir. **3499 commandes sont activées ; 1101 sont désactivées avec une raison explicite.**

Répartition : **0 directement attestées**, **2635 composites lore-friendly**, **1965 adaptations versus**.

Chaque coup contient son input, ses frames de démarrage/activité/récupération, dégâts, portée, niveau de garde, propriétés, routes d’annulation, références et état d’exécution. Les nombres sont des paramètres de versus non mesurés dans la source ; les valeurs d’une commande désactivée restent documentées mais ne sont pas exécutées.

Les projectiles, téléportations, auras et afflictions exigent une capacité autorisée pour l’identifiant exact. Un trait passif ne peut pas réintroduire un effet retiré. Cybil possède dix tirs et abandonne son arme lorsque les munitions sont épuisées ou que sa santé passe strictement sous 50 %. La phase désarmée persiste entre les manches, sans consommer les balles abandonnées. Les corps attachés conservent leur ancrage, même sous une projection arrière. La provocation P1 P / P2 N / manette L3 est annulable et n’accorde ni dégâts, ni jauge, ni invulnérabilité.

Memory of Alessa suit quatre armes dans l’ordre SH3 : couteau, pistolet, tuyau puis mitraillette. La récupération verrouille chaque changement ; les coups de contact, tirs et rafales suivent uniquement l’arme équipée. Les quarts de vitalité, la récupération et la cadence de trois tirs sont des adaptations de versus, sans relevé officiel de timings. La naissance de Blood Baby depuis sa mère ne lui accorde pas le pouvoir inverse d’invoquer Blood Mama.
Le Missionary de SH3 dévie les balles visibles de face lorsqu’il est disponible ; dos, chute et attaque restent vulnérables. Cette défense ne donne ni jauge ni contre automatique. Incubator possède un champ passif local qui renverse vers l’extérieur ; Incubus ne le reçoit pas. Leurs décharges sont respectivement bleues et rouges. Les états, dimensions, durées, dégâts et valeurs RGB du versus ne sont pas des mesures officielles.

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
| `lockerSlam` | CLAQUEMENT DE CASIERS | 66 f | 105 | 38 | PARASITES RADIO |
| `gurneyRush` | CHARIOT LANCÉ | 84 f | 142 | 58 | ENTRAVE |
| `roadCollapse` | RUPTURE DE CHAUSSÉE | 112 f | 188 | 68 | CORROSION |
| `carouselSweep` | COURONNE DU MANÈGE | 98 f | 154 | 52 | ENTRAVE |
| `trainRush` | PASSAGE DE LA RAME | 124 f | 210 | 82 | CORROSION |
| `steamVent` | PURGE DE VAPEUR | 74 f | 112 | 44 | BRÛLURE |
| `waterSurge` | VAGUE D’EAU NOIRE | 106 f | 235 | 40 | GEL |
| `mirrorFracture` | FRACTURE DU REFLET | 88 f | 152 | 46 | EFFROI |
| `rootSnare` | PRISE DES RACINES | 92 f | 172 | 34 | FLORAISON |
| `spotlightSweep` | FAISCEAU DE SURVEILLANCE | 80 f | 148 | 32 | EFFROI |
| `crtvPulse` | VERROU CRTV | 70 f | 220 | 28 | PARASITES RADIO |
| `sirenShock` | ONDE DE SIRÈNE | 94 f | 270 | 38 | EFFROI |
| `voidPull` | ATTRACTION DU VIDE | 108 f | 238 | 42 | EFFROI |
| `bellToll` | RÉSONANCE DE LA CLOCHE | 96 f | 260 | 30 | EFFROI |
| `portraitGaze` | REGARD DES PORTRAITS | 90 f | 176 | 34 | EFFROI |
| `elevatorDrop` | CHUTE D’ASCENSEUR | 104 f | 136 | 64 | CORROSION |
| `roomPulse` | CONTRACTION DE LA PIÈCE | 92 f | 230 | 36 | EFFROI |
| `lightningStrike` | IMPACT DE FOUDRE | 78 f | 96 | 62 | BRÛLURE |
| `iceFracture` | FISSURE DE GLACE | 100 f | 180 | 36 | GEL |
| `ritualSeal` | FERMETURE DU SCEAU | 102 f | 196 | 42 | EFFROI |
| `windShear` | RAFALE LATÉRALE | 82 f | 170 | 30 | GEL |
| `doorSlam` | PORTE CLAQUÉE | 72 f | 104 | 40 | ENTRAVE |

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
- **Projection arrière** : une saisie compatible peut changer de côté ; la cible attachée au décor conserve son ancrage.
- **Riposte d’esquive** : une attaque légère pendant la fenêtre de sortie d’esquive déclenche une action propre à la manifestation.
- **Contre de garde** : une attaque lourde après une garde parfaite consomme la fenêtre de riposte et brise les armures actives.
- **Reversal de relevée** : une technique pendant la reprise au sol déclenche une action invulnérable documentée séparément.
- **Contre** : toucher pendant le démarrage adverse augmente l’impact et alimente les statistiques de rang.
- **Annulations** : les chaînes autorisées sont déclarées coup par coup dans le profil de combat.
- **Otherworld** : seules les phases de lieux autorisant une transition peuvent basculer. Les lieux normaux, déjà altérés ou non confirmés conservent leur état, y compris sous un rite.
- **Radio de proximité** : l’intensité des parasites augmente avec la proximité et le danger immédiat.
- **Dangers télégraphiés** : les arènes annoncent une zone avant l’impact afin de rester évitables et lisibles.
- **Rang de Chronique** : S à D selon vitalité restante, dégâts, combo, gardes parfaites, contres et dangers subis.
- **Observation** : hitboxes, historique des inputs, soin automatique, jauge libre, reset, transformation Otherworld et phase de boss forcées.
- **Rites du Jugement** : huit combats à modificateur tournant, vitalité et jauge partiellement conservées.
- **IA adaptative** : le CPU repère les actions répétées et choisit distance, garde, esquive ou contre.
- **Fatalités de combattant** : 198 montages originaux écrits, uniquement à la victoire finale, après vérification de l’identité, de l’arme et des corps. Les autres propositions restent à produire.
- **Fatalités d’arène** : 7 montages propres à un lieu, sous conditions de zone, d’accessoires et de mécanisme autorisé. Aucun repli vers une exécution générique incompatible.
- **Arènes animées** : éclairages, sirènes, chaînes, eau, météo, machineries, ombres et décors réagissent au temps et à l’Otherworld.
- **Terrain contextuel** : adhérence, esquive, saut, garde et recul suivent la matière du lieu sans annuler la lisibilité du versus.
- **Directeur environnemental** : chaque arène alterne événements, dangers et bascule selon sa source, sa famille et ses accessoires.
- **Otherworld différencié** : rouille, glace, signal CRTV, hantise, floraison, sanctuaire, tempête, vide ou rituel utilisent des règles et overlays distincts.
