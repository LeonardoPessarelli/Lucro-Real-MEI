export async function createAsaasCustomer(email: string, name: string): Promise<string> {
  return 'cus_fake_' + Math.random().toString(36).slice(2, 10)
}

export async function getPaymentLink(customerId: string, plan: 'monthly' | 'annual'): Promise<string> {
  return `https://sandbox.asaas.com/c/fake-checkout-${plan}-${customerId}`
}
