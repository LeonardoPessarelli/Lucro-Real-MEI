interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div className={`h-4 bg-card2 rounded-md animate-pulse ${className}`} />
  )
}

export default function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={i === 0 ? 'w-3/4' : i % 2 === 0 ? 'w-full' : 'w-5/6'} />
      ))}
    </div>
  )
}
