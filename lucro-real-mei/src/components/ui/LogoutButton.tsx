export default function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/api/auth/logout" method="POST">
      <button
        type="submit"
        className={className ?? 'text-gray-500 text-xs hover:text-vermelho transition-colors'}
      >
        Sair
      </button>
    </form>
  )
}
