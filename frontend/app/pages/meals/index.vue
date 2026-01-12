<script setup lang="ts">
import type { Meal } from '~/types'
import { MealTypeLabels, MealTypeIcons } from '~/types'

const api = useApi()

const { data: meals, pending, refresh } = await useAsyncData<Meal[]>(
  'meals',
  () => api.get<Meal[]>('/meals'),
  { default: () => [] }
)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  })
}

const getMealCalories = (meal: Meal) => {
  return meal.items?.reduce((sum, item) => sum + Number(item.calories), 0) || 0
}

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold">Mes repas</h1>
        <p class="text-muted">Historique de tous vos repas</p>
      </div>
      <UButton to="/meals/new" icon="i-lucide-plus">
        Nouveau repas
      </UButton>
    </div>

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <div v-else-if="!meals?.length" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
        <UIcon name="i-lucide-utensils" class="w-8 h-8 text-muted" />
      </div>
      <h3 class="font-semibold mb-2">Aucun repas enregistré</h3>
      <p class="text-muted mb-4">Commencez par ajouter votre premier repas</p>
      <UButton to="/meals/new" icon="i-lucide-plus">
        Ajouter un repas
      </UButton>
    </div>

    <div v-else class="space-y-4">
      <UCard
        v-for="meal in meals"
        :key="meal.id"
        :to="`/meals/${meal.id}`"
        class="hover:border-primary/50 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-lg bg-primary/10">
            <UIcon :name="MealTypeIcons[meal.type]" class="w-6 h-6 text-primary" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold">{{ MealTypeLabels[meal.type] }}</h3>
              <UBadge variant="subtle" size="sm">
                {{ formatDate(meal.date) }}
              </UBadge>
            </div>
            <p class="text-sm text-muted">
              {{ meal.items?.length || 0 }} aliment(s)
              <span v-if="meal.notes"> • {{ meal.notes }}</span>
            </p>
          </div>
          <div class="text-right">
            <p class="font-semibold text-lg">{{ Math.round(getMealCalories(meal)) }}</p>
            <p class="text-xs text-muted">kcal</p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-muted" />
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
