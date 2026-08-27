export function Spinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label={label}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-900 border-t-gold-500" />
    </div>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-14 text-center">
      <h3 className="font-display text-xl text-navy-900">{title}</h3>
      {body && <p className="mt-2 text-stone-600">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
      {error.message || 'Something went wrong.'}
    </div>
  );
}
