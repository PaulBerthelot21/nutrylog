import type { User, AuthResponse } from '~/types'
import { useApi } from '~/composables/useApi'

export const useAuth = () => {
  const api = useApi()
  const token = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
  const user = useState<User | null>('user', () => null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password })
    token.value = response.accessToken
    user.value = response.user
    return response
  }

  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    targetCalories?: number
    targetProteins?: number
    targetCarbs?: number
    targetFats?: number
  }) => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    token.value = response.accessToken
    user.value = response.user
    return response
  }

  const logout = () => {
    token.value = null
    user.value = null
    navigateTo('/login')
  }

  const fetchUser = async () => {
    if (!token.value) return null
    try {
      const userData = await api.get<User>('/users/me')
      user.value = userData
      return userData
    } catch {
      logout()
      return null
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  }
}
