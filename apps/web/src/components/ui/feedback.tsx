// feedback.tsx
interface ErrorBannerProps { message: string; onRetry?: () => void; onDismiss?: () => void; }

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-red-400" aria-hidden="true">⚠</span>
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
      <div className="flex shrink-0 gap-2">
        {onRetry && <button onClick={onRetry} className="text-xs font-semibold text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">Retry</button>}
        {onDismiss && <button onClick={onDismiss} className="text-xs text-red-300 dark:text-red-700 hover:text-red-500 dark:hover:text-red-400" aria-label="Dismiss">✕</button>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: {
  icon?: string; title: string; description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-[#1E3050] bg-white dark:bg-[#131C2E] py-16 text-center">
      {icon && <p className="mb-3 text-4xl">{icon}</p>}
      <p className="mb-1 font-bold text-gray-500 dark:text-gray-400">{title}</p>
      {description && <p className="mb-6 max-w-xs text-sm text-gray-400 dark:text-gray-500">{description}</p>}
      {action && <button onClick={action.onClick} className="btn-primary">{action.label}</button>}
    </div>
  );
}
