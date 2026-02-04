import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext.jsx"

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-3xl px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute
