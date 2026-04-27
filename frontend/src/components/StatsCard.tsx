import { cn } from '@/lib/utils';
import type { StatsCardData } from '@/lib/types';

interface StatsCardProps extends StatsCardData {
  className?: string;
}

export function StatsCard({ label, value, subText, highlight, className }: StatsCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl p-4 border border-slate-100 shadow-sm',
      'hover:shadow-md transition-shadow duration-200',
      className,
    )}>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
      <p className={cn(
        'text-2xl font-semibold mt-1',
        highlight ? 'text-orange-600' : 'text-foreground',
      )}>
        {value}
      </p>
      {subText && (
        <p className="text-xs text-muted-foreground mt-1">{subText}</p>
      )}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <div className="skeleton h-3 w-20 mb-2" />
      <div className="skeleton h-7 w-14 mb-1" />
      <div className="skeleton h-3 w-24" />
    </div>
  );
}
