export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className={className ?? 'flex items-center gap-1 text-gray-500 hover:text-gray-300 text-xs transition-colors'}
      >
        <span>🚪</span> Sair
      </button>
    </form>
  )
}
