import { ApiError } from "../utils/ApiError.js"

const errorMiddleware = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500
    const message = err.message || "Internal Server Error"
    const errors = err.errors || []

    if (err instanceof ApiError) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors
        })
    }

    return res.status(statusCode).json({
        success: false,
        message,
        errors
    })
}

export { errorMiddleware }
