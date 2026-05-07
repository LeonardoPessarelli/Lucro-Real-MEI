export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className={className ?? 'flex items-center gap-2 text-gray-400 hover:text-gray-200 text-sm font-medium transition-colors'}
      >
        <span>🚪</span> Sair
      </button>
    </form>
  )
}
