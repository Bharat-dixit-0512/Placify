import mongoose from "mongoose"

const mentorshipRatingSchema = new mongoose.Schema(
    {
        mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true },
        review: { type: String, trim: true, maxlength: 1000 }
    },
    { timestamps: true }
)

mentorshipRatingSchema.index({ mentor: 1, student: 1 }, { unique: true })

const MentorshipRating = mongoose.model("MentorshipRating", mentorshipRatingSchema)

export { MentorshipRating }
