# Air Screamer — revue du récit illustré

Revue du 25 novembre 2026 : **12 contrôles réussis et trois captures relues individuellement**, sans erreur de navigateur. Les octets de chaque capture concordent avec le [rapport HTTP](../qa-http/http-wave30-story/report.json) ; les empreintes et la portée sont conservées dans [validation.json](validation.json).

La preuve provient du [run 45660199560](https://github.com/darknigthmare/silent-hill-halo-of-flesh/actions/runs/45660199560), job `139367652764`, artefact `15045286963`, construit depuis le commit source `a1f434ea1d53eb933879442b05f1971c767c197f` après génération des données dérivées.

| Capture | Parcours réellement exercé | Observation visuelle |
| --- | --- | --- |
| `selection-intro.png` | Sélection ordinaire du Récit d’Air Screamer SH1. | Créature complète, ailes visibles, maison/niche/boîte aux lettres et légende lisible. |
| `first-chapter-intro.png` | Lancement ordinaire du premier chapitre. | Illustration, titre et texte lisibles dans le panneau narratif ; le contrôle attend ensuite sa fermeture et la phase de combat. |
| `ending-component.png` | Fixture isolée du composant de production, avec le helper de conclusion. | Rue vide, absence de la créature, même façade et légende de conclusion lisible. |

La dernière capture **ne représente pas un récit joué jusqu’au terme**. Les gardes du helper vérifient le propriétaire, le mode et l’achèvement ; un combat gagné isolément, une défaite et le profil homonyme de Book of Memories ne reçoivent pas cette image. Les quatre rencontres d’origine sont toujours listées. Aucun parcours terminé n’est injecté dans le jeu.

Aucun défaut bloquant d’affichage n’est observé dans ces trois vues. Le cadrage du panneau est plus petit que celui de la sélection ; cette revue ne couvre pas toutes les tailles d’écran. Les deux compositions restent fixes, originales compatibles et non certifiées 1:1 ; quelques textures diffèrent entre l’introduction et la conclusion. La scène de rivalité et la campagne globale restent à produire. Les service workers bloqués ne permettent aucune conclusion sur une mise à jour hors ligne.


## Correctif de sélection après cette exécution

La dernière revue du code a identifié un aperçu resté attaché au propriétaire d’un parcours conservé après retour à la sélection. Le correctif `selectedModeRun()` n’emploie ce parcours pour l’aperçu que si son mode et son propriétaire correspondent à P1. Il conserve le parcours et la sauvegarde pour la reprise explicite.

Le harness final ajoute le parcours ordinaire SH1 → Sélection → choix BoM → reprise SH1, avec contrôle de la nouvelle route, de l’absence d’image empruntée et de la conservation des adversaires/arènes/index. Ce contrôle supplémentaire est destiné à la CI du commit final ; les **12 contrôles et trois captures archivés ci-dessus restent ceux du run initial**, sans attribution rétroactive de ce correctif à leur exécution.
