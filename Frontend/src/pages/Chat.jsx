import { useEffect, useRef, useState } from "react"
import {
  listChats,
  listMessages,
  sendMessage,
  markSeen,
  updateMessage,
  deleteMessage,
  approveChat,
  cancelChat
} from "../services/chat.service.js"
import { createSocket } from "../services/socket.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"

const Chat = () => {
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const socketRef = useRef(null)
  const messagesEndRef = useRef(null)
  const { addToast } = useToast()
  const { user } = useAuth()
  const [typingUsers, setTypingUsers] = useState([])

  const token = localStorage.getItem("token")

  useEffect(() => {
    const loadChats = async () => {
      try {
        const { data } = await listChats()
        setChats(data.data || [])
        if ((data.data || []).length > 0) {
          setActiveChat(data.data[0])
        }
      } catch (err) {
        addToast({
          type: "error",
          title: "Chat failed",
          message: err?.response?.data?.message || "Unable to load chats."
        })
      } finally {
        setLoading(false)
      }
    }
    loadChats()
  }, [addToast])

  useEffect(() => {
    if (!token) return
    const socket = createSocket(token)
    socketRef.current = socket

    socket.on("connect_error", () => {
      addToast({ type: "error", title: "Socket error", message: "Realtime connection failed." })
    })

    socket.on("new_message", (message) => {
      if (message.chat === activeChat?._id) {
        setMessages((prev) => [...prev, message])
        socketRef.current?.emit("message_seen", { chatId: activeChat._id })
      }
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === message.chat && chat._id !== activeChat?._id
            ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
            : chat
        )
      )
    })

    socket.on("typing", ({ userId }) => {
      if (userId === user?._id) return
      setTypingUsers((prev) => (prev.includes(userId) ? prev : [...prev, userId]))
    })

    socket.on("stop_typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId))
    })

    socket.on("message_seen", ({ userId }) => {
      if (!activeChat?._id) return
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender?._id === user?._id
            ? {
                ...msg,
                seenBy: msg.seenBy?.some((s) => s.user?._id === userId)
                  ? msg.seenBy
                  : [...(msg.seenBy || []), { user: { _id: userId }, seenAt: new Date() }]
              }
            : msg
        )
      )
    })

    return () => {
      socket.disconnect()
    }
  }, [token, activeChat?._id, addToast])

  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChat?._id) return
      try {
        const { data } = await listMessages(activeChat._id)
        setMessages(data.data || [])
        socketRef.current?.emit("join_chat", { chatId: activeChat._id })
        await markSeen(activeChat._id)
        socketRef.current?.emit("message_seen", { chatId: activeChat._id })
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === activeChat._id ? { ...chat, unreadCount: 0 } : chat
          )
        )
      } catch (err) {
        addToast({
          type: "error",
          title: "Messages failed",
          message: err?.response?.data?.message || "Unable to load messages."
        })
      }
    }
    loadMessages()
  }, [activeChat?._id, addToast])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !activeChat?._id) return
    const payload = { content: input.trim(), attachments: [] }
    setInput("")
    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("send_message", { chatId: activeChat._id, ...payload })
        socketRef.current.emit("stop_typing", { chatId: activeChat._id })
      } else {
        const { data } = await sendMessage(activeChat._id, payload)
        setMessages((prev) => [...prev, data.data])
      }
    } catch (err) {
      addToast({
        type: "error",
        title: "Send failed",
        message: err?.response?.data?.message || "Message could not be sent."
      })
    }
  }

  const handleTyping = (value) => {
    setInput(value)
    if (!activeChat?._id) return
    socketRef.current?.emit("typing", { chatId: activeChat._id })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { chatId: activeChat._id })
    }, 800)
  }

  const typingTimeoutRef = useRef(null)

  const handleEditMessage = async (messageId, currentContent) => {
    const updated = window.prompt("Edit message", currentContent)
    if (!updated || !activeChat?._id) return
    try {
      const { data } = await updateMessage(activeChat._id, messageId, { content: updated })
      setMessages((prev) => prev.map((m) => (m._id === messageId ? data.data : m)))
    } catch (err) {
      addToast({
        type: "error",
        title: "Edit failed",
        message: err?.response?.data?.message || "Message update failed."
      })
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!activeChat?._id) return
    try {
      await deleteMessage(activeChat._id, messageId)
      setMessages((prev) => prev.filter((m) => m._id !== messageId))
    } catch (err) {
      addToast({
        type: "error",
        title: "Delete failed",
        message: err?.response?.data?.message || "Message delete failed."
      })
    }
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-slate-900">Mentorship Chat</h2>
        <p className="mt-2 text-slate-600">
          Request approvals, keep conversations structured, and auto-close after 30 days.
        </p>

        {(user?.role === "mentor" || user?.role === "senior") && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Pending requests</h4>
            {chats.filter((c) => c.status === "pending").length === 0 ? (
              <div className="mt-2 text-sm text-slate-600">No pending chat requests.</div>
            ) : (
              <div className="mt-3 grid gap-3">
                {chats
                  .filter((c) => c.status === "pending")
                  .map((c) => {
                    const requester = c.participants?.find((p) => p._id !== user?._id)
                    return (
                      <div
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        key={c._id}
                      >
                        <strong className="text-slate-900">{requester?.name || "Student"}</strong>
                        <div className="text-xs text-slate-500">Awaiting your approval</div>
                        <button
                          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                          type="button"
                          onClick={async () => {
                            try {
                              await approveChat(c._id)
                              addToast({
                                type: "success",
                                title: "Approved",
                                message: "Chat request approved."
                              })
                              const { data } = await listChats()
                              setChats(data.data || [])
                            } catch (err) {
                              addToast({
                                type: "error",
                                title: "Approve failed",
                                message: err?.response?.data?.message || "Unable to approve."
                              })
                            }
                          }}
                        >
                          Approve
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        {user?.role === "student" && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">My chat requests</h4>
            {chats.filter((c) => c.status === "pending" && String(c.requestedBy?._id || c.requestedBy) === String(user?._id)).length === 0 ? (
              <div className="mt-2 text-sm text-slate-600">No pending requests.</div>
            ) : (
              <div className="mt-3 grid gap-3">
                {chats
                  .filter(
                    (c) =>
                      c.status === "pending" &&
                      String(c.requestedBy?._id || c.requestedBy) === String(user?._id)
                  )
                  .map((c) => {
                    const mentor = c.participants?.find((p) => p._id !== user?._id)
                    return (
                      <div
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        key={c._id}
                      >
                        <strong className="text-slate-900">{mentor?.name || "Mentor"}</strong>
                        <div className="text-xs text-slate-500">
                          Request pending approval
                        </div>
                        {c.pendingExpiresAt && (
                          <div className="text-xs text-slate-500">
                            Expires on {new Date(c.pendingExpiresAt).toLocaleString()}
                          </div>
                        )}
                        <button
                          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                          type="button"
                          onClick={async () => {
                            try {
                              await cancelChat(c._id)
                              addToast({
                                type: "success",
                                title: "Canceled",
                                message: "Chat request canceled."
                              })
                              const { data } = await listChats()
                              setChats(data.data || [])
                            } catch (err) {
                              addToast({
                                type: "error",
                                title: "Cancel failed",
                                message: err?.response?.data?.message || "Unable to cancel."
                              })
                            }
                          }}
                        >
                          Cancel request
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h4 className="text-base font-semibold text-slate-900">Active Chats</h4>
            {loading ? (
              <div className="mt-3 rounded-xl bg-slate-100 p-3 text-sm text-slate-600 animate-pulse">
                Loading chats...
              </div>
            ) : chats.length === 0 ? (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                No chats available.
              </div>
            ) : (
              <div className="mt-3 grid gap-2">
                {chats.map((chat) => {
                const isActive = chat._id === activeChat?._id
                const other = chat.participants?.find((p) => p._id !== user?._id)
                return (
                  <div
                    key={chat._id}
                    className={`rounded-xl border p-3 text-sm transition ${
                      isActive ? "border-blue-200 bg-blue-50" : "border-transparent hover:border-blue-100 hover:bg-blue-50"
                    }`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <strong className="text-slate-900">{other?.name || "Mentor"}</strong>
                    <div className="text-xs text-slate-500">
                      {chat.status}
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="mt-2 w-fit rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        {chat.unreadCount} new
                      </div>
                    )}
                  </div>
                )
              })}
              </div>
            )}
          </div>

          <div className="grid grid-rows-[auto_1fr_auto] rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <strong>{activeChat ? "Conversation" : "Select a chat"}</strong>
                <div className="text-xs text-slate-500">
                  {activeChat?.status || "No active chat"}
                </div>
              </div>
            </div>
            <div className="grid gap-3 overflow-y-auto bg-slate-50 px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    String(message.sender?._id || message.sender) === String(user?._id)
                      ? "ml-auto bg-blue-100 text-slate-900"
                      : "bg-white text-slate-900"
                  }`}
                >
                  {message.content}
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(message.createdAt).toLocaleTimeString()}
                    {String(message.sender?._id || message.sender) === String(user?._id) &&
                      message.seenBy?.some((s) => String(s.user?._id || s.user) !== String(user?._id)) && (
                        <span className="ml-2">Seen</span>
                      )}
                  </div>
                  {String(message.sender?._id || message.sender) === String(user?._id) && (
                    <div className="mt-2 flex gap-2">
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        type="button"
                        onClick={() => handleEditMessage(message._id, message.content)}
                      >
                        Edit
                      </button>
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                        type="button"
                        onClick={() => handleDeleteMessage(message._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {typingUsers.length > 0 && (
                <div className="text-sm text-slate-500">Typing...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2 border-t border-slate-200 px-4 py-3">
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Type a message"
                value={input}
                onChange={(e) => handleTyping(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend()
                }}
              />
              <button
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="button"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
