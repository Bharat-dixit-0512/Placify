import { Server } from "socket.io"
import jwt from "jsonwebtoken"
import { registerChatHandlers } from "../sockets/chat.handler.js"

const createSocketServer = (httpServer) => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || "*",
            methods: ["GET", "POST"]
        }
    })

    io.use((socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace("Bearer ", "")
        if (!token) {
            return next(new Error("Unauthorized"))
        }
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET)
            socket.user = payload
            return next()
        } catch (err) {
            return next(new Error("Unauthorized"))
        }
    })

    io.on("connection", (socket) => {
        registerChatHandlers(io, socket)
    })

    return io
}

export { createSocketServer }
