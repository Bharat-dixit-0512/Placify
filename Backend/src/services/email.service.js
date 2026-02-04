import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

const sendEmail = async ({ to, subject, html }) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log("Email dispatch (simulated):", { to, subject, html })
        return { to, subject, html, status: "skipped" }
    }
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    })
    return { to, subject, status: "sent", messageId: info.messageId }
}

export { sendEmail }
