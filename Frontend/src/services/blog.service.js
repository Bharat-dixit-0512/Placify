import apiClient from "./apiClient.js"

export const listBlogs = (params) => apiClient.get("/blogs", { params })
export const getBlog = (id) => apiClient.get(`/blogs/${id}`)
export const createBlog = (payload) => apiClient.post("/blogs", payload)
export const updateBlog = (id, payload) => apiClient.put(`/blogs/${id}`, payload)
export const deleteBlog = (id) => apiClient.delete(`/blogs/${id}`)
export const listComments = (blogId, params) => apiClient.get(`/blogs/${blogId}/comments`, { params })
export const addComment = (blogId, payload) => apiClient.post(`/blogs/${blogId}/comments`, payload)
export const listReplies = (blogId, commentId, params) =>
  apiClient.get(`/blogs/${blogId}/comments/${commentId}/replies`, { params })
export const updateComment = (blogId, commentId, payload) =>
  apiClient.put(`/blogs/${blogId}/comments/${commentId}`, payload)
export const reactToComment = (blogId, commentId, payload) =>
  apiClient.post(`/blogs/${blogId}/comments/${commentId}/react`, payload)
export const reportComment = (blogId, commentId, payload) =>
  apiClient.post(`/blogs/${blogId}/comments/${commentId}/report`, payload)
export const deleteComment = (blogId, commentId) =>
  apiClient.delete(`/blogs/${blogId}/comments/${commentId}`)
