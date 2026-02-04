import apiClient from "./apiClient.js"

export const getAnalytics = () => apiClient.get("/admin/analytics")
export const approveUser = (id) => apiClient.post(`/admin/users/${id}/approve`)
export const deactivateUser = (id) => apiClient.post(`/admin/users/${id}/deactivate`)
export const listPendingUsers = () => apiClient.get("/admin/users/pending")
export const rejectUser = (id, payload) => apiClient.post(`/admin/users/${id}/reject`, payload)
export const activateUser = (id) => apiClient.post(`/admin/users/${id}/activate`)
export const listUsers = (params) => apiClient.get("/admin/users", { params })
export const listAuditLogs = (params) => apiClient.get("/admin/audit-logs", { params })
export const listReportedComments = (params) => apiClient.get("/admin/reported-comments", { params })
export const exportReportedComments = (params) =>
  apiClient.get("/admin/reported-comments/export", { params, responseType: "blob" })
export const assignReportedComment = (commentId, payload) =>
  apiClient.post(`/admin/reported-comments/${commentId}/assign`, payload)
export const resolveReportedComment = (commentId) =>
  apiClient.post(`/admin/reported-comments/${commentId}/resolve`)
export const removeReportedComment = (commentId) =>
  apiClient.delete(`/admin/reported-comments/${commentId}/remove`)
export const getRatingAnalytics = () => apiClient.get("/admin/ratings")
