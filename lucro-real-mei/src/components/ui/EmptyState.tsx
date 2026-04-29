import type { ReactNode } from 'react'

interface Props {
  icon: ReactNode
  title: string
  description: string
}

export default function EmptyState({ icon, title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <p className="text-white font-semibold mb-1">{title}</p>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  )
}
