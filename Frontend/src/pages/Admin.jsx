import { useEffect, useMemo, useState } from "react"
import {
  listUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  activateUser,
  listAuditLogs,
  listReportedComments,
  exportReportedComments,
  assignReportedComment,
  resolveReportedComment,
  removeReportedComment,
  getRatingAnalytics
} from "../services/admin.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { getAnalytics } from "../services/admin.service.js"
import { listBlogs } from "../services/blog.service.js"

const Admin = () => {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("pending")
  const [rejectReason, setRejectReason] = useState("")
  const [auditLogs, setAuditLogs] = useState([])
  const [userPage, setUserPage] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotal, setAuditTotal] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [reportedComments, setReportedComments] = useState([])
  const [reportedPage, setReportedPage] = useState(1)
  const [reportedTotal, setReportedTotal] = useState(0)
  const [reportedMin, setReportedMin] = useState("")
  const [reportedBlog, setReportedBlog] = useState("")
  const [selectedAdmin, setSelectedAdmin] = useState("")
  const [adminUsers, setAdminUsers] = useState([])
  const [blogs, setBlogs] = useState([])
  const [ratingAnalytics, setRatingAnalytics] = useState(null)
  const [status, setStatus] = useState({ type: "", message: "" })
  const { addToast } = useToast()

  const loadUsers = async () => {
    try {
      const params = {}
      if (statusFilter !== "all") params.status = statusFilter
      if (roleFilter !== "all") params.role = roleFilter
      if (debouncedQuery.trim()) params.search = debouncedQuery.trim()
      params.page = userPage
      params.limit = 10
      const { data } = await listUsers(params)
      setUsers(data.data?.items || [])
      setUserTotal(data.data?.meta?.total || 0)
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Failed to load pending users."
      })
    }
  }

  const loadAuditLogs = async () => {
    try {
      const { data } = await listAuditLogs({ page: auditPage, limit: 10 })
      setAuditLogs(data.data?.items || [])
      setAuditTotal(data.data?.meta?.total || 0)
    } catch {
      setAuditLogs([])
    }
  }

  useEffect(() => {
    loadUsers()
  }, [statusFilter, roleFilter, debouncedQuery, userPage])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setUserPage(1)
  }, [statusFilter, roleFilter, debouncedQuery])

  useEffect(() => {
    loadAuditLogs()
  }, [auditPage])

  const loadReported = async () => {
    try {
      const params = { page: reportedPage, limit: 10 }
      if (reportedMin) params.minReports = reportedMin
      if (reportedBlog) params.blog = reportedBlog
      if (selectedAdmin) params.assignedTo = selectedAdmin
      const { data } = await listReportedComments(params)
      setReportedComments(data.data?.items || [])
      setReportedTotal(data.data?.meta?.total || 0)
    } catch {
      setReportedComments([])
    }
  }

  useEffect(() => {
    loadReported()
  }, [reportedPage, reportedMin, reportedBlog, selectedAdmin])

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data } = await getAnalytics()
        setAnalytics(data.data)
      } catch {
        setAnalytics(null)
      }
    }
    loadAnalytics()
  }, [])

  useEffect(() => {
    const loadRatings = async () => {
      try {
        const { data } = await getRatingAnalytics()
        setRatingAnalytics(data.data)
      } catch {
        setRatingAnalytics(null)
      }
    }
    loadRatings()
  }, [])

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const { data } = await listUsers({ role: "admin", status: "active", page: 1, limit: 50 })
        setAdminUsers(data.data?.items || [])
      } catch {
        setAdminUsers([])
      }
    }
    loadAdmins()
  }, [])

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        const { data } = await listBlogs({ page: 1, limit: 50 })
        setBlogs(data.data?.items || [])
      } catch {
        setBlogs([])
      }
    }
    loadBlogs()
  }, [])

  const filteredUsers = useMemo(() => users, [users])

  const handleApprove = async (userId) => {
    setStatus({ type: "", message: "" })
    try {
      await approveUser(userId)
      setStatus({ type: "success", message: "User approved successfully." })
      addToast({ type: "success", title: "Approved", message: "User approved successfully." })
      await loadUsers()
      await loadAuditLogs()
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Approval failed."
      })
      addToast({ type: "error", title: "Approval failed", message: "Please try again." })
    }
  }

  const handleReject = async (userId) => {
    setStatus({ type: "", message: "" })
    try {
      await rejectUser(userId, { reason: rejectReason || "Not specified" })
      setStatus({ type: "success", message: "User rejected." })
      addToast({ type: "info", title: "Rejected", message: "User rejected." })
      await loadUsers()
      await loadAuditLogs()
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Reject failed."
      })
      addToast({ type: "error", title: "Reject failed", message: "Please try again." })
    }
  }

  const handleDeactivate = async (userId) => {
    setStatus({ type: "", message: "" })
    try {
      await deactivateUser(userId)
      setStatus({ type: "success", message: "User deactivated." })
      addToast({ type: "info", title: "Deactivated", message: "User deactivated." })
      await loadUsers()
      await loadAuditLogs()
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Deactivate failed."
      })
      addToast({ type: "error", title: "Deactivate failed", message: "Please try again." })
    }
  }

  const handleActivate = async (userId) => {
    setStatus({ type: "", message: "" })
    try {
      await activateUser(userId)
      setStatus({ type: "success", message: "User activated." })
      addToast({ type: "success", title: "Activated", message: "User activated." })
      await loadUsers()
      await loadAuditLogs()
    } catch (err) {
      setStatus({
        type: "error",
        message: err?.response?.data?.message || "Activate failed."
      })
      addToast({ type: "error", title: "Activate failed", message: "Please try again." })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Placement Cell Dashboard</h2>
        <p className="mt-2 text-slate-600">
          Monitor engagement, approvals, and platform health across batches.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {analytics ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{analytics.users}</strong>
                <span className="text-sm text-slate-600">Users</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{analytics.blogs}</strong>
                <span className="text-sm text-slate-600">Blogs</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{analytics.sessions}</strong>
                <span className="text-sm text-slate-600">Sessions</span>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <strong className="block text-2xl text-slate-900">{analytics.chats}</strong>
                <span className="text-sm text-slate-600">Chats</span>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              Loading analytics...
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Pending approvals</h4>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Search by name, email, branch"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All roles</option>
                  <option value="student">Student</option>
                  <option value="senior">Placed Senior</option>
                  <option value="mentor">External Mentor</option>
                  <option value="admin">Admin</option>
                </select>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                  <option value="all">All</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Reject reason (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>

            {filteredUsers.length === 0 ? (
              <p className="mt-4 text-sm text-slate-600">No pending approvals right now.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Name</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Email</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Role</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Branch</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Status</th>
                      <th className="px-3 py-2 text-xs font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="border-t border-slate-200">
                        <td className="px-3 py-2">{user.name}</td>
                        <td className="px-3 py-2">{user.email}</td>
                        <td className="px-3 py-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-2">{user.branch || "-"}</td>
                        <td className="px-3 py-2">
                          {user.isActive ? (user.isVerified ? "Active" : "Pending") : "Deactivated"}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                              onClick={() => setSelectedUser(user)}
                            >
                              View
                            </button>
                            {!user.isVerified && user.isActive && (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                                onClick={() => handleApprove(user._id)}
                              >
                                Approve
                              </button>
                            )}
                            {!user.isVerified && user.isActive && (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                                onClick={() => handleReject(user._id)}
                              >
                                Reject
                              </button>
                            )}
                            {user.isActive && user.isVerified && (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                                onClick={() => handleDeactivate(user._id)}
                              >
                                Deactivate
                              </button>
                            )}
                            {!user.isActive && (
                              <button
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                                onClick={() => handleActivate(user._id)}
                              >
                                Activate
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                onClick={() => setUserPage((p) => Math.max(p - 1, 1))}
                disabled={userPage === 1}
              >
                Prev
              </button>
              <div className="text-sm text-slate-500">
                Page {userPage} of {Math.max(1, Math.ceil(userTotal / 10))}
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
                onClick={() =>
                  setUserPage((p) => (p < Math.ceil(userTotal / 10) ? p + 1 : p))
                }
                disabled={userPage >= Math.ceil(userTotal / 10)}
              >
                Next
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Weekly checklist</h4>
            <ul className="mt-3 list-disc pl-5 text-sm text-slate-600">
              <li>Audit blog quality and tags</li>
              <li>Post new drive notices</li>
              <li>Track chat closures</li>
            </ul>
          </div>
        </div>

        {status.message && (
          <div
            className={`mt-6 rounded-2xl border p-4 text-sm ${
              status.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status.message}
          </div>
        )}

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">Audit logs</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Time</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Actor</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Action</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Target</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-sm text-slate-600" colSpan={5}>
                      No audit logs yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log._id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-3 py-2">{log.actor?.name || "-"}</td>
                      <td className="px-3 py-2">{log.action}</td>
                      <td className="px-3 py-2">{log.targetUser?.name || "-"}</td>
                      <td className="px-3 py-2">{log.metadata?.reason || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() => setAuditPage((p) => Math.max(p - 1, 1))}
              disabled={auditPage === 1}
            >
              Prev
            </button>
            <div className="text-sm text-slate-500">
              Page {auditPage} of {Math.max(1, Math.ceil(auditTotal / 10))}
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() =>
                setAuditPage((p) => (p < Math.ceil(auditTotal / 10) ? p + 1 : p))
              }
              disabled={auditPage >= Math.ceil(auditTotal / 10)}
            >
              Next
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">Rating analytics</h3>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            {ratingAnalytics ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <strong>Average rating:</strong> {ratingAnalytics.avgRating?.toFixed(2) || 0}
                </div>
                <div>
                  <strong>Total ratings:</strong> {ratingAnalytics.ratingCount || 0}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-600">Loading rating analytics...</div>
            )}
          </div>
          {ratingAnalytics?.topMentors?.length ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600">Mentor</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600">Company</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600">Rating</th>
                    <th className="px-3 py-2 text-xs font-semibold text-slate-600">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {ratingAnalytics.topMentors.map((m) => (
                    <tr key={m._id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{m.name}</td>
                      <td className="px-3 py-2">{m.company || "-"}</td>
                      <td className="px-3 py-2">{m.rating?.toFixed(2) || 0}</td>
                      <td className="px-3 py-2">{m.ratingCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No ratings yet.
            </div>
          )}
        </div>

        <div className="mt-10">
          <h3 className="text-lg font-semibold text-slate-900">Reported comments</h3>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_120px_1fr_auto]">
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={reportedBlog}
                onChange={(e) => setReportedBlog(e.target.value)}
              >
                <option value="">Filter by Blog</option>
                {blogs.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.title}
                  </option>
                ))}
              </select>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                type="number"
                placeholder="Min reports"
                value={reportedMin}
                onChange={(e) => setReportedMin(e.target.value)}
              />
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
              >
                <option value="">Assigned to (any)</option>
                {adminUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                type="button"
                onClick={async () => {
                  try {
                    const params = {}
                    if (reportedMin) params.minReports = reportedMin
                    if (reportedBlog) params.blog = reportedBlog
                    if (selectedAdmin) params.assignedTo = selectedAdmin
                    const { data } = await exportReportedComments(params)
                    const url = window.URL.createObjectURL(new Blob([data]))
                    const link = document.createElement("a")
                    link.href = url
                    link.setAttribute("download", "reported-comments.csv")
                    document.body.appendChild(link)
                    link.click()
                    link.remove()
                    addToast({ type: "success", title: "Exported", message: "CSV downloaded." })
                  } catch {
                    addToast({ type: "error", title: "Export failed", message: "Unable to export." })
                  }
                }}
              >
                Export CSV
              </button>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Comment</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Author</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Blog</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Reports</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Assigned</th>
                  <th className="px-3 py-2 text-xs font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportedComments.length === 0 ? (
                  <tr>
                    <td className="px-3 py-3 text-sm text-slate-600" colSpan={5}>
                      No reported comments.
                    </td>
                  </tr>
                ) : (
                  reportedComments.map((c) => (
                    <tr key={c._id} className="border-t border-slate-200">
                      <td className="px-3 py-2">{c.content}</td>
                      <td className="px-3 py-2">{c.author?.name || "-"}</td>
                      <td className="px-3 py-2">{c.blog?.title || "-"}</td>
                      <td className="px-3 py-2">{c.reports?.length || 0}</td>
                      <td className="px-3 py-2">
                        <select
                          className="w-full rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                          value={c.assignedTo?._id || ""}
                          onChange={async (e) => {
                            try {
                              await assignReportedComment(c._id, {
                                assignedTo: e.target.value || null
                              })
                              addToast({
                                type: "success",
                                title: "Assigned",
                                message: "Assigned to admin."
                              })
                              loadReported()
                            } catch {
                              addToast({
                                type: "error",
                                title: "Assign failed",
                                message: "Unable to assign."
                              })
                            }
                          }}
                        >
                          <option value="">Unassigned</option>
                          {adminUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                            onClick={async () => {
                              try {
                                await resolveReportedComment(c._id)
                                addToast({
                                  type: "success",
                                  title: "Resolved",
                                  message: "Report resolved."
                                })
                                loadReported()
                              } catch {
                                addToast({
                                  type: "error",
                                  title: "Resolve failed",
                                  message: "Unable to resolve report."
                                })
                              }
                            }}
                          >
                            Resolve
                          </button>
                          <button
                            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                            onClick={async () => {
                              try {
                                await removeReportedComment(c._id)
                                addToast({
                                  type: "success",
                                  title: "Removed",
                                  message: "Comment removed."
                                })
                                loadReported()
                              } catch {
                                addToast({
                                  type: "error",
                                  title: "Remove failed",
                                  message: "Unable to remove comment."
                                })
                              }
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() => setReportedPage((p) => Math.max(p - 1, 1))}
              disabled={reportedPage === 1}
            >
              Prev
            </button>
            <div className="text-sm text-slate-500">
              Page {reportedPage} of {Math.max(1, Math.ceil(reportedTotal / 10))}
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() =>
                setReportedPage((p) => (p < Math.ceil(reportedTotal / 10) ? p + 1 : p))
              }
              disabled={reportedPage >= Math.ceil(reportedTotal / 10)}
            >
              Next
            </button>
          </div>
        </div>

        {selectedUser && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">User profile</h3>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-700">
              <div className="grid gap-2">
                <p>
                  <strong>Name:</strong> {selectedUser.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedUser.email}
                </p>
                <p>
                  <strong>Role:</strong> {selectedUser.role}
                </p>
              </div>
              <div className="grid gap-2">
                <p>
                  <strong>Branch:</strong> {selectedUser.branch || "-"}
                </p>
                <p>
                  <strong>Year:</strong> {selectedUser.year || "-"}
                </p>
                <p>
                  <strong>Roll Number:</strong> {selectedUser.rollNumber || "-"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {selectedUser.isActive
                    ? selectedUser.isVerified
                      ? "Active"
                      : "Pending"
                    : "Deactivated"}
                </p>
                {selectedUser.rejectionReason && (
                  <p>
                    <strong>Rejection reason:</strong> {selectedUser.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
