// Get API base URL from environment variable
// In production (GitHub Pages), this must be set via GitHub Secrets
// In development, defaults to localhost
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'
  
  // Ensure the URL is absolute (starts with http:// or https://)
  // This prevents Next.js basePath from affecting API calls
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl
  }
  
  // If relative URL provided, log warning and try to construct absolute URL
  console.warn('⚠️ API URL should be absolute (start with http:// or https://). Got:', envUrl)
  
  // In production, construct absolute URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Production - should use Railway backend
      console.error(
        '⚠️ NEXT_PUBLIC_API_BASE_URL must be an absolute URL! ' +
        'Please set it in GitHub Secrets as: https://your-backend.railway.app/api'
      )
      // Return the env URL anyway, but it will likely fail
      return envUrl
    }
  }
  
  // Development - localhost is fine
  return envUrl.startsWith('/') ? `http://localhost:4000${envUrl}` : `http://localhost:4000/${envUrl}`
}

const API_BASE_URL = getApiBaseUrl()

// Log the API URL being used (for debugging)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL)
}

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
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    // Construct full URL - ensure baseUrl is absolute
    let url: string
    if (this.baseUrl.startsWith('http://') || this.baseUrl.startsWith('https://')) {
      // Absolute URL - use as-is
      url = `${this.baseUrl}${normalizedEndpoint}`
    } else {
      // Relative URL - this shouldn't happen in production
      console.error('⚠️ API base URL is not absolute:', this.baseUrl)
      url = `${this.baseUrl}${normalizedEndpoint}`
    }
    
    // Log the full URL for debugging (only in development)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('🌐 API Request:', url)
    }
    
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

// Inventory API types
export interface InventoryResponse {
  inventory: Array<{
    id: string
    name: string | null
    description: string | null
    image_url: string | null
    animation_url: string | null
    animation_data: any | null
    gift_url: string | null
    external_url: string | null
    rarity: string | null
    created_at: string
    updated_at: string
  }>
}

export interface GiftResponse {
  gift: {
    id: string
    name: string | null
    description: string | null
    image_url: string | null
    animation_url: string | null
    animation_data: any | null
    gift_url: string | null
    external_url: string | null
    rarity: string | null
    created_at: string
    updated_at: string
  }
}

// Inventory API
export const inventoryApi = {
  getInventory: () => apiClient.get<InventoryResponse>('/inventory'),
  getGift: (giftId: string) => apiClient.get<GiftResponse>(`/inventory/${giftId}`),
}

// Gift Processing API
export const giftProcessingApi = {
  processGiftUrl: (giftUrl: string) =>
    apiClient.post('/gifts/process', { giftUrl }),
  processAndUpdateGift: (giftId: string, giftUrl: string) =>
    apiClient.post('/gifts/process-and-update', { giftId, giftUrl }),
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

