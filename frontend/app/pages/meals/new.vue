<script setup lang="ts">
import type { Food, MealType } from '~/types'
import { MealTypeLabels, MealTypeIcons } from '~/types'

const api = useApi()
const toast = useToast()
const route = useRoute()

const form = reactive({
  type: (route.query.type as MealType) || 'lunch',
  date: (route.query.date as string) || new Date().toISOString().split('T')[0],
  notes: '',
  items: [] as { foodId: string; food: Food; quantity: number }[]
})

const loading = ref(false)
const searchQuery = ref('')
const searchResults = ref<Food[]>([])
const searching = ref(false)

const mealTypeOptions = Object.entries(MealTypeLabels).map(([value, label]) => ({
  value,
  label,
  icon: MealTypeIcons[value as MealType]
}))

const searchFoods = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    searchResults.value = await api.get<Food[]>(`/foods?search=${encodeURIComponent(searchQuery.value)}`)
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

const addFood = (food: Food) => {
  const existing = form.items.find(i => i.foodId === food.id)
  if (existing) {
    existing.quantity += Number(food.servingSize)
  } else {
    form.items.push({
      foodId: food.id,
      food,
      quantity: Number(food.servingSize)
    })
  }
  searchQuery.value = ''
  searchResults.value = []
}

const removeFood = (index: number) => {
  form.items.splice(index, 1)
}

const calculateItemCalories = (item: { food: Food; quantity: number }) => {
  const ratio = item.quantity / Number(item.food.servingSize)
  return Math.round(Number(item.food.calories) * ratio)
}

const totalCalories = computed(() => {
  return form.items.reduce((sum, item) => sum + calculateItemCalories(item), 0)
})

const handleSubmit = async () => {
  if (!form.items.length) {
    toast.add({ title: 'Ajoutez au moins un aliment', color: 'warning', icon: 'i-lucide-alert-triangle' })
    return
  }

  loading.value = true
  try {
    await api.post('/meals', {
      type: form.type,
      date: form.date,
      notes: form.notes || undefined,
      items: form.items.map(i => ({ foodId: i.foodId, quantity: i.quantity }))
    })
    toast.add({ title: 'Repas ajouté !', color: 'success', icon: 'i-lucide-check-circle' })
    navigateTo('/')
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    loading.value = false
  }
}

// Debounce search
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchFoods, 300)
})

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <div class="mb-8">
      <NuxtLink to="/meals" class="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Retour aux repas
      </NuxtLink>
      <h1 class="text-2xl font-bold">Nouveau repas</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Type et date -->
      <div class="grid grid-cols-2 gap-4">
        <UFormField label="Type de repas" name="type">
          <USelectMenu
            v-model="form.type"
            :items="mealTypeOptions"
            value-key="value"
          >
            <template #leading="{ modelValue }">
              <UIcon v-if="modelValue" :name="MealTypeIcons[modelValue as MealType]" class="w-4 h-4" />
            </template>
          </USelectMenu>
        </UFormField>

        <UFormField label="Date" name="date">
          <UInput
            v-model="form.date"
            type="date"
            icon="i-lucide-calendar"
          />
        </UFormField>
      </div>

      <!-- Recherche d'aliments -->
      <UFormField label="Ajouter des aliments" name="search">
        <div class="relative">
          <UInput
            v-model="searchQuery"
            placeholder="Rechercher un aliment..."
            icon="i-lucide-search"
            :loading="searching"
          />

          <!-- Résultats de recherche -->
          <div
            v-if="searchResults.length"
            class="absolute z-10 w-full mt-1 bg-default border border-default rounded-lg shadow-lg max-h-60 overflow-auto"
          >
            <button
              v-for="food in searchResults"
              :key="food.id"
              type="button"
              class="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center justify-between border-b last:border-0"
              @click="addFood(food)"
            >
              <div>
                <p class="font-medium">{{ food.name }}</p>
                <p class="text-sm text-muted">{{ food.brand || 'Sans marque' }} • {{ food.servingSize }}{{ food.servingUnit }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium">{{ Math.round(Number(food.calories)) }}</p>
                <p class="text-xs text-muted">kcal</p>
              </div>
            </button>
          </div>
        </div>
        <p class="text-xs text-muted mt-1">
          <NuxtLink to="/foods/new" class="text-primary hover:underline">
            + Créer un nouvel aliment
          </NuxtLink>
        </p>
      </UFormField>

      <!-- Liste des aliments ajoutés -->
      <div v-if="form.items.length">
        <label class="text-sm font-medium mb-2 block">Aliments sélectionnés</label>
        <UCard>
          <div class="divide-y">
            <div
              v-for="(item, index) in form.items"
              :key="item.foodId"
              class="py-3 first:pt-0 last:pb-0 flex items-center gap-4"
            >
              <div class="flex-1">
                <p class="font-medium">{{ item.food.name }}</p>
                <p class="text-sm text-muted">{{ item.food.brand || 'Sans marque' }}</p>
              </div>
              <UInput
                v-model.number="item.quantity"
                type="number"
                min="1"
                class="w-24"
                :trailing="item.food.servingUnit"
              />
              <div class="text-right w-20">
                <p class="font-medium">{{ calculateItemCalories(item) }}</p>
                <p class="text-xs text-muted">kcal</p>
              </div>
              <UButton
                icon="i-lucide-trash-2"
                color="error"
                variant="ghost"
                size="xs"
                @click="removeFood(index)"
              />
            </div>
          </div>
        </UCard>

        <div class="flex justify-end mt-2">
          <p class="text-lg font-semibold">
            Total: {{ totalCalories }} kcal
          </p>
        </div>
      </div>

      <!-- Notes -->
      <UFormField label="Notes (optionnel)" name="notes">
        <UTextarea
          v-model="form.notes"
          placeholder="Ajouter une note..."
          :rows="2"
        />
      </UFormField>

      <!-- Submit -->
      <div class="flex gap-3">
        <UButton
          to="/meals"
          variant="outline"
          block
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          block
          :loading="loading"
          :disabled="!form.items.length"
          icon="i-lucide-check"
        >
          Enregistrer le repas
        </UButton>
      </div>
    </form>
  </UContainer>
</template>
