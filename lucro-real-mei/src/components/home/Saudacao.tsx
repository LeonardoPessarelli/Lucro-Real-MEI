'use client'

export default function Saudacao({ nome }: { nome: string | null }) {
  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
  return (
    <h1 className="text-xl font-bold font-display">
      {saudacao}, {nome?.split(' ')[0] ?? 'MEI'} 👋
    </h1>
  )
}
