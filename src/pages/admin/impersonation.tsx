import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../lib/AuthContext'
import { useUsers } from '../../lib/api'
import RoleBadge from '../../components/RoleBadge'
import { User } from '../../lib/types'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  UserCircleIcon, 
  EyeIcon, 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function UserImpersonationPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user, startImpersonating } = useAuth();
  const { data: usersData, error, mutate } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

  const filteredUsers = usersData.Items?.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.Name?.toLowerCase().includes(searchLower) ||
      user.Email?.toLowerCase().includes(searchLower) ||
      user.Id.toString().includes(searchTerm)
    );
  }) || [];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            User Impersonation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Select a user to impersonate their account. You will be able to see and interact with the application as that user.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Select User to Impersonate
            </h2>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.Id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{user.Name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.Email}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">ID: {user.Id}</p>
                      {user.Roles && user.Roles.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {user.Roles.map(role => (
                            <RoleBadge key={role} role={role} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleImpersonate(user)}
                    disabled={impersonatingUserId === user.Id}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                  >
                    {impersonatingUserId === user.Id ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>Impersonating...</span>
                      </>
                    ) : (
                      <>
                        <EyeIcon className="h-4 w-4" />
                        <span>Impersonate</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
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
