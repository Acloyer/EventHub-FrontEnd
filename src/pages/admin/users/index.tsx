import { useState } from 'react'
import AdminLayout from '@components/AdminLayout'
import { useAuth } from '@lib/AuthContext'
import { toast } from 'react-hot-toast'
import { useUsers, updateUserRoles } from '@lib/api'
import { User } from '@lib/types'
import AdminUserTable from '@components/AdminUserTable'
import RoleBadge from '@components/RoleBadge'
import { EditUserRolesModal } from '@components/EditUserRolesModal'
import UserBanModal from '@components/UserBanModal'
import UserMuteModal from '@components/UserMuteModal'
import UserDetailsModal from '@components/UserDetailsModal'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

// Roles in ascending order of privileges
const ROLE_HIERARCHY = ['User', 'Organizer', 'Admin', 'SeniorAdmin', 'Owner'] as const
type Role = typeof ROLE_HIERARCHY[number]

const AVAILABLE_ROLES = ['User', 'Organizer', 'Admin', 'SeniorAdmin', 'Owner']

// Function to check role level
const getRoleLevel = (role: string): number => {
  return ROLE_HIERARCHY.indexOf(role as Role)
}

// Function to get user's highest role
const getHighestRole = (roles: string[]): string => {
  let highestLevel = -1
  let highestRole = 'User'
  
  roles.forEach(role => {
    const level = getRoleLevel(role)
    if (level > highestLevel) {
      highestLevel = level
      highestRole = role
    }
  })
  
  return highestRole
}

export default function AdminUsers() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const [page, setPage] = useState(1)
  const pageSize = 10
  const { data: usersData, error, mutate } = useUsers({
    PageNumber: page,
    PageSize: pageSize
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUserForMute, setSelectedUserForMute] = useState<User | null>(null)
  const [showMuteModal, setShowMuteModal] = useState(false)
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  // Check if current user can modify the target user
  const canModifyUser = (targetUser: User): boolean => {
    if (!user?.Roles) return false
    
    const currentUserHighestRole = getHighestRole(user.Roles)
    const targetUserHighestRole = getHighestRole(targetUser.Roles || [])
    
    return getRoleLevel(currentUserHighestRole) > getRoleLevel(targetUserHighestRole)
  }

  const handleRoleUpdate = async (userId: string, newRoles: string[]) => {
    try {
      await updateUserRoles(parseInt(userId), newRoles)
      toast.success(t('admin.userUpdated'))
      mutate()
      setShowRolesModal(false)
    } catch (error) {
      toast.error(t('common.error'))
    }
  }

  if (!isAuthenticated) {
    return <div>Access denied</div>
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Error: {error.message}</div>
      </AdminLayout>
    )
  }

  if (!usersData) {
    return (
      <AdminLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('admin.allUsers')}
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('admin.allUsers')} ({usersData.TotalCount})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.clickRowForDetails')}
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.email')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.roles')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.status')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usersData.Items?.map((userItem) => (
                  <tr 
                    key={userItem.Id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      setSelectedUserForDetails(userItem)
                      setShowDetailsModal(true)
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {userItem.Name?.charAt(0)?.toUpperCase() ?? 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {userItem.Name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {userItem.Id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {userItem.Email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {userItem.Roles?.map((role) => (
                          <RoleBadge key={role} role={role} />
                        )) || <span className="text-gray-500 dark:text-gray-400">{t('admin.noRoles')}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {/* Main Status */}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.IsBanned 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : userItem.IsMuted
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {userItem.IsBanned ? t('admin.banned') : userItem.IsMuted ? t('admin.muted') : t('admin.active')}
                        </span>
                        
                        {/* Additional Status Indicators */}
                        {(userItem.IsBanned || userItem.IsMuted) && (
                          <div className="flex space-x-1">
                            {userItem.IsBanned && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-red-50 text-red-700 dark:bg-red-800 dark:text-red-200 rounded">
                                <span className="w-1 h-1 bg-red-400 rounded-full mr-1"></span>
                                {t('admin.banned')}
                              </span>
                            )}
                            {userItem.IsMuted && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 rounded">
                                <span className="w-1 h-1 bg-yellow-400 rounded-full mr-1"></span>
                                {t('admin.muted')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canModifyUser(userItem) && (
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(userItem);
                                setShowRolesModal(true);
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title={t('admin.editUser')}
                            >
                              {t('admin.editUser')}
                            </button>
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForBan(userItem);
                                setShowBanModal(true);
                              }}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                userItem.IsBanned
                                  ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                              }`}
                              title={userItem.IsBanned ? t('admin.unbanUser') : t('admin.banUser')}
                            >
                              {userItem.IsBanned ? t('admin.unbanUser') : t('admin.banUser')}
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserForMute(userItem);
                                setShowMuteModal(true);
                              }}
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                userItem.IsMuted
                                  ? 'text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                                  : 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 hover:bg-green-50 dark:hover:bg-yellow-900/20'
                              }`}
                              title={userItem.IsMuted ? t('admin.unmuteUser') : t('admin.muteUser')}
                            >
                              {userItem.IsMuted ? t('admin.unmuteUser') : t('admin.muteUser')}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {usersData?.TotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-6 rounded-md">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('common.previous')}
              </button>
              <button
                onClick={() => setPage(p => Math.min(usersData?.TotalPages || 1, p + 1))}
                disabled={page === usersData?.TotalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                {t('common.next')}
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.showing')} <span className="font-medium">{((page - 1) * pageSize) + 1}</span> {t('admin.to')}{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, usersData?.TotalCount || 0)}
                  </span> {t('admin.of')}{' '}
                  <span className="font-medium">{usersData?.TotalCount || 0}</span> {t('admin.results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('common.previous')}
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                    {t('admin.page')} {page} {t('admin.of')} {usersData?.TotalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(usersData?.TotalPages || 1, p + 1))}
                    disabled={page === usersData?.TotalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('common.next')}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {selectedUser && showRolesModal && (
          <EditUserRolesModal
            user={selectedUser}
            onClose={() => setShowRolesModal(false)}
            onSave={(updatedUser) => {
              mutate();
              setShowRolesModal(false);
            }}
          />
        )}

        {selectedUserForBan && showBanModal && (
          <UserBanModal
            isOpen={showBanModal}
            onClose={() => setShowBanModal(false)}
            userId={selectedUserForBan.Id}
            userName={selectedUserForBan.Name || ''}
            currentBanStatus={{ isBanned: selectedUserForBan.IsBanned || false }}
            onBanUpdate={() => {
              mutate();
              setShowBanModal(false);
            }}
          />
        )}

        {selectedUserForMute && showMuteModal && (
          <UserMuteModal
            isOpen={showMuteModal}
            onClose={() => setShowMuteModal(false)}
            userId={selectedUserForMute.Id}
            userName={selectedUserForMute.Name || ''}
            currentMuteStatus={{ isMuted: selectedUserForMute.IsMuted || false }}
            onMuteUpdate={() => {
              mutate();
              setShowMuteModal(false);
            }}
          />
        )}

        {selectedUserForDetails && showDetailsModal && (
          <UserDetailsModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            user={selectedUserForDetails}
          />
        )}
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
