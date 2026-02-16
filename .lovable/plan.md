

## Outil de migration localStorage vers base partagee

### Probleme

L'admin en Guyane a saisi des donnees **avant** la migration vers la base partagee. Ces donnees sont encore dans le localStorage de son navigateur et ne sont pas visibles par les autres utilisateurs. Lui demander de tout re-saisir serait une perte de temps.

### Solution

Creer un composant "Migration" accessible depuis la sidebar, qui :
1. Scanne le localStorage du navigateur de l'admin pour trouver les anciennes donnees (people, assignments, events, tasks, settings)
2. Affiche un resume de ce qui a ete trouve (ex: "12 personnes, 45 affectations, 8 evenements")
3. Permet de tout transferer en un clic vers la base partagee
4. Marque la migration comme effectuee pour ne plus afficher le bouton

### Details techniques

**Nouveau fichier : `src/components/LocalStorageMigration.tsx`**
- Scan de toutes les cles localStorage a la recherche de donnees zustand persistees (cles typiques : `planning-storage`, `annual-planning-storage`, `custom-tasks-storage`, `weekly-tasks-storage`, ou toute cle contenant du JSON avec les structures connues)
- Fallback : scanner TOUTES les cles localStorage et tenter de parser le JSON pour identifier les structures de donnees planning (people[], assignments{}, events{}, etc.)
- Bouton "Migrer les donnees" qui :
  - Insere les personnes dans la table `people` (avec gestion des doublons via upsert)
  - Insere les affectations dans `planning_assignments`
  - Insere les evenements dans `annual_events`
  - Insere les taches dans `weekly_tasks` et `custom_tasks`
  - Insere les parametres dans `settings`
- Affiche un resume du resultat (succes/erreurs)
- Stocke un flag `migration-done` dans localStorage pour masquer le composant apres migration

**Fichier modifie : `src/components/AppSidebar.tsx`**
- Ajouter un bouton "Importer donnees locales" dans la sidebar (visible uniquement si le localStorage contient des donnees non migrees)

**Fichier modifie : `src/pages/Index.tsx`**
- Ajouter la vue `migration` dans le type View et le rendu correspondant

### Gestion des doublons

- Pour les personnes : upsert par nom (si "Anne" existe deja en base, on ne la re-cree pas)
- Pour les affectations : upsert par date/slot/slot_index (ecrase si conflit)
- Pour les evenements : insert simple (risque de doublon acceptable, l'admin peut nettoyer apres)
- Pour les taches/settings : upsert par cle

### Workflow utilisateur

1. L'admin ouvre l'application sur son navigateur (celui qui contient les anciennes donnees)
2. Il voit un bouton "Importer donnees locales" dans la sidebar
3. Il clique dessus, voit un resume des donnees trouvees
4. Il clique "Migrer", les donnees sont envoyees dans la base
5. Le bouton disparait, les donnees sont visibles par tout le monde

