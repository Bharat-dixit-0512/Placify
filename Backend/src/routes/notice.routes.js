import { Router } from "express"
import { createNotice, listNotices, updateNotice, deleteNotice } from "../controllers/notice.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { ROLES } from "../constants/roles.js"

const router = Router()

router.get("/", listNotices)
router.post("/", authMiddleware, rbacMiddleware(ROLES.ADMIN), createNotice)
router.put("/:noticeId", authMiddleware, rbacMiddleware(ROLES.ADMIN), updateNotice)
router.delete("/:noticeId", authMiddleware, rbacMiddleware(ROLES.ADMIN), deleteNotice)

export default router
