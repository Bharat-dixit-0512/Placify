import { createSocketServer } from "../config/socket.js"

let ioInstance = null

const initSocket = (httpServer) => {
    ioInstance = createSocketServer(httpServer)
    return ioInstance
}

const getSocket = () => {
    if (!ioInstance) {
        throw new Error("Socket not initialized")
    }
    return ioInstance
}

export { initSocket, getSocket }
