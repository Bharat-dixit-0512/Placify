import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import {
    createBlog,
    listBlogs,
    getBlogById,
    updateBlog,
    deleteBlog
} from "../services/blog.service.js"
import { BlogComment } from "../models/BlogComment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const createBlogPost = asyncHandler(async (req, res) => {
    const blog = await createBlog({ ...req.body, author: req.user._id })
    return res.status(201).json(new ApiResponse(201, blog, "Blog created"))
})

const listBlogPosts = asyncHandler(async (req, res) => {
    const blogs = await listBlogs(req.query)
    return res.status(200).json(new ApiResponse(200, blogs, "Blogs"))
})

const getBlogPost = asyncHandler(async (req, res) => {
    const blog = await getBlogById(req.params.blogId)
    return res.status(200).json(new ApiResponse(200, blog, "Blog"))
})

const updateBlogPost = asyncHandler(async (req, res) => {
    const blog = await updateBlog(req.params.blogId, req.body)
    return res.status(200).json(new ApiResponse(200, blog, "Blog updated"))
})

const deleteBlogPost = asyncHandler(async (req, res) => {
    const blog = await deleteBlog(req.params.blogId)
    return res.status(200).json(new ApiResponse(200, blog, "Blog deleted"))
})

const listBlogComments = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, replyLimit = 2 } = req.query
    const safeLimit = Math.min(Number(limit) || 10, 50)
    const safePage = Math.max(Number(page) || 1, 1)
    const safeReplyLimit = Math.min(Number(replyLimit) || 2, 10)
    const skip = (safePage - 1) * safeLimit

    const [comments, total] = await Promise.all([
        BlogComment.find({ blog: req.params.blogId, parent: null })
            .populate("author", "name role")
            .populate("reactions.user", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit),
        BlogComment.countDocuments({ blog: req.params.blogId, parent: null })
    ])

    const commentIds = comments.map((c) => c._id)
    const replyCounts = await BlogComment.aggregate([
        { $match: { parent: { $in: commentIds } } },
        { $group: { _id: "$parent", count: { $sum: 1 } } }
    ])
    const replyCountMap = replyCounts.reduce((acc, item) => {
        acc[String(item._id)] = item.count
        return acc
    }, {})

    const repliesByComment = await Promise.all(
        commentIds.map(async (commentId) => {
            const replies = await BlogComment.find({ parent: commentId })
                .populate("author", "name role")
                .populate("reactions.user", "name")
                .sort({ createdAt: 1 })
                .limit(safeReplyLimit)
            return { commentId, replies }
        })
    )

    const replyMap = repliesByComment.reduce((acc, entry) => {
        acc[String(entry.commentId)] = entry.replies
        return acc
    }, {})

    const items = comments.map((c) => ({
        ...c.toObject(),
        replies: replyMap[String(c._id)] || [],
        replyCount: replyCountMap[String(c._id)] || 0
    }))

    return res
        .status(200)
        .json(new ApiResponse(200, { items, meta: { page: safePage, limit: safeLimit, total } }, "Comments"))
})

const addBlogComment = asyncHandler(async (req, res) => {
    const blog = await getBlogById(req.params.blogId)
    if (!blog) throw new ApiError(404, MESSAGES.NOT_FOUND)
    const comment = await BlogComment.create({
        blog: req.params.blogId,
        author: req.user._id,
        content: req.body.content,
        parent: req.body.parent || null,
        mentions: req.body.mentions || []
    })
    return res.status(201).json(new ApiResponse(201, comment, "Comment added"))
})

const listCommentReplies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 5 } = req.query
    const safeLimit = Math.min(Number(limit) || 5, 20)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [items, total] = await Promise.all([
        BlogComment.find({ parent: req.params.commentId })
            .populate("author", "name role")
            .populate("reactions.user", "name")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(safeLimit),
        BlogComment.countDocuments({ parent: req.params.commentId })
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, { items, meta: { page: safePage, limit: safeLimit, total } }, "Replies"))
})

const updateBlogComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (req.user.role !== "admin" && String(comment.author) !== String(req.user._id)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    comment.content = req.body.content
    comment.mentions = req.body.mentions || []
    await comment.save()
    return res.status(200).json(new ApiResponse(200, comment, "Comment updated"))
})

const reactToComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    const existing = comment.reactions.find(
        (r) => String(r.user) === String(req.user._id)
    )
    if (existing) {
        if (existing.type === req.body.type) {
            comment.reactions = comment.reactions.filter(
                (r) => String(r.user) !== String(req.user._id)
            )
        } else {
            existing.type = req.body.type
        }
    } else {
        comment.reactions.push({ user: req.user._id, type: req.body.type })
    }
    await comment.save()
    await comment.populate("reactions.user", "name")
    return res.status(200).json(new ApiResponse(200, comment, "Reaction updated"))
})

const reportComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    const already = comment.reports.find(
        (r) => String(r.user) === String(req.user._id)
    )
    if (already) {
        throw new ApiError(400, "You already reported this comment")
    }
    comment.reports.push({ user: req.user._id, reason: req.body.reason || "" })
    await comment.save()
    return res.status(200).json(new ApiResponse(200, true, "Report submitted"))
})

const deleteBlogComment = asyncHandler(async (req, res) => {
    const comment = await BlogComment.findById(req.params.commentId)
    if (!comment) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (req.user.role !== "admin" && String(comment.author) !== String(req.user._id)) {
        throw new ApiError(403, MESSAGES.FORBIDDEN)
    }
    await BlogComment.deleteOne({ _id: req.params.commentId })
    return res.status(200).json(new ApiResponse(200, true, "Comment deleted"))
})

export {
    createBlogPost,
    listBlogPosts,
    getBlogPost,
    updateBlogPost,
    deleteBlogPost,
    listBlogComments,
    addBlogComment,
    deleteBlogComment,
    listCommentReplies,
    updateBlogComment,
    reactToComment,
    reportComment
}
