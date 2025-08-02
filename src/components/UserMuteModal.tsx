import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon, ClockIcon, NoSymbolIcon } from '@heroicons/react/24/outline'
import { muteUser, muteUserForDuration } from '../lib/api'
import toast from 'react-hot-toast'
import TimeInput from './TimeInput'

interface UserMuteModalProps {
  isOpen: boolean
  onClose: () => void
  userId: number
  userName: string
  currentMuteStatus?: {
    isMuted: boolean
    until?: string | null
  }
  onMuteUpdate: () => void
}

export default function UserMuteModal({
  isOpen,
  onClose,
  userId,
  userName,
  currentMuteStatus,
  onMuteUpdate
}: UserMuteModalProps) {
  const resetForm = () => {
    setReason('')
    setMuteType('permanent')
    setDuration({ seconds: 0, minutes: 60, hours: 0 })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }
  const [muteType, setMuteType] = useState<'permanent' | 'temporary'>('permanent')
  const [duration, setDuration] = useState({ seconds: 0, minutes: 60, hours: 0 })
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMute = async () => {
    setIsLoading(true)
    try {
      if (muteType === 'permanent') {
        await muteUser(userId, { IsMuted: true })
        toast.success(`User ${userName} has been muted permanently`)
      } else {
        await muteUserForDuration(userId, {
          Seconds: duration.seconds,
          Minutes: duration.minutes,
          Hours: duration.hours
        })
        toast.success(`User ${userName} has been muted for ${duration.hours}h ${duration.minutes}m ${duration.seconds}s`)
      }
      onMuteUpdate()
      handleClose()
    } catch (error) {
      console.error('Failed to mute user:', error)
      toast.error('Failed to mute user')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnmute = async () => {
    setIsLoading(true)
    try {
      await muteUser(userId, { IsMuted: false })
      toast.success(`User ${userName} has been unmuted`)
      onMuteUpdate()
      handleClose()
    } catch (error) {
      console.error('Failed to unmute user:', error)
      toast.error('Failed to unmute user')
    } finally {
      setIsLoading(false)
    }
  }

  const formatMuteExpiry = (until: string | null) => {
    if (!until) return ''
    
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
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-yellow-600" />
              Mute User
            </Dialog.Title>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Managing mute for: <span className="font-semibold text-gray-900 dark:text-gray-100">{userName}</span></p>
              
              {currentMuteStatus?.isMuted && (
                <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md p-3 mb-4">
                  <div className="flex items-center">
                    <NoSymbolIcon className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-sm text-red-800 dark:text-red-200">
                      Currently muted
                      {currentMuteStatus.until && (
                        <span className="block text-xs">
                          Expires in: {formatMuteExpiry(currentMuteStatus.until)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!currentMuteStatus?.isMuted ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mute Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="permanent"
                        checked={muteType === 'permanent'}
                        onChange={(e) => setMuteType(e.target.value as 'permanent' | 'temporary')}
                        className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">Permanent mute</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="temporary"
                        checked={muteType === 'temporary'}
                        onChange={(e) => setMuteType(e.target.value as 'permanent' | 'temporary')}
                        className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      />
                      <span className="text-sm text-gray-900 dark:text-gray-100">Temporary mute</span>
                    </label>
                  </div>
                </div>

                {muteType === 'temporary' && (
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
                    placeholder="Enter mute reason..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMute}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Muting...' : `Mute ${userName}`}
                  </button>
                </div>
              </>
            ) : (
                              <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                <button
                  onClick={handleUnmute}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Unmuting...' : 'Unmute User'}
                </button>
              </div>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 