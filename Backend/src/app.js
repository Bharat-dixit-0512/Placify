import express from "express"
import cors from "cors"
import { loggerMiddleware } from "./config/logger.js"
import routes from "./routes/index.js"
import { errorMiddleware } from "./middlewares/error.middleware.js"

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }))
app.use(express.json({ limit: "2mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(loggerMiddleware)

app.use("/uploads", express.static("public/uploads"))

app.get("/", (_req, res) => {
    res.json({ status: "ok", name: "Placify API" })
})

app.use("/api", routes)

app.use(errorMiddleware)

export { app }
