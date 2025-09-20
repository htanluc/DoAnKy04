"use client"

import { useApiCache } from '@/hooks/use-api-cache'

// Base API client with caching and request deduplication
class ApiClient {
  private baseURL = 'http://localhost:8080/api'
  private cache = new Map<string, { data: any; timestamp: number; promise?: Promise<any> }>()
  private pendingRequests = new Map<string, Promise<any>>()
  private requestQueue = new Map<string, Array<{ resolve: Function; reject: Function }>>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 1000 // 1 second
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('token')
  }

  private isExpired(entry: { data: any; timestamp: number }): boolean {
    return Date.now() - entry.timestamp > this.CACHE_TTL
  }

  private createRequestKey(endpoint: string, options: RequestInit): string {
    const method = options.method || 'GET'
    const body = options.body ? JSON.stringify(options.body) : ''
    const headers = options.headers ? JSON.stringify(options.headers) : ''
    return `${method}:${endpoint}:${body}:${headers}`
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = this.MAX_RETRIES): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        console.log(`🔄 Retrying request, ${retries} attempts left`)
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY))
        return this.withRetry(fn, retries - 1)
      }
      throw error
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    })
    
    return Promise.race([promise, timeout])
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}, 
    useCache = true
  ): Promise<T> {
    const token = this.getToken()
    if (!token && endpoint !== '/auth/login' && endpoint !== '/auth/register') {
      throw new Error('Chưa đăng nhập')
    }

    const url = `${this.baseURL}${endpoint}`
    const cacheKey = `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`
    const requestKey = this.createRequestKey(endpoint, options)

    // Check cache first
    if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      const cached = this.cache.get(cacheKey)
      if (cached && !this.isExpired(cached)) {
        console.log(`💾 Cache hit: ${requestKey}`)
        return cached.data
      }

      // Check if there's already a pending request
      if (this.pendingRequests.has(requestKey)) {
        console.log(`🔄 Request deduplication: ${requestKey}`)
        return this.pendingRequests.get(requestKey)!
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const requestOptions: RequestInit = {
      ...options,
      headers,
    }

    const promise = this.withRetry(async () => {
      return this.withTimeout(
        fetch(url, requestOptions)
          .then(async (res) => {
            if (!res.ok) {
              const errorText = await res.text()
              throw new Error(`HTTP ${res.status}: ${errorText}`)
            }
            return res.json()
          }),
        this.REQUEST_TIMEOUT
      )
    })
    .then((data) => {
      // Cache successful responses
      if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
      }
      return data
    })
    .catch((error) => {
      // Remove failed requests from cache
      this.cache.delete(cacheKey)
      throw error
    })
    .finally(() => {
      // Clean up pending request
      this.pendingRequests.delete(requestKey)
    })

    // Store promise for request deduplication
    this.pendingRequests.set(requestKey, promise)

    // Store promise in cache for request deduplication
    if (useCache && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
      this.cache.set(cacheKey, {
        data: null as any,
        timestamp: Date.now(),
        promise
      })
    }

    return promise
  }

  // Auth endpoints
  async login(credentials: { phoneNumber: string; password: string }) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false) as any
    
    // Clear cache on login
    this.cache.clear()
    return result
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false) as any
  }

  async getCurrentUser(forceRefresh = false) {
    if (forceRefresh) {
      this.cache.delete('GET:http://localhost:8080/api/auth/me:')
    }
    
    const result = await this.request('/auth/me') as any
    return result.success && result.data ? result.data : null
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    const result = await this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false) as any
    
    if (!result.success) {
      throw new Error(result.message || 'Đổi mật khẩu thất bại')
    }
    return result
  }

  // Dashboard endpoints
  async getDashboardStats() {
    try {
      return await this.request('/dashboard/stats')
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalInvoices: 0,
        pendingInvoices: 0,
        overdueInvoices: 0,
        totalAmount: 0,
        unreadAnnouncements: 0,
        upcomingEvents: 0,
        activeBookings: 0,
        supportRequests: 0
      }
    }
  }

  async getRecentActivities() {
    try {
      return await this.request('/dashboard/recent-activities')
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return []
    }
  }

  // Invoices endpoints
  async getMyInvoices() {
    const result = await this.request('/invoices/my') as any
    return Array.isArray(result) ? result : result.data
  }

  async getInvoiceDetail(invoiceId: string | number) {
    try {
      const result = await this.request(`/invoices/${invoiceId}`) as any
      return result?.data || result
    } catch (error) {
      // Fallback: get from list
      const list = await this.getMyInvoices()
      const found = list.find((inv: any) => Number(inv.id) === Number(invoiceId))
      if (found) return found
      throw new Error('Không lấy được chi tiết hóa đơn')
    }
  }

  async getPaymentsByInvoice(invoiceId: string) {
    return this.request(`/payments/invoice/${invoiceId}`)
  }

  // Payment endpoints
  async createMoMoPayment(invoiceId: number, amount: number, orderInfo: string) {
    const params = new URLSearchParams({
      invoiceId: invoiceId.toString(),
      amount: amount.toString(),
      orderInfo: orderInfo
    })
    
    return this.request(`/payments/momo?${params}`, {
      method: 'POST',
    }, false)
  }

  async createVNPayPayment(invoiceId: number, amount: number, orderInfo: string) {
    return this.request('/payments/vnpay', {
      method: 'POST',
      body: JSON.stringify({
        orderId: invoiceId.toString(),
        amount: amount,
        orderInfo: orderInfo
      }),
    }, false)
  }

  async createZaloPayPayment(invoiceId: number, amount: number, orderInfo: string) {
    const params = new URLSearchParams({
      invoiceId: invoiceId.toString(),
      amount: amount.toString(),
      orderInfo: orderInfo
    })
    
    return this.request(`/payments/zalopay?${params}`, {
      method: 'POST',
    }, false)
  }

  async createVisaPayment(invoiceId: number, amount: number, orderInfo: string) {
    const params = new URLSearchParams({
      invoiceId: invoiceId.toString(),
      amount: amount.toString(),
      orderInfo: orderInfo
    })
    
    return this.request(`/payments/stripe?${params}`, {
      method: 'POST',
    }, false)
  }

  // Events endpoints
  async getEvents() {
    return this.request('/events')
  }

  async registerEvent(data: any) {
    return this.request('/event-registrations/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  }

  async cancelEventRegistration(registrationId: string) {
    return this.request(`/event-registrations/${registrationId}/cancel`, {
      method: 'DELETE',
    }, false)
  }

  async cancelEventRegistrationByEventId(eventId: string) {
    return this.request(`/event-registrations/cancel/${eventId}`, {
      method: 'DELETE',
    }, false)
  }

  // Facilities endpoints
  async getFacilities() {
    const result = await this.request('/facilities') as any
    // Xử lý dữ liệu facilities từ API
    let facilitiesList = []
    if (Array.isArray(result)) {
      facilitiesList = result
    } else if (result.data && Array.isArray(result.data)) {
      facilitiesList = result.data
    } else if (result.success && result.data && Array.isArray(result.data)) {
      facilitiesList = result.data
    }
    
    // Map dữ liệu từ database format sang frontend format
    return facilitiesList.map((facility: any) => {
      console.log('Raw facility data:', facility) // Debug log
      return {
        id: facility.id?.toString() || '',
        name: facility.name || '',
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity || 0,
        usageFee: facility.usage_fee || facility.usageFee || 0,
        image: facility.image || '',
        amenities: facility.amenities || [],
        openingHours: facility.opening_hours || facility.openingHours || '',
        status: facility.status || 'AVAILABLE'
      }
    })
  }

  async getMyFacilityBookings() {
    return this.request('/facility-bookings/my')
  }

  async createFacilityBooking(data: any) {
    return this.request('/facility-bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  }

  async cancelFacilityBooking(id: string) {
    return this.request(`/facility-bookings/${id}`, {
      method: 'DELETE',
    }, false)
  }

  // Announcements endpoints
  async getAnnouncements() {
    return this.request('/announcements')
  }

  async markAnnouncementAsRead(id: string) {
    return this.request(`/announcements/${id}/read`, {
      method: 'PUT',
    }, false)
  }

  async markAllAnnouncementsAsRead(ids: string[]) {
    // Sequential processing for now
    for (const id of ids) {
      await this.markAnnouncementAsRead(id)
    }
    return true
  }

  // Support requests endpoints
  async getMySupportRequests() {
    return this.request('/support-requests/my')
  }

  async createSupportRequest(data: any) {
    return this.request('/support-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  }

  // Feedback endpoints
  async getMyFeedback() {
    return this.request('/feedback/my')
  }

  async createFeedback(data: any) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  }

  // Auto payment endpoints
  async getAutoPaymentSettings() {
    return this.request('/payments/auto/settings')
  }

  async setupAutoPayment(data: any) {
    return this.request('/payments/auto/setup', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false)
  }

  async cancelAutoPayment() {
    return this.request('/payments/auto/cancel', {
      method: 'DELETE',
    }, false)
  }

  // AI endpoints
  async askAI(question: string) {
    return this.request('/ai/qa', {
      method: 'POST',
      body: JSON.stringify({ question }),
    }, false)
  }

  async getAIHistory() {
    return this.request('/ai/qa/history')
  }

  // Utility methods
  invalidateCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern)
      for (const key of Array.from(this.cache.keys())) {
        if (regex.test(key)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Request deduplication utilities
  getPendingRequests(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  clearPendingRequests() {
    this.pendingRequests.clear()
  }

  getCacheStats() {
    const now = Date.now()
    const entries = Array.from(this.cache.values())
    const validEntries = entries.filter(entry => !this.isExpired(entry))
    
    return {
      cacheSize: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.cache.keys()),
      pendingKeys: Array.from(this.pendingRequests.keys()),
      cacheHitRate: validEntries.length / Math.max(entries.length, 1)
    }
  }

  // Batch requests to reduce network calls
  async batchRequest<T>(requests: Array<{ endpoint: string; options?: RequestInit }>): Promise<T[]> {
    const promises = requests.map(({ endpoint, options }) => 
      this.request<T>(endpoint, options)
    )
    return Promise.all(promises)
  }

  // Preload critical data
  async preloadCriticalData() {
    const criticalEndpoints = [
      '/auth/me',
      '/dashboard/stats',
      '/facilities',
      '/announcements'
    ]

    const promises = criticalEndpoints.map(endpoint => 
      this.request(endpoint).catch(error => {
        console.warn(`Failed to preload ${endpoint}:`, error)
        return null
      })
    )

    return Promise.allSettled(promises)
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export individual methods for backward compatibility
export const {
  login: loginUser,
  register: registerUser,
  getCurrentUser: fetchCurrentUser,
  changePassword,
  getDashboardStats: fetchDashboardStats,
  getRecentActivities: fetchRecentActivities,
  getMyInvoices: fetchMyInvoices,
  getInvoiceDetail: fetchInvoiceDetail,
  getPaymentsByInvoice: fetchPaymentsByInvoice,
  createMoMoPayment,
  createVNPayPayment,
  createZaloPayPayment,
  createVisaPayment,
  getEvents: fetchEvents,
  registerEvent,
  cancelEventRegistration,
  cancelEventRegistrationByEventId,
  getFacilities: fetchFacilities,
  getMyFacilityBookings: fetchMyFacilityBookings,
  createFacilityBooking,
  cancelFacilityBooking,
  getAnnouncements: fetchAnnouncements,
  markAnnouncementAsRead,
  markAllAnnouncementsAsRead,
  getMySupportRequests: fetchMySupportRequests,
  createSupportRequest,
  getMyFeedback: fetchMyFeedback,
  createFeedback,
  getAutoPaymentSettings: fetchAutoPaymentSettings,
  setupAutoPayment,
  cancelAutoPayment,
  askAI,
  getAIHistory: fetchAIHistory,
} = apiClient

export default apiClient
