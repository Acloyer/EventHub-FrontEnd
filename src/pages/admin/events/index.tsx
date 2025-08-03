import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { useRouter } from 'next/router'
import AdminLayout from '../../../components/AdminLayout'
import { useEvents, deleteEvent } from '../../../lib/api'
import { useAuth } from '../../../lib/AuthContext'
import LoadingSpinner from '../../../components/LoadingSpinner'
import { format, parseISO } from 'date-fns'
import { toast } from 'react-hot-toast'
import { EventDto } from '../../../lib/types'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

/** Entry type from /api/FavoriteEvents/admin/all */
export interface FavEntry {
  UserId:    number
  UserName:  string
  UserEmail: string
  EventId:   number
  Event:     EventDto
}

export interface PlanEntry {
  UserId:    number
  UserName:  string
  UserEmail: string
  EventId:   number
  Event:     EventDto
}

// Base URL of your backend
const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5030'

const fetchFavorites = async (url: string): Promise<FavEntry[]> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No auth token')
  const res = await fetch(url, {
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
  if (res.status === 401) throw new Error('Unauthorized')
  if (!res.ok)     throw new Error(`Error fetching favorites: ${res.status}`)
  return res.json()
}

const fetchPlanned = async (url: string): Promise<PlanEntry[]> => {
  const token = localStorage.getItem('token')
  if (!token) throw new Error('No auth token')
  const res = await fetch(url, {
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
  if (res.status === 401) throw new Error('Unauthorized')
  if (!res.ok)     throw new Error(`Error fetching planned: ${res.status}`)
  return res.json()
}

function AdminEventsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const pageSize = 10

  // 1) basic list of events with pagination
  const { data: events, error: eventsError, mutate } = useEvents({
    PageNumber: page,
    PageSize: pageSize,
    SearchTerm: search || undefined,
  })



  // 2) only if logged in, request admin lists of favorites/planned
  const favUrl  = isAuthenticated ? `${BACKEND}/FavoriteEvents/admin/all`       : null
  const planUrl = isAuthenticated ? `${BACKEND}/PlannedEvents/admin/all`       : null

  const { data: favEntries }  = useSWR<FavEntry[]>( favUrl,  fetchFavorites, { 
    shouldRetryOnError: false,
    revalidateOnFocus: false 
  })
  const { data: planEntries } = useSWR<PlanEntry[]>(planUrl, fetchPlanned, { 
    shouldRetryOnError: false,
    revalidateOnFocus: false 
  })

  // 3) combine them into dictionaries by EventId
  const favMap = useMemo(() => {
    const m: Record<number, FavEntry[]> = {}
    favEntries?.forEach(fe => {
      m[fe.EventId] ||= []
      m[fe.EventId].push(fe)
    })
    return m
  }, [favEntries])

  const planMap = useMemo(() => {
    const m: Record<number, PlanEntry[]> = {}
    planEntries?.forEach(pl => {
      m[pl.EventId] ||= []
      m[pl.EventId].push(pl)
    })
    return m
  }, [planEntries])

  // helper for Delete button
  // Function to determine role priority
  const getRolePriority = (roles: string[]) => {
    const rolePriority: Record<string, number> = {
      'Owner': 4,
      'SeniorAdmin': 3,
      'Admin': 2,
      'Organizer': 1,
      'User': 0
    }
    return Math.max(...roles.map(role => rolePriority[role] || 0))
  }

  // Function to check permissions for deleting/editing events
  const canModifyEvent = (creatorId: number) => {
    if (!user?.Roles) return false
    
    // Admins and senior admins can modify any events
    if (user.Roles.includes('Admin') || user.Roles.includes('SeniorAdmin') || user.Roles.includes('Owner')) {
      return true
    }
    
    // Organizers can only modify their own events
    if (user.Roles.includes('Organizer')) {
      return creatorId === user.Id
    }
    
    return false
  }

  const canDelete = (creatorId: number) =>
    user?.Roles.includes('Admin') ||
    (user?.Roles.includes('Organizer') && creatorId === user.Id)

  const [deletingId, setDeletingId] = useState<number|null>(null)
  const onDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return
    setDeletingId(id)
    try {
      await deleteEvent(id)
      toast.success('Deleted')
      await mutate()
    } catch (err: any) {
      toast.error(err.message || 'Error')
    } finally {
      setDeletingId(null)
    }
  }

  // Errors
  if (eventsError) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Error: {eventsError.message}</div>
      </AdminLayout>
    )
  }

  if (!events) {
    return (
      <AdminLayout>
        <LoadingSpinner />
      </AdminLayout>
    )
  }

  const formatEventDate = (iso: string) => {
    try { return format(parseISO(iso), 'PPP p') }
    catch  { return 'Invalid date' }
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('admin.events')}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage all events</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search..."
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
          <button
            className="btn-primary"
            onClick={() => router.push('/admin/events/create')}
          >
            Create
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('events.eventTitle')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('events.eventDate')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('events.eventCategory')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('events.going')}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('events.favorites')}</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {events?.Items?.map(evt => {
              const favCount  = favMap[evt.Id]?.length ?? 0
              const planCount = planMap[evt.Id]?.length ?? 0

              return (
                <tr key={evt.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {evt.Title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {evt.OrganizerName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatEventDate(evt.StartDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {evt.Category || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {planCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {favCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {/* Action buttons - show only if user can modify the event */}
                    {canModifyEvent(evt.CreatorId) ? (
                      <>
                        <button
                          className="btn-outline-primary btn-sm"
                          onClick={() => router.push(`/admin/events/edit/${evt.Id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-outline-blue btn-sm"
                          onClick={() => router.push(`/admin/events/${evt.Id}/attendees`)}
                        >
                          Attendees ({planCount})
                        </button>
                        <button
                          className="btn-outline-red btn-sm"
                          onClick={() => onDelete(evt.Id)}
                          disabled={deletingId === evt.Id}
                        >
                          {deletingId === evt.Id ? '…' : 'Delete'}
                        </button>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                        No permissions
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {events?.TotalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-neutral-200 dark:border-gray-700 sm:px-6 mt-6 rounded-md">
          <div className="flex justify-between flex-1 sm:hidden">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 rounded-md hover:bg-neutral-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(events?.TotalPages || 1, p + 1))}
              disabled={page === events?.TotalPages}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 rounded-md hover:bg-neutral-50 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700 dark:text-gray-300">
                Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * 10, events?.TotalCount || 0)}
                </span> of{' '}
                <span className="font-medium">{events?.TotalCount || 0}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 rounded-l-md hover:bg-neutral-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-t border-b border-neutral-300 dark:border-gray-600">
                  Page {page} of {events?.TotalPages || 1}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(events?.TotalPages || 1, p + 1))}
                  disabled={page === events?.TotalPages}
                  className="px-3 py-2 text-sm font-medium text-neutral-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-neutral-300 dark:border-gray-600 rounded-r-md hover:bg-neutral-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminEventsPage

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
