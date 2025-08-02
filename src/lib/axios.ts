import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5030/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        if (typeof window !== 'undefined') {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        toast.error('Session expired. Please log in again.')
      }
      // Handle 403 Forbidden
      else if (error.response.status === 403) {
                toast.error('Access denied. You do not have permission to perform this action.')
        }
        // Handle 404 Not Found
        else if (error.response.status === 404) {
          toast.error('Resource not found.')
        }
        // Handle 422 Validation Error
        else if (error.response.status === 422) {
          const errors = error.response.data.errors
          if (errors && typeof errors === 'object') {
            Object.values(errors).forEach((error: any) => {
              if (Array.isArray(error)) {
                error.forEach((e) => toast.error(e))
              } else if (typeof error === 'string') {
                toast.error(error)
              }
            })
          } else {
            toast.error('Validation error occurred.')
          }
        }
        // Handle 500 Internal Server Error
        else if (error.response.status >= 500) {
          toast.error('Server error. Please try again later.')
        }
        // Handle other errors
        else {
          const message = error.response.data?.message || 'An error occurred.'
          toast.error(message)
        }
      }
      // Handle network errors
      else if (error.request) {
        toast.error('Network error. Please check your connection.')
      }
      // Handle other errors
      else {
        toast.error('An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

export default api 