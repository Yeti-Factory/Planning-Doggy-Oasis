

## Diagnostic et correction finale des dates

### Contexte

Le code du planificateur hebdomadaire (`WeeklyTaskPlanner.tsx`) a deja ete corrige pour utiliser `getWeekDates()` avec parsing local. La preview Lovable affiche correctement "Semaine n 7 -- du 09/02/2026 au 15/02/2026". Pourtant, la production en Guyane (UTC-3) montre encore un decalage.

Deux pistes :
1. Un dernier bug UTC restant dans la fonction d'impression du planning mensuel
2. Le deploiement Coolify n'a peut-etre pas pris en compte le dernier commit (cache navigateur ou build non declenche)

### Corrections prevues

#### 1. Corriger le dernier `toISOString()` dans `MonthPlanning.tsx`

**Fichier : `src/components/MonthPlanning.tsx`** -- ligne 156

Avant :
```typescript
const key = day.toISOString().split('T')[0];
```

Apres :
```typescript
const key = formatDateKey(day);
```

La fonction `formatDateKey` (deja importee en haut du fichier) utilise les composants locaux de la date.

#### 2. Ajouter un indicateur de version pour diagnostiquer le deploiement

**Fichier : `src/components/WeeklyTaskPlanner.tsx`**

Ajouter un petit texte de version dans le pied de page du planificateur (visible uniquement en bas de page, discret) :

```typescript
<p className="text-xs text-muted-foreground mt-2 text-right no-print">
  v2026-02-15-fix3
</p>
```

Cela permettra de verifier visuellement en production si le bon code est deploye. Ce marqueur sera supprime une fois le probleme resolu.

### Verification demandee

Apres deploiement, merci de verifier en Guyane :
- Que le texte "v2026-02-15-fix3" s'affiche en bas du planificateur de taches
- Si ce texte ne s'affiche PAS, c'est que le deploiement Coolify n'a pas pris en compte les derniers changements -- il faudra verifier le pipeline de deploiement (commit pousse sur GitHub, build Coolify relance)
- Si le texte s'affiche mais que les dates sont toujours decalees, faites une capture ecran et nous investiguerons plus

### Details techniques

| Fichier | Ligne | Modification |
|---------|-------|-------------|
| `src/components/MonthPlanning.tsx` | 156 | Remplacer `day.toISOString().split('T')[0]` par `formatDateKey(day)` |
| `src/components/WeeklyTaskPlanner.tsx` | fin du composant | Ajouter un marqueur de version temporaire |

