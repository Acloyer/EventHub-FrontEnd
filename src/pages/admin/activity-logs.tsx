import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { useAuth } from '../../lib/AuthContext'
import { getActivityLogs, getActivitySummary } from '../../lib/api'
import { ActivityLog, ActivitySummary } from '../../lib/types'
import LoadingSpinner from '../../components/LoadingSpinner'
import { format } from 'date-fns'
import { 
  EyeIcon, 
  XMarkIcon,
  FunnelIcon,
  UserIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { GetServerSideProps } from 'next'

// Predefined action types for dropdown
const ACTION_TYPES = [
  'USER_IMPERSONATION',
  'USER_ADDED_TO_BLACKLIST',
  'USER_REMOVED_FROM_BLACKLIST',
  'USER_BANNED',
  'USER_UNBANNED',
  'USER_DELETED',
  'EVENT_CREATED',
  'EVENT_UPDATED',
  'EVENT_DELETED',
  'COMMENT_CREATED',
  'COMMENT_UPDATED',
  'COMMENT_DELETED',
  'COMMENT_PINNED',
  'COMMENT_UNPINNED',
  'REACTION_ADDED',
  'REACTION_REMOVED',
  'OWNERSHIP_TRANSFER_REQUESTED',
  'OWNERSHIP_TRANSFER_COMPLETED'
]

export default function ActivityLogsPage() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionType, setActionType] = useState('');
  const pageSize = 10;
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filters = {
          page: page,
          pageSize: pageSize,
          action: actionType || undefined,
        };
        
        console.log('ActivityLogs: Fetching with filters:', filters);
        
        const [logsData, summaryData] = await Promise.all([
          getActivityLogs(filters),
          getActivitySummary()
        ]);
        
        console.log('ActivityLogs: Received data:', {
          logsCount: logsData.Items?.length || 0,
          totalCount: logsData.TotalCount,
          pageNumber: logsData.PageNumber,
          pageSize: logsData.PageSize,
          totalPages: logsData.TotalPages
        });
        setLogs(logsData.Items || []);
        setTotalCount(logsData.TotalCount || 0);
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to load activity logs');
        console.error('Error fetching activity logs:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, page, pageSize, actionType]);

  const handleLogClick = (log: ActivityLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedLog(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
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
            {error}
          </p>
        </div>
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
              {t('admin.activityLogs')}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t('admin.monitorSystemActivity')}</p>
          </div>
          <div className="flex space-x-2">
            <select
              value={actionType}
              onChange={(e) => { setActionType(e.target.value); setPage(1) }}
              className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">{t('admin.allActions')}</option>
              {ACTION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('admin.systemActivity')} ({totalCount} entries)
            </h2>
          </div>
          
          <div className="p-6">
            {logs.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-8">
                {t('admin.noActivityLogsFound')}
              </p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.Id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleLogClick(log)}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Main Action Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.Action?.includes('USER') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              log.Action?.includes('EVENT') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              log.Action?.includes('COMMENT') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              log.Action?.includes('REACTION') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {log.Action || 'Unknown'}
                            </span>
                            {log.EntityId && (
                                                          <span className="text-xs text-gray-500 dark:text-gray-400">
                              {log.EntityType} {t('admin.entityId')}: {log.EntityId}
                            </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {t('admin.logId')}: {log.Id}
                            </span>
                            <EyeIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                          {log.Details}
                        </h3>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {t('admin.userId')}: {log.UserId}
                          </span>
                          <span>
                            {format(new Date(log.Timestamp), 'MMM d, yyyy \'at\' h:mm a')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Technical Details */}
                      <div className="lg:col-span-1">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                            {t('admin.technicalDetails')}
                          </h4>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">{t('admin.userAgent')}:</span>
                              <span className="text-gray-700 dark:text-gray-300 truncate max-w-32" title={log.UserAgent}>
                                                                  {log.UserAgent ? log.UserAgent.substring(0, 30) + '...' : t('admin.unknown')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">{t('admin.entityType')}:</span>
                              <span className="text-gray-700 dark:text-gray-300">
                                                                  {log.EntityType || t('admin.unknown')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalCount > pageSize && (
          <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-6 rounded-md">
            <div className="flex justify-between flex-1 sm:hidden">
                              <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('admin.previous')}
                </button>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('admin.next')}
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {t('admin.showing')} <span className="font-medium">{((page - 1) * pageSize) + 1}</span> {t('admin.to')}{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, totalCount)}
                  </span> {t('admin.of')}{' '}
                  <span className="font-medium">{totalCount}</span> {t('admin.results')}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-l-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('admin.previous')}
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-t border-b border-gray-300 dark:border-gray-600">
                    {t('admin.page')} {page} {t('admin.of')} {Math.ceil(totalCount / pageSize)}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(Math.ceil(totalCount / pageSize), p + 1))}
                    disabled={page >= Math.ceil(totalCount / pageSize)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {t('admin.next')}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Log Details Modal */}
        {showDetails && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {t('admin.activityLogDetails')}
                </h3>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {t('admin.basicInformation')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.logId')}</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{selectedLog.Id}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.userId')}</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedLog.UserId}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.action')}</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedLog.Action?.includes('USER') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        selectedLog.Action?.includes('EVENT') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        selectedLog.Action?.includes('COMMENT') ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        selectedLog.Action?.includes('REACTION') ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {selectedLog.Action}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.timestamp')}</label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(selectedLog.Timestamp), 'MMM d, yyyy \'at\' h:mm:ss a')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entity Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {t('admin.entityInformation')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.entityType')}</label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100">{selectedLog.EntityType || t('admin.unknown')}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.entityId')}</label>
                                              <p className="text-sm text-gray-900 dark:text-gray-100">{selectedLog.EntityId || t('admin.unknown')}</p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {t('admin.details')}
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                        {selectedLog.Details || t('admin.noDetailsProvided')}
                      </p>
                  </div>
                </div>

                {/* Technical Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
                    {t('admin.technicalInformation')}
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400">{t('admin.userAgent')}</label>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-1">
                                                  <p className="text-xs text-gray-900 dark:text-gray-100 font-mono break-all">
                            {selectedLog.UserAgent || t('admin.unknown')}
                          </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
                                  <button
                    onClick={closeDetails}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {t('common.close')}
                  </button>
              </div>
            </div>
          </div>
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
