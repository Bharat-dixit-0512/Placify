import { useMemo, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { updateProfile, changePassword, changeEmail, uploadAvatar } from "../services/user.service.js"
import { requestOtp, verifyOtp } from "../services/auth.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { getProfileCompletion } from "../utils/profileCompletion.js"

const Profile = () => {
  const { user, refresh } = useAuth()
  const { addToast } = useToast()
  const [form, setForm] = useState({
    name: user?.name || "",
    branch: user?.branch || "",
    year: user?.year || "",
    rollNumber: user?.rollNumber || "",
    graduationYear: user?.graduationYear || ""
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: ""
  })
  const [emailForm, setEmailForm] = useState({
    email: user?.email || "",
    otp: ""
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [croppedBlob, setCroppedBlob] = useState(null)
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
  const fileBase = apiBase.replace(/\/api$/, "")
  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${fileBase}${user.avatarUrl}`
    : null

  const completion = getProfileCompletion(user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile({
        name: form.name,
        branch: form.branch,
        year: form.year ? Number(form.year) : undefined,
        rollNumber: form.rollNumber,
        graduationYear: form.graduationYear ? Number(form.graduationYear) : undefined
      })
      await refresh()
      addToast({ type: "success", title: "Profile updated", message: "Changes saved." })
    } catch (err) {
      addToast({
        type: "error",
        title: "Update failed",
        message: err?.response?.data?.message || "Unable to update profile."
      })
    }
  }

  const cropCenterSquare = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const img = new Image()
        img.onload = () => {
          const size = Math.min(img.width, img.height)
          const canvas = document.createElement("canvas")
          canvas.width = 256
          canvas.height = 256
          const ctx = canvas.getContext("2d")
          const sx = (img.width - size) / 2
          const sy = (img.height - size) / 2
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 256, 256)
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Crop failed"))
            resolve(blob)
          }, "image/jpeg")
        }
        img.onerror = reject
        img.src = reader.result
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const passwordStrength = useMemo(() => {
    const value = passwordForm.newPassword || ""
    let score = 0
    if (value.length >= 8) score += 1
    if (/[A-Z]/.test(value)) score += 1
    if (/[a-z]/.test(value)) score += 1
    if (/\d/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1
    const label = ["Weak", "Fair", "Good", "Strong", "Very strong"][Math.max(score - 1, 0)]
    return { score, label }
  }, [passwordForm.newPassword])

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
          <p className="mt-2 text-slate-600">Update your personal and academic details.</p>
          <div className="mt-5 grid gap-3">
            <div className="flex items-center justify-between">
              <strong className="text-slate-900">Profile completion</strong>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                {completion.percent}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all"
                style={{ width: `${completion.percent}%` }}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {avatarPreview ? (
              <img
                className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
                src={avatarPreview}
                alt="avatar preview"
              />
            ) : avatarSrc ? (
              <img
                className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
                src={avatarSrc}
                alt="avatar"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                {user?.name?.slice(0, 1) || "U"}
              </div>
            )}
            <div>
              <div className="font-semibold text-slate-900">{user?.name}</div>
              <div className="text-sm text-slate-500">{user?.email}</div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                setAvatarFile(file)
                const blob = await cropCenterSquare(file)
                setCroppedBlob(blob)
                setAvatarPreview(URL.createObjectURL(blob))
              }}
            />
            {avatarFile && (
              <button
                className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                type="button"
                onClick={async () => {
                  try {
                    const file = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" })
                    await uploadAvatar(file)
                    await refresh()
                    setAvatarFile(null)
                    setCroppedBlob(null)
                    setAvatarPreview(null)
                    addToast({
                      type: "success",
                      title: "Avatar updated",
                      message: "Profile photo updated."
                    })
                  } catch (err) {
                    addToast({
                      type: "error",
                      title: "Upload failed",
                      message: err?.response?.data?.message || "Unable to upload photo."
                    })
                  }
                }}
              >
                Upload photo
              </button>
            )}
          </div>
          <form className="mt-6 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.branch}
              onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
              placeholder="Branch"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              placeholder="Year"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.rollNumber}
              onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))}
              placeholder="Roll number"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={form.graduationYear}
              onChange={(e) => setForm((f) => ({ ...f, graduationYear: e.target.value }))}
              placeholder="Graduation year"
            />
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Save changes
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">Change Password</h3>
            <span className="group relative inline-flex items-center text-xs text-slate-500">
              i
              <span className="absolute bottom-6 left-0 w-56 rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 transition group-hover:opacity-100">
                Use at least 8 characters with uppercase, lowercase, numbers, and a symbol.
              </span>
            </span>
          </div>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                await changePassword(passwordForm)
                setPasswordForm({ currentPassword: "", newPassword: "" })
                addToast({ type: "success", title: "Password updated", message: "Password changed." })
              } catch (err) {
                addToast({
                  type: "error",
                  title: "Change failed",
                  message: err?.response?.data?.message || "Unable to change password."
                })
              }
            }}
          >
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, currentPassword: e.target.value }))}
              required
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((f) => ({ ...f, newPassword: e.target.value }))}
              required
            />
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(passwordStrength.score / 5) * 100}%`,
                  background:
                    passwordStrength.score <= 2
                      ? "#ef4444"
                      : passwordStrength.score === 3
                        ? "#f59e0b"
                        : "#10b981"
                }}
              />
            </div>
            <div className="text-sm text-slate-500">
              Strength: {passwordStrength.label}
            </div>
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Update password
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900">Change Email</h3>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                await changeEmail({ email: emailForm.email })
                await requestOtp({ email: emailForm.email })
                addToast({ type: "success", title: "OTP sent", message: "Verify new email." })
              } catch (err) {
                addToast({
                  type: "error",
                  title: "Email change failed",
                  message: err?.response?.data?.message || "Unable to change email."
                })
              }
            }}
          >
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              type="email"
              placeholder="New email"
              value={emailForm.email}
              onChange={(e) => setEmailForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
              type="submit"
            >
              Send OTP
            </button>
          </form>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              try {
                await verifyOtp({ email: emailForm.email, otp: emailForm.otp })
                await refresh()
                addToast({ type: "success", title: "Email verified", message: "Email updated." })
              } catch (err) {
                addToast({
                  type: "error",
                  title: "Verify failed",
                  message: err?.response?.data?.message || "OTP verification failed."
                })
              }
            }}
          >
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="OTP"
              value={emailForm.otp}
              onChange={(e) => setEmailForm((f) => ({ ...f, otp: e.target.value }))}
            />
            <button
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Verify email
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
