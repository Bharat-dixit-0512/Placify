import { createContext, useContext, useMemo, useState } from "react"

const ToastContext = createContext(null)

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, ...toast }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 3000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const value = useMemo(
    () => ({
      toasts,
      addToast,
      removeToast
    }),
    [toasts]
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export { ToastProvider, useToast }
