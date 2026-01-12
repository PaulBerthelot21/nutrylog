<script setup lang="ts">
import type { DailySummary, MealType } from '~/types'
import { MealTypeLabels, MealTypeIcons } from '~/types'

const { isAuthenticated, user } = useAuth()
const api = useApi()

const today = new Date().toISOString().split('T')[0]
const selectedDate = ref(today)

const { data: summary, pending, refresh } = await useAsyncData<DailySummary>(
  `summary-${selectedDate.value}`,
  () => api.get<DailySummary>(`/meals/summary/${selectedDate.value}`),
  { watch: [selectedDate], default: () => ({ date: selectedDate.value, meals: [], totals: { calories: 0, proteins: 0, carbs: 0, fats: 0 } }) }
)

const targets = computed(() => ({
  calories: Number(user.value?.targetCalories) || 2000,
  proteins: Number(user.value?.targetProteins) || 150,
  carbs: Number(user.value?.targetCarbs) || 200,
  fats: Number(user.value?.targetFats) || 70
}))

const progress = computed(() => ({
  calories: Math.min(100, (summary.value!.totals.calories / targets.value.calories) * 100),
  proteins: Math.min(100, (summary.value!.totals.proteins / targets.value.proteins) * 100),
  carbs: Math.min(100, (summary.value!.totals.carbs / targets.value.carbs) * 100),
  fats: Math.min(100, (summary.value!.totals.fats / targets.value.fats) * 100)
}))

const macroCards = computed(() => [
  {
    label: 'Calories',
    value: Math.round(summary.value!.totals.calories),
    target: targets.value.calories,
    unit: 'kcal',
    color: 'emerald',
    icon: 'i-lucide-flame',
    progress: progress.value.calories
  },
  {
    label: 'Protéines',
    value: Math.round(summary.value!.totals.proteins),
    target: targets.value.proteins,
    unit: 'g',
    color: 'rose',
    icon: 'i-lucide-beef',
    progress: progress.value.proteins
  },
  {
    label: 'Glucides',
    value: Math.round(summary.value!.totals.carbs),
    target: targets.value.carbs,
    unit: 'g',
    color: 'amber',
    icon: 'i-lucide-wheat',
    progress: progress.value.carbs
  },
  {
    label: 'Lipides',
    value: Math.round(summary.value!.totals.fats),
    target: targets.value.fats,
    unit: 'g',
    color: 'sky',
    icon: 'i-lucide-droplet',
    progress: progress.value.fats
  }
])

const mealsByType = computed(() => {
  const types: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
  return types.map(type => ({
    type,
    label: MealTypeLabels[type],
    icon: MealTypeIcons[type],
    meals: summary.value!.meals.filter(m => m.type === type)
  }))
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const changeDate = (days: number) => {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + days)
  selectedDate.value = d.toISOString().split('T')[0]
}

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8">
    <!-- Hero section si non connecté -->
    <template v-if="!isAuthenticated">
      <div class="text-center py-20">
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
          <UIcon name="i-lucide-salad" class="w-10 h-10 text-primary" />
        </div>
        <h1 class="text-4xl font-bold mb-4">Bienvenue sur NutryLog</h1>
        <p class="text-lg text-muted mb-8 max-w-xl mx-auto">
          Suivez vos repas, calories et macros facilement. Atteignez vos objectifs nutritionnels.
        </p>
        <div class="flex gap-4 justify-center">
          <UButton to="/register" size="lg" icon="i-lucide-user-plus">
            Créer un compte
          </UButton>
          <UButton to="/login" size="lg" variant="outline" icon="i-lucide-log-in">
            Se connecter
          </UButton>
        </div>
      </div>
    </template>

    <!-- Dashboard si connecté -->
    <template v-else>
      <!-- Header avec navigation de date -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold">Bonjour, {{ user?.firstName }} 👋</h1>
          <p class="text-muted">Voici votre résumé nutritionnel</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-chevron-left"
            variant="ghost"
            size="sm"
            @click="changeDate(-1)"
          />
          <UButton variant="outline" class="min-w-48">
            <UIcon name="i-lucide-calendar" class="w-4 h-4 mr-2" />
            {{ formatDate(selectedDate) }}
          </UButton>
          <UButton
            icon="i-lucide-chevron-right"
            variant="ghost"
            size="sm"
            :disabled="selectedDate === today"
            @click="changeDate(1)"
          />
        </div>
      </div>

      <!-- Cartes des macros -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <UCard
          v-for="macro in macroCards"
          :key="macro.label"
          class="relative overflow-hidden"
        >
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-muted mb-1">{{ macro.label }}</p>
              <p class="text-2xl font-bold">
                {{ macro.value }}
                <span class="text-sm font-normal text-muted">/ {{ macro.target }} {{ macro.unit }}</span>
              </p>
            </div>
            <div :class="`p-2 rounded-lg bg-${macro.color}-500/10`">
              <UIcon :name="macro.icon" :class="`w-5 h-5 text-${macro.color}-500`" />
            </div>
          </div>
          <UProgress
            :model-value="macro.progress"
            :color="macro.color as any"
            size="sm"
            class="mt-3"
          />
        </UCard>
      </div>

      <!-- Liste des repas par type -->
      <div class="space-y-6">
        <div v-for="mealGroup in mealsByType" :key="mealGroup.type">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <UIcon :name="mealGroup.icon" class="w-5 h-5 text-muted" />
              <h3 class="font-semibold">{{ mealGroup.label }}</h3>
              <UBadge v-if="mealGroup.meals.length" variant="subtle" size="sm">
                {{ mealGroup.meals.length }}
              </UBadge>
            </div>
            <UButton
              :to="`/meals/new?type=${mealGroup.type}&date=${selectedDate}`"
              size="xs"
              variant="ghost"
              icon="i-lucide-plus"
            >
              Ajouter
            </UButton>
          </div>

          <template v-if="mealGroup.meals.length">
            <UCard
              v-for="meal in mealGroup.meals"
              :key="meal.id"
              class="mb-2"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div v-if="meal.items.length" class="space-y-1">
                    <div
                      v-for="item in meal.items"
                      :key="item.id"
                      class="flex items-center justify-between text-sm"
                    >
                      <span>
                        {{ item.food.name }}
                        <span class="text-muted">({{ item.quantity }}g)</span>
                      </span>
                      <span class="text-muted">{{ Math.round(Number(item.calories)) }} kcal</span>
                    </div>
                  </div>
                  <p v-if="meal.notes" class="text-sm text-muted mt-2 italic">
                    {{ meal.notes }}
                  </p>
                </div>
                <UButton
                  :to="`/meals/${meal.id}`"
                  icon="i-lucide-pencil"
                  variant="ghost"
                  size="xs"
                  class="ml-4"
                />
              </div>
            </UCard>
          </template>
          <div v-else class="text-center py-6 text-muted bg-muted/5 rounded-lg">
            <p class="text-sm">Aucun repas enregistré</p>
          </div>
        </div>
      </div>
    </template>
  </UContainer>
</template>
