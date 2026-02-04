import Joi from "joi"

const registerSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(128).required(),
        role: Joi.string().valid("student", "senior", "mentor", "admin").optional(),
        branch: Joi.string().optional(),
        year: Joi.number().integer().min(1).max(6).optional(),
        rollNumber: Joi.string().optional(),
        graduationYear: Joi.number().integer().optional(),
        offerLetterUrl: Joi.string().uri().optional()
    })
})

const loginSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
})

const requestOtpSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required()
    })
})

const verifyOtpSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).required()
    })
})

const changePasswordSchema = Joi.object({
    body: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).max(128).required()
    })
})

const updateEmailSchema = Joi.object({
    body: Joi.object({
        email: Joi.string().email().required()
    })
})

export {
    registerSchema,
    loginSchema,
    requestOtpSchema,
    verifyOtpSchema,
    changePasswordSchema,
    updateEmailSchema
}
