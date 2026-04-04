

# Correction de la suppression individuelle de taches

## Diagnostic

Le code actuel dans `TaskCell.tsx` contient bien la logique de toggle et de suppression individuelle. Le probleme probable vient du **format du separateur** dans les donnees stockees. Le `split(' + ')` (avec espaces obligatoires autour du `+`) peut echouer si certaines valeurs en base sont stockees avec un format different (par exemple `tache1+tache2` sans espaces, ou avec des espaces inconsistants). Dans ce cas, la cellule entiere est traitee comme une seule tache, rendant la suppression individuelle impossible.

## Solution

### Modifier `src/components/TaskCell.tsx`

1. **Rendre le split plus robuste** : remplacer `value.split(' + ')` par `value.split(/\s*\+\s*/)` partout dans le composant. Cela gere toutes les variations de separateur (`+`, ` +`, `+ `, ` + `).

2. **Agrandir les boutons X des badges** : augmenter la zone cliquable des boutons de suppression sur les badges pour les utilisateurs mobiles/tablette (padding plus grand, taille d'icone plus grande).

3. **Ajouter un re-normalisation a la sauvegarde** : s'assurer que `onChange` produit toujours un format consistant `tache1 + tache2` avec le join existant.

### Fichier concerne
- `src/components/TaskCell.tsx` : 3 occurrences de `split(' + ')` a remplacer par `split(/\s*\+\s*/)` (ligne 46, et potentiellement dans les handlers). Agrandir les zones cliquables des badges (lignes 204-213).

