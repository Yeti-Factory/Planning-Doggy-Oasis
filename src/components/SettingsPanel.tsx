import { usePlanningStore } from '@/hooks/usePlanningStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsPanel() {
  const { settings, updateSettings } = usePlanningStore();

  const handleChange = (key: keyof typeof settings, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0 && num <= 24) {
      updateSettings({ [key]: num });
      toast.success('Paramètre mis à jour');
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg bg-primary text-primary-foreground">
          <Settings className="w-5 h-5" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
      </div>

      <div className="max-w-md p-6 rounded-lg bg-card border border-border">
        <h2 className="text-lg font-semibold mb-6">Heures par créneau</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="morning" className="text-sm font-medium">
              Heures Matin
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="morning"
                type="number"
                min={0}
                max={24}
                value={settings.hoursForMorning}
                onChange={(e) => handleChange('hoursForMorning', e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="afternoon" className="text-sm font-medium">
              Heures Après-midi
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="afternoon"
                type="number"
                min={0}
                max={24}
                value={settings.hoursForAfternoon}
                onChange={(e) => handleChange('hoursForAfternoon', e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="fullday" className="text-sm font-medium">
              Heures Journée
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="fullday"
                type="number"
                min={0}
                max={24}
                value={settings.hoursForFullDay}
                onChange={(e) => handleChange('hoursForFullDay', e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">h</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
