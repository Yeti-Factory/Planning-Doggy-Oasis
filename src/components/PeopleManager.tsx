import { useState } from 'react';
import { usePlanningStore } from '@/hooks/usePlanningStore';
import { Category, CATEGORY_OPTIONS, CODE_MAP } from '@/types/planning';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function PeopleManager() {
  const { people, addPerson, updatePerson, removePerson } = usePlanningStore();
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<Category>('Salarié');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<Category>('Salarié');

  const handleAdd = () => {
    if (!newName.trim()) {
      toast.error('Veuillez entrer un nom');
      return;
    }
    addPerson(newName.trim(), newCategory);
    setNewName('');
    toast.success(`${newName} ajouté(e) avec succès`);
  };

  const handleEdit = (id: string) => {
    const person = people.find((p) => p.id === id);
    if (person) {
      setEditingId(id);
      setEditName(person.name);
      setEditCategory(person.category);
    }
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updatePerson(editingId, editName.trim(), editCategory);
    setEditingId(null);
    toast.success('Modification enregistrée');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleRemove = (id: string, name: string) => {
    removePerson(id);
    toast.success(`${name} supprimé(e)`);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
          <Users className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Gestion du personnel</h1>
      </div>

      {/* Add new person form */}
      <div className="mb-8 p-4 rounded-lg bg-card border border-border">
        <h2 className="text-lg font-semibold mb-4">Ajouter une personne</h2>
        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Nom"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-48"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Select value={newCategory} onValueChange={(v) => setNewCategory(v as Category)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* People list */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full border-collapse bg-card">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-4 py-3 text-left text-sm font-semibold">Nom</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Catégorie</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Code</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Affichage</th>
              <th className="px-4 py-3 text-center text-sm font-semibold w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.id} className="border-t border-border hover:bg-accent/50 transition-colors">
                <td className="px-4 py-3">
                  {editingId === person.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium">{person.name}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === person.id ? (
                    <Select value={editCategory} onValueChange={(v) => setEditCategory(v as Category)}>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-muted-foreground">{person.category}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {editingId === person.id ? CODE_MAP[editCategory] : person.code}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                  [{editingId === person.id ? CODE_MAP[editCategory] : person.code}]{' '}
                  {editingId === person.id ? editName : person.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    {editingId === person.id ? (
                      <>
                        <Button size="sm" variant="ghost" onClick={handleSaveEdit} className="h-8 w-8 p-0">
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-8 w-8 p-0">
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(person.id)} className="h-8 w-8 p-0">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(person.id, person.name)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
