import { useState } from 'react'
import { clsx } from 'clsx'
import { NoSymbolIcon, ClockIcon, StarIcon, KeyIcon } from '@heroicons/react/24/outline'
import Button from './Button'
import TransferOwnershipModal from './TransferOwnershipModal'
import type { User, MuteDurationDto } from '../lib/types'
import { toggleUserBan, muteUser, muteUserForDuration, updateUserRoles } from '../lib/api'
import toast from 'react-hot-toast'
import { useAuth } from '../lib/AuthContext'
import RoleBadge from './RoleBadge'

interface AdminUserTableProps {
  users: User[]
  onUserUpdate?: (userId: number, updates: Partial<User>) => void
  className?: string
  token: string
}

interface MuteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (minutes: number) => void
}

function MuteModal({ isOpen, onClose, onConfirm }: MuteModalProps) {
  const [minutes, setMinutes] = useState(60)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-neutral-900 mb-4">
          Mute User
        </h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={minutes}
            onChange={(e) => setMinutes(parseInt(e.target.value))}
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onConfirm(minutes)
              onClose()
            }}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserTable({
  users,
  onUserUpdate,
  className,
  token
}: AdminUserTableProps) {
  const { user: currentUser } = useAuth()
  const [isLoading, setIsLoading] = useState<{
    ban: number | null
    mute: number | null
    role: number | null
  }>({
    ban: null,
    mute: null,
    role: null
  })
  const [muteModal, setMuteModal] = useState<{
    isOpen: boolean
    userId: number | null
  }>({
    isOpen: false,
    userId: null
  })
  const [transferModal, setTransferModal] = useState<{
    isOpen: boolean
    targetUser: User | null
  }>({
    isOpen: false,
    targetUser: null
  })

  const [editingRoles, setEditingRoles] = useState<{ [key: number]: boolean }>({})


  const isOwner = currentUser?.Roles?.includes('Owner')

  // Roles in ascending order of privileges
  const ROLE_HIERARCHY = ['User', 'Organizer', 'Admin', 'SeniorAdmin', 'Owner'] as const
  type Role = typeof ROLE_HIERARCHY[number]

  const AVAILABLE_ROLES = ['User', 'Organizer', 'Admin', 'SeniorAdmin']

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

  const currentUserHighestRole = currentUser ? getHighestRole(currentUser.Roles || []) : 'User'

  // Check if current user can change another user's role
  const canChangeRole = (targetUser: User, newRole: string): boolean => {
    const currentUserLevel = getRoleLevel(currentUserHighestRole)
    const targetUserLevel = getRoleLevel(getHighestRole(targetUser.Roles || []))
    const newRoleLevel = getRoleLevel(newRole)

    // No one can assign Owner role through this interface
    if (newRole === 'Owner') {
      return false
    }

    // Owner can manage all roles except Owner
    if (currentUserHighestRole === 'Owner') {
      return newRole !== 'Owner'
    }

    // Senior admin can manage all roles below their own
    if (currentUserHighestRole === 'SeniorAdmin') {
      return newRoleLevel < getRoleLevel('SeniorAdmin') && targetUserLevel < getRoleLevel('SeniorAdmin')
    }

    // Admin can only manage regular users and organizers
    if (currentUserHighestRole === 'Admin') {
      return newRoleLevel < getRoleLevel('Admin') && targetUserLevel < getRoleLevel('Admin')
    }

    return false
  }

  const handleBanToggle = async (userId: number) => {
    try {
      setIsLoading(prev => ({ ...prev, ban: userId }))
      const updatedUser = await toggleUserBan(userId)
      onUserUpdate?.(userId, { IsBanned: updatedUser.IsBanned })
      toast.success('User ban status updated successfully')
    } catch (error) {
      console.error('Error toggling ban:', error)
      toast.error('Failed to update user ban status')
    } finally {
      setIsLoading(prev => ({ ...prev, ban: null }))
    }
  }

  const handleMute = async (userId: number, minutes: number) => {
    try {
      setIsLoading(prev => ({ ...prev, mute: userId }))
      const updatedUser = await muteUserForDuration(userId, { 
        Seconds: 0, 
        Minutes: minutes, 
        Hours: 0 
      })
      onUserUpdate?.(userId, { 
        IsMuted: true,
        MuteExpiresAt: new Date(Date.now() + minutes * 60000).toISOString()
      })
      toast.success('User muted successfully')
    } catch (error) {
      console.error('Error muting user:', error)
      toast.error('Failed to mute user')
    } finally {
      setIsLoading(prev => ({ ...prev, mute: null }))
    }
  }

  const handleUnmute = async (userId: number) => {
    try {
      setIsLoading(prev => ({ ...prev, mute: userId }))
      const updatedUser = await muteUser(userId, { IsMuted: false })
      onUserUpdate?.(userId, { 
        IsMuted: false,
        MuteExpiresAt: undefined
      })
      toast.success('User unmuted successfully')
    } catch (error) {
      console.error('Error unmuting user:', error)
      toast.error('Failed to unmute user')
    } finally {
      setIsLoading(prev => ({ ...prev, mute: null }))
    }
  }

  const handleTransferOwnership = (targetUser: User) => {
    setTransferModal({ isOpen: true, targetUser })
  }

  const handleTransferSuccess = () => {
    // Update user data after successful transfer
    // In a real application, state should be updated here
    toast.success('Ownership transferred successfully')
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    const targetUser = users.find(u => u.Id === userId)
    if (!targetUser) return

    if (!canChangeRole(targetUser, newRole)) {
      toast.error('You do not have permission to assign this role')
      return
    }

    setIsLoading(prev => ({ ...prev, role: userId }))

    try {
      await updateUserRoles(userId, [newRole])
      
      // Update local state
      onUserUpdate?.(userId, { Roles: [newRole] })
      
      setEditingRoles(prev => ({ ...prev, [userId]: false }))
      toast.success('User role updated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user role')
    } finally {
      setIsLoading(prev => ({ ...prev, role: null }))
    }
  }



  return (
    <>
      <div className={clsx('overflow-x-auto', className)}>
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Telegram
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {(users ?? []).map(user => (
              <tr key={user.Id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-medium">
                        {user.Name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {user.Name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {user.Email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {editingRoles[user.Id] ? (
                      <div className="flex items-center space-x-2">
                        <select
                          className="block w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          defaultValue={getHighestRole(user.Roles || [])}
                          onChange={(e) => handleRoleChange(user.Id, e.target.value)}
                          disabled={isLoading.role === user.Id}
                        >
                          {AVAILABLE_ROLES.map((role) => (
                            <option key={role} value={role} disabled={!canChangeRole(user, role)}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setEditingRoles(prev => ({ ...prev, [user.Id]: false }))}
                          className="text-neutral-400 hover:text-neutral-600"
                          disabled={isLoading.role === user.Id}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        {(user.Roles ?? []).map(role => (
                          <RoleBadge key={role} role={role} />
                        ))}
                        {user.Id !== currentUser?.Id && (
                          <button
                            onClick={() => setEditingRoles(prev => ({ ...prev, [user.Id]: true }))}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                            disabled={isLoading.role === user.Id}
                            title="Edit Roles"
                          >
                            <KeyIcon className="h-3 w-3" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col gap-1">
                    {user.IsBanned && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Banned
                      </span>
                    )}
                    {user.IsMuted && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Muted
                        {user.MuteExpiresAt && (
                          <span className="ml-1">
                            until {new Date(user.MuteExpiresAt).toLocaleString()}
                          </span>
                        )}
                      </span>
                    )}
                    {!user.IsBanned && !user.IsMuted && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.IsTelegramVerified ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-neutral-100 text-neutral-800">
                      Not Verified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {/* Show message if this is the current user */}
                  {user.Id === currentUser?.Id ? (
                    <span className="text-sm text-neutral-500 italic">
                      Your account
                    </span>
                  ) : (
                    <>
                      {/* Ownership transfer button - only for Owner */}
                      {isOwner && (
                        <button
                          onClick={() => handleTransferOwnership(user)}
                          className="btn-sm btn-outline-purple"
                          title="Transfer Ownership"
                        >
                          <StarIcon className="h-4 w-4 mr-1 inline" />
                          Transfer
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleBanToggle(user.Id)}
                        disabled={isLoading.ban === user.Id}
                        className={`btn-sm ${user.IsBanned ? 'btn-outline-green' : 'btn-outline-red'}`}
                      >
                        {isLoading.ban === user.Id ? (
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <NoSymbolIcon className="h-4 w-4 mr-1 inline" />
                            {user.IsBanned ? 'Unban' : 'Ban'}
                          </>
                        )}
                      </button>
                      {user.IsMuted ? (
                        <button
                          onClick={() => handleUnmute(user.Id)}
                          disabled={isLoading.mute === user.Id}
                          className="btn-sm btn-outline-green"
                        >
                          {isLoading.mute === user.Id ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            'Unmute'
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setMuteModal({ isOpen: true, userId: user.Id })}
                          disabled={isLoading.mute === user.Id}
                          className="btn-sm btn-outline-yellow"
                        >
                          {isLoading.mute === user.Id ? (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <>
                              <ClockIcon className="h-4 w-4 mr-1 inline" />
                              Mute
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MuteModal
        isOpen={muteModal.isOpen}
        onClose={() => setMuteModal({ isOpen: false, userId: null })}
        onConfirm={(minutes) => {
          if (muteModal.userId) {
            handleMute(muteModal.userId, minutes)
          }
        }}
      />

      {transferModal.targetUser && (
        <TransferOwnershipModal
          isOpen={transferModal.isOpen}
          onClose={() => setTransferModal({ isOpen: false, targetUser: null })}
          targetUser={transferModal.targetUser}
          onSuccess={handleTransferSuccess}
        />
      )}


    </>
  )
} 