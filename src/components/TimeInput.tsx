import React, { useState, useEffect } from 'react'

interface TimeInputProps {
  value: { seconds: number; minutes: number; hours: number }
  onChange: (value: { seconds: number; minutes: number; hours: number }) => void
  className?: string
  disabled?: boolean
}

export default function TimeInput({ value, onChange, className = '', disabled = false }: TimeInputProps) {
  const [inputValue, setInputValue] = useState('')

  // Convert time object to string for display
  useEffect(() => {
    const parts = []
    if (value.hours > 0) parts.push(`${value.hours}h`)
    if (value.minutes > 0) parts.push(`${value.minutes}m`)
    if (value.seconds > 0) parts.push(`${value.seconds}s`)
    
    if (parts.length === 0) {
      setInputValue('')
    } else {
      setInputValue(parts.join(' '))
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setInputValue(input)

    // Parse input string (e.g., "1h 30m 45s" or "90m" or "3600s")
    const newValue = parseTimeString(input)
    onChange(newValue)
  }

  const parseTimeString = (input: string): { seconds: number; minutes: number; hours: number } => {
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return { seconds: 0, minutes: 0, hours: 0 }

    let seconds = 0
    let minutes = 0
    let hours = 0

    // Regular expressions for time search
    const hourMatch = trimmed.match(/(\d+)\s*h/)
    const minuteMatch = trimmed.match(/(\d+)\s*m/)
    const secondMatch = trimmed.match(/(\d+)\s*s/)

    if (hourMatch) hours = parseInt(hourMatch[1])
    if (minuteMatch) minutes = parseInt(minuteMatch[1])
    if (secondMatch) seconds = parseInt(secondMatch[1])

    // If only a number is entered without units, consider it as minutes
    const numberOnly = trimmed.match(/^(\d+)$/)
    if (numberOnly && !hourMatch && !minuteMatch && !secondMatch) {
      minutes = parseInt(numberOnly[1])
    }

    return { seconds, minutes, hours }
  }

  const handleQuickTime = (time: { seconds: number; minutes: number; hours: number }) => {
    onChange(time)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="1h 30m 45s"
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 30, minutes: 0, hours: 0 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          30s
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 1, hours: 0 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          1m
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 5, hours: 0 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          5m
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 15, hours: 0 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          15m
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 30, hours: 0 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          30m
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 0, hours: 1 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          1h
        </button>
        <button
          type="button"
          onClick={() => handleQuickTime({ seconds: 0, minutes: 0, hours: 24 })}
          disabled={disabled}
          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          24h
        </button>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Format: 1h 30m 45s or just a number (in minutes)
      </div>
    </div>
  )
} 