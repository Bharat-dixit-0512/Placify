import mongoose from "mongoose"

const sessionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        scheduledAt: { type: Date, required: true },
        durationMins: { type: Number, default: 60 },
        capacity: { type: Number, default: 100 },
        attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" }
    },
    { timestamps: true }
)

const Session = mongoose.model("Session", sessionSchema)

export { Session }
