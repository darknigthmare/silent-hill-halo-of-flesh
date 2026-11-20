# Reprendre les vues encore ouvertes après la vague 25

Le registre [remaining-evidence.json](remaining-evidence.json) contient les **43 dossiers artistiques encore ouverts** : **6 anciennes vues à reprendre** et **37 vues de combat absentes**. Il conserve l’identité exacte, l’œuvre, le rôle actuel, l’autorisation de duel et de super, la présence d’un portrait, le motif concret et les chemins de preuve. Les **26 portraits absents** sont compris dans cet ensemble ; ces nombres ne s’additionnent pas.

La couverture construite compte **187 vues latérales candidates**, **204 portraits** et **6 clips animés**. Douze anciennes vues ont été reprises dans cette vague : onze profils statiques et Air Screamer, dont trois poses de la boucle existante ont été réorientées. Aucun nouveau clip animé ni aucune certification 1:1 n’est compté. Ce registre décrit l’intégration artistique ; les rapports de QA documentent séparément son comportement dans le moteur.

## Les six anciennes vues restantes

| ID exact | Motif et condition de reprise |
|---|---|
| sh1_stalker_008 | La forme armée translucide de Nowhere doit être documentée dans l’édition exacte. L’ancien candidat dérive d’une description du Grey Child ; Larval Stalker ne peut pas lui servir de remplacement. |
| sh2_maria_final_manifestation_033 | Le candidat est antérieur au refus explicite de Mary Final Manifestation. Le nom Maria ne permet pas de reprendre la même génération refusée. |
| arcade_red_pyramid_thing_arcade | La source Arcade existe et diffère de celle du film. L’arrêt apparenté des raffinements Pyramid est toutefois explicite après le refus film de la vague 23 ; aucun refus propre à l’ID Arcade n’est attribué à tort. |
| bom_swarm_132 | La source native de 127×127 et le candidat actuel représentent un insecte individuel. Le profil latéral manque de détail ; les descriptions de groupe dans le corpus doivent être conciliées, sans imposer un essaim sur la seule base du nom. |
| film_creeper_swarm_film_173 | Le candidat présente trois créatures d’après un concept de 2006. La composition collective et son attribution au modèle final restent à vérifier ; trois n’est pas un compte canonique certifié. |
| film_red_pyramid_film_175 | Le raffinement exact a été refusé en sortie pendant la vague 23. Aucun PNG n’a été produit par cet appel ; le portrait et l’idle antérieurs sont conservés. |

## Les 37 vues absentes

Chaque profil a sa propre ligne dans le JSON. Les motifs principaux des 43 dossiers se répartissent en **16 insuffisances de source**, **11 refus historiques directs**, **9 arrêts liés à un sujet apparenté** et **7 divergences d’identité ou de corpus**. Certaines lignes portent un second motif ; les totaux indiqués ici utilisent uniquement le premier pour éviter de compter une même entrée deux fois.

Les limites de source sont précises : pieds ou attaches hors cadre, phénomènes sans corps fini, modèles non attribuables à l’édition demandée, variante d’arme non résolue, concept non retenu ou produit dérivé stylisé. Une référence d’une autre œuvre, une tête seule ou un pictogramme de carte ne résout pas ces absences. Le Collector conserve son rôle non combattant ; les manifestations environnementales et les profils non vérifiés ne deviennent pas des combattants en raison d’un manque d’image.

Les réessais après refus, changements d’étiquette et substitutions du même sujet ont été exclus de la vague. Les lignes distinguent un refus propre d’un arrêt apparenté et donnent l’identifiant de requête lorsqu’il est conservé. Les recherches anciennes restent décrites comme des preuves historiques, sans être présentées comme de nouvelles recherches effectuées pendant cette passe.

## Corrections à conserver lors de la prochaine reprise

**Townfall possède des sources nominatives exploitables.** Les cinq profils ne doivent plus être classés sans source d’après l’ancien rapport ART144. Les huit JPEG d’ART92-e ont été récupérés, décodés, comparés à leurs empreintes historiques et inspectés. L’inventaire est dans [townfall/references/source-inventory.json](townfall/references/source-inventory.json) et les contraintes de chaque forme dans [townfall/reference-delivery.json](townfall/reference-delivery.json). Les nouvelles vues restent des reconstructions latérales ; Fallen suit le concept final debout, et The Weight suit le modèle poursuivant 08 sans fusionner les têtes alternatives du concept 06.

**Air Screamer conserve son animation.** Ses trois nouvelles poses occupent les indices 0, 1 et 2 ; l’idle garde la séquence 0, 1, 0, 2 et toutes les durées de 6 ticks. Le portrait et le frame 3 de déplacement restent exactement identiques. Le marqueur de mouvement historique vise uniquement cet index 3. L’ancre et l’échelle des trois nouvelles poses sont communes. La livraison dédiée est [air-screamer/integration-delivery.json](air-screamer/integration-delivery.json) ; les poses générées ne sont pas présentées comme une animation extraite du jeu.

**Dark Nurse 2006 a des références complètes retrouvées, puis un refus de génération.** Son motif principal est ce refus explicite de 20261117, pas l’ancien manque de vues entières. **Swarm BoM n’impose pas un groupe**, et **le refus Red Pyramid film n’est pas un refus direct Arcade**.

## Utiliser les preuves

Les chemins et pointeurs JSON de chaque ligne ont été résolus, et les SHA256 des fichiers complets sont enregistrés. La couverture courante et la base immuable publiée sont également référencées. Avant de reprendre un dossier, lire son motif et la pièce exacte qui manque ; une nouvelle source doit lever cette limite pour la même identité et la même édition. Conserver les notices antérieures et expliquer ce que la nouvelle preuve remplace. Le registre ne modifie ni le corpus, ni les rôles, ni les capacités.
