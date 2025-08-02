import React, { useState } from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import { assignRoles } from '../lib/api'
import RoleBadge from './RoleBadge'

// Roles in hierarchy order (Owner role removed from quick actions)
const ROLE_HIERARCHY = ['User', 'Organizer', 'Admin', 'SeniorAdmin'] as const
type RoleType = typeof ROLE_HIERARCHY[number]

interface QuickRoleManagerProps {
  userId: number
  currentRoles: string[]
  userRoles: string[] // Current user roles for permission checking
  onRoleUpdate: () => void
  disabled?: boolean
}

export default function QuickRoleManager({ 
  userId, 
  currentRoles, 
  userRoles,
  onRoleUpdate,
  disabled = false 
}: QuickRoleManagerProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const canAssignRole = (roleName: string) => {
    // No one can assign Owner role through quick actions
    if (roleName === 'Owner') {
      return false
    }
    
    const rolePriority: Record<string, number> = {
      'Owner': 4,
      'SeniorAdmin': 3,
      'Admin': 2,
      'Organizer': 1,
      'User': 0
    }
    
    const currentUserMaxRole = Math.max(...userRoles.map(r => rolePriority[r] || 0))
    const targetRolePriority = rolePriority[roleName] || 0
    
    return currentUserMaxRole >= targetRolePriority
  }

  const handleQuickRoleAssign = async (roleName: string, isAdding: boolean) => {
    if (disabled || isUpdating) return

    try {
      setIsUpdating(true)
      
      let newRoles = [...currentRoles]
      
      if (isAdding) {
        if (!newRoles.includes(roleName)) {
          newRoles.push(roleName)
        }
      } else {
        newRoles = newRoles.filter(r => r !== roleName)
      }

      await assignRoles(userId, newRoles)
      toast.success(`Role ${isAdding ? 'added' : 'removed'} successfully`)
      onRoleUpdate()
    } catch (error: any) {
      toast.error(error.message || 'Failed to update role')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Quick Actions:</p>
      <div className="grid grid-cols-2 gap-1">
        {ROLE_HIERARCHY.map(role => {
          const hasRole = currentRoles.includes(role)
          const canAssign = canAssignRole(role)
          
          return (
            <button
              key={role}
              onClick={() => canAssign && handleQuickRoleAssign(role, !hasRole)}
              disabled={!canAssign || isUpdating || disabled}
              className={`flex items-center justify-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                hasRole
                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:border-red-700 dark:hover:bg-red-800'
                  : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900 dark:text-green-200 dark:border-green-700 dark:hover:bg-green-800'
              } ${!canAssign || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {hasRole ? (
                <>
                  <MinusIcon className="w-3 h-3" />
                  Remove {role}
                </>
              ) : (
                <>
                  <PlusIcon className="w-3 h-3" />
                  Add {role}
                </>
              )}
            </button>
          )
        })}
      </div>
      
      {/* Current Roles Display */}
      {/* <div className="mt-3">
        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">Current Roles:</p>
        <div className="flex flex-wrap gap-1">
          {currentRoles.length > 0 ? (
            currentRoles.map(role => (
              <RoleBadge key={role} role={role} size="sm" />
            ))
          ) : (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">No roles assigned</span>
          )}
        </div>
      </div>
    </div> */}
    </div>
  )
} 