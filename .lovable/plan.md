

## Ajout des couleurs dans le calendrier annuel

### Objectif

Appliquer le meme schema de couleurs que le fichier Excel au calendrier annuel, pour une meilleure lisibilite visuelle.

### Couleurs a appliquer

| Element | Couleur | Variable CSS existante |
|---------|---------|----------------------|
| En-tete du mois (titre) | Bleu fonce #1F4E79 + texte blanc | `bg-primary text-primary-foreground` (deja en place) |
| En-tete jours (L M M J V) | Bleu clair #D9E1F2 | `bg-weekband` / `week-band` |
| En-tete samedi/dimanche | Gris #F2F2F2 | `bg-weekend` |
| Cases weekend (samedi/dimanche) | Gris clair #F2F2F2 | `bg-weekend` |
| Cases avec evenements | Fond jaune pastel #FFD966 (leger) | `bg-shift-morning/20` |
| Cases vides (jours ouvrables) | Blanc | fond par defaut |

### Fichier a modifier

**`src/components/AnnualCalendar.tsx`** :

1. **En-tete des jours de la semaine** : Remplacer `bg-muted/30` par `bg-weekband` pour les jours L-V, et `bg-weekend` pour S-D
2. **Cases weekend** : Remplacer `bg-muted/40` par `bg-weekend` pour les samedis et dimanches
3. **Cases avec evenements** : Ajouter un fond jaune leger (`bg-shift-morning/20`) quand la case contient des evenements, pour les mettre en evidence visuellement
4. **Pastilles d'evenements** : Ajouter un petit fond colore (`bg-shift-morning`) aux lignes de texte des evenements pour les rendre plus visibles
5. **Cases vides (hors mois)** : Garder un fond gris tres leger pour les differencier

### Resume

Une seule modification dans `AnnualCalendar.tsx` pour remplacer les couleurs generiques (`bg-muted`) par les couleurs metier deja definies dans le CSS (`bg-weekband`, `bg-weekend`, `bg-shift-morning`).

