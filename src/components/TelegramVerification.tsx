import React, { useState } from 'react'
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { getTelegramLink, startTelegramVerification, confirmTelegramCode } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import toast from 'react-hot-toast'

export default function TelegramVerification() {
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [verificationStep, setVerificationStep] = useState<'initial' | 'linking' | 'verifying'>('initial')
  const [telegramLink, setTelegramLink] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showCodeInput, setShowCodeInput] = useState(false)

  const handleStartLinking = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const linkData = await getTelegramLink(user.Id)
      setTelegramLink(linkData.LinkUrl)
      setVerificationStep('linking')
      toast.success('Telegram link generated! Click the link to connect your account.')
    } catch (error) {
      console.error('Failed to get Telegram link:', error)
      toast.error('Failed to generate Telegram link')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartVerification = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      await startTelegramVerification(user.Id)
      setShowCodeInput(true)
      setVerificationStep('verifying')
      toast.success('Verification code sent to your Telegram!')
    } catch (error) {
      console.error('Failed to start verification:', error)
      toast.error('Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmCode = async () => {
    if (!user || !verificationCode) return
    
    setIsLoading(true)
    try {
      await confirmTelegramCode({ code: parseInt(verificationCode) })
      await refreshUser()
      setVerificationStep('initial')
      setShowCodeInput(false)
      setVerificationCode('')
      toast.success('Telegram account verified successfully!')
    } catch (error) {
      console.error('Failed to confirm code:', error)
      toast.error('Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(telegramLink)
    toast.success('Link copied to clipboard!')
  }

  if (user?.IsTelegramVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
          <span className="text-sm font-medium text-green-800">
            Telegram account verified
          </span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          You will receive notifications about events via Telegram
        </p>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start">
        <PaperAirplaneIcon className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            Connect Telegram Account
          </h3>
          <p className="text-xs text-blue-600 mb-3">
            Link your Telegram account to receive event notifications and verify your identity.
          </p>

          {verificationStep === 'initial' && (
            <div className="space-y-2">
              {user?.TelegramId ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-600">
                    Telegram ID: {user.TelegramId}
                  </span>
                  <button
                    onClick={handleStartVerification}
                    disabled={isLoading}
                    className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Verify Account'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartLinking}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Link Telegram'}
                </button>
              )}
            </div>
          )}

          {verificationStep === 'linking' && telegramLink && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-xs text-gray-600 truncate flex-1">
                  {telegramLink}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="ml-2 px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-blue-600">
                Click the link above to connect your Telegram account, then click "Verify Account"
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={handleStartVerification}
                  disabled={isLoading}
                  className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Verify Account'}
                </button>
                <button
                  onClick={() => setVerificationStep('initial')}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {verificationStep === 'verifying' && showCodeInput && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  maxLength={6}
                />
                <button
                  onClick={handleConfirmCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <p className="text-xs text-blue-600">
                Enter the 6-digit code sent to your Telegram
              </p>
              <button
                onClick={() => {
                  setVerificationStep('initial')
                  setShowCodeInput(false)
                  setVerificationCode('')
                }}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 