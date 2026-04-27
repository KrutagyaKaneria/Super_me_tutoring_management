import type { EarningsEntry } from '@/lib/types';

interface EarningsBreakdownProps {
  entries: EarningsEntry[];
}

export function EarningsBreakdown({ entries }: EarningsBreakdownProps) {
  return (
    <div className="divide-y divide-slate-50">
      {entries.map((e, i) => (
        <div key={i} className="flex items-center justify-between py-3 px-1 text-sm">
          <span className="font-medium">{e.name}</span>
          <span className="text-muted-foreground">{e.hours}h × ₹{e.rate}</span>
          <span className="font-semibold">₹{e.earned.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
