# Reprendre les vues encore ouvertes après la vague 26

Le registre [remaining-evidence.json](remaining-evidence.json) contient **40 dossiers encore ouverts** : **4 anciennes vues à reprendre** et **36 vues de combat absentes**. Les **26 portraits absents** sont compris dans cet ensemble ; ces nombres ne s’additionnent pas.

La couverture construite compte **190 vues latérales candidates**, **204 portraits** et **6 clips animés**. Cette vague résout **3 profils** : 2 anciennes vues reprises et 1 vues auparavant absentes. Aucun portrait, clip animé ou profil de roster supplémentaire n’est compté ; aucune fidélité 1:1 n’est certifiée.

## Profils résolus dans cette vague

| ID exact | Œuvre et rôle conservés | Preuve de livraison |
| --- | --- | --- |
| sh1_stalker_008 | Silent Hill (1999), armed Nowhere Stalker; original CLD2 model ; combatant ; duel déjà autorisé | [Livraison](characters/stalker/delivery.json) |
| film_creeper_swarm_film_173 | Silent Hill (2006), Mr. X final creature design; three-member representative swarm presentation ; scripted-encounter ; duel déjà autorisé | [Livraison](film/integration-delivery.json) |
| ascension_the_collector_183 | Silent Hill: Ascension, released Chapter21 / scene177F ; noncombatant ; hors duel | [Livraison](characters/collector/delivery.json) |

Les images sont des candidats latéraux statiques. Les rôles et capacités restent ceux du projet. Le Collector demeure non combattant. La composition Creeper2006 conserve les trois individus déjà représentés par le prototype ; ce nombre est explicitement représentatif et non canonique, sans acteur autonome ajouté. Une résolution n’est incluse que si son PNG actif correspond à la livraison et au [contrôle final](final-audit.json) réussi.

## Anciennes vues encore ouvertes

| ID exact | Motif et condition de reprise |
| --- | --- |
| sh2_maria_final_manifestation_033 | Le candidat Maria précède le refus explicite Mary Final Manifestation. Le sujet apparenté n’a pas été régénéré sous l’autre nom. Conserver le candidat antérieur ; aucun nouvel appel, relabel ou variante de remplacement du sujet refusé. |
| arcade_red_pyramid_thing_arcade | La source Arcade est identifiée et distincte, mais l’arrêt explicite des raffinements Pyramid apparentés suit le refus du profil film en vague23. Aucun refus propre à cet ID Arcade n’est retrouvé. Préserver le candidat Arcade existant ; ne pas réessayer le sujet par changement d’édition ni attribuer le refus film directement à cet ID. |
| bom_swarm_132 | Le bestiaire et le PNG actif représentent un petit insecte individuel, malgré le nom Swarm et le prose du corpus évoquant un essaim. La source native 127×127 en vue dorsale oblique ne résout pas le profil et les volumes cachés. Une référence BoM nominative plus lisible du profil ; résoudre explicitement individu/groupe avant toute nouvelle composition. Ne pas déduire plusieurs corps du seul nom. |
| film_red_pyramid_film_175 | Le raffinement exact du Red Pyramid film a été refusé en sortie pour violence en vague23. Aucun PNG produit ni importé ; l’ancienne sélection et l’ancien idle restent présents. Conserver l’art existant ; aucun réessai ni variante ou autre voie pour cette génération refusée. |

## Vues absentes et motifs

Chaque profil possède sa propre ligne dans le JSON, avec identité, œuvre, rôle, permissions, portrait et preuves. Les motifs principaux des 40 dossiers sont : **14 insuffisances de source**, **12 refus directs documentés**, **9 arrêts apparentés**, **5 divergences d’identité ou de corpus**. Seul le premier motif est compté pour éviter les doubles comptes.

**Bubble Head Nurse — Return to Silent Hill** dispose désormais de références finales entières. Son unique appel de génération de la vague26 a toutefois été refusé en sortie : requête `b468e2dc-c90c-4431-ab93-83f40574d77c`, **zéro PNG produit**, aucun réessai ni réétiquetage. Les [sources récupérées](film/source-recovery-nurse-return.json) et le [reçu du refus](film/receipt-nurse-return-refused.json) remplacent le manque de source comme explication actuelle ; les notices antérieures restent conservées. Le rôle non vérifié demeure hors duel.

## Utiliser les preuves

Le prompt Nurse conservé compte **2646 octets**, avec SHA256 **76b58f73e3d3d54962d31d6b61825aa404b505680b0e7cd5153c87b6457bf94b**. La chaîne originale envoyée à imagegen compte **2645 octets**, avec SHA256 **9fa78e316a3b5fb0ad0b20749ad9e2dc36cf81cd77564ad0795fda06436a8437**, identique au champ **promptSHA256** du reçu historique. La différence est exactement **1 octet** : un unique LF final **0x0a** ajouté au fichier texte conservé. Cette différence connue est vérifiée par les deux empreintes, les tailles et les octets terminaux ; aucun trim générique ni autre normalisation ne sont appliqués. Le prompt et le reçu originaux restent inchangés. Ces deux empreintes et cette différence sont consignées dans **promptVerified** pour ce profil.

Les **100 pointeurs JSON**, répartis dans **26 fichiers**, ont été résolus et chaque empreinte SHA256 recalculée. Les nouvelles livraisons sont liées aux reçus d’import terminés, aux octets des PNG actifs et aux fichiers de référence réellement présents. Aucun chemin de source Stalker n’est présumé : ses références ne peuvent provenir que d’une livraison existante et auditée.

La base publiée est `8c2b56320ceb9fd5490660cb8e20a2dbf62c57bb`, arbre `6a91576644a19bd0fb2ac23278e8584071e61dca`. Le [registre de la vague25](../vague25/remaining-evidence.json) reste intégralement conservé. Les recherches historiques ne sont pas présentées comme des recherches nouvelles. Les contrôles visuels et les exécutions du moteur sont documentés dans leurs rapports séparés ; ce registre n’en invente aucun résultat et ne modifie ni corpus, ni capacités, ni classeurs.
