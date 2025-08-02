import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '../../components/AdminLayout'
import { useUsers, toggleUserBan, updateUserRoles, updateUser, getUserBanStatus } from '../../lib/api'
import { useAuth } from '../../lib/AuthContext'
import { toast } from 'react-hot-toast'
import LoadingSpinner from '../../components/LoadingSpinner'
import { User } from '../../lib/types'
import UserBanModal from '../../components/UserBanModal'
import UserMuteModal from '../../components/UserMuteModal'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

export default function AdminPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState<number | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUserForMute, setSelectedUserForMute] = useState<User | null>(null)
  const [selectedUserForBan, setSelectedUserForBan] = useState<User | null>(null)
  const [isMuteModalOpen, setIsMuteModalOpen] = useState(false)
  const [isBanModalOpen, setIsBanModalOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null);
  const [muteStatuses, setMuteStatuses] = useState<{ [userId: number]: { isMuted: boolean, until: string | null } }>({});
  const [banStatuses, setBanStatuses] = useState<{ [userId: number]: { isBanned: boolean, until?: string } }>({});
  const [muteDuration, setMuteDuration] = useState<string>('');

  const { data: usersData, error, mutate: refreshUsers } = useUsers({
    PageNumber: pageNumber,
    PageSize: pageSize,
    SearchTerm: searchTerm || undefined
  });

  // Check access rights
  useEffect(() => {
    if (user && !user.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))) {
      router.push('/')
      toast.error(t('common.accessDenied'))
    }
  }, [user, router, t])

  if (!user || !user.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {t('common.accessDenied')}
          </h1>
          <p className="text-gray-600">
            {t('common.adminAccessRequired')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {t('admin.dashboard')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('admin.users')}
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {usersData?.TotalCount || 0}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('admin.events')}
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('admin.comments')}
            </h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {t('admin.logs')}
            </h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('admin.recentActivity')}
            </h2>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300">
              {t('admin.noRecentActivity')}
            </p>
          </div>
        </div>
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
