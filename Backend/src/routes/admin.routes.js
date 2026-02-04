import { Router } from "express"
import {
    approveUser,
    deactivateUser,
    getAnalytics,
    listPendingUsers,
    rejectUser,
    activateUser,
    listUsers,
    listAuditLogs,
    listReportedComments,
    exportReportedComments,
    assignReportedComment,
    resolveReportedComment,
    removeReportedComment,
    getRatingAnalytics
} from "../controllers/admin.controller.js"
import { validateMiddleware } from "../middlewares/validate.middleware.js"
import { assignSchema } from "../validations/blog.schema.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { ROLES } from "../constants/roles.js"

const router = Router()

router.use(authMiddleware, rbacMiddleware(ROLES.ADMIN))

router.post("/users/:userId/approve", approveUser)
router.post("/users/:userId/deactivate", deactivateUser)
router.post("/users/:userId/reject", rejectUser)
router.post("/users/:userId/activate", activateUser)
router.get("/users/pending", listPendingUsers)
router.get("/users", listUsers)
router.get("/audit-logs", listAuditLogs)
router.get("/reported-comments", listReportedComments)
router.get("/reported-comments/export", exportReportedComments)
router.post(
    "/reported-comments/:commentId/assign",
    validateMiddleware(assignSchema),
    assignReportedComment
)
router.post("/reported-comments/:commentId/resolve", resolveReportedComment)
router.delete("/reported-comments/:commentId/remove", removeReportedComment)
router.get("/analytics", getAnalytics)
router.get("/ratings", getRatingAnalytics)

export default router
