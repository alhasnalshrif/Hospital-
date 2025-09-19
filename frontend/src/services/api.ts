import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse } from '../types'

// Axios instance with optimized configuration
class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: '/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('hospital_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // Handle API response format
        if (response.data && !response.data.success) {
          throw new Error(response.data.error || 'API request failed')
        }
        return response
      },
      (error) => {
        // Handle different error types
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('hospital_token')
          localStorage.removeItem('hospital_user')
          window.location.href = '/login'
        }
        
        // Return standardized error
        const errorMessage = 
          error.response?.data?.error ||
          error.message ||
          'An unexpected error occurred'
        
        throw new Error(errorMessage)
      }
    )
  }

  // Generic API methods
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<ApiResponse<T>>(url, { params })
    return response.data.data as T
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<ApiResponse<T>>(url, data)
    return response.data.data as T
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<ApiResponse<T>>(url, data)
    return response.data.data as T
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<ApiResponse<T>>(url)
    return response.data.data as T
  }

  // Authentication methods
  async login(credentials: { email: string; password: string }) {
    const response = await this.api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', credentials)
    
    if (response.data.success && response.data.data) {
      const { user, token } = response.data.data
      localStorage.setItem('hospital_token', token)
      localStorage.setItem('hospital_user', JSON.stringify(user))
      return { user, token }
    }
    
    throw new Error(response.data.error || 'Login failed')
  }

  async logout() {
    try {
      await this.api.post('/auth/logout')
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('hospital_token')
      localStorage.removeItem('hospital_user')
    }
  }

  // Patients API
  async getPatients(params: any) {
    return this.get('/patients', params)
  }

  async getPatient(id: string, params?: any) {
    return this.get(`/patients/${id}`, params)
  }

  async createPatient(data: any) {
    return this.post('/patients', data)
  }

  async updatePatient(id: string, data: any) {
    return this.put(`/patients/${id}`, data)
  }

  async deletePatient(id: string) {
    return this.delete(`/patients/${id}`)
  }

  // Medical Records API
  async getMedicalRecords(params: any) {
    return this.get('/medical-records', params)
  }

  async getMedicalRecord(id: string) {
    return this.get(`/medical-records/${id}`)
  }

  async createMedicalRecord(data: any) {
    return this.post('/medical-records', data)
  }

  async updateMedicalRecord(id: string, data: any) {
    return this.put(`/medical-records/${id}`, data)
  }

  // Appointments API
  async getAppointments(params: any) {
    return this.get('/appointments', params)
  }

  async getAppointment(id: string) {
    return this.get(`/appointments/${id}`)
  }

  async createAppointment(data: any) {
    return this.post('/appointments', data)
  }

  async updateAppointment(id: string, data: any) {
    return this.put(`/appointments/${id}`, data)
  }

  async cancelAppointment(id: string, reason: string) {
    return this.put(`/appointments/${id}/cancel`, { reason })
  }

  // Bills API
  async getBills(params: any) {
    return this.get('/billing/bills', params)
  }

  async getBill(id: string) {
    return this.get(`/billing/bills/${id}`)
  }

  async createBill(data: any) {
    return this.post('/billing/bills', data)
  }

  async updateBill(id: string, data: any) {
    return this.put(`/billing/bills/${id}`, data)
  }

  // Dashboard API
  async getDashboardStats(params?: any) {
    return this.get('/dashboard/stats', params)
  }

  // Users API
  async getUsers(params: any) {
    return this.get('/users', params)
  }

  async getUser(id: string) {
    return this.get(`/users/${id}`)
  }

  async createUser(data: any) {
    return this.post('/users', data)
  }

  async updateUser(id: string, data: any) {
    return this.put(`/users/${id}`, data)
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService