<script setup lang="ts">
import { useApi } from '~/composables/useApi'
import { useAuth } from '~/composables/useAuth'

const api = useApi()
const { user, fetchUser } = useAuth()
const toast = useToast()

const form = reactive({
  firstName: '',
  lastName: '',
  targetCalories: 2000,
  targetProteins: 150,
  targetCarbs: 200,
  targetFats: 70
})

const loading = ref(false)

// Charger les données utilisateur
watchEffect(() => {
  if (user.value) {
    form.firstName = user.value.firstName || ''
    form.lastName = user.value.lastName || ''
    form.targetCalories = Number(user.value.targetCalories) || 2000
    form.targetProteins = Number(user.value.targetProteins) || 150
    form.targetCarbs = Number(user.value.targetCarbs) || 200
    form.targetFats = Number(user.value.targetFats) || 70
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.patch('/users/me', {
      firstName: form.firstName,
      lastName: form.lastName,
      targetCalories: form.targetCalories,
      targetProteins: form.targetProteins,
      targetCarbs: form.targetCarbs,
      targetFats: form.targetFats
    })
    await fetchUser()
    toast.add({
      title: 'Profil mis à jour !',
      icon: 'i-lucide-check-circle',
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: e.message || 'Erreur lors de la mise à jour',
      icon: 'i-lucide-x-circle',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Calcul des macros en pourcentage
const macroPercentages = computed(() => {
  const proteinCals = form.targetProteins * 4
  const carbsCals = form.targetCarbs * 4
  const fatsCals = form.targetFats * 9
  const totalMacroCals = proteinCals + carbsCals + fatsCals

  return {
    proteins: totalMacroCals > 0 ? Math.round((proteinCals / totalMacroCals) * 100) : 0,
    carbs: totalMacroCals > 0 ? Math.round((carbsCals / totalMacroCals) * 100) : 0,
    fats: totalMacroCals > 0 ? Math.round((fatsCals / totalMacroCals) * 100) : 0
  }
})

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Mon profil</h1>
      <p class="text-muted">Gérez vos informations et objectifs nutritionnels</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Informations personnelles -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-primary" />
            <h3 class="font-semibold">Informations personnelles</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex items-center gap-4 mb-6">
            <UAvatar
              :alt="form.firstName"
              size="xl"
              class="bg-primary/10 text-primary"
            />
            <div>
              <p class="font-semibold text-lg">{{ form.firstName }} {{ form.lastName }}</p>
              <p class="text-sm text-muted">{{ user?.email }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Prénom" name="firstName">
              <UInput
                v-model="form.firstName"
                placeholder="Jean"
                icon="i-lucide-user"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Nom" name="lastName">
              <UInput
                v-model="form.lastName"
                placeholder="Dupont"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>
      </UCard>

      <!-- Objectifs nutritionnels -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-target" class="w-5 h-5 text-primary" />
            <h3 class="font-semibold">Objectifs quotidiens</h3>
          </div>
        </template>

        <div class="space-y-6">
          <!-- Calories -->
          <UFormField label="Calories cibles" name="targetCalories">
            <div class="flex items-center gap-4">
              <UInput
                v-model.number="form.targetCalories"
                type="number"
                min="0"
                step="50"
                icon="i-lucide-flame"
                class="w-full"
              />
              <span class="text-muted whitespace-nowrap">kcal / jour</span>
            </div>
          </UFormField>

          <!-- Macros -->
          <div>
            <label class="text-sm font-medium mb-3 block">Répartition des macronutriments</label>
            
            <div class="grid grid-cols-3 gap-4 mb-4">
              <UFormField label="Protéines (g)" name="targetProteins">
                <UInput
                  v-model.number="form.targetProteins"
                  type="number"
                  min="0"
                  class="w-full"
                />
                <template #hint>
                  <span class="text-rose-500">{{ macroPercentages.proteins }}%</span>
                </template>
              </UFormField>
              
              <UFormField label="Glucides (g)" name="targetCarbs">
                <UInput
                  v-model.number="form.targetCarbs"
                  type="number"
                  min="0"
                  class="w-full"
                />
                <template #hint>
                  <span class="text-amber-500">{{ macroPercentages.carbs }}%</span>
                </template>
              </UFormField>
              
              <UFormField label="Lipides (g)" name="targetFats">
                <UInput
                  v-model.number="form.targetFats"
                  type="number"
                  min="0"
                  class="w-full"
                />
                <template #hint>
                  <span class="text-sky-500">{{ macroPercentages.fats }}%</span>
                </template>
              </UFormField>
            </div>

            <!-- Visualisation des macros -->
            <div class="h-3 rounded-full overflow-hidden flex bg-muted/20">
              <div
                class="bg-rose-500 transition-all"
                :style="{ width: `${macroPercentages.proteins}%` }"
              />
              <div
                class="bg-amber-500 transition-all"
                :style="{ width: `${macroPercentages.carbs}%` }"
              />
              <div
                class="bg-sky-500 transition-all"
                :style="{ width: `${macroPercentages.fats}%` }"
              />
            </div>
            <div class="flex justify-between text-xs text-muted mt-2">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-rose-500" />
                Protéines
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-amber-500" />
                Glucides
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-sky-500" />
                Lipides
              </span>
            </div>
          </div>

          <!-- Info calories from macros -->
          <UAlert
            color="info"
            icon="i-lucide-calculator"
            variant="subtle"
          >
            <template #title>Calories calculées depuis les macros</template>
            <template #description>
              {{ form.targetProteins * 4 + form.targetCarbs * 4 + form.targetFats * 9 }} kcal
              (P: {{ form.targetProteins * 4 }} + G: {{ form.targetCarbs * 4 }} + L: {{ form.targetFats * 9 }})
            </template>
          </UAlert>
        </div>
      </UCard>

      <!-- Presets rapides -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-zap" class="w-5 h-5 text-primary" />
            <h3 class="font-semibold">Presets rapides</h3>
          </div>
        </template>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <UButton
            variant="outline"
            block
            @click="form.targetCalories = 1500; form.targetProteins = 120; form.targetCarbs = 150; form.targetFats = 50"
          >
            <div class="text-center">
              <p class="font-semibold">Perte</p>
              <p class="text-xs text-muted">1500 kcal</p>
            </div>
          </UButton>
          <UButton
            variant="outline"
            block
            @click="form.targetCalories = 2000; form.targetProteins = 150; form.targetCarbs = 200; form.targetFats = 70"
          >
            <div class="text-center">
              <p class="font-semibold">Maintien</p>
              <p class="text-xs text-muted">2000 kcal</p>
            </div>
          </UButton>
          <UButton
            variant="outline"
            block
            @click="form.targetCalories = 2500; form.targetProteins = 180; form.targetCarbs = 280; form.targetFats = 80"
          >
            <div class="text-center">
              <p class="font-semibold">Prise</p>
              <p class="text-xs text-muted">2500 kcal</p>
            </div>
          </UButton>
          <UButton
            variant="outline"
            block
            @click="form.targetCalories = 3000; form.targetProteins = 200; form.targetCarbs = 350; form.targetFats = 100"
          >
            <div class="text-center">
              <p class="font-semibold">Bulk</p>
              <p class="text-xs text-muted">3000 kcal</p>
            </div>
          </UButton>
        </div>
      </UCard>

      <!-- Submit -->
      <UButton
        type="submit"
        size="lg"
        block
        :loading="loading"
        icon="i-lucide-save"
      >
        Enregistrer les modifications
      </UButton>
    </form>
  </UContainer>
</template>
