/**
 * 🔌 API CLIENT
 * Cliente HTTP configurado para comunicação com o backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333'

interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Request failed')
      }

      return data
    } catch (error: any) {
      console.error('API Error:', error)
      return {
        success: false,
        error: error.message,
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_URL)

// ============================================
// HELPERS ESPECÍFICOS
// ============================================

export const dashboardApi = {
  getOverview: () => api.get('/api/analytics/dashboard/overview'),

  getParticipants: (limit = 50) =>
    api.get(`/api/analytics/participants?limit=${limit}`),

  getParticipantProfile: (jid: string) =>
    api.get(`/api/analytics/participants/${jid}/profile`),

  analyzeParticipant: (jid: string) =>
    api.post(`/api/analytics/participants/${jid}/analyze`),

  getSentimentOverview: () =>
    api.get('/api/analytics/sentiment/overview'),

  getSentimentProgression: (conversationJid: string, limit = 50) =>
    api.get(`/api/analytics/sentiment/conversation/${conversationJid}/progression?limit=${limit}`),

  getEmotionalPeaks: (conversationJid: string, threshold = 0.7) =>
    api.get(`/api/analytics/sentiment/conversation/${conversationJid}/peaks?threshold=${threshold}`),

  getRelationshipGraph: (conversationJid?: string) =>
    api.get(`/api/analytics/relationships/graph${conversationJid ? `?conversation=${conversationJid}` : ''}`),

  getStrongestRelationships: (limit = 20) =>
    api.get(`/api/analytics/relationships/strongest?limit=${limit}`),

  getInsights: (limit = 50) =>
    api.get(`/api/analytics/insights?limit=${limit}`),

  generateInsights: (data: { targetType: string; targetId?: string; insightTypes?: string[] }) =>
    api.post('/api/analytics/insights/generate', data),

  getAlerts: (limit = 50) =>
    api.get(`/api/analytics/alerts?limit=${limit}`),

  markAlertAsRead: (alertId: number) =>
    api.post(`/api/analytics/alerts/${alertId}/read`),

  getActivityHeatmap: () =>
    api.get('/api/analytics/activity/heatmap'),

  getTrendingTopics: () =>
    api.get('/api/analytics/activity/trending-topics'),

  getConversation: (jid: string) =>
    api.get(`/api/analytics/conversations/${jid}`),

  getConversationMessages: (jid: string, limit = 100, offset = 0) =>
    api.get(`/api/analytics/conversations/${jid}/messages?limit=${limit}&offset=${offset}`),

  getConversationMemories: (jid: string, limit = 20) =>
    api.get(`/api/analytics/conversations/${jid}/memories?limit=${limit}`),

  getAnomalies: () =>
    api.get('/api/analytics/anomalies'),
}

export default api
