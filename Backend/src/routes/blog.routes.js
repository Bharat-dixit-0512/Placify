import { Router } from "express"
import {
    createBlogPost,
    listBlogPosts,
    getBlogPost,
    updateBlogPost,
    deleteBlogPost,
    listBlogComments,
    addBlogComment,
    deleteBlogComment,
    listCommentReplies,
    updateBlogComment,
    reactToComment,
    reportComment
} from "../controllers/blog.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { validateMiddleware } from "../middlewares/validate.middleware.js"
import {
    createBlogSchema,
    updateBlogSchema,
    listBlogSchema,
    commentSchema,
    reactionSchema,
    reportSchema
} from "../validations/blog.schema.js"
import { ROLES } from "../constants/roles.js"

const router = Router()

router.get("/", validateMiddleware(listBlogSchema), listBlogPosts)
router.get("/:blogId", getBlogPost)
router.get("/:blogId/comments", listBlogComments)
router.get("/:blogId/comments/:commentId/replies", listCommentReplies)

router.post(
    "/",
    authMiddleware,
    rbacMiddleware(ROLES.SENIOR, ROLES.ADMIN),
    validateMiddleware(createBlogSchema),
    createBlogPost
)

router.post(
    "/:blogId/comments",
    authMiddleware,
    validateMiddleware(commentSchema),
    addBlogComment
)
router.put(
    "/:blogId/comments/:commentId",
    authMiddleware,
    validateMiddleware(commentSchema),
    updateBlogComment
)
router.post(
    "/:blogId/comments/:commentId/react",
    authMiddleware,
    validateMiddleware(reactionSchema),
    reactToComment
)
router.post(
    "/:blogId/comments/:commentId/report",
    authMiddleware,
    validateMiddleware(reportSchema),
    reportComment
)

router.put(
    "/:blogId",
    authMiddleware,
    rbacMiddleware(ROLES.SENIOR, ROLES.ADMIN),
    validateMiddleware(updateBlogSchema),
    updateBlogPost
)

router.delete(
    "/:blogId",
    authMiddleware,
    rbacMiddleware(ROLES.ADMIN),
    deleteBlogPost
)

router.delete(
    "/:blogId/comments/:commentId",
    authMiddleware,
    deleteBlogComment
)

export default router
