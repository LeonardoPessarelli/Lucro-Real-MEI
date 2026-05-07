'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { saveOnboardingAction } from '@/lib/actions/profile'
import { Spinner } from '@/components/ui/Spinner'

const schema = z.object({
  workspaceName: z
    .string()
    .min(2, 'O nome precisa ter pelo menos 2 caracteres')
    .max(50, 'Máximo de 50 caracteres')
    .trim(),
})

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const router = useRouter()
  const [erroGlobal, setErroGlobal] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setErroGlobal('')
    const result = await saveOnboardingAction(data.workspaceName)
    if (result.error) {
      setErroGlobal(result.error)
      return
    }
    router.replace('/')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-10">
        <div className="text-4xl mb-4">👋</div>
        <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Lucro Real!</h1>
        <p className="text-gray-400 text-sm leading-relaxed">
          Como você quer chamar o seu negócio aqui dentro?
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="workspaceName" className="block text-sm text-gray-400 mb-2">
            Nome do negócio ou workspace
          </label>
          <input
            id="workspaceName"
            type="text"
            placeholder="Ex: Meu MEI, Barbearia do João..."
            autoComplete="organization"
            autoFocus
            {...register('workspaceName')}
            className="w-full bg-card2 border border-[#333] text-white placeholder:text-gray-600 py-4 px-4 rounded-2xl text-sm outline-none focus:border-verde transition-colors aria-[invalid=true]:border-vermelho"
            aria-invalid={!!errors.workspaceName}
          />
          {errors.workspaceName && (
            <p className="text-vermelho text-xs mt-1 px-1">{errors.workspaceName.message}</p>
          )}
        </div>

        {erroGlobal && (
          <p className="text-vermelho text-xs text-center">{erroGlobal}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-verde text-black py-4 rounded-2xl font-bold text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting && <Spinner className="text-black" />}
          {isSubmitting ? 'Salvando...' : 'Começar agora'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-xs mt-8">
        Você pode mudar isso depois nas configurações.
      </p>
    </div>
  )
}
