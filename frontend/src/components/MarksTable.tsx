import { useState } from 'react';
import type { MarksEntry } from '@/lib/types';
import { DataTable } from './DataTable';
import { toast } from 'sonner';

interface MarksTableProps {
  entries: MarksEntry[];
  editable?: boolean;
}

export function MarksTable({ entries, editable = false }: MarksTableProps) {
  const [marks, setMarks] = useState<Record<string, number | null>>(
    Object.fromEntries(entries.map(e => [e.id, e.marks]))
  );

  const handleSave = (entry: MarksEntry) => {
    const value = marks[entry.id];
    if (value === null || value === undefined) {
      toast.error('Please enter marks before saving');
      return;
    }
    toast.success(`Marks saved for ${entry.student}`, {
      description: `${entry.subject}: ${value}/${entry.total}`,
    });
  };

  const headers = editable
    ? ['Student', 'Exam', 'Subject', 'Marks', 'Total', 'Action']
    : ['Exam', 'Subject', 'Date', 'Marks', 'Grade'];

  return (
    <DataTable headers={headers}>
      {entries.map(entry => (
        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
          {editable ? (
            <>
              <td className="py-3 px-3 text-sm">{entry.student}</td>
              <td className="py-3 px-3 text-sm">{entry.exam}</td>
              <td className="py-3 px-3 text-sm">{entry.subject}</td>
              <td className="py-3 px-3">
                <input
                  type="number"
                  value={marks[entry.id] ?? ''}
                  onChange={(e) => setMarks(prev => ({
                    ...prev,
                    [entry.id]: e.target.value ? Number(e.target.value) : null,
                  }))}
                  className="w-16 px-2 py-1 text-sm border border-slate-200 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  placeholder="–"
                />
              </td>
              <td className="py-3 px-3 text-sm text-muted-foreground">{entry.total}</td>
              <td className="py-3 px-3">
                <button
                  onClick={() => handleSave(entry)}
                  className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  Save
                </button>
              </td>
            </>
          ) : (
            <>
              <td className="py-3 px-3 text-sm">{entry.exam}</td>
              <td className="py-3 px-3 text-sm">{entry.subject}</td>
              <td className="py-3 px-3 text-sm text-muted-foreground">{entry.date}</td>
              <td className="py-3 px-3 text-sm">{entry.marks}/{entry.total}</td>
              <td className="py-3 px-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  entry.grade?.includes('+') || entry.grade === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  entry.grade === 'B+' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {entry.grade}
                </span>
              </td>
            </>
          )}
        </tr>
      ))}
    </DataTable>
  );
}
