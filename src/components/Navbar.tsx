// src/components/Navbar.tsx
import { Fragment, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserCircleIcon,
  CalendarIcon,
  StarIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  HomeIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../lib/AuthContext'
import { useIsClient } from '../lib/useIsClient'
import { clsx } from 'clsx'
import NotificationCenter from './NotificationCenter'
import ThemeToggle from './ThemeToggle';
import { useTranslation } from 'next-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import withTranslations from '../lib/withTranslations'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  requiresAuth: boolean
  requiresAdmin?: boolean
  requiresOrganizer?: boolean
  requiresElevatedRole?: boolean
}

export default function Navbar() {
  const { user, isAuthenticated, logout, isImpersonating, stopImpersonating } = useAuth()
  const router = useRouter()
  const isClient = useIsClient()
  const { t, i18n } = useTranslation('common')

  // Отладка переводов
  console.log('Navbar: i18n state', {
    language: i18n.language,
    isInitialized: i18n.isInitialized,
    t: typeof t,
    testTranslation: t('navbar.home')
  })

  const isAdmin = user?.Roles?.some((role: string) => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))
  const isOrganizer = user?.Roles?.some((role: string) => ['Organizer', 'Admin', 'SeniorAdmin', 'Owner'].includes(role))

  // Function to determine panel title based on role
  const getPanelTitle = () => {
    if (user?.Roles?.includes('Owner')) {
      return t('admin.owner') + ' Panel'
    } else if (user?.Roles?.includes('SeniorAdmin')) {
      return t('admin.seniorAdmin') + ' Panel'
    } else if (user?.Roles?.includes('Admin')) {
      return t('admin.admin') + ' Panel'
    } else if (user?.Roles?.includes('Creator')) {
      return t('admin.creator') + ' Panel'
    }
    return t('navbar.adminPanel')
  }

  const navigation: NavItem[] = isClient ? [
    { 
      name: t('navbar.home'), 
      href: '/', 
      icon: <HomeIcon className="h-5 w-5 mr-1" />,
      requiresAuth: false 
    },
    { 
      name: t('navbar.about'), 
      href: '/about', 
      icon: <InformationCircleIcon className="h-5 w-5 mr-1" />,
      requiresAuth: false 
    },
    { 
      name: t('navbar.events'), 
      href: '/events', 
      icon: <CalendarIcon className="h-5 w-5 mr-1" />,
      requiresAuth: false 
    },
    { 
      name: t('navbar.favorites'), 
      href: '/events/favorites', 
      icon: <StarIcon className="h-5 w-5 mr-1" />,
      requiresAuth: true 
    },
    { 
      name: t('navbar.going'), 
      href: '/events/going', 
      icon: <CalendarIcon className="h-5 w-5 mr-1" />,
      requiresAuth: true 
    },
    { 
      name: t('navbar.myEvents'), 
      href: '/my-events', 
      icon: <Squares2X2Icon className="h-5 w-5 mr-1" />,
      requiresAuth: true,
      requiresElevatedRole: true
    }
  ] : []

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{t('navbar.impersonatingUser')}</span>
            <button
              onClick={stopImpersonating}
              className="ml-4 bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              {t('navbar.returnToMyAccount')}
            </button>
          </div>
        </div>
      )}
      
      <Disclosure as="nav" className="bg-white dark:bg-gray-800 shadow sticky top-0 z-50">
        {({ open }: { open: boolean }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-2xl font-bold text-blue-600">
                    EventHub
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {(navigation ?? []).map((item) => {
                    if (item.requiresAuth && !isAuthenticated) return null
                    if (item.requiresAdmin && !isAdmin) return null
                    if (item.requiresOrganizer && !isOrganizer) return null
                    if (item.requiresElevatedRole && !(user?.Roles?.some((role: string) => ['Admin', 'SeniorAdmin', 'Owner', 'Organizer'].includes(role)))) return null
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          router.pathname === item.href || router.pathname.startsWith(item.href + '/')
                            ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100',
                          'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                        )}
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                {/* Theme and Language switchers - available for all users */}
                <LanguageSwitcher />
                <ThemeToggle />
                
                {!isClient ? (
                  <div className="space-x-4">
                    <div className="text-gray-500 text-sm font-medium">{t('common.loading')}</div>
                  </div>
                ) : isAuthenticated ? (
                  <>
                    <NotificationCenter />
                    <Menu as="div" className="relative">
                    <Menu.Button className="flex rounded-full bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                      <span className="sr-only">{t('navbar.openUserMenu')}</span>
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user?.Name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.Name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.Email}</p>
                        </div>
                        <Menu.Item>
                          {({ active }: { active: boolean }) => (
                            <Link
                              href="/profile"
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              <div className="flex items-center">
                                <UserCircleIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                                {t('navbar.profile')}
                              </div>
                            </Link>
                          )}
                        </Menu.Item>
                        {isAdmin && (
                          <Menu.Item>
                            {({ active }: { active: boolean }) => (
                              <Link
                                href="/admin"
                                className={clsx(
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <div className="flex items-center">
                                  <Cog6ToothIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                                  {t('navbar.adminPanel')}
                                </div>
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        {(isAdmin || user?.Roles?.some(role => role === 'Organizer')) && (
                          <Menu.Item>
                            {({ active }: { active: boolean }) => (
                              <Link
                                href="/organizer"
                                className={clsx(
                                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                                )}
                              >
                                <div className="flex items-center">
                                  <CalendarIcon className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                                  {t('navbar.organizerDashboard')}
                                </div>
                              </Link>
                            )}
                          </Menu.Item>
                        )}
                        <Menu.Item>
                          {({ active }: { active: boolean }) => (
                            <button
                              onClick={logout}
                              className={clsx(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300'
                              )}
                            >
                              {t('navbar.logout')}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                  </>
                ) : (
                  <div className="space-x-4">
                    <Link
                      href="/login"
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                    >
                      {t('navbar.login')}
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-700"
                    >
                      {t('navbar.register')}
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">{t('navbar.openMainMenu')}</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {(navigation ?? []).map((item) => {
                if (item.requiresAuth && !isAuthenticated) return null
                if (item.requiresAdmin && !isAdmin) return null
                if (item.requiresOrganizer && !isOrganizer) return null
                if (item.requiresElevatedRole && !(user?.Roles?.some((role: string) => ['Admin', 'SeniorAdmin', 'Owner', 'Organizer'].includes(role)))) return null
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    href={item.href}
                    className={clsx(
                      router.pathname === item.href || router.pathname.startsWith(item.href + '/')
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                      'block border-l-4 py-2 pl-3 pr-4 text-base font-medium flex items-center'
                    )}
                  >
                    {item.icon}
                    {item.name}
                  </Disclosure.Button>
                )
              })}
            </div>
            <div className="border-t border-gray-200 pb-3 pt-4">
              {/* Theme and Language switchers for mobile - available for all users */}
              <div className="px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                  <div className="flex items-center space-x-2">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
              
              {!isClient ? (
                <div className="px-4 py-2">
                  <div className="text-sm text-gray-500">{t('common.loading')}</div>
                </div>
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {user?.Name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user?.Name}</div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.Email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      href="/profile"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    >
                      {t('navbar.profile')}
                    </Disclosure.Button>
                    {isAdmin && (
                      <Disclosure.Button
                        as={Link}
                        href="/admin"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      >
                        {t('navbar.adminPanel')}
                      </Disclosure.Button>
                    )}
                    {(isAdmin || user?.Roles?.some(role => role === 'Organizer')) && (
                      <Disclosure.Button
                        as={Link}
                        href="/organizer"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                      >
                        {t('navbar.organizerDashboard')}
                      </Disclosure.Button>
                    )}
                    <Disclosure.Button
                      as="button"
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                    >
                      {t('navbar.logout')}
                    </Disclosure.Button>
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <Disclosure.Button
                    as={Link}
                    href="/login"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  >
                    {t('navbar.login')}
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    href="/register"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                  >
                    {t('navbar.register')}
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
    </>
  )
}
