interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: { label: string; href: string }
  hint?: string
}

export default function EmptyState({ icon, title, description, action, hint }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <span className="text-4xl mb-3">{icon}</span>
      <h3 className="text-base font-semibold text-stone-800 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 leading-relaxed max-w-xs mb-4">{description}</p>
      {action && (
        <a
          href={action.href}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition"
        >
          {action.label}
        </a>
      )}
      {hint && <p className="text-xs text-stone-400 mt-3">{hint}</p>}
    </div>
  )
}
