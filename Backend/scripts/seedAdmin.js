import dotenv from "dotenv"
import { connectDB } from "../src/config/db.js"
import { User } from "../src/models/User.model.js"
import { ROLES } from "../src/constants/roles.js"

dotenv.config()

const seedAdmin = async () => {
    await connectDB()

    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const name = process.env.ADMIN_NAME || "T&P Admin"

    if (!email || !password) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set")
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
        existing.name = name
        existing.role = ROLES.ADMIN
        existing.isVerified = true
        existing.emailVerified = true
        existing.isActive = true
        existing.password = password
        await existing.save()
        console.log("Admin user updated")
    } else {
        await User.create({
            name,
            email,
            password,
            role: ROLES.ADMIN,
            isVerified: true,
            emailVerified: true,
            isActive: true
        })
        console.log("Admin user created")
    }

    process.exit(0)
}

seedAdmin().catch((err) => {
    console.error("Failed to seed admin:", err)
    process.exit(1)
})
