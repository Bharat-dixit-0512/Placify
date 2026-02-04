import { Router } from "express"
import authRoutes from "./auth.routes.js"
import userRoutes from "./user.routes.js"
import blogRoutes from "./blog.routes.js"
import chatRoutes from "./chat.routes.js"
import adminRoutes from "./admin.routes.js"
import noticeRoutes from "./notice.routes.js"
import sessionRoutes from "./session.routes.js"
import publicRoutes from "./public.routes.js"

const router = Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/blogs", blogRoutes)
router.use("/chats", chatRoutes)
router.use("/admin", adminRoutes)
router.use("/notices", noticeRoutes)
router.use("/sessions", sessionRoutes)
router.use("/public", publicRoutes)

export default router
