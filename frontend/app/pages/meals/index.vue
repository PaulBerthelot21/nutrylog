<script setup lang="ts">
import type { Meal } from '~/types'
import { MealTypeLabels, MealTypeIcons } from '~/types'
import { useApi } from '~/composables/useApi'

const api = useApi()
const toast = useToast()

const { data: meals, pending, refresh } = await useAsyncData<Meal[]>(
  'meals',
  () => api.get<Meal[]>('/meals'),
  { default: () => [] }
)

// Grouper les repas par date
const mealsByDate = computed(() => {
  const grouped: Record<string, Meal[]> = {}
  meals.value?.forEach(meal => {
    const dateKey = meal.date.split('T')[0]
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(meal)
  })
  // Trier les dates (plus récentes en premier)
  return Object.entries(grouped)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, meals]) => ({
      date,
      meals: meals.sort((a, b) => {
        const order = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 }
        return order[a.type] - order[b.type]
      })
    }))
})

const formatDateHeader = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) {
    return "Aujourd'hui"
  }
  if (d.toDateString() === yesterday.toDateString()) {
    return 'Hier'
  }
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

const getMealCalories = (meal: Meal) => {
  return meal.items?.reduce((sum, item) => sum + Number(item.calories), 0) || 0
}

const getDayTotalCalories = (meals: Meal[]) => {
  return meals.reduce((sum, meal) => sum + getMealCalories(meal), 0)
}

const deleteMeal = async (meal: Meal) => {
  if (!confirm(`Supprimer ce ${MealTypeLabels[meal.type].toLowerCase()} ?`)) return
  try {
    await api.delete(`/meals/${meal.id}`)
    await refresh()
    toast.add({ title: 'Repas supprimé', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  }
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
      <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
        <UIcon name="i-lucide-utensils" class="w-10 h-10 text-primary" />
      </div>
      <h3 class="font-semibold text-lg mb-2">Aucun repas enregistré</h3>
      <p class="text-muted mb-6 max-w-sm mx-auto">
        Commencez à suivre votre alimentation en ajoutant votre premier repas
      </p>
      <UButton to="/meals/new" icon="i-lucide-plus" size="lg">
        Ajouter mon premier repas
      </UButton>
    </div>

    <div v-else class="space-y-8">
      <!-- Groupe par date -->
      <div v-for="group in mealsByDate" :key="group.date">
        <!-- En-tête de date -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-muted/10">
              <UIcon name="i-lucide-calendar" class="w-5 h-5 text-muted" />
            </div>
            <div>
              <h2 class="font-semibold capitalize">{{ formatDateHeader(group.date) }}</h2>
              <p class="text-sm text-muted">{{ group.meals.length }} repas</p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-bold text-lg">{{ Math.round(getDayTotalCalories(group.meals)) }}</p>
            <p class="text-xs text-muted">kcal total</p>
          </div>
        </div>

        <!-- Liste des repas du jour -->
        <div class="space-y-3 ml-4 pl-4 border-l-2 border-muted/20">
          <UCard
            v-for="meal in group.meals"
            :key="meal.id"
            class="group hover:border-primary/50 transition-colors"
          >
            <NuxtLink :to="`/meals/${meal.id}`" class="flex items-center gap-4">
              <div class="p-3 rounded-lg bg-primary/10 shrink-0">
                <UIcon :name="MealTypeIcons[meal.type]" class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold">{{ MealTypeLabels[meal.type] }}</h3>
                  <UBadge v-if="meal.items?.length" variant="subtle" size="sm">
                    {{ meal.items.length }} aliment{{ meal.items.length > 1 ? 's' : '' }}
                  </UBadge>
                </div>
                <p v-if="meal.items?.length" class="text-sm text-muted truncate">
                  {{ meal.items.map(i => i.food.name).join(', ') }}
                </p>
                <p v-else class="text-sm text-muted italic">Aucun aliment</p>
              </div>
              <div class="text-right shrink-0">
                <p class="font-semibold text-lg">{{ Math.round(getMealCalories(meal)) }}</p>
                <p class="text-xs text-muted">kcal</p>
              </div>
              <UDropdownMenu
                :items="[[
                  { label: 'Voir / Modifier', icon: 'i-lucide-pencil', to: `/meals/${meal.id}` },
                  { label: 'Supprimer', icon: 'i-lucide-trash-2', click: () => deleteMeal(meal) }
                ]]"
                @click.stop.prevent
              >
                <UButton
                  icon="i-lucide-more-vertical"
                  variant="ghost"
                  size="sm"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  @click.stop.prevent
                />
              </UDropdownMenu>
            </NuxtLink>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Bouton flottant sur mobile -->
    <div class="fixed bottom-6 right-6 md:hidden">
      <UButton
        to="/meals/new"
        icon="i-lucide-plus"
        size="xl"
        class="rounded-full shadow-lg"
      />
    </div>
  </UContainer>
</template>
