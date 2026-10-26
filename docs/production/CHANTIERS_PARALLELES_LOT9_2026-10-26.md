# Chantiers parallèles — neuvième lot du 26 octobre 2026

Cette livraison prolonge `98ccc47` sur `main`, avec **six agents et trente
lignes Excel par agent**. Le contrôle porte sur les identifiants réels des
lignes, leur propriétaire, leurs références, leurs fichiers et leur différence
avec le plan précédent. Les cas de test ne comptent pas comme productions.

| Lot de trente | Réalisations candidates | Spécifications documentaires | Blocages |
| --- | ---: | ---: | ---: |
| [Images](batches/lot9-art.json) | 24 | 0 | 6 |
| [Commandes](batches/lot9-combat.json) | 30 | 0 | 0 |
| [Présentations](batches/lot9-cinematics.json) | 30 | 0 | 0 |
| [Lieux](batches/lot9-stages.json) | 23 | 0 | 7 |
| [Observations](batches/lot9-references.json) | 0 | 30 | 0 |
| [Poses](batches/lot9-poses.json) | 0 | 30 | 0 |
| **180 lignes traitées** | **107** | **60** | **13** |

La [synthèse vérifiée](batches/lot9-summary.json) conserve les empreintes des
six relevés et des fichiers livrés. Les **167 lignes non bloquées diffèrent
du lot précédent**. Ce contrôle de traçabilité ne certifie ni une animation
originale, ni la réalisation complète des actions parentes du classeur.

Le suivi conserve **875 actions, dont 840 ouvertes et 93 P0**. Les 33 décisions
de rôle précédentes restent identiques, avec huit adaptations filmiques
jouables et 25 dossiers sans duel autonome. Les 435 observations conservent
leurs identifiants, noms, profils, œuvres, éditions, ordre, statuts et timecodes.
Les **184 sources** préservent le préfixe intégral des 154 précédentes.

## Images et limites des références

La [provenance artistique](../../art/reference-provenance-batch9.json) relie
chaque sujet à ses références, empreintes, inspections et calibrations.
Les 24 nouveaux PNG sont indépendants et représentent chacun une attente
candidate. Ils ne produisent aucun cycle de marche, attaque ou chute.

Les cinq nouveaux sujets SH1 sont Mumbler, Creeper, Puppet Nurse, Puppet Doctor
et Twinfeeler. SH2 reçoit Pyramid Head avec Great Knife, Pyramid Head avec lance
et Eddie : les deux armes et le film conservent leurs images distinctes.
Les cinq sujets SH3 sont Numb Body large, Nurse au revolver, Scraper, Missionary
et Leonard. SH4 reçoit onze sujets : Sniffer femelle, Gum Head Old Type,
Toadstool, Whitestool, Tremer bleu/rouge, Cynthia, Richard, Walter, Wheelchair
et Jimmy Stone.

Le Numb Body large n’a aucune vue propre à sa variante dans les références
retenues : modèle familial et guide attestent la famille et une différence
qualitative de taille. L’image ne certifie ni ses proportions ni son échelle.
Les armes de Walter, les variantes de Sniffer et Gum Head et les œuvres
d’origine restent séparées. Détails de peau, contraste, membres masqués,
perspective et appuis demeurent sujets à comparaison.

Cinq demandes d’image ont été refusées par l’outil : Incubus, Nurse Pipe,
Valtiel, Jasper et Andrew. Aucune nouvelle tentative ou image de substitution
n’a été utilisée pour ces sujets. Split Worm est bloqué pour une autre raison :
les références montrent une tête et un cou partiellement masqués par la paroi,
sans établir un corps entier. Son anatomie cachée n’est pas inventée.

Le registre compte **49 profils illustrés, 54 PNG d’acteur actifs et six décors
bitmap**, avec un seul montage animé candidat et aucune certification 1:1.
Les six blocages figurent dans les lignes de pose et les raisons des actions
Excel correspondantes ; 181 profils restent sans PNG.

La galerie de 49 images a révélé un défaut réel : une miniature décodée pouvait
être évincée du cache avant sa peinture et rester en chargement. La miniature
utilise désormais le décodage réussi pour peindre son petit canvas, sans
augmenter le budget de 64 Mio ni conserver les grandes images en mémoire.
Le contrôle de sélection parcourt aussi réellement les pages de trente cartes,
et l’atelier ses trois pages de **18, 18 et 13** cartes.

## Trente commandes et transitions de combat

Les trente commandes concernent Groaner, Wormhead, Flesh Lip, God SH3, Andrew
et Screamer Downpour. Dix bonds mordants et cinq passages en tonneau deviennent
des déplacements physiques. Les tirs peuvent renverser les chiens SH1 pendant
le bond. God conserve ses flammes au sol et un contact local de bras, sans
utiliser la hauteur entière de son corps comme zone d’attaque.

Flesh Lip dispose d’un coup de pied et de quatre variantes d’emprise suspendue.
La cible est levée localement, avec dégagement par alternance gauche/droite.
Le cri de Screamer bloque réellement déplacement, attaques, garde et esquive
pendant son effet ; son bond reste physique. Arcs, hauteurs, portées, dégâts,
durées et six alternances sont des réglages du versus, sans timings originaux.

La revue indépendante a reproduit deux défauts de suspension : corps laissé
en l’air après TIME/KO, puis expiration après un coup remettant artificiellement
la cible au sol à hauteur élevée. Libération, remplacement de statut, expiration
et fin de manche nettoient désormais cette posture. Une troisième correction
conserve la direction nécessaire aux commandes des corps fixes tout en bloquant
leur locomotion et le gain de jauge associé.

Le catalogue reste à **3 499 commandes actives et 1 101 désactivées** : ce lot
n’en désactive aucune supplémentaire. Les trente changements mécaniques sont
décrits dans leurs lignes Excel. Les annotations de proximité des fantômes SH4
ne leur attribuent plus le champ, la chute ou les couleurs d’Incubator.

## Trente présentations

Closer Church, Jasper, Andrew, Richard et Swarm Homecoming reçoivent chacun
six contextes : introduction, victoire/défaite de manche, victoire/défaite finale
et sortie. Identité, œuvre, année, édition, corps et équipement sont contrôlés.
Richard et Swarm ont deux sorties mobiles composées dont les 90 ticks,
la pause et l’affichage différé du résultat sont réellement joués.

Aucun nouveau taunt ou finisher n’est activé. Le catalogue conserve
**205 timelines stockées**, dont 198 de combattants et sept de lieu ; cinq
timelines de lieu sont compatibles avec leurs phases actuelles. Il compte
**716 présentations résolvables sans état d’acteur**, plus les sept contextes
Cybil conditionnels à ses munitions et à son désarmement. Les images de ces
gestes restent à produire.

## Trente lignes de lieux

Vingt-trois pistes et réactions sont branchées sur des pièces et phases
précises, dont neuf réactions locales sans dégâts ni récompense supplémentaires.
Huit types d’événement sont ajoutés. Les quinze cadres de lieu conservent un
terrain neutre et un HUD cohérent. L’hôpital du film représente la chambre
d’Alessa en 2006, séparée du couloir des Nurses et sans attribution à Brookhaven.

Les vues Vita datées de pré-version sont qualifiées comme telles. Objets,
orientations, petites oscillations et réactions lumineuses restent des
compositions du versus, sans animation originale ni géométrie mesurée.

Les sept blocages sont le ruissellement mural Water, les trois propositions
Steel, un lustre Grand Hotel non confirmé, les câbles de Scarlet attribués
à tort à des vues Sepulcher et l’ascenseur d’une autre phase du cauchemar
hospitalier Homecoming. Ils restent ouverts avec leurs raisons dans l’Excel.

Les 74 anciennes pistes et les 1 190 anciens retraits sont conservés.
Le total atteint **97 pistes : 91 visibles et six masquées par les bitmaps**,
sur 67 clés. Six éléments incompatibles supplémentaires sont retirés,
soit 1 196 éléments archivés. Le moteur compte 78 boucles génériques,
29 associations d’événement et 29 interactions ; les huit liens de dangers
et les quatorze profils de terrain partagés ne sont pas augmentés.

## Soixante spécifications et classeur

Trente observations reçoivent de nouvelles pièces archivées et des citations
précises. Quatorze descriptions supplémentaires sont intégrées pour les autres
chantiers. Les portraits ou gros plans recadrés restent des preuves d’identité
et de contexte ; ils ne deviennent pas des poses entières ou des mouvements.

Les trente briefs de poses concernent Air Screamer, Hanged Scratcher, Pendulum,
Twin Victim, Patient et Bottom, chacun sur cinq poses. Ils spécifient appuis,
anatomie, arme, transitions et limites propres à la source. Ils ne produisent
aucun PNG, clip ou mesure. Les **18 400 cellules de timings source restent vides**.

L’export incrémental actualise **2 706 cellules**, augmente **736 hauteurs**
et ajoute **210 cellules de sources**. Les 80 formules sont vérifiées ; seule
la plage de comptage des sources est étendue avec sa table et son filtre.
La préservation compare 249 689 cellules. La revue indépendante compare
248 764 champs mappés au plan et passe **49 contrôles**, dont les 180 lignes
et les treize blocages explicités dans les cellules et les actions parentes.

Le [rapport de validation](../INTEGRATION_QA_2026-10-26-lot9.json) conserve
tests, captures, empreintes et limites. Les scènes préparées servent aux
régressions ; elles ne revendiquent ni campagne jouée, ni séquence originale
mesurée, ni exécution de GitHub CI ou d’Excel natif.

La version finale passe **949 tests Node, 100 tests Python et 1 836 contrôles
navigateur dans quatorze suites**, avec 316 captures et aucune exception
JavaScript. Le build compte 136 fichiers ; les 135 issus du dépôt sont comparés
aux sources octet par octet. Les 125 captures finales de l’atelier sont identiques
aux témoins source et onze vues finales sont inspectées directement. La revue
indépendante du combat et des présentations conserve 1 164 assertions réussies.
