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
  const { data: usersData, error, mutate } = useUsers()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUserForMute, setSelectedUserForMute] = useState<User | null>(null)
  const [showMuteModal, setShowMuteModal] = useState(false)

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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('admin.allUsers')} ({usersData.TotalCount})
            </h2>
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
                  <tr key={userItem.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        )) || <span className="text-gray-500 dark:text-gray-400">No roles</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.IsBanned 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : userItem.IsMuted
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {userItem.IsBanned ? 'Banned' : userItem.IsMuted ? 'Muted' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {canModifyUser(userItem) && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(userItem);
                              setShowRolesModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {t('admin.editUser')}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserForBan(userItem);
                              setShowBanModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-2"
                          >
                            {userItem.IsBanned ? t('admin.unbanUser') : t('admin.banUser')}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserForMute(userItem);
                              setShowMuteModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 ml-2"
                          >
                            {userItem.IsMuted ? t('admin.unmuteUser') : t('admin.muteUser')}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
