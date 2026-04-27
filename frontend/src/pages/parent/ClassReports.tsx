import { useEffect, useState } from 'react';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ClassReports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await api.get('/parent/child-progress');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load class reports');
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, []);

  const handleDownload = async () => {
    try {
      toast.info('Generating report...');
      const response = await api.get('/parent/download-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'child-report.pdf');
      document.body.appendChild(link);
      link.click();
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };
  return (
    <div>
      <PageHeader title="Class Reports" />

      <CardShell
        title="Session History"
        action={
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Date', 'Subject', 'Tutor', 'Student', 'Status']}>
            {data.sessionHistory?.map((s: any) => (
              <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm">{new Date(s.scheduledDate).toLocaleDateString()}</td>
                <td className="py-3 px-3 text-sm font-medium">{s.subject}</td>
                <td className="py-3 px-3 text-sm">{s.tutorId?.name || 'N/A'}</td>
                <td className="py-3 px-3 text-sm">{s.studentId?.name || 'N/A'}</td>
                <td className="py-3 px-3">
                  <StatusBadge variant={getStatusVariant(s.status)}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </StatusBadge>
                </td>
              </tr>
            ))}
            {!data.sessionHistory?.length && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-sm text-slate-500">No session history found</td>
              </tr>
            )}
          </DataTable>
        )}
      </CardShell>
    </div>
  );
}
