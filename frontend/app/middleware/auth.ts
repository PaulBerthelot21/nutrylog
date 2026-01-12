import { useAuth } from '~/composables/useAuth'
export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated } = useAuth()

  // Pages publiques qui ne nécessitent pas d'auth
  const publicPages = ['/login', '/register']

  if (!isAuthenticated.value && !publicPages.includes(to.path)) {
    return navigateTo('/login')
  }
})
