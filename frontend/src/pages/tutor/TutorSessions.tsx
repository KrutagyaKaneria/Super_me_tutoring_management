import { useEffect, useState } from 'react';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { Play, Square, Loader2, Calendar, ClipboardCheck, Timer } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

function LiveTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const start = new Date(startTime).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - start;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="flex items-center gap-1.5 text-rose-600 font-mono font-bold animate-pulse">
      <Timer className="w-3.5 h-3.5" />
      <span>{elapsed}</span>
    </div>
  );
}

export function TutorSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Manual Claim Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, studentsRes] = await Promise.all([
        api.get('/tutor/sessions'),
        api.get('/tutor/students')
      ]);
      setSessions(sessionsRes.data.sessions || []);
      setStudents((studentsRes.data.students || []).map((s: any) => ({
        id: s.user?._id,
        name: s.user?.name
      })));
    } catch (error) {
      toast.error('Failed to load session data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (id: string) => {
    try {
      await api.patch(`/tutor/start-session/${id}`);
      toast.success('Session started! Happy teaching.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to start session');
    }
  };

  const handleEndSession = async (id: string) => {
    try {
      await api.patch(`/tutor/end-session/${id}`);
      toast.success('Session ended! Claim submitted for approval.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to end session');
    }
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !date || !startTime || !endTime) {
      toast.error('Please fill in all fields for manual claim');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/tutor/submit-attendance', {
        studentId: selectedStudent,
        date,
        startTime,
        endTime,
      });
      toast.success('Attendance claim submitted successfully');
      setSelectedStudent('');
      setDate('');
      setStartTime('');
      setEndTime('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="My Tutoring Sessions" />

      <CardShell title="Active & Upcoming Sessions" icon={<Calendar className="w-5 h-5 text-indigo-500" />}>
        <DataTable headers={['Student', 'Subject', 'Scheduled', 'Progress', 'Status', 'Actions']}>
          {sessions.map((s) => (
            <tr key={s._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
              <td className="py-4 px-4 text-sm font-medium text-slate-900">{s.studentId?.name || 'N/A'}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{s.subject}</td>
              <td className="py-4 px-4 text-sm">
                <div className="flex flex-col">
                  <span>{new Date(s.scheduledDate).toLocaleDateString()}</span>
                  <span className="text-xs text-slate-400">{s.startTime} - {s.endTime}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                {s.status === 'ongoing' ? (
                  <LiveTimer startTime={s.actualStartTime} />
                ) : s.status === 'completed' || s.status === 'approved' ? (
                  <span className="text-xs font-medium text-emerald-600">Logged: {s.durationInHours}h</span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Not started</span>
                )}
              </td>
              <td className="py-4 px-4">
                <StatusBadge variant={getStatusVariant(s.status)}>
                  {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                </StatusBadge>
              </td>
              <td className="py-4 px-4">
                {s.status === 'scheduled' && (
                  <button
                    onClick={() => handleStartSession(s._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start
                  </button>
                )}
                {s.status === 'ongoing' && (
                  <button
                    onClick={() => handleEndSession(s._id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all cursor-pointer shadow-sm shadow-rose-200"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" /> End
                  </button>
                )}
                {['completed', 'approved', 'rejected'].includes(s.status) && (
                  <a href={s.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-medium">Re-join link</a>
                )}
              </td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-10 text-sm text-slate-500 italic">
                No sessions found. Contact your coordinator to schedule classes.
              </td>
            </tr>
          )}
        </DataTable>
      </CardShell>

      <CardShell title="Manual Attendance Claim" icon={<ClipboardCheck className="w-5 h-5 text-emerald-500" />}>
        <form onSubmit={handleSubmitAttendance} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer h-[38px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Submit Claim'}
          </button>
        </form>
      </CardShell>
    </div>
  );
}
