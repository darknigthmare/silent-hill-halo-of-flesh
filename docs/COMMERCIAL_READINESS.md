# Passage au produit professionnel et à une éventuelle commercialisation
Date de référence : 14 octobre 2026.

## Décision de sortie actuelle : bloquée
La qualité professionnelle est un objectif de production, pas une étiquette obtenue en augmentant le nombre de tests ou de combattants. Le jeu n'est pas présenté comme complet, homologué, officiellement licencié ou prêt à vendre.

Le projet conserve Silent Hill conformément à sa direction. Aucune transformation silencieuse vers une autre franchise ou une propriété intellectuelle originale n'est effectuée. Une commercialisation fidèle à Silent Hill demande d'établir les droits nécessaires auprès des titulaires concernés. La licence MIT du code ne concède pas les droits sur les personnages, noms, dessins, histoires ou lieux préexistants. Des dessins faits spécialement pour ce projet ou la gratuité ne suffisent pas à établir une autorisation. L'état `commercialAuthorized: false` signifie « autorisation non établie dans ce projet », pas une analyse juridique complète.

Références consultées :
- Gouvernement français, contenus concernés par le droit d'auteur : https://www.economie.gouv.fr/apie/les-contenus-concernes-par-le-droit-dauteur
- Service Public, contrat de cession de droits d'auteur : https://entreprendre.service-public.gouv.fr/vosdroits/F22667
- Steamworks, onboarding et règle excluant les contenus sans droits suffisants : https://partner.steamgames.com/doc/gettingstarted/onboarding
- Konami, mentions de droits des produits : https://www.konami.com/siteinfo/en/license.html

Faire valider le périmètre contractuel et les obligations applicables par un professionnel qualifié avant tout engagement commercial. Aucun paiement de frais de boutique, contact éditeur ou modification d'un abonnement n'a été réalisé.

## Critères d'acceptation proposés

| Chantier | Preuve attendue avant approbation |
|---|---|
| Propriété intellectuelle | Contrats/licences couvrant les usages, les territoires et les supports envisagés ; revue de tous les médias inclus. |
| Arts et sons | Bibliothèque finale d'assets avec provenance et autorisations ; animation validée pour chaque famille, pas seulement des silhouettes partagées. |
| Fidélité | Fiches sourcées par créature, mouvement et lieu, séparant attesté, interprétation et adaptation de versus ; revue humaine. |
| Boucle complète | Parcours intégral début → combats → défaite/reprise → fin → crédits sans injection de résultats ; campagne et contenu narratif relus. |
| Équilibrage | Sessions humaines et simulations sans invulnérabilité ; analyse des affrontements, phases, projectiles, combos, attentes et déplacements bloquants. |
| Robustesse | Imports/reprises/perte de focus, arrêt brutal et mises à jour testés sur les cibles ; aucune perte de sauvegarde dans les essais d'acceptation. |
| Appareils | Clavier, manettes physiques et appareils tactiles ; tests de lisibilité et d'accessibilité, pas seulement redimensionnement de fenêtre. |
| Performance | Budgets de temps d'image et de mémoire mesurés sur configurations nommées ; sessions longues ; seuils fixés avant verdict. |
| Distribution | Paquets desktop réellement compilés et testés, installation/désinstallation, mise à jour et signature selon plateforme ; un ZIP statique n'est pas un installateur. |
| Publication | Dossiers boutique, déclarations de contenu et d'usage d'IA applicables, classifications, confidentialité et examen de la boutique ; aucun résultat garanti. |

## Contrôle reproductible
`release/readiness.json` rend visibles les conditions ouvertes. `npm run release:check` renvoie un code 2 tant qu'un critère manque ou que les droits ne sont pas établis. Il vérifie des déclarations et références documentées, pas la validité juridique des contrats ; ne jamais le traiter comme une autorisation automatisée.

## Périmètre de cette livraison
Cette livraison clôt une première passe sur la continuité du parcours joueur : résultats corrects, reprise entre rencontres, règles persistantes, commandes utilisables et données locales contrôlées. Elle ne remplace pas les chantiers d'art, de narration complète, de fidélité exhaustive, de QA matérielle et d'édition listés ci-dessus.
