
### Synchronisation de la sauvegarde automatique avec OneDrive/SharePoint

Ce plan vise à mettre à jour la fonction de sauvegarde automatique (backend) pour qu'elle envoie une copie de chaque sauvegarde JSON directement dans votre dossier SharePoint, en plus de la conservation locale.

#### Étape 1 : Configuration des secrets (Default Mode)
Une fois le plan approuvé, j'ajouterai les secrets suivants dans votre environnement Lovable Cloud (ces valeurs ont été fournies dans la conversation) :
- `AZURE_CLIENT_ID` : `10e4d18b-c501-4f4a-be76-17e4dc036ee8`
- `AZURE_TENANT_ID` : `2e5b143a-0da3-4c4e-b161-10e25e2a2dc0`
- `AZURE_CLIENT_SECRET` : `ff195572-7708-4bf5-95bc-ed480b12b37a`
- `ONEDRIVE_BACKUP_LINK` : `https://yetifactory.sharepoint.com/:f:/s/YetiTeam-YetiPartage/IgBOZ0RZTH3rQ5HR9zDQd3w-ASElLHuK2mLn13tm9La9NNA?e=bEbtXx`

#### Étape 2 : Configuration du backend (`supabase/config.toml`)
Mise à jour de la configuration pour désactiver la vérification JWT sur la fonction `auto-backup`, permettant son exécution par des déclencheurs externes (comme un cron de sauvegarde) :
```toml
[functions.auto-backup]
verify_jwt = false
```

#### Étape 3 : Mise à jour de la fonction `auto-backup` (`supabase/functions/auto-backup/index.ts`)
Réécriture complète de la fonction pour intégrer la logique Microsoft Graph :
- **Extraction des données** : Récupération du contenu des tables (`people`, `planning_assignments`, etc.).
- **Génération JSON** : Création du fichier de sauvegarde avec un horodatage précis.
- **Sauvegarde locale** : Envoi dans le bucket de stockage `backups`.
- **Authentification Microsoft** : Utilisation du flux `client_credentials` avec vos identifiants Azure pour obtenir un jeton d'accès Graph API.
- **Résolution du dossier** : Identification automatique du dossier SharePoint cible à partir de votre lien de partage.
- **Upload OneDrive** : Envoi direct du fichier JSON vers SharePoint via l'API Graph.
- **Gestion d'erreurs** : Retour d'un statut combiné (Succès local + Succès/Échec OneDrive).

#### Étape 4 : Déploiement et Test
- Déploiement automatique de la fonction mise à jour.
- Test de la fonction via un appel direct pour vérifier que le fichier apparaît bien dans votre dossier SharePoint.

### Détails techniques
- La fonction utilisera l'API Microsoft Graph v1.0.
- L'URL de partage est encodée au format `u!base64` pour permettre à l'API `shares` de résoudre le `driveId` et le `folderId`.
- Le contenu est envoyé via une requête `PUT` sur le point de terminaison `/content` de l'item OneDrive.

#### Sécurité
- Vos secrets sont stockés de manière sécurisée dans Lovable Cloud et ne sont jamais exposés dans le code source frontal.
- L'utilisation du `SERVICE_ROLE_KEY` au niveau du backend garantit que la sauvegarde peut lire toutes les tables sans restriction de politiques RLS.

