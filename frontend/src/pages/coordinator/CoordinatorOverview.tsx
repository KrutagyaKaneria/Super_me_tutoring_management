import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { Plus, X, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export function CoordinatorOverview() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [tutorsCount, setTutorsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [loading, setLoading] = useState(true);

  // Assignment Dialog State
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allTutors, setAllTutors] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTutor, setSelectedTutor] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinator/dashboard');
      setAssignments(response.data.assignments || []);
      setTutorsCount(response.data.totalTutors || 0);
      setStudentsCount(response.data.totalStudents || 0);
      setPendingClaims(response.data.pendingAttendances || 0);
    } catch (error) {
      toast.error('Failed to load coordinator data');
    } finally {
      setLoading(false);
    }
  };

  const openAssignDialog = async () => {
    setShowAssignDialog(true);
    try {
      const [studentsRes, tutorsRes] = await Promise.all([
        api.get('/coordinator/students'),
        api.get('/coordinator/tutors')
      ]);
      setAllStudents(studentsRes.data.students || []);
      setAllTutors(tutorsRes.data.tutors || []);
    } catch (error) {
      toast.error('Failed to load students or tutors');
    }
  };

  const handleAssign = async () => {
    if (!selectedStudent || !selectedTutor) {
      toast.error('Please select both a student and a tutor');
      return;
    }

    try {
      setAssigning(true);
      await api.post('/coordinator/assign-student', {
        studentId: selectedStudent,
        tutorId: selectedTutor
      });
      toast.success('Tutor assigned successfully');
      setShowAssignDialog(false);
      setSelectedStudent('');
      setSelectedTutor('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign tutor');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  const stats = [
    { label: 'Active Tutors', value: tutorsCount },
    { label: 'Total Students', value: studentsCount },
    { label: 'Assignments', value: assignments.filter(a => a.assignedTutor).length },
    { label: 'Pending Claims', value: pendingClaims, highlight: pendingClaims > 0 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Coordinator Dashboard" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell
        title="Student–Tutor Assignments"
        action={
          <button
            onClick={openAssignDialog}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Assign Tutor
          </button>
        }
      >
        <DataTable headers={['Student Name', 'Grade', 'Assigned Tutor', 'Status']}>
          {assignments.map((a) => (
            <tr key={a._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
              <td className="py-4 px-4 text-sm font-medium text-slate-900">{a.user?.name || 'N/A'}</td>
              <td className="py-4 px-4 text-sm text-slate-600">{a.grade || 'N/A'}</td>
              <td className="py-4 px-4 text-sm">
                {a.assignedTutor ? (
                  <span className="text-indigo-600 font-medium">{a.assignedTutor.user?.name}</span>
                ) : (
                  <span className="text-slate-400 italic">Not Assigned</span>
                )}
              </td>
              <td className="py-4 px-4">
                <StatusBadge variant={a.assignedTutor ? 'active' : 'on-hold'}>
                  {a.assignedTutor ? 'Linked' : 'Waiting'}
                </StatusBadge>
              </td>
            </tr>
          ))}
          {assignments.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-12 text-sm text-slate-500">
                No students found. Add students via the Admin panel first.
              </td>
            </tr>
          )}
        </DataTable>
      </CardShell>

      {/* Assignment Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowAssignDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900">Assign New Tutor</h2>
              <button
                onClick={() => setShowAssignDialog(false)}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Select Student</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                >
                  <option value="">-- Choose Student --</option>
                  {allStudents.map(s => (
                    <option key={s._id} value={s.user?._id}>
                      {s.user?.name} ({s.grade || 'No Grade'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Select Tutor</label>
                <select
                  value={selectedTutor}
                  onChange={(e) => setSelectedTutor(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
                >
                  <option value="">-- Choose Tutor --</option>
                  {allTutors.map(t => (
                    <option key={t._id} value={t.user?._id}>
                      {t.user?.name} {t.subjects?.length > 0 ? `(${t.subjects.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAssign}
                  disabled={assigning}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-200"
                >
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Confirm Assignment
                </button>
                <button
                  onClick={() => setShowAssignDialog(false)}
                  className="flex-1 bg-white text-slate-600 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer"
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
