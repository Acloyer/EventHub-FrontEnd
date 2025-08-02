import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { clsx } from 'clsx'
import { 
  UserGroupIcon, 
  CalendarIcon, 
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  KeyIcon,
  StarIcon,
  ServerIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../lib/AuthContext'

interface SidebarItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const { user } = useAuth()
  
  const sidebarItems: SidebarItem[] = [
    {
      name: 'Users',
      href: '/admin/users',
      icon: <UserGroupIcon className="w-5 h-5" />
    },
    {
      name: 'User Roles',
      href: '/admin/user-roles',
      icon: <KeyIcon className="w-5 h-5" />
    },
    {
      name: 'Events',
      href: '/admin/events',
      icon: <CalendarIcon className="w-5 h-5" />
    },
    {
      name: 'Comments',
      href: '/admin/comments',
      icon: <ChatBubbleLeftRightIcon className="w-5 h-5" />
    }
  ]

  // Add User Impersonation tab only for Owner
  const isOwner = user?.Roles?.some(role => role === 'Owner')
  if (isOwner) {
    sidebarItems.push({
      name: 'User Impersonation',
      href: '/admin/impersonation',
      icon: <ShieldCheckIcon className="w-5 h-5" />
    })
    sidebarItems.push({
      name: 'Transfer Ownership',
      href: '/admin/transfer-ownership',
      icon: <KeyIcon className="w-5 h-5 text-yellow-500" />
    })
  }

  // Add logs only for SeniorAdmin and Owner
  const canViewLogs = user?.Roles?.some(role => ['SeniorAdmin', 'Owner'].includes(role))
  if (canViewLogs) {
    sidebarItems.push({
      name: 'Activity Logs',
      href: '/admin/activity-logs',
      icon: <DocumentTextIcon className="w-5 h-5" />
    })
  }

  // Add database seeding only for Owner
  if (isOwner) {
    sidebarItems.push({
      name: 'Seed Database',
      href: '/admin/seed-database',
      icon: <ServerIcon className="w-5 h-5" />
    })
  }

  // Function to determine panel title based on role
  const getPanelTitle = () => {
    if (user?.Roles?.includes('Owner')) {
      return 'Owner Panel'
    } else if (user?.Roles?.includes('SeniorAdmin')) {
      return 'Senior Admin Panel'
    } else if (user?.Roles?.includes('Admin')) {
      return 'Admin Panel'
    }
    return 'Admin Panel'
  }

  // Function to get role icon
  const getRoleIcon = () => {
    if (user?.Roles?.includes('Owner')) {
      return <StarIcon className="w-4 h-4 text-yellow-600" />
    } else if (user?.Roles?.includes('SeniorAdmin')) {
      return <StarIcon className="w-4 h-4 text-purple-600" />
    } else if (user?.Roles?.includes('Admin')) {
      return <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
    }
    return <ShieldCheckIcon className="w-4 h-4 text-gray-600" />
  }

  // Function to get role color
  const getRoleColor = () => {
    if (user?.Roles?.includes('Owner')) {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    } else if (user?.Roles?.includes('SeniorAdmin')) {
      return 'text-purple-600 bg-purple-50 border-purple-200'
    } else if (user?.Roles?.includes('Admin')) {
      return 'text-blue-600 bg-blue-50 border-blue-200'
    }
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  // Get user's highest role
  const getHighestRole = () => {
    const roleHierarchy = ['Owner', 'SeniorAdmin', 'Admin', 'Organizer', 'User']
    const userRoles = user?.Roles || []
    
    for (const role of roleHierarchy) {
      if (userRoles.includes(role)) {
        return role
      }
    }
    return 'User'
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-neutral-50 dark:bg-gray-900">
      <div className="w-full md:w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-neutral-200 dark:border-gray-700">
        <div className="p-4 border-b border-neutral-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-gray-100 flex items-center gap-2">
            {getRoleIcon()}
            {getPanelTitle()}
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()}`}>
              {getRoleIcon()}
              <span className="ml-1">{getHighestRole()}</span>
            </span>
          </div>
        </div>
        <nav className="mt-4">
          <div className="space-y-1 px-2">
            {(sidebarItems ?? []).map((item) => {
              // Special logic for determining active element
              const isActive = item.href === '/admin' 
                ? router.pathname === '/admin' // For Users - exact match only
                : router.pathname === item.href || router.pathname.startsWith(item.href + '/') // For others
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100',
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <div
                    className={clsx(
                      isActive
                        ? 'text-blue-600 dark:text-blue-300'
                        : 'text-neutral-400 group-hover:text-neutral-500 dark:text-gray-400 dark:group-hover:text-gray-300',
                      'mr-3 flex-shrink-0'
                    )}
                  >
                    {item.icon}
                  </div>
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
} 