import mongoose from "mongoose"

const attachmentSchema = new mongoose.Schema(
    {
        url: { type: String, required: true },
        name: { type: String },
        type: { type: String }
    },
    { _id: false }
)

const seenBySchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        seenAt: { type: Date, default: Date.now }
    },
    { _id: false }
)

const messageSchema = new mongoose.Schema(
    {
        chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, trim: true },
        attachments: [attachmentSchema],
        seenBy: [seenBySchema]
    },
    { timestamps: true }
)

const Message = mongoose.model("Message", messageSchema)

export { Message }
