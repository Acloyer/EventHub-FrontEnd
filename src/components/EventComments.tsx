import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useComments } from '../lib/api'
import { createComment, updateComment, deleteComment } from '../lib/api'
import { CommentDto, CreateCommentDto } from '../lib/types'
import CommentCard from './CommentCard'
import { toast } from 'react-hot-toast'

interface EventCommentsProps {
  eventId: number
}

export default function EventComments({ eventId }: EventCommentsProps) {
  const { isAuthenticated, user } = useAuth()
  const { data: comments, error, mutate } = useComments(eventId)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please sign in to comment')
      return
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    try {
      const commentData: CreateCommentDto = { Comment: newComment.trim() }
      await createComment(eventId, commentData)
      setNewComment('')
      mutate() // Refresh comments list
      toast.success('Comment added successfully')
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('Failed to add comment')
    }
  }

  const handleEditComment = async (commentId: number, text: string) => {
    setEditingCommentId(commentId)
    setEditingText(text)
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editingText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    try {
      await updateComment(commentId, { Comment: editingText.trim() })
      setEditingCommentId(null)
      setEditingText('')
      mutate() // Refresh comments list
      toast.success('Comment updated successfully')
    } catch (error) {
      console.error('Error updating comment:', error)
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId)
      mutate() // Refresh comments list
      toast.success('Comment deleted successfully')
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast.error('Failed to delete comment')
    }
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">Error loading comments</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Comments</h2>
      
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label htmlFor="comment" className="sr-only">Add a comment</label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={200}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Post comment
          </button>
        </form>
      )}

      <div className="space-y-6">
        {comments?.map((comment: CommentDto) => (
          <CommentCard
            key={comment.Id}
            comment={{
              Id: comment.Id!,
              Comment: comment.Comment,
              UserId: comment.UserId,
              PostDate: comment.PostDate,
              EditDate: comment.EditDate,
              IsEdited: comment.IsEdited,
              IsPinned: comment.IsPinned
            }}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
          />
        ))}
        {!comments?.length && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
} 