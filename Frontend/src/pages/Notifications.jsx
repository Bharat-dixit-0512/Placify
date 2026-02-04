import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"
import { listChats } from "../services/chat.service.js"
import { listSessions } from "../services/session.service.js"
import { listBlogs } from "../services/blog.service.js"
import { useToast } from "../context/ToastContext.jsx"
import EmptyState from "../components/EmptyState.jsx"

const Notifications = () => {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [chatResp, sessionsResp, blogsResp] = await Promise.all([
          listChats(),
          listSessions({ page: 1, limit: 5 }),
          listBlogs({ page: 1, limit: 5 })
        ])

        const notifications = []
        if (user && !user.emailVerified) {
          notifications.push({
            title: "Verify your email",
            body: "Verify your email to unlock login and platform access.",
            type: "action"
          })
        }
        if (user && !user.isVerified) {
          notifications.push({
            title: "Approval pending",
            body: "Your account is awaiting T&P approval.",
            type: "status"
          })
        }

        const chats = chatResp.data.data || []
        const pending = chats.filter((c) => c.status === "pending")
        pending.forEach((chat) => {
          const other = chat.participants?.find((p) => p._id !== user?._id)
          notifications.push({
            title: "Chat request pending",
            body: `Pending with ${other?.name || "mentor"}`,
            type: "chat"
          })
        })

        const sessions = sessionsResp.data.data?.items || []
        sessions.slice(0, 3).forEach((s) => {
          notifications.push({
            title: "Upcoming session",
            body: `${s.title} on ${new Date(s.scheduledAt).toLocaleString()}`,
            type: "session"
          })
        })

        const blogs = blogsResp.data.data?.items || []
        blogs.slice(0, 3).forEach((b) => {
          notifications.push({
            title: "New interview story",
            body: b.title,
            type: "blog"
          })
        })

        setItems(notifications)
      } catch (err) {
        addToast({
          type: "error",
          title: "Notifications failed",
          message: err?.response?.data?.message || "Unable to load notifications."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [addToast, user])

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-3xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
        <p className="mt-2 text-slate-600">Stay updated on approvals, chats, and new content.</p>

        {loading ? (
          <div className="mt-6 grid gap-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" key={idx} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No new notifications"
            description="Check back later for approvals, chat updates, and new content."
          />
        ) : (
          <div className="mt-6 grid gap-4">
            {items.map((n, idx) => (
              <div
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={`${n.title}-${idx}`}
              >
                <strong className="text-slate-900">{n.title}</strong>
                <div className="mt-2 text-sm text-slate-600">{n.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
