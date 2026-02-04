import { useEffect, useState } from "react"
import { listBlogs, createBlog, updateBlog, deleteBlog } from "../services/blog.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { Link } from "react-router-dom"
import EmptyState from "../components/EmptyState.jsx"

const Blogs = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [filters, setFilters] = useState({
    search: "",
    company: "",
    role: "",
    difficulty: ""
  })
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [form, setForm] = useState({
    title: "",
    content: "",
    tags: "",
    company: "",
    role: "",
    difficulty: ""
  })
  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const params = {
          page,
          limit: 9
        }
        if (debouncedSearch) params.search = debouncedSearch
        if (filters.company) params.company = filters.company
        if (filters.role) params.role = filters.role
        if (filters.difficulty) params.difficulty = filters.difficulty
        const { data } = await listBlogs(params)
        setBlogs(data.data?.items || [])
        setTotal(data.data?.meta?.total || 0)
      } catch (err) {
        addToast({
          type: "error",
          title: "Blogs failed",
          message: err?.response?.data?.message || "Unable to load blogs."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, filters, debouncedSearch, page, refreshKey])

  useEffect(() => {
    setPage(1)
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [filters.search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const totalPages = Math.max(1, Math.ceil(total / 9))

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        title: form.title,
        content: form.content,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        company: form.company,
        role: form.role,
        difficulty: form.difficulty
      }
      await createBlog(payload)
      addToast({ type: "success", title: "Blog created", message: "Blog published." })
      setForm({ title: "", content: "", tags: "", company: "", role: "", difficulty: "" })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Create failed",
        message: err?.response?.data?.message || "Unable to create blog."
      })
    }
  }

  const handleEdit = async (blog) => {
    const updatedTitle = window.prompt("Update title", blog.title)
    if (!updatedTitle) return
    try {
      await updateBlog(blog._id, { title: updatedTitle })
      addToast({ type: "success", title: "Blog updated", message: "Blog updated." })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Update failed",
        message: err?.response?.data?.message || "Unable to update blog."
      })
    }
  }

  const handleDelete = async (blogId) => {
    if (!window.confirm("Delete this blog?")) return
    try {
      await deleteBlog(blogId)
      addToast({ type: "success", title: "Blog deleted", message: "Blog deleted." })
      setPage(1)
      setRefreshKey((k) => k + 1)
    } catch (err) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: err?.response?.data?.message || "Unable to delete blog."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Interview Experiences</h2>
        <p className="mt-2 text-slate-600">
          Filter by company, role, and difficulty to find the right preparation path.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by keyword"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Company"
              value={filters.company}
              onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Role"
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.difficulty}
              onChange={(e) => setFilters((f) => ({ ...f, difficulty: e.target.value }))}
            >
              <option value="">Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {(user?.role === "senior" || user?.role === "admin") && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Create blog</h4>
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
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Tags (comma separated)"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Company"
                  value={form.company}
                  onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                />
              </div>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={form.difficulty}
                onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
              >
                <option value="">Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="submit"
              >
                Publish blog
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <EmptyState
            title="No blogs available"
            description="Be the first to share an interview experience."
          />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
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
                <p className="mt-2 text-sm text-slate-600">{blog.content?.slice(0, 140)}...</p>
                <div className="mt-3 text-xs text-slate-500">
                  by {blog.author?.name || "Unknown"}
                </div>
                <div className="mt-4">
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                    to={`/blogs/${blog._id}`}
                  >
                    View
                  </Link>
                </div>
                {(user?.role === "admin" || String(blog.author?._id) === String(user?._id)) && (
                  <div className="mt-3 flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => handleEdit(blog)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => handleDelete(blog._id)}
                    >
                      Delete
                    </button>
                  </div>
                )}
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

export default Blogs
