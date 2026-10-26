/** Source-scoped artist briefs. Documentation only: no pose, clip or timing is produced here. */
const SH1='SH1 original 1999, région à fixer',SH3='SH3 original 2003',SH4='SH4 original 2004';
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
  }}
];

export const SOURCE_POSE_SPECIFICATIONS=Object.freeze(groups.flatMap(group=>Object.entries(group.poses).map(([pose,detail])=>Object.freeze({
  rowId:`${group.fighterId}:pose:${pose}`,fighterId:group.fighterId,source:group.source,edition:group.edition,pose,
  evidence:Object.freeze([...group.evidence]),basis:detail.basis,
  description:detail.description+' '+documentationLimit,limits:detail.limits
}))));
const byRow=new Map(SOURCE_POSE_SPECIFICATIONS.map(spec=>[spec.rowId,spec]));

/** Refuse a brief borrowed by another edition, source, identity or unbound evidence. */
export function sourcePoseSpecification(fighter,reference,pose){
  const spec=byRow.get(`${fighter?.id}:pose:${pose}`);
  return spec&&fighter.id===reference?.id&&fighter.source===spec.source&&reference.source===spec.source&&
    reference.referenceEdition===spec.edition&&reference.combatRole==='combatant'&&
    Array.isArray(reference.referenceIds)&&spec.evidence.every(id=>reference.referenceIds.includes(id))?spec:null;
}
