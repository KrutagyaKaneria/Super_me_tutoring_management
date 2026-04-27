import { cn } from '@/lib/utils';

type BannerVariant = 'info' | 'warning' | 'success';

const variantStyles: Record<BannerVariant, string> = {
  info: 'bg-blue-50 border-blue-500 text-blue-800',
  warning: 'bg-amber-50 border-amber-500 text-amber-800',
  success: 'bg-emerald-50 border-emerald-500 text-emerald-800',
};

interface NotificationBannerProps {
  variant: BannerVariant;
  children: React.ReactNode;
  className?: string;
}

export function NotificationBanner({ variant, children, className }: NotificationBannerProps) {
  return (
    <div className={cn(
      'px-4 py-3 rounded-lg border-l-4 text-sm font-medium mb-3',
      variantStyles[variant],
      className,
    )}>
      {children}
    </div>
  );
}
