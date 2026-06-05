// API helpers for transaction history.
import { axiosClient } from '@/config/axiosClient'

export async function getMyTransactionHistory() {
  const { data } = await axiosClient.get('/api/transactions/history')
  return data
}
