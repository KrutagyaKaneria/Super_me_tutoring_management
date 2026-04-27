import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge, getStatusVariant } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function FeeDetails() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeeData = async () => {
      try {
        const response = await api.get('/parent/fee-ledger');
        setData(response.data);
      } catch (error) {
        toast.error('Failed to load fee ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeData();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500">Loading fee details...</div>;

  const feeStats = [
    { label: 'Total Invoiced', value: `₹${(data.totalFeesDue || 0) + (data.totalFeesPaid || 0)}` },
    { label: 'Paid', value: `₹${data.totalFeesPaid || 0}` },
    { label: 'Pending', value: `₹${data.totalOutstandingBalance || 0}`, highlight: (data.totalOutstandingBalance || 0) > 0 },
  ];

  return (
    <div>
      <PageHeader title="Fee Details" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {feeStats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell
        title="Student Fee Breakdown"
        action={
          <button
            onClick={() => toast.success('Downloading statement...')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        }
      >
        <DataTable headers={['Student', 'Paid', 'Pending', 'Status']}>
          {data.breakdown?.map((f: any, i: number) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-3 text-sm font-medium">{f.studentInfo?.name || 'N/A'}</td>
              <td className="py-3 px-3 text-sm">₹{f.totalFeesPaid}</td>
              <td className="py-3 px-3 text-sm font-medium">₹{f.pendingFees}</td>
              <td className="py-3 px-3">
                <StatusBadge variant={f.pendingFees > 0 ? 'warning' : 'green'}>
                  {f.pendingFees > 0 ? 'Pending' : 'Cleared'}
                </StatusBadge>
              </td>
            </tr>
          ))}
          {!data.breakdown?.length && (
            <tr>
              <td colSpan={4} className="text-center py-6 text-sm text-slate-500">No fee data found</td>
            </tr>
          )}
        </DataTable>
      </CardShell>
    </div>
  );
}
