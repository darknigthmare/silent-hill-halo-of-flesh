# Vague 19 — six vues de combat Book of Memories

Six dessins latéraux droits, individuels et entiers, produits avec le générateur d’images intégré. Ce compte rendu décrit la production avant import ; les raccords au registre et la QA moteur sont documentés dans le [rapport d’intégration](README.md). Les portraits existants restent les références de sélection.

Le manifeste `fighter-generation.json` décrit les six fichiers sélectionnés, les prompts exacts, les sources de l’édition, les SHA-256, les bounds alpha 32/8 et les calibrages proposés pour le moteur. `fighter-references.json` conserve les URL et empreintes des références natives téléchargées pendant la production.

## Sélection

| Profil | Version retenue |
|---|---|
| Bogeyman BoM | side-right.v1 |
| Butcher BoM | side-right.v1 |
| Double Head BoM | side-right.v1 |
| Pyramid Head BoM | side-right.v2 |
| Schism BoM | side-right.v2 |
| Straight Jacket BoM | side-right.v1 |

Pyramid Head et Schism ont reçu chacun une seule correction de cadrage pour dégager le sommet et les appuis. Les deux v1 restent des variantes inactives.

## Contrôles réalisés

- Inspection visuelle de chaque référence utilisée et de chaque sortie, puis mesures RGBA/SHA256 en lecture seule.
- Un personnage par image, vue vers la droite, silhouette et équipement entiers ; quatre pattes distinctes pour Double Head.
- PNG natifs 1024×1536 ou 1536×1024, sans retouche ni redimensionnement après génération.
- Alpha réel : les halos de couleur visibles dans certains visionneurs sont surtout les RGB de pixels d’alpha nul. De faibles traces alpha sous 8 restent mesurées et non effacées.
- Butcher : lame rectangulaire, trou au coin et manche concordent avec la vignette du Great Cleaver BoM ; dimensions relatives à la main et épaisseur restent reconstruites.

## Limites

Les six fichiers sont des candidats latéraux statiques. Aucune nouvelle animation, durée d’origine mesurée, UHD native ou fidélité 1:1 certifiée. La marge demandée de 8–10 % n’est pas obtenue sur les quatre premiers rendus retenus ; la marge réellement mesurée est fournie. Les images corrigées Pyramid Head et Schism possèdent plus de 10 % de marge verticale lisible. Ancrages et hauteurs de corps sont des propositions de présentation versus à valider avec le renderer et les captures de combat. L’agent producteur n’a pas exécuté de QA moteur ni publié de commit.
