import React, { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useReactionCounts, useUserReaction, addReaction, removeReaction } from '../lib/api'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface ReactionPickerProps {
  eventId: number
  className?: string
  showAllReactions?: boolean
}

const EMOJIS = ['👍', '👎', '❤️', '🎉', '😄', '😂', '😮', '😢', '😡', '👏', '🙌', '🔥', '😊']

export default function ReactionPicker({ eventId, className = '', showAllReactions = false }: ReactionPickerProps) {
  const { isAuthenticated } = useAuth()
  const { data: reactionCounts, mutate: mutateCounts, isLoading: isLoadingCounts } = useReactionCounts(eventId)
  const { data: userReaction, mutate: mutateUserReaction, isLoading: isLoadingUserReaction } = useUserReaction(eventId)
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showAll, setShowAll] = useState(showAllReactions)

  // Initialize selectedEmoji when userReaction data is loaded
  useEffect(() => {
    if (!isAuthenticated) {
      setSelectedEmoji(null)
    } else if (userReaction) {
      setSelectedEmoji(userReaction.Emoji)
    } else if (userReaction === null) {
      setSelectedEmoji(null)
    }
  }, [userReaction, isAuthenticated])

  const handleReactionClick = async (emoji: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to react to events')
      return
    }

    setIsLoading(true)
    try {
      if (selectedEmoji === emoji) {
        // Remove reaction
        await removeReaction(eventId)
        setSelectedEmoji(null)
        toast.success('Reaction removed')
      } else {
        // Add/change reaction
        await addReaction(eventId, emoji)
        setSelectedEmoji(emoji)
        toast.success('Reaction added')
      }
      // Refresh reaction counts and user reaction
      mutateCounts()
      mutateUserReaction()
    } catch (error) {
      console.error('Failed to handle reaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getReactionCount = (emoji: string) => {
    if (!reactionCounts) return 0
    const reaction = reactionCounts.find(r => r.Emoji === emoji)
    return reaction?.Count || 0
  }

  // Filter reactions based on showAll state
  const visibleEmojis = showAll 
    ? EMOJIS 
    : EMOJIS.filter(emoji => getReactionCount(emoji) > 0)

  // Check if there are any reactions with count > 0
  const hasReactions = EMOJIS.some(emoji => getReactionCount(emoji) > 0)
  
  // Check if there are hidden reactions (count = 0)
  const hasHiddenReactions = EMOJIS.some(emoji => getReactionCount(emoji) === 0)
  
  // Always show the button if there are hidden reactions, or if there are no reactions at all
  // This ensures users can always access all emoji options
  const shouldShowToggleButton = hasHiddenReactions || !hasReactions

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {visibleEmojis.map((emoji) => {
        const count = getReactionCount(emoji)
        const isSelected = selectedEmoji === emoji
        
        return (
          <button
            key={emoji}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleReactionClick(emoji)
            }}
            disabled={isLoading || isLoadingCounts || isLoadingUserReaction}
            className={`
              flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-2 border-blue-300 dark:border-blue-600' 
                : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500 border-2 border-transparent'
              }
              ${(isLoading || isLoadingCounts || isLoadingUserReaction) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <span className="text-lg">{emoji}</span>
            {count > 0 && (
              <span className="text-xs bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-full text-gray-700 dark:text-gray-200">
                {count}
              </span>
            )}
          </button>
        )
      })}
      
      {/* Show/Hide all reactions button */}
      {shouldShowToggleButton && (
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowAll(!showAll)
          }}
          className="flex items-center gap-1 px-2 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          title={showAll ? 'Show only reactions with votes' : 'Show all reaction options'}
        >
          {showAll ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  )
} 