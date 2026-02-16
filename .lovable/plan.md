
## Diagnostic du déploiement automatique sur Coolify

L'image confirme que la configuration de la source Git est correcte :
- **Branche** : `main` (ce qui correspond à ce que Lovable pousse).
- **Dépôt** : `YETI-FACTORY/PLANNING-DOGGY-OASIS`.
- **Source** : GitHub Public.

Puisque le webhook est bien envoyé par GitHub (vu précédemment) mais que Coolify ne réagit pas, voici les points de blocage probables dans Coolify :

### 1. Vérification du "Auto Deploy"
Dans l'onglet **"General"** de votre application sur Coolify, il existe une option nommée **"Auto Deploy"**. 
- Si cette option est **DÉSACTIVÉE**, Coolify recevra le webhook mais ne lancera pas de build.
- **Action** : Vérifiez que "Auto Deploy" est bien coché.

### 2. Spécificité du webhook "Manual"
Vous utilisez l'URL `.../webhooks/source/github/events/manual`. C'est une URL générique. Pour que Coolify sache quelle application exacte redéployer, il faut parfois que l'application soit la seule liée à ce dépôt ou qu'elle utilise un déploiement basé sur les push.

### 3. Solution recommandée : Utiliser une "GitHub App"
Le mode "Public GitHub" avec webhook manuel est souvent capricieux dans Coolify. La méthode la plus fiable et recommandée est de :
1. Aller dans les paramètres de votre instance Coolify -> **Sources**.
2. Ajouter une **GitHub App** (Coolify vous guidera pour l'installer sur votre compte GitHub).
3. Changer la source de votre application pour utiliser cette GitHub App au lieu de "Public GitHub".
*Cela gère les webhooks de manière native et sécurisée sans configuration manuelle.*

### Prochaines étapes pour tester
Pour valider que le code est bien prêt à être déployé, je vous suggère de cliquer sur le bouton **"Deploy"** (ou "Redeploy") manuellement dans le coin supérieur droit de Coolify. 
- Si le build réussit, vous verrez enfin les emojis `✨` sur `https://planning-doggy.yeti-factory.com`.
- Cela confirmera que le problème vient uniquement du *déclenchement automatique* (webhook) et non du code ou de la configuration de build.

**Voulez-vous que je vous aide à vérifier d'autres paramètres ou préférez-vous essayer le bouton "Deploy" manuel pour confirmer le changement ?**
