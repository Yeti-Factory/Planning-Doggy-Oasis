

# Rectification case par case dans le planificateur de taches

## Probleme
Quand on ajoute plusieurs taches dans une cellule (concatenees avec " + "), le bouton X efface tout. Impossible de retirer une seule tache sans tout recommencer.

## Solution
Ajouter la possibilite de supprimer chaque tache individuellement dans la cellule :

### Modifications dans `src/components/TaskCell.tsx`

1. **Afficher les taches individuelles dans le popover** : Dans la section "Taches actuelles" en bas du popover, splitter la valeur par " + " et afficher chaque tache comme un badge/chip avec un petit bouton X pour la supprimer individuellement.

2. **Fonction de suppression individuelle** : Ajouter une fonction `handleRemoveTask(taskToRemove)` qui :
   - Split la valeur actuelle par " + "
   - Filtre la tache a supprimer
   - Rejoint les taches restantes avec " + "
   - Appelle `onChange` avec le resultat (ou chaine vide si plus aucune tache)

3. **Decocher dans la liste** : Quand on clique sur une tache deja selectionnee (marquee d'un check), la retirer de la valeur au lieu de la re-ajouter. Actuellement `handleSelect` ajoute toujours avec " + ".

### Detail technique
```text
// Split des taches existantes
const currentTasks = value ? value.split(' + ').map(t => t.trim()) : [];

// handleSelect modifie : toggle au lieu d'ajouter seulement
if (currentTasks.includes(task)) {
  const remaining = currentTasks.filter(t => t !== task);
  onChange(remaining.join(' + '));
} else {
  onChange([...currentTasks, task].join(' + '));
}

// handleRemoveTask : supprimer une tache specifique
const remaining = currentTasks.filter(t => t !== taskToRemove);
onChange(remaining.join(' + '));
```

### Fichier concerne
- **Modifie** : `src/components/TaskCell.tsx`

