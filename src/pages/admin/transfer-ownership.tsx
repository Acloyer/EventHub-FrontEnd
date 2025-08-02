import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/AuthContext'
import { toast } from 'react-hot-toast'
import AdminLayout from '../../components/AdminLayout'
import TelegramVerificationGate from '../../components/TelegramVerificationGate'
import { useUsers, requestOwnershipTransfer, confirmOwnershipTransfer, startOwnershipConfirmation, confirmDeleteCode } from '../../lib/api'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { User } from '../../lib/types'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  KeyIcon,
  CogIcon
} from '@heroicons/react/24/outline'

export default function TransferOwnershipPage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useAuth()
  
  // States for transfer process
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isRequestingTransfer, setIsRequestingTransfer] = useState(false)
  const [isConfirmingTransfer, setIsConfirmingTransfer] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  
  // Get users data
  const { data: usersData, error: usersError, mutate: mutateUsers } = useUsers()
  
  // Check if current user is Owner
  const isOwner = user?.Roles?.includes('Owner') || false
  
  // Filter out current user from the list
  const availableUsers = usersData?.Items?.filter(u => u.Id !== user?.Id) || []
  
  const handleTransferRequest = async (targetUser: User) => {
    if (!targetUser) return
    
    setSelectedUser(targetUser)
    setIsRequestingTransfer(true)
    
    try {
      await requestOwnershipTransfer(targetUser.Id)
      toast.success(t('admin.transferOwnership.verificationCodeSent'))
      setShowConfirmationModal(true)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('admin.transferOwnership.failedToSendCode'))
    } finally {
      setIsRequestingTransfer(false)
    }
  }
  
  const handleConfirmTransfer = async () => {
    if (!selectedUser || !verificationCode) return
    
    setIsConfirmingTransfer(true)
    
    try {
      const result = await confirmOwnershipTransfer(selectedUser.Id, verificationCode)
      
      if (result.Success) {
        toast.success(t('admin.transferOwnership.transferSuccess'))
        setShowVerificationModal(false)
        setShowConfirmationModal(false)
        setSelectedUser(null)
        setVerificationCode('')
        
        // Refresh users data
        mutateUsers()
        
        // Redirect to login after successful transfer
        setTimeout(() => {
          window.location.href = '/login'
        }, 2000)
      } else {
        toast.error(result.Message || t('admin.transferOwnership.transferFailed'))
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('admin.transferOwnership.failedToConfirmTransfer'))
    } finally {
      setIsConfirmingTransfer(false)
    }
  }
  
  const cancelTransfer = () => {
    setShowConfirmationModal(false)
    setShowVerificationModal(false)
    setSelectedUser(null)
    setVerificationCode('')
  }

  // Real API functions for TelegramVerificationGate
  const handleGenerateAccessCode = async () => {
    await startOwnershipConfirmation()
  }

  const handleVerifyAccessCode = async (code: number) => {
    await confirmDeleteCode({ code })
  }
  
  // Redirect if not Owner
  if (isAuthenticated && !isOwner) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Only the Owner can transfer ownership.
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }
  
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <KeyIcon className="h-8 w-8 text-yellow-600" />
                         <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
               {t('admin.transferOwnership.title')}
             </h1>
           </div>
           <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
             {t('admin.transferOwnership.description')}
             <br />• {t('admin.transferOwnership.descriptionBullets.0')}
             <br />• {t('admin.transferOwnership.descriptionBullets.1')}
             <br />• {t('admin.transferOwnership.descriptionBullets.2')}
             <br />• {t('admin.transferOwnership.descriptionBullets.3')}
           </p>
        </div>

        {/* Telegram Verification Gate */}
                 <TelegramVerificationGate
           title={t('admin.transferOwnership.accessControlTitle')}
           description={t('admin.transferOwnership.accessControlDescription')}
           generateCodeFunction={handleGenerateAccessCode}
           verifyCodeFunction={handleVerifyAccessCode}
           successMessage={t('admin.transferOwnership.accessGranted')}
           errorMessage={t('admin.transferOwnership.invalidCode')}
         >
          {/* Main Content - Only shown after Telegram verification */}
          <>
            {/* Warning Banner */}
            <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
                <div>
                                     <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                     {t('admin.transferOwnership.importantWarning')}
                   </h3>
                   <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                     {t('admin.transferOwnership.warningText')}
                   </p>
                </div>
              </div>
            </div>
            
            {/* Users Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                 <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                   {t('admin.transferOwnership.selectNewOwner')}
                 </h2>
                 <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                   {t('admin.transferOwnership.selectNewOwnerDescription')}
                 </p>
              </div>
              
                             {usersError ? (
                 <div className="p-6 text-center">
                   <p className="text-red-600 dark:text-red-400">{t('admin.transferOwnership.failedToLoadUsers')}</p>
                 </div>
               ) : !usersData ? (
                 <div className="p-6 text-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto"></div>
                   <p className="text-gray-600 dark:text-gray-400 mt-2">{t('admin.transferOwnership.loadingUsers')}</p>
                 </div>
               ) : availableUsers.length === 0 ? (
                 <div className="p-6 text-center">
                   <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                   <p className="text-gray-600 dark:text-gray-400">{t('admin.transferOwnership.noUsersAvailable')}</p>
                 </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                                                                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('admin.transferOwnership.user')}
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('admin.transferOwnership.email')}
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('admin.transferOwnership.roles')}
                     </th>
                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('admin.transferOwnership.status')}
                     </th>
                     <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                       {t('admin.transferOwnership.actions')}
                     </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {availableUsers.map((user) => (
                        <tr key={user.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                  <UserIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {user.Name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  ID: {user.Id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-gray-100">
                              {user.Email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {user.Roles?.map((role) => (
                                <span
                                  key={role}
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    role === 'Owner' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200' :
                                    role === 'SeniorAdmin' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                                    role === 'Admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                                    role === 'Organizer' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                  }`}
                                >
                                  {role}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                                                                      {user.IsBanned ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">
                                {t('admin.transferOwnership.banned')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                {t('admin.transferOwnership.active')}
                              </span>
                            )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleTransferRequest(user)}
                              disabled={isRequestingTransfer || user.IsBanned}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                                                                              {isRequestingTransfer && selectedUser?.Id === user.Id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {t('admin.transferOwnership.requesting')}
                                  </>
                                ) : (
                                  <>
                                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                                    {t('admin.transferOwnership.transfer')}
                                  </>
                                )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Confirmation Modal */}
            {showConfirmationModal && selectedUser && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                  <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                                         <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">
                       {t('admin.transferOwnership.confirmTransfer')}
                     </h3>
                     <div className="mt-2 px-7 py-3">
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         {t('admin.transferOwnership.confirmTransferText')}{' '}
                         <span className="font-semibold text-gray-900 dark:text-gray-100">
                           {selectedUser.Name}
                         </span>?
                       </p>
                       <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                         {t('admin.transferOwnership.verificationCodeSent')}
                       </p>
                     </div>
                     <div className="items-center px-4 py-3">
                       <button
                         onClick={() => setShowVerificationModal(true)}
                         className="px-4 py-2 bg-yellow-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-colors"
                       >
                         {t('admin.transferOwnership.continueWithVerification')}
                       </button>
                                              <button
                          onClick={cancelTransfer}
                          className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                          {t('common.cancel')}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Verification Modal */}
            {showVerificationModal && selectedUser && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                  <div className="mt-3 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <CogIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                                         <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mt-4">
                       {t('admin.transferOwnership.enterVerificationCode')}
                     </h3>
                     <div className="mt-2 px-7 py-3">
                       <p className="text-sm text-gray-600 dark:text-gray-400">
                         {t('admin.transferOwnership.enterCodeText')}{' '}
                         <span className="font-semibold text-gray-900 dark:text-gray-100">
                           {selectedUser.Name}
                         </span>.
                       </p>
                      <div className="mt-4">
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-3 py-2 text-center text-lg font-mono border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div className="items-center px-4 py-3">
                      <button
                        onClick={handleConfirmTransfer}
                        disabled={verificationCode.length !== 6 || isConfirmingTransfer}
                        className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                      >
                                                 {isConfirmingTransfer ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                             {t('admin.transferOwnership.transferring')}
                           </>
                         ) : (
                           t('admin.transferOwnership.completeTransfer')
                         )}
                      </button>
                                              <button
                          onClick={cancelTransfer}
                          className="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                          {t('common.cancel')}
                        </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        </TelegramVerificationGate>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
} 