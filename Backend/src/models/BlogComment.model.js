import mongoose from "mongoose"

const reactionSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["like", "heart"], required: true }
    },
    { _id: false }
)

const reportSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, trim: true },
        createdAt: { type: Date, default: Date.now }
    },
    { _id: false }
)

const blogCommentSchema = new mongoose.Schema(
    {
        blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true, trim: true, maxlength: 2000 },
        parent: { type: mongoose.Schema.Types.ObjectId, ref: "BlogComment", default: null },
        mentions: [{ type: String, trim: true }],
        reactions: [reactionSchema],
        reports: [reportSchema],
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
    },
    { timestamps: true }
)

const BlogComment = mongoose.model("BlogComment", blogCommentSchema)

export { BlogComment }
