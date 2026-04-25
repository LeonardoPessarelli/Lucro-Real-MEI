const BASE = 'https://www.asaas.com/api/v3'
const headers = {
  'access_token': process.env.ASAAS_API_KEY!,
  'Content-Type': 'application/json',
}

export async function createAsaasCustomer(email: string, name: string) {
  const res = await fetch(`${BASE}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, email, notificationDisabled: false }),
  })
  const data = await res.json()
  return data.id as string
}

export async function getPaymentLink(customerId: string, plan: 'monthly' | 'annual') {
  const value = plan === 'monthly' ? 19.90 : 97.00
  const res = await fetch(`${BASE}/paymentLinks`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `Lucro Real MEI — ${plan === 'monthly' ? 'Mensal' : 'Anual'}`,
      value,
      billingType: 'CREDIT_CARD',
      subscriptionCycle: plan === 'monthly' ? 'MONTHLY' : 'YEARLY',
      customer: customerId,
    }),
  })
  const data = await res.json()
  return data.url as string
}
