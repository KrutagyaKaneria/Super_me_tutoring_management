import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  stats: { label: string; value: number | string }[];
  platformMetrics: { metric: string; thisMonth: string; lastMonth: string; trend: string }[];
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        const b = response.data;
        
        setData({
          stats: [
            { label: 'Total Users', value: b.totalUsers },
            { label: 'Total Sessions', value: b.totalSessions },
            { label: 'Active Classes', value: b.activeSessions },
            { label: 'Pending Approvals', value: b.pendingApprovals },
          ],
          platformMetrics: [
            { metric: 'Platform Revenue', thisMonth: `$${b.totalRevenue}`, lastMonth: '-', trend: '+0%' }
          ]
        });
      } catch (error) {
        toast.error('Failed to fetch dashboard metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading || !data) return <div className="p-8 text-center text-slate-500">Loading metrics...</div>;

  return (
    <div>
      <PageHeader title="Admin Overview" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {data.stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      <CardShell title="Platform Activity">
        <DataTable headers={['Metric', 'This Month', 'Last Month', 'Trend']}>
          {data.platformMetrics.map((m, i) => (
            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-3 text-sm font-medium">{m.metric}</td>
              <td className="py-3 px-3 text-sm">{m.thisMonth}</td>
              <td className="py-3 px-3 text-sm text-muted-foreground">{m.lastMonth}</td>
              <td className="py-3 px-3">
                <StatusBadge variant="green">{m.trend}</StatusBadge>
              </td>
            </tr>
          ))}
        </DataTable>
      </CardShell>
    </div>
  );
}
