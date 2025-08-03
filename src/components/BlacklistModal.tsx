import React, { useState } from 'react'
import { OrganizerBlacklistDto, CreateBlacklistEntryDto } from '../lib/types'
import { addToBlacklist, removeFromBlacklist } from '../lib/api'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import { XMarkIcon, UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/outline'

interface Props {
  isOpen: boolean
  onClose: () => void
  blacklist: OrganizerBlacklistDto[]
  onBlacklistUpdate: () => void
}

export const BlacklistModal: React.FC<Props> = ({ isOpen, onClose, blacklist, onBlacklistUpdate }) => {
  const [newUserId, setNewUserId] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation('common')

  const handleAddToBlacklist = async () => {
    if (!newUserId.trim()) {
      toast.error(t('blacklist.enterUserId'))
      return
    }

    const userId = parseInt(newUserId)
    if (isNaN(userId)) {
      toast.error(t('blacklist.enterValidUserId'))
      return
    }

    // Check if user is already in blacklist
    if (blacklist.some(entry => entry.BannedUserId === userId)) {
      toast.error(t('blacklist.userAlreadyBlacklisted'))
      return
    }

    setLoading(true)
    try {
      const dto: CreateBlacklistEntryDto = {
        BannedUserId: userId,
        Reason: reason.trim() || undefined
      }

      await addToBlacklist(dto)
      toast.success(t('blacklist.userAddedToBlacklist'))
      setNewUserId('')
      setReason('')
      onBlacklistUpdate()
    } catch (error) {
      console.error('Error adding to blacklist:', error)
      toast.error(t('blacklist.failedToAddUser'))
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFromBlacklist = async (bannedUserId: number) => {
    setLoading(true)
    try {
      await removeFromBlacklist({ BannedUserId: bannedUserId })
      toast.success(t('blacklist.userRemovedFromBlacklist'))
      onBlacklistUpdate()
    } catch (error) {
      console.error('Error removing from blacklist:', error)
      toast.error(t('blacklist.failedToRemoveUser'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Blacklist Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Add new user to blacklist */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Add User to Blacklist</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                User ID
              </label>
              <input
                type="number"
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for blacklisting"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <button
              onClick={handleAddToBlacklist}
              disabled={loading || !newUserId.trim()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserMinusIcon className="h-4 w-4 mr-2" />
              {loading ? 'Adding...' : 'Add to Blacklist'}
            </button>
          </div>
        </div>

        {/* Current blacklist */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Blacklisted Users ({blacklist.length})
          </h3>
          {blacklist.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300 text-center py-8">
              No users in blacklist
            </p>
          ) : (
            <div className="space-y-3">
              {blacklist.map((entry) => (
                <div
                  key={entry.Id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {entry.BannedUserName}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.BannedUserEmail}
                      </p>
                      {entry.Reason && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Reason: {entry.Reason}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Added: {new Date(entry.CreatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFromBlacklist(entry.BannedUserId)}
                      disabled={loading}
                      className="flex items-center px-3 py-1 text-sm font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200 border border-green-300 dark:border-green-700 rounded-md hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
} 