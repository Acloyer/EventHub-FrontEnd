import React from 'react'
import { StarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

// Colors for roles
const ROLE_COLORS = {
  'Owner': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700',
  'SeniorAdmin': 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700',
  'Admin': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700',
  'Organizer': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
  'User': 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
}

// Icons for roles
const ROLE_ICONS = {
  'Owner': <StarIcon className="w-3 h-3" />,
  'SeniorAdmin': <StarIcon className="w-3 h-3" />,
  'Admin': <ShieldCheckIcon className="w-3 h-3" />,
  'Organizer': <ShieldCheckIcon className="w-3 h-3" />,
  'User': <ShieldCheckIcon className="w-3 h-3" />
}

interface RoleBadgeProps {
  role: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export default function RoleBadge({ 
  role, 
  size = 'md', 
  showIcon = true,
  className = ''
}: RoleBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  const colorClass = ROLE_COLORS[role as keyof typeof ROLE_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200'
  const icon = ROLE_ICONS[role as keyof typeof ROLE_ICONS]

  return (
    <span 
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && icon && (
        <span className={iconSizeClasses[size]}>
          {icon}
        </span>
      )}
      {role}
    </span>
  )
}

// Component for displaying role list
interface RoleListProps {
  roles: string[]
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  maxDisplay?: number
  className?: string
}

export function RoleList({ 
  roles, 
  size = 'md', 
  showIcon = true, 
  maxDisplay = 3,
  className = ''
}: RoleListProps) {
  if (!roles || roles.length === 0) {
    return (
      <span className="text-sm text-neutral-400 dark:text-neutral-500">
        No roles assigned
      </span>
    )
  }

  const displayRoles = roles.slice(0, maxDisplay)
  const remainingCount = roles.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayRoles.map(role => (
        <RoleBadge 
          key={role} 
          role={role} 
          size={size} 
          showIcon={showIcon} 
        />
      ))}
      {remainingCount > 0 && (
        <span className="text-xs text-neutral-500">
          +{remainingCount} more
        </span>
      )}
    </div>
  )
} 