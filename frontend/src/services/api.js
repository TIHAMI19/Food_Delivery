import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) =>
    api.post("/auth/login", credentials).then((res) => res.data),
  register: (userData) =>
    api.post("/auth/register", userData).then((res) => res.data),
  getProfile: () => api.get("/auth/profile").then((res) => res.data),
  updateProfile: (userData) =>
    api.put("/auth/profile", userData).then((res) => res.data),
};

// Restaurant API endpoints
export const restaurantAPI = {
  getAll: (params) =>
    api.get("/restaurants", { params }).then((res) => res.data),
  getById: (id) => api.get(`/restaurants/${id}`).then((res) => res.data),
  create: (data) => api.post("/restaurants", data).then((res) => res.data),
  update: (id, data) =>
    api.put(`/restaurants/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/restaurants/${id}`).then((res) => res.data),
};

// Review API functions
export const reviewAPI = {
  getByRestaurant: (restaurantId, params = {}) =>
    api.get(`/reviews/restaurant/${restaurantId}`, { params }),

  create: (restaurantId, data) =>
    api.post(`/reviews/restaurant/${restaurantId}`, data),

  getMineForRestaurant: (restaurantId) =>
    api.get(`/reviews/restaurant/${restaurantId}/my`).then((res) => res.data),

  getMineForOrder: (orderId) =>
    api.get(`/reviews/order/${orderId}/my`).then((res) => res.data),

  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),

  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),

  markHelpful: (reviewId) => api.post(`/reviews/${reviewId}/helpful`),
};

// Menu API endpoints
export const menuAPI = {
  getByRestaurant: (restaurantId) =>
    api.get(`/menu/${restaurantId}`).then((res) => res.data),
  create: (data) => api.post("/menu", data).then((res) => res.data),
  update: (id, data) => api.put(`/menu/${id}`, data).then((res) => res.data),
  delete: (id) => api.delete(`/menu/${id}`).then((res) => res.data),
};

// Order API endpoints
export const orderAPI = {
  create: (data) => api.post("/orders", data).then((res) => res.data),
  getUserOrders: (params) => api.get("/orders", { params }).then((res) => res.data),
  getAdminOrders: (params) =>
    api.get("/orders/admin", { params }).then((res) => res.data),
  updateStatus: (id, status) =>
    api.put(`/orders/${id}/status`, { status }).then((res) => res.data),
  getById: (id) => api.get(`/orders/${id}`).then((res) => res.data),
};

// Search API endpoints
export const searchAPI = {
  search: (params) => api.get("/search", { params }).then((res) => res.data),
};

// Chat API endpoints
export const chatAPI = {
  ensureConversation: (customerId) =>
    api.post("/chat/ensure", customerId ? { customerId } : {}).then((res) => res.data),
  getConversations: () => api.get("/chat/conversations").then((res) => res.data),
  getMessages: (conversationId) =>
    api.get(`/chat/conversations/${conversationId}/messages`).then((res) => res.data),
  sendMessage: (conversationId, content) =>
    api.post(`/chat/conversations/${conversationId}/messages`, { content }).then((res) => res.data),
  markRead: (conversationId) =>
    api.post(`/chat/conversations/${conversationId}/read`).then((res) => res.data),
}

// Marketing API endpoints
export const marketingAPI = {
  getBanner: () => api.get("/marketing/banner").then((res) => res.data),
  uploadBanner: (file) => {
    const formData = new FormData();
    formData.append("image", file);
    return api
      .post("/marketing/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => res.data);
  },
  listBanners: () => api.get("/marketing/banners").then((res) => res.data),
  activateBanner: (id) => api.patch(`/marketing/banner/${id}/activate`).then((res) => res.data),
  deleteBanner: (id) => api.delete(`/marketing/banner/${id}`).then((res) => res.data),
};

// Notifications API
export const notificationsAPI = {
  list: (limit = 10) => api.get(`/notifications`, { params: { limit } }).then((r) => r.data),
  markAllRead: () => api.post(`/notifications/read-all`).then((r) => r.data),
};

// Coupons API
export const couponsAPI = {
  create: (data) => api.post(`/coupons`, data).then((r) => r.data), // admin
  list: () => api.get(`/coupons`).then((r) => r.data), // admin
  validate: ({ code, subtotal, restaurantId }) =>
    api
      .get(`/coupons/validate`, { params: { code, subtotal, restaurantId } })
      .then((r) => r.data),
};

export default api;
