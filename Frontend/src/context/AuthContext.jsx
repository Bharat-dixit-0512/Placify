import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { fetchMe } from "../services/auth.service.js"

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async () => {
    try {
      const { data } = await fetchMe()
      setUser(data.data)
    } catch {
      localStorage.removeItem("token")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    loadUser()
  }, [])

  const login = (userData, token) => {
    if (token) {
      localStorage.setItem("token", token)
    }
    setUser(userData || null)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh: loadUser
    }),
    [user, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export { AuthProvider, useAuth }
