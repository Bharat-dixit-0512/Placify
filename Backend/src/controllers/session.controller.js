import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Session } from "../models/Session.model.js"
import { ApiError } from "../utils/ApiError.js"
import { MESSAGES } from "../constants/messages.js"

const createSession = asyncHandler(async (req, res) => {
    const session = await Session.create({ ...req.body, mentor: req.user._id })
    return res.status(201).json(new ApiResponse(201, session, "Session created"))
})

const listSessions = asyncHandler(async (req, res) => {
    const { status, mentor, search, page = 1, limit = 10 } = req.query
    const filter = {}
    if (status) filter.status = status
    if (mentor) filter.mentor = mentor
    if (search) {
        filter.$or = [
            { title: new RegExp(search, "i") },
            { description: new RegExp(search, "i") }
        ]
    }
    const safeLimit = Math.min(Number(limit) || 10, 50)
    const safePage = Math.max(Number(page) || 1, 1)
    const skip = (safePage - 1) * safeLimit
    const [items, total] = await Promise.all([
        Session.find(filter).populate("mentor", "name role").sort({ scheduledAt: 1 }).skip(skip).limit(safeLimit),
        Session.countDocuments(filter)
    ])
    return res.status(200).json(
        new ApiResponse(200, { items, meta: { page: safePage, limit: safeLimit, total } }, "Sessions")
    )
})

const joinSession = asyncHandler(async (req, res) => {
    const session = await Session.findById(req.params.sessionId)
    if (!session) throw new ApiError(404, MESSAGES.NOT_FOUND)
    if (session.attendees.map(String).includes(String(req.user._id))) {
        return res.status(200).json(new ApiResponse(200, session, "Already joined"))
    }
    if (session.attendees.length >= session.capacity) {
        throw new ApiError(400, "Session is full")
    }
    session.attendees.push(req.user._id)
    await session.save()
    return res.status(200).json(new ApiResponse(200, session, "Joined session"))
})

const updateSession = asyncHandler(async (req, res) => {
    const session = await Session.findByIdAndUpdate(req.params.sessionId, req.body, { new: true })
    if (!session) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, session, "Session updated"))
})

const deleteSession = asyncHandler(async (req, res) => {
    const session = await Session.findByIdAndUpdate(
        req.params.sessionId,
        { status: "cancelled" },
        { new: true }
    )
    if (!session) throw new ApiError(404, MESSAGES.NOT_FOUND)
    return res.status(200).json(new ApiResponse(200, session, "Session cancelled"))
})

export { createSession, listSessions, joinSession, updateSession, deleteSession }
