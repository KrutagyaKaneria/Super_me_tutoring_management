import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { CardShell } from '@/components/CardShell';
import { DataTable } from '@/components/DataTable';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function FeeConfig() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/fee-config');
      const mapped = res.data.feeConfigs.map((r: any) => ({
        ...r,
        gradeBand: `Grade ${r.gradeMin} - ${r.gradeMax}`,
        rate: r.hourlyRate
      }));
      setRates(mapped);
    } catch (error) {
      toast.error('Failed to load fee configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleRateChange = (index: number, value: number) => {
    setRates(prev => prev.map((r, i) => i === index ? { ...r, rate: value } : r));
  };

  const handleSave = async (index: number) => {
    const rateItem = rates[index];
    try {
      await api.patch('/admin/fee-config', {
        gradeMin: rateItem.gradeMin,
        gradeMax: rateItem.gradeMax,
        hourlyRate: rateItem.rate
      });
      toast.success(`Rate updated for ${rateItem.gradeBand}`);
      fetchRates(); // Refresh to ensure sync
    } catch (error) {
      toast.error('Failed to update rate');
    }
  };

  return (
    <div>
      <PageHeader title="Fee Configuration (Per-Hour by Grade)" />

      <CardShell>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <DataTable headers={['Grade Band', 'Rate/Hour', 'Action']}>
            {rates.map((r, i) => (
              <tr key={r.gradeBand} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3 px-3 text-sm font-medium">{r.gradeBand}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-muted-foreground">₹</span>
                    <input
                      type="number"
                      value={r.rate}
                      onChange={(e) => handleRateChange(i, Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm border border-slate-200 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => handleSave(i)}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </CardShell>
    </div>
  );
}
