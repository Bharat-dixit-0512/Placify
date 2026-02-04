import Joi from "joi"

const createBlogSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().min(3).max(200).required(),
        content: Joi.string().min(10).required(),
        tags: Joi.array().items(Joi.string()).default([]),
        company: Joi.string().optional(),
        role: Joi.string().optional(),
        difficulty: Joi.string().valid("easy", "medium", "hard").optional()
    })
})

const updateBlogSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().min(3).max(200).optional(),
        content: Joi.string().min(10).optional(),
        tags: Joi.array().items(Joi.string()).optional(),
        company: Joi.string().optional(),
        role: Joi.string().optional(),
        difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
        isActive: Joi.boolean().optional()
    })
})

const listBlogSchema = Joi.object({
    query: Joi.object({
        company: Joi.string().optional(),
        role: Joi.string().optional(),
        difficulty: Joi.string().valid("easy", "medium", "hard").optional(),
        tag: Joi.string().optional(),
        author: Joi.string().optional(),
        search: Joi.string().optional()
    })
})

const commentSchema = Joi.object({
    body: Joi.object({
        content: Joi.string().min(1).max(2000).required(),
        parent: Joi.string().optional().allow(null),
        mentions: Joi.array().items(Joi.string()).optional()
    })
})

const reactionSchema = Joi.object({
    body: Joi.object({
        type: Joi.string().valid("like", "heart").required()
    })
})

const reportSchema = Joi.object({
    body: Joi.object({
        reason: Joi.string().max(500).optional()
    })
})

const assignSchema = Joi.object({
    body: Joi.object({
        assignedTo: Joi.string().allow(null).optional()
    })
})

export { createBlogSchema, updateBlogSchema, listBlogSchema, commentSchema, reactionSchema, reportSchema, assignSchema }
