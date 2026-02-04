import { Router } from "express"
import {
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
} from "../controllers/chat.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { validateMiddleware } from "../middlewares/validate.middleware.js"
import {
    createChatSchema,
    approveChatSchema,
    sendMessageSchema,
    updateMessageSchema
} from "../validations/chat.schema.js"
import { ROLES } from "../constants/roles.js"

const router = Router()

router.use(authMiddleware)

router.post("/", validateMiddleware(createChatSchema), requestChat)
router.get("/", listChats)
router.post(
    "/:chatId/approve",
    rbacMiddleware(ROLES.SENIOR, ROLES.MENTOR, ROLES.ADMIN),
    validateMiddleware(approveChatSchema),
    approveChatRequest
)
router.post("/:chatId/close", rbacMiddleware(ROLES.ADMIN), closeChatRequest)
router.post("/:chatId/cancel", cancelChat)
router.get("/:chatId/messages", listChatMessages)
router.post("/:chatId/messages", validateMiddleware(sendMessageSchema), sendChatMessage)
router.post("/:chatId/seen", markChatSeenController)
router.put("/:chatId/messages/:messageId", validateMiddleware(updateMessageSchema), updateChatMessage)
router.delete("/:chatId/messages/:messageId", deleteChatMessage)

export default router
