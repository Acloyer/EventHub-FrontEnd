import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface TelegramVerificationGateProps {
  children: React.ReactNode
  onVerificationSuccess?: () => void
  title?: string
  description?: string
  generateCodeFunction: () => Promise<void>
  verifyCodeFunction: (code: number) => Promise<void>
  successMessage?: string
  errorMessage?: string
}

export default function TelegramVerificationGate({
  children,
  onVerificationSuccess,
  title = "Access Control Required",
  description = "This operation requires additional verification via Telegram.",
  generateCodeFunction,
  verifyCodeFunction,
  successMessage = "Access granted successfully!",
  errorMessage = "Invalid verification code"
}: TelegramVerificationGateProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  
  const [isAccessGranted, setIsAccessGranted] = useState(false)
  const [enteredCode, setEnteredCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  
  // Check if user has Telegram connected and verified
  const hasTelegramConnected = user?.TelegramId && user.TelegramId > 0 && user.IsTelegramVerified

  // Handle verification code generation and sending
  const handleGenerateCode = async () => {
    if (!hasTelegramConnected) {
      toast.error(t('admin.telegramRequiredForDeletion'))
      return
    }

    setIsGeneratingCode(true)
    try {
      await generateCodeFunction()
      toast.success(t('admin.verificationCodeSent'))
    } catch (error) {
      console.error('Failed to send verification code:', error)
      toast.error(t('admin.failedToSendCode'))
    } finally {
      setIsGeneratingCode(false)
    }
  }

  // Handle code verification
  const handleVerifyCode = async () => {
    setIsVerifying(true)
    try {
      await verifyCodeFunction(parseInt(enteredCode))
      setIsAccessGranted(true)
      toast.success(successMessage)
      setEnteredCode('')
      onVerificationSuccess?.()
    } catch (error) {
      toast.error(errorMessage)
      setEnteredCode('')
    } finally {
      setIsVerifying(false)
    }
  }

  // If access is granted, show children
  if (isAccessGranted) {
    return <>{children}</>
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>

          {!hasTelegramConnected ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {user?.TelegramId && user.TelegramId > 0 ? 'Telegram not verified' : 'Telegram not connected'}
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                    {user?.TelegramId && user.TelegramId > 0 
                      ? 'You need to verify your Telegram account to proceed.' 
                      : 'You need to connect your Telegram account to proceed.'}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-amber-800 bg-amber-100 border border-amber-300 rounded-md hover:bg-amber-200 dark:text-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:hover:bg-amber-900/50 transition-colors"
                >
                  {user?.TelegramId && user.TelegramId > 0 ? 'Verify Telegram in Profile' : 'Connect Telegram in Profile'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={handleGenerateCode}
                disabled={isGeneratingCode}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isGeneratingCode ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating Code...
                  </>
                ) : (
                  <>
                    <CogIcon className="h-4 w-4 mr-2" />
                    Generate Verification Code
                  </>
                )}
              </button>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the verification code sent to your Telegram:
                </p>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                  <button
                    onClick={handleVerifyCode}
                    disabled={enteredCode.length !== 6 || isVerifying}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 