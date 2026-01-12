<script setup lang="ts">
import type { Meal, Food } from '~/types'
import { MealTypeLabels, MealTypeIcons } from '~/types'
import { useApi } from '~/composables/useApi'

const api = useApi()
const route = useRoute()
const toast = useToast()

const mealId = route.params.id as string

const { data: meal, pending, refresh } = await useAsyncData<Meal>(
  `meal-${mealId}`,
  () => api.get<Meal>(`/meals/${mealId}`)
)

// Recherche d'aliments
const searchQuery = ref('')
const searchResults = ref<Food[]>([])
const searching = ref(false)
const showAddFood = ref(false)

// Sélection d'aliment avec quantité personnalisée
const selectedFood = ref<Food | null>(null)
const selectedQuantity = ref(100)

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

// Debounce search
let searchTimeout: NodeJS.Timeout
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchFoods, 300)
})

// Sélectionner un aliment pour configurer la quantité
const selectFood = (food: Food) => {
  selectedFood.value = food
  selectedQuantity.value = Number(food.servingSize)
}

const cancelSelection = () => {
  selectedFood.value = null
  selectedQuantity.value = 100
}

// Calcul preview des macros
const previewCalories = computed(() => {
  if (!selectedFood.value) return 0
  return (Number(selectedFood.value.calories) * selectedQuantity.value / Number(selectedFood.value.servingSize))
})
const previewProteins = computed(() => {
  if (!selectedFood.value) return 0
  return (Number(selectedFood.value.proteins) * selectedQuantity.value / Number(selectedFood.value.servingSize))
})
const previewCarbs = computed(() => {
  if (!selectedFood.value) return 0
  return (Number(selectedFood.value.carbs) * selectedQuantity.value / Number(selectedFood.value.servingSize))
})
const previewFats = computed(() => {
  if (!selectedFood.value) return 0
  return (Number(selectedFood.value.fats) * selectedQuantity.value / Number(selectedFood.value.servingSize))
})

// Ajouter un aliment
const addingFood = ref(false)
const addFood = async () => {
  if (!selectedFood.value) return
  addingFood.value = true
  try {
    await api.post(`/meals/${mealId}/items`, {
      foodId: selectedFood.value.id,
      quantity: selectedQuantity.value
    })
    await refresh()
    searchQuery.value = ''
    searchResults.value = []
    selectedFood.value = null
    showAddFood.value = false
    toast.add({ title: 'Aliment ajouté', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  } finally {
    addingFood.value = false
  }
}

// Modifier la quantité d'un item existant
const editingItemId = ref<string | null>(null)
const editingQuantity = ref(0)

const startEditItem = (item: any) => {
  editingItemId.value = item.id
  editingQuantity.value = item.quantity
}

const cancelEditItem = () => {
  editingItemId.value = null
  editingQuantity.value = 0
}

const savingItem = ref(false)
const saveItemQuantity = async () => {
  if (!editingItemId.value) return
  savingItem.value = true
  try {
    await api.patch(`/meals/${mealId}/items/${editingItemId.value}`, {
      quantity: editingQuantity.value
    })
    await refresh()
    editingItemId.value = null
    toast.add({ title: 'Quantité mise à jour', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  } finally {
    savingItem.value = false
  }
}

// Supprimer un aliment du repas
const removeItem = async (itemId: string) => {
  if (!confirm('Supprimer cet aliment du repas ?')) return
  try {
    await api.delete(`/meals/${mealId}/items/${itemId}`)
    await refresh()
    toast.add({ title: 'Aliment supprimé', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  }
}

// Éditer les notes
const editingNotes = ref(false)
const notesInput = ref('')
const savingNotes = ref(false)

const startEditNotes = () => {
  notesInput.value = meal.value?.notes || ''
  editingNotes.value = true
}

const saveNotes = async () => {
  savingNotes.value = true
  try {
    await api.patch(`/meals/${mealId}`, { notes: notesInput.value || null })
    await refresh()
    editingNotes.value = false
    toast.add({ title: 'Notes mises à jour', icon: 'i-lucide-check-circle', color: 'success' })
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  } finally {
    savingNotes.value = false
  }
}

// Supprimer le repas
const deleting = ref(false)
const deleteMeal = async () => {
  if (!confirm('Supprimer ce repas définitivement ?')) return
  deleting.value = true
  try {
    await api.delete(`/meals/${mealId}`)
    toast.add({ title: 'Repas supprimé', icon: 'i-lucide-check-circle', color: 'success' })
    navigateTo('/meals')
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', icon: 'i-lucide-x-circle', color: 'error' })
  } finally {
    deleting.value = false
  }
}

// Calculs
const totalCalories = computed(() => 
  meal.value?.items?.reduce((sum, item) => sum + Number(item.calories), 0) || 0
)
const totalProteins = computed(() => 
  meal.value?.items?.reduce((sum, item) => sum + Number(item.proteins), 0) || 0
)
const totalCarbs = computed(() => 
  meal.value?.items?.reduce((sum, item) => sum + Number(item.carbs), 0) || 0
)
const totalFats = computed(() => 
  meal.value?.items?.reduce((sum, item) => sum + Number(item.fats), 0) || 0
)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8 max-w-2xl">
    <!-- Loading -->
    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <!-- Not found -->
    <div v-else-if="!meal" class="text-center py-16">
      <UIcon name="i-lucide-utensils-crossed" class="w-16 h-16 text-muted mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">Repas non trouvé</h2>
      <UButton to="/meals" variant="outline">Retour aux repas</UButton>
    </div>

    <!-- Meal detail -->
    <template v-else>
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/meals" class="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
          Retour aux repas
        </NuxtLink>
        
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div class="p-4 rounded-xl bg-primary/10">
              <UIcon :name="MealTypeIcons[meal.type]" class="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 class="text-2xl font-bold">{{ MealTypeLabels[meal.type] }}</h1>
              <p class="text-muted">{{ formatDate(meal.date) }}</p>
            </div>
          </div>
          <UDropdownMenu
            :items="[[
              { label: 'Supprimer', icon: 'i-lucide-trash-2', click: deleteMeal }
            ]]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              variant="ghost"
              :loading="deleting"
            />
          </UDropdownMenu>
        </div>
      </div>

      <!-- Résumé nutritionnel -->
      <UCard class="mb-6">
        <div class="grid grid-cols-4 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-emerald-500">{{ Math.round(totalCalories) }}</p>
            <p class="text-xs text-muted">Calories</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-rose-500">{{ Math.round(totalProteins) }}g</p>
            <p class="text-xs text-muted">Protéines</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-amber-500">{{ Math.round(totalCarbs) }}g</p>
            <p class="text-xs text-muted">Glucides</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-sky-500">{{ Math.round(totalFats) }}g</p>
            <p class="text-xs text-muted">Lipides</p>
          </div>
        </div>
      </UCard>

      <!-- Notes -->
      <UCard class="mb-6">
        <template v-if="editingNotes">
          <div class="space-y-3">
            <UTextarea
              v-model="notesInput"
              placeholder="Ajouter des notes sur ce repas..."
              :rows="3"
              autofocus
              class="w-full"
            />
            <div class="flex justify-end gap-2">
              <UButton
                variant="ghost"
                size="sm"
                @click="editingNotes = false"
                :disabled="savingNotes"
              >
                Annuler
              </UButton>
              <UButton
                size="sm"
                @click="saveNotes"
                :loading="savingNotes"
              >
                Enregistrer
              </UButton>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="flex items-start gap-3 cursor-pointer group" @click="startEditNotes">
            <UIcon name="i-lucide-sticky-note" class="w-5 h-5 text-muted mt-0.5" />
            <p v-if="meal.notes" class="text-muted italic flex-1">{{ meal.notes }}</p>
            <p v-else class="text-muted/50 flex-1">Ajouter des notes...</p>
            <UIcon name="i-lucide-pencil" class="w-4 h-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </template>
      </UCard>

      <!-- Liste des aliments -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg">Aliments</h2>
          <UButton
            size="sm"
            icon="i-lucide-plus"
            @click="showAddFood = !showAddFood"
          >
            Ajouter
          </UButton>
        </div>

        <!-- Formulaire ajout aliment -->
        <UCard v-if="showAddFood" class="mb-4">
          <div class="space-y-3">
            <!-- Aliment sélectionné - Configuration quantité -->
            <template v-if="selectedFood">
              <div class="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="font-semibold">{{ selectedFood.name }}</p>
                    <p class="text-sm text-muted">{{ selectedFood.brand || 'Sans marque' }}</p>
                  </div>
                  <UButton
                    icon="i-lucide-x"
                    variant="ghost"
                    size="xs"
                    @click="cancelSelection"
                  />
                </div>
                
                <div class="flex items-center gap-3 mb-4">
                  <label class="text-sm font-medium">Quantité</label>
                  <UInput
                    v-model.number="selectedQuantity"
                    type="number"
                    :min="1"
                    class="w-24"
                  />
                  <span class="text-muted">{{ selectedFood.servingUnit }}</span>
                </div>

                <!-- Preview des macros -->
                <div class="grid grid-cols-4 gap-2 text-center text-sm mb-4 p-3 bg-background rounded">
                  <div>
                    <p class="font-semibold text-emerald-500">{{ Math.round(previewCalories) }}</p>
                    <p class="text-xs text-muted">kcal</p>
                  </div>
                  <div>
                    <p class="font-semibold text-rose-500">{{ Math.round(previewProteins) }}g</p>
                    <p class="text-xs text-muted">P</p>
                  </div>
                  <div>
                    <p class="font-semibold text-amber-500">{{ Math.round(previewCarbs) }}g</p>
                    <p class="text-xs text-muted">G</p>
                  </div>
                  <div>
                    <p class="font-semibold text-sky-500">{{ Math.round(previewFats) }}g</p>
                    <p class="text-xs text-muted">L</p>
                  </div>
                </div>

                <div class="flex justify-end gap-2">
                  <UButton variant="ghost" size="sm" @click="cancelSelection">
                    Annuler
                  </UButton>
                  <UButton size="sm" @click="addFood" :loading="addingFood">
                    Ajouter au repas
                  </UButton>
                </div>
              </div>
            </template>

            <!-- Recherche d'aliments -->
            <template v-else>
              <UInput
                v-model="searchQuery"
                placeholder="Rechercher un aliment..."
                icon="i-lucide-search"
                :loading="searching"
                class="w-full"
              />

              <div v-if="searchResults.length" class="border border-default rounded-lg divide-y max-h-60 overflow-auto">
                <button
                  v-for="food in searchResults"
                  :key="food.id"
                  type="button"
                  class="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center justify-between"
                  @click="selectFood(food)"
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

              <p v-else-if="searchQuery && !searching" class="text-center text-muted py-4">
                Aucun aliment trouvé
              </p>

              <div class="flex justify-between items-center pt-2">
                <NuxtLink to="/foods/new" class="text-sm text-primary hover:underline">
                  + Créer un nouvel aliment
                </NuxtLink>
                <UButton variant="ghost" size="sm" @click="showAddFood = false">
                  Annuler
                </UButton>
              </div>
            </template>
          </div>
        </UCard>

        <!-- Liste des items -->
        <div v-if="meal.items?.length" class="space-y-2">
          <UCard
            v-for="item in meal.items"
            :key="item.id"
            class="group"
          >
            <!-- Mode édition -->
            <template v-if="editingItemId === item.id">
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium">{{ item.food.name }}</p>
                    <p class="text-sm text-muted">{{ item.food.brand || 'Sans marque' }}</p>
                  </div>
                </div>
                
                <div class="flex items-center gap-3">
                  <label class="text-sm font-medium">Quantité</label>
                  <UInput
                    v-model.number="editingQuantity"
                    type="number"
                    :min="1"
                    class="w-24"
                    autofocus
                  />
                  <span class="text-muted">{{ item.food.servingUnit }}</span>
                </div>

                <div class="flex justify-end gap-2">
                  <UButton variant="ghost" size="sm" @click="cancelEditItem" :disabled="savingItem">
                    Annuler
                  </UButton>
                  <UButton size="sm" @click="saveItemQuantity" :loading="savingItem">
                    Enregistrer
                  </UButton>
                </div>
              </div>
            </template>

            <!-- Mode affichage -->
            <template v-else>
              <div class="flex items-center gap-4">
                <div class="flex-1 cursor-pointer" @click="startEditItem(item)">
                  <p class="font-medium">{{ item.food.name }}</p>
                  <p class="text-sm text-muted flex items-center gap-1">
                    {{ item.food.brand || 'Sans marque' }} • 
                    <span class="inline-flex items-center gap-0.5 text-primary">
                      {{ item.quantity }}{{ item.food.servingUnit }}
                      <UIcon name="i-lucide-pencil" class="w-3 h-3 opacity-0 group-hover:opacity-100" />
                    </span>
                  </p>
                </div>
                <div class="grid grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <p class="font-semibold text-emerald-500">{{ Math.round(Number(item.calories)) }}</p>
                    <p class="text-xs text-muted">kcal</p>
                  </div>
                  <div>
                    <p class="font-semibold text-rose-500">{{ Math.round(Number(item.proteins)) }}g</p>
                    <p class="text-xs text-muted">P</p>
                  </div>
                  <div>
                    <p class="font-semibold text-amber-500">{{ Math.round(Number(item.carbs)) }}g</p>
                    <p class="text-xs text-muted">G</p>
                  </div>
                  <div>
                    <p class="font-semibold text-sky-500">{{ Math.round(Number(item.fats)) }}g</p>
                    <p class="text-xs text-muted">L</p>
                  </div>
                </div>
                <UButton
                  icon="i-lucide-trash-2"
                  color="error"
                  variant="ghost"
                  size="xs"
                  class="opacity-0 group-hover:opacity-100 transition-opacity"
                  @click="removeItem(item.id)"
                />
              </div>
            </template>
          </UCard>
        </div>

        <div v-else class="text-center py-8 bg-muted/5 rounded-lg">
          <UIcon name="i-lucide-utensils" class="w-10 h-10 text-muted mx-auto mb-2" />
          <p class="text-muted">Aucun aliment dans ce repas</p>
          <UButton
            v-if="!showAddFood"
            variant="link"
            size="sm"
            @click="showAddFood = true"
          >
            Ajouter un aliment
          </UButton>
        </div>
      </div>
    </template>
  </UContainer>
</template>
