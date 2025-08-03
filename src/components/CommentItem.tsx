import React, { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  TrashIcon, 
  PencilIcon, 
  MapPinIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../lib/AuthContext'
import { deleteComment, updateComment, pinComment, unpinComment } from '../lib/api'
import toast from 'react-hot-toast'
import { useTranslation } from 'next-i18next'

interface CommentItemProps {
  comment: {
    Id?: number
    EventId: number
    UserId: number
    Comment: string
    PostDate: string
    IsEdited: boolean
    EditDate?: string
    IsPinned: boolean
    User?: {
      Id: number
      Name: string
      Roles: string[]
    }
  }
  onCommentUpdate: () => void
  onCommentDelete: () => void
}

export default function CommentItem({ 
  comment, 
  onCommentUpdate, 
  onCommentDelete 
}: CommentItemProps) {
  const { user } = useAuth()
  const { t } = useTranslation('common')
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.Comment)
  const [isLoading, setIsLoading] = useState(false)

  // Update editText when comment changes
  useEffect(() => {
    setEditText(comment.Comment)
  }, [comment.Comment])

  const isOwner = user?.Id === comment.UserId
  const isAdmin = user?.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role))
  const canEdit = isOwner || isAdmin
  const canDelete = isOwner || isAdmin
  const canPin = isAdmin

  const handleEdit = async () => {
    if (!comment.Id || !editText.trim()) return
    
    setIsLoading(true)
    try {
      await updateComment(comment.Id, { Comment: editText.trim() })
      setIsEditing(false)
      // Add a small delay before calling onCommentUpdate
      setTimeout(() => {
        onCommentUpdate()
      }, 100)
      toast.success(t('comment.updatedSuccessfully'))
    } catch (error) {
      console.error('Failed to update comment:', error)
      toast.error(t('comment.updateFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!comment.Id) return
    
    if (!confirm(t('comment.confirmDelete'))) return
    
    setIsLoading(true)
    try {
      await deleteComment(comment.Id)
      // Add a small delay before calling onCommentDelete
      setTimeout(() => {
        onCommentDelete()
      }, 100)
      toast.success(t('comment.deletedSuccessfully'))
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(t('comment.deleteFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinToggle = async () => {
    if (!comment.Id) return
    
    setIsLoading(true)
    try {
      if (comment.IsPinned) {
        await unpinComment(comment.Id)
        toast.success(t('comment.unpinned'))
      } else {
        await pinComment(comment.Id)
        toast.success(t('comment.pinned'))
      }
      // Add a small delay before calling onCommentUpdate
      setTimeout(() => {
        onCommentUpdate()
      }, 100)
    } catch (error) {
      console.error('Failed to toggle pin:', error)
      toast.error(t('comment.pinToggleFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy \'at\' h:mm a')
  }

  return (
    <div className={`border rounded-lg p-4 ${comment.IsPinned ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 font-medium text-sm">
              {comment.User?.Name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {comment.User?.Name || t('comment.unknownUser')}
              </span>
              {comment.IsPinned && (
                <MapPinIcon className="h-4 w-4 text-yellow-500" />
              )}
              {comment.User?.Roles?.some(role => ['Admin', 'SeniorAdmin', 'Owner'].includes(role)) && (
                <ShieldCheckIcon className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatDate(comment.PostDate)}</span>
              {comment.IsEdited && (
                <span className="text-gray-400 dark:text-gray-500">({t('comment.edited')})</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          {canPin && (
            <button
              onClick={handlePinToggle}
              disabled={isLoading}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${comment.IsPinned ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400 dark:text-gray-500'}`}
              title={comment.IsPinned ? t('comment.unpinComment') : t('comment.pinComment')}
            >
              <MapPinIcon className="h-4 w-4" />
            </button>
          )}
          
          {canEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={isLoading}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              title={t('comment.editComment')}
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
              title={t('comment.deleteComment')}
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="text-gray-700 dark:text-gray-300">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditText(comment.Comment)
                }}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleEdit}
                disabled={isLoading || !editText.trim()}
                className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap">{comment.Comment}</p>
        )}
      </div>
    </div>
  )
}