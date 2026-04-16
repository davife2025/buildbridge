import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: boolean; // adds top teal border accent
}

export function Card({ children, accent = false, className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={[
        'rounded-xl border border-white/10 bg-navy-800 p-6',
        accent ? 'border-t-2 border-t-brand-400' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={['mb-4 flex items-center justify-between', className].join(' ')}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={['text-base font-semibold text-white', className].join(' ')}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
