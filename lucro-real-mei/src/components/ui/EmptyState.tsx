import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && (
        <div className="w-12 h-12 rounded-full bg-card2 flex items-center justify-center text-muted mb-4">
          {icon}
        </div>
      )}
      <p className="font-semibold text-white">{title}</p>
      {description && <p className="text-muted text-sm mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
