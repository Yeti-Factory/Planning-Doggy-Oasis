

## Migration vers une base de donnees partagee (Supabase)

### Probleme

Actuellement, toutes les donnees de l'application sont stockees en `localStorage` dans le navigateur de chaque utilisateur. Cela signifie que les donnees saisies par "Admin metropole" ne sont visibles que sur son propre navigateur. Aucune synchronisation n'existe entre les differents postes.

4 stores concernes :
- `planning-storage` : affectations de personnel (planning mensuel)
- `annual-planning-storage` : calendrier annuel
- `weekly-tasks-storage` : taches hebdomadaires
- `custom-tasks-storage` : taches personnalisees

### Solution proposee

Migrer la persistance des donnees depuis `localStorage` vers **Supabase** (base de donnees PostgreSQL hebergee). Cela permettra a tous les utilisateurs de voir les memes donnees en temps reel.

### Etapes de la migration

#### 1. Activer Supabase (Lovable Cloud)

Creer un projet Supabase connecte a l'application via Lovable Cloud.

#### 2. Creer les tables dans Supabase

| Table | Description | Colonnes principales |
|-------|------------|---------------------|
| `planning_assignments` | Affectations du planning mensuel | `date`, `slot` (morning/afternoon/fullDay), `slot_index`, `person_id` |
| `people` | Liste des personnes | `id`, `name`, `category`, `code` |
| `annual_events` | Evenements du calendrier annuel | `date`, `event_text`, `position` |
| `weekly_tasks` | Taches hebdomadaires | `week_start`, `person_id`, `task_id`, `slot`, `value` |
| `custom_tasks` | Taches personnalisees | `id`, `name` |
| `settings` | Parametres (heures matin/apres-midi) | `key`, `value` |

#### 3. Modifier les stores Zustand

Remplacer le middleware `persist` (localStorage) par des appels a Supabase via `@tanstack/react-query` :
- Charger les donnees depuis Supabase au demarrage
- Sauvegarder chaque modification dans Supabase
- Garder un cache local pour la reactivite de l'interface

#### 4. Synchronisation temps reel (optionnel mais recommande)

Activer les Realtime subscriptions de Supabase pour que les modifications d'un utilisateur apparaissent immediatement sur les ecrans des autres.

### Impact sur les utilisateurs existants

- Les donnees actuellement dans le localStorage des differents navigateurs ne seront PAS migrees automatiquement
- Il faudra re-saisir les donnees ou exporter/importer manuellement
- Les donnees initiales du fichier Excel (calendrier annuel) seront reinjectees dans Supabase

### Estimation de la complexite

Ce chantier est **consequent** car il touche tous les stores de l'application. Il est recommande de proceder par etapes :

1. **Phase 1** : Migrer le calendrier annuel (`annual_events`) -- c'est le plus urgent vu le probleme signale
2. **Phase 2** : Migrer le planning mensuel (`planning_assignments` + `people`)
3. **Phase 3** : Migrer les taches hebdomadaires et personnalisees
4. **Phase 4** : Ajouter la synchronisation temps reel

### Question prealable

Avant de commencer, il faut activer Supabase sur le projet. Souhaitez-vous :
- **Lovable Cloud** (recommande, pas besoin de compte externe)
- **Supabase externe** (vous gerez votre propre projet Supabase)

