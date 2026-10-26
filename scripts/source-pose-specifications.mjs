/** Source-scoped artist briefs. Documentation only: no pose, clip or timing is produced here. */
const SH1='SH1 original 1999, région à fixer',SH2='SH2 original 2001 / édition Born from a Wish selon fiche',SH3='SH3 original 2003',SH4='SH4 original 2004';
const documentationLimit='Spécification documentaire à produire et comparer sur capture : aucune nouvelle image, animation, durée originale ou certification 1:1 livrée.';
const groups=[
  {fighterId:'sh1_air_screamer_001',source:'sh1',edition:SH1,evidence:['CL_SH1_ENEMIES','CL_SH1_CREATURES'],poses:{
    idle:{
      basis:'Le guide décrit le vol et des individus debout avant décollage ; le modèle distingue les ailes des pattes.',
      description:'Air Screamer SH1 : séparer attente en vol et attente debout. En vol, le corps porte les deux ailes membraneuses et les deux pattes restent libres ; au sol, relever les appuis des pattes avant le décollage. Conserver la tête et la queue du modèle de cette espèce, sans les replis de Night Flutter. Une image fixe ne définit ni battement complet ni respiration originale.',
      limits:'Le guide atteste les deux états, sans angle articulaire ni cadence ; la pose aérienne ne doit pas devenir un appui au sol.'},
    walk:{
      basis:'Approche aérienne majoritaire ; attaque distincte sur les pattes dans le guide SH1.',
      description:'Air Screamer SH1 : le slot walk doit distinguer déplacement aérien et approche sur les pattes. Pour la translation en vol, suivre le corps et les ailes sans inventer une alternance de pieds ; pour le déplacement au sol, garder les deux pattes sous le bassin et relever leur cycle réel. Le piqué frappé des pattes et la morsure/coup de tête au sol sont des attaques séparées, pas des images de marche.',
      limits:'Aucun cycle de marche ou de vol n’est relevé ici ; ne pas dériver une locomotion de la translation du PNG idle.'},
    hurt:{
      basis:'Le guide permet de toucher Air Screamer en vol puis de le faire tomber ; la forme et ses appendices sont propres à SH1.',
      description:'Air Screamer SH1 : préparer une réaction d’impact propre à l’état initial, aérien ou debout. Garder les deux ailes attachées au même torse et les pattes de cette créature, sans bras humains ni plume ajoutée. La transition vers la chute ne doit pas instantanément poser les pieds depuis une hauteur de vol ; relever séparément orientation, perte d’altitude et éventuelle reprise. Le recul du versus ne prouve pas cette réaction source.',
      limits:'Contact et chute sont documentés ; silhouette de chaque image d’impact et récupération restent à capturer.'},
    knockdown:{
      basis:'Le guide conseille de faire tomber la créature puis de l’achever au sol ; tomber n’est pas immédiatement mourir.',
      description:'Air Screamer SH1 : séparer chute depuis le vol, contact au sol et état couché. Préserver ailes, pattes et queue sans redresser le corps comme un humanoïde ; relever quels appendices touchent effectivement le sol dans la capture. Le guide distingue abattre l’oiseau et l’achever ensuite : ne pas transformer knockdown en disparition ou mort automatique. Une reprise de manche du versus demande son raccord propre.',
      limits:'La présence au sol est attestée ; ni durée au sol, ni côté de chute, ni cycle de relèvement n’est mesuré.'},
    phase:{
      basis:'Vol, station debout et décollage concernent la même espèce ; Night Flutter reste une identité distincte.',
      description:'Air Screamer SH1 : le raccord de phase à spécifier est le passage sol/vol de la même créature, avec continuité des ailes et pattes. Relever le dernier appui, le dégagement des pieds et le premier état aérien avant de créer les images. Ne pas utiliser ce slot pour métamorphoser la tête en Night Flutter ni pour changer de bestiaire après un seuil de vie ; ce seuil serait une règle du versus.',
      limits:'Le décollage est documenté sans séquence mesurée ; aucune transformation anatomique nouvelle n’est validée.'}
  }},
  {fighterId:'sh1_hanged_scratcher_011',source:'sh1',edition:SH1,evidence:['CL_SH1_ENEMIES','CL_SH1_CREATURES'],poses:{
    idle:{
      basis:'Le guide situe le Scratcher au sol ou suspendu au plafond des égouts ; griffes et corps insectoïde dans le modèle.',
      description:'Hanged Scratcher SH1 : préparer deux attentes distinctes, ramassée au sol et suspendue sous un plafond réel. Conserver corps vert voûté, tête allongée et membres griffus du modèle ; relever les contacts des membres pour chaque support. La variante suspendue doit garder une prise lisible sur le plafond, sans lévitation ni pied posé sur une ligne de sol invisible. Sans plafond compatible, seule la branche au sol est admissible.',
      limits:'Support et attente d’embuscade documentés ; contacts exacts et vue opposée restent à relever.'},
    walk:{
      basis:'Le guide décrit une approche avec cliquetis des membres, puis griffure ; suspension au plafond distincte.',
      description:'Hanged Scratcher SH1 : décrire l’approche basse depuis les appuis griffus, avec le dos arqué et les grandes articulations repliées du modèle. Relever l’ordre des contacts plutôt que plaquer un talon-pointe humain. Une progression au plafond, si capturée, conserve le même contact supérieur ; la marche au sol ne peut pas être retournée arbitrairement pour fabriquer cette séquence. La griffure reste une attaque distincte du cycle.',
      limits:'L’approche est attestée ; aucune cadence, séquence complète de contacts ou marche plafonnière n’est produite.'},
    hurt:{
      basis:'La créature peut être attaquée au sol ou au plafond ; le guide distingue chute tardive et début de défaite.',
      description:'Hanged Scratcher SH1 : garder l’impact au sol et l’impact en suspension comme branches séparées. Au sol, préserver les griffes et les articulations repliées ; sous plafond, conserver le support jusqu’à ce qu’une perte de prise soit effectivement relevée. Ne pas transformer la portée de griffe en prise de la victime, et ne pas faire tomber le corps à chaque hitstun du versus. L’angle et l’ampleur de recul restent à observer.',
      limits:'Aucune libération de plafond automatique ni animation de saisie n’est attestée par cette preuve.'},
    knockdown:{
      basis:'Le guide précise que le Scratcher met du temps à tomber après une atteinte fatale ; ce fait ne décrit pas un stun récupérable.',
      description:'Hanged Scratcher SH1 : distinguer le knockdown récupérable proposé pour le versus de la chute tardive après mort décrite par le guide. Pour l’état couché à produire, conserver les membres griffus et le corps ramassé ; relever les appuis de réception sans recycler la marche ou inventer une roulade. Une chute depuis le plafond demande sa capture propre, avec rupture de prise et contact au sol continus.',
      limits:'La chute fatale est documentée, pas le relèvement de manche ; aucune durée ni trajectoire de knockdown n’est validée.'},
    phase:{
      basis:'Sol et plafond sont deux supports de la même identité SH1, pas deux formes interchangeables.',
      description:'Hanged Scratcher SH1 : limiter la transition de support à un raccord documenté entre sol et plafond, sans changement d’espèce ni griffes supplémentaires. Conserver tête, dos et membres sur toute la transition ; relever le moment du dernier appui inférieur et de la première prise supérieure. Un décor sans plafond interdit la branche suspendue. Une téléportation vers le haut ou un saut libre ne peut pas remplacer ce raccord absent.',
      limits:'La présence sur deux supports n’atteste pas comment la créature passe de l’un à l’autre ; cette transition reste à capturer.'}
  }},
  {fighterId:'sh3_pendulum_039',source:'sh3',edition:SH3,evidence:['CL_SH3_ENEMIES','CL_SH3_CREATURES'],poses:{
    idle:{
      basis:'Deux demi-torses et têtes réunis, lames et état aérien tournoyant décrits dans le guide SH3.',
      description:'Pendulum SH3 : maintenir les deux demi-torses et leurs têtes réunis au centre, avec les lames de chaque moitié ; aucune aile ne porte le vol. Séparer attente tournoyante en l’air et attente posée sur les grandes lames latérales. L’axe commun doit rester continu entre les images, sans séparer les torses ni dessiner une tête supplémentaire. La vitesse de rotation et la hauteur de suspension attendent une capture.',
      limits:'Anatomie et états air/sol attestés ; le modèle fixe ne constitue pas un tour complet de rotation.'},
    walk:{
      basis:'Le guide indique que les grandes lames latérales servent à marcher et distingue marche au sol et vol.',
      description:'Pendulum SH3 : au sol, construire le déplacement depuis les grandes lames latérales servant d’appuis, avec les deux demi-torses solidaires ; ne pas ajouter des pieds humains. En l’air, suivre la translation et la rotation du même ensemble sans contact de marche fictif. Le passage entre ces deux branches doit conserver l’axe central. Les coups de lame et la charge de tête tournoyante restent hors de ce cycle.',
      limits:'Locomotion sur lames documentée ; alternance, nombre d’images et trajet exact des pointes restent à relever.'},
    hurt:{
      basis:'Le guide distingue la déviation frontale des balles de Handgun et les armes capables de toucher le Pendulum.',
      description:'Pendulum SH3 : différencier l’impact reçu d’une balle déviée de face pendant la rotation. Pour hurt, conserver l’ensemble des deux torses et toutes les lames, sans appendice détaché ou arrêt instantané supposé de la rotation. Une déviation de Handgun n’est pas une réaction de blessure et ne certifie pas une immunité générale. Au sol, garder l’appui sur les lames ; en vol, relever toute baisse d’altitude séparément.',
      limits:'Défense frontale et atteinte documentées ; arrêt, recul et déformation après impact ne sont pas mesurés.'},
    knockdown:{
      basis:'Le guide décrit la possibilité de faire tomber le Pendulum avec une arme adaptée ; les deux moitiés restent une créature.',
      description:'Pendulum SH3 : préparer la perte de suspension et la réception du corps double avec ses lames, sans convertir l’ensemble en bipède couché. Relever quelle lame ou partie du torse rencontre le sol et comment l’axe de rotation se réoriente ; aucune moitié ne doit se détacher pour simuler la chute. Séparer état abattu, éventuelle récupération de versus et défaite définitive, sans réutiliser un PNG idle retourné.',
      limits:'La mise à terre est documentée ; côté de réception, rotation résiduelle et redressement restent à capturer.'},
    phase:{
      basis:'Le guide oppose état posé et état volant ; aucune nouvelle anatomie ni métamorphose de boss n’est décrite.',
      description:'Pendulum SH3 : pour le raccord sol/vol, conserver les deux demi-torses, l’axe central et les lames servant d’appuis avant suspension. Relever le dernier contact de lame et l’amorce de rotation aérienne sans créer d’ailes ni remplacer le corps par une hélice. Une hausse de vitesse à faible vie appartient au versus tant qu’une capture SH3 ne l’établit pas ; ce slot ne valide aucune transformation de forme.',
      limits:'Deux états documentés, raccord non mesuré ; ne pas confondre sélection d’état et nouvelle phase anatomique.'}
  }},
  {fighterId:'sh4_twin_victim_059',source:'sh4',edition:SH4,evidence:['CL_SH4_ENEMIES'],poses:{
    idle:{
      basis:'Deux têtes voisines sous un manteau sombre, pas de pieds ; le pointage d’attente est décrit par le guide.',
      description:'Twin Victim SH4 : conserver les deux têtes voisines, le manteau sombre et les très longs bras. L’attente doit distinguer les mains au sol du pointage vers Henry : dans ce dernier état, une main porte le corps pendant que l’autre indique la cible. Aucun pied ne sort du manteau pour stabiliser artificiellement la silhouette. Le pointage candidat existant ne fournit ni respiration complète ni raccord d’entrée/sortie.',
      limits:'Pointage et anatomie documentés ; pose contextuelle fixe et boucle idle restent deux livrables distincts.'},
    walk:{
      basis:'Le guide indique explicitement une locomotion sur les grands bras et mains, sans pieds.',
      description:'Twin Victim SH4 : organiser la locomotion sur les grandes mains sous les deux têtes et le manteau. Relever appui, soulèvement et repose de chaque main, en gardant le tissu solidaire du corps ; ne pas faire marcher des jambes cachées supposées. L’approche, la poursuite plus rapide et le plongeon offensif doivent être identifiés séparément. Un changement de vitesse du moteur n’ajoute pas les images intermédiaires de la course source.',
      limits:'Locomotion manuelle attestée ; contacts, phase relative du manteau et cycle complet non relevés.'},
    hurt:{
      basis:'La créature reçoit des coups mais son support demeure constitué des bras ; aucun geste de défense humain n’est documenté.',
      description:'Twin Victim SH4 : transmettre l’impact au corps sous le manteau en conservant les deux têtes et la longueur des bras. Relever quelle main reste porteuse pendant le recul et comment la main levée revient à l’appui ; ne pas ajouter de pieds, de garde de boxeur ou de troisième tête. Si le coup interrompt le pointage, prévoir le raccord vers l’appui avant une nouvelle approche, sans présenter cette proposition comme un clip original produit.',
      limits:'Raccord d’impact à produire sur capture ; l’existence du pointage ne prouve pas sa réaction d’interruption.'},
    knockdown:{
      basis:'Le guide permet de combattre et tuer Twin Victim ; son anatomie manuelle fixe la contrainte de réception.',
      description:'Twin Victim SH4 : préparer un affaissement où le corps drapé et les deux têtes restent solidaires, avec réception cohérente des grands bras. Aucun genou ou pied humain ne doit apparaître sous le manteau pour fabriquer le relèvement. Relever séparément chute, état au sol et retour sur les mains ; une reprise de manche du versus ne peut pas être déduite de la seule pose finale d’un ennemi mort.',
      limits:'Anatomie documentée ; la chute récupérable et son redressement ne sont pas validés par le guide de combat.'},
    phase:{
      basis:'Le guide mentionne des tailles différentes du même Twin Victim ; Bottom est une autre fiche anatomique.',
      description:'Twin Victim SH4 : le slot phase ne doit pas transformer les deux têtes drapées en Bottom à trois têtes. Garder manteau, bras porteurs et identité Twin Victim lors d’un raccord entre attente pointée, approche et plongeon ; les tailles rencontrées ne prouvent pas une croissance en combat. Un seuil de vie du versus ne peut ni ajouter la tête inférieure inversée ni retirer le manteau sans autre référence.',
      limits:'Variations de taille décrites sans métamorphose observée ; aucun changement d’espèce ou de phase source n’est livré.'}
  }},
  {fighterId:'sh4_patient_060',source:'sh4',edition:SH4,evidence:['CL_SH4_ENEMIES'],poses:{
    idle:{
      basis:'Le guide décrit un très grand humanoïde pâle tenant un marteau ; le modèle montre deux bras et deux jambes.',
      description:'Patient SH4 : préparer l’attente du grand humanoïde sur ses deux jambes, avec les deux bras et le marteau tenu dans la main porteuse du modèle. Conserver la tête et la chair pâle du Patient ; ne pas remplacer le marteau par la massue d’un autre profil ni l’attacher à un lit. Relever la hauteur de l’arme et le transfert de poids sans déduire un balancement respiratoire complet de l’image fixe candidate.',
      limits:'Arme et anatomie documentées ; pose idle originale et cadence de balancement encore à capturer.'},
    walk:{
      basis:'Le guide décrit l’approche du Patient et son marteau, puis un combo séparé de coups alternés.',
      description:'Patient SH4 : garder la marche sur les deux pieds et la grande hauteur du corps ; relever l’alternance des appuis avec le marteau continuellement dans la main porteuse. Ne pas faire traîner l’arme sur le sol sans capture et ne pas traiter les balancements du combo comme un cycle de marche. Le pivot offensif quand Henry est derrière doit être raccordé à part, sans téléportation du marteau d’une main à l’autre.',
      limits:'Approche et arme attestées ; enjambée, inclinaison et synchronisation du bras armé ne sont pas mesurées.'},
    hurt:{
      basis:'Le Patient crie quand il est touché ; le guide conseille de frapper pour interrompre son combo.',
      description:'Patient SH4 : préparer une interruption du combo au marteau avec continuité de la main armée et des deux pieds porteurs. Le cri à l’impact est documenté, mais ne fixe pas à lui seul la pose du torse, de la tête ou des épaules : les relever sur capture. Garder le marteau attaché à la même prise, sans le faire disparaître pendant le hitstun ni lui donner une attaque arrière permanente.',
      limits:'Interruption et cri sont attestés ; aucune image de réaction, amplitude ou fenêtre de vulnérabilité originale n’est mesurée.'},
    knockdown:{
      basis:'Le guide mentionne sa mise à terre et sa glissade dans les escaliers ; cette dernière dépend de la géométrie du lieu.',
      description:'Patient SH4 : séparer chute sur sol horizontal et glissade d’escalier. Conserver marteau, deux bras et deux jambes dans la réception ; relever si l’arme reste saisie plutôt que d’inventer son abandon. Le bruit particulier de glissade décrit dans SH4 ne justifie pas une pente ou un escalier dans toutes les arènes du versus. Le retour sur les pieds doit être produit indépendamment de la posture finale.',
      limits:'Glissade d’escalier documentée ; aucune chute universelle, trajectoire sur terrain plat ou récupération source n’est fournie.'},
    phase:{
      basis:'Le guide décrit combo au marteau et pivot quand la cible est derrière, sans seconde anatomie du Patient.',
      description:'Patient SH4 : utiliser le raccord de phase pour maintenir l’identité et le marteau entre attente, approche et pivot documenté. Lors du retournement, conserver le même côté armé relatif au corps ; ne pas seulement retourner une image en changeant la main porteuse. Aucune transformation en Nurse ou en Gum Head, aucun changement d’arme et aucune croissance après seuil de vie ne sont établis par cette fiche.',
      limits:'Le pivot est une attaque documentée, pas une nouvelle forme ; angles et images de raccord restent à produire.'}
  }},
  {fighterId:'sh4_bottom_065',source:'sh4',edition:SH4,evidence:['CL_SH4_ENEMIES'],poses:{
    idle:{
      basis:'Le guide identifie deux têtes supérieures, une tête inférieure inversée, deux bras locomoteurs et l’absence de manteau.',
      description:'Bottom SH4 : maintenir deux têtes au sommet et la troisième inversée sous le torse, avec deux grands bras terminés par les mains porteuses. Garder le corps découvert, sans manteau de Twin Victim ; la tête inférieure ne devient ni pied ni quatrième membre d’appui. Le guide ne confirme aucun pointage propre à Bottom : préparer l’attente depuis sa silhouette documentée, sans emprunter la taunt de son cousin.',
      limits:'Anatomie et supports attestés ; vue unique et absence de pointage documenté ne définissent pas une boucle complète.'},
    walk:{
      basis:'Bottom marche sur deux grands bras et mains ; le guide décrit poursuite et plongeon propres à cette fiche.',
      description:'Bottom SH4 : construire l’approche sur les deux mains, avec transfert du poids du torse et continuité des trois têtes, dont celle inversée sous le corps. Ne pas ajouter de jambes ni draper un manteau pour réutiliser le cycle de Twin Victim. Relever séparément marche, poursuite et amorce du plongeon ; le fait que les deux créatures partagent des familles d’attaque ne certifie pas des images ou proportions identiques.',
      limits:'Locomotion manuelle attestée ; alternance des mains, hauteur du torse et vitesse source non mesurées.'},
    hurt:{
      basis:'Le guide décrit les coups des bras et le traitement en combat ; trois têtes et deux mains restent les repères anatomiques.',
      description:'Bottom SH4 : conserver les deux masses de tête supérieures et la tête inférieure inversée pendant le recul proposé. Relever la main qui reste porteuse et le déplacement du torse découvert, sans dédoublement d’un bras pour garder artificiellement deux appuis. L’interruption d’un tour ou d’un plongeon doit suivre son propre état de départ ; ne pas lui appliquer la réaction drapée ou pointée de Twin Victim.',
      limits:'La réaction exacte d’impact n’est pas fournie par la ressemblance entre espèces ; captures propres au Bottom requises.'},
    knockdown:{
      basis:'Le guide traite Bottom comme ennemi combattable ; sa tête inversée sous le torse ne doit pas être effacée à la réception.',
      description:'Bottom SH4 : relever comment les bras et le torse découvert rencontrent le sol lors d’une mise à terre. Conserver les trois têtes, notamment celle inversée sous le corps, sans la remplacer par un pied ni masquer une pénétration du sol par un manteau absent. Séparer le plongeon offensif documenté de la chute subie ; un relèvement de versus doit retrouver les deux mains porteuses sans changement de variante.',
      limits:'Anatomie et plongeon attestés ; contact au sol, ordre de relèvement et différence entre chute et mort restent à capturer.'},
    phase:{
      basis:'Bottom est décrit séparément du Twin Victim et conserve sa propre anatomie ; aucune mutation progressive n’est donnée.',
      description:'Bottom SH4 : maintenir la même identité à trois têtes et torse sans manteau entre attente, poursuite, tour de bras et plongeon. Le passage d’un geste à l’autre ne doit pas faire pousser la tête inférieure à partir d’un Twin Victim à deux têtes. La force supérieure qualitative mentionnée par le guide ne démontre ni phase de rage, ni agrandissement, ni pose de pointage ou transformation selon la santé.',
      limits:'Aucune nouvelle phase anatomique documentée ; transitions exactes et gestes intermédiaires restent à produire.'}
  }},
  {batch:'lot10',fighterId:'sh1_monster_cybil_017',source:'sh1',edition:SH1,evidence:['CL_SH1_14_LAKESIDE_AMUSEMENT_PARK','CL_SH1_BOSSES'],poses:{
    idle:{
      basis:'Le guide distingue Cybil possédée au pistolet puis désarmée après abandon ; elle reste une personne sur ses deux pieds.',
      description:'Monster Cybil SH1 : distinguer l’attente armée de l’attente après abandon du pistolet, en conservant uniforme, silhouette humaine et deux appuis au sol. Dans la première, garder la même main porteuse et l’orientation de l’arme définies par la capture ; dans la seconde, laisser les mains libres pour les gestes de contact documentés. Aucun pistolet ne réapparaît pendant une boucle de présence ou une respiration proposée.',
      limits:'Deux états d’équipement sont attestés ; position exacte des mains et boucle de présence restent à capturer, sans arme ajoutée à l’état désarmé.'},
    walk:{
      basis:'La rencontre conserve une approche à pied ; tir et frappe de crosse précèdent les saisies désarmées dans le guide.',
      description:'Monster Cybil SH1 : relever l’approche sur les deux pieds et l’orientation du buste par rapport à Harry, sans confondre déplacement et tir. Avant l’abandon, le pistolet reste solidaire de sa main ; ensuite, l’approche ne conserve ni visée invisible ni arme cachée prête à revenir. Le carrousel fournit le lieu, pas un cheval ou un banc attaché au corps. Détailler les changements d’appui avant le contact sans inventer un cycle policier générique.',
      limits:'Approche et équipement sont documentés ; enjambée, prise d’arme et cadence ne sont pas des mesures originales.'},
    hurt:{
      basis:'Le guide permet de la frapper dans les deux états ; l’Unknown Liquid est une résolution scénaristique séparée.',
      description:'Monster Cybil SH1 : préparer l’impact en conservant les deux pieds, l’uniforme et l’état réel du pistolet. Une interruption armée ne vaut pas abandon automatique de l’arme ; un impact désarmé ne doit pas la faire réapparaître. Relever le recul et le retour du buste sans remplacer la réaction par une animation de policier sain. L’expulsion du parasite après Unknown Liquid ne sert pas de réaction hurt répétable.',
      limits:'L’impact est une réaction à relever ; guérison narrative, seuils de désarmement du versus et blessures de manche restent distincts.'},
    knockdown:{
      basis:'La chute finale après défaite est décrite ; sauver Cybil par le liquide est une autre issue du même affrontement.',
      description:'Monster Cybil SH1 : séparer chute terminale de l’affrontement, sauvetage par Unknown Liquid et knockdown récupérable du versus. Conserver les membres humains et la continuité du pistolet selon l’état de départ ; relever les appuis de réception sans lui ajouter roulade ou acrobatie. Une reprise de manche doit être conçue et comparée comme raccord du projet, sans recycler la mort de Cybil comme un relèvement original.',
      limits:'La défaite narrative ne certifie ni chute récupérable ni retour sur les pieds ; aucun timing ni cycle de reprise n’est livré.'},
    phase:{
      basis:'Le guide donne dix tirs puis abandon du pistolet et passage aux saisies ; le sauvetage dépend de l’Unknown Liquid.',
      description:'Monster Cybil SH1 : la transition d’équipement documentée va du pistolet aux mains libres après épuisement des dix tirs décrits par le guide. Relever l’abandon de l’arme, la fin de visée et la nouvelle approche, sans permuter librement les deux états. Le seuil de santé qui désarme dans le prototype reste une adaptation du versus. Le sauvetage par Unknown Liquid est une résolution séparée, sans rechargement ni résurrection de manche implicite.',
      limits:'Ordre des états attesté, images du lâcher non mesurées ; dix tirs ne donnent aucune durée d’animation ou cadence originale.'}
  }},
  {batch:'lot10',fighterId:'sh2_lying_figure_crawling_021',source:'sh2',edition:SH2,evidence:['CL_SH2_ENEMIES','CL_SH2_CREATURES'],poses:{
    idle:{
      basis:'Le guide distingue station debout et position couchée ; la fiche021 retient cette dernière, bras enfermés dans sa chair.',
      description:'Lying Figure rampante SH2 original : préparer l’attente du corps déjà couché près du sol, avec les bras enfermés dans l’enveloppe de chair. Relever le contact du tronc et des membres visibles sans créer deux mains libres pour stabiliser le corps. Garder cette silhouette basse propre à021 ; la pose debout et son jet acide appartiennent à une autre branche du catalogue, pas à cette attente.',
      limits:'Position couchée et bras entravés sont attestés ; répartition précise des appuis et respiration ne sont pas relevées.'},
    walk:{
      basis:'Le guide décrit un rampement très rapide au sol et une percussion ; les membres supérieurs restent enveloppés.',
      description:'Lying Figure rampante SH2 original : le slot walk doit être un déplacement du corps couché, avec contacts bas continus à relever sur la variante021. Garder les bras dans leur enveloppe, sans cycle quadrupède construit avec des mains ajoutées. Séparer glissement d’approche, accélération et percussion de James ; déplacer horizontalement un PNG debout ou reprendre son souffle acide ne produit pas ce rampement.',
      limits:'Rampement et percussion sont documentés, mais aucun cycle d’appuis, trajet ou nombre d’images n’est mesuré.'},
    hurt:{
      basis:'Le guide permet d’atteindre la créature au sol et distingue ses fuites rampantes d’un véritable achèvement.',
      description:'Lying Figure rampante SH2 original : conserver la position basse et l’enveloppe des bras pendant l’impact. Relever la torsion ou le déplacement du tronc sans libérer une main ni redresser immédiatement le corps pour afficher hurt. L’interruption d’une percussion doit repartir de cette pose rampante ; une fuite au sol après avoir été touchée n’est pas automatiquement une récupération debout ou une nouvelle attaque acide.',
      limits:'La réaction visible est à capturer sur la forme couchée ; aucun recul, redressement ou jet acide n’est validé ici.'},
    knockdown:{
      basis:'Le guide distingue une créature au sol encore capable de ramper ou se relever de son achèvement définitif.',
      description:'Lying Figure rampante SH2 original : une silhouette déjà couchée ne devient pas knockdown par simple retour au même idle. Relever l’arrêt de la percussion, la perte de mouvement et l’état au sol après impact, toujours sans mains libres. Distinguer fuite rampante, éventuel redressement de l’ennemi complet et mort achevée. Le profil021 ne doit pas changer silencieusement en020 pour fabriquer son retour de manche.',
      limits:'État au sol vivant et achèvement sont distincts dans le guide ; leur différence visuelle et leur durée restent à relever.'},
    phase:{
      basis:'Station debout et rampement sont des états documentés de Lying Figure ; le catalogue021 les sépare volontairement.',
      description:'Lying Figure rampante SH2 original : conserver les bras enfermés et l’identité021 pour ses raccords d’arrêt, de reprise et de percussion au sol. Une capture peut montrer le passage debout/couché du même ennemi original, mais elle doit identifier tout le raccord avant de transférer une forme au catalogue. Ce slot ne débloque ni posture020 ni souffle acide dans le versus ; aucun seuil de vie ne prouve une métamorphose.',
      limits:'La coexistence des états ne livre pas leur transition image par image et ne change pas la portée documentaire de la variante rampante.'}
  }},
  {batch:'lot10',fighterId:'sh2_maria_final_manifestation_033',source:'sh2',edition:SH2,evidence:['CL_SH2_BOSSES','CL_SH2_CREATURES'],poses:{
    idle:{
      basis:'Le guide du boss final décrit la forme encagée en suspension ; le rôle exact Maria reste distinct de la fiche Mary034.',
      description:'Maria finale033, campagne principale de SH2 original : préparer la présence aérienne du corps dans son cadre, sans appui pédestre sur le sol. Conserver l’orientation du corps et les attaches du cadre propres à cette manifestation, à relever sur une capture Maria identifiée. La mention collective Mary/Maria du guide ne prouve pas des textures ou un visage interchangeables avec034 ; cette fiche ne décrit pas une rencontre de Born from a Wish.',
      limits:'Suspension et cadre attestés ; identification visuelle Maria, attaches précises et boucle de présence restent ouvertes.'},
    walk:{
      basis:'Le guide indique que la forme encagée approche James en restant en hauteur, avec attaques d’essaim et d’appendice distinctes.',
      description:'Maria finale033 SH2 original : le slot walk doit suivre la translation du cadre en suspension, corps et cadre se déplaçant ensemble sans jambes marchant sous lui. Relever hauteur, orientation et distance du sol à partir d’une scène Maria confirmée. L’essaim de papillons noirs est un objet d’attaque séparé ; il ne peut pas remplacer le corps pour illustrer la locomotion. Ne pas emprunter une marche ou un déplacement du remake2024.',
      limits:'Approche aérienne documentée ; trajectoire, oscillation et vitesse ne sont pas mesurées, aucun cycle de vol n’est produit.'},
    hurt:{
      basis:'Le guide décrit des tirs reçus pendant la suspension avant une chute finale du cadre.',
      description:'Maria finale033 SH2 original : conserver cadre, corps et orientation aérienne pendant l’impact proposé. Relever la réponse du cadre et du corps séparément, sans défaire leurs attaches ni libérer une pose humaine debout. Une atteinte ne doit pas être confondue avec le cri qui annonce l’essaim ou avec la saisie par l’appendice sombre. La chute terminale n’est pas un recul hurt à rejouer après chaque coup.',
      limits:'Dégâts reçus et chute finale sont attestés ; déformation, oscillation et reprise intermédiaire restent à capturer pour Maria.'},
    knockdown:{
      basis:'Après la confrontation aérienne, le guide décrit une chute dans le cadre puis le dernier coup porté au sol.',
      description:'Maria finale033 SH2 original : préserver l’unité corps/cadre dans la réception au sol décrite à la fin du combat. Relever le contact du cadre avant de placer le corps, sans ajouter de jambes d’appui ou faire disparaître les barreaux. Cet état attend le dernier coup dans la scène source ; un knockdown récupérable du versus doit être signalé comme adaptation et ne peut pas déduire un nouveau décollage de cette fin terminale.',
      limits:'Chute terminale attestée ; aucun relèvement, retour en vol ou durée de récupération originale n’est validé.'},
    phase:{
      basis:'Le guide distingue confrontation aérienne et état terminal au sol ; l’identité Maria dépend du scénario de fin concerné.',
      description:'Maria finale033 SH2 original : documenter le raccord unique de la confrontation aérienne vers le cadre tombé au sol, puis la résolution finale. Conserver la même identitéMaria et les attaches visibles pendant toute la chute ; ne pas changer la fiche enMary034, enFlesh Lip ou enboss du remake pour remplir une phase. Le retour aérien d’une manche suivante appartient au versus et demande sa propre continuité, sans être présenté comme une étape originale du boss.',
      limits:'Ordre aérien/terminal documenté ; raccord, identité visuelle de la fin concernée et images originales restent à relever.'}
  }},
  {batch:'lot10',fighterId:'sh3_closer_church_variant',source:'sh3',edition:SH3,evidence:['CL_SH3_ENEMIES','CL_SH3_CREATURES'],poses:{
    idle:{
      basis:'Le guide décrit deux gros bras rembourrés, jambes de taille ordinaire, tête à grande bouche et aspect verdâtre des Closer de l’église.',
      description:'Closer de l’église SH3 : conserver les deux bras volumineux s’élargissant vers leur extrémité, les deux jambes et la petite tête mobile à grande bouche. La variante tardive est décrite comme verdâtre ; relever sa texture et sa silhouette sur une scène de l’église plutôt que recolorer le PNG du Closer036. Dans l’attente, garder les pieds au sol et les lames rétractées sauf si une capture de cet état prouve leur sortie.',
      limits:'Anatomie et teinte qualitative documentées ; palette exacte, mouvement de tête et position des bras ne sont pas mesurés.'},
    walk:{
      basis:'Le guide distingue la grande masse du Closer et la version de l’église plus rapide, sans coefficient officiel.',
      description:'Closer de l’église SH3 : relever la progression sur les deux jambes sous les grands bras rembourrés, avec transfert de masse du torse et continuité de la tête. Le guide qualifie cette variante de plus rapide que les premières rencontres, mais ne donne aucun multiplicateur ni nombre d’images. Ne pas accélérer mécaniquement un cycle036 pour le certifier ; conserver la version de l’église, sans locomotion suspendue du MandarinSH2.',
      limits:'Différence qualitative de vitesse attestée ; appuis et cadence propre à cette variante restent à capturer.'},
    hurt:{
      basis:'Les attaques peuvent faire tomber les Closer ; les gros bras et leurs lames éventuelles restent leurs appendices propres.',
      description:'Closer de l’église SH3 : préparer la réaction d’impact en conservant les deux jambes et les volumes des bras, sans les convertir en boucliers détachés. Identifier si une lame était rétractée ou déjà sortie au contact et maintenir cet état jusqu’au raccord observé. Ne pas confondre recul subi et tour offensif des bras ; l’aspect verdâtre et la résistance qualitative ne suffisent pas à prouver une armure ou une absence d’impact.',
      limits:'Réaction d’impact et état des lames à relever sur la variante tardive ; aucune invulnérabilité ou animation héritée n’est certifiée.'},
    knockdown:{
      basis:'Le guide distingue les Closer déjà morts au sol de ceux nécessitant un coup d’achèvement.',
      description:'Closer de l’église SH3 : relever la réception du torse lourd et des deux grands bras après mise à terre, avec les jambes du même modèle. Garder la variante de l’église et l’état réel des lames ; ne pas cacher les contacts sous une rotation de PNG. Un corps au sol peut encore demander un coup final selon le guide, mais cette possibilité ne prouve pas un relèvement complet. Séparer knockdown de manche et mort achevée.',
      limits:'État au sol et achèvement sont documentés globalement pour Closer ; réception et récupération spécifiques de l’église restent ouvertes.'},
    phase:{
      basis:'Le guide situe une apparence verdâtre et des performances accrues chez les Closer de l’église ; il ne décrit pas leur transformation en plein duel.',
      description:'Closer de l’église SH3 : maintenir l’aspect et les proportions de la variante tardive pendant les raccords entre attente, marche et attaques de bras. Sa présence verdâtre à l’église ne prouve pas une transformation instantanée du Closer036 à faible santé. Relever séparément sortie de lame et tour offensif sans changer d’espèce, sans importer MandarinSH2 et sans présenter un réglage de vitesse du versus comme nouvelle phase de boss.',
      limits:'Variante de lieu documentée, pas métamorphose temporelle mesurée ; aucun changement d’anatomie ni seuil de phase original n’est livré.'}
  }},
  {batch:'lot10',fighterId:'sh4_jasper_gein_victim_17',source:'sh4',edition:SH4,evidence:['CL_SH4_ENEMIES'],poses:{
    idle:{
      basis:'Victim17 est un fantôme brûlant qui porte un chandelier métallique ; le guide décrit séparément son aura de proximité.',
      description:'Jasper, Victim17 de SH4 : préparer l’attente en lévitation de sa silhouette enflammée avec le chandelier métallique dans la main porteuse. Aucun pied ne doit porter la masse comme chez Richard19, seul fantôme décrit marchant sur ses pieds. Conserver le corps sous le feu sans remplacer le chandelier par une torche, une massue ou un club de golf. Une nappe de flammes ne doit pas masquer l’absence de pose corporelle à produire.',
      limits:'Lévitation, feu et chandelier attestés ; contours sous les flammes, hauteur et boucle d’attente restent à capturer.'},
    walk:{
      basis:'Le type Ghost se déplace en flottant ; Jasper transporte son chandelier tout en conservant sa présence brûlante.',
      description:'Jasper, Victim17 de SH4 : le slot walk est une translation en lévitation avec continuité du chandelier et du corps dans les flammes, sans cycle de marche sur les pieds. Relever orientation du torse et position de la main armée quand il s’approche ou s’éloigne. L’aura brûlante est un effet de proximité distinct du déplacement ; dessiner uniquement une traînée de feu ne remplace pas les images de ce mouvement.',
      limits:'Flottement et équipement documentés ; trajet du corps et mouvement relatif des flammes ne sont ni mesurés ni animés ici.'},
    hurt:{
      basis:'Le guide décrit des coups pouvant l’affaiblir et une résistance aux Holy Candles, sans réaction unique pour toutes les armes.',
      description:'Jasper, Victim17 de SH4 : conserver lévitation, chandelier et identité du fantôme pendant l’impact. Relever la réaction du corps séparément de celle des flammes ; ne pas supposer que chaque coup les éteint ni qu’une Holy Candle le renverse immédiatement. L’interruption d’un coup de chandelier doit garder l’arme dans la même main jusqu’à la transition observée. Aucun cri, recul ou arrêt du feu ne doit être déduit du seul hitstun du moteur.',
      limits:'Atteinte et résistance relative sont documentées ; effets par arme, mouvement du corps et fenêtres originales restent ouverts.'},
    knockdown:{
      basis:'Le guide indique que les flammes s’éteignent lorsqu’il tombe et qu’il peut ensuite être immobilisé avec une Sword of Obedience.',
      description:'Jasper, Victim17 de SH4 : distinguer affaiblissement, chute avec extinction des flammes et immobilisation éventuelle par Sword of Obedience. Relever le contact du corps au sol et le devenir du chandelier sans inventer sa disparition. La lame d’immobilisation est un objet adverse, pas son arme. Le fantôme n’est pas tué par cette mise à terre ; la posture de reprise éventuelle ne doit pas être reprise d’une mort humaine définitive.',
      limits:'Extinction à la chute et immobilisation sont attestées ; trajectoire, position au sol et récupération ne sont pas relevées.'},
    phase:{
      basis:'Le guide oppose le fantôme enflammé actif à son état tombé, flammes éteintes et pouvant être maintenu par une épée.',
      description:'Jasper, Victim17 de SH4 : préparer le raccord feu actif vers corps tombé et flammes éteintes, avec continuité du chandelier et de la silhouette. Séparer cette transition de l’ajout ou du retrait d’une Sword of Obedience ; aucune épée ne devient un équipement offensif de Jasper. La reprise après libération ou une nouvelle manche du versus nécessite son propre raccord, sans rallumage automatique à chaque seuil de santé ni emprunt de la téléportation de Richard19.',
      limits:'États actif et tombé documentés ; ordre exact des images, rallumage et transition de reprise restent à capturer.'}
  }},
  {batch:'lot10',fighterId:'sh4_andrew_desalvo_victim_18',source:'sh4',edition:SH4,evidence:['CL_SH4_ENEMIES'],poses:{
    idle:{
      basis:'Le guide décrit Victim18 chauve, torse nu, corpulent, en pantalon bleu, chantant pendant sa lévitation et marqué18/21 au ventre.',
      description:'Andrew, Victim18 de SH4 : conserver le torse nu corpulent, la tête chauve, le pantalon bleu et le repère18/21 du ventre dans l’attente flottante. Les jambes ne deviennent pas des appuis au sol ; aucun chandelier, pied-de-biche ou feu d’un autre Ghost n’est ajouté. Son chant accompagne la présence, mais ne décrit ni projectile sonore ni pose de cri offensif. Relever le mouvement du corps plutôt que déplacer un portrait fixe.',
      limits:'Identité, tenue et flottement attestés ; articulation, mouvement respiratoire et synchronisation du chant restent à capturer.'},
    walk:{
      basis:'Le guide décrit son flottement, y compris un recul, et distingue ce déplacement de la charge en tonneau.',
      description:'Andrew, Victim18 de SH4 : le slot walk doit être un déplacement flottant du corps corpulent, torse nu et pantalon bleu conservés. Relever progression et recul sans alternance de pas au sol ; la roulade en tonneau est une attaque séparée et ne constitue pas toute sa locomotion. Garder le repère ventral et l’orientation de la tête cohérents lorsque le corps change de direction, sans retourner arbitrairement une image pour fabriquer le côté opposé.',
      limits:'Flottement et recul sont documentés ; vitesse, appuis apparents et vues opposées ne sont pas produits par cette description.'},
    hurt:{
      basis:'Victim18 peut être touché, résiste et peut tomber plusieurs fois avant immobilisation ; la Silver Bullet fournit un autre cas.',
      description:'Andrew, Victim18 de SH4 : relever l’impact sur le corps flottant sans ajouter de pieds porteurs, de feu ou d’arme dans ses mains. Si le coup interrompt la charge en tonneau, conserver l’orientation courante avant le retour à la présence normale ; ne pas utiliser une pose verticale pour masquer ce raccord. Distinguer atteinte ordinaire et effet d’une Silver Bullet, sans transformer sa robustesse qualitative en absence générale de réaction.',
      limits:'Atteinte et mises à terre répétées documentées ; comportement par projectile et animation d’interruption restent à mesurer sur capture.'},
    knockdown:{
      basis:'Le guide impose de le mettre au sol puis de l’immobiliser avec une Sword of Obedience pour obtenir la clé.',
      description:'Andrew, Victim18 de SH4 : séparer réception au sol, état encore susceptible de se relever et immobilisation par Sword of Obedience. Conserver le torse corpulent et le pantalon bleu pendant la chute, sans employer une roulade offensive comme chute subie. La clé appartient à la résolution de sa rencontre ; elle ne devient pas une arme ni un accessoire permanent de toute pose. Le fantôme immobilisé reste distinct d’un cadavre humain définitivement mort.',
      limits:'Mise à terre, épée et clé sont attestées ; réception exacte, durée au sol et redressement original ne sont pas relevés.'},
    phase:{
      basis:'La rencontre distingue flottement, charge en tonneau, mises à terre et maintien par épée ; il peut être libéré en reprenant l’épée.',
      description:'Andrew, Victim18 de SH4 : conserver la même identité entre flottement, orientation en tonneau et état immobilisé. Le passage au tonneau doit montrer comment le corps quitte sa verticale puis la retrouve, sans recréer sa masse à chaque image. L’ajout ou le retrait de Sword of Obedience change l’immobilisation, pas son anatomie ; ne pas lui donner une phase enflammée de Jasper17 ou une téléportation de Richard19 pour remplir ce slot.',
      limits:'États de rencontre documentés ; transitions articulées, reprise après libération et durée des phases restent à capturer.'}
  }}
];

export const SOURCE_POSE_SPECIFICATIONS=Object.freeze(groups.flatMap(group=>Object.entries(group.poses).map(([pose,detail])=>Object.freeze({
  rowId:`${group.fighterId}:pose:${pose}`,batch:group.batch||'lot9',fighterId:group.fighterId,source:group.source,edition:group.edition,pose,
  evidence:Object.freeze([...group.evidence]),basis:detail.basis,
  description:detail.description+' '+documentationLimit,limits:detail.limits
}))));
export const LOT9_SOURCE_POSE_SPECIFICATIONS=Object.freeze(SOURCE_POSE_SPECIFICATIONS.filter(spec=>spec.batch==='lot9'));
export const LOT10_SOURCE_POSE_SPECIFICATIONS=Object.freeze(SOURCE_POSE_SPECIFICATIONS.filter(spec=>spec.batch==='lot10'));
const byRow=new Map(SOURCE_POSE_SPECIFICATIONS.map(spec=>[spec.rowId,spec]));

/** Refuse a brief borrowed by another edition, source, identity or unbound evidence. */
export function sourcePoseSpecification(fighter,reference,pose){
  const spec=byRow.get(`${fighter?.id}:pose:${pose}`);
  return spec&&fighter.id===reference?.id&&fighter.source===spec.source&&reference.source===spec.source&&
    reference.referenceEdition===spec.edition&&reference.combatRole==='combatant'&&
    Array.isArray(reference.referenceIds)&&spec.evidence.every(id=>reference.referenceIds.includes(id))?spec:null;
}
