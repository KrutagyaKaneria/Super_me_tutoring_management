import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function StudentSchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await api.get('/student/schedule');
        setSchedule(res.data.schedule || []);
      } catch (error) {
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div>
      <PageHeader title="My Schedule" />
      <CardShell>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Date', 'Subject', 'Tutor', 'Time', 'Status']}>
            {schedule.map((s, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm font-medium">{new Date(s.scheduledDate).toLocaleDateString()}</td>
                <td className="py-3 px-3 text-sm">{s.subject}</td>
                <td className="py-3 px-3 text-sm">{s.tutorId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm">{new Date(s.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td className="py-3 px-3">
                  <StatusBadge variant="blue">{s.status}</StatusBadge>
                </td>
              </tr>
            ))}
            {schedule.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-slate-500">No sessions scheduled</td>
              </tr>
            )}
          </DataTable>
        )}
      </CardShell>
    </div>
  );
}
