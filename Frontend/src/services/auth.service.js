import apiClient from "./apiClient.js"

export const registerUser = (payload) => apiClient.post("/auth/register", payload)
export const loginUser = (payload) => apiClient.post("/auth/login", payload)
export const fetchMe = () => apiClient.get("/auth/me")
export const requestOtp = (payload) => apiClient.post("/auth/request-otp", payload)
export const verifyOtp = (payload) => apiClient.post("/auth/verify-otp", payload)
