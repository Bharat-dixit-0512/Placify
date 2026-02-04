import { BrowserRouter, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import Footer from "./components/Footer.jsx"
import Home from "./pages/Home.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Blogs from "./pages/Blogs.jsx"
import BlogDetail from "./pages/BlogDetail.jsx"
import Chat from "./pages/Chat.jsx"
import Sessions from "./pages/Sessions.jsx"
import Notices from "./pages/Notices.jsx"
import Admin from "./pages/Admin.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import VerifyEmail from "./pages/VerifyEmail.jsx"
import NotFound from "./pages/NotFound.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ToastContainer from "./components/ToastContainer.jsx"
import Profile from "./pages/Profile.jsx"
import PublicRoute from "./components/PublicRoute.jsx"
import Mentors from "./pages/Mentors.jsx"
import MentorDetail from "./pages/MentorDetail.jsx"
import Notifications from "./pages/Notifications.jsx"
import Onboarding from "./pages/Onboarding.jsx"
import Search from "./pages/Search.jsx"

const App = () => {
  return (
    <BrowserRouter>
      <div className="page">
        <Navbar />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route path="/search" element={<Search />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:blogId" element={<BlogDetail />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentors"
            element={
              <ProtectedRoute>
                <Mentors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentors/:mentorId"
            element={
              <ProtectedRoute>
                <MentorDetail />
              </ProtectedRoute>
            }
          />
          <Route path="/notices" element={<Notices />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
