import cron from "node-cron"
import { Chat } from "../models/Chat.model.js"

const scheduleChatCleanup = () => {
    cron.schedule("0 */6 * * *", async () => {
        const now = new Date()
        await Chat.updateMany(
            { status: "active", expiresAt: { $lt: now } },
            { status: "closed" }
        )
        await Chat.updateMany(
            { status: "pending", pendingExpiresAt: { $lt: now } },
            { status: "closed" }
        )
    })
}

export { scheduleChatCleanup }
