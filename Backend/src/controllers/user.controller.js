import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"
import { sendEmail } from "../services/email.service.js"
import { requestOtp } from "../services/auth.service.js"
import { cloudinary } from "../config/cloudinary.js"
import { MentorshipRating } from "../models/MentorshipRating.model.js"

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, user, "Profile"))
})

const updateProfile = asyncHandler(async (req, res) => {
    const updates = req.body
    delete updates.role
    delete updates.isVerified
    delete updates.isActive
    delete updates.emailVerified
    delete updates.email
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, user, "Profile updated"))
})

const listUsers = asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, users, "Users"))
})

const searchUsers = asyncHandler(async (req, res) => {
    const { query = "" } = req.query
    if (!query.trim()) {
        return res.status(200).json(new ApiResponse(200, [], "Users"))
    }
    const users = await User.find({
        $or: [
            { name: new RegExp(query, "i") },
            { email: new RegExp(query, "i") }
        ],
        isActive: true,
        isVerified: true
    })
        .select("name email role")
        .limit(8)
    return res.status(200).json(new ApiResponse(200, users, "Users"))
})

const listMentorsAndSeniors = asyncHandler(async (req, res) => {
    const { search, role, company, tag, sort } = req.query
    const filter = {
        role: { $in: ["mentor", "senior"] },
        isActive: true,
        isVerified: true
    }
    if (role) filter.role = role
    if (company) filter.company = company
    if (tag) filter.expertiseTags = tag
    if (search) {
        filter.$or = [
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { company: new RegExp(search, "i") }
        ]
    }
    const sortBy =
        sort === "experience"
            ? { experienceYears: -1 }
            : sort === "rating"
                ? { rating: -1 }
                : { createdAt: -1 }
    const users = await User.find(filter)
        .select(
            "name email role branch year bio avatarUrl company designation expertiseTags experienceYears rating"
        )
        .sort(sortBy)
    return res.status(200).json(new ApiResponse(200, users, "Mentors and seniors"))
})

const getMentorProfile = asyncHandler(async (req, res) => {
    const user = await User.findOne({
        _id: req.params.userId,
        role: { $in: ["mentor", "senior"] },
        isActive: true,
        isVerified: true
    }).select(
        "name email role branch year bio avatarUrl company designation expertiseTags experienceYears rating"
    )
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, user, "Mentor profile"))
})

const getMentorAvailability = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).select("availabilitySlots")
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, user.availabilitySlots || [], "Availability"))
})

const updateMentorAvailability = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (req.user.role !== "admin" && String(req.user._id) !== String(user._id)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    user.availabilitySlots = req.body.slots || []
    await user.save()
    return res.status(200).json(new ApiResponse(200, user.availabilitySlots, "Availability updated"))
})

const rateMentor = asyncHandler(async (req, res) => {
    const mentorId = req.params.userId
    if (req.user.role !== "student") {
        throw new ApiError(403, "Only students can rate mentors")
    }
    const mentor = await User.findById(mentorId)
    if (!mentor) throw new ApiError(404, MESSAGES.NOT_FOUND)
    const rating = await MentorshipRating.findOneAndUpdate(
        { mentor: mentorId, student: req.user._id },
        { rating: req.body.rating, review: req.body.review || "" },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    const [avg] = await MentorshipRating.aggregate([
        { $match: { mentor: mentor._id } },
        { $group: { _id: "$mentor", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    mentor.rating = avg?.avg || 0
    mentor.ratingCount = avg?.count || 0
    await mentor.save()
    return res.status(200).json(new ApiResponse(200, rating, "Rating submitted"))
})

const listMentorReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5 } = req.query
    const safeLimit = Math.min(Number(limit) || 5, 20)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [items, total] = await Promise.all([
        MentorshipRating.find({ mentor: req.params.userId })
            .populate("student", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit),
        MentorshipRating.countDocuments({ mentor: req.params.userId })
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, { items, meta: { page: safePage, limit: safeLimit, total } }, "Reviews"))
})

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+password")
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    const isMatch = await user.comparePassword(req.body.currentPassword)
    if (!isMatch) throw new ApiError(400, "Current password is incorrect")
    user.password = req.body.newPassword
    await user.save()
    return res.status(200).json(new ApiResponse(200, true, "Password updated"))
})

const updateEmail = asyncHandler(async (req, res) => {
    const email = req.body.email.toLowerCase()
    const exists = await User.findOne({ email })
    if (exists) throw new ApiError(409, "Email already in use")
    const user = await User.findById(req.user._id)
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    user.email = email
    user.emailVerified = false
    await user.save()
    const { otpCode } = await requestOtp(email)
    await sendEmail({
        to: email,
        subject: "Placify email verification",
        html: `Your verification code is <strong>${otpCode}</strong>.`
    })
    return res.status(200).json(new ApiResponse(200, true, "Email updated. Verify OTP."))
})

const uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) throw new ApiError(400, "No file uploaded")
    const uploadResult = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
        { folder: "placify/avatars", resource_type: "image" }
    )
    const avatarUrl = uploadResult.secure_url
    const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl }, { new: true })
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, user, "Avatar updated"))
})

export {
    getProfile,
    updateProfile,
    listUsers,
    searchUsers,
    listMentorsAndSeniors,
    getMentorProfile,
    getMentorAvailability,
    updateMentorAvailability,
    rateMentor,
    listMentorReviews,
    changePassword,
    updateEmail,
    uploadAvatar
}
