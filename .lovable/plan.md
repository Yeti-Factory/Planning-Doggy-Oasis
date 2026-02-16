

## Pre-remplir le calendrier annuel avec les donnees du fichier Excel

### Description

Injecter les evenements extraits du fichier Excel "planning annuel 2026" comme donnees initiales dans le store du calendrier annuel. Les donnees seront chargees automatiquement au premier lancement (si le localStorage est vide).

### Approche technique

**Fichier : `src/hooks/useAnnualPlanningStore.ts`**

Modifier le store pour inclure les donnees initiales extraites du fichier Excel. La propriete `events` du store sera initialisee avec un objet contenant tous les evenements par date (format `YYYY-MM-DD`).

Le middleware `persist` de Zustand conservera les modifications de l'utilisateur : les donnees initiales ne seront chargees qu'a la premiere utilisation (avant toute sauvegarde en localStorage).

### Donnees extraites (resume par mois)

- **Janvier** : 22 jours avec evenements (ehpad, apadag, fourriere, visites, EPICERIE, transferts, mediation ecole, scouts, lycee...)
- **Fevrier** : 20 jours (AGAV, maison Nobel/Anse, adapei, tikaz, visites, transferts...)
- **Mars** : 17 jours (touchatout, stagiaire oceane et kenny, veto benoit...)
- **Avril** : 12 jours (marche aux plantes, apadag, transfert spa...)
- **Mai** : 11 jours (nombreuses visites 6 mois, pantera, transfert spa...)
- **Juin** : 7 jours (soya, apadag, awara...)
- **Juillet** : 10 jours (nola, tulear, youbi, mojo...)
- **Aout** : 12 jours (cookie, pasto, happy, malo, gao, pita...)
- **Septembre** : 9 jours (limbe, catane, goya...)
- **Octobre** : 10 jours (victoria, split, dagu beijing...)
- **Novembre** : 13 jours (monroe, lexie, labra, macou, zagreb, medan...)
- **Decembre** : 6 jours (ehpad, ime, transfert spa...)

### Fichier modifie

| Fichier | Modification |
|---------|-------------|
| `src/hooks/useAnnualPlanningStore.ts` | Ajouter les ~150 entrees d'evenements comme etat initial par defaut du store |

### Point d'attention

- Les donnees initiales sont ecrasees des que l'utilisateur modifie quoi que ce soit (le localStorage prend le relais)
- Les fautes d'orthographe du fichier Excel original sont conservees telles quelles (ex: "visiste", "ehpas", "stransfert")

