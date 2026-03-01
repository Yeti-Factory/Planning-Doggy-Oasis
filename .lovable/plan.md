
# Vue "Tableau par personne" pour le Planning Mensuel

## Objectif
Ajouter une nouvelle vue matricielle dans le planning mensuel : les personnes en lignes, les jours du mois en colonnes. Le tableau affiche les affectations existantes avec le code couleur actuel et permet de marquer manuellement les jours de repos ("R"). Le tout est imprimable sur une seule page en orientation paysage.

---

## Ce qui sera fait

### 1. Nouvelle table en base de donnees pour les jours de repos
- Table `rest_days` avec colonnes : `id`, `person_id`, `date`, `created_at`
- Contrainte unique sur `(person_id, date)` pour eviter les doublons
- Publication en temps reel activee

### 2. Store Zustand pour les jours de repos
- Nouveau fichier `src/hooks/useRestDaysStore.ts`
- Fonctions : `fetchRestDays`, `toggleRestDay(personId, date)`, `subscribeRealtime`
- Synchronisation avec la base de donnees

### 3. Composant "PersonGridView"
- Nouveau fichier `src/components/PersonGridView.tsx`
- Tableau matriciel : une ligne par personne, une colonne par jour du mois
- En-tete : lettres des jours (D, L, M, M, J, V, S) + numeros (1-31)
- Cellules colorees selon le type d'affectation :
  - Jaune (#FFD966) = Matin uniquement
  - Vert (#92D050) = Apres-midi ou Journee complete
  - Jaune + Vert (moitie/moitie ou priorite vert) = Matin ET apres-midi
  - Rouge = Repos ("R" affiche au centre)
  - Gris = Week-end sans affectation
- Clic sur une cellule vide ou une cellule "R" = bascule repos (toggle)
- Les cellules avec affectations existantes affichent "R" si un repos est aussi marque

### 4. Integration dans MonthPlanning
- Ajout d'onglets (Tabs) en haut du planning mensuel : "Vue classique" | "Vue par personne"
- La vue par personne affiche le composant `PersonGridView`

### 5. Option d'impression
- Ajout dans le menu "Imprimer" d'une option "Tableau par personne"
- Impression optimisee sur une seule page A4 paysage
- Police reduite, cellules compactes
- Logo + titre inclus
- Meme code couleur que l'ecran

### 6. Abonnement temps reel
- Ajout du subscribe `rest_days` dans `Index.tsx` aux cotes des autres stores

---

## Details techniques

### Table SQL
```text
rest_days
  - id: uuid PK default gen_random_uuid()
  - person_id: text NOT NULL references people(id) ON DELETE CASCADE
  - date: text NOT NULL (format YYYY-MM-DD)
  - created_at: timestamptz default now()
  - UNIQUE(person_id, date)
```

### Logique de couleur des cellules
Pour chaque cellule (personne x jour) :
1. Verifier si la personne est affectee en matin, apres-midi ou journee ce jour-la
2. Verifier si un repos est marque pour cette personne ce jour-la
3. Appliquer la couleur en priorite : Repos (rouge) > Journee (vert) > Apres-midi (vert) > Matin (jaune) > Week-end (gris) > Vide (blanc)
4. Afficher "R" dans la cellule si repos marque

### Fichiers concernes
- **Nouveau** : `src/hooks/useRestDaysStore.ts`
- **Nouveau** : `src/components/PersonGridView.tsx`
- **Modifie** : `src/components/MonthPlanning.tsx` (ajout onglets + option impression)
- **Modifie** : `src/pages/Index.tsx` (fetch + subscribe rest_days)
- **Migration SQL** : creation table `rest_days`
