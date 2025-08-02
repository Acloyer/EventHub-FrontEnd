import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { banUser, banUserForDuration } from '../lib/api'
import TimeInput from './TimeInput'

interface UserBanModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
  userName: string
  currentBanStatus: {
    isBanned: boolean
    until?: string
  }
  onBanUpdate: () => void
}

export default function UserBanModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentBanStatus,
  onBanUpdate
}: UserBanModalProps) {
  const [banType, setBanType] = useState<'permanent' | 'temporary'>('permanent')
  const [duration, setDuration] = useState({ seconds: 0, minutes: 60, hours: 0 })
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleBan = async () => {
    setIsLoading(true)
    try {
      if (banType === 'permanent') {
        await banUser(userId, { IsBanned: true, Reason: reason })
        toast.success(`User ${userName} has been banned permanently`)
      } else {
        await banUserForDuration(userId, {
          Seconds: duration.seconds,
          Minutes: duration.minutes,
          Hours: duration.hours,
          Reason: reason
        })
      }
      onBanUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to ban user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnban = async () => {
    setIsLoading(true)
    try {
      await banUser(userId, { IsBanned: false })
      toast.success(`User ${userName} has been unbanned`)
      onBanUpdate()
      onClose()
    } catch (error) {
      console.error('Failed to unban user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBanExpiry = (until: string) => {
    const expiryDate = new Date(until)
    const now = new Date()
    const diffMs = expiryDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''}`
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              Ban User
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Managing ban for: <span className="font-medium text-gray-900 dark:text-gray-100">{userName}</span>
              </p>
              
              {currentBanStatus.isBanned && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Currently banned</strong>
                    {currentBanStatus.until ? (
                      <span> until {formatBanExpiry(currentBanStatus.until)}</span>
                    ) : (
                      <span> permanently</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {!currentBanStatus.isBanned && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ban Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="permanent"
                        checked={banType === 'permanent'}
                        onChange={(e) => setBanType(e.target.value as 'permanent' | 'temporary')}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Permanent ban</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="temporary"
                        checked={banType === 'temporary'}
                        onChange={(e) => setBanType(e.target.value as 'permanent' | 'temporary')}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Temporary ban</span>
                    </label>
                  </div>
                </div>

                {banType === 'temporary' && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration
                    </label>
                    <TimeInput
                      value={duration}
                      onChange={setDuration}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter ban reason..."
                    disabled={isLoading}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleBan}
                    disabled={isLoading}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Banning...' : `Ban ${userName}`}
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {currentBanStatus.isBanned && (
              <div className="flex space-x-3">
                <button
                  onClick={handleUnban}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {isLoading ? 'Unbanning...' : `Unban ${userName}`}
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 