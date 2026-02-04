import apiClient from "./apiClient.js"

export const fetchProfile = () => apiClient.get("/users/me")
export const updateProfile = (payload) => apiClient.put("/users/me", payload)
export const listUsers = () => apiClient.get("/users")
export const searchUsers = (params) => apiClient.get("/users/search", { params })
export const listMentors = (params) => apiClient.get("/users/mentors", { params })
export const getMentor = (id) => apiClient.get(`/users/mentors/${id}`)
export const getMentorAvailability = (id) => apiClient.get(`/users/mentors/${id}/availability`)
export const updateMentorAvailability = (id, payload) =>
  apiClient.put(`/users/mentors/${id}/availability`, payload)
export const rateMentor = (id, payload) => apiClient.post(`/users/mentors/${id}/rate`, payload)
export const getMentorReviews = (id, params) =>
  apiClient.get(`/users/mentors/${id}/reviews`, { params })
export const changePassword = (payload) => apiClient.post("/users/change-password", payload)
export const changeEmail = (payload) => apiClient.post("/users/change-email", payload)
export const uploadAvatar = (file) => {
  const formData = new FormData()
  formData.append("avatar", file)
  return apiClient.post("/users/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  })
}
