

## Ajout d'un calendrier de planification annuel

### Description

Ajouter un nouveau module "Calendrier annuel" qui reproduit le format du fichier Excel fourni : une vue calendrier classique (grille lundi-dimanche) avec possibilite d'ecrire des evenements textuels dans chaque jour. Ce module est independant du planning mensuel existant (qui gere les affectations de personnel).

### Structure du calendrier Excel analyse

Chaque mois est presente sous forme de grille :
- **Colonnes** : Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche
- **Lignes** : les semaines du mois
- **Contenu des cases** : texte libre (ex: "ehpad edmar lama", "visite 6 mois liwa", "EPICERIE", "transfert spa", etc.)
- Plusieurs lignes de texte possibles par jour

### Ce qui sera cree

#### 1. Nouveau store : `src/hooks/useAnnualPlanningStore.ts`

- Stockage persiste en localStorage des evenements textuels par date
- Structure : `Record<string, string[]>` (cle = date YYYY-MM-DD, valeur = liste d'evenements)
- Actions : ajouter, modifier, supprimer un evenement sur un jour

#### 2. Nouveau composant : `src/components/AnnualCalendar.tsx`

- Vue annuelle avec les 12 mois affiches sous forme de grilles calendrier
- Chaque mois : grille 7 colonnes (L, M, M, J, V, S, D) x 4-6 lignes
- Chaque case de jour affiche les evenements en texte
- Clic sur un jour pour ajouter/modifier des evenements (dialog)
- Navigation par annee (2026, 2027, 2028)
- Les week-ends sont visuellement distincts
- Bouton d'impression du calendrier annuel complet

#### 3. Dialog d'edition : `src/components/DayEventsDialog.tsx`

- Formulaire pour ajouter/modifier/supprimer les evenements d'un jour
- Champ texte libre, possibilite d'ajouter plusieurs lignes par jour
- Bouton supprimer par evenement

#### 4. Integration dans la navigation

**Fichier : `src/components/AppSidebar.tsx`**
- Ajout d'une nouvelle entree "Calendrier annuel" dans la sidebar, avec une sous-navigation par annee (2026, 2027, 2028)
- Icone : `CalendarDays` de Lucide

**Fichier : `src/pages/Index.tsx`**
- Nouveau type de vue `{ type: 'annual'; year: number }`
- Rendu du composant `AnnualCalendar` quand cette vue est active

### Maquette de la grille mensuelle dans le calendrier annuel

```text
+------------------------------------------------------------------+
|                      Janvier 2026                                |
+----------+----------+----------+----------+----------+-----+-----+
|  Lundi   |  Mardi   | Mercredi |  Jeudi   | Vendredi | Sam | Dim |
+----------+----------+----------+----------+----------+-----+-----+
|          |          |          |    1     |    2     |  3  |  4  |
|          |          |          |          | ehpad    |     |     |
+----------+----------+----------+----------+----------+-----+-----+
|    5     |    6     |    7     |    8     |    9     | 10  | 11  |
| fourr.   | visite   | apadag   | EPICERIE | apadag   |     |     |
+----------+----------+----------+----------+----------+-----+-----+
|   ...    |   ...    |   ...    |   ...    |   ...    | ... | ... |
+----------+----------+----------+----------+----------+-----+-----+
```

### Details techniques

| Fichier | Action |
|---------|--------|
| `src/hooks/useAnnualPlanningStore.ts` | Creer -- store Zustand persiste pour les evenements |
| `src/components/AnnualCalendar.tsx` | Creer -- vue calendrier annuel (12 grilles mensuelles) |
| `src/components/DayEventsDialog.tsx` | Creer -- dialog d'edition des evenements d'un jour |
| `src/components/AppSidebar.tsx` | Modifier -- ajouter l'entree "Calendrier annuel" |
| `src/pages/Index.tsx` | Modifier -- ajouter le type de vue et le rendu |
| `src/lib/dateUtils.ts` | Reutiliser les fonctions existantes (getDaysInMonth, formatDateKey, etc.) |

### Points d'attention

- Utilisation de `parseLocalDate` / `formatDateKey` pour eviter tout probleme de fuseau horaire (Guyane UTC-3)
- Persistance localStorage separee du planning mensuel existant
- Le calendrier annuel est un module independant : il ne remplace pas le planning mensuel, il s'y ajoute
- Impression optimisee avec mise en page paysage

