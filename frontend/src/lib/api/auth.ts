import { apiClient } from '@/config/axios-config'
import { API_ENDPOINTS } from '@/config/api-endpoints'
import { clearCachedToken, setCachedToken } from '@/lib/safe-storage'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  token: string
  user: User
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'operator'
  imageUrl: string | null
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>(
    API_ENDPOINTS.AUTH.LOGIN,
    payload,
  )

  if (!data?.token) {
    throw new Error('Login response did not contain token')
  }

  setCachedToken(data.token)
  return data
}

export async function fetchProfile(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>(
    API_ENDPOINTS.AUTH.PROFILE,
  )
  return data.user
}

export function logout() {
  clearCachedToken()
}

