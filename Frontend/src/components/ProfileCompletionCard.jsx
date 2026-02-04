import { Link } from "react-router-dom"
import { getProfileCompletion } from "../utils/profileCompletion.js"

const ProfileCompletionCard = ({ user }) => {
  const { percent, missing } = getProfileCompletion(user)
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <strong className="text-slate-900">Profile completion</strong>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {percent}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        {missing.length > 0 ? (
          <div className="text-slate-600">
            Missing: {missing.slice(0, 3).join(", ")}
            {missing.length > 3 ? "..." : ""}
          </div>
        ) : (
          <div className="text-slate-600">All set. Great job!</div>
        )}
        <Link
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
          to="/onboarding"
        >
          Update profile
        </Link>
      </div>
    </div>
  )
}

export default ProfileCompletionCard
