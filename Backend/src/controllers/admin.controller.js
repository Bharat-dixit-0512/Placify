import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { Blog } from "../models/Blog.model.js"
import { Chat } from "../models/Chat.model.js"
import { Message } from "../models/Message.model.js"
import { Session } from "../models/Session.model.js"
import { Notice } from "../models/Notice.model.js"
import { AuditLog } from "../models/AuditLog.model.js"
import { BlogComment } from "../models/BlogComment.model.js"
import { MentorshipRating } from "../models/MentorshipRating.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"
import { sendEmail } from "../services/email.service.js"

const logAdminAction = async ({ actorId, action, targetUser, metadata }) => {
    await AuditLog.create({
        actor: actorId,
        action,
        targetUser,
        metadata
    })
}

const approveUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isVerified: true },
        { new: true }
    )
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "approve_user",
        targetUser: user._id
    })
    return res.status(200).json(new ApiResponse(200, user, "User approved"))
})

const deactivateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: false },
        { new: true }
    )
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "deactivate_user",
        targetUser: user._id
    })
    return res.status(200).json(new ApiResponse(200, user, "User deactivated"))
})

const getAnalytics = asyncHandler(async (_req, res) => {
    const [users, blogs, chats, messages, sessions, notices] = await Promise.all([
        User.countDocuments(),
        Blog.countDocuments(),
        Chat.countDocuments(),
        Message.countDocuments(),
        Session.countDocuments(),
        Notice.countDocuments()
    ])

    return res.status(200).json(
        new ApiResponse(200, { users, blogs, chats, messages, sessions, notices }, "Analytics")
    )
})

const listPendingUsers = asyncHandler(async (_req, res) => {
    const users = await User.find({ isVerified: false, isActive: true }).sort({ createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, users, "Pending users"))
})

const rejectUser = asyncHandler(async (req, res) => {
    const reason = (req.body?.reason || "Not specified").trim()
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        {
            isActive: false,
            isVerified: false,
            rejectionReason: reason,
            rejectedAt: new Date(),
            rejectedBy: req.user._id
        },
        { new: true }
    )
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "reject_user",
        targetUser: user._id,
        metadata: { reason }
    })
    await sendEmail({
        to: user.email,
        subject: "Placify registration update",
        html: `Your registration was rejected. Reason: <strong>${reason}</strong>.`
    })
    return res.status(200).json(new ApiResponse(200, user, "User rejected"))
})

const activateUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.userId,
        { isActive: true },
        { new: true }
    )
    if (!user) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "activate_user",
        targetUser: user._id
    })
    return res.status(200).json(new ApiResponse(200, user, "User activated"))
})

const listUsers = asyncHandler(async (req, res) => {
    const { status, role, search, page = 1, limit = 10 } = req.query
    const filter = {}
    if (status === "pending") {
        filter.isVerified = false
        filter.isActive = true
    }
    if (status === "active") filter.isActive = true
    if (status === "deactivated") filter.isActive = false
    if (role) filter.role = role
    if (search) {
        filter.$or = [
            { name: new RegExp(search, "i") },
            { email: new RegExp(search, "i") },
            { branch: new RegExp(search, "i") }
        ]
    }
    const safeLimit = Math.min(Number(limit) || 10, 50)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [users, total] = await Promise.all([
        User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
        User.countDocuments(filter)
    ])
    return res.status(200).json(
        new ApiResponse(200, { items: users, meta: { page: safePage, limit: safeLimit, total } }, "Users")
    )
})

const listAuditLogs = asyncHandler(async (_req, res) => {
    const { page = 1, limit = 10 } = _req.query
    const safeLimit = Math.min(Number(limit) || 10, 50)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [logs, total] = await Promise.all([
        AuditLog.find()
        .populate("actor", "name email role")
        .populate("targetUser", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit),
        AuditLog.countDocuments()
    ])
    return res.status(200).json(
        new ApiResponse(200, { items: logs, meta: { page: safePage, limit: safeLimit, total } }, "Audit logs")
    )
})

const listReportedComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, blog, minReports, assignedTo } = req.query
    const safeLimit = Math.min(Number(limit) || 10, 50)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const filter = { reports: { $exists: true, $not: { $size: 0 } } }
    if (blog) filter.blog = blog
    if (assignedTo) filter.assignedTo = assignedTo
    if (minReports) filter.$expr = { $gte: [{ $size: "$reports" }, Number(minReports) || 1] }

    const [items, total] = await Promise.all([
        BlogComment.find(filter)
            .populate("author", "name email role")
            .populate("blog", "title")
            .populate("assignedTo", "name email")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(safeLimit),
        BlogComment.countDocuments(filter)
    ])
    return res.status(200).json(
        new ApiResponse(200, { items, meta: { page: safePage, limit: safeLimit, total } }, "Reported comments")
    )
})

const exportReportedComments = asyncHandler(async (req, res) => {
    const { blog, minReports, assignedTo } = req.query
    const filter = { reports: { $exists: true, $not: { $size: 0 } } }
    if (blog) filter.blog = blog
    if (assignedTo) filter.assignedTo = assignedTo
    if (minReports) filter.$expr = { $gte: [{ $size: "$reports" }, Number(minReports) || 1] }

    const items = await BlogComment.find(filter)
        .populate("author", "name email role")
        .populate("blog", "title")
        .populate("assignedTo", "name email")
        .sort({ updatedAt: -1 })

    const rows = [
        ["commentId", "blogTitle", "authorName", "authorEmail", "reports", "assignedTo", "content", "createdAt"]
    ]
    items.forEach((c) => {
        rows.push([
            c._id,
            c.blog?.title || "",
            c.author?.name || "",
            c.author?.email || "",
            c.reports?.length || 0,
            c.assignedTo?.email || "",
            (c.content || "").replace(/\n/g, " "),
            c.createdAt?.toISOString() || ""
        ])
    })
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=reported-comments.csv")
    res.status(200).send(csv)
})

const resolveReportedComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findByIdAndUpdate(
        req.params.commentId,
        { reports: [] },
        { new: true }
    )
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "resolve_report",
        targetUser: comment.author,
        metadata: { commentId: comment._id }
    })
    return res.status(200).json(new ApiResponse(200, comment, "Report resolved"))
})

const removeReportedComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await BlogComment.deleteOne({ _id: req.params.commentId })
    await logAdminAction({
        actorId: req.user._id,
        action: "remove_comment",
        targetUser: comment.author,
        metadata: { commentId: comment._id }
    })
    return res.status(200).json(new ApiResponse(200, true, "Comment removed"))
})

const assignReportedComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findByIdAndUpdate(
        req.params.commentId,
        { assignedTo: req.body.assignedTo || null },
        { new: true }
    )
        .populate("assignedTo", "name email")
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    await logAdminAction({
        actorId: req.user._id,
        action: "assign_report",
        targetUser: req.body.assignedTo || null,
        metadata: { commentId: comment._id }
    })
    return res.status(200).json(new ApiResponse(200, comment, "Assigned"))
})

const getRatingAnalytics = asyncHandler(async (_req, res) => {
    const topMentors = await User.find({ role: { $in: ["mentor", "senior"] }, isActive: true })
        .select("name email rating ratingCount company designation")
        .sort({ rating: -1, ratingCount: -1 })
        .limit(10)
    const [summary] = await MentorshipRating.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            { avgRating: summary?.avg || 0, ratingCount: summary?.count || 0, topMentors },
            "Rating analytics"
        )
    )
})

export {
    approveUser,
    deactivateUser,
    getAnalytics,
    listPendingUsers,
    rejectUser,
    activateUser,
    listUsers,
    listAuditLogs,
    listReportedComments,
    exportReportedComments,
    assignReportedComment,
    resolveReportedComment,
    removeReportedComment,
    getRatingAnalytics
}
