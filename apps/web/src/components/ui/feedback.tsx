'use client';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
    >
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-red-400" aria-hidden="true">⚠</span>
        <p className="text-sm text-red-300">{message}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs font-medium text-red-400 hover:text-red-300"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-red-400/50 hover:text-red-400"
            aria-label="Dismiss"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-white/10 py-16 text-center">
      {icon && <p className="mb-3 text-4xl">{icon}</p>}
      <p className="mb-1 font-medium text-white/40">{title}</p>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-white/20">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
