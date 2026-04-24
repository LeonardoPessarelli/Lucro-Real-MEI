export interface Category {
  slug: string
  label: string
  icon: string
  tipo_gasto?: 'empresa' | 'pessoal'
}

export const CATEGORIAS_ENTRADA: Category[] = [
  { slug: 'servico', label: 'Serviço prestado', icon: '💼' },
  { slug: 'venda', label: 'Venda de produto', icon: '📦' },
  { slug: 'outro_entrada', label: 'Outros', icon: '💰' },
]

export const CATEGORIAS_EMPRESA: Category[] = [
  { slug: 'transporte', label: 'Transporte', icon: '⛽', tipo_gasto: 'empresa' },
  { slug: 'material', label: 'Material / Insumo', icon: '🧰', tipo_gasto: 'empresa' },
  { slug: 'equipamento', label: 'Equipamento', icon: '🔧', tipo_gasto: 'empresa' },
  { slug: 'comunicacao', label: 'Comunicação', icon: '📱', tipo_gasto: 'empresa' },
  { slug: 'aluguel', label: 'Aluguel / Espaço', icon: '🏠', tipo_gasto: 'empresa' },
  { slug: 'uniforme', label: 'Uniforme / EPI', icon: '👔', tipo_gasto: 'empresa' },
  { slug: 'divulgacao', label: 'Divulgação', icon: '📢', tipo_gasto: 'empresa' },
  { slug: 'outro_empresa', label: 'Outros', icon: '📦', tipo_gasto: 'empresa' },
]

export const CATEGORIAS_PESSOAL: Category[] = [
  { slug: 'mercado', label: 'Mercado', icon: '🛒', tipo_gasto: 'pessoal' },
  { slug: 'padaria', label: 'Padaria / Café', icon: '☕', tipo_gasto: 'pessoal' },
  { slug: 'cinema', label: 'Lazer / Cinema', icon: '🎬', tipo_gasto: 'pessoal' },
  { slug: 'saude', label: 'Saúde / Farmácia', icon: '💊', tipo_gasto: 'pessoal' },
  { slug: 'restaurante', label: 'Restaurante', icon: '🍽️', tipo_gasto: 'pessoal' },
  { slug: 'roupa', label: 'Roupa', icon: '👕', tipo_gasto: 'pessoal' },
  { slug: 'telefone', label: 'Telefone / Plano', icon: '📲', tipo_gasto: 'pessoal' },
  { slug: 'outro_pessoal', label: 'Outros', icon: '📦', tipo_gasto: 'pessoal' },
]

export function getCategoryBySlug(slug: string): Category | undefined {
  return [...CATEGORIAS_ENTRADA, ...CATEGORIAS_EMPRESA, ...CATEGORIAS_PESSOAL]
    .find(c => c.slug === slug)
}
