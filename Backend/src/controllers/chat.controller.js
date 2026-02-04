import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {
    createChatRequest,
    approveChat,
    closeChat,
    listChatsForUser,
    listMessages,
    sendMessage,
    markChatSeen,
    updateMessage,
    deleteMessage,
    cancelChatRequest
} from "../services/chat.service.js"

const requestChat = asyncHandler(async (req, res) => {
    const chat = await createChatRequest({
        studentId: req.user._id,
        seniorId: req.body.seniorId
    })
    return res.status(201).json(new ApiResponse(201, chat, "Chat requested"))
})

const approveChatRequest = asyncHandler(async (req, res) => {
    const chat = await approveChat({
        chatId: req.params.chatId,
        approverId: req.user._id
    })
    return res.status(200).json(new ApiResponse(200, chat, "Chat approved"))
})

const closeChatRequest = asyncHandler(async (req, res) => {
    const chat = await closeChat(req.params.chatId)
    return res.status(200).json(new ApiResponse(200, chat, "Chat closed"))
})

const cancelChat = asyncHandler(async (req, res) => {
    const chat = await cancelChatRequest({ chatId: req.params.chatId, userId: req.user._id })
    return res.status(200).json(new ApiResponse(200, chat, "Chat request canceled"))
})

const listChats = asyncHandler(async (req, res) => {
    const chats = await listChatsForUser(req.user._id)
    return res.status(200).json(new ApiResponse(200, chats, "Chats"))
})

const listChatMessages = asyncHandler(async (req, res) => {
    const messages = await listMessages(req.params.chatId)
    return res.status(200).json(new ApiResponse(200, messages, "Messages"))
})

const sendChatMessage = asyncHandler(async (req, res) => {
    const message = await sendMessage({
        chatId: req.params.chatId,
        senderId: req.user._id,
        content: req.body.content,
        attachments: req.body.attachments
    })
    return res.status(201).json(new ApiResponse(201, message, "Message sent"))
})

const markChatSeenController = asyncHandler(async (req, res) => {
    await markChatSeen({ chatId: req.params.chatId, userId: req.user._id })
    return res.status(200).json(new ApiResponse(200, true, "Chat seen"))
})

const updateChatMessage = asyncHandler(async (req, res) => {
    const message = await updateMessage({
        chatId: req.params.chatId,
        messageId: req.params.messageId,
        userId: req.user._id,
        role: req.user.role,
        content: req.body.content
    })
    return res.status(200).json(new ApiResponse(200, message, "Message updated"))
})

const deleteChatMessage = asyncHandler(async (req, res) => {
    await deleteMessage({
        chatId: req.params.chatId,
        messageId: req.params.messageId,
        userId: req.user._id,
        role: req.user.role
    })
    return res.status(200).json(new ApiResponse(200, true, "Message deleted"))
})

export {
    requestChat,
    approveChatRequest,
    closeChatRequest,
    cancelChat,
    listChats,
    listChatMessages,
    sendChatMessage,
    markChatSeenController,
    updateChatMessage,
    deleteChatMessage
}
