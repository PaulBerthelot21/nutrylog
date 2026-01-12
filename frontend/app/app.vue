<script setup lang="ts">
const { user, isAuthenticated, logout, fetchUser } = useAuth()
const route = useRoute()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'NutryLog'
const description = 'Suivez vos repas, calories et macros facilement'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
})

// Fetch user on mount if token exists
onMounted(() => {
  fetchUser()
})

const navigation = [
  { label: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard' },
  { label: 'Repas', to: '/meals', icon: 'i-lucide-utensils' },
  { label: 'Aliments', to: '/foods', icon: 'i-lucide-apple' }
]

const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))
</script>

<template>
  <UApp>
    <!-- Header pour pages authentifiées -->
    <UHeader v-if="!isAuthPage">
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-salad" class="w-7 h-7 text-primary" />
          <span class="font-bold text-xl tracking-tight">NutryLog</span>
        </NuxtLink>

        <UNavigationMenu
          v-if="isAuthenticated"
          :items="navigation"
          class="ml-8 hidden md:flex"
        />
      </template>

      <template #right>
        <template v-if="isAuthenticated">
          <UDropdownMenu
            :items="[[
              { label: 'Mon profil', icon: 'i-lucide-user', to: '/profile' },
              { label: 'Paramètres', icon: 'i-lucide-settings', to: '/settings' }
            ], [
              { label: 'Déconnexion', icon: 'i-lucide-log-out', click: logout }
            ]]"
          >
            <UButton color="neutral" variant="ghost" class="gap-2">
              <UAvatar
                :alt="user?.firstName"
                size="xs"
                class="bg-primary/10"
              />
              <span class="hidden sm:inline">{{ user?.firstName }}</span>
              <UIcon name="i-lucide-chevron-down" class="w-4 h-4" />
            </UButton>
          </UDropdownMenu>
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost">Connexion</UButton>
          <UButton to="/register" color="primary">Inscription</UButton>
        </template>

        <UColorModeButton class="ml-2" />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter v-if="!isAuthPage" class="border-t border-default">
      <template #left>
        <p class="text-sm text-muted">
          NutryLog © {{ new Date().getFullYear() }} — Suivez votre alimentation
        </p>
      </template>

      <template #right>
        <UColorModeButton />
      </template>
    </UFooter>
  </UApp>
</template>
