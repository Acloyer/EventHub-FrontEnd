import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { updateComment, deleteComment, getUserById } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'next-i18next'

interface Comment {
  Id: number
  Comment: string
  UserId: number
  PostDate: string
  IsEdited: boolean
  EditDate?: string
  IsPinned: boolean
}

interface CommentCardProps {
  comment: Comment
  onEdit?: (id: number, updated: string) => void
  onDelete?: (id: number) => void
}

export default function CommentCard({ comment, onEdit, onDelete }: CommentCardProps) {
  const { user } = useAuth()
  const { t } = useTranslation('common')
  const [username, setUsername] = useState<string>('Unknown user')
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.Comment)

  // Update editedComment when comment changes
  useEffect(() => {
    setEditedComment(comment.Comment)
  }, [comment.Comment])

  const isAdmin = user?.Roles?.some(role =>
    ['Admin', 'Owner', 'Organizer', 'SeniorAdmin'].includes(role)
  )
  const isOwner = user?.Id === comment.UserId
  const canModifyComment = isAdmin || isOwner

  useEffect(() => {
    getUserById(comment.UserId)
      .then(userData => setUsername(userData.Name + ' (' + userData.Roles[0] + ')' || t('comment.unknownUser')))
      // .then(userData => console.log(userData))
      .catch(() => setUsername(t('comment.unknownUser')))
  }, [comment.UserId])

  const handleEdit = () => setIsEditing(true)

  const handleDelete = async () => {
    if (!window.confirm(t('comment.confirmDelete'))) return
    
    try {
      await deleteComment(comment.Id)
      toast.success(t('comment.deletedSuccessfully'))
      // Call onDelete to trigger parent component refresh
      if (onDelete) {
        onDelete(comment.Id)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      toast.error(t('comment.deleteFailed'))
    }
  }

  const handleSave = async () => {
    console.log('handleSave called with comment ID:', comment.Id, 'and text:', editedComment)
    try {
      await updateComment(comment.Id, { Comment: editedComment })
      toast.success(t('comment.updatedSuccessfully'))
      setIsEditing(false)
      console.log('Comment updated successfully in handleSave')
      // Call onEdit to trigger parent component refresh
      if (onEdit) {
        onEdit(comment.Id, editedComment)
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
      toast.error(t('comment.updateFailed'))
    }
  }

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-2">
            <span className="text-blue-600 dark:text-blue-300 font-medium">{username.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{username}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {comment.PostDate && !isNaN(Date.parse(comment.PostDate))
                ? format(new Date(comment.PostDate), 'MMM d, yyyy, h:mm a')
                : 'Invalid date'}
              {comment.EditDate && comment.EditDate !== comment.PostDate && (
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">({t('comment.edited')})</span>
              )}
            </p>
          </div>
        </div>

        {canModifyComment && !isEditing && (
          <div className="flex space-x-2">
            <button onClick={handleEdit} className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400">
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-line">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              value={editedComment}
              onChange={(e) => setEditedComment(e.target.value)}
              rows={3}
            />
            <button onClick={handleSave} className="btn-primary ml-2">{t('common.save')}</button>
            <button
              onClick={() => {
                setIsEditing(false)
                setEditedComment(comment.Comment)
              }}
              className="ml-2 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {t('common.cancel')}
            </button>
          </div>
        ) : (
          comment.Comment
        )}
      </div>
    </div>
  )
}
