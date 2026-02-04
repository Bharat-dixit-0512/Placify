import http from "http"
import dotenv from "dotenv"
import { app } from "./src/app.js"
import { connectDB } from "./src/config/db.js"
import { initSocket } from "./src/sockets/socketManager.js"
import { scheduleChatCleanup } from "./src/jobs/cleanupChats.js"

dotenv.config()

const PORT = process.env.PORT || 5000

const startServer = async () => {
    try {
        await connectDB()
        const server = http.createServer(app)
        initSocket(server)
        scheduleChatCleanup()

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    } catch (err) {
        console.error("Failed to start server", err)
        process.exit(1)
    }
}

startServer()
