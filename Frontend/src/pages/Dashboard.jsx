import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { Link } from "react-router-dom"
import { listUsers, getAnalytics } from "../services/admin.service.js"
import { listBlogs } from "../services/blog.service.js"
import { listSessions } from "../services/session.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { fetchPublicStats } from "../services/public.service.js"
import ProfileCompletionCard from "../components/ProfileCompletionCard.jsx"
import { getProfileCompletion } from "../utils/profileCompletion.js"

const Dashboard = () => {
  const { user } = useAuth()
  const [pendingCount, setPendingCount] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [contentLoading, setContentLoading] = useState(true)
  const [publicStats, setPublicStats] = useState(null)
  const { addToast } = useToast()

  useEffect(() => {
    const loadPending = async () => {
      if (user?.role !== "admin") return
      try {
        const { data } = await listUsers({ status: "pending" })
        setPendingCount((data.data || []).length)
        const analyticsResp = await getAnalytics()
        setAnalytics(analyticsResp.data.data)
      } catch {
        setPendingCount(null)
      }
    }
    loadPending()
  }, [user])

  useEffect(() => {
    const loadContent = async () => {
      try {
        const [blogsResp, sessionsResp, statsResp] = await Promise.all([
          listBlogs(),
          listSessions(),
          fetchPublicStats()
        ])
        setBlogs(blogsResp.data.data?.items || [])
        setSessions(sessionsResp.data.data?.items || [])
        setPublicStats(statsResp.data.data || null)
      } catch (err) {
        addToast({
          type: "error",
          title: "Dashboard load failed",
          message: err?.response?.data?.message || "Unable to load content."
        })
      } finally {
        setContentLoading(false)
      }
    }
    loadContent()
  }, [addToast])

  const statCards =
    user?.role === "admin" && analytics
      ? [
          { label: "Pending approvals", value: pendingCount ?? 0 },
          { label: "Users", value: analytics.users },
          { label: "Blogs", value: analytics.blogs },
          { label: "Chats", value: analytics.chats }
        ]
      : publicStats
        ? [
            { label: "Verified users", value: publicStats.users },
            { label: "Interview stories", value: publicStats.blogs },
            { label: "Sessions hosted", value: publicStats.sessions },
            { label: "Official notices", value: publicStats.notices }
          ]
        : []

  const completion = getProfileCompletion(user)

  return (
    <div>
      <section className="py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Personalized prep hub
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              Your placement command center.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Stay aligned with verified content, mentorship sessions, and your approval status in
              one view.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                to="/blogs"
              >
                Resume checklist
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                to="/sessions"
              >
                Find mentor
              </Link>
            </div>
            {completion.percent < 80 && (
              <div className="mt-4">
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                  to="/onboarding"
                >
                  Complete onboarding
                </Link>
              </div>
            )}
          </div>
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Weekly focus</h3>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">DSA ladder</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Finish 15 medium problems + 3 mock rounds.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Interview story</h4>
                <p className="mt-1 text-sm text-slate-600">
                  Refine two STAR responses for behavioral rounds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">Your progress</h2>
          <p className="mt-2 text-slate-600">
            Live metrics updated from the platform activity and approvals.
          </p>
          {statCards.length === 0 ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <strong className="block text-2xl text-slate-900">{stat.value}</strong>
                  <span className="text-sm text-slate-600">{stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">Profile health</h2>
          <p className="mt-2 text-slate-600">
            A complete profile improves mentor recommendations and approval speed.
          </p>
          <div className="mt-6">
            <ProfileCompletionCard user={user} />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Recommended blogs</h3>
            {contentLoading ? (
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div className="h-36 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {blogs.map((blog) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    key={blog._id || blog.id}
                  >
                    <div className="flex flex-wrap gap-2">
                      {blog.company && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                          {blog.company}
                        </span>
                      )}
                      {blog.role && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {blog.role}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">{blog.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {blog.excerpt || blog.content?.slice(0, 140)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Upcoming sessions</h3>
            {contentLoading ? (
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
                ))}
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {sessions.map((session) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    key={session._id || session.id}
                  >
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {session.status}
                    </span>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">
                      {session.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {session.mentor?.name || session.mentor} -{" "}
                      {session.scheduledAt
                        ? new Date(session.scheduledAt).toLocaleString()
                        : session.time}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                to="/sessions"
              >
                Join Next Session
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
