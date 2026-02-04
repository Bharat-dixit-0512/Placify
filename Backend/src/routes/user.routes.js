import { Router } from "express"
import {
    getProfile,
    updateProfile,
    listUsers,
    searchUsers,
    listMentorsAndSeniors,
    getMentorProfile,
    getMentorAvailability,
    updateMentorAvailability,
    rateMentor,
    listMentorReviews,
    changePassword,
    updateEmail,
    uploadAvatar
} from "../controllers/user.controller.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"
import { rbacMiddleware } from "../middlewares/rbac.middleware.js"
import { ROLES } from "../constants/roles.js"
import { validateMiddleware } from "../middlewares/validate.middleware.js"
import { changePasswordSchema, updateEmailSchema } from "../validations/auth.schema.js"
import { upload } from "../middlewares/upload.middleware.js"

const router = Router()

router.get("/me", authMiddleware, getProfile)
router.put("/me", authMiddleware, updateProfile)
router.get("/mentors", authMiddleware, listMentorsAndSeniors)
router.get("/mentors/:userId", authMiddleware, getMentorProfile)
router.get("/mentors/:userId/availability", authMiddleware, getMentorAvailability)
router.put("/mentors/:userId/availability", authMiddleware, updateMentorAvailability)
router.post("/mentors/:userId/rate", authMiddleware, rateMentor)
router.get("/mentors/:userId/reviews", authMiddleware, listMentorReviews)
router.post("/change-password", authMiddleware, validateMiddleware(changePasswordSchema), changePassword)
router.post("/change-email", authMiddleware, validateMiddleware(updateEmailSchema), updateEmail)
router.post("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar)
router.get("/search", authMiddleware, searchUsers)
router.get("/", authMiddleware, rbacMiddleware(ROLES.ADMIN), listUsers)

export default router
