# Air Screamer — vague 25

Trois natifs RGBA individuels en profil latéral droit remplacent les seuls indices 0, 1 et 2 de l’idle historique. Ils représentent le neutre, les ailes hautes et les ailes basses. Le neutre a été généré depuis deux références SH1 inspectées et le glide de continuité ; les deux autres images sont des éditions ciblées de ses ailes. Aucun pixel produit n’a été modifié après génération.

La livraison de référence est `delivery.json`. Les prompts exacts et les chemins de références effectivement passés figurent dans `prompts.json` et `generation-receipts.json`. `native-png-audit.json` rapporte SHA256 natif, identité des pixels selon l’auditeur officiel, dimensions, alpha et poids. Les sorties originales restent préservées, reliées physiquement aux copies de production.

## Revue corporelle

Les trois images font 1536 × 1024 et utilisent la même ancre `[0.51, 0.735]` et le même `bodyHeight=0.42`. L’ancre représente le point sous le bassin ; la hauteur équivalente reste 430.08 pixels, indépendamment de la portée des ailes. Le bec, le sommet du crâne et les deux extrémités des pieds ont été repérés dans les PNG natifs à alpha ≥ 96. `body-landmarks.json` lie chaque mesure au SHA exact du PNG. Le plus grand déplacement d’un de ces repères par rapport au neutre est 2.606 pixels natifs. La revue indépendante d’`audit_previous_work` confirme le profil, les deux ailes, les deux pattes, les membres entiers et les trois poses distinctes.

Les textures et quelques contours diffèrent légèrement ; aucune identité pixel du corps n’est revendiquée. Le halo brun/noir visible dans certains aperçus est du RGB sous alpha nul. Les pixels natifs et les très faibles traces d’anticrénelage ont été conservés.

## Import dédié

`import-air-screamer-idle.py` est en lecture seule par défaut. Il réutilise les contrôles natifs de l’importeur officiel sans le modifier et nécessite un `--apply` explicite de l’intégrateur. Le baseline est lié par digest et l’entrée entière doit lui correspondre avant mutation. Le helper vérifie aussi tous les fichiers actifs, les anciens PNG et l’unicité des trois nouvelles poses. Le registre est publié en un point atomique après verrou et contrôle de concurrence.

L’unique modification de l’entrée autorisée est :

- Remplacer exactement `frames[0..2]` par les trois nouveaux natifs.
- Définir `combatView` à `side-view-candidate`.
- Ajouter exactement `retainedLegacyCombatFrames=[{index:3,sha256:'5adcb14c1e7f53938c4604dafeafc339317b0ab484578ae6e3ede23f1317ef01'}]`. Le validateur existant exige ce marqueur pour conserver le quatrième frame sans lui ajouter de tags ni modifier ses métadonnées.

Tous les autres champs restent identiques : portrait, frame 3, notes et provenance historiques, source, statut, fidélité `unverified`, rôle, règle de miroir, animation. L’idle reste `[0,1,0,2]`, six ticks par étape, boucle active. Le walk reste `[3]`, six ticks, boucle active. Il reste un seul clip animé.

Le dry-run a validé les trois nouvelles images et les 443 fichiers natifs alors actifs (`import-dry-run.json`). Il n’a appliqué aucun changement. La revue du helper a accepté le SHA `db7e699662001b88381499fa69fd2a10effa489f69928a1593db45a0e6b020dd`.

## Gate après import

L’intégrateur doit générer les données dérivées puis exécuter le harness cyclique dédié dans le vrai moteur : au moins deux cycles de 24 ticks, séquence de SHA `0,1,0,2`, captures des trois poses dans les deux orientations, projections des repères corporels, déplacement sur le frame 3 conservé et retour à l’idle, portrait inchangé. La livraison conserve explicitement `engineCycleQACompleted:false` ; les preuves postérieures appartiendront au reçu d’intégration et à la QA séparée.

Ces profils restent des reconstructions candidates. Les références sources sont avant/arrière, sans vraie orthographie latérale ; le glide de continuité est lui-même un candidat. Le rythme est celui du projet versus. Aucune fidélité 1:1, animation source mesurée ou anatomie gauche indépendante n’est certifiée.
