import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEvents, useFavorites, usePlannedEvents } from '../../lib/api'
import { EventFilterDto, Event } from '../../lib/types'
import { format } from 'date-fns'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '../../lib/AuthContext'
import { Disclosure } from '@headlessui/react'
import {
  ChevronUpIcon,
  CalendarIcon,
  MapPinIcon,
  CheckIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline'
import LoadingSpinner from '../../components/LoadingSpinner'
import EventCard from '../../components/EventCard'
import { motion } from 'framer-motion'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function EventsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const { isAuthenticated, user } = useAuth()
  
  const filters: EventFilterDto = {
    SearchTerm: debouncedSearchTerm || undefined,
    Category: selectedCategory || undefined,
    StartDate: startDate || undefined,
    EndDate: endDate || undefined,
    PageNumber: pageNumber,
    PageSize: pageSize
  }
  
  const { data: eventsData, error, isValidating, mutate } = useEvents(filters)
  const { data: favorites, mutate: mutateFavorites } = useFavorites()
  const { data: plannedEvents, mutate: mutatePlanned } = usePlannedEvents()
  
  // Handle search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1) // Reset to first page on new search
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])
  
  // Apply filters from URL query params on first load
  useEffect(() => {
    if (router.query.search) {
      setSearchTerm(router.query.search as string)
      setDebouncedSearchTerm(router.query.search as string)
    }
    if (router.query.category) {
      setSelectedCategory(router.query.category as string)
    }
    if (router.query.startDate) {
      setStartDate(router.query.startDate as string)
    }
    if (router.query.endDate) {
      setEndDate(router.query.endDate as string)
    }
    if (router.query.page) {
      setPageNumber(parseInt(router.query.page as string, 10))
    }
  }, [router.query])
  
  // Categories list - this could come from an API in a real app
  const categories = [
    'Conference',
    'Workshop',
    'Seminar',
    'Party',
    'Concert',
    'Exhibition',
    'Networking',
    'Other'
  ]
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Update URL with search params
    router.push({
      pathname: '/events',
      query: {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(pageNumber > 1 && { page: pageNumber })
      }
    }, undefined, { shallow: true })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setPageNumber(1)
    // Update URL immediately for category changes
    router.push({
      pathname: '/events',
      query: {
        ...(searchTerm && { search: searchTerm }),
        ...(category && { category }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      }
    }, undefined, { shallow: true })
  }

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
    setPageNumber(1)
    // Update URL immediately for date changes
    const newStartDate = type === 'start' ? value : startDate
    const newEndDate = type === 'end' ? value : endDate
    router.push({
      pathname: '/events',
      query: {
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(newStartDate && { startDate: newStartDate }),
        ...(newEndDate && { endDate: newEndDate })
      }
    }, undefined, { shallow: true })
  }

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setSelectedCategory('')
    setStartDate('')
    setEndDate('')
    setPageNumber(1)
    // Update URL to reflect cleared filters
    router.push({
      pathname: '/events',
      query: {}
    }, undefined, { shallow: true })
  }

  // Function to check if event is in favorites
  const isEventInFavorites = (eventId: number) => {
    return favorites?.some(fav => fav.Id === eventId) || false
  }

  // Function to check if event is in planned
  const isEventInPlanned = (eventId: number) => {
    return plannedEvents?.some(planned => planned.Id === eventId) || false
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {t('events.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('events.description')}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        {/* Active Filters Summary */}
        {(searchTerm || selectedCategory || startDate || endDate) && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Active Filters:
                </span>
                <div className="flex flex-wrap gap-2">
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      Category: {selectedCategory}
                    </span>
                  )}
                  {startDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      From: {new Date(startDate).toLocaleDateString()}
                    </span>
                  )}
                  {endDate && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                      To: {new Date(endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={resetFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('events.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                disabled={isValidating}
              />
              {isValidating && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isValidating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Searching...
                </>
              ) : (
                t('events.search')
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
            >
              <FunnelIcon className="h-4 w-4" />
              {t('events.filters')}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('events.category')}
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {(categories ?? []).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('events.startDate') || 'Start Date'}
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  max={endDate || undefined}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('events.endDate') || 'End Date'}
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  min={startDate || undefined}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                />
              </div>

              {/* Additional Filters */}
              <div className="sm:col-span-2 md:col-span-3">
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('common.clear')} {t('events.filters')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="space-y-6">
        {isValidating && !eventsData && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        )}
        
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error loading events</h3>
            <p className="text-gray-500 dark:text-gray-300">Please try again later</p>
          </div>
        )}

        {eventsData?.Items?.length === 0 && !isValidating && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('events.noEventsFound') || 'No events found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-300 mb-6">
              {searchTerm || selectedCategory || startDate || endDate 
                ? 'Try adjusting your search criteria or filters'
                : 'Check back later for new events'
              }
            </p>
            {(searchTerm || selectedCategory || startDate || endDate) && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {eventsData?.Items && eventsData.Items.length > 0 && (
          <>
            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {eventsData.Items.length} of {eventsData.TotalCount} events
              {eventsData.TotalPages > 1 && ` (page ${pageNumber} of ${eventsData.TotalPages})`}
            </div>
            <div className="grid grid-cols-1 gap-6">
              {eventsData.Items.map((event) => {
                // Update event with current favorite and planned status
                const updatedEvent = {
                  ...event,
                  IsFavorite: isEventInFavorites(event.Id),
                  IsPlanned: isEventInPlanned(event.Id)
                }
                
                return (
                  <EventCard 
                    key={event.Id} 
                    event={updatedEvent}
                    onEventUpdate={() => {
                      mutate()
                      mutateFavorites()
                      mutatePlanned()
                    }}
                  />
                )
              })}
            </div>

            {/* Pagination */}
            {eventsData.TotalPages > 0 && (
              <div className="flex justify-center mt-8">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pageNumber - 1)}
                    disabled={pageNumber === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium ${
                      pageNumber === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, eventsData.TotalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNumber
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => handlePageChange(pageNumber + 1)}
                    disabled={pageNumber === eventsData.TotalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium ${
                      pageNumber === eventsData.TotalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
} 