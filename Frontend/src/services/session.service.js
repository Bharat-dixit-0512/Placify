import apiClient from "./apiClient.js"

export const listSessions = (params) => apiClient.get("/sessions", { params })
export const createSession = (payload) => apiClient.post("/sessions", payload)
export const joinSession = (id) => apiClient.post(`/sessions/${id}/join`)
export const updateSession = (id, payload) => apiClient.put(`/sessions/${id}`, payload)
export const deleteSession = (id) => apiClient.delete(`/sessions/${id}`)
