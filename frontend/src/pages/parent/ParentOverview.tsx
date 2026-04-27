import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/StatsCard';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { NotificationBanner } from '@/components/NotificationBanner';
import { PageHeader } from '@/components/PageHeader';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Wallet, GraduationCap } from 'lucide-react';

export function ParentOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchParentData = async () => {
      try {
        const response = await api.get('/parent/dashboard');
        setData(response.data);
      } catch (err: any) {
        setError(true);
        toast.error(err?.response?.data?.message || 'Failed to load parent dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchParentData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading parent dashboard...</div>;
  if (error || !data) return (
    <div className="p-8 text-center space-y-2">
      <p className="text-red-500 font-semibold">Could not load dashboard.</p>
      <p className="text-slate-500 text-sm">Please refresh the page or contact support.</p>
    </div>
  );

  const stats = [
    { label: 'Classes Completed', value: data.sessionsCompleted || 0 },
    { label: 'Hours Done', value: `${(data.hoursCompleted || 0).toFixed(1)}h` },
    { label: 'Fees Paid', value: `₹${data.totalFeesPaid || 0}` },
    { label: 'Fees Pending', value: `₹${data.pendingFees || 0}`, highlight: (data.pendingFees || 0) > 0 },
  ];

  const childrenNames = data.children?.map((c: any) => c.user?.name).join(', ') || 'Your Children';

  return (
    <div className="space-y-6">
      <PageHeader title={`Parent Dashboard — ${childrenNames}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {(data.children || []).length === 0 && (
        <NotificationBanner variant="info">
          👶 No students are linked to your account yet. Contact your coordinator to assign your child.
        </NotificationBanner>
      )}

      {data.pendingFees > 0 && (
        <NotificationBanner variant="warning">
          Pending fee of ₹{data.pendingFees} due soon. Make payment to keep the learning journey smooth.{' '}
          <span className="text-indigo-600 underline font-bold cursor-pointer hover:text-indigo-700">Pay Online</span>
        </NotificationBanner>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardShell title="Child Academic Progress" icon={<GraduationCap className="w-5 h-5 text-indigo-500" />}>
          <DataTable headers={['Student', 'Exam', 'Subject', 'Score']}>
            {(data.recentMarks || []).map((m: any) => (
              <tr key={m._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                <td className="py-4 px-4 text-sm font-medium text-slate-900">{m.studentId?.name || 'Child'}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{m.examName}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{m.subject}</td>
                <td className="py-4 px-4 text-sm font-bold text-emerald-600">{m.marks}/{m.totalMarks}</td>
              </tr>
            ))}
            {(data.recentMarks || []).length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-slate-500 italic">No recent marks available.</td>
              </tr>
            )}
          </DataTable>
        </CardShell>

        <CardShell title="Recent Fee Invoices" icon={<Wallet className="w-5 h-5 text-emerald-500" />}>
          <DataTable headers={['Date', 'Student', 'Description', 'Amount']}>
            {(data.feeLedger || []).map((item: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                <td className="py-4 px-4 text-sm text-slate-500">{new Date(item.date).toLocaleDateString()}</td>
                <td className="py-4 px-4 text-sm font-medium text-slate-900">{item.studentName}</td>
                <td className="py-4 px-4 text-sm text-slate-600">{item.description}</td>
                <td className="py-4 px-4 text-sm font-bold text-slate-900">₹{item.amount}</td>
              </tr>
            ))}
            {(data.feeLedger || []).length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-slate-500 italic">No recent fee activity.</td>
              </tr>
            )}
          </DataTable>
        </CardShell>
      </div>
    </div>
  );
}
