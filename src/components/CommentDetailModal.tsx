import React from 'react'
import { Dialog } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import RoleBadge from './RoleBadge'

interface CommentDetailModalProps {
  isOpen: boolean
  onClose: () => void
  comment: {
    Id: number
    UserId: number
    EventId?: number
    Comment: string
    PostDate: string
    IsPinned: boolean
    PinnedAt?: string
    UserName?: string
    UserRoles?: string[]
    EventTitle?: string
    EventCreatorName?: string
    IsEdited?: boolean
    EditDate?: string
  } | null
}

export default function CommentDetailModal({ isOpen, onClose, comment }: CommentDetailModalProps) {
  if (!comment) return null

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Comment Details
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Comment Content */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Comment Content
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {comment.Comment}
                </p>
              </div>
            </div>

            {/* User Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                User Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Name:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {comment.UserName || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">User ID:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {comment.UserId}
                  </span>
                </div>
                {comment.UserRoles && comment.UserRoles.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Roles:</span>
                    <div className="flex gap-1">
                      {comment.UserRoles.map(role => (
                        <RoleBadge key={role} role={role} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Information */}
            {comment.EventTitle && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Event Information
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Event Title:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.EventTitle}
                    </span>
                  </div>
                  {comment.EventCreatorName && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">Event Creator:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {comment.EventCreatorName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Event ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.EventId}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Comment Metadata */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Comment Metadata
              </h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Comment ID:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {comment.Id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Posted:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(comment.PostDate)}
                  </span>
                </div>
                {comment.IsEdited && comment.EditDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Last Edited:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(comment.EditDate)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    comment.IsPinned
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  }`}>
                    {comment.IsPinned ? 'Pinned' : 'Normal'}
                  </span>
                </div>
                {comment.IsPinned && comment.PinnedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pinned At:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(comment.PinnedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 