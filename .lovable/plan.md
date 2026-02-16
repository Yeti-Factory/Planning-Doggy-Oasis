

## Implementation : Sauvegarde automatique vers OneDrive

### Etape 1 : Ajouter les 4 secrets

Configurer les secrets suivants (valeurs deja fournies par l'utilisateur) :
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`
- `ONEDRIVE_BACKUP_LINK`

### Etape 2 : Mettre a jour la fonction `auto-backup`

Reecrire `supabase/functions/auto-backup/index.ts` pour :

1. Conserver la logique existante (fetch des 6 tables + upload bucket `backups`)
2. Ajouter la synchronisation OneDrive :
   - Authentification OAuth2 `client_credentials` aupres de Microsoft
   - Resolution du dossier SharePoint via encodage base64 du lien de partage
   - Upload du JSON via PUT sur l'API Graph

### Etape 3 : Deployer et tester

- Deploiement automatique de la fonction
- Test via appel direct pour verifier l'apparition du fichier dans le dossier SharePoint

### Details techniques

La fonction reutilisera la meme logique que le projet Doggy Contract Hub :
- `encodeSharingUrl()` : encode le lien en format `u!base64`
- Appel `POST` vers `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token`
- Resolution via `GET https://graph.microsoft.com/v1.0/shares/{shareId}/driveItem`
- Upload via `PUT https://graph.microsoft.com/v1.0/drives/{driveId}/items/{folderId}:/{fileName}:/content`

