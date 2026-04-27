import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { MarksTable } from '@/components/MarksTable';
import { api } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ParentMarks() {
  const [marks, setMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const response = await api.get('/parent/marks');
        const mapped = (response.data.marks || []).map((m: any) => ({
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
        toast.error('Failed to load exam marks');
      } finally {
        setLoading(false);
      }
    };
    fetchMarks();
  }, []);

  const handleDownload = async () => {
    try {
      toast.info('Generating report card...');
      const blob = await api.get('/parent/download-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'report-card.pdf');
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report card downloaded');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Marks" />

      <CardShell
        title="Children Academic Performance"
        action={
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF Report
          </button>
        }
      >
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
