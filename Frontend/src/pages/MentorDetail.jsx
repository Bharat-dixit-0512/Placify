import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  getMentor,
  getMentorAvailability,
  rateMentor,
  updateMentorAvailability,
  getMentorReviews
} from "../services/user.service.js"
import { requestChat } from "../services/chat.service.js"
import { useToast } from "../context/ToastContext.jsx"
import { useAuth } from "../context/AuthContext.jsx"

const MentorDetail = () => {
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState([])
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [reviews, setReviews] = useState([])
  const [reviewPage, setReviewPage] = useState(1)
  const [reviewTotal, setReviewTotal] = useState(0)
  const [slotForm, setSlotForm] = useState({ day: "Mon", start: "10:00", end: "12:00" })
  const { addToast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const [mentorResp, availabilityResp, reviewsResp] = await Promise.all([
          getMentor(mentorId),
          getMentorAvailability(mentorId),
          getMentorReviews(mentorId, { page: reviewPage, limit: 5 })
        ])
        setMentor(mentorResp.data.data)
        setAvailability(availabilityResp.data.data || [])
        setReviews(reviewsResp.data.data?.items || [])
        setReviewTotal(reviewsResp.data.data?.meta?.total || 0)
      } catch (err) {
        addToast({
          type: "error",
          title: "Profile failed",
          message: err?.response?.data?.message || "Unable to load mentor profile."
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [mentorId, addToast, reviewPage])

  if (loading) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="py-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            Mentor not found.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
        <Link
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
          to="/mentors"
        >
          Back to Mentors
        </Link>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {mentor.avatarUrl ? (
              <img
                className="h-12 w-12 rounded-full border-2 border-blue-100 object-cover"
                src={mentor.avatarUrl}
                alt="avatar"
              />
            ) : (
              <div className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                {mentor.name?.slice(0, 1) || "U"}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{mentor.name}</h2>
              <div className="text-sm text-slate-600">
                {mentor.company || "Company"} {mentor.designation ? `- ${mentor.designation}` : ""}
              </div>
              <div className="text-sm text-slate-600">
                Experience: {mentor.experienceYears || 0} years - Rating: {mentor.rating || 0}/5
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-700">{mentor.bio || "No bio provided."}</p>
          {mentor.expertiseTags && mentor.expertiseTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {mentor.expertiseTags.map((tag) => (
                <span
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
            type="button"
            onClick={async () => {
              try {
                await requestChat({ seniorId: mentor._id })
                addToast({
                  type: "success",
                  title: "Request sent",
                  message: "Chat request sent for approval."
                })
              } catch (err) {
                addToast({
                  type: "error",
                  title: "Request failed",
                  message: err?.response?.data?.message || "Unable to request chat."
                })
              }
            }}
          >
            Request Chat
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
          {availability.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">No availability posted yet.</div>
          ) : (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-2">
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => (
                  <div
                    key={day}
                    className="grid gap-2 md:grid-cols-[80px_1fr] md:items-center"
                  >
                    <strong className="text-sm text-slate-900">{day}</strong>
                    <div className="flex flex-wrap gap-2">
                      {availability.filter((s) => s.day === day).length === 0 ? (
                        <span className="text-sm text-slate-400">-</span>
                      ) : (
                        availability
                          .filter((s) => s.day === day)
                          .map((s, idx) => (
                            <span
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                              key={`${day}-${idx}`}
                            >
                              {s.start} - {s.end}
                            </span>
                          ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {user?.role === "mentor" && String(user?._id) === String(mentor._id) && (
            <form
              className="mt-4 grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault()
                const nextSlots = [...availability, slotForm]
                try {
                  await updateMentorAvailability(mentorId, { slots: nextSlots })
                  setAvailability(nextSlots)
                  addToast({ type: "success", title: "Updated", message: "Availability updated." })
                } catch (err) {
                  addToast({
                    type: "error",
                    title: "Update failed",
                    message: err?.response?.data?.message || "Unable to update availability."
                  })
                }
              }}
            >
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={slotForm.day}
                  onChange={(e) => setSlotForm((f) => ({ ...f, day: e.target.value }))}
                >
                  <option>Mon</option>
                  <option>Tue</option>
                  <option>Wed</option>
                  <option>Thu</option>
                  <option>Fri</option>
                  <option>Sat</option>
                  <option>Sun</option>
                </select>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={slotForm.start}
                  onChange={(e) => setSlotForm((f) => ({ ...f, start: e.target.value }))}
                  placeholder="Start"
                />
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  value={slotForm.end}
                  onChange={(e) => setSlotForm((f) => ({ ...f, end: e.target.value }))}
                  placeholder="End"
                />
              </div>
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                type="submit"
              >
                Add slot
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Rate this mentor</h3>
          {user?.role === "student" ? (
            <form
              className="mt-4 grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await rateMentor(mentorId, { rating, review })
                  addToast({ type: "success", title: "Thanks!", message: "Rating submitted." })
                } catch (err) {
                  addToast({
                    type: "error",
                    title: "Rating failed",
                    message: err?.response?.data?.message || "Unable to submit rating."
                  })
                }
              }}
            >
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Stars
                  </option>
                ))}
              </select>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Optional review"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <button
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700"
                type="submit"
              >
                Submit rating
              </button>
            </form>
          ) : (
            <div className="mt-2 text-sm text-slate-600">Students can submit ratings.</div>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Mentor reviews</h3>
          {reviews.length === 0 ? (
            <div className="mt-2 text-sm text-slate-600">No reviews yet.</div>
          ) : (
            <div className="mt-4 grid gap-3">
              {reviews.map((r) => (
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  key={r._id}
                >
                  <strong className="text-slate-900">{r.student?.name || "Student"}</strong>
                  <div className="text-xs text-slate-500">
                    {new Date(r.createdAt).toLocaleString()} - {r.rating}/5
                  </div>
                  {r.review && <p className="mt-2 text-sm text-slate-600">{r.review}</p>}
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
              disabled={reviewPage === 1}
            >
              Prev
            </button>
            <div className="text-sm text-slate-500">
              Page {reviewPage} of {Math.max(1, Math.ceil(reviewTotal / 5))}
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              onClick={() =>
                setReviewPage((p) =>
                  p < Math.ceil(reviewTotal / 5) ? p + 1 : p
                )
              }
              disabled={reviewPage >= Math.ceil(reviewTotal / 5)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorDetail
