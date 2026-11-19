# Vague 17 — préparation des animations et arènes (19 novembre 2026)

Base : PR #6, commit `40201737c77ad12a0563251d6e7da8205c41d16f`. Ce document prépare les prochains lots sans présenter des ressources non générées comme terminées.

## Audit confirmé
- 204 portraits sur 230 ; 26 manquants.
- 123 profils latéraux ; 37 fiches sans image de combat ; 70 anciennes vues à réexaminer.
- 24 arènes bitmap sur 123 ; 99 manquantes.
- 48 illustrations de chroniques ; deux clips animés comptabilisés.
- 222 PNG retrouvés dans sept dossiers précédents et déjà rapprochés avec la PR.
- Vague 16 : 7 PNG actifs publiés, 83 assertions Canvas ; QA Node/Python et navigateur GitHub réussies.

## Priorité A — passer des poses fixes aux animations
Chaque pose est un PNG transparent indépendant, personnage entier de profil face à droite, avec marges, silhouette, costume, arme, dimensions logiques et ancre au sol constants. Le moteur peut retourner horizontalement l'orientation opposée, mais ce miroir ne vaut pas référence 1:1.

| Personnage | Animation prioritaire | Frames visées (cible, non livrées) | Particularités |
| --- | --- | ---: | --- |
| Faceless Nurse (Origins) | idle, garde, marche, attaque seringue, hit, KO, victoire | 6, 3, 8, 7, 4, 7, 6 | Garde déjà statique ; conserver la seringue entière |
| Scarlet forme poupée (Homecoming) | idle, marche, garde, coup, hit, transformation | 6, 8, 4, 7, 4, 10 | Ne pas confondre avec Scarlet arachnide |
| Scraper (The Arcade) | idle, marche, garde, double-lame, hit, KO | 6, 8, 4, 8, 4, 7 | Deux lames lisibles à toutes les frames |
| Incubator (SH1) | présentation et manifestations de boss compatibles avec son rôle | à définir | Respecter son rôle de boss stationnaire |

### Critères de validation
1. Un seul sujet et une seule pose par image ; alpha réel et silhouette complète.
2. Palette, proportions et équipement cohérents à travers toutes les frames ; aucune main, lame, seringue ou chaussure coupée.
3. Registre de clips avec durées, boucles, ancre, hitbox/hurtbox, priorité et transitions explicites ; ne pas réutiliser un portrait de sélection comme animation.
4. Vérifier les attaques, la garde maintenue puis relâchée, le retournement, les interruptions, les collisions et le budget mémoire dans le moteur.
5. Archiver les références et empreintes SHA-256 ; ne compter un clip comme animé que si plusieurs frames réellement distinctes sont raccordées et testées.

## Priorité B — décors
Produire séparément fond, plan médian, premier plan et éléments interactifs si le moteur les prend en charge. Prochains candidats à documenter et réaliser : antichambre des familles fondatrices (Homecoming), chambre d'Alessa (film 2006), chaufferie Otherworld de Midwich (SH1). Pour chacun : identifier la scène exacte, contrôler le cadrage 16:9, le sol jouable, les plans transparents, les vitesses de parallaxe, les obstacles visuels et les limites de caméra. Aucune de ces trois arènes n'est déclarée livrée par ce document.

## Priorité C — reste du catalogue
Achever les 26 portraits absents et les 37 vues de combat absentes, puis auditer les 70 anciennes vues. Continuer les 99 arènes sans bitmap, les illustrations de rivalité manquantes, les costumes et les props séparés. Maintenir les rôles non-combattants et les exclusions déjà consignées.

## Publication
Les livraisons ultérieures devront ajouter les PNG originaux, leurs registres, les scripts de test et les captures au même PR, par commits indépendants. Ne pas fusionner avant validation. **Ce fichier est un plan de production, pas un lot de sprites ou décors générés.**
