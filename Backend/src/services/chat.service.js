import { Chat } from "../models/Chat.model.js"
import { Message } from "../models/Message.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const createChatRequest = async ({ studentId, seniorId }) => {
    const existing = await Chat.findOne({
        participants: { $all: [studentId, seniorId] },
        status: { $in: ["pending", "active"] }
    })
    if (existing) {
        return existing
    }
    const pendingExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    return Chat.create({
        participants: [studentId, seniorId],
        requestedBy: studentId,
        pendingExpiresAt
    })
}

const approveChat = async ({ chatId, approverId }) => {
    const chat = await Chat.findById(chatId)
    if (!chat) throw new ApiError(404, MESSAGES.NOT_FOUND)

    if (chat.status !== "pending") {
        throw new ApiError(400, "Chat is not pending")
    }

    if (!chat.participants.map(String).includes(String(approverId))) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }

    if (String(chat.requestedBy) === String(approverId)) {
        throw new ApiError(403, "Requester cannot approve the chat")
    }

    chat.status = "active"
    chat.approvedBy = approverId
    chat.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    await chat.save()
    return chat
}

const closeChat = async (chatId) => {
    const chat = await Chat.findByIdAndUpdate(chatId, { status: "closed" }, { new: true })
    if (!chat) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return chat
}

const cancelChatRequest = async ({ chatId, userId }) => {
    const chat = await Chat.findById(chatId)
    if (!chat) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (chat.status !== "pending") throw new ApiError(400, "Only pending requests can be canceled")
    if (String(chat.requestedBy) !== String(userId)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    chat.status = "closed"
    await chat.save()
    return chat
}

const listChatsForUser = async (userId) => {
    const chats = await Chat.find({ participants: userId })
        .populate("participants", "name email role")
        .populate("requestedBy", "name email role")
        .sort({ updatedAt: -1 })

    const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
            const unreadCount = await Message.countDocuments({
                chat: chat._id,
                sender: { $ne: userId },
                seenBy: { $not: { $elemMatch: { user: userId } } }
            })
            return { ...chat.toObject(), unreadCount }
        })
    )
    return chatsWithUnread
}

const listMessages = async (chatId) => {
    return Message.find({ chat: chatId })
        .populate("sender", "name email")
        .populate("seenBy.user", "name email")
        .sort({ createdAt: 1 })
}

const sendMessage = async ({ chatId, senderId, content, attachments }) => {
    const chat = await Chat.findById(chatId)
    if (!chat) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (chat.status !== "active") throw new ApiError(400, "Chat is not active")
    const message = await Message.create({
        chat: chatId,
        sender: senderId,
        content,
        attachments,
        seenBy: [{ user: senderId, seenAt: new Date() }]
    })
    chat.lastMessageAt = new Date()
    chat.lastMessagePreview = (content || "").slice(0, 120)
    await chat.save()
    return message
}

const markChatSeen = async ({ chatId, userId }) => {
    await Message.updateMany(
        {
            chat: chatId,
            sender: { $ne: userId },
            seenBy: { $not: { $elemMatch: { user: userId } } }
        },
        { $push: { seenBy: { user: userId, seenAt: new Date() } } }
    )
    return true
}

const updateMessage = async ({ chatId, messageId, userId, role, content }) => {
    const message = await Message.findOne({ _id: messageId, chat: chatId })
    if (!message) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (role !== "admin" && String(message.sender) !== String(userId)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    message.content = content
    await message.save()
    return message
}

const deleteMessage = async ({ chatId, messageId, userId, role }) => {
    const message = await Message.findOne({ _id: messageId, chat: chatId })
    if (!message) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (role !== "admin" && String(message.sender) !== String(userId)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    await Message.deleteOne({ _id: messageId })
    return true
}

export {
    createChatRequest,
    approveChat,
    closeChat,
    cancelChatRequest,
    listChatsForUser,
    listMessages,
    sendMessage,
    markChatSeen,
    updateMessage,
    deleteMessage
}
