import { NavLink, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext.jsx"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const [query, setQuery] = useState("")
  const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
  const fileBase = apiBase.replace(/\/api$/, "")
  const avatarSrc = user?.avatarUrl
    ? user.avatarUrl.startsWith("http")
      ? user.avatarUrl
      : `${fileBase}${user.avatarUrl}`
    : null

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navClass = ({ isActive }) =>
    `rounded-lg px-2 py-1 text-sm font-semibold transition ${
      isActive
        ? "bg-blue-50 text-blue-700"
        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
    }`

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
    setQuery("")
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="grid gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            Placify - Placement OS
          </div>
          <div className="text-lg font-bold text-slate-900">Placify</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form className="flex items-center gap-2" onSubmit={handleSearch}>
            <input
              className="w-48 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
              type="submit"
            >
              Search
            </button>
          </form>
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          )}
          {user && (
            <NavLink to="/notifications" className={navClass}>
              Notifications
            </NavLink>
          )}
          <NavLink to="/blogs" className={navClass}>
            Blogs
          </NavLink>
          {user && (
            <NavLink to="/sessions" className={navClass}>
              Sessions
            </NavLink>
          )}
          {user && (
            <NavLink to="/mentors" className={navClass}>
              Mentors
            </NavLink>
          )}
          <NavLink to="/notices" className={navClass}>
            Notices
          </NavLink>
          {user && (
            <NavLink to="/chat" className={navClass}>
              Chat
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          )}
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                type="button"
                onClick={() => setOpen((v) => !v)}
              >
                Profile
              </button>
              {open && (
                <div className="absolute right-0 top-12 grid min-w-[220px] gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    {avatarSrc ? (
                      <img
                        className="h-9 w-9 rounded-full border-2 border-blue-100 object-cover"
                        src={avatarSrc}
                        alt="avatar"
                      />
                    ) : (
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {user.name?.slice(0, 1) || "U"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                  </div>
                  <span className="w-fit rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {user.role}
                  </span>
                  <div className="h-px bg-slate-200" />
                  <NavLink className={navClass} to="/dashboard" onClick={() => setOpen(false)}>
                    Dashboard
                  </NavLink>
                  <NavLink className={navClass} to="/profile" onClick={() => setOpen(false)}>
                    My Profile
                  </NavLink>
                  <button
                    className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5 hover:shadow-md"
                    type="button"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
