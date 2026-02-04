import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import { MESSAGES } from "../constants/messages.js"
import { ROLES } from "../constants/roles.js"

const createToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    )
}

const register = async (payload) => {
    const existing = await User.findOne({ email: payload.email.toLowerCase() })
    if (existing) {
        throw new ApiError(409, "Email already in use")
    }
    if (payload.role === ROLES.ADMIN) {
        throw new ApiError(403, "Admin accounts cannot be self-registered")
    }
    const role = payload.role || ROLES.STUDENT
    const user = await User.create({
        ...payload,
        role,
        isVerified: false,
        emailVerified: false
    })
    const token = createToken(user)
    return { user, token }
}

const login = async ({ email, password }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")
    if (!user) {
        throw new ApiError(401, MESSAGES.INVALID_CREDENTIALS)
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
        throw new ApiError(401, MESSAGES.INVALID_CREDENTIALS)
    }
    if (!user.isActive) {
        throw new ApiError(403, "User is deactivated")
    }
    if (!user.emailVerified) {
        throw new ApiError(403, "Email verification required")
    }
    if (!user.isVerified) {
        throw new ApiError(403, "Account pending verification")
    }
    const token = createToken(user)
    return { user, token }
}

const requestOtp = async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select(
        "+otpCode +otpExpiresAt +otpLastSentAt +otpSendCount +otpWindowStart"
    )
    if (!user) throw new ApiError(404, "User not found")
    const now = new Date()
    const cooldownMs = 60 * 1000
    const windowMs = 60 * 60 * 1000

    if (user.otpLastSentAt && now - user.otpLastSentAt < cooldownMs) {
        throw new ApiError(429, "Please wait before requesting another OTP")
    }

    if (!user.otpWindowStart || now - user.otpWindowStart > windowMs) {
        user.otpWindowStart = now
        user.otpSendCount = 0
    }

    if (user.otpSendCount >= 5) {
        throw new ApiError(429, "Too many OTP requests. Please try again later")
    }

    const otpCode = String(Math.floor(100000 + Math.random() * 900000))
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
    user.otpCode = otpCode
    user.otpExpiresAt = otpExpiresAt
    user.otpLastSentAt = now
    user.otpSendCount += 1
    await user.save()
    return { email: user.email, otpCode }
}

const verifyOtp = async ({ email, otp }) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+otpCode +otpExpiresAt")
    if (!user) throw new ApiError(404, "User not found")
    if (!user.otpCode || !user.otpExpiresAt) {
        throw new ApiError(400, "OTP not requested")
    }
    if (user.otpExpiresAt < new Date()) {
        throw new ApiError(400, "OTP expired")
    }
    if (user.otpCode !== otp) {
        throw new ApiError(400, "Invalid OTP")
    }
    user.emailVerified = true
    user.otpCode = undefined
    user.otpExpiresAt = undefined
    user.otpLastSentAt = undefined
    await user.save()
    return user
}

export { register, login, createToken, requestOtp, verifyOtp }
