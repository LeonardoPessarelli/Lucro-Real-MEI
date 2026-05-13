'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Lead } from '@/lib/leads'
import { updateLeadAction, deleteLeadAction } from '@/lib/actions/leads'
import NegocioModal from '@/components/leads/NegocioModal'

interface Props {
  lead: Lead
}

export default function LeadDetailClient({ lead }: Props) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [, startTransition] = useTransition()

  function handleSave(data: Omit<Lead, 'id' | 'workspace_id' | 'created_at'>) {
    startTransition(async () => {
      await updateLeadAction(lead.id, data)
      setEditando(false)
    })
  }

  function handleDelete(deletedId: string) {
    startTransition(async () => {
      await deleteLeadAction(deletedId)
      router.back()
    })
  }

  return (
    <>
      <div className="px-4 pt-8">
        <button
          onClick={() => setEditando(true)}
          className="w-full bg-card2 text-white py-4 rounded-2xl font-semibold text-sm border border-gray-700"
        >
          Editar lead
        </button>
      </div>

      {editando && (
        <NegocioModal
          mode="edit"
          lead={lead}
          onClose={() => setEditando(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
