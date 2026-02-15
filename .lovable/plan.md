

## Correction des dates decalees dans le planificateur

### Probleme identifie

Les dates ne correspondent pas aux bons jours car le code utilise des conversions UTC au lieu de dates locales :

1. **`formatDateKey()`** dans `src/lib/dateUtils.ts` utilise `toISOString()` qui convertit en UTC -- un decalage d'une journee peut se produire selon le fuseau horaire.
2. **`getWeekDates()`** dans `src/lib/weekUtils.ts` cree des dates avec `new Date("YYYY-MM-DD")` qui est interprete en UTC, ce qui decale les jours affiches.

### Modifications prevues

#### 1. `src/lib/dateUtils.ts` -- corriger `formatDateKey`

Remplacer `date.toISOString().split('T')[0]` par une extraction manuelle des composants locaux :

```typescript
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
```

#### 2. `src/lib/weekUtils.ts` -- corriger `getWeekDates`

Parser la date en local au lieu d'UTC :

```typescript
export const getWeekDates = (weekStartDate: string): Date[] => {
  const [year, month, day] = weekStartDate.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};
```

Et appliquer la meme correction partout ou `new Date(dateString)` est utilise dans ce fichier (`getWeekNumber`, `formatWeekRange`, `getNextWeekStart`, `getPreviousWeekStart`).

### Impact

Ces deux corrections eliminent tout decalage de date lie au fuseau horaire. Aucune modification de structure de donnees necessaire -- les cles de stockage restent au format `YYYY-MM-DD`.

