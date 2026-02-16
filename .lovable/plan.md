

## Sauvegarde automatique vers OneDrive

### Resume
Adapter la fonction de backup existante pour envoyer automatiquement les sauvegardes JSON vers un dossier OneDrive/SharePoint, en reprenant la methode d'authentification Microsoft Graph deja utilisee dans le projet Doggy Contract Hub.

---

### Etape 1 : Ajouter les secrets Azure

Quatre secrets a configurer dans ce projet :

| Secret | Ou le trouver |
|--------|---------------|
| `AZURE_CLIENT_ID` | Portal Azure > App registrations > Votre app > Application (client) ID |
| `AZURE_CLIENT_SECRET` | Portal Azure > App registrations > Votre app > Certificates & secrets |
| `AZURE_TENANT_ID` | Portal Azure > App registrations > Votre app > Directory (tenant) ID |
| `ONEDRIVE_BACKUP_LINK` | Lien de partage d'un dossier OneDrive/SharePoint avec droits d'ecriture |

Vous pouvez aussi copier les 3 premiers depuis les secrets du projet **Doggy Contract Hub** si ce sont les memes identifiants Azure.

---

### Etape 2 : Mettre a jour la fonction `auto-backup`

Modifier `supabase/functions/auto-backup/index.ts` pour :

1. **Conserver** la logique existante (fetch des tables + upload dans le bucket `backups`)
2. **Ajouter** apres l'upload au bucket :
   - Authentification OAuth2 `client_credentials` aupres de Microsoft (meme code que Doggy Hub)
   - Resolution du dossier partage via `encodeSharingUrl` + appel Graph API `/shares/{shareId}/driveItem`
   - Upload du fichier JSON vers le dossier OneDrive via `PUT /drives/{driveId}/items/{folderId}:/{fileName}:/content`
3. **Gestion d'erreur** : si l'upload OneDrive echoue, la reponse indiquera le succes du backup local mais l'echec de la synchro OneDrive

```text
Architecture :
[auto-backup]
    |
    +--> Fetch all tables (people, planning_assignments, annual_events, weekly_tasks, custom_tasks, settings)
    +--> Generate JSON
    +--> Upload to Storage bucket "backups" (existant)
    +--> Get Microsoft Graph access token (OAuth2 client_credentials)
    +--> Resolve OneDrive folder from sharing link
    +--> Upload JSON to OneDrive folder
    +--> Return combined status
```

---

### Etape 3 : Desactiver la verification JWT (deja fait dans config.toml si necessaire)

La fonction sera appelable par un cron ou manuellement sans authentification utilisateur, comme c'est le cas actuellement.

---

### Details techniques

Le code reutilisera les fonctions utilitaires suivantes du projet Doggy Contract Hub :
- `encodeSharingUrl()` : encode le lien de partage pour l'API Graph
- `getAccessToken()` : obtient un token via `client_credentials`
- `getSharedFolderInfo()` : resout le driveId et folderId depuis le lien partage
- `uploadFile()` : upload via PUT sur l'API Graph

Le fichier JSON envoye sur OneDrive aura le meme nom que celui stocke dans le bucket : `backup-{timestamp}.json`.

