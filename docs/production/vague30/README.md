# Vague30 — compléter les manquants fixes

Référence de comparaison : `9c426d7e230eaec464203acb9b43b63a420acf30`. Date : 25 novembre 2026. Cette passe poursuit la production liée au [guide intégré à la bible](../../COMBAT_GAMES_GUIDE_INTEGRATION.md).

## Contenu produit

**14 PNG natifs indépendants, 17 083 537 octets ; zéro nouvelle animation.** Les images gardent le statut candidat et la fidélité non certifiée.

| Lot | Profils ou lieux | Raccord |
| --- | --- | --- |
| Trois poses | Sniffer Dog mâle SH4, Carrion Origins, Creeper SH1 | Deux `forwardSpecial` et un `walk` à frame unique ; anciens portraits et idles conservés. |
| Trois effets | Bogeyman Downpour, Straight-Jacket Origins, Incubus SH1 | Onde de poussière, boule acide jaune, éclair rouge ; sept commandes déjà actives. |
| Six plans de décor | Shimizu Residence II, quai de Toluca Lake Arcade, prison Otherworld Arcade | Un fond opaque et un plan rapproché transparent par lieu. |
| Deux images de récit | Air Screamer SH1 | Introduction et conclusion devant la même maison de Levin Street. |

Les fichiers, dimensions, octets et SHA-256 sont réunis dans [assets.json](assets.json). Les dossiers [personnages](characters/README.md), [projectiles](projectiles/README.md), [décors](stages/README.md) et [récit](story/README.md) consignent les prompts, références, observations et limites.

## Intégration et associations

Les profils et commandes existants sont conservés. La scène de la salle à manger est corrigée vers **Residence II**, sur le parcours Ending 1 après le souvenir ; le corridor de Residence I garde son identité. La prison The Arcade représente un corridor de sa branche **Otherworld**, désormais fixé dans cet état. Ni la peinture d’un plafond, ni les nouveaux plans n’accordent de prise de plafond ou de nouveau danger.

Le récit individuel d’Air Screamer utilise ses nouvelles images à la sélection, au premier chapitre et à son achèvement. La file de quatre rencontres reste inchangée, avec ses raccords historiques de lieux encore à revoir. La scène contre le rival et la campagne globale restent des conceptions.

La bible ajoute les trois associations d’effet et lie les deux scènes sous leur propriétaire exact : **445 associations** attendues après régénération. Les compteurs détaillés proviennent de [status.json](../../combat-guide/status.json), les restes par identifiant de [inventory.json](inventory.json).

| Couverture | Base9c426d7 | Vague30 attendue |
| --- | --- | --- |
| Arènes avec bitmap candidat | 90/123 | 93/123 |
| Définitions d’effet projectile | 8 | 11 |
| Commandes projectile illustrées | 24/86 | 31/86 |
| Récits individuels avec illustrations | 0 | 1, avec deux images |
| Nouvelles animations | 0 | 0 |

## Classeurs

Les deux XLSX conservent exactement leur état validé du commit9c426d7, leurs feuilles, formules et annotations. **Le rafraîchissement des onglets Guide combat et Associations guide pour cette vague reste différé.** Le skill Spreadsheets impose l’édition et la vérification via Artifact Tool ; ce runtime est devenu inaccessible lors de la coupure. Les JSON et Markdown sont actualisés séparément. Aucun résultat de conservation historique n’est présenté comme une concordance XLSX avec les nouveaux compteurs.

Le [relais de mise à jour](characters/workbook-handoff.json) précise les deux fichiers à reprendre. L’inventaire compare leurs empreintes à la base.

## Vérification et interruption

Les 14 images ont été produites et relues avant l’indisponibilité du service d’exécution. Les audits locaux achevés ont validé six PNG de décor et les90 entrées antérieures du manifeste, puis les11 définitions projectile. La QA native de Bogeyman et Origins avait exécuté152 contrôles dans quatre scènes. Les captures et rapports restés sur la machine interrompue ne sont pas présentés comme des fichiers récupérés.

Les PNG ont été récupérés à l’octet depuis les résultats ImageGen et sauvegardés avec le connecteur GitHub. Les trois poses sont réimportées par le [script idempotent](characters/import-reviewed.py), qui exécute le véritable importeur et vérifie que201 autres propriétaires, les anciens idles, portraits et métadonnées ne changent pas.

Le workflow de revue de cette branche exécute les vrais générateurs Node/Pillow, les tests ciblés et la QA Chromium. Il exporte uniquement les fichiers dérivés et les preuves publiques du jeu pour permettre leur relecture et leur publication. Il garde des permissions de lecture sur le dépôt.

**État de publication : préparation des vérifications distantes.** Les résultats et liens d’exécution seront consignés après leur observation. Aucun résultat CI de cette vague n’est encore déclaré dans cette révision.

## Restes et limites

- **30 arènes** restent sans bitmap candidat après ce lot.
- **55 commandes de projectile** restent sans image associée après ce lot.
- Aucun nouveau profil, portrait ou sprite de base : les trois poses complètent des bases existantes.
- Incubus reste sans sprite de combat ; son éclair autonome ne lui donne pas une admission visuelle.
- La silhouette de Steel Guardian reste insuffisamment documentée ; Earth Guardian conserve son effet partiel.
- Cedar Grove, le passage interne Green Lion et le pont du Little Baroness attendent une vue exacte du lieu retenu.
- La QA HTTP bloque les service workers : elle ne certifie pas une mise à jour hors ligne.
- Les orientations opposées utilisent le miroir existant. Les cadrages latéraux, répétitions de mobilier, appuis et amplitudes versus restent des adaptations.
- Les catégories de manque se recoupent ; leur somme n’est pas un nombre d’assets à produire. Aucune fidélité1:1 n’est certifiée.
