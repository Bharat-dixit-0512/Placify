import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { features, roles } from "../data/mockData.js"
import { listBlogs } from "../services/blog.service.js"
import { listSessions } from "../services/session.service.js"
import { listNotices } from "../services/notice.service.js"
import { fetchPublicStats } from "../services/public.service.js"
import { useToast } from "../context/ToastContext.jsx"

const Home = () => {
  const [blogs, setBlogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [notices, setNotices] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const [blogsResp, sessionsResp, noticesResp, statsResp] = await Promise.all([
          listBlogs(),
          listSessions(),
          listNotices(),
          fetchPublicStats()
        ])
        setBlogs(blogsResp.data.data?.items || [])
        setSessions(sessionsResp.data.data?.items || [])
        setNotices(noticesResp.data.data || [])
        setStats(statsResp.data.data || null)
      } catch (err) {
        addToast({
          type: "error",
          title: "Home load failed",
          message: err?.response?.data?.message || "Unable to load latest content."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast])

  return (
    <div>
      <section className="py-24">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              Verified placement knowledge
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              A structured placement ecosystem for students, mentors, and T&P teams.
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Placify centralizes interview experiences, prep paths, notices, and mentorship in one
              secure, role-based platform. No more scattered WhatsApp notes or lost batch wisdom.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                to="/register"
              >
                Get Started
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                to="/blogs"
              >
                View Resources
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Today's Pulse</h3>
            <div className="mt-4 grid gap-3">
              {loading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      className="h-36 rounded-2xl bg-slate-100 shadow-sm animate-pulse"
                      key={idx}
                    />
                  ))}
                </div>
              ) : notices.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                  No notices published yet.
                </div>
              ) : (
                notices.map((notice) => (
                  <div key={notice._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      {notice.tags?.map((tag) => (
                        <span
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          key={tag}
                        >
                          {tag}
                        </span>
                      ))}
                      {notice.isPinned && (
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          Pinned
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">
                      {notice.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">{notice.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{stats.users}</strong>
                <span className="text-sm text-slate-600">Verified users</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{stats.blogs}</strong>
                <span className="text-sm text-slate-600">Interview stories</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{stats.sessions}</strong>
                <span className="text-sm text-slate-600">Mentorship sessions</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{stats.notices}</strong>
                <span className="text-sm text-slate-600">Official notices</span>
              </div>
            </>
          ) : (
            Array.from({ length: 4 }).map((_, idx) => (
              <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">Why Placify works</h2>
          <p className="mt-2 text-slate-600">
            Built for campus placements with structured workflows and verified guidance.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={feature.title}
              >
                <h4 className="text-base font-semibold text-slate-900">{feature.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">Role-based experience</h2>
          <p className="mt-2 text-slate-600">
            Every persona gets tailored workflows and access controls.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={role.name}
              >
                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  {role.pill}
                </span>
                <h4 className="mt-3 text-base font-semibold text-slate-900">{role.name}</h4>
                <p className="mt-2 text-sm text-slate-600">{role.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Latest interview stories</h2>
            <p className="mt-2 text-slate-600">
              Verified blogs tagged by company, role, and difficulty.
            </p>
            {loading ? (
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div className="h-36 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
                ))}
              </div>
            ) : blogs.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                No blogs yet.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {blogs.map((blog) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    key={blog._id}
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
                      {blog.difficulty && (
                        <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                          {blog.difficulty}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">{blog.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {blog.content?.slice(0, 140)}...
                    </p>
                    <div className="mt-3 text-xs text-slate-500">
                      by {blog.author?.name || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming mentorship</h2>
            <p className="mt-2 text-slate-600">
              Join structured group sessions led by mentors and seniors.
            </p>
            {loading ? (
              <div className="mt-4 grid gap-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div className="h-36 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                No sessions scheduled.
              </div>
            ) : (
              <div className="mt-4 grid gap-3">
                {sessions.map((session) => (
                  <div
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    key={session._id}
                  >
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {session.status}
                    </span>
                    <h4 className="mt-3 text-base font-semibold text-slate-900">
                      {session.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {session.mentor?.name || "Mentor"} -{" "}
                      {new Date(session.scheduledAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Capacity {session.capacity}
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
                Explore Sessions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 px-6 py-8 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Placement Cell Control Center
              </h2>
              <p className="mt-2 text-slate-600">
                Publish verified notices, track engagement, and ensure equitable access.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Verified content badges
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Branch restrictions
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Chat lifecycle controls
                </span>
              </div>
            </div>
            <div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="text-base font-semibold text-slate-900">Faculty checklist</h4>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
                  <li>Approve mentors and seniors</li>
                  <li>Moderate blogs and notices</li>
                  <li>Review analytics weekly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
