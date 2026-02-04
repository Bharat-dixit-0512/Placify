import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Notice } from "../models/Notice.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const createNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.create({ ...req.body, createdBy: req.user._id })
    return res.status(201).json(new ApiResponse(201, notice, "Notice created"))
})

const listNotices = asyncHandler(async (_req, res) => {
    const notices = await Notice.find({ isActive: true }).sort({ isPinned: -1, createdAt: -1 })
    return res.status(200).json(new ApiResponse(200, notices, "Notices"))
})

const updateNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.findByIdAndUpdate(req.params.noticeId, req.body, { new: true })
    if (!notice) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, notice, "Notice updated"))
})

const deleteNotice = asyncHandler(async (req, res) => {
    const notice = await Notice.findByIdAndUpdate(
        req.params.noticeId,
        { isActive: false },
        { new: true }
    )
    if (!notice) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, notice, "Notice deleted"))
})

export { createNotice, listNotices, updateNotice, deleteNotice }
