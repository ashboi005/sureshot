const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Import performance monitoring
import { performanceMonitor } from './performance'

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000

// Simple in-memory cache for GET requests
const requestCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

const DEFAULT_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Cache utility functions
function getCacheKey(url: string, options?: RequestInit): string {
  const method = options?.method || 'GET'
  const headers = JSON.stringify(options?.headers || {})
  return `${method}:${url}:${headers}`
}

function isValidCacheEntry(entry: { timestamp: number; ttl: number }): boolean {
  return Date.now() - entry.timestamp < entry.ttl
}

function getCachedResponse(cacheKey: string): any | null {
  const entry = requestCache.get(cacheKey)
  if (entry && isValidCacheEntry(entry)) {
    return entry.data
  }
  if (entry) {
    requestCache.delete(cacheKey) // Clean up expired entries
  }
  return null
}

function setCachedResponse(cacheKey: string, data: any, ttl = DEFAULT_CACHE_TTL): void {
  // Limit cache size to prevent memory leaks
  if (requestCache.size > 100) {
    const firstKey = requestCache.keys().next().value
    if (firstKey) {
      requestCache.delete(firstKey)
    }
  }
  
  requestCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl
  })
}

// Custom fetch wrapper with timeout, error handling, and caching
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const startTime = Date.now()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  // Check cache for GET requests
  const method = options.method || 'GET'
  const cacheKey = getCacheKey(url, options)
  
  if (method === 'GET') {
    const cachedData = getCachedResponse(cacheKey)
    if (cachedData) {
      // Return a fake Response object with cached data
      const response = new Response(JSON.stringify(cachedData), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      })
      performanceMonitor.logRequest(url, Date.now() - startTime, true, 'cached')
      return response
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)
    const duration = Date.now() - startTime

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData = await response.json()
        if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: any) => err.msg).join(', ')
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail
          }
        }
      } catch {
        // If error response is not JSON, use default message
      }
      
      performanceMonitor.logRequest(url, duration, false, errorMessage)
      throw new Error(errorMessage)
    }

    // Cache successful GET responses
    if (method === 'GET' && response.status === 200) {
      try {
        const responseData = await response.clone().json()
        setCachedResponse(cacheKey, responseData)
      } catch {
        // If response is not JSON, don't cache
      }
    }

    performanceMonitor.logRequest(url, duration, true)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    const duration = Date.now() - startTime
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const timeoutError = 'Request timeout - please check your connection and try again'
        performanceMonitor.logRequest(url, duration, false, timeoutError)
        throw new Error(timeoutError)
      }
      performanceMonitor.logRequest(url, duration, false, error.message)
      throw error
    }
    
    const unexpectedError = 'An unexpected error occurred'
    performanceMonitor.logRequest(url, duration, false, unexpectedError)
    throw new Error(unexpectedError)
  }
}

// Retry wrapper for failed requests
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  delay = 1000
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Only retry on network errors or 5xx server errors
      if (error instanceof Error) {
        const shouldRetry = 
          error.message.includes('timeout') ||
          error.message.includes('network') ||
          error.message.includes('fetch') ||
          error.message.includes('5')
        
        if (!shouldRetry) {
          throw error
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

// API Response Types
export interface WorkerResponse {
  id: string
  user_id: string
  city_name: string
  government_id_url: string | null
  specialization: string
  experience_years: number
  is_active: boolean
  created_at: string
  username: string
  first_name: string
  last_name: string
  email: string
}

export interface DoctorResponse {
  id: string
  user_id: string
  medical_council_registration_url: string | null
  specialization: string
  hospital_affiliation: string
  experience_years: number
  is_active: boolean
  created_at: string
  username: string
  first_name: string
  last_name: string
  email: string
}

export interface VaccinationDriveResponse {
  id: string
  vaccination_name: string
  start_date: string
  end_date: string
  vaccination_city: string
  description: string
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  assigned_workers: WorkerResponse[]
}

export interface FileUploadResponse {
  file_url: string
  file_name: string
  file_size: number
  content_type: string
  upload_path: string
}

// API Request Types
export interface CreateWorkerRequest {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  city_name: string
  specialization: string
  experience_years: number
}

export interface CreateDoctorRequest {
  email: string
  password: string
  username: string
  first_name: string
  last_name: string
  specialization: string
  hospital_affiliation: string
  experience_years: number
}

export interface CreateVaccinationDriveRequest {
  vaccination_name: string
  start_date: string
  end_date: string
  vaccination_city: string
  description: string
  assigned_worker_ids: string[]
}

// API Functions
export const api = {
  // Workers
  async getWorkers(skip = 0, limit = 10, city?: string): Promise<{ workers: WorkerResponse[], total: number }> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(city && { city })
    })
    
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/workers?${params}`)
      return response.json()
    })
  },

  async createWorker(data: CreateWorkerRequest): Promise<WorkerResponse> {
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/workers`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    })
  },

  async uploadWorkerDocument(workerId: string, file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/upload/worker-document?worker_id=${workerId}`, {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData
      })
      return response.json()
    })
  },

  // Doctors
  async getDoctors(skip = 0, limit = 10, specialization?: string, activeOnly?: boolean): Promise<{ doctors: DoctorResponse[], total: number }> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(specialization && { specialization }),
      ...(activeOnly !== undefined && { active_only: activeOnly.toString() })
    })
    
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/doctors?${params}`)
      return response.json()
    })
  },

  async createDoctor(data: CreateDoctorRequest): Promise<DoctorResponse> {
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/doctors`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    })
  },

  async uploadDoctorDocument(doctorId: string, file: File): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/upload/doctor-document?doctor_id=${doctorId}`, {
        method: 'POST',
        headers: {}, // Remove Content-Type to let browser set it for FormData
        body: formData
      })
      return response.json()
    })
  },

  // Vaccination Drives
  async getVaccinationDrives(skip = 0, limit = 10, city?: string, activeOnly = true): Promise<{ drives: VaccinationDriveResponse[], total: number }> {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      active_only: activeOnly.toString(),
      ...(city && { city })
    })
    
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/vaccination-drives?${params}`)
      return response.json()
    })
  },

  async createVaccinationDrive(data: CreateVaccinationDriveRequest): Promise<VaccinationDriveResponse> {
    return withRetry(async () => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/admin/vaccination-drives`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
      return response.json()
    })
  }
}
