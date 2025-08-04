// src/lib/api.ts
import useSWR, { mutate } from 'swr'
import type {
  AuthResponse,
  User,
  Event,
  NotificationSettings,
  EventDto,
  EventCreateDto,
  LoginDto,
  RegisterDto,
  CommentDto,
  CreateCommentDto,
  UpdateCommentDto,
  ReactionDto,
  TelegramLinkDto,
  ConfirmTelegramCodeDto,
  MuteDto,
  MuteDurationDto,
  BanDto,
  BanDurationDto,
  NotificationDto,
  PaginatedResponse,
  EventFilterDto,
  UserFilterDto,
  CommentFilterDto,
  UserProfileDto,
  ProfileUpdateDto,
  UserUpdateDto,
  TransferOwnershipResponseDto,
  ActivityLogFilterDto,
  ActivityLog,
  ActivitySummary,
  OrganizerBlacklistDto,
  CreateBlacklistEntryDto,
  RemoveBlacklistEntryDto
} from './types'
import toast from 'react-hot-toast'
import axios from 'axios'

export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5030/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('token')
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Token attached to request:', token.substring(0, 20) + '...')
    } else {
      console.log('No token found in localStorage')
    }
    console.log('Making request to:', config.url, 'with method:', config.method)
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status, response.config.url)
    return response
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data, error.config?.url)
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('401 Unauthorized error - removing token')
        localStorage.removeItem('token')
        if (typeof window !== 'undefined') {
          // (typeof window !== 'undefined' ? window : undefined).location.href = '/login'
        }
        toast.error('Session expired. Please log in again.')
      }
      // Handle 403 Forbidden
      else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action.')
      }
      // Handle other errors
      else {
        const message = error.response.data?.message || 'An error occurred'
        toast.error(message)
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }
    return Promise.reject(error)
  }
)

// ==================== Events ====================
export const confirmTelegramCode = async (dto: { code: number }): Promise<User> => {
  const response = await api.post('User/confirm-telegram', { Code: dto.code })
  return response.data
}

export const startDeleteConfirmation = async (userId: number): Promise<void> => {
  await api.post(`User/${userId}/start-delete-confirmation`)
}

export const startSeedConfirmation = async (): Promise<void> => {
  await api.post('User/start-seed-confirmation')
}

export const startOwnershipConfirmation = async (): Promise<void> => {
  await api.post('User/start-ownership-confirmation')
}

export const confirmDeleteCode = async (dto: { code: number }): Promise<{ message: string }> => {
  const response = await api.post('User/confirm-delete', { Code: dto.code })
  return response.data
}

export const useEvents = (filters?: EventFilterDto) => {
  const queryString = filters 
    ? `?${new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]).toString()}`
    : ''
  
  return useSWR<PaginatedResponse<Event>>(
    [`Event${queryString}`],
    async () => {
      const response = await api.get(`Event${queryString}`)
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const useUserEvents = (filters?: EventFilterDto) => {
  const queryString = filters 
    ? `?${new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]).toString()}`
    : ''
  
  return useSWR<PaginatedResponse<Event>>(
    [`User/created-events${queryString}`],
    async () => {
      const response = await api.get(`User/created-events${queryString}`)
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const useEvent = (id: string | number | null) => {
  return useSWR<Event>(
    id ? `Event/${id}` : null,
    async () => {
      const response = await api.get(`Event/${id}`)
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const useEventsSimple = () => {
  return useSWR<PaginatedResponse<Event>>(
    'Event',
    async () => {
      const response = await api.get('Event?pageNumber=1&pageSize=6&sortBy=StartDate&order=asc')
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const updateUser = async (userId: number, userData: any): Promise<void> => {
  const response = await api.put(`User/${userId}`, userData)
  return response.data
}

export const useFavorites = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return useSWR<Event[]>(
    token ? 'FavoriteEvents' : null,
    async () => {
      const response = await api.get('FavoriteEvents')
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const usePlannedEvents = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return useSWR<Event[]>(
    token ? 'PlannedEvents' : null,
    async () => {
      const response = await api.get('PlannedEvents')
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

// Alias for usePlannedEvents for backward compatibility
export const useGoingToEvents = usePlannedEvents

export const toggleFavorite = async (eventId: string | number): Promise<{ isFavorite: boolean }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to add favorites')
    throw new Error('Authentication required')
  }
  
  try {
    const response = await api.post(`FavoriteEvents/${eventId}`)
    
    // Update SWR cache for events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('Event'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for user events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('User/created-events'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for favorites
    await mutate('FavoriteEvents')
    
    return response.data
  } catch (error) {
    toast.error('Failed to toggle favorite')
    throw error
  }
}

export const deleteFavorite = async (eventId: string | number): Promise<{ isFavorite: boolean }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to manage favorites')
    throw new Error('Authentication required')
  }
  
  try {
    const response = await api.delete(`FavoriteEvents/${eventId}`)
    
    // Update SWR cache for events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('Event'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for user events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('User/created-events'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for favorites
    await mutate('FavoriteEvents')
    
    return response.data
  } catch (error) {
    toast.error('Failed to delete favorite')
    throw error
  }
}

export const togglePlanned = async (eventId: string | number): Promise<{ isPlanned: boolean }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to plan events')
    throw new Error('Authentication required')
  }
  
  try {
    const response = await api.post(`PlannedEvents/${eventId}`)
    
    // Update SWR cache for events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('Event'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for user events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('User/created-events'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for planned events
    await mutate('PlannedEvents')
    
    return response.data
  } catch (error: any) {
    // Check if it's a blacklist error
    if (error.response?.status === 403 && error.response?.data?.message?.includes('banned')) {
      // We'll use a simple message here since we can't access t() in this context
      toast.error('You are banned from attending events by this organizer')
    } else {
      toast.error('Failed to toggle planned status')
    }
    throw error
  }
}

export const deletePlanned = async (eventId: string | number): Promise<{ isPlanned: boolean }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to manage planned events')
    throw new Error('Authentication required')
  }
  
  try {
    const response = await api.delete(`PlannedEvents/${eventId}`)
    
    // Update SWR cache for events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('Event'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for user events
    await mutate(
      (key) => typeof key === 'string' && key.startsWith('User/created-events'),
      undefined,
      { revalidate: true }
    )
    
    // Update SWR cache for planned events
    await mutate('PlannedEvents')
    
    return response.data
  } catch (error) {
    toast.error('Failed to delete planned status')
    throw error
  }
}

export const checkEventStatus = async (eventId: string | number): Promise<{ isFavorite: boolean; isPlanned: boolean }> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    return { isFavorite: false, isPlanned: false }
  }
  
  try {
    const response = await api.get(`Event/${eventId}/status`)
    return response.data
  } catch (error) {
    console.error('Failed to check event status:', error)
    return { isFavorite: false, isPlanned: false }
  }
}

export const createEvent = async (event: EventCreateDto): Promise<Event> => {
  try {
    console.log('Creating event with data:', event)
    const response = await api.post('Event', event)
    console.log('Event created successfully:', response.data)
    return response.data
  } catch (error: any) {
    console.error('Error creating event:', error)
    const errorMessage = error.response?.data?.message || 'Failed to create event'
    throw new Error(errorMessage)
  }
}

export const updateEvent = async (id: number, event: EventCreateDto): Promise<Event> => {
  try {
    const response = await api.put(`Event/${id}`, event)
    toast.success('Event updated successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to update event')
    throw error
  }
}

export const deleteEvent = async (eventId: number): Promise<void> => {
  try {
    await api.delete(`Event/${eventId}`)
    toast.success('Event deleted successfully')
  } catch (error) {
    toast.error('Failed to delete event')
    throw error
  }
}

// ==================== Comments ====================

export const useComments = (eventId: string | number | null) => {
  const cacheKey = eventId ? [`comments/${eventId}/`] : null
  console.log('useComments cache key:', cacheKey)
  
  return useSWR(
    cacheKey,
    async () => {
      const response = await api.get(`comments/${eventId}/`)
      console.log('Comments fetched:', response.data)
      return response.data
    }
  )
}

export const getAllComments = async (pageNumber: number = 1, pageSize: number = 10) => {
  const response = await api.get(`comments/all?pageNumber=${pageNumber}&pageSize=${pageSize}`)
  return response.data
}

export const createComment = async (eventId: number, data: CreateCommentDto): Promise<CommentDto> => {
  const response = await api.post(`comments/${eventId}/`, data)
  
  // Update the specific cache key
  const cacheKey = [`comments/${eventId}/`]
  await mutate(cacheKey, undefined, { revalidate: true })
  
  return response.data
}

export const updateComment = async (commentId: number, data: UpdateCommentDto): Promise<CommentDto> => {
  try {
    const response = await api.put(`comments/${commentId}`, data)
    
    console.log('Comment updated successfully, updating cache...')
    
    // Add a small delay to ensure the server has processed the update
    setTimeout(async () => {
      // Force revalidation of all comment caches
      await mutate(
        (key) => {
          if (Array.isArray(key) && key[0] && typeof key[0] === 'string' && key[0].startsWith('comments/')) {
            console.log('Found comment cache key:', key)
            return true
          }
          return false
        },
        undefined,
        { revalidate: true }
      )
      
      console.log('Cache updated successfully')
    }, 100)
    
    return response.data
  } catch (error) {
    toast.error('Failed to update comment')
    throw error
  }
}

export const deleteComment = async (commentId: number): Promise<void> => {
  try {
    const response = await api.delete(`comments/${commentId}`)
    
    // Get the event ID from the response to update the specific cache key
    // Since delete doesn't return the event ID, we'll need to update all comment caches
    await mutate(
      (key) => {
        if (Array.isArray(key) && key[0] && typeof key[0] === 'string' && key[0].startsWith('comments/')) {
          return true
        }
        return false
      },
      undefined,
      { revalidate: true }
    )
  } catch (error) {
    console.error('Failed to delete comment:', error)
    toast.error('Failed to delete comment')
    throw error
  }
}

export const deleteAdminComment = async (commentId: number): Promise<void> => {
  try {
    await api.delete(`comments/admin/${commentId}`)
    
    // Update SWR cache for comments
    await mutate(
      (key) => {
        if (Array.isArray(key) && key[0] && typeof key[0] === 'string' && key[0].startsWith('comments/')) {
          return true
        }
        return false
      },
      undefined,
      { revalidate: true }
    )
  } catch (error) {
    console.error('Failed to delete comment as admin:', error)
    toast.error('Failed to delete comment')
    throw error
  }
}

export const pinComment = async (commentId: number): Promise<CommentDto> => {
  try {
    const response = await api.patch(`comments/pin/${commentId}?pinned=true`)
    
    // Update SWR cache for comments
    await mutate(
      (key) => {
        if (Array.isArray(key) && key[0] && typeof key[0] === 'string' && key[0].startsWith('comments/')) {
          return true
        }
        return false
      },
      undefined,
      { revalidate: true }
    )
    
    return response.data
  } catch (error) {
    console.error('Failed to pin comment:', error)
    toast.error('Failed to pin comment')
    throw error
  }
}

export const unpinComment = async (commentId: number): Promise<CommentDto> => {
  try {
    const response = await api.patch(`comments/pin/${commentId}?pinned=false`)
    
    // Update SWR cache for comments
    await mutate(
      (key) => {
        if (Array.isArray(key) && key[0] && typeof key[0] === 'string' && key[0].startsWith('comments/')) {
          return true
        }
        return false
      },
      undefined,
      { revalidate: true }
    )
    
    return response.data
  } catch (error) {
    console.error('Failed to unpin comment:', error)
    toast.error('Failed to unpin comment')
    throw error
  }
}

// ==================== Reactions ====================

export interface ReactionCountDto {
  Emoji: string
  Count: number
}

export const useReactionCounts = (eventId: string | number | null) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return useSWR<ReactionCountDto[]>(
    eventId && token ? [`events/${eventId}/reactions/counts`] : null,
    async () => {
      const response = await api.get(`events/${eventId}/reactions/counts`)
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const addReaction = async (eventId: number, emoji: string): Promise<void> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to react to events')
    throw new Error('Authentication required')
  }
  
  try {
    await api.post(`events/${eventId}/reactions`, { Emoji: emoji })
  } catch (error) {
    toast.error('Failed to add reaction')
    throw error
  }
}

export const removeReaction = async (eventId: number): Promise<void> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    toast.error('Please log in to manage reactions')
    throw new Error('Authentication required')
  }
  
  try {
    await api.delete(`events/${eventId}/reactions`)
  } catch (error) {
    toast.error('Failed to remove reaction')
    throw error
  }
}

export const getUserReaction = async (eventId: number): Promise<{ Emoji: string } | null> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    return null
  }
  
  try {
    const response = await api.get(`events/${eventId}/reactions/user`)
    return response.data
  } catch (error: any) {
    // If user has no reaction, API returns 404, which is fine
    if (error.response?.status === 404) {
      return null
    }
    console.error('Failed to get user reaction:', error)
    return null
  }
}

export const useUserReaction = (eventId: string | number | null) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  return useSWR<{ Emoji: string } | null>(
    eventId && token ? [`events/${eventId}/reactions/user`] : null,
    async () => {
      try {
        const response = await api.get(`events/${eventId}/reactions/user`)
        return response.data
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null
        }
        throw error
      }
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const removeReactionByUser = async (userId: number): Promise<void> => {
  try {
    await api.delete(`users/${userId}/reactions`)
  } catch (error) {
    toast.error('Failed to remove reaction')
    throw error
  }
}

// ==================== User Profile ====================

export const getUserProfile = async (): Promise<UserProfileDto> => {
  const response = await api.get('User/profile')
  return response.data
}

export const updateUserProfile = async (data: ProfileUpdateDto): Promise<UserProfileDto> => {
  try {
    const response = await api.put('User/profile', data)
    toast.success('Profile updated successfully')
    return response.data
  } catch (error) {
    toast.error('Failed to update profile')
    throw error
  }
}

export const useUser = () => {
  return useSWR<UserProfileDto>(
    'User/profile',
    async () => {
      const response = await api.get('User/profile')
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const getUserById = async (userId: number): Promise<User> => {
  try {
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    }

    const config = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {}

    const response = await axios.get(`http://localhost:5030/api/User/${userId}`, config)
    console.log('Fetched user:', response.data)
    return response.data
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw error
  }
}


export const useUsers = (filters?: UserFilterDto) => {
  const queryString = filters 
    ? `?${new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]).toString()}`
    : ''
  
  return useSWR<PaginatedResponse<User>>(
    [`User/all${queryString}`],
    async () => {
      const response = await api.get(`User/all${queryString}`)
      return response.data
    },
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )
}

export const toggleUserBan = async (userId: number): Promise<User> => {
  try {
    const response = await api.post(`User/${userId}/toggle-ban`)
    return response.data
  } catch (error) {
    toast.error('Failed to toggle user ban status')
    throw error
  }
}

// ==================== Ban Management ====================
export const banUser = async (userId: number, banDto: BanDto): Promise<void> => {
  try {
    await api.post(`bans/${userId}`, banDto)
    toast.success(banDto.IsBanned ? 'User banned' : 'User unbanned')
  } catch (error) {
    toast.error(`Failed to ${banDto.IsBanned ? 'ban' : 'unban'} user`)
    throw error
  }
}

export const banUserForDuration = async (userId: number, banDurationDto: BanDurationDto): Promise<void> => {
  try {
    await api.post(`bans/${userId}/duration`, banDurationDto)
    const totalSeconds = banDurationDto.Seconds + (banDurationDto.Minutes * 60) + (banDurationDto.Hours * 3600)
    const totalMinutes = totalSeconds / 60
    const hours = totalMinutes / 60
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60
    
    let durationText = ''
    if (hours > 0 && minutes > 0 && seconds > 0)
      durationText = `${hours}h ${minutes}m ${seconds}s`
    else if (hours > 0 && minutes > 0)
      durationText = `${hours}h ${minutes}m`
    else if (hours > 0 && seconds > 0)
      durationText = `${hours}h ${seconds}s`
    else if (hours > 0)
      durationText = `${hours}h`
    else if (minutes > 0 && seconds > 0)
      durationText = `${minutes}m ${seconds}s`
    else if (minutes > 0)
      durationText = `${minutes}m`
    else
      durationText = `${seconds}s`
      
    toast.success(`User banned for ${durationText}`)
  } catch (error) {
    toast.error('Failed to ban user for duration')
    throw error
  }
}

export const getUserBanStatus = async (userId: number): Promise<{ isBanned: boolean; until?: string; reason?: string; bannedBy?: string }> => {
  try {
    const response = await api.get(`bans/${userId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get user ban status:', error)
    return { isBanned: false }
  }
}

export const getMyBanStatus = async (): Promise<{ isBanned: boolean; until?: string; reason?: string; bannedBy?: string }> => {
  try {
    const response = await api.get('bans/my-ban-status')
    return response.data
  } catch (error) {
    console.error('Failed to get my ban status:', error)
    return { isBanned: false }
  }
}

export const muteUser = async (userId: number, muteDto: MuteDto): Promise<void> => {
  try {
    await api.post(`users/${userId}/mute`, muteDto)
    toast.success(muteDto.IsMuted ? 'User muted' : 'User unmuted')
  } catch (error) {
    toast.error(`Failed to ${muteDto.IsMuted ? 'mute' : 'unmute'} user`)
    throw error
  }
}

export const muteUserForDuration = async (userId: number, muteDurationDto: MuteDurationDto): Promise<void> => {
  try {
    await api.post(`users/${userId}/mute/duration`, muteDurationDto)
    const totalSeconds = muteDurationDto.Seconds + (muteDurationDto.Minutes * 60) + (muteDurationDto.Hours * 3600)
    const totalMinutes = totalSeconds / 60
    const hours = totalMinutes / 60
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60
    
    let durationText = ''
    if (hours > 0 && minutes > 0 && seconds > 0)
      durationText = `${hours}h ${minutes}m ${seconds}s`
    else if (hours > 0 && minutes > 0)
      durationText = `${hours}h ${minutes}m`
    else if (hours > 0 && seconds > 0)
      durationText = `${hours}h ${seconds}s`
    else if (hours > 0)
      durationText = `${hours}h`
    else if (minutes > 0 && seconds > 0)
      durationText = `${minutes}m ${seconds}s`
    else if (minutes > 0)
      durationText = `${minutes}m`
    else
      durationText = `${seconds}s`
      
    toast.success(`User muted for ${durationText}`)
  } catch (error) {
    toast.error('Failed to mute user for duration')
    throw error
  }
}

export const getUserMuteStatus = async (userId: number): Promise<{ isMuted: boolean; until?: string }> => {
  try {
    const response = await api.get(`users/${userId}/mute`)
    return response.data
  } catch (error) {
    console.error('Failed to get user mute status:', error)
    return { isMuted: false }
  }
}

export const getMyMuteStatus = async (): Promise<{ isMuted: boolean; until?: string }> => {
  try {
    const response = await api.get('users/status')
    return response.data
  } catch (error) {
    console.error('Failed to get my mute status:', error)
    return { isMuted: false }
  }
}

export const updateUserRoles = async (userId: number, roles: string[]): Promise<User> => {
  try {
    const response = await api.put(`User/${userId}/roles`, { roles })
    toast.success('User roles updated')
    return response.data
  } catch (error) {
    toast.error('Failed to update user roles')
    throw error
  }
}

// ==================== Notifications ====================

export const getNotifications = async (): Promise<any[]> => {
  try {
    const response = await api.get('notification')
    return response.data
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    await api.post(`notification/${notificationId}/mark-read`)
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    throw error
  }
}

export const markAllNotificationsAsRead = async (): Promise<void> => {
  try {
    await api.post('notification/mark-all-read')
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    throw error
  }
}

export const deleteNotification = async (notificationId: number): Promise<void> => {
  try {
    await api.delete(`notification/${notificationId}`)
  } catch (error) {
    console.error('Failed to delete notification:', error)
    throw error
  }
}

// ==================== Notification Settings ====================

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await api.get('User/notification-settings')
  return response.data
}

export const updateNotificationSettings = async (settings: NotificationSettings): Promise<NotificationSettings> => {
  try {
    const response = await api.put('User/notification-settings', settings)
    toast.success('Notification settings updated')
    return response.data
  } catch (error) {
    toast.error('Failed to update notification settings')
    throw error
  }
}

// ==================== Telegram ====================

export const getTelegramLink = async (userId: number): Promise<TelegramLinkDto> => {
  const response = await api.get(`User/link-telegram`)
  return response.data
}

export const startTelegramVerification = async (userId: number): Promise<void> => {
  await api.post(`User/${userId}/telegram/start-verification`)
}

export const verifyTelegramCode = async (code: string, userId: number): Promise<User> => {
  const response = await api.post(`User/${userId}/telegram/verify`, { code })
  return response.data
}

// ==================== Auth (login / register) ====================

export const login = async (data: LoginDto): Promise<AuthResponse> => {
  try {
    const response = await api.post('Auth/login', data)
    typeof window !== 'undefined' ? localStorage.setItem('token', response.data.Token) : null
    return response.data

  } catch (error) {
    throw error
  }
}

export const register = async (data: RegisterDto): Promise<void> => {
  try {
    await api.post('Auth/register', data)
    toast.success('Registration successful! Please log in.')
  } catch (error) {
    throw error
  }
}

export async function getEvent(id: number): Promise<EventDto> {
  const res = await api.get(`/Event/${id}`)
  return res.data
}

export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

// ==================== Ownership Transfer ====================

export const requestOwnershipTransfer = async (newOwnerId: number): Promise<TransferOwnershipResponseDto> => {
  try {
    const response = await api.post('ownership/request-transfer', { NewOwnerId: newOwnerId })
    return response.data
  } catch (error) {
    console.error('Failed to request ownership transfer:', error)
    throw error
  }
}

export const confirmOwnershipTransfer = async (newOwnerId: number, verificationCode: string): Promise<{ Success: boolean; Message: string }> => {
  try {
    const response = await api.post('ownership/confirm-transfer', { 
      NewOwnerId: newOwnerId, 
      VerificationCode: verificationCode 
    })
    return response.data
  } catch (error) {
    console.error('Failed to confirm ownership transfer:', error)
    throw error
  }
}

// ==================== Activity Logs ====================

export const getActivityLogs = async (filters?: ActivityLogFilterDto): Promise<PaginatedResponse<ActivityLog>> => {
  try {
    const queryString = filters 
      ? `?${new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]).toString()}`
      : ''
    
    console.log('getActivityLogs: Making request to:', `activity-logs${queryString}`)
    
    const response = await api.get(`activity-logs${queryString}`)
    
    console.log('getActivityLogs: Response:', response.data)
    
    return response.data
  } catch (error) {
    console.error('Failed to fetch activity logs:', error)
    throw error
  }
}

export const getActivitySummary = async (startDate?: string, endDate?: string): Promise<ActivitySummary> => {
  try {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const response = await api.get(`activity-logs/summary?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch activity summary:', error)
    throw error
  }
}

export const getUserActivityLogs = async (userId: number, page: number = 1, pageSize: number = 50): Promise<PaginatedResponse<ActivityLog>> => {
  try {
    const response = await api.get(`activity-logs/user/${userId}?page=${page}&pageSize=${pageSize}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch user activity logs:', error)
    throw error
  }
}

// Organizer Blacklist API functions
export const getMyBlacklist = async (): Promise<OrganizerBlacklistDto[]> => {
  const response = await api.get('OrganizerBlacklist/my-blacklist')
  return response.data
}

export const addToBlacklist = async (dto: CreateBlacklistEntryDto): Promise<{ message: string }> => {
  const response = await api.post('OrganizerBlacklist/add', dto)
  return response.data
}

export const removeFromBlacklist = async (dto: RemoveBlacklistEntryDto): Promise<{ message: string }> => {
  const response = await api.delete('OrganizerBlacklist/remove', { data: dto })
  return response.data
}

export const checkBlacklistStatus = async (userId: number): Promise<{ isBlacklisted: boolean }> => {
  const response = await api.get(`OrganizerBlacklist/check/${userId}`)
  return response.data
}

export const useMyBlacklist = () => {
  return useSWR('my-blacklist', getMyBlacklist, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  })
}

// Event Attendees API functions
export const getEventAttendees = async (eventId: number): Promise<{
  EventId: number
  EventTitle: string
  AttendeesCount: number
  Attendees: Array<{
    UserId: number
    UserName: string
    UserEmail: string
    AddedAt: string
  }>
}> => {
  const response = await api.get(`PlannedEvents/event/${eventId}/attendees`)
  return response.data
}

export const useEventAttendees = (eventId: string | number | null) => {
  return useSWR(
    eventId ? `event-attendees-${eventId}` : null,
    () => getEventAttendees(Number(eventId)),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
}

export const getUserPlannedEvents = async (userId: number, pageNumber: number = 1, pageSize: number = 10): Promise<PaginatedResponse<{
  Id: number
  EventId: number
  CreatedAt: string
  Event: EventDto
}>> => {
  const response = await api.get(`/User/${userId}/planned-events`, {
    params: { pageNumber, pageSize }
  })
  return response.data
}

export const useUserPlannedEvents = (userId: number) => {
  return useSWR(
    `user-planned-events-${userId}`,
    () => getUserPlannedEvents(userId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )
}

export const removeAttendeeFromEvent = async (eventId: number, attendeeId: number): Promise<{ message: string }> => {
  const response = await api.delete(`PlannedEvents/event/${eventId}/attendee/${attendeeId}`)
  return response.data
}

export const removeUserFromPlannedEvent = async (userId: number, eventId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/User/${userId}/planned-events/${eventId}`)
  return response.data
}

// ==================== User Impersonation ====================
export const impersonateUser = async (targetUserId: number): Promise<{
  message: string
  impersonationToken: string
  targetUser: User
}> => {
  const response = await api.post(`/User/impersonate/${targetUserId}`)
  return response.data
}

// ==================== Role Management ====================
export const getRoles = async (): Promise<Array<{ Id: number; Name: string }>> => {
  const response = await api.get('/User/roles')
  return response.data
}

export const assignRoles = async (userId: number, roles: string[]): Promise<{ message: string }> => {
  const response = await api.post(`/User/${userId}/roles`, { Roles: roles })
  return response.data
}

export const seedDatabase = async (seedData: {
  OwnerCount?: number
  SeniorAdminCount: number
  AdminCount: number
  OrganizerCount: number
  RegularUserCount: number
  PastEventCount: number
  FutureEventCount: number
  PositiveCommentCount: number
  NeutralCommentCount: number
  NegativeCommentCount: number
  CreateReactions: boolean
  CreateFavorites: boolean
  CreatePlannedEvents: boolean
}): Promise<{ message: string }> => {
  const response = await api.post('seed/seed', seedData)
  return response.data
}

export const getDatabaseStats = async (): Promise<{
  users: number
  usersLastCreated?: string
  events: number
  eventsLastCreated?: string
  comments: number
  commentsLastCreated?: string
  reactions: number
  reactionsLastCreated?: string
  favorites: number
  favoritesLastCreated?: string
  plannedEvents: number
  plannedEventsLastCreated?: string
}> => {
  const response = await api.get('seed/stats')
  return response.data
}

export const getDashboardStats = async (): Promise<{
  users: number
  events: number
  comments: number
  logs: number
}> => {
  const response = await api.get('User/dashboard-stats')
  return response.data
}

export const useDashboardStats = () => {
  return useSWR('dashboard-stats', getDashboardStats, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 30000 // Refresh every 30 seconds
  })
}

export const updatePreferredLanguage = async (language: string): Promise<{ message: string }> => {
  const response = await api.put('/User/preferred-language', language)
  return response.data
}
