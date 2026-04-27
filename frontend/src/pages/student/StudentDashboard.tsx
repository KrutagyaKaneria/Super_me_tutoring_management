import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { NotificationBanner } from '@/components/NotificationBanner';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function StudentDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));

        const response = await api.get('/student/dashboard');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load student dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500">Loading student dashboard...</div>;

  const upcomingSessions = data.upcomingSessions || [];
  const nextSession = data.nextSession;
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const stats = [
    { label: 'Classes Completed', value: data.sessionsCompleted || 0 },
    { label: 'Hours Completed', value: (data.hoursCompleted || 0).toFixed(1) },
    { label: 'Upcoming Target', value: data.upcomingClassesCount || 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={`Hi, ${firstName} 👋`} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {nextSession && (
        <NotificationBanner variant="info">
          📚 Reminder: {nextSession.subject} class with {nextSession.tutorId?.name} at {nextSession.startTime} ·{' '}
          <a href={nextSession.meetingLink} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold cursor-pointer hover:text-indigo-700">Join Meeting</a>
        </NotificationBanner>
      )}

      <CardShell title="Upcoming Schedule">
        <DataTable headers={['Date', 'Subject', 'Tutor', 'Time', 'Link']}>
          {upcomingSessions.map((s: any) => {
            return (
              <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-slate-900">{new Date(s.scheduledDate).toLocaleDateString()}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{s.subject}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{s.tutorId?.name || 'N/A'}</td>
                <td className="py-4 px-4 text-sm font-medium text-indigo-600">{s.startTime} - {s.endTime}</td>
                <td className="py-4 px-4">
                  <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline cursor-pointer">Join Room</a>
                </td>
              </tr>
            );
          })}
          {upcomingSessions.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-10 text-sm text-slate-500 italic">No upcoming classes scheduled. Enjoy your free time!</td>
            </tr>
          )}
        </DataTable>
      </CardShell>
      <CardShell title="Recent Marks">
        <DataTable headers={['Date', 'Exam Name', 'Subject', 'Score']}>
          {(data.recentMarks || []).map((m: any) => (
            <tr key={m._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-4 px-4 text-sm font-medium text-slate-900">{new Date(m.date).toLocaleDateString()}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{m.examName}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{m.subject}</td>
              <td className="py-4 px-4 text-sm font-bold text-emerald-600">{m.marks}/{m.totalMarks}</td>
            </tr>
          ))}
          {(data.recentMarks || []).length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-10 text-sm text-slate-500 italic">No marks uploaded yet. Keep studying!</td>
            </tr>
          )}
        </DataTable>
      </CardShell>
    </div>
  );
}
