import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Lucro Real MEI <no-reply@lucrorelmei.com.br>'

export async function sendWelcomeEmail(email: string, nome: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Bem-vindo ao Lucro Real MEI 🎉',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#16a34a">Olá, ${nome}!</h1>
        <p>Você tem <strong>7 dias grátis</strong> para descobrir quanto você realmente ganha.</p>
        <h3>Próximos passos:</h3>
        <ol>
          <li>Configure seus gráficos (quanto % vai para custos, reserva e pró-labore)</li>
          <li>Registre seu próximo serviço</li>
          <li>Veja seu lucro real na tela inicial</li>
        </ol>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Acessar o app
        </a>
      </div>
    `,
  })
}

export async function sendTrialExpiringEmail(email: string, nome: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Seu período grátis termina amanhã ⏰',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#f59e0b">Oi, ${nome}!</h1>
        <p>Seu período de 7 dias grátis termina <strong>amanhã</strong>.</p>
        <p>Para continuar usando o Lucro Real MEI, assine por apenas <strong>R$ 19,90/mês</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/assinatura" style="display:inline-block;background:#f59e0b;color:#000;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Assinar agora
        </a>
      </div>
    `,
  })
}

export async function sendSubscriptionConfirmedEmail(email: string, nome: string, plano: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Assinatura confirmada ✅',
    html: `
      <div style="font-family:system-ui;max-width:480px;margin:0 auto;color:#111">
        <h1 style="color:#16a34a">Assinatura ativa, ${nome}!</h1>
        <p>Seu plano <strong>${plano}</strong> está ativo. Continue registrando seus lançamentos e controlando seu lucro real.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#16a34a;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin-top:16px">
          Abrir o app
        </a>
      </div>
    `,
  })
}
