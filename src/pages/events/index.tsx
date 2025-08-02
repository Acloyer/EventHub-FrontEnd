import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useEvents } from '../../lib/api'
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
    setSelectedCategory(category === selectedCategory ? '' : category)
    setPageNumber(1) // Reset to first page on category change
  }
  
  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
    setPageNumber(1) // Reset to first page on date change
  }
  
  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }
  
  const resetFilters = () => {
    setSearchTerm('')
    setDebouncedSearchTerm('')
    setSelectedCategory('')
    setStartDate('')
    setEndDate('')
    setPageNumber(1)
    router.push('/events', undefined, { shallow: true })
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading events. Please try again later.</p>
      </div>
    )
  }

  if (!eventsData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          {isAuthenticated && user?.Roles?.some((role: string) => ['Admin', 'SeniorAdmin', 'Owner', 'Organizer'].includes(role)) && (
            <Link href="/admin/events/create" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Event
            </Link>
          )}
        </div>
        
        {/* Search & Filters */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-4 shadow-sm rounded-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
                  placeholder="Search events"
                />
              </div>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <FunnelIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                Filters
                {Object.keys(filters).filter(key => key !== 'SearchTerm' && filters[key as keyof EventFilterDto])?.length > 0 && (
                  <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-semibold rounded-full px-2 py-0.5">
                    {Object.keys(filters).filter(key => key !== 'SearchTerm' && filters[key as keyof EventFilterDto])?.length ?? 0}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Categories</option>
                  {(categories ?? []).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => handleDateChange('start', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => handleDateChange('end', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Additional Filters */}
              <div className="sm:col-span-2 md:col-span-3">
                <div className="flex flex-wrap gap-4 mt-2">
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-700 shadow-sm text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
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

          {eventsData?.Items?.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No events found</h3>
              <p className="text-gray-500 dark:text-gray-300 mb-6">Try changing your search criteria or check back later</p>
            </div>
          )}

          {eventsData?.Items?.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6">
                {eventsData?.Items?.map((event) => (
                  <EventCard 
                    key={event.Id} 
                    event={event}
                    onEventUpdate={mutate}
                  />
                ))}
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

                    {Array.from({ length: eventsData.TotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNumber
                            ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-600 dark:text-blue-200'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

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