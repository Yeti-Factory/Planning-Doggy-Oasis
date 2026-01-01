import { usePlanningStore } from '@/hooks/usePlanningStore';
import { formatDateKey } from '@/lib/dateUtils';
import { PersonSelect } from './PersonSelect';
import { useState } from 'react';

interface WeekSummaryProps {
  weekNumber: number;
  days: Date[];
}

export function WeekSummary({ weekNumber, days }: WeekSummaryProps) {
  const { settings, assignments, people, getPersonById } = usePlanningStore();
  const [detailPeople, setDetailPeople] = useState<(string | undefined)[]>([
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ]);

  // Calculate total team hours
  const calculateTotalHours = () => {
    let total = 0;
    for (const day of days) {
      const key = formatDateKey(day);
      const assignment = assignments[key];
      if (assignment) {
        // Count each person assigned
        const morningCount = (assignment.morning || []).filter(Boolean).length;
        const afternoonCount = (assignment.afternoon || []).filter(Boolean).length;
        const fullDayCount = (assignment.fullDay || []).filter(Boolean).length;
        
        total += morningCount * settings.hoursForMorning;
        total += afternoonCount * settings.hoursForAfternoon;
        total += fullDayCount * settings.hoursForFullDay;
      }
    }
    return total;
  };

  // Calculate hours for a specific person
  const calculatePersonHours = (personId: string | undefined) => {
    if (!personId) return '';
    let total = 0;
    for (const day of days) {
      const key = formatDateKey(day);
      const assignment = assignments[key];
      if (assignment) {
        if ((assignment.morning || []).includes(personId)) total += settings.hoursForMorning;
        if ((assignment.afternoon || []).includes(personId)) total += settings.hoursForAfternoon;
        if ((assignment.fullDay || []).includes(personId)) total += settings.hoursForFullDay;
      }
    }
    return total > 0 ? `${total}h` : '0h';
  };

  return (
    <>
      {/* Total row */}
      <tr className="bg-totalrow border-t-2 border-primary">
        <td colSpan={5} className="px-3 py-2.5 font-semibold text-totalrow-text">
          TOTAL Semaine {weekNumber} (équipe)
        </td>
        <td className="px-3 py-2.5 text-center font-bold text-totalrow-text">
          {calculateTotalHours()}h
        </td>
      </tr>

      {/* Detail header */}
      <tr className="bg-muted">
        <td colSpan={6} className="px-3 py-2 font-semibold text-sm text-muted-foreground">
          Détail par personne – Semaine {weekNumber}
        </td>
      </tr>

      {/* Detail person rows */}
      {detailPeople.map((personId, idx) => (
        <tr key={`detail-${weekNumber}-${idx}`} className="bg-card hover:bg-accent/30">
          <td colSpan={3} className="px-2 py-1.5 border-r border-border">
            <PersonSelect
              value={personId}
              onChange={(v) => {
                const newDetail = [...detailPeople];
                newDetail[idx] = v;
                setDetailPeople(newDetail);
              }}
              slotType="morning"
              className="bg-card"
            />
          </td>
          <td colSpan={3} className="px-3 py-1.5 text-center font-medium">
            {calculatePersonHours(personId)}
          </td>
        </tr>
      ))}

      {/* Spacer */}
      <tr className="h-4 bg-background">
        <td colSpan={6}></td>
      </tr>
    </>
  );
}
