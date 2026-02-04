import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import { MESSAGES } from "../constants/messages.js"

const authMiddleware = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization || ""
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null
        if (!token) throw new ApiError(401, MESSAGES.AUTH_REQUIRED)

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.id).lean()
        if (!user || !user.isActive) throw new ApiError(401, MESSAGES.AUTH_REQUIRED)

        req.user = user
        next()
    } catch (err) {
        next(err)
    }
}

export { authMiddleware }
