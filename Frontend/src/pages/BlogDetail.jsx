import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  getBlog,
  listComments,
  addComment,
  deleteComment,
  listReplies,
  updateComment,
  reactToComment,
  reportComment
} from "../services/blog.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"
import { searchUsers } from "../services/user.service.js"

const BlogDetail = () => {
  const { blogId } = useParams()
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [replyTo, setReplyTo] = useState(null)
  const [replyPage, setReplyPage] = useState({})
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionSuggestions, setMentionSuggestions] = useState([])
  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const [blogResp, commentsResp] = await Promise.all([
          getBlog(blogId),
          listComments(blogId, { page, limit: 5, replyLimit: 2 })
        ])
        const { data } = blogResp
        setBlog(data.data)
        setComments(commentsResp.data.data?.items || [])
        setTotal(commentsResp.data.data?.meta?.total || 0)
      } catch (err) {
        addToast({
          type: "error",
          title: "Blog failed",
          message: err?.response?.data?.message || "Unable to load blog."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [blogId, addToast, page])

  useEffect(() => {
    if (!mentionQuery) {
      setMentionSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await searchUsers({ query: mentionQuery })
        setMentionSuggestions(data.data || [])
      } catch {
        setMentionSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [mentionQuery])

  const totalPages = Math.max(1, Math.ceil(total / 5))

  if (loading) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Blog not found.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
            to="/blogs"
          >
            Back to Blogs
          </Link>
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href)
                addToast({ type: "success", title: "Link copied", message: "Blog link copied." })
              } catch {
                addToast({ type: "error", title: "Copy failed", message: "Unable to copy link." })
              }
            }}
          >
            Copy link
          </button>
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
            href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`}
            target="_blank"
            rel="noreferrer"
          >
            Share WhatsApp
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              window.location.href
            )}`}
            target="_blank"
            rel="noreferrer"
          >
            Share LinkedIn
          </a>
        </div>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
          <h2 className="mt-3 text-2xl font-bold text-slate-900">{blog.title}</h2>
          <p className="mt-2 text-sm text-slate-500">
            by {blog.author?.name || "Unknown"} -{" "}
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>
          <div className="mt-4 leading-7 text-slate-700">
            {blog.content.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, idx) =>
              part.startsWith("@") ? (
                <span
                  key={idx}
                  className="mr-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
                >
                  {part}
                </span>
              ) : (
                <span key={idx}>{part}</span>
              )
            )}
          </div>
        </div>

          <div className="mt-10">
            <h3 className="text-xl font-semibold text-slate-900">Comments</h3>
          {user ? (
            <form
              className="mt-4 grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!commentText.trim()) return
                try {
                  const payload = { content: commentText.trim() }
                  const mentions = Array.from(commentText.matchAll(/@([a-zA-Z0-9_.-]+)/g)).map(
                    (m) => m[1]
                  )
                  if (mentions.length) payload.mentions = mentions
                  if (replyTo) payload.parent = replyTo
                  const { data } = await addComment(blogId, payload)
                  if (replyTo) {
                    setComments((prev) =>
                      prev.map((c) =>
                        c._id === replyTo
                          ? { ...c, replies: [data.data, ...(c.replies || [])] }
                          : c
                      )
                    )
                  } else {
                    setComments((prev) => [data.data, ...prev])
                  }
                  setCommentText("")
                  setReplyTo(null)
                  addToast({ type: "success", title: "Comment added", message: "Thanks for sharing." })
                } catch (err) {
                  addToast({
                    type: "error",
                    title: "Comment failed",
                    message: err?.response?.data?.message || "Unable to add comment."
                  })
                }
              }}
            >
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={replyTo ? "Write a reply" : "Write your comment"}
                value={commentText}
                onChange={(e) => {
                  const text = e.target.value
                  setCommentText(text)
                  const match = text.match(/@([a-zA-Z0-9_.-]{1,20})$/)
                  setMentionQuery(match ? match[1] : "")
                }}
                required
              />
              {mentionSuggestions.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  {mentionSuggestions.map((u) => (
                    <div
                      key={u._id}
                      className="cursor-pointer rounded-xl border border-transparent p-2 transition hover:border-blue-200 hover:bg-blue-50"
                      onClick={() => {
                        const updated = commentText.replace(
                          /@([a-zA-Z0-9_.-]{1,20})$/,
                          `@${u.name} `
                        )
                        setCommentText(updated)
                        setMentionQuery("")
                        setMentionSuggestions([])
                      }}
                    >
                      <strong className="text-sm text-slate-900">{u.name}</strong>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </div>
                  ))}
                </div>
              )}
              {replyTo && (
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                  type="button"
                  onClick={() => setReplyTo(null)}
                >
                  Cancel reply
                </button>
              )}
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="submit"
              >
                Post comment
              </button>
            </form>
            ) : (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                Login to post a comment.
              </div>
            )}

          <div className="mt-6 grid gap-4">
            {comments.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                No comments yet.
              </div>
            ) : (
              comments.map((comment) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  key={comment._id}
                >
                  <strong className="text-slate-900">{comment.author?.name || "User"}</strong>
                  <div className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                  <p className="mt-2 text-sm text-slate-700">
                    {comment.content.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, idx) =>
                      part.startsWith("@") ? (
                        <span
                          key={idx}
                          className="mr-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
                        >
                          {part}
                        </span>
                      ) : (
                        <span key={idx}>{part}</span>
                      )
                    )}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      type="button"
                      onClick={() => setReplyTo(comment._id)}
                    >
                      Reply
                    </button>
                    {(user?.role === "admin" ||
                      String(comment.author?._id) === String(user?._id)) && (
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        type="button"
                        onClick={async () => {
                          const updated = window.prompt("Edit comment", comment.content)
                          if (!updated) return
                          try {
                            const mentions = Array.from(
                              updated.matchAll(/@([a-zA-Z0-9_.-]+)/g)
                            ).map((m) => m[1])
                            const { data } = await updateComment(blogId, comment._id, {
                              content: updated,
                              mentions
                            })
                            setComments((prev) =>
                              prev.map((c) => (c._id === comment._id ? data.data : c))
                            )
                            addToast({
                              type: "success",
                              title: "Comment updated",
                              message: "Comment updated."
                            })
                          } catch (err) {
                            addToast({
                              type: "error",
                              title: "Update failed",
                              message: err?.response?.data?.message || "Unable to update comment."
                            })
                          }
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {(user?.role === "admin" ||
                      String(comment.author?._id) === String(user?._id)) && (
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={async () => {
                          try {
                            await deleteComment(blogId, comment._id)
                            setComments((prev) => prev.filter((c) => c._id !== comment._id))
                            addToast({
                              type: "success",
                              title: "Comment deleted",
                              message: "Comment removed."
                            })
                          } catch (err) {
                            addToast({
                              type: "error",
                              title: "Delete failed",
                              message: err?.response?.data?.message || "Unable to delete comment."
                            })
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      type="button"
                      onClick={async () => {
                        try {
                          const { data } = await reactToComment(blogId, comment._id, { type: "like" })
                          setComments((prev) =>
                            prev.map((c) => (c._id === comment._id ? data.data : c))
                          )
                        } catch (err) {
                          addToast({
                            type: "error",
                            title: "Reaction failed",
                            message: err?.response?.data?.message || "Unable to react."
                          })
                        }
                      }}
                    >
                      Like ({comment.reactions?.filter((r) => r.type === "like").length || 0})
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      type="button"
                      onClick={async () => {
                        try {
                          const { data } = await reactToComment(blogId, comment._id, { type: "heart" })
                          setComments((prev) =>
                            prev.map((c) => (c._id === comment._id ? data.data : c))
                          )
                        } catch (err) {
                          addToast({
                            type: "error",
                            title: "Reaction failed",
                            message: err?.response?.data?.message || "Unable to react."
                          })
                        }
                      }}
                    >
                      Heart ({comment.reactions?.filter((r) => r.type === "heart").length || 0})
                    </button>
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      type="button"
                      onClick={async () => {
                        const reason = window.prompt("Report reason (optional)")
                        try {
                          await reportComment(blogId, comment._id, { reason })
                          addToast({
                            type: "success",
                            title: "Reported",
                            message: "Report submitted."
                          })
                        } catch (err) {
                          addToast({
                            type: "error",
                            title: "Report failed",
                            message: err?.response?.data?.message || "Unable to report."
                          })
                        }
                      }}
                    >
                      Report
                    </button>
                  </div>
                  {(comment.replies || []).length > 0 && (
                    <div className="mt-3 grid gap-3">
                      {comment.replies.map((reply) => (
                        <div
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                          key={reply._id}
                        >
                          <strong className="text-slate-900">{reply.author?.name || "User"}</strong>
                          <div className="text-xs text-slate-500">
                            {new Date(reply.createdAt).toLocaleString()}
                          </div>
                          <p className="mt-2 text-sm text-slate-700">
                            {reply.content.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, idx) =>
                              part.startsWith("@") ? (
                                <span
                                  key={idx}
                                  className="mr-1 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700"
                                >
                                  {part}
                                </span>
                              ) : (
                                <span key={idx}>{part}</span>
                              )
                            )}
                          </p>
                          {reply.reactions && reply.reactions.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {reply.reactions.slice(0, 4).map((r, idx) => (
                                <span
                                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                                  key={`${reply._id}-r-${idx}`}
                                >
                                  {r.user?.name?.slice(0, 1) || "U"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {comment.replyCount > (comment.replies || []).length && (
                    <button
                      className="mt-2 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                      type="button"
                      onClick={async () => {
                        const nextPage = (replyPage[comment._id] || 1) + 1
                        try {
                          const { data } = await listReplies(blogId, comment._id, {
                            page: nextPage,
                            limit: 2
                          })
                          const newReplies = data.data?.items || []
                          setComments((prev) =>
                            prev.map((c) =>
                              c._id === comment._id
                                ? { ...c, replies: [...(c.replies || []), ...newReplies] }
                                : c
                            )
                          )
                          setReplyPage((p) => ({ ...p, [comment._id]: nextPage }))
                        } catch (err) {
                          addToast({
                            type: "error",
                            title: "Load replies failed",
                            message: err?.response?.data?.message || "Unable to load replies."
                          })
                        }
                      }}
                    >
                      Load more replies
                    </button>
                  )}
                  {comment.reactions && comment.reactions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {comment.reactions.slice(0, 6).map((r, idx) => (
                        <span
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                          key={`${comment._id}-avatar-${idx}`}
                        >
                          {r.user?.name?.slice(0, 1) || "U"}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
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
    </div>
  )
}

export default BlogDetail
