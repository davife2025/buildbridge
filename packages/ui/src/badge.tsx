import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'brand' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-white/10 text-white/70',
  brand:    'bg-brand-400/15 text-brand-400',
  success:  'bg-green-500/15 text-green-400',
  warning:  'bg-yellow-500/15 text-yellow-400',
  danger:   'bg-red-500/15 text-red-400',
  info:     'bg-blue-500/15 text-blue-400',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
