import { Chat } from "../models/Chat.model.js"
import { Message } from "../models/Message.model.js"
import { markChatSeen } from "../services/chat.service.js"

const registerChatHandlers = (io, socket) => {
    socket.on("join_chat", async ({ chatId }) => {
        const chat = await Chat.findById(chatId)
        if (!chat) return
        if (!chat.participants.map(String).includes(String(socket.user.id))) return
        socket.join(chatId)
    })

    socket.on("leave_chat", ({ chatId }) => {
        socket.leave(chatId)
    })

    socket.on("send_message", async ({ chatId, content, attachments }) => {
        const chat = await Chat.findById(chatId)
        if (!chat || chat.status !== "active") return
        if (!chat.participants.map(String).includes(String(socket.user.id))) return
        const message = await Message.create({
            chat: chatId,
            sender: socket.user.id,
            content,
            attachments: attachments || [],
            seenBy: [{ user: socket.user.id, seenAt: new Date() }]
        })
        chat.lastMessageAt = new Date()
        chat.lastMessagePreview = (content || "").slice(0, 120)
        await chat.save()
        io.to(chatId).emit("new_message", message)
    })

    socket.on("typing", ({ chatId }) => {
        socket.to(chatId).emit("typing", { chatId, userId: socket.user.id })
    })

    socket.on("stop_typing", ({ chatId }) => {
        socket.to(chatId).emit("stop_typing", { chatId, userId: socket.user.id })
    })

    socket.on("message_seen", async ({ chatId }) => {
        await markChatSeen({ chatId, userId: socket.user.id })
        io.to(chatId).emit("message_seen", { chatId, userId: socket.user.id })
    })
}

export { registerChatHandlers }
