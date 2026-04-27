import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { MarksTable } from '@/components/MarksTable';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, X, Loader2 } from 'lucide-react';

export function TutorMarks() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // Form State
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [examName, setExamName] = useState('');
  const [date, setDate] = useState('');
  const [score, setScore] = useState('');
  const [totalMarks, setTotalMarks] = useState('100');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchMarks();
    fetchStudents();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tutor/marks');
      const mapped = (res.data.marks || []).map((m: any) => ({
        id: m._id,
        student: m.studentId?.name || 'N/A',
        exam: m.examName,
        subject: m.subject,
        marks: m.marks,
        total: m.totalMarks,
        grade: (m.marks / m.totalMarks) >= 0.8 ? 'A' : (m.marks / m.totalMarks) >= 0.6 ? 'B' : 'C',
        date: new Date(m.date).toLocaleDateString()
      }));
      setMarks(mapped);
    } catch (error) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/tutor/students');
      setStudents((res.data.students || []).map((s: any) => ({
        id: s.user?._id,
        name: s.user?.name
      })));
    } catch (error) {
      console.error('Failed to load students');
    }
  };

  const handleAddMarks = async () => {
    if (!studentId || !subject || !examName || !date || !score || !totalMarks) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/tutor/add-marks', {
        studentId,
        subject,
        examName,
        date,
        marks: Number(score),
        totalMarks: Number(totalMarks),
        feedback
      });
      toast.success('Marks added successfully');
      setShowDialog(false);
      fetchMarks();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add marks');
    }
  };

  return (
    <div>
      <PageHeader title="Update Student Marks">
        <button
          onClick={() => setShowDialog(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Marks
        </button>
      </PageHeader>

      <CardShell>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <MarksTable entries={marks} />
        )}
      </CardShell>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowDialog(false)}>
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Add New Marks</h2>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Math"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    placeholder="e.g. Final"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Marks</label>
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      placeholder="85"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Total</label>
                    <input
                      type="number"
                      value={totalMarks}
                      onChange={(e) => setTotalMarks(e.target.value)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Feedback (Optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                  rows={2}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddMarks}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Save Marks
                </button>
                <button
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
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
