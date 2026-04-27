import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { PageHeader } from '@/components/PageHeader';
import { useSessionManager } from '@/hooks/useSession';
import { ExternalLink, Play, Square } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function TutorDashboard() {
  const { startSession, endSession, getSessionState } = useSessionManager();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        const response = await api.get('/tutor/dashboard');
        const b = response.data;
        setData(b);
      } catch (error) {
        toast.error('Failed to load tutor data');
      } finally {
        setLoading(false);
      }
    };
    fetchTutorData();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500">Loading your dashboard...</div>;

  const todayClasses = data.todaySessions || [];
  
  const stats = [
    { label: 'Total Students', value: data.totalStudents || 0 },
    { label: 'Sessions This Month', value: data.monthlySessions || 0 },
    { label: 'Pending Approvals', value: data.pendingApprovals || 0, highlight: (data.pendingApprovals || 0) > 0 },
    { label: 'Earnings (Total)', value: `₹${data.monthlyEarnings || 0}` },
  ];

  return (
    <div>
      <PageHeader title="My Dashboard" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell title="Today's Classes">
        <DataTable headers={['Time', 'Student', 'Subject', 'Grade', 'Link', 'Action']}>
          {todayClasses.map((cls) => {
            const state = getSessionState(cls._id);
            const displayTime = new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return (
              <tr key={cls._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm">{displayTime}</td>
                <td className="py-3 px-3 text-sm font-medium">{cls.studentId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm">{cls.subject}</td>
                <td className="py-3 px-3 text-sm">{cls.gradeBand}</td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-xs text-indigo-600 truncate max-w-[120px]">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" /> {cls.meetLink}
                  </span>
                </td>
                <td className="py-3 px-3">
                  {state === 'idle' && (
                    <button
                      onClick={() => startSession(cls._id, cls.studentId?.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <Play className="w-3 h-3" /> Start Session
                    </button>
                  )}
                  {state === 'in-progress' && (
                    <button
                      onClick={() => endSession(cls._id, cls.studentId?.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors animate-pulse cursor-pointer"
                    >
                      <Square className="w-3 h-3" /> End Session
                    </button>
                  )}
                  {state === 'ended' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Submitted
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
          {todayClasses.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-sm text-slate-500">No scheduled classes today</td>
            </tr>
          )}
        </DataTable>
      </CardShell>
    </div>
  );
}
