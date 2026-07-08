/**
 * API Client Service
 * Handles all HTTP communication with backend
 * Manages token storage and API versioning
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class APIClient {
  constructor() {
    this.baseURL = API_BASE;
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  setToken(token, refreshToken = null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  async request(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API Error: ${response.statusText}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout() {
    this.clearAuth();
    return Promise.resolve();
  }

  // Event endpoints
  async getEvents(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/events${query ? '?' + query : ''}`);
  }

  async getEvent(eventId) {
    return this.request(`/events/${eventId}`);
  }

  async createEvent(data) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId, data) {
    return this.request(`/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Ticket endpoints
  async getUserTickets() {
    return this.request('/tickets');
  }

  async purchaseTickets(data) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Loyalty endpoints
  async getLoyaltyAccount() {
    return this.request('/loyalty/account');
  }

  async redeemPoints(data) {
    return this.request('/loyalty/redeem', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLeaderboard(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/loyalty/leaderboard${query ? '?' + query : ''}`);
  }

  // Dashboard endpoints
  async getDashboard() {
    return this.request('/dashboard');
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }

  getBaseURL() {
    return this.baseURL;
  }
}

export const apiClient = new APIClient();
export default apiClient;
