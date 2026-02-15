

## Correction du decalage de dates dans le planificateur de taches

### Probleme identifie

Dans `src/components/WeeklyTaskPlanner.tsx`, ligne 67 :

```typescript
const start = new Date(weekStartDate); // BUG: parse en UTC
```

Cette ligne cree les dates du tableau (detail) en UTC, alors que le bandeau de navigation utilise `formatWeekRange()` qui a deja ete corrige pour utiliser un parsing local. En Guyane (UTC-3), `new Date("2026-02-09")` donne le 8 fevrier a 21h locale, d'ou le decalage d'un jour dans le detail.

Les fleches ne "fonctionnent pas" car `getPreviousWeekStart` et `getNextWeekStart` sont deja corriges (parsing local), mais le resultat est ensuite re-parse en UTC a la ligne 67, ce qui annule la correction.

### Correction

**Fichier : `src/components/WeeklyTaskPlanner.tsx`**

1. Importer `getWeekDates` depuis `@/lib/weekUtils` (qui utilise deja le parsing local corrige)
2. Remplacer le calcul manuel de `weekDates` (lignes 66-69) par un appel a `getWeekDates(weekStartDate)`

Avant :
```typescript
const weekDates = useMemo(() => {
  const start = new Date(weekStartDate);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}, [weekStartDate]);
```

Apres :
```typescript
const weekDates = useMemo(() => {
  return getWeekDates(weekStartDate);
}, [weekStartDate]);
```

Cette fonction `getWeekDates` existe deja dans `weekUtils.ts` et utilise le parsing local (`parseLocalDate`) qui a ete corrige precedemment.

### Impact

- Correction du decalage entre le bandeau de semaine et les dates du tableau
- Correction du fonctionnement des fleches precedent/suivant en fuseau negatif (Guyane UTC-3)
- Aucune modification de structure, une seule ligne changee

