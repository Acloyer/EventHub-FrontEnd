import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface SeedDatabaseSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSeed: (settings: SeedSettings) => void
}

interface SeedSettings {
  ownerCount: number
  seniorAdminCount: number
  adminCount: number
  organizerCount: number
  regularUserCount: number
  pastEventCount: number
  futureEventCount: number
  positiveCommentCount: number
  neutralCommentCount: number
  negativeCommentCount: number
  createReactions: boolean
  createFavorites: boolean
  createPlannedEvents: boolean
}

export default function SeedDatabaseSettingsModal({ isOpen, onClose, onSeed }: SeedDatabaseSettingsModalProps) {
  const [settings, setSettings] = useState<SeedSettings>({
    ownerCount: 1,
    seniorAdminCount: 1,
    adminCount: 2,
    organizerCount: 1,
    regularUserCount: 10,
    pastEventCount: 10,
    futureEventCount: 20,
    positiveCommentCount: 24,
    neutralCommentCount: 24,
    negativeCommentCount: 12,
    createReactions: true,
    createFavorites: true,
    createPlannedEvents: true
  })

  const [isSeeding, setIsSeeding] = useState(false)

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast.error('Authentication required')
        return
      }

      const requestBody = {
        ownerCount: 1, // Always 1, cannot be changed
        seniorAdminCount: settings.seniorAdminCount,
        adminCount: settings.adminCount,
        organizerCount: settings.organizerCount,
        regularUserCount: settings.regularUserCount,
        pastEventCount: settings.pastEventCount,
        futureEventCount: settings.futureEventCount,
        positiveCommentCount: settings.positiveCommentCount,
        neutralCommentCount: settings.neutralCommentCount,
        negativeCommentCount: settings.negativeCommentCount,
        createReactions: settings.createReactions,
        createFavorites: settings.createFavorites,
        createPlannedEvents: settings.createPlannedEvents
      }

      console.log('Sending seed data:', requestBody)

      const response = await fetch('http://localhost:5030/api/seed/seed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(result.message || 'Database seeded successfully!')
        onSeed(settings)
        onClose()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to seed database')
      }
    } catch (error) {
      toast.error('Error occurred while seeding database')
      console.error('Seeding error:', error)
    } finally {
      setIsSeeding(false)
    }
  }

  const totalUsers = settings.ownerCount + settings.seniorAdminCount + settings.adminCount + 
                    settings.organizerCount + settings.regularUserCount
  const totalEvents = settings.pastEventCount + settings.futureEventCount
  const totalComments = settings.positiveCommentCount + settings.neutralCommentCount + settings.negativeCommentCount

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Database Seeding Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Users Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Users</h3>
            <div className="space-y-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Owners
                 </label>
                 <input
                   type="number"
                   value="1"
                   disabled
                   className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                 />
                 <p className="text-xs text-gray-500 mt-1">Always 1 owner (cannot be changed)</p>
               </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senior Admins
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.seniorAdminCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, seniorAdminCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admins
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={settings.adminCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, adminCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organizers
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={settings.organizerCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, organizerCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Users
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.regularUserCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, regularUserCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Events & Content</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Past Events
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settings.pastEventCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, pastEventCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Future Events
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.futureEventCount}
                  onChange={(e) => setSettings(prev => ({ ...prev, futureEventCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Positive Comments
                 </label>
                 <input
                   type="number"
                   min="0"
                   max="200"
                   value={settings.positiveCommentCount}
                   onChange={(e) => setSettings(prev => ({ ...prev, positiveCommentCount: parseInt(e.target.value) || 0 }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Neutral Comments
                 </label>
                 <input
                   type="number"
                   min="0"
                   max="200"
                   value={settings.neutralCommentCount}
                   onChange={(e) => setSettings(prev => ({ ...prev, neutralCommentCount: parseInt(e.target.value) || 0 }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Negative Comments
                 </label>
                 <input
                   type="number"
                   min="0"
                   max="200"
                   value={settings.negativeCommentCount}
                   onChange={(e) => setSettings(prev => ({ ...prev, negativeCommentCount: parseInt(e.target.value) || 0 }))}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
               </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createReactions"
                    checked={settings.createReactions}
                    onChange={(e) => setSettings(prev => ({ ...prev, createReactions: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createReactions" className="ml-2 block text-sm text-gray-900">
                    Create Reactions
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createFavorites"
                    checked={settings.createFavorites}
                    onChange={(e) => setSettings(prev => ({ ...prev, createFavorites: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createFavorites" className="ml-2 block text-sm text-gray-900">
                    Create Favorites
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createPlannedEvents"
                    checked={settings.createPlannedEvents}
                    onChange={(e) => setSettings(prev => ({ ...prev, createPlannedEvents: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="createPlannedEvents" className="ml-2 block text-sm text-gray-900">
                    Create Planned Events
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
                     <div className="text-sm text-gray-600 space-y-1">
             <p>Total Users: {totalUsers}</p>
             <p>Total Events: {totalEvents}</p>
             <p>Total Comments: {totalComments}</p>
             <p className="ml-4">• Positive: {settings.positiveCommentCount}</p>
             <p className="ml-4">• Neutral: {settings.neutralCommentCount}</p>
             <p className="ml-4">• Negative: {settings.negativeCommentCount}</p>
             <p>Reactions: {settings.createReactions ? totalUsers : 0}</p>
             <p>Favorites: {settings.createFavorites ? totalUsers : 0}</p>
             <p>Planned Events: {settings.createPlannedEvents ? totalUsers : 0}</p>
           </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSeed}
            disabled={isSeeding || totalUsers === 0 || totalEvents === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSeeding ? 'Seeding Database...' : 'Seed Database'}
          </button>
        </div>
      </div>
    </div>
  )
} 