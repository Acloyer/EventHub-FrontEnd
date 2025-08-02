import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { useUsers, getUserBanStatus, getUserMuteStatus } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { User } from '../../lib/types'
import { EditUserRolesModal } from '../../components/EditUserRolesModal'
import UserBanModal from '../../components/UserBanModal'
import UserMuteModal from '../../components/UserMuteModal'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'
import { EyeIcon } from '@heroicons/react/24/outline'

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user, startImpersonating } = useAuth();
  
  // Pagination and search state
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 10;
  
  // User data with pagination
  const { data: usersData, error, mutate } = useUsers({
    PageNumber: page,
    PageSize: pageSize,
    SearchTerm: search || undefined,
  });
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showMuteModal, setShowMuteModal] = useState(false);
  const [impersonatingUserId, setImpersonatingUserId] = useState<number | null>(null);

  const handleImpersonate = async (targetUser: User) => {
    if (!confirm(`Are you sure you want to impersonate ${targetUser.Name}?`)) {
      return;
    }

    setImpersonatingUserId(targetUser.Id);
    try {
      await startImpersonating(targetUser.Id);
    } catch (error) {
      console.error('Impersonation failed:', error);
    } finally {
      setImpersonatingUserId(null);
    }
  };

  if (!isAuthenticated || !user?.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('common.adminAccessRequired')}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            {t('common.error')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Failed to load users
          </p>
        </div>
      </div>
    );
  }

  if (!usersData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('admin.allUsers')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

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
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {userItem.Name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {userItem.Id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {userItem.Email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {userItem.Roles?.map((role) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
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
                          setSelectedUser(userItem);
                          setShowBanModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Ban
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(userItem);
                          setShowMuteModal(true);
                        }}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                      >
                        Mute
                      </button>
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
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(usersData?.TotalPages || 1, p + 1))}
                disabled={page === usersData?.TotalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{((page - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, usersData?.TotalCount || 0)}
                  </span> of{' '}
                  <span className="font-medium">{usersData?.TotalCount || 0}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                    Page {page} of {usersData?.TotalPages || 1}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(usersData?.TotalPages || 1, p + 1))}
                    disabled={page === usersData?.TotalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showRolesModal && selectedUser && (
          <EditUserRolesModal
            user={selectedUser}
            onClose={() => setShowRolesModal(false)}
            onSave={(updatedUser: User) => { mutate(); setShowRolesModal(false); }}
          />
        )}
        
        {showBanModal && selectedUser && (
          <UserBanModal
            isOpen={showBanModal}
            onClose={() => setShowBanModal(false)}
            userId={selectedUser.Id}
            userName={selectedUser.Name}
            currentBanStatus={{ isBanned: selectedUser.IsBanned || false }}
            onBanUpdate={() => { mutate(); setShowBanModal(false); }}
          />
        )}
        
        {showMuteModal && selectedUser && (
          <UserMuteModal
            isOpen={showMuteModal}
            onClose={() => setShowMuteModal(false)}
            userId={selectedUser.Id}
            userName={selectedUser.Name}
            currentMuteStatus={{ isMuted: selectedUser.IsMuted || false }}
            onMuteUpdate={() => { mutate(); setShowMuteModal(false); }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
    },
  }
}
