

## Simplification du calendrier annuel

### Modification

Retirer le lien "Vue annuelle" dans la sidebar pour la section "Calendrier annuel". La navigation sera identique au planning mensuel : chaque annee se deplie directement en liste de 12 mois, sans option "Vue annuelle".

### Fichier a modifier

**`src/components/AppSidebar.tsx`** (lignes 240-249) :
- Supprimer le bouton "Vue annuelle" dans le sous-menu de chaque annee du calendrier annuel
- Les mois restent affiches directement sous l'annee, exactement comme pour le planning mensuel

### Optionnel : nettoyage du type View

Le type de vue `{ type: 'annual'; year: number }` ne sera plus utilise. On peut le garder sans impact, ou le retirer de `Index.tsx` et `AppSidebar.tsx` pour garder le code propre.

### Impact

- Aucun changement de donnees
- Le composant `AnnualCalendar.tsx` (vue 12 mois) restera dans le code mais ne sera plus accessible depuis la sidebar
- La vue par mois individuel (`AnnualMonthView`) reste la seule navigation du calendrier annuel

