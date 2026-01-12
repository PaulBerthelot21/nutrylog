<script setup lang="ts">
const { login, isAuthenticated } = useAuth()
const toast = useToast()

const form = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  error.value = ''
  loading.value = true

  try {
    await login(form.email, form.password)
    toast.add({ title: 'Connexion réussie', icon: 'i-lucide-check-circle', color: 'success' })
    navigateTo('/')
  } catch (e: any) {
    error.value = e.message || 'Email ou mot de passe incorrect'
  } finally {
    loading.value = false
  }
}

// Redirect if already authenticated
watch(isAuthenticated, (val) => {
  if (val) navigateTo('/')
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-salad" class="w-8 h-8 text-primary" />
            <span class="font-bold text-2xl">NutryLog</span>
          </NuxtLink>
          <h1 class="text-xl font-semibold">Connexion</h1>
          <p class="text-sm text-muted mt-1">Accédez à votre espace personnel</p>
        </div>
      </template>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <UAlert
          v-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          :title="error"
          variant="subtle"
        />

        <UFormField label="Email" name="email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            icon="i-lucide-mail"
            size="lg"
            class="w-full"
            required
          />
        </UFormField>

        <UFormField label="Mot de passe" name="password">
          <UInput
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            icon="i-lucide-lock"
            size="lg"
            class="w-full"
            required
          />
        </UFormField>

        <UButton
          type="submit"
          block
          size="lg"
          :loading="loading"
          icon="i-lucide-log-in"
        >
          Se connecter
        </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Pas encore de compte ?
          <NuxtLink to="/register" class="text-primary hover:underline font-medium">
            Créer un compte
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
