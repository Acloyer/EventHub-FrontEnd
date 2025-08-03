import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../lib/AuthContext'
import { useUsers, getRoles, assignRoles } from '../../lib/api'
import { User } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { toast } from 'react-hot-toast'
import { 
  UserGroupIcon, 
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
  KeyIcon,
  CogIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import RoleBadge from '../../components/RoleBadge'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

interface Role {
  Id: number
  Name: string
}

// Roles in hierarchy order
const ROLE_HIERARCHY = ['User', 'Organizer', 'Admin', 'SeniorAdmin', 'Owner'] as const
type RoleType = typeof ROLE_HIERARCHY[number]

interface RoleManagementModalProps {
  user: User
  availableRoles: Role[]
  currentUserRoles: string[]
  onClose: () => void
  onSave: (roles: string[]) => void
  loading: boolean
}

const RoleManagementModal: React.FC<RoleManagementModalProps> = ({
  user,
  availableRoles,
  currentUserRoles,
  onClose,
  onSave,
  loading
}) => {
  const { t } = useTranslation()
  const [selectedRoles, setSelectedRoles] = useState<string[]>(user.Roles || [])
  const [showWarning, setShowWarning] = useState(false)

  const getRolePriority = (role: string) => {
    const priorities = {
      'Owner': 5,
      'SeniorAdmin': 4,
      'Admin': 3,
      'Organizer': 2,
      'User': 1
    }
    return priorities[role as keyof typeof priorities] || 0
  }

  const sortRolesByHierarchy = (roles: Role[]) => {
    return roles.sort((a, b) => {
      const priorityA = getRolePriority(a.Name)
      const priorityB = getRolePriority(b.Name)
      return priorityB - priorityA // Сортировка по убыванию (от высшей к низшей)
    })
  }

  const canAssignRole = (roleName: string) => {
    const currentUserMaxPriority = Math.max(...currentUserRoles.map(getRolePriority))
    const targetRolePriority = getRolePriority(roleName)
    return currentUserMaxPriority >= targetRolePriority
  }

  const toggleRole = (roleName: string) => {
    if (!canAssignRole(roleName)) {
      toast.error(`You cannot assign the ${roleName} role`)
      return
    }

    setSelectedRoles(prev => {
      if (prev.includes(roleName)) {
        return prev.filter(r => r !== roleName)
      } else {
        return [...prev, roleName]
      }
    })
  }

  const handleSave = () => {
    if (selectedRoles.length === 0) {
      toast.error('User must have at least one role')
      return
    }
    onSave(selectedRoles)
  }

  const handleRemoveOwner = () => {
    setSelectedRoles(prev => prev.filter(r => r !== 'Owner'))
    setShowWarning(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manage Roles: {user.Name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Warning Modal */}
        {showWarning && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Remove Owner Role?
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Removing the Owner role will downgrade this user to SeniorAdmin. This action cannot be undone.
                </p>
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={handleRemoveOwner}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Remove Owner
                  </button>
                  <button
                    onClick={() => setShowWarning(false)}
                    className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center">
            <UserGroupIcon className="h-10 w-10 text-gray-400 mr-4" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {user.Name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.Email} • ID: {user.Id}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.Roles?.map((role) => (
                  <RoleBadge key={role} role={role} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Available Roles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortRolesByHierarchy(availableRoles)
              .filter(role => role.Name !== 'Owner') // Исключаем роль Owner
              .map((role) => {
              const isSelected = selectedRoles.includes(role.Name)
              const canAssign = canAssignRole(role.Name)
              
              return (
                <div
                  key={role.Id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : canAssign
                      ? 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => canAssign && toggleRole(role.Name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!canAssign}
                        onChange={() => canAssign && toggleRole(role.Name)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                      />
                      <div className="ml-3">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {role.Name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getRolePriority(role.Name)} priority
                        </p>
                      </div>
                    </div>
                    {!canAssign && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Role Hierarchy Info */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            Role Hierarchy
          </h4>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p>Owner → SeniorAdmin → Admin → Organizer → User</p>
            <p className="mt-1">You can only assign roles equal to or lower than your highest role.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || selectedRoles.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserRolesPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 10;
  const { data: usersData, error, mutate } = useUsers({
    PageNumber: page,
    PageSize: pageSize,
    SearchTerm: search || undefined,
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        toast.error('Failed to load roles');
      }
    };
    fetchRoles();
  }, []);

  const getRolePriority = (roles: string[]) => {
    const rolePriorities = {
      'Owner': 5,
      'SeniorAdmin': 4,
      'Admin': 3,
      'Organizer': 2,
      'User': 1
    };
    
    return Math.max(...roles.map(role => rolePriorities[role as keyof typeof rolePriorities] || 0));
  };

  const canModifyUser = (targetUser: User) => {
    if (!user?.Roles) return false;
    
    const currentUserPriority = getRolePriority(user.Roles);
    const targetUserPriority = getRolePriority(targetUser.Roles || []);
    
    // Can only modify users with lower or equal priority
    return currentUserPriority >= targetUserPriority;
  };

  const handleRoleUpdate = async (newRoles: string[]) => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      await assignRoles(selectedUser.Id, newRoles);
      toast.success('Roles updated successfully');
      mutate(); // Refresh user data
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update roles:', error);
      toast.error('Failed to update roles');
    } finally {
      setLoading(false);
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
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('admin.userRoles')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Manage user roles and permissions</p>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              All Users ({usersData?.TotalCount || 0})
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
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {t('admin.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {usersData.Items?.map((userItem) => {
                  const canModify = canModifyUser(userItem);
                  const userPriority = getRolePriority(userItem.Roles || []);
                  
                  return (
                    <tr key={userItem.Id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserGroupIcon className="h-8 w-8 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {userItem.Name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {userItem.Id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {userItem.Email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {userItem.Roles?.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShieldCheckIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {userPriority}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {canModify ? (
                          <button
                            onClick={() => {
                              setSelectedUser(userItem);
                              setShowRoleModal(true);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                          >
                            <CogIcon className="h-3 w-3 mr-1" />
                            Manage Roles
                          </button>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No permissions
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

        {/* Role Management Modal */}
        {showRoleModal && selectedUser && (
          <RoleManagementModal
            user={selectedUser}
            availableRoles={roles}
            currentUserRoles={user?.Roles || []}
            onClose={() => {
              setShowRoleModal(false);
              setSelectedUser(null);
            }}
            onSave={handleRoleUpdate}
            loading={loading}
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
