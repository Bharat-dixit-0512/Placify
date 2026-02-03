# Placify – Product Requirements Document (PRD)

## 1. Overview

Placify is a role-based, web-only platform designed to centralize placement preparation knowledge within a single engineering college. It connects students, placed seniors, paid external mentors, and the Training & Placement (T&P) department into one structured ecosystem to improve preparation quality and placement outcomes.

---

## 2. Problem Statement

In most engineering colleges, placement preparation knowledge is fragmented and informal. Interview experiences, preparation strategies, company-specific guidance, and mentorship insights are scattered across WhatsApp groups, personal notes, and unstructured conversations.

This leads to:
- Unequal access to placement guidance
- Loss of institutional knowledge after each graduating batch
- Lack of structured mentorship
- Difficulty for Training & Placement departments to manage and verify content

Placify aims to solve these issues by providing a centralized, secure, and role-based platform for placement preparation.

---

## 3. Goals & Objectives

### Primary Goals
- Improve placement preparation quality
- Centralize verified placement-related knowledge

### Secondary Goals
- Preserve placement knowledge across batches
- Enable structured mentorship
- Improve transparency and accessibility of resources

---

## 4. Success Metrics (KPIs)

- Placement outcomes (number of students placed, average package)
- Content consumption metrics (blog views, engagement)
- Active user count
- Mentor engagement (chats, sessions conducted)

---

## 5. Target Users & Personas

### 5.1 Students
- Engineering students (1st–4th year)
- Branch-specific access to content
- Consumers of placement content and mentorship

### 5.2 Placed Seniors
- Alumni from the same college
- Verified via offer letter
- Create blogs and mentor students

### 5.3 External Mentors (Paid)
- Industry professionals
- Conduct group mentorship sessions only
- Approved by T&P faculty

### 5.4 Training & Placement Faculty (Admin)
- Platform administrators
- Approve mentors
- Moderate content
- View analytics

---

## 6. User Roles & Permissions

| Role | Permissions |
|----|----|
| Student | View content, request chat, join group sessions |
| Placed Senior | Publish blogs, approve chats |
| External Mentor | Conduct group mentorship sessions |
| T&P Faculty | Approve mentors, edit/delete content, analytics |

---

## 7. Functional Requirements

### 7.1 Content Management
- Blogs published by placed seniors
- Text-only content (Version 1)
- Company, role, and difficulty-based tagging
- Search and filters
- Blogs are auto-published
- Faculty can edit, delete, or remove content

### 7.2 Mentorship & Communication
- One-to-one chat between students and seniors
- Chat initiated via request and approval
- Chats auto-close after 30 days
- File sharing supported
- Voice/video planned for future versions

### 7.3 Placement Cell Features
- Official notices and announcements
- Drive-specific pages
- Eligibility tracking
- Verified content badge

---

## 8. Authentication & Verification

- Login using college email only
- Verification:
  - Students: Roll number
  - Seniors: Offer letter
  - Faculty: Admin approval
- Users automatically deactivated after graduation

---

## 9. Access Control & Security

- Content visible to all students with branch-based restriction
- No content downloads allowed
- Screenshot protection enabled
- Compliance with college policy and data privacy norms

---

## 10. Platform Scope & Constraints

### Platform
- Web application only

### Scale
- Designed for 1500–3000 users

### Performance
- Fast loading with rich UI

### Language
- English only

---

## 11. Admin Dashboard & Analytics

### Admin Metrics
- Active users
- Most-read blogs
- Mentor engagement
- Chat volumes

### Mentor Metrics
- Blog views
- Engagement statistics

---

## 12. Non-Functional Requirements

- High availability during placement season
- Secure role-based access control (RBAC)
- Scalable backend architecture
- Responsive UI across devices

---

## 13. System Architecture

Placify follows a modular client–server architecture with the following layers:
- Frontend (React-based UI)
- Backend (REST APIs)
- Database (MongoDB)
- Authentication & Authorization (JWT + RBAC)

The architecture supports scalability, security, and maintainability.

---

## 14. Tech Stack

### Frontend
- React.js
- Tailwind CSS
- React Router
- Context API

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB
- Mongoose ORM

### Authentication & Security
- College email authentication
- JWT-based sessions
- Role-based access control

### Real-Time Features
- Socket.IO for chat

### Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

---

## 19. UI Color & Branding Requirements

Placify’s visual design should reflect **professionalism, trust, and clarity**, aligning with an academic and placement-focused platform. The color system must ensure readability, accessibility, and a clean user experience.

---

### 19.1 Brand Color Palette

#### Primary Color
- **Primary Blue** – `#1E3A8A`
- Purpose:
  - Represents trust, reliability, and professionalism
  - Used for primary actions, headers, and navigation bars

---

#### Secondary Color
- **Emerald Green** – `#10B981`
- Purpose:
  - Indicates success, progress, and positive actions
  - Used for confirmations, success messages, and highlights

---

#### Accent Color
- **Amber** – `#F59E0B`
- Purpose:
  - Draws attention without distraction
  - Used for notifications, warnings, and callouts

---

### 19.2 Neutral Colors

- **Background White** – `#FFFFFF`
- **Light Gray** – `#F3F4F6` (cards, sections)
- **Text Primary** – `#111827`
- **Text Secondary** – `#6B7280`
- **Borders / Dividers** – `#E5E7EB`

---

### 19.3 Role-Based Color Usage (Optional Enhancement)

| Role | Color Usage |
|----|----|
| Student | Blue highlights |
| Placed Senior | Green badges |
| External Mentor | Amber tags |
| Admin (T&P) | Dark blue / neutral tones |

---

### 19.4 UI Element Color Guidelines

- **Primary Buttons:** Primary Blue with white text
- **Secondary Buttons:** White background with blue border
- **Success Messages:** Emerald Green
- **Error Messages:** Red (`#EF4444`)
- **Disabled States:** Gray (`#9CA3AF`)

---

### 19.5 Accessibility & Usability Requirements

- Maintain sufficient contrast ratio for text and background
- Avoid color-only indicators for important actions
- Ensure consistent color usage across all screens

---

### 19.6 Dark Mode (Future Scope)

- Dark mode support is not required in Version 1
- Should be considered in future releases

---



## 15. Implementation Roadmap

### Phase 1: Foundation
- Requirement finalization
- UI wireframes
- Authentication and role management

### Phase 2: Core Features
- Blog system
- Search and tagging
- Admin moderation

### Phase 3: Mentorship
- One-to-one chat system
- Chat lifecycle management
- Group mentorship sessions

### Phase 4: Analytics
- Admin dashboard
- Engagement tracking

### Phase 5: Testing & Deployment
- Functional testing
- Security checks
- Deployment and demo preparation

---

## 16. Assumptions & Constraints

- College provides official email IDs
- T&P faculty actively moderate the platform
- Seniors and mentors contribute content
- Stable internet connectivity is available

---

## 17. Future Scope

- Mock interview scheduling
- Resume review system
- AI-based personalized preparation roadmap
- Company-specific discussion forums
- LMS and cloud storage integration

---

## 20. Frontend Component Organization Structure

Placify follows a **component-driven frontend architecture** based on **Atomic Design principles**. This structure improves reusability, scalability, and maintainability of UI components while enabling parallel development.

---

### 20.1 Design Philosophy

- Atomic Design methodology (Atoms → Molecules → Organisms)
- Clear separation of concerns
- Reusable, testable, and scalable UI components
- Consistent UI patterns across the application

---

### 20.2 Directory Structure
```
src/
├── components/
│ ├── atoms/ # Basic UI elements
│ │ ├── Button/ # Primary, Secondary, Icon buttons
│ │ ├── Input/ # Text, Email, Password inputs
│ │ ├── Badge/ # Role & status indicators
│ │ ├── Icon/ # SVG icons
│ │ ├── Avatar/ # User profile avatar
│ │ └── [component]/
│ │
│ ├── molecules/ # Combinations of atoms
│ │ ├── FormField/ # Input + Label + Error
│ │ ├── Card/ # Content cards
│ │ ├── SearchBar/ # Search input with icon
│ │ ├── ListItem/ # Blog/session list items
│ │ └── [component]/
│ │
│ ├── organisms/ # Complex UI sections
│ │ ├── Navbar/ # Top navigation
│ │ ├── Footer/ # Footer section
│ │ ├── DataTable/ # Admin tables
│ │ ├── FilterSidebar/ # Blog & session filters
│ │ └── [component]/
│ │
│ ├── layouts/ # Page-level layouts
│ │ ├── MainLayout/ # Public pages
│ │ ├── AuthLayout/ # Login & auth pages
│ │ ├── DashboardLayout/ # Role-based dashboards
│ │ └── [layout]/
│ │
│ └── pages/ # Route-level pages
│ ├── Home/ # Landing page
│ ├── Login/ # Authentication page
│ ├── Dashboard/ # User dashboard
│ ├── Blogs/ # Blog listing & details
│ ├── Chat/ # 1:1 chat interface
│ ├── Sessions/ # Group mentorship sessions
│ └── [page]/
```
---

### 20.3 Component Responsibility Guidelines

- **Atoms:**  
  Single-purpose UI elements with no business logic

- **Molecules:**  
  Simple functional combinations of atoms

- **Organisms:**  
  Feature-level UI blocks connected to data

- **Layouts:**  
  Define page structure and navigation

- **Pages:**  
  Handle routing, data fetching, and feature composition

---

### 20.4 Benefits

- High reusability of components
- Easy UI consistency enforcement
- Scalable structure for future features
- Improved collaboration between developers and designers

---

## 22. Backend Folder Structure

Placify’s backend follows a **modular, scalable, and feature-based architecture** to ensure maintainability, security, and ease of collaboration. The structure aligns with REST API best practices and role-based access control.

---

### 22.1 Directory Structure

```
server/
├── src/
│ ├── config/ # Configuration files
│ │ ├── db.js # Database connection
│ │ ├── env.js # Environment variables
│ │ └── constants.js # App constants
│ │
│ ├── models/ # Database models
│ │ ├── User.model.js
│ │ ├── Blog.model.js
│ │ ├── Chat.model.js
│ │ ├── Session.model.js
│ │ └── Analytics.model.js
│ │
│ ├── controllers/ # Request handlers
│ │ ├── auth.controller.js
│ │ ├── user.controller.js
│ │ ├── blog.controller.js
│ │ ├── chat.controller.js
│ │ ├── session.controller.js
│ │ └── analytics.controller.js
│ │
│ ├── routes/ # API route definitions
│ │ ├── auth.routes.js
│ │ ├── user.routes.js
│ │ ├── blog.routes.js
│ │ ├── chat.routes.js
│ │ ├── session.routes.js
│ │ └── analytics.routes.js
│ │
│ ├── middleware/ # Custom middleware
│ │ ├── auth.middleware.js # JWT & RBAC checks
│ │ ├── error.middleware.js # Global error handler
│ │ └── upload.middleware.js # File handling
│ │
│ ├── services/ # Business logic
│ │ ├── auth.service.js
│ │ ├── blog.service.js
│ │ ├── chat.service.js
│ │ └── analytics.service.js
│ │
│ ├── utils/ # Utility functions
│ │ ├── logger.js
│ │ ├── token.js
│ │ └── validators.js
│ │
│ └── app.js # Express app setup
│
├── server.js # Server entry point
└── package.json
```


---

### 22.2 Backend Design Principles

- Separation of concerns (routes, controllers, services)
- Centralized error handling
- Secure role-based access control
- Easily extensible for new features

---

## 23. State Management Structure (Frontend)

Placify uses **React Context API** for state management in Version 1, ensuring simplicity and reduced boilerplate while supporting scalable growth.

---

### 23.1 State Management Approach

- Context API for global state
- Local component state for UI-specific logic
- Easy migration path to Redux if scale increases

---

### 23.2 Directory Structure

```
src/
├── context/
│ ├── AuthContext/
│ │ ├── AuthContext.js # Auth state
│ │ ├── AuthProvider.js # Auth provider
│ │ └── auth.reducer.js # Auth reducer
│ │
│ ├── UserContext/
│ │ ├── UserContext.js
│ │ └── UserProvider.js
│ │
│ ├── BlogContext/
│ │ ├── BlogContext.js
│ │ └── BlogProvider.js
│ │
│ ├── ChatContext/
│ │ ├── ChatContext.js
│ │ └── ChatProvider.js
│ │
│ └── SessionContext/
│ ├── SessionContext.js
│ └── SessionProvider.js
```


---

### 23.3 Managed State Examples

- Authentication & user role
- Blogs and filters
- Chat sessions & messages
- Group mentorship sessions

---

## 24. API Service Layer Structure (Frontend)

Placify implements a **dedicated API service layer** to decouple UI components from backend communication logic, improving maintainability and testability.

---

### 24.1 Purpose of API Service Layer

- Centralized API calls
- Consistent error handling
- Easy API updates without UI changes

---

### 24.2 Directory Structure

```
src/
├── services/
│ ├── apiClient.js # Axios instance
│ │
│ ├── auth.service.js # Auth APIs
│ ├── user.service.js # User APIs
│ ├── blog.service.js # Blog APIs
│ ├── chat.service.js # Chat APIs
│ ├── session.service.js # Mentorship session APIs
│ └── analytics.service.js # Admin analytics APIs
```

---

### 24.3 API Client Responsibilities

- Attach authentication tokens
- Handle request/response interceptors
- Standardize success and error responses

---

### 24.4 Benefits

- Clean separation between UI and data logic
- Reusable API methods
- Improved debugging and testing
- Industry-standard frontend architecture

---

## 18. Final Summary

Placify transforms informal placement preparation into a structured, mentor-driven, and institutionally governed platform. It ensures knowledge continuity, improves preparation quality, and enhances placement outcomes for students.

---
End Document