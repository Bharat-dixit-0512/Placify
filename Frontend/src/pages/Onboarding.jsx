import { useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { updateProfile } from "../services/user.service.js"
import { useToast } from "../context/ToastContext.jsx"

const Onboarding = () => {
  const { user, refresh } = useAuth()
  const { addToast } = useToast()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
    rollNumber: user?.rollNumber || "",
    graduationYear: user?.graduationYear || "",
    bio: user?.bio || ""
  })

  const handleSubmit = async () => {
    try {
      await updateProfile({
        name: form.name,
        branch: form.branch,
        year: form.year ? Number(form.year) : undefined,
        rollNumber: form.rollNumber,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined,
        bio: form.bio
      })
      await refresh()
      localStorage.setItem("onboarded", "true")
      addToast({ type: "success", title: "Onboarding complete", message: "Profile updated." })
    } catch (err) {
      addToast({
        type: "error",
        title: "Onboarding failed",
        message: err?.response?.data?.message || "Unable to update profile."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Welcome setup
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Complete your placement profile
          </h2>
          <p className="mt-2 text-slate-600">
            This helps mentors personalize guidance and unlocks better matches.
          </p>

          {step === 1 && (
            <div className="mt-6 grid gap-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Branch"
                value={form.branch}
                onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Year"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              />
              <div className="flex justify-end">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 grid gap-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Roll number"
                value={form.rollNumber}
                onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Graduation year"
                value={form.graduationYear}
                onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
              />
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Short bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
              <div className="flex justify-between gap-3">
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  Back
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                  type="button"
                  onClick={handleSubmit}
                >
                  Finish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Onboarding
