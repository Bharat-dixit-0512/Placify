import Joi from "joi"

const createChatSchema = Joi.object({
    body: Joi.object({
        seniorId: Joi.string().required()
    })
})

const approveChatSchema = Joi.object({
    params: Joi.object({
        chatId: Joi.string().required()
    })
})

const sendMessageSchema = Joi.object({
    params: Joi.object({
        chatId: Joi.string().required()
    }),
    body: Joi.object({
        content: Joi.string().allow("").optional(),
        attachments: Joi.array()
            .items(
                Joi.object({
                    url: Joi.string().required(),
                    name: Joi.string().optional(),
                    type: Joi.string().optional()
                })
            )
            .default([])
    })
})

const updateMessageSchema = Joi.object({
    params: Joi.object({
        chatId: Joi.string().required(),
        messageId: Joi.string().required()
    }),
    body: Joi.object({
        content: Joi.string().min(1).required()
    })
})

export { createChatSchema, approveChatSchema, sendMessageSchema, updateMessageSchema }
