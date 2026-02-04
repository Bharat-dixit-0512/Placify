import mongoose from "mongoose"

const noticeSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        body: { type: String, required: true },
        tags: [{ type: String, trim: true }],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isPinned: { type: Boolean, default: false },
        visibleToBranches: [{ type: String, trim: true }],
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

const Notice = mongoose.model("Notice", noticeSchema)

export { Notice }
