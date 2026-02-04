import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const rbacMiddleware = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, MESSAGES.FORBIDDEN))
        }
        next()
    }
}

export { rbacMiddleware }
