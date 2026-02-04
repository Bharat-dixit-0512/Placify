import apiClient from "./apiClient.js"

export const fetchPublicStats = () => apiClient.get("/public/stats")
