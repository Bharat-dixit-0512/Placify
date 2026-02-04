import { Router } from "express"
import {
    createSession,
    listSessions,
    joinSession,
    updateSession,
    deleteSession
} from "../controllers/session.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { ROLES } from "../constants/roles.js"

const router = Router()

router.get("/", listSessions)
router.post("/", authMiddleware, rbacMiddleware(ROLES.MENTOR, ROLES.ADMIN), createSession)
router.post("/:sessionId/join", authMiddleware, joinSession)
router.put("/:sessionId", authMiddleware, rbacMiddleware(ROLES.MENTOR, ROLES.ADMIN), updateSession)
router.delete("/:sessionId", authMiddleware, rbacMiddleware(ROLES.MENTOR, ROLES.ADMIN), deleteSession)

export default router
