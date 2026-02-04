import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { requestOtp, verifyOtp } from "../services/auth.service.js"
import { useToast } from "../context/ToastContext.jsx"

const VerifyEmail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const emailFromQuery = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get("email") || ""
  }, [location.search])

  const [email, setEmail] = useState(emailFromQuery)
  const [otp, setOtp] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [cooldown, setCooldown] = useState(0)
  const [errors, setErrors] = useState({})
  const { addToast } = useToast()

  const handleSendOtp = async () => {
    setStatus({ type: "", message: "" })
    setErrors({})
    try {
      await requestOtp({ email })
      setStatus({ type: "success", message: "OTP sent. Please check your email." })
      addToast({ type: "success", title: "OTP sent", message: "Check your email inbox." })
      setCooldown(60)
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
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Failed to send OTP."
      })
      addToast({ type: "error", title: "OTP failed", message: "Please try again." })
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setStatus({ type: "", message: "" })
    setErrors({})
    try {
      await verifyOtp({ email, otp })
      setStatus({
        type: "success",
        message: "Email verified. Wait for faculty approval, then login."
      })
      addToast({ type: "success", title: "Email verified", message: "You can now login after approval." })
      navigate("/login")
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
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "OTP verification failed."
      })
      addToast({ type: "error", title: "Verification failed", message: "Please check the OTP." })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">Verify your email</h2>
          <p className="mt-2 text-slate-600">
            Enter the 6-digit code sent to your college email address.
          </p>

          <div className="mt-6 grid gap-3">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="email"
              placeholder="College email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <span className="text-xs text-red-600">{errors.email}</span>}
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              type="button"
              onClick={handleSendOtp}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Send OTP"}
            </button>
          </div>

          <form className="mt-4 grid gap-3" onSubmit={handleVerify}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            {errors.otp && <span className="text-xs text-red-600">{errors.otp}</span>}
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Verify email
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

export default VerifyEmail
