import { BookOpen, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export function UserGuide() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
          <BookOpen className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Mode d'emploi</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Section 1 */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              1
            </span>
            <h2 className="text-lg font-semibold">Ajouter / modifier les personnes</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground ml-9">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Va dans l'onglet <strong className="text-foreground">"Personnel"</strong> dans le menu</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Remplis : Nom / Catégorie (Salarié, Bénévole, Woofer, Prestataire)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Le code se calcule automatiquement selon la catégorie</span>
            </li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              2
            </span>
            <h2 className="text-lg font-semibold">Remplir un mois</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground ml-9">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Sélectionne un mois dans le menu de gauche</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Pour chaque jour : choisis un nom dans Matin / Après-midi / Journée (menu déroulant)</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Les couleurs se mettent toutes seules : <strong className="text-yellow-600">Matin = jaune</strong>, <strong className="text-green-600">Après-midi/Journée = vert</strong></span>
            </li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              3
            </span>
            <h2 className="text-lg font-semibold">Règle anti-erreur</h2>
          </div>
          <div className="ml-9 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <span className="text-amber-800 dark:text-amber-200">
                Une personne ne peut <strong>PAS</strong> être mise 2 fois le même jour (ex : Matin + Journée). L'app le bloque automatiquement.
              </span>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              4
            </span>
            <h2 className="text-lg font-semibold">Semaines</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground ml-9">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Chaque semaine a un bandeau <strong className="text-foreground">"Semaine XX"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>En bas du bloc : <strong className="text-foreground">"TOTAL Semaine XX (équipe)"</strong> avec le calcul automatique</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Juste dessous : <strong className="text-foreground">"Détail par personne"</strong> (sélectionne des noms, les heures se calculent)</span>
            </li>
          </ul>
        </div>

        {/* Section 5 */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              5
            </span>
            <h2 className="text-lg font-semibold">Week-end</h2>
          </div>
          <div className="ml-9 p-3 rounded-lg bg-muted">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Samedi & dimanche sont grisés (autorisés, mais "à éviter").
              </span>
            </div>
          </div>
        </div>

        {/* Section 6 - Paramètres */}
        <div className="p-5 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              6
            </span>
            <h2 className="text-lg font-semibold">Paramètres des heures</h2>
          </div>
          <ul className="space-y-2 text-muted-foreground ml-9">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Va dans l'onglet <strong className="text-foreground">"Paramètres"</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>Modifie les heures par défaut pour Matin (6h), Après-midi (6h), Journée (9h)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
