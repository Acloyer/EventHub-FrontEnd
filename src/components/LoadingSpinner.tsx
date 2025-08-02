import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'blue' | 'gray' | 'white'
  className?: string
  fullScreen?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
}

const colorClasses = {
  blue: 'border-blue-500',
  gray: 'border-gray-300',
  white: 'border-white'
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = '',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const spinner = (
    <div 
      className={clsx(
        'flex justify-center items-center',
        sizeClasses[size],
        colorClasses[color],
        'rounded-full border-t-2 border-b-2 animate-spin',
        className
      )}
    />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 z-50">
        {spinner}
      </div>
    )
  }

  return spinner
} 