import mongoose from "mongoose"

const blogSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        content: { type: String, required: true },
        tags: [{ type: String, trim: true }],
        company: { type: String, trim: true },
        role: { type: String, trim: true },
        difficulty: { type: String, trim: true, enum: ["easy", "medium", "hard"] },
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isActive: { type: Boolean, default: true },
        verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
)

const Blog = mongoose.model("Blog", blogSchema)

export { Blog }
