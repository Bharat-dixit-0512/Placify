import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js"
import { register, login, requestOtp, verifyOtp } from "../services/auth.service.js"
import { sendEmail } from "../services/email.service.js"

const registerUser = asyncHandler(async (req, res) => {
    const result = await register(req.body)
    return res.status(201).json(new ApiResponse(201, result, "Registered"))
})

const loginUser = asyncHandler(async (req, res) => {
    const result = await login(req.body)
    return res.status(200).json(new ApiResponse(200, result, "Logged in"))
})

const requestEmailOtp = asyncHandler(async (req, res) => {
    const result = await requestOtp(req.body.email)
    console.log("OTP (console mode):", { email: result.email, otp: result.otpCode })
    return res.status(200).json(new ApiResponse(200, { email: result.email }, "OTP sent"))
})

const verifyEmailOtp = asyncHandler(async (req, res) => {
    const user = await verifyOtp({ email: req.body.email, otp: req.body.otp })
    return res.status(200).json(new ApiResponse(200, user, "Email verified"))
})

const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "Profile"))
})

export { registerUser, loginUser, getMe, requestEmailOtp, verifyEmailOtp }
