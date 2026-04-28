'use client'
import { useTransition } from 'react'

interface Plan {
  id: 'monthly' | 'annual'
  label: string
  price: string
  badge: string | null
}

interface Props {
  plans: Plan[]
  handleAssinar: (plan: 'monthly' | 'annual') => Promise<void>
}

export default function AssinaturaButtons({ plans, handleAssinar }: Props) {
  const [isPending, startTransition] = useTransition()

  function assinar(plan: 'monthly' | 'annual') {
    startTransition(() => handleAssinar(plan))
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <button
          key={plan.id}
          onClick={() => assinar(plan.id)}
          disabled={isPending}
          className="w-full bg-card2 border-2 border-card2 hover:border-verde rounded-2xl p-5 text-left transition-colors disabled:opacity-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-white">{plan.label}</p>
              <p className="text-verde font-black text-xl mt-1">
                {isPending ? 'Aguarde...' : plan.price}
              </p>
            </div>
            {plan.badge && (
              <span className="bg-verde/10 text-verde text-xs font-bold px-2 py-1 rounded-full">
                {plan.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
