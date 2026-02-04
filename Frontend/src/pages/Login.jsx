import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../services/auth.service.js"
import { useAuth } from "../context/AuthContext.jsx"
import { useToast } from "../context/ToastContext.jsx"

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [status, setStatus] = useState({ type: "", message: "" })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { login, refresh } = useAuth()
  const { addToast } = useToast()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: "", message: "" })
    setErrors({})
    try {
      const { data } = await loginUser(form)
      localStorage.setItem("token", data.data.token)
      login(data.data.user, data.data.token)
      await refresh()
      setStatus({ type: "success", message: "Logged in successfully." })
      addToast({ type: "success", title: "Welcome back", message: "Login successful." })
      navigate("/dashboard")
    } catch (err) {
      const details = err?.response?.data?.errors || []
      if (details.length) {
        const nextErrors = {}
        details.forEach((detail) => {
          const key = detail.path?.[1] || detail.path?.[0]
          if (key) nextErrors[key] = detail.message
        })
        setErrors(nextErrors)
      }
      const message =
        err?.response?.data?.message || "Login failed. Please check your credentials."
      setStatus({ type: "error", message })
      addToast({ type: "error", title: "Login failed", message })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Placify - Secure Access
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Welcome back to your placement hub.
          </h2>
          <p className="mt-3 text-slate-600">
            Access verified blogs, mentorship sessions, and chats once your account is approved by
            the placement cell.
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Login checklist</h4>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
              <li>Email verified via OTP</li>
              <li>T&amp;P approval completed</li>
              <li>Use your college credentials</li>
            </ul>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
          <p className="mt-2 text-slate-600">Use your college email and password to continue.</p>

          <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="email"
              name="email"
              placeholder="College email"
              value={form.email}
              onChange={handleChange}
              required
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && <span className="text-xs text-red-600">{errors.password}</span>}
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Sign in
            </button>
          </form>

          {status.message && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
