import apiClient from "./apiClient.js"

export const listNotices = () => apiClient.get("/notices")
export const createNotice = (payload) => apiClient.post("/notices", payload)
export const updateNotice = (id, payload) => apiClient.put(`/notices/${id}`, payload)
export const deleteNotice = (id) => apiClient.delete(`/notices/${id}`)
