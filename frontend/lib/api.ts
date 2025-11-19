const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'

export interface ApiResponse<T> {
  success?: boolean
  error?: string
  data?: T
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error: any) {
      // Handle network errors gracefully
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        const isLocalhost = this.baseUrl.includes('localhost') || this.baseUrl.includes('127.0.0.1')
        if (isLocalhost) {
          console.warn(
            '⚠️ Backend server not available. Make sure backend is running on',
            this.baseUrl.replace('/api', '')
          )
        } else {
          console.error('⚠️ Cannot connect to backend API. Check your deployment configuration.')
        }
      }
      console.error('API request failed:', error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Auth API
export const authApi = {
  validateInitData: (initData: string) =>
    apiClient.post('/auth/validate', { initData }),
  registerUser: (userData: {
    telegramId: number
    username?: string
    firstName?: string
    lastName?: string
  }) => apiClient.post('/auth/register', userData),
}

// Inventory API
export const inventoryApi = {
  getInventory: () => apiClient.get('/inventory'),
  getGift: (giftId: string) => apiClient.get(`/inventory/${giftId}`),
}

// Game API
export const gameApi = {
  startSession: (giftId: string) =>
    apiClient.post('/game/session/start', { giftId }),
  cashOut: (sessionId: string) =>
    apiClient.post(`/game/session/${sessionId}/cashout`),
  getActiveSession: () => apiClient.get('/game/session/active'),
  getSessionHistory: (limit = 20, offset = 0) =>
    apiClient.get(`/game/session/history?limit=${limit}&offset=${offset}`),
}

