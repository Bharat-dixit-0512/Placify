import { useState } from "react"
import { registerUser, requestOtp } from "../services/auth.service.js"
import { useNavigate } from "react-router-dom"
import { useToast } from "../context/ToastContext.jsx"

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    branch: "",
    year: "",
    rollNumber: "",
    graduationYear: "",
    offerLetterUrl: ""
  })
  const [status, setStatus] = useState({ type: "", message: "" })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const { addToast } = useToast()

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus({ type: "", message: "" })
    setErrors({})
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      }
      if (form.branch.trim()) payload.branch = form.branch.trim()
      if (form.year && !Number.isNaN(Number(form.year))) payload.year = Number(form.year)
      if (form.rollNumber.trim()) payload.rollNumber = form.rollNumber.trim()
      if (form.graduationYear && !Number.isNaN(Number(form.graduationYear))) {
        payload.graduationYear = Number(form.graduationYear)
      }
      if (form.offerLetterUrl.trim()) payload.offerLetterUrl = form.offerLetterUrl.trim()
      const { data } = await registerUser(payload)
      localStorage.setItem("token", data.data.token)
      await requestOtp({ email: payload.email })
      setStatus({
        type: "success",
        message:
          "Registration submitted. We sent a verification code to your email."
      })
      addToast({ type: "success", title: "Registered", message: "OTP sent to your email." })
      navigate(`/verify-email?email=${encodeURIComponent(payload.email)}`)
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
        err?.response?.data?.message || "Registration failed. Please check your details."
      setStatus({ type: "error", message })
      addToast({ type: "error", title: "Registration failed", message })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Placify - Account Setup
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
            Build your verified placement profile.
          </h2>
          <p className="mt-3 text-slate-600">
            Register with your college email, verify it with OTP, and get approved by T&amp;P to
            access chats, blogs, and sessions.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <strong className="block text-sm font-semibold text-slate-900">
                2-step approval
              </strong>
              <span className="text-xs text-slate-600">Email verification + T&amp;P approval</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <strong className="block text-sm font-semibold text-slate-900">
                Role-based access
              </strong>
              <span className="text-xs text-slate-600">Students, seniors, mentors</span>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">Create your account</h2>
          <p className="mt-2 text-slate-600">
            All accounts require faculty verification before login is enabled.
          </p>

          <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="name"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name}</span>}
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
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="role"
              value={form.role}
              onChange={handleChange}
            >
              <option value="student">Student</option>
              <option value="senior">Placed Senior</option>
              <option value="mentor">External Mentor</option>
            </select>
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                name="branch"
                placeholder="Branch (e.g., CSE)"
                value={form.branch}
                onChange={handleChange}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                name="year"
                placeholder="Year (e.g., 3)"
                value={form.year}
                onChange={handleChange}
              />
            </div>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="rollNumber"
              placeholder="Roll number"
              value={form.rollNumber}
              onChange={handleChange}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="graduationYear"
              placeholder="Graduation year (e.g., 2026)"
              value={form.graduationYear}
              onChange={handleChange}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              name="offerLetterUrl"
              placeholder="Offer letter URL (optional)"
              value={form.offerLetterUrl}
              onChange={handleChange}
            />
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Submit registration
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

export default Register
