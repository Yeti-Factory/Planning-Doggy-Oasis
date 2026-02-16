
## Ajout de couleurs aux evenements du calendrier annuel

### Ce qui change pour l'utilisateur

Chaque evenement dans une case du calendrier pourra avoir sa propre couleur de fond. Dans la boite de dialogue d'edition des evenements, un selecteur de couleur (pastilles cliquables) apparaitra a cote de chaque evenement. La couleur choisie sera visible dans la grille du calendrier.

### Palette de couleurs proposee

8 couleurs predefinies sous forme de pastilles :
- Jaune (par defaut, comme actuellement)
- Vert
- Bleu
- Rose/Rouge
- Orange
- Violet
- Gris
- Blanc/transparent (pas de couleur)

### Details techniques

**1. Migration base de donnees** : Ajouter une colonne `color` (texte, nullable, defaut `null`) a la table `annual_events`.

**2. Modifier `src/hooks/useAnnualPlanningStore.ts`** :
- Changer le type de `events` de `Record<string, string[]>` a `Record<string, { text: string; color: string | null }[]>` pour stocker texte + couleur.
- Adapter `fetchEvents`, `addEvent`, `updateEvent`, `removeEvent`, `setEvents` pour gerer la couleur.

**3. Modifier `src/components/DayEventsDialog.tsx`** :
- Ajouter un etat local pour les couleurs de chaque evenement.
- Afficher des pastilles de couleur cliquables a cote de chaque champ texte.
- Transmettre la couleur au store lors de l'enregistrement.

**4. Modifier `src/components/AnnualMonthView.tsx`** :
- Utiliser la couleur de chaque evenement pour le fond de la pastille dans la grille, au lieu du jaune fixe actuel.

**5. Modifier `src/components/AnnualCalendar.tsx`** (vue 12 mois si utilisee) :
- Adapter l'affichage des indicateurs de couleur.
