import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { MarksTable } from '@/components/MarksTable';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function ExamsMarks() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await api.get('/student/marks');
        const mapped = (res.data?.marks || []).map((m: any) => ({
          id: m._id,
          exam: m.examName,
          subject: m.subject,
          date: new Date(m.date).toLocaleDateString(),
          marks: m.marks,
          total: m.totalMarks,
          grade: calculateGrade(m.marks, m.totalMarks)
        }));
        setMarks(mapped);
      } catch (error) {
        toast.error('Failed to load marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const calculateGrade = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'D';
  };

  return (
    <div>
      <PageHeader title="Exams & Marks" />
      <CardShell title="My Results">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <MarksTable entries={marks} />
        )}
      </CardShell>
    </div>
  );
}
