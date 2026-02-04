import { ApiError } from "../utils/ApiError.js"

const validateMiddleware = (schema) => {
    return (req, _res, next) => {
        const { error, value } = schema.validate(
            { body: req.body, query: req.query, params: req.params },
            { abortEarly: false, stripUnknown: true, allowUnknown: true }
        )
        if (error) {
            return next(new ApiError(400, "Validation error", error.details))
        }
        req.body = value.body || req.body
        req.query = value.query || req.query
        req.params = value.params || req.params
        next()
    }
}

export { validateMiddleware }
