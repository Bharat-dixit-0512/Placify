import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from "../models/User.model.js"
import { Blog } from "../models/Blog.model.js"
import { Session } from "../models/Session.model.js"
import { Notice } from "../models/Notice.model.js"

const getPublicStats = asyncHandler(async (_req, res) => {
    const [users, blogs, sessions, notices] = await Promise.all([
        User.countDocuments({ isActive: true, isVerified: true }),
        Blog.countDocuments({ isActive: true }),
        Session.countDocuments(),
        Notice.countDocuments({ isActive: true })
    ])

    return res
        .status(200)
        .json(new ApiResponse(200, { users, blogs, sessions, notices }, "Public stats"))
})

export { getPublicStats }
