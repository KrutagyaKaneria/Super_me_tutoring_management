import { cn } from '@/lib/utils';
import type { BadgeVariant } from '@/lib/types';

const variantClasses: Record<BadgeVariant, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}

/** Map common status strings to badge variants */
export function getStatusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = {
    active: 'green',
    completed: 'green',
    approved: 'green',
    verified: 'green',
    sent: 'green',
    paid: 'green',
    scheduled: 'blue',
    regular: 'blue',
    pending: 'amber',
    queued: 'amber',
    'on-hold': 'amber',
    'in-progress': 'blue',
    rejected: 'red',
    cancelled: 'red',
    failed: 'red',
    overdue: 'red',
    inactive: 'gray',
    ended: 'gray',
  };
  return map[status.toLowerCase()] || 'gray';
}
