import Link from 'next/link'

/* ─── dados estáticos ──────────────────────────────────────────────────── */

const metricas = [
  { valor: '+47%', label: 'Taxa de conversão' },
  { valor: '3.2×', label: 'Leads qualificados' },
  { valor: '−62%', label: 'Ciclo de venda' },
  { valor: '1.200+', label: 'MEIs ativos' },
]

const features = [
  {
    icon: '🪣',
    titulo: 'Divisão automática em potes',
    desc: 'Cada entrada é dividida na hora entre Custos, Reserva e Salário conforme suas regras.',
  },
  {
    icon: '📊',
    titulo: 'Dashboard de lucro real',
    desc: 'Veja de verdade quanto é seu a cada mês — não faturamento, mas lucro pessoal líquido.',
  },
  {
    icon: '🎯',
    titulo: 'Pipeline de negócios',
    desc: 'Acompanhe seus leads do primeiro contato até o fechamento em um kanban visual.',
  },
  {
    icon: '⚡',
    titulo: 'Lançamentos em segundos',
    desc: 'Registre entradas e saídas com categorias pré-definidas. Sem planilha, sem complicação.',
  },
  {
    icon: '🚨',
    titulo: 'Alertas de reserva',
    desc: 'Notificação imediata quando seus gastos ultrapassam o pote e consomem a reserva.',
  },
  {
    icon: '📈',
    titulo: 'Histórico e tendências',
    desc: 'Compare meses anteriores e entenda se seu negócio está evoluindo financeiramente.',
  },
]

const planos = [
  {
    nome: 'Mensal',
    preco: 'R$ 49,97',
    periodo: '/mês',
    destaque: false,
    badge: '7 dias grátis',
    features: [
      '1 membro',
      '50 leads no pipeline',
      'Dashboard de potes',
      'Lançamentos ilimitados',
    ],
    cta: 'Começar grátis',
    href: '/login',
  },
  {
    nome: 'Pro',
    preco: 'R$ 499,97',
    periodo: '/ano',
    destaque: true,
    badge: 'Melhor custo-benefício',
    features: [
      '1 membro',
      'Leads ilimitados',
      'Dashboard completo',
      'Pipeline + relatórios',
      'Alertas automáticos',
      'Histórico de 12 meses',
    ],
    cta: 'Assinar anual',
    href: '/login',
  },
]

/* ─── componentes de seção ─────────────────────────────────────────────── */

function LandingNav() {
  return (
    <header className="landing-nav">
      <div className="landing-nav-inner">
        <Link href="/" className="landing-logo">
          Lucro<span>Real</span>
        </Link>

        <nav className="landing-links" aria-label="Navegação principal">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#precos">Preços</a>
          <Link href="/login">Login</Link>
        </nav>

        <Link href="/login" className="landing-cta-btn">
          Começar grátis
        </Link>
      </div>
    </header>
  )
}

function HeroSection() {
  return (
    <section className="landing-hero">
      {/* orbe de fundo */}
      <div className="hero-orb hero-orb-1" aria-hidden="true" />
      <div className="hero-orb hero-orb-2" aria-hidden="true" />

      <div className="landing-container hero-content">
        <p className="hero-eyebrow">// GESTÃO FINANCEIRA PARA MEIs</p>

        <h1 className="hero-headline">
          Faturamento em{' '}
          <span className="hero-accent">potes reais.</span>
          <br />
          Sem planilha.{' '}
          <span className="hero-accent">Sem chute.</span>
        </h1>

        <p className="hero-sub">
          Saiba quanto é realmente seu a cada serviço prestado.
          {' '}Divisão automática em Custos, Reserva e Salário — em segundos.
        </p>

        <div className="hero-actions">
          <Link href="/login" className="btn-primary">
            Criar conta grátis
          </Link>
          <a href="#funcionalidades" className="btn-ghost">
            Ver como funciona
          </a>
        </div>
      </div>
    </section>
  )
}

function MetricasSection() {
  return (
    <section className="landing-metricas">
      <div className="landing-container metricas-grid">
        {metricas.map((m) => (
          <div key={m.label} className="metrica-card">
            <span className="metrica-valor">{m.valor}</span>
            <span className="metrica-label">{m.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section id="funcionalidades" className="landing-section">
      <div className="landing-container">
        <div className="section-header">
          <p className="section-eyebrow">// FUNCIONALIDADES</p>
          <h2 className="section-title">
            Tudo que um MEI precisa,<br />
            <span className="hero-accent">nada que atrapalha.</span>
          </h2>
          <p className="section-sub">
            Construído para quem trabalha sozinho e precisa controlar dinheiro sem se tornar contador.
          </p>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.titulo} className="feature-card">
              <span className="feature-icon" aria-hidden="true">{f.icon}</span>
              <h3 className="feature-title">{f.titulo}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PrecosSection() {
  return (
    <section id="precos" className="landing-section">
      <div className="landing-container">
        <div className="section-header">
          <p className="section-eyebrow">// PREÇOS</p>
          <h2 className="section-title">
            Simples como deve ser.
          </h2>
          <p className="section-sub">
            Comece grátis, sem cartão de crédito. Assine quando quiser mais.
          </p>
        </div>

        <div className="precos-grid">
          {planos.map((p) => (
            <div
              key={p.nome}
              className={p.destaque ? 'plano-card plano-card--destaque' : 'plano-card'}
            >
              {p.destaque && (
                <div className="plano-badge">{p.badge}</div>
              )}

              <p className="plano-nome">{p.nome}</p>

              <div className="plano-preco-row">
                <span className="plano-preco">{p.preco}</span>
                <span className="plano-periodo">{p.periodo}</span>
              </div>

              <ul className="plano-features">
                {p.features.map((feat) => (
                  <li key={feat} className="plano-feature-item">
                    <span className="plano-check" aria-hidden="true">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={p.href}
                className={p.destaque ? 'btn-primary plano-btn' : 'btn-ghost plano-btn'}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaFinalSection() {
  return (
    <section className="landing-cta-final">
      <div className="hero-orb hero-orb-3" aria-hidden="true" />
      <div className="landing-container cta-final-inner">
        <p className="section-eyebrow">// COMECE AGORA</p>
        <h2 className="cta-final-title">
          Descubra quanto você{' '}
          <span className="hero-accent">realmente ganha.</span>
        </h2>
        <p className="section-sub">
          7 dias grátis. Sem cartão. Cancel quando quiser.
        </p>
        <Link href="/login" className="btn-primary btn-primary--lg">
          Criar conta grátis agora
        </Link>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-container footer-inner">
        <Link href="/" className="landing-logo landing-logo--sm">
          Lucro<span>Real</span>
        </Link>
        <p className="footer-copy">© {new Date().getFullYear()} Lucro Real MEI. Todos os direitos reservados.</p>
        <div className="footer-links">
          <Link href="/login">Entrar</Link>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#precos">Preços</a>
        </div>
      </div>
    </footer>
  )
}

/* ─── página ───────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <HeroSection />
      <MetricasSection />
      <FeaturesSection />
      <PrecosSection />
      <CtaFinalSection />
      <Footer />
    </>
  )
}
