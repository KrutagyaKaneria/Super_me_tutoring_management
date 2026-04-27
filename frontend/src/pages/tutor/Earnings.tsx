import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { EarningsBreakdown } from '@/components/EarningsBreakdown';
import { PageHeader } from '@/components/PageHeader';
import { mockEarnings } from '@/data/mockData';
import { GRADE_RATES } from '@/lib/constants';

const earningStats = [
  { label: 'This Month', value: '₹9,600', subText: '38.5 hrs approved' },
  { label: 'Pending', value: '₹1,200', subText: '4.8 hrs awaiting', highlight: true },
  { label: 'Total Earned', value: '₹41,200' },
];

export function Earnings() {
  return (
    <div>
      <PageHeader title="My Earnings" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        {earningStats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell title="Per-Grade Rate">
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
        <EarningsBreakdown entries={mockEarnings} />
      </CardShell>
    </div>
  );
}
