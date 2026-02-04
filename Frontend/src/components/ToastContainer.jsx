import { useToast } from "../context/ToastContext.jsx"

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed right-4 top-4 z-[100] grid gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`relative min-w-[240px] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ${
            toast.type === "success"
              ? "border-l-4 border-l-emerald-500"
              : toast.type === "error"
                ? "border-l-4 border-l-red-500"
                : "border-l-4 border-l-blue-500"
          }`}
        >
          <div className="grid gap-1 text-sm">
            <strong className="text-slate-900">{toast.title || "Notice"}</strong>
            <span className="text-slate-600">{toast.message}</span>
          </div>
          <button
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            onClick={() => removeToast(toast.id)}
            type="button"
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
