import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { startDeleteConfirmation, confirmDeleteCode } from '../lib/api'

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmed: () => void
  userId: number
}

export default function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirmed, 
  userId 
}: DeleteConfirmationModalProps) {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCodeSent, setIsCodeSent] = useState(false)

  const handleSendCode = async () => {
    try {
      setIsLoading(true)
      await startDeleteConfirmation(userId)
      setIsCodeSent(true)
      toast.success('Confirmation code sent to your Telegram')
    } catch (error) {
      toast.error('Failed to send confirmation code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      toast.error('Please enter the confirmation code')
      return
    }

    try {
      setIsLoading(true)
      await confirmDeleteCode({ code: parseInt(code, 10) })
      toast.success('Deletion confirmed')
      onConfirmed()
      onClose()
    } catch (error) {
      toast.error('Invalid confirmation code')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Confirm Database Deletion
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            This action will permanently delete all existing data. To confirm, please enter the verification code sent to your Telegram.
          </p>
          
          {!isCodeSent ? (
            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Confirmation Code'}
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter code from Telegram"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmCode}
                  disabled={isLoading || !code.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Confirming...' : 'Confirm Deletion'}
                </button>
                
                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
} 