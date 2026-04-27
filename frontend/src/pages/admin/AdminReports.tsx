import { useEffect, useState } from 'react';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { FeeCollectionEntry } from '@/lib/types';

export function AdminReports() {
  const [data, setData] = useState<FeeCollectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports');
      setData(response.data.feeCollection || []);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Platform Reports">
        <button
          onClick={() => toast.success('Generating full report PDF...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Full Report
        </button>
        <button
          onClick={() => toast.success('Exporting tutor earnings...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Tutor Earnings
        </button>
        <button
          onClick={() => toast.success('Exporting fee collection...')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Fee Collection
        </button>
      </PageHeader>

      <CardShell title="Fee Collection Summary">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Month', 'Invoiced', 'Collected', 'Pending']}>
            {data.map((f, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm font-medium">{f.month}</td>
                <td className="py-3 px-3 text-sm">{f.invoiced}</td>
                <td className="py-3 px-3 text-sm">{f.collected}</td>
                <td className="py-3 px-3 text-sm">{f.pending}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </CardShell>
    </div>
  );
}
