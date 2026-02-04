import mongoose from "mongoose"

const connectDB = async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) {
        throw new Error("MONGODB_URI is not set")
    }
    mongoose.set("strictQuery", true)
    const conn = await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DB || undefined
    })
    console.log("MongoDb Connections successful")
    return conn.connection
}

export { connectDB }
