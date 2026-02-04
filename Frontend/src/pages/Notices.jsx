import { useEffect, useState } from "react"
import { listNotices, createNotice, updateNotice, deleteNotice } from "../services/notice.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import EmptyState from "../components/EmptyState.jsx"

const Notices = () => {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: "", body: "", tags: "", isPinned: false })
  const [refreshKey, setRefreshKey] = useState(0)
  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await listNotices()
        setNotices(data.data || [])
      } catch (err) {
        addToast({
          type: "error",
          title: "Notices failed",
          message: err?.response?.data?.message || "Unable to load notices."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, refreshKey])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createNotice({
        title: form.title,
        body: form.body,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        isPinned: form.isPinned
      })
      addToast({ type: "success", title: "Notice created", message: "Notice published." })
      setForm({ title: "", body: "", tags: "", isPinned: false })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Create failed",
        message: err?.response?.data?.message || "Unable to create notice."
      })
    }
  }

  const handleEdit = async (notice) => {
    const updatedTitle = window.prompt("Update title", notice.title)
    if (!updatedTitle) return
    try {
      await updateNotice(notice._id, { title: updatedTitle })
      addToast({ type: "success", title: "Notice updated", message: "Notice updated." })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Update failed",
        message: err?.response?.data?.message || "Unable to update notice."
      })
    }
  }

  const handleDelete = async (noticeId) => {
    if (!window.confirm("Delete this notice?")) return
    try {
      await deleteNotice(noticeId)
      addToast({ type: "success", title: "Notice deleted", message: "Notice deleted." })
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: err?.response?.data?.message || "Unable to delete notice."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Placement Notices</h2>
        <p className="mt-2 text-slate-600">
          Official updates from the placement cell with verified information.
        </p>

        {user?.role === "admin" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Create notice</h4>
            <form className="mt-4 grid gap-3" onSubmit={handleCreate}>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className="min-h-[140px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Notice body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isPinned}
                  onChange={(e) => setForm((f) => ({ ...f, isPinned: e.target.checked }))}
                />
                Pin notice
              </label>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="submit"
              >
                Publish notice
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div className="h-28 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <EmptyState
            title="No notices yet"
            description="Placement updates will appear here as soon as they are published."
          />
        ) : (
          <div className="mt-6 grid gap-4">
            {notices.map((notice) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={notice._id}
              >
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
                <p className="mt-2 text-sm text-slate-600">{notice.body}</p>
                {user?.role === "admin" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => handleEdit(notice)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => handleDelete(notice._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notices
