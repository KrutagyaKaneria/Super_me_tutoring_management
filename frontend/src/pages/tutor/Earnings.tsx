import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { EarningsBreakdown } from '@/components/EarningsBreakdown';
import { PageHeader } from '@/components/PageHeader';
import { GRADE_RATES } from '@/lib/constants';
import { api } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import type { EarningsEntry } from '@/lib/types';

type TutorEarningsResponse = {
  stats: {
    thisMonth: { amount: number; hours: number };
    pending: { amount: number; hours: number };
    totalEarned: number;
  };
  breakdownByStudent: EarningsEntry[];
};

export function Earnings() {
  const [data, setData] = useState<TutorEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/tutor/earnings');
        setData(res.data as TutorEarningsResponse);
      } catch (e: any) {
        toast.error(e.message || 'Failed to load earnings');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const earningStats = useMemo(() => {
    const monthAmount = data?.stats.thisMonth.amount ?? 0;
    const monthHours = data?.stats.thisMonth.hours ?? 0;
    const pendingAmount = data?.stats.pending.amount ?? 0;
    const pendingHours = data?.stats.pending.hours ?? 0;
    const totalEarned = data?.stats.totalEarned ?? 0;

    return [
      {
        label: 'This Month',
        value: `₹${monthAmount.toLocaleString()}`,
        subText: `${monthHours} hrs approved`,
      },
      {
        label: 'Pending',
        value: `₹${pendingAmount.toLocaleString()}`,
        subText: `${pendingHours} hrs awaiting`,
        highlight: pendingHours > 0,
      },
      {
        label: 'Total Earned',
        value: `₹${totalEarned.toLocaleString()}`,
      },
    ];
  }, [data]);

  return (
    <div>
      <PageHeader title="My Earnings" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {earningStats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell title="Per-Grade Rate (Fallback)">
        <DataTable headers={['Grade', 'Rate/Hour']}>
          {GRADE_RATES.map((r) => (
            <tr key={r.gradeBand} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-3 text-sm">{r.gradeBand}</td>
              <td className="py-3 px-3 text-sm font-medium">₹{r.rate}</td>
            </tr>
          ))}
        </DataTable>
      </CardShell>

      <CardShell title="Breakdown by Student">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <EarningsBreakdown entries={data?.breakdownByStudent || []} />
        )}
      </CardShell>
    </div>
  );
}
