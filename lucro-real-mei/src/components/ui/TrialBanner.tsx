import Link from 'next/link'

export default function TrialBanner({ diasRestantes }: { diasRestantes: number }) {
  if (diasRestantes > 3) return null
  return (
    <div className="bg-ambar/10 border-b border-ambar/20 px-4 py-2 flex items-center justify-between">
      <p className="text-ambar text-xs font-medium">
        {diasRestantes === 0
          ? 'Seu período grátis termina hoje'
          : `${diasRestantes} dia${diasRestantes > 1 ? 's' : ''} restante${diasRestantes > 1 ? 's' : ''} no período grátis`}
      </p>
      <Link href="/assinatura" className="text-xs font-bold text-ambar underline">Assinar</Link>
    </div>
  )
}
