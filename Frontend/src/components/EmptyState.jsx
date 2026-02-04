import { Link } from "react-router-dom"

const EmptyState = ({ title, description, actionLabel, actionTo, onAction }) => {
  const actionClass =
    "inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"

  return (
    <div className="grid gap-3 rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-6">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      {description && <div className="text-slate-600">{description}</div>}
      {actionLabel && actionTo && (
        <Link className={actionClass} to={actionTo}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button className={actionClass} type="button" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
