# Placify

Placify is a role-based, web-only platform that centralizes placement preparation knowledge inside an engineering college. It connects students, placed seniors, external mentors, and the Training & Placement (T&P) department in a structured, verified ecosystem.

**Why Placify**
- Reduce fragmented guidance scattered across chats and personal notes
- Preserve institutional knowledge across graduating batches
- Provide verified, role-based mentorship and content
- Give T&P a secure, organized control center

**Core Features**
- Role-based access: Student, Senior, Mentor, Admin
- Verified blogs with tags and search
- Mentorship sessions with capacity and scheduling
- 1:1 chat with approval flow, real-time messaging, unread counts, typing indicators, and seen receipts
- Admin dashboard with approvals, moderation, analytics, and audit logs
- OTP email verification and strict admin approval
- Content moderation with reports and assignments

**Tech Stack**
- Frontend: React + Vite + Tailwind v4 (custom CSS system)
- Backend: Node.js + Express + MongoDB (Mongoose)
- Realtime: Socket.IO
- Auth: JWT + RBAC + OTP verification

**Project Structure**
- `Backend/` Express API + MongoDB models + Socket.IO
- `Frontend/` React client + service layer

**Getting Started**
1. Backend setup
2. Frontend setup
3. Seed admin

**Backend Setup**
1. `cd Backend`
2. `npm install`
3. Create `.env` using `Backend/.env.example`
4. `npm start`

**Frontend Setup**
1. `cd Frontend`
2. `npm install`
3. Create `.env` using `Frontend/.env.example`
4. `npm run dev`

**Admin Seed**
1. Add values in `Backend/.env`:
`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
2. Run:
`npm run seed:admin`

**Important URLs**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

**Auth Flow**
1. Register
2. Verify email via OTP
3. Admin approval
4. Login

**API Highlights**
- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Blogs: `/api/blogs/*`
- Notices: `/api/notices/*`
- Sessions: `/api/sessions/*`
- Chats: `/api/chats/*`
- Admin: `/api/admin/*`
- Public stats: `/api/public/stats`

**Hackathon Pitch**
Placify transforms informal placement prep into a verified, scalable system owned by the institution. It improves access, preserves mentorship knowledge, and raises placement outcomes through structured workflows and accountable moderation.

**Roadmap**
- Mock interviews and scheduling
- Resume review workflows
- Company-specific discussion rooms
- Analytics exports and dashboards

**License**
MIT
