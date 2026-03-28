import { supabase } from './supabase'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

export type SubscriptionStatus = {
  status: string
  plan: {
    id: string
    name: string
    interval: string
    amount: number
    currency: string
  }
  subscription: {
    id: string
    customer_code: string
    status: string
    next_payment_date: string
    createdAt: string
  }
}

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatus> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) throw new Error('Not authenticated')

  const res = await fetch(`${API_URL}/api/subscription-status`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  })

  if (!res.ok) throw new Error(`Request failed: ${res.status}`)

  return res.json() as Promise<SubscriptionStatus>
}
