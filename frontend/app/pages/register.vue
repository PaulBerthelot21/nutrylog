<script setup lang="ts">
const { register, isAuthenticated } = useAuth()
const toast = useToast()

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  targetCalories: 2000,
  targetProteins: 150,
  targetCarbs: 200,
  targetFats: 70
})

const loading = ref(false)
const error = ref('')
const step = ref(1)

const handleSubmit = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Les mots de passe ne correspondent pas'
    return
  }

  error.value = ''
  loading.value = true

  try {
    await register({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      targetCalories: form.targetCalories,
      targetProteins: form.targetProteins,
      targetCarbs: form.targetCarbs,
      targetFats: form.targetFats
    })
    toast.add({ title: 'Compte créé avec succès !', icon: 'i-lucide-check-circle', color: 'success' })
    navigateTo('/')
  } catch (e: any) {
    error.value = e.message || 'Erreur lors de la création du compte'
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
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <NuxtLink to="/" class="inline-flex items-center gap-2 mb-4">
            <UIcon name="i-lucide-salad" class="w-8 h-8 text-primary" />
            <span class="font-bold text-2xl">NutryLog</span>
          </NuxtLink>
          <h1 class="text-xl font-semibold">Créer un compte</h1>
          <p class="text-sm text-muted mt-1">
            {{ step === 1 ? 'Informations personnelles' : 'Objectifs nutritionnels' }}
          </p>
        </div>

        <!-- Steps indicator -->
        <div class="flex items-center justify-center gap-2 mt-4">
          <div
            :class="[
              'w-8 h-1 rounded-full transition-colors',
              step >= 1 ? 'bg-primary' : 'bg-muted'
            ]"
          />
          <div
            :class="[
              'w-8 h-1 rounded-full transition-colors',
              step >= 2 ? 'bg-primary' : 'bg-muted'
            ]"
          />
        </div>
      </template>

      <form @submit.prevent="step === 2 ? handleSubmit() : step++" class="space-y-4">
        <UAlert
          v-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          :title="error"
          variant="subtle"
        />

        <!-- Step 1: Personal info -->
        <template v-if="step === 1">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Prénom" name="firstName">
              <UInput
                v-model="form.firstName"
                placeholder="Jean"
                icon="i-lucide-user"
                class="w-full"
                required
              />
            </UFormField>
            <UFormField label="Nom" name="lastName">
              <UInput
                v-model="form.lastName"
                placeholder="Dupont"
                class="w-full"
                required
              />
            </UFormField>
          </div>

          <UFormField label="Email" name="email">
            <UInput
              v-model="form.email"
              type="email"
              placeholder="vous@exemple.com"
              icon="i-lucide-mail"
              class="w-full"
              required
            />
          </UFormField>

          <UFormField label="Mot de passe" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="Minimum 8 caractères"
              icon="i-lucide-lock"
              class="w-full"
              required
              minlength="8"
            />
          </UFormField>

          <UFormField label="Confirmer le mot de passe" name="confirmPassword">
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              class="w-full"
              required
            />
          </UFormField>
        </template>

        <!-- Step 2: Nutritional goals -->
        <template v-if="step === 2">
          <UAlert
            color="info"
            icon="i-lucide-info"
            title="Objectifs quotidiens"
            description="Définissez vos objectifs nutritionnels. Vous pourrez les modifier plus tard."
            variant="subtle"
          />

          <UFormField label="Calories (kcal)" name="targetCalories">
            <UInput
              v-model.number="form.targetCalories"
              type="number"
              icon="i-lucide-flame"
              class="w-full"
              min="0"
            />
          </UFormField>

          <div class="grid grid-cols-3 gap-4">
            <UFormField label="Protéines (g)" name="targetProteins">
              <UInput
                v-model.number="form.targetProteins"
                type="number"
                class="w-full"
                min="0"
              />
            </UFormField>
            <UFormField label="Glucides (g)" name="targetCarbs">
              <UInput
                v-model.number="form.targetCarbs"
                type="number"
                class="w-full"
                min="0"
              />
            </UFormField>
            <UFormField label="Lipides (g)" name="targetFats">
              <UInput
                v-model.number="form.targetFats"
                type="number"
                class="w-full"
                min="0"
              />
            </UFormField>
          </div>
        </template>

        <div class="flex gap-3">
          <UButton
            v-if="step === 2"
            type="button"
            variant="outline"
            block
            @click="step--"
            icon="i-lucide-arrow-left"
          >
            Retour
          </UButton>
          <UButton
            type="submit"
            block
            :loading="loading"
            :icon="step === 1 ? 'i-lucide-arrow-right' : 'i-lucide-user-plus'"
          >
            {{ step === 1 ? 'Continuer' : 'Créer mon compte' }}
          </UButton>
        </div>
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Déjà un compte ?
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">
            Se connecter
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
