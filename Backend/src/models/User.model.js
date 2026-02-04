import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import { ROLES, ROLE_LIST } from "../constants/roles.js"

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, index: true },
        password: { type: String, required: true, select: false },
        role: { type: String, enum: ROLE_LIST, default: ROLES.STUDENT },
        branch: { type: String, trim: true },
        year: { type: Number, min: 1, max: 6 },
        rollNumber: { type: String, trim: true },
        graduationYear: { type: Number },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        emailVerified: { type: Boolean, default: false },
        otpCode: { type: String, select: false },
        otpExpiresAt: { type: Date, select: false },
        otpLastSentAt: { type: Date, select: false },
        otpSendCount: { type: Number, default: 0, select: false },
        otpWindowStart: { type: Date, select: false },
        offerLetterUrl: { type: String, trim: true },
        rejectionReason: { type: String, trim: true },
        rejectedAt: { type: Date },
        rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        bio: { type: String, trim: true, maxlength: 1000 },
        avatarUrl: { type: String, trim: true },
        company: { type: String, trim: true },
        designation: { type: String, trim: true },
        expertiseTags: [{ type: String, trim: true }],
        experienceYears: { type: Number, min: 0, max: 50, default: 0 },
        rating: { type: Number, min: 0, max: 5, default: 0 },
        ratingCount: { type: Number, default: 0 },
        availabilitySlots: [
            {
                day: { type: String, trim: true },
                start: { type: String, trim: true },
                end: { type: String, trim: true }
            }
        ]
    },
    { timestamps: true }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

userSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.password)
}

userSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    return obj
}

const User = mongoose.model("User", userSchema)

export { User }
