

## Corrections post-migration

### 1. Mettre a jour le message de statut

Le message "Donnees sauvegardees localement" en bas de la sidebar est trompeur. Il doit indiquer que les donnees sont partagees en temps reel.

**Fichier** : `src/components/AppSidebar.tsx`
- Remplacer le texte "Donnees sauvegardees localement" par "Donnees partagees en temps reel"

### 2. Ajouter un indicateur de chargement

Quand les donnees se chargent depuis la base, l'interface affiche brievement des selections vides, ce qui donne l'impression que rien n'a ete saisi. Un indicateur de chargement resoudra ce probleme.

**Fichier** : `src/components/MonthPlanning.tsx`
- Lire l'etat `loading` du store `usePlanningStore`
- Afficher un spinner ou skeleton pendant le chargement initial

### 3. Forcer le re-fetch a chaque visite (pas seulement au premier chargement)

Le guard `if (get().loaded) return;` dans `fetchAll` empeche le re-chargement des donnees apres la premiere connexion. Cela peut causer des problemes si un autre utilisateur a modifie les donnees entre-temps et que la subscription realtime a rate un evenement.

**Fichier** : `src/hooks/usePlanningStore.ts`
- Retirer ou assouplir le guard `loaded` pour permettre un rafraichissement periodique ou a chaque navigation de mois

### Resume des fichiers a modifier

| Fichier | Modification |
|---------|-------------|
| `src/components/AppSidebar.tsx` | Mettre a jour le message de statut |
| `src/components/MonthPlanning.tsx` | Ajouter un indicateur de chargement |
| `src/hooks/usePlanningStore.ts` | Assouplir le guard de chargement |

