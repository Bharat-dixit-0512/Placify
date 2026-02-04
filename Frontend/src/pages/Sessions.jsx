import { useEffect, useState } from "react"
import {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  joinSession
} from "../services/session.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import EmptyState from "../components/EmptyState.jsx"

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({ search: "", status: "" })
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduledAt: "",
    durationMins: 60,
    capacity: 100
  })
  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await listSessions({
          ...filters,
          page,
          limit: 8
        })
        setSessions(data.data?.items || [])
        setTotal(data.data?.meta?.total || 0)
      } catch (err) {
        addToast({
          type: "error",
          title: "Sessions failed",
          message: err?.response?.data?.message || "Unable to load sessions."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, filters, page, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [filters])

  const totalPages = Math.max(1, Math.ceil(total / 8))

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createSession({
        title: form.title,
        description: form.description,
        scheduledAt: form.scheduledAt,
        durationMins: Number(form.durationMins),
        capacity: Number(form.capacity)
      })
      addToast({ type: "success", title: "Session created", message: "Session scheduled." })
      setForm({ title: "", description: "", scheduledAt: "", durationMins: 60, capacity: 100 })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Create failed",
        message: err?.response?.data?.message || "Unable to create session."
      })
    }
  }

  const handleEdit = async (session) => {
    const updatedTitle = window.prompt("Update title", session.title)
    if (!updatedTitle) return
    try {
      await updateSession(session._id, { title: updatedTitle })
      addToast({ type: "success", title: "Session updated", message: "Session updated." })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Update failed",
        message: err?.response?.data?.message || "Unable to update session."
      })
    }
  }

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Cancel this session?")) return
    try {
      await deleteSession(sessionId)
      addToast({ type: "success", title: "Session cancelled", message: "Session cancelled." })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Cancel failed",
        message: err?.response?.data?.message || "Unable to cancel session."
      })
    }
  }

  const handleJoin = async (sessionId) => {
    try {
      await joinSession(sessionId)
      addToast({ type: "success", title: "Joined", message: "Session joined." })
    } catch (err) {
      addToast({
        type: "error",
        title: "Join failed",
        message: err?.response?.data?.message || "Unable to join session."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Mentorship Sessions</h2>
        <p className="mt-2 text-slate-600">
          Join faculty-approved group sessions led by mentors and placed seniors.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by title or description"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {(user?.role === "mentor" || user?.role === "admin") && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Create session</h4>
            <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                required
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  type="number"
                  placeholder="Duration (mins)"
                  value={form.durationMins}
                  onChange={(e) => setForm((f) => ({ ...f, durationMins: e.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  type="number"
                  placeholder="Capacity"
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                />
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="submit"
              >
                Schedule session
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            title="No sessions scheduled"
            description="Check back later for new mentor sessions."
          />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={session._id}
              >
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  {session.status}
                </span>
                <h4 className="mt-3 text-base font-semibold text-slate-900">
                  {session.title}
                </h4>
                <p className="mt-1 text-sm text-slate-600">
                  {session.mentor?.name || "Mentor"}
                </p>
                <p className="text-sm text-slate-600">
                  {new Date(session.scheduledAt).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600">Capacity {session.capacity}</p>
                <div className="mt-4">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                    onClick={() => handleJoin(session._id)}
                  >
                    Join Session
                  </button>
                  {(user?.role === "mentor" || user?.role === "admin") && (
                    <div className="mt-3 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => handleEdit(session)}
                      >
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => handleDelete(session._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </button>
          <div className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sessions
