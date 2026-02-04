import apiClient from "./apiClient.js"

export const requestChat = (payload) => apiClient.post("/chats", payload)
export const listChats = () => apiClient.get("/chats")
export const approveChat = (chatId) => apiClient.post(`/chats/${chatId}/approve`)
export const closeChat = (chatId) => apiClient.post(`/chats/${chatId}/close`)
export const listMessages = (chatId) => apiClient.get(`/chats/${chatId}/messages`)
export const sendMessage = (chatId, payload) =>
  apiClient.post(`/chats/${chatId}/messages`, payload)
export const markSeen = (chatId) => apiClient.post(`/chats/${chatId}/seen`)
export const updateMessage = (chatId, messageId, payload) =>
  apiClient.put(`/chats/${chatId}/messages/${messageId}`, payload)
export const deleteMessage = (chatId, messageId) =>
  apiClient.delete(`/chats/${chatId}/messages/${messageId}`)
export const cancelChat = (chatId) => apiClient.post(`/chats/${chatId}/cancel`)
