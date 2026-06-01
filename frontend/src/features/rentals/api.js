// API helpers for starting and ending rentals.
import { axiosClient } from '../../config/axiosClient'

export async function startRental(request) {
  const { data } = await axiosClient.post('/api/rentals/start', request)
  return data
}

export async function endRental(id) {
  const { data } = await axiosClient.put(`/api/rentals/${id}/end`)
  return data
}

export async function getActiveRental(userId) {
  const { data, status } = await axiosClient.get('/api/rentals/active', { params: { userId } })
  // backend returns 204 when none exists
  if (status === 204) return null
  return data
}
