import { useEffect, useMemo, useState } from "react"
import { useLocation, Link } from "react-router-dom"
import { listBlogs } from "../services/blog.service.js"
import { listSessions } from "../services/session.service.js"
import { listNotices } from "../services/notice.service.js"
import { listMentors } from "../services/user.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import EmptyState from "../components/EmptyState.jsx"

const useQuery = () => new URLSearchParams(useLocation().search)

const Search = () => {
  const query = useQuery().get("q") || ""
  const { addToast } = useToast()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [blogs, setBlogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [notices, setNotices] = useState([])
  const [mentors, setMentors] = useState([])

  useEffect(() => {
    const load = async () => {
      if (!query.trim()) {
        setLoading(false)
        return
      }
      try {
        const [blogsResp, sessionsResp, noticesResp, mentorsResp] = await Promise.all([
          listBlogs({ search: query, page: 1, limit: 6 }),
          listSessions({ search: query, page: 1, limit: 6 }),
          listNotices(),
          user ? listMentors({ search: query }) : Promise.resolve({ data: { data: [] } })
        ])
        setBlogs(blogsResp.data.data?.items || [])
        setSessions(sessionsResp.data.data?.items || [])
        const noticeItems = noticesResp.data.data || []
        const filteredNotices = noticeItems.filter(
          (n) =>
            n.title?.toLowerCase().includes(query.toLowerCase()) ||
            n.body?.toLowerCase().includes(query.toLowerCase()) ||
            n.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
        )
        setNotices(filteredNotices)
        setMentors(mentorsResp.data.data || [])
      } catch (err) {
        addToast({
          type: "error",
          title: "Search failed",
          message: err?.response?.data?.message || "Unable to search right now."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, query, user])

  const total = useMemo(
    () => blogs.length + sessions.length + notices.length + mentors.length,
    [blogs, sessions, notices, mentors]
  )

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Search results</h2>
        <p className="mt-2 text-slate-600">
          {query ? `Results for "${query}" (${total})` : "Enter a search query above."}
        </p>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : !query ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Start typing in the search bar to find content.
          </div>
        ) : total === 0 ? (
          <EmptyState
            title="No matches found"
            description="Try searching by company name, role, or mentor."
            actionLabel="Browse blogs"
            actionTo="/blogs"
          />
        ) : (
          <>
            {blogs.length > 0 && (
              <section className="pt-0">
                <h3 className="text-lg font-semibold text-slate-900">Blogs</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((blog) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      key={blog._id}
                    >
                      <h4 className="text-base font-semibold text-slate-900">{blog.title}</h4>
                      <p className="mt-2 text-sm text-slate-600">
                        {blog.content?.slice(0, 120)}...
                      </p>
                      <Link
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        to={`/blogs/${blog._id}`}
                      >
                        Read
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {sessions.length > 0 && (
              <section className="pt-0">
                <h3 className="text-lg font-semibold text-slate-900">Sessions</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sessions.map((session) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      key={session._id}
                    >
                      <h4 className="text-base font-semibold text-slate-900">{session.title}</h4>
                      <p className="mt-2 text-sm text-slate-600">
                        {new Date(session.scheduledAt).toLocaleString()}
                      </p>
                      <Link
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        to="/sessions"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {mentors.length > 0 && (
              <section className="pt-0">
                <h3 className="text-lg font-semibold text-slate-900">Mentors</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {mentors.map((m) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      key={m._id}
                    >
                      <strong className="text-slate-900">{m.name}</strong>
                      <p className="mt-2 text-sm text-slate-600">
                        {m.company || "Company not set"} - {m.role}
                      </p>
                      <Link
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        to={`/mentors/${m._id}`}
                      >
                        View Profile
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {notices.length > 0 && (
              <section className="pt-0">
                <h3 className="text-lg font-semibold text-slate-900">Notices</h3>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {notices.map((n) => (
                    <div
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      key={n._id}
                    >
                      <h4 className="text-base font-semibold text-slate-900">{n.title}</h4>
                      <p className="mt-2 text-sm text-slate-600">{n.body?.slice(0, 120)}...</p>
                      <Link
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        to="/notices"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Search
