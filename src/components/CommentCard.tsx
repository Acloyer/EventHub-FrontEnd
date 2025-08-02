import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { updateComment, getUserById } from '../lib/api'
import { useAuth } from '../lib/AuthContext'
import { toast } from 'react-hot-toast'

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
  const [username, setUsername] = useState<string>('Unknown user')
  const [isEditing, setIsEditing] = useState(false)
  const [editedComment, setEditedComment] = useState(comment.Comment)

  const isAdmin = user?.Roles?.some(role =>
    ['Admin', 'Owner', 'Organizer', 'SeniorAdmin'].includes(role)
  )
  const isOwner = user?.Id === comment.UserId
  const canModifyComment = isAdmin || isOwner

  useEffect(() => {
    getUserById(comment.UserId)
      .then(userData => setUsername(userData.Name + ' (' + userData.Roles[0] + ')' || 'Unknown user'))
      // .then(userData => console.log(userData))
      .catch(() => setUsername('Unknown user'))
  }, [comment.UserId])

  const handleEdit = () => setIsEditing(true)

  const handleDelete = () => {
    if (window.confirm('Are you sure?') && onDelete) onDelete(comment.Id)
  }

  const handleSave = async () => {
    try {
      await updateComment(comment.Id, { Comment: editedComment })
      toast.success('Comment updated')
      setIsEditing(false)
      if (onEdit) onEdit(comment.Id, editedComment)
    } catch {
      toast.error('Failed to update comment')
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
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">(edited)</span>
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
            <button onClick={handleSave} className="btn-primary ml-2">Save</button>
          </div>
        ) : (
          comment.Comment
        )}
      </div>
    </div>
  )
}
