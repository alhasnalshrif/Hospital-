import { LoadingProps } from '../../types'
import { cn } from '../../utils/cn'

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner', 
  className 
}: LoadingProps) {
  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1 justify-center items-center', className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-primary-600 loading-dots',
              {
                'h-2 w-2': size === 'sm',
                'h-3 w-3': size === 'md',
                'h-4 w-4': size === 'lg',
              }
            )}
          />
        ))}
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn('animate-pulse space-y-3', className)}>
        <div className="skeleton-title"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text w-2/3"></div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-neutral-200 border-t-primary-600',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className
      )}
    />
  )
}