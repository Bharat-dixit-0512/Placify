import mongoose from "mongoose"

const auditLogSchema = new mongoose.Schema(
    {
        actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        action: { type: String, required: true },
        targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        metadata: { type: Object }
    },
    { timestamps: true }
)

const AuditLog = mongoose.model("AuditLog", auditLogSchema)

export { AuditLog }
