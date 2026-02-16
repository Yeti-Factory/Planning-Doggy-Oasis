
### Analyse du besoin
L'utilisateur souhaite automatiser la sauvegarde des données de son application vers son OneDrive, en utilisant une méthode de synchronisation ("SYNC") qu'il a déjà mise en œuvre dans un autre projet.

Après exploration des projets précédents, j'ai identifié que le projet **[Doggy Contract Hub](/projects/fcb316ee-df2b-4afa-93f8-bb9a71f3e45c)** contient une fonction `sync-onedrive` qui utilise l'API Microsoft Graph (via les identifiants Azure AD) pour envoyer des fichiers vers un dossier SharePoint/OneDrive partagé.

### Objectifs
1.  **Récupérer les identifiants** : Aider l'utilisateur à retrouver les identifiants Azure AD nécessaires dans ses autres projets.
2.  **Mettre à jour la sauvegarde** : Modifier la fonction `auto-backup` existante (ou en créer une nouvelle) pour exporter les données en JSON et les pousser vers OneDrive.
3.  **Sécurité** : Utiliser les secrets de l'éditeur pour stocker les identifiants Azure.

### Plan d'action

#### 1. Recherche des informations (SQL & Secrets)
Je vais fournir à l'utilisateur une requête SQL pour vérifier si des informations de configuration sont stockées dans ses tables, mais surtout lui indiquer où trouver les secrets dans l'autre projet.

*   **Action** : Fournir une requête SQL pour lister les tables/colonnes liées à OneDrive/Sync.
*   **Action** : Indiquer à l'utilisateur de copier les secrets `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` et `AZURE_TENANT_ID` depuis les réglages du projet **Doggy Contract Hub**.

#### 2. Modification de la fonction de sauvegarde (`auto-backup`)
Je vais enrichir la fonction `supabase/functions/auto-backup/index.ts` pour inclure la logique de synchronisation OneDrive.

*   **Ajout des identifiants Azure** : Lecture des variables d'environnement.
*   **Logiciel de Sync** :
    *   Authentification via `client_credentials` (OAuth2 Microsoft).
    *   Résolution du dossier de destination via un lien de partage (comme dans Doggy Hub).
    *   Upload du fichier JSON généré vers OneDrive.
*   **Gestion des erreurs** : Notification en cas d'échec de la synchronisation vers le Cloud Microsoft.

#### 3. Configuration des Secrets
Je vais demander à l'utilisateur d'ajouter les secrets suivants dans ce projet :
*   `AZURE_CLIENT_ID`
*   `AZURE_CLIENT_SECRET`
*   `AZURE_TENANT_ID`
*   `ONEDRIVE_BACKUP_LINK` (le lien de partage du dossier OneDrive/SharePoint où stocker les backups).

#### 4. Suivi des sauvegardes (Optionnel)
Ajouter une petite interface dans les **Paramètres** pour voir le statut de la dernière synchronisation OneDrive.

---

### Détails techniques

#### Requête SQL demandée pour le projet précédent :
Pour trouver dans quel projet et quelle table se trouvent les colonnes liées à OneDrive, l'utilisateur peut exécuter ceci dans l'éditeur SQL de ses autres projets :
```sql
SELECT table_name, column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND (column_name ILIKE '%onedrive%' OR column_name ILIKE '%sync%');
```

#### Architecture de la fonction `auto-backup` mise à jour :
```text
[Cron Job] -> [auto-backup Function]
                  |
                  |--> 1. Fetch tables data (JSON)
                  |--> 2. Save to Lovable Cloud Storage (Bucket 'backups')
                  |--> 3. Get Microsoft Graph Token (Azure AD)
                  |--> 4. Upload JSON to OneDrive Folder
```

#### Dépendances
*   Identifiants Azure AD (Client ID, Client Secret, Tenant ID).
*   Lien de partage OneDrive avec droits d'écriture.