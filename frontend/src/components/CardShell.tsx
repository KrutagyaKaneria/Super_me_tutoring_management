import { cn } from '@/lib/utils';

interface CardShellProps {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CardShell({ title, action, children, className }: CardShellProps) {
  return (
    <div className={cn(
      'bg-white rounded-xl border border-slate-100 shadow-sm mb-4',
      'hover:shadow-md transition-shadow duration-200',
      className,
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
          {action}
        </div>
      )}
      <div className="px-5 pb-4">
        {children}
      </div>
    </div>
  );
}
