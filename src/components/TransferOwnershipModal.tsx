import React, { useState } from 'react'
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { requestOwnershipTransfer, confirmOwnershipTransfer } from '../lib/api'
import { toast } from 'react-hot-toast'
import { User } from '../lib/types'

interface TransferOwnershipModalProps {
  isOpen: boolean
  onClose: () => void
  targetUser: User
  onSuccess: () => void
}

export default function TransferOwnershipModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  onSuccess 
}: TransferOwnershipModalProps) {
  const [step, setStep] = useState<'confirm' | 'verification'>('confirm')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  const handleRequestTransfer = async () => {
    setIsLoading(true)
    try {
      const response = await requestOwnershipTransfer(targetUser.Id)
              setGeneratedCode(response.VerificationCode) // In production, don't show the code
      setStep('verification')
      toast.success('Verification code sent to your Telegram')
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to request transfer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmTransfer = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code')
      return
    }

    setIsLoading(true)
    try {
      await confirmOwnershipTransfer(targetUser.Id, verificationCode)
      toast.success('Ownership transferred successfully')
      onSuccess()
      onClose()
      setStep('confirm')
      setVerificationCode('')
    } catch (error: any) {
      toast.error(error.response?.data || 'Failed to confirm transfer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setStep('confirm')
    setVerificationCode('')
    setGeneratedCode('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Transfer Ownership
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {step === 'confirm' && (
          <div>
            <div className="mb-4">
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                Are you sure you want to transfer ownership to{' '}
                <span className="font-semibold text-gray-900 dark:text-gray-100">{targetUser.Name}</span>?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                This action will:
              </p>
              <ul className="text-sm text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                <li>• Remove your Owner role</li>
                <li>• Add SeniorAdmin role to you</li>
                <li>• Remove all roles from {targetUser.Name}</li>
                <li>• Add Owner role to {targetUser.Name}</li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestTransfer}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Requesting...' : 'Transfer Ownership'}
              </button>
            </div>
          </div>
        )}

        {step === 'verification' && (
          <div>
            <div className="mb-4">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-center mb-4">
                Enter the 6-digit verification code sent to your Telegram
              </p>
              
              {/* In production, remove this block */}
              {process.env.NODE_ENV === 'development' && (
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md p-3 mb-4">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Development Mode:</strong> Code: {generatedCode}
                  </p>
                </div>
              )}

              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep('confirm')}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back
              </button>
              <button
                onClick={handleConfirmTransfer}
                disabled={isLoading || verificationCode.length !== 6}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? 'Confirming...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 