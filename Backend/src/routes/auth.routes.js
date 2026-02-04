import { Router } from "express"
import {
    registerUser,
    loginUser,
    getMe,
    requestEmailOtp,
    verifyEmailOtp
} from "../controllers/auth.controller.js"
import { validateMiddleware } from "../middlewares/validate.middleware.js"
import {
    registerSchema,
    loginSchema,
    requestOtpSchema,
    verifyOtpSchema
} from "../validations/auth.schema.js"
import { authMiddleware } from "../middlewares/auth.middleware.js"

const router = Router()

router.post("/register", validateMiddleware(registerSchema), registerUser)
router.post("/login", validateMiddleware(loginSchema), loginUser)
router.post("/request-otp", validateMiddleware(requestOtpSchema), requestEmailOtp)
router.post("/verify-otp", validateMiddleware(verifyOtpSchema), verifyEmailOtp)
router.get("/me", authMiddleware, getMe)

export default router
