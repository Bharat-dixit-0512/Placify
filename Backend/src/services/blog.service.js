import { Blog } from "../models/Blog.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const createBlog = async (payload) => {
    return Blog.create(payload)
}

const listBlogs = async (query) => {
    const filter = { isActive: true }
    if (query.company) filter.company = query.company
    if (query.role) filter.role = query.role
    if (query.difficulty) filter.difficulty = query.difficulty
    if (query.tag) filter.tags = query.tag
    if (query.author) filter.author = query.author
    if (query.search) {
        filter.$or = [
            { title: new RegExp(query.search, "i") },
            { content: new RegExp(query.search, "i") }
        ]
    }
    const safeLimit = Math.min(Number(query.limit) || 10, 50)
    const safePage = Math.max(Number(query.page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [items, total] = await Promise.all([
        Blog.find(filter)
            .populate("author", "name role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit),
        Blog.countDocuments(filter)
    ])
    return { items, meta: { page: safePage, limit: safeLimit, total } }
}

const getBlogById = async (id) => {
    const blog = await Blog.findById(id).populate("author", "name role")
    if (!blog || !blog.isActive) {
        throw new ApiError(404, MESSAGES.NOT_FOUND)
    }
    return blog
}

const updateBlog = async (id, payload) => {
    const blog = await Blog.findByIdAndUpdate(id, payload, { new: true })
    if (!blog) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return blog
}

const deleteBlog = async (id) => {
    const blog = await Blog.findByIdAndUpdate(id, { isActive: false }, { new: true })
    if (!blog) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return blog
}

export { createBlog, listBlogs, getBlogById, updateBlog, deleteBlog }
