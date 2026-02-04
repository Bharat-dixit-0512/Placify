import { useEffect, useState } from "react"
import { listMentors } from "../services/user.service.js"
import { Link } from "react-router-dom"
import { requestChat } from "../services/chat.service.js"
import { useToast } from "../context/ToastContext.jsx"
import EmptyState from "../components/EmptyState.jsx"

const Mentors = () => {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    company: "",
    tag: "",
    sort: ""
  })
  const { addToast } = useToast()

  useEffect(() => {
    const load = async () => {
      try {
        const params = {}
        if (filters.search) params.search = filters.search
        if (filters.role) params.role = filters.role
        if (filters.company) params.company = filters.company
        if (filters.tag) params.tag = filters.tag
        if (filters.sort) params.sort = filters.sort
        const { data } = await listMentors(params)
        setMentors(data.data || [])
      } catch (err) {
        addToast({
          type: "error",
          title: "Mentors failed",
          message: err?.response?.data?.message || "Unable to load mentors."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, filters])

  const handleRequest = async (mentorId) => {
    try {
      await requestChat({ seniorId: mentorId })
      addToast({
        type: "success",
        title: "Request sent",
        message: "Chat request sent for approval."
      })
    } catch (err) {
      addToast({
        type: "error",
        title: "Request failed",
        message: err?.response?.data?.message || "Unable to request chat."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Find Mentors & Seniors</h2>
        <p className="mt-2 text-slate-600">
          Browse verified mentors and placed seniors, then request a chat.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search by name or company"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.role}
              onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="">All roles</option>
              <option value="mentor">Mentor</option>
              <option value="senior">Placed Senior</option>
            </select>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Company"
              value={filters.company}
              onChange={(e) => setFilters((f) => ({ ...f, company: e.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Expertise tag"
              value={filters.tag}
              onChange={(e) => setFilters((f) => ({ ...f, tag: e.target.value }))}
            />
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              value={filters.sort}
              onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            >
              <option value="">Sort by</option>
              <option value="experience">Experience</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <EmptyState
            title="No mentors available"
            description="Try adjusting your filters or check back later."
          />
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mentors.map((mentor) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                key={mentor._id}
              >
                <div className="flex items-center gap-3">
                  {mentor.avatarUrl ? (
                    <img
                      className="h-10 w-10 rounded-full border-2 border-blue-100 object-cover"
                      src={mentor.avatarUrl}
                      alt="avatar"
                    />
                  ) : (
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {mentor.name?.slice(0, 1) || "U"}
                    </div>
                  )}
                  <div>
                    <strong className="text-slate-900">{mentor.name}</strong>
                    <div className="text-xs text-slate-500">{mentor.role}</div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {mentor.company ? `${mentor.company}` : "Company not specified"}
                  {mentor.designation ? ` - ${mentor.designation}` : ""}
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {mentor.bio || "Available for placement mentorship."}
                </p>
                {mentor.expertiseTags && mentor.expertiseTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mentor.expertiseTags.map((tag) => (
                      <span
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                    type="button"
                    onClick={() => handleRequest(mentor._id)}
                  >
                    Request Chat
                  </button>
                  <Link
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                    to={`/mentors/${mentor._id}`}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Mentors
