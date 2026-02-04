import mongoose from "mongoose"

const chatSchema = new mongoose.Schema(
    {
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }],
        requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: {
            type: String,
            enum: ["pending", "active", "closed"],
            default: "pending"
        },
        pendingExpiresAt: { type: Date },
        expiresAt: { type: Date },
        lastMessageAt: { type: Date },
        lastMessagePreview: { type: String, trim: true }
    },
    { timestamps: true }
)

const Chat = mongoose.model("Chat", chatSchema)

export { Chat }
