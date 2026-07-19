# Planning Pro — Doggy Oasis International

Application web interne pour gérer le planning mensuel, le calendrier annuel et les tâches hebdomadaires de l'équipe Doggy Oasis International.

Internal web application for Doggy Oasis International's monthly rota, annual calendar and weekly task planning.

## Français

### Fonctions principales

- personnel : salariés, bénévoles, prestataires et woofers ;
- affectations du matin, de l'après-midi ou de la journée, jusqu'à six personnes par créneau ;
- copie, collage, effacement et impression d'une journée, d'une semaine ou d'un mois ;
- calcul des heures par personne et par équipe ;
- jours de repos et vue mensuelle par personne ;
- événements dans un calendrier annuel ;
- tâches hebdomadaires, tâches personnalisées et impression ;
- synchronisation en temps réel entre utilisateurs connectés ;
- sauvegarde JSON dans Supabase Storage et, en option, dans OneDrive/SharePoint.

### Architecture

- interface : React 18, TypeScript, Vite, Tailwind CSS et shadcn/ui ;
- état client : Zustand ;
- données, authentification, temps réel, stockage et fonction de sauvegarde : Supabase ;
- hébergement : fichiers statiques sur Nginx, un VPS, Netlify, Cloudflare Pages ou équivalent ;
- aucune dépendance à Lovable n'est nécessaire.

Les données ne sont pas stockées sur le VPS de l'interface. Elles se trouvent dans le projet Supabase associé. La sauvegarde de la base et le transfert de Supabase sont donc aussi importants que le transfert du site.

### Démarrage local

Prérequis : Node.js 22 et npm.

```bash
git clone https://github.com/Yeti-Factory/Planning-Doggy-Oasis.git
cd Planning-Doggy-Oasis
cp .env.example .env
npm ci
npm run dev
```

Renseigner dans `.env` l'URL et la clé **publishable** du projet Supabase cible. Une clé `service_role` ou `sb_secret_...` ne doit jamais être placée dans l'interface, dans Git ou dans une variable `VITE_*`.

Vérification complète avant livraison :

```bash
npm run check
```

### Création ou reprise du projet Supabase

1. Installer le CLI Supabase et se connecter : `supabase login`.
2. Créer ou choisir le projet cible.
3. Lier le dépôt : `supabase link --project-ref VOTRE_PROJECT_REF`.
4. Prévisualiser les migrations : `supabase db push --dry-run`.
5. Appliquer les migrations : `supabase db push`.
6. Dans **Authentication > URL Configuration**, définir l'URL officielle du site et l'ajouter aux Redirect URLs.
7. Dans **Authentication > Users**, inviter au moins un utilisateur.
8. Autoriser explicitement son compte avec la requête SQL ci-dessous.

```sql
INSERT INTO public.app_members (user_id, role)
SELECT id, 'administrator'
FROM auth.users
WHERE lower(email) = lower('UTILISATEUR@EXEMPLE.FR')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
```

La migration ajoute automatiquement comme administrateurs les comptes Auth qui existent déjà au moment où elle est appliquée. Un compte créé ensuite doit être ajouté à `app_members`. Supprimer un accès :

```sql
DELETE FROM public.app_members
WHERE user_id = (SELECT id FROM auth.users WHERE lower(email) = lower('UTILISATEUR@EXEMPLE.FR'));
```

Tous les membres ont actuellement les mêmes droits fonctionnels. La table `app_members` empêche néanmoins un compte créé par erreur ou par inscription publique d'accéder aux données.

### Sauvegarde automatique

Créer un fichier local `supabase/.env` à partir de `supabase/.env.example`, générer une longue valeur aléatoire pour `BACKUP_INVOKE_SECRET`, puis :

```bash
supabase secrets set --env-file supabase/.env
supabase functions deploy auto-backup
```

Le stockage Supabase fonctionne seul. Les quatre variables Azure sont facultatives, mais elles doivent être soit toutes renseignées, soit toutes absentes. Pour la planification quotidienne, adapter puis exécuter `supabase/auto-backup-cron.example.sql` dans le SQL Editor. Le secret d'appel doit être identique dans les secrets de la fonction et dans Supabase Vault.

La sauvegarde contient : `people`, `planning_assignments`, `annual_events`, `weekly_tasks`, `custom_tasks`, `settings` et `rest_days`.

### Déploiement Docker sur un VPS

```bash
docker build \
  --build-arg VITE_SUPABASE_URL=https://VOTRE_PROJECT_REF.supabase.co \
  --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=VOTRE_CLE_PUBLISHABLE \
  -t planning-doggy-oasis:1.0.0 .

docker run -d --name planning-doggy-oasis \
  --restart unless-stopped \
  -p 127.0.0.1:8080:8080 \
  planning-doggy-oasis:1.0.0
```

Configurer ensuite le reverse proxy du VPS vers `http://127.0.0.1:8080`, activer HTTPS et pointer le DNS du domaine vers le VPS. Le contrôle de santé est disponible sur `/healthz`.

Les variables `VITE_*` sont intégrées au moment de la compilation : après un changement de projet Supabase, il faut reconstruire l'image.

### Transfert des données

Pour un transfert complet entre projets Supabase, suivre la procédure officielle de sauvegarde/restauration. En résumé, produire séparément `roles.sql`, `schema.sql` et `data.sql` avec `supabase db dump`, puis restaurer avec `psql` dans une transaction. Les objets Storage, les fonctions Edge, les secrets, la configuration Auth, Realtime et le cron doivent être vérifiés ou recréés séparément.

Ne jamais tester une restauration pour la première fois sur la production. Restaurer dans un projet vide, comparer les nombres de lignes des sept tables et tester une connexion avant de changer le domaine.

## English

### Main features

- people management for employees, volunteers, contractors and woofers;
- morning, afternoon and full-day assignments, with up to six people per slot;
- copy, paste, clear and print operations for a day, week or month;
- individual and team hour totals;
- rest days and a person-based monthly view;
- annual calendar events;
- weekly and custom tasks with print support;
- real-time synchronisation between signed-in users;
- JSON backups to Supabase Storage and optionally OneDrive/SharePoint.

### Architecture

- front end: React 18, TypeScript, Vite, Tailwind CSS and shadcn/ui;
- client state: Zustand;
- database, authentication, Realtime, Storage and backup function: Supabase;
- hosting: static files on Nginx, a VPS, Netlify, Cloudflare Pages or an equivalent service;
- Lovable is not required.

The application data is not stored on the front-end VPS. It lives in the associated Supabase project. The Supabase database and configuration must therefore be transferred as carefully as the website.

### Local development

Requirements: Node.js 22 and npm.

```bash
git clone https://github.com/Yeti-Factory/Planning-Doggy-Oasis.git
cd Planning-Doggy-Oasis
cp .env.example .env
npm ci
npm run dev
```

Set the target project's Supabase URL and **publishable** key in `.env`. Never put a `service_role` or `sb_secret_...` key in the browser application, Git, or any `VITE_*` variable.

Run the complete verification before release:

```bash
npm run check
```

### Creating or taking over Supabase

1. Install the Supabase CLI and run `supabase login`.
2. Create or select the target project.
3. Link the repository: `supabase link --project-ref YOUR_PROJECT_REF`.
4. Preview migrations: `supabase db push --dry-run`.
5. Apply migrations: `supabase db push`.
6. In **Authentication > URL Configuration**, set the official Site URL and add it to Redirect URLs.
7. Invite at least one user in **Authentication > Users**.
8. Explicitly authorise the account using the `app_members` SQL statement in the French section above.

Auth users that already exist when the migration runs are automatically added as administrators. Users created later must be added to `app_members`. All approved members currently have the same application permissions.

### Automatic backups

Create a private `supabase/.env` from `supabase/.env.example`, generate a long random `BACKUP_INVOKE_SECRET`, then run:

```bash
supabase secrets set --env-file supabase/.env
supabase functions deploy auto-backup
```

Supabase Storage works on its own. The four Azure variables are optional, but they must either all be set or all be absent. Adapt and execute `supabase/auto-backup-cron.example.sql` to schedule the job. The invocation secret must match in the Edge Function secrets and Supabase Vault.

### Docker deployment on a VPS

Use the Docker commands in the French section, substituting the target Supabase URL and publishable key. Route the public HTTPS domain through a reverse proxy to `http://127.0.0.1:8080`. `/healthz` is the health endpoint.

`VITE_*` values are embedded at build time. Rebuild the image after changing the Supabase project.

### Data transfer

For a complete Supabase-to-Supabase transfer, follow the official backup and restore procedure: create `roles.sql`, `schema.sql` and `data.sql` separately using `supabase db dump`, then restore them with `psql` in a transaction. Storage objects, Edge Functions, secrets, Auth settings, Realtime and cron must be reviewed or recreated separately.

Always test a restore into an empty project, compare row counts for all seven application tables and verify sign-in before changing DNS.

## Official references

- [Supabase database migrations](https://supabase.com/docs/guides/local-development/database-migrations)
- [Supabase CLI database dump](https://supabase.com/docs/reference/cli/supabase-db-dump)
- [Supabase backup and restore](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore)
- [Supabase Auth users and invitations](https://supabase.com/docs/guides/auth/users)
- [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Supabase Edge Function deployment](https://supabase.com/docs/guides/functions/deploy)
- [Scheduling Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions)
