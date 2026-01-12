export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token')

  const api = async <T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    }

    const response = await fetch(`${config.public.apiBase}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }))
      throw new Error(error.message || `Erreur ${response.status}`)
    }

    return response.json()
  }

  return {
    get: <T>(endpoint: string) => api<T>(endpoint, { method: 'GET' }),
    post: <T>(endpoint: string, body: unknown) =>
      api<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    patch: <T>(endpoint: string, body: unknown) =>
      api<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => api<T>(endpoint, { method: 'DELETE' })
  }
}
