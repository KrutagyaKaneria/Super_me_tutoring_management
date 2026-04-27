import { useEffect, useState } from 'react';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { ExternalLink, Loader2, CalendarPlus, X, Clock, User, BookOpen } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export function SessionManagement() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling Dialog State
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [scheduling, setScheduling] = useState(false);

  // Form State
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coordinator/sessions');
      setSessions(res.data.sessions || []);
    } catch (error) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const openScheduleDialog = async () => {
    setShowScheduleDialog(true);
    try {
      const [studentsRes, tutorsRes] = await Promise.all([
        api.get('/coordinator/students'),
        api.get('/coordinator/tutors')
      ]);
      setStudents(studentsRes.data.students || []);
      setTutors(tutorsRes.data.tutors || []);
    } catch (error) {
      toast.error('Failed to load students or tutors');
    }
  };

  const handleSchedule = async () => {
    if (!selectedStudent || !selectedTutor || !subject || !date || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setScheduling(true);
      await api.post('/coordinator/schedule-session', {
        studentId: selectedStudent,
        tutorId: selectedTutor,
        subject,
        scheduledDate: date,
        startTime,
        endTime
      });
      toast.success('Session scheduled successfully');
      setShowScheduleDialog(false);
      fetchSessions();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule session');
    } finally {
      setScheduling(false);
    }
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => ['completed', 'approved', 'rejected'].includes(s.status));

  return (
    <div className="space-y-6">
      <PageHeader title="Session Management">
        <button
          onClick={openScheduleDialog}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule Session
        </button>
      </PageHeader>

      <CardShell title="Upcoming Sessions">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Date & Time', 'Tutor', 'Student', 'Subject', 'Meeting Link', 'Status']}>
            {upcomingSessions.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm">
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-900">{new Date(s.scheduledDate).toLocaleDateString()}</span>
                    <span className="text-xs text-slate-500">{s.startTime} - {s.endTime}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-sm font-medium text-slate-700">{s.tutorId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-slate-600">{s.studentId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm">{s.subject}</td>
                <td className="py-3 px-3">
                  {s.meetingLink ? (
                    <a href={s.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                      <ExternalLink className="w-3 h-3" /> Join
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Not set</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge variant={getStatusVariant(s.status)}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
            {upcomingSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-slate-500">No upcoming sessions found</td>
              </tr>
            )}
          </DataTable>
        )}
      </CardShell>

      <CardShell title="Completed Sessions">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Date', 'Tutor', 'Student', 'Duration', 'Status']}>
            {completedSessions.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm">{new Date(s.scheduledDate).toLocaleDateString()}</td>
                <td className="py-3 px-3 text-sm font-medium text-slate-700">{s.tutorId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm text-slate-600">{s.studentId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm">{s.durationInHours ? `${s.durationInHours}h` : 'N/A'}</td>
                <td className="py-3 px-3">
                  <StatusBadge variant={s.status === 'approved' ? 'green' : s.status === 'rejected' ? 'destructive' : 'yellow'}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
            {completedSessions.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-sm text-slate-500">No completed sessions found</td>
              </tr>
            )}
          </DataTable>
        )}
      </CardShell>

      {/* Scheduling Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowScheduleDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 bg-slate-50 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-600" />
                Schedule New Session
              </h2>
              <button
                onClick={() => setShowScheduleDialog(false)}
                className="p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Student
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  >
                    <option value="">-- Select Student --</option>
                    {students.map(s => (
                      <option key={s._id} value={s.user?._id}>{s.user?.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Tutor
                  </label>
                  <select
                    value={selectedTutor}
                    onChange={(e) => setSelectedTutor(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  >
                    <option value="">-- Select Tutor --</option>
                    {tutors.map(t => (
                      <option key={t._id} value={t.user?._id}>{t.user?.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Mathematics - Algebra"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Date & Time
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSchedule}
                  disabled={scheduling}
                  className="flex-1 bg-indigo-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 cursor-pointer"
                >
                  {scheduling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus className="w-4 h-4" />}
                  Schedule Session
                </button>
                <button
                  onClick={() => setShowScheduleDialog(false)}
                  className="flex-1 bg-white text-slate-600 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
