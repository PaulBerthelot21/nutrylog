<script setup lang="ts">
import type { Food } from '~/types'

const api = useApi()
const toast = useToast()

const searchQuery = ref('')
const { data: foods, pending, refresh } = await useAsyncData<Food[]>(
  'foods',
  () => api.get<Food[]>(`/foods${searchQuery.value ? `?search=${encodeURIComponent(searchQuery.value)}` : ''}`),
  { watch: [searchQuery], default: () => [] }
)

const deleteFood = async (food: Food) => {
  if (!confirm(`Supprimer "${food.name}" ?`)) return
  try {
    await api.delete(`/foods/${food.id}`)
    toast.add({ title: 'Aliment supprimé', color: 'success', icon: 'i-lucide-check-circle' })
    refresh()
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', color: 'error', icon: 'i-lucide-x-circle' })
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
        <h1 class="text-2xl font-bold">Catalogue d'aliments</h1>
        <p class="text-muted">Gérez votre base de données alimentaire</p>
      </div>
      <UButton to="/foods/new" icon="i-lucide-plus">
        Nouvel aliment
      </UButton>
    </div>

    <!-- Recherche -->
    <UInput
      v-model="searchQuery"
      placeholder="Rechercher un aliment..."
      icon="i-lucide-search"
      size="lg"
      class="mb-6"
    />

    <div v-if="pending" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <div v-else-if="!foods?.length" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
        <UIcon name="i-lucide-apple" class="w-8 h-8 text-muted" />
      </div>
      <h3 class="font-semibold mb-2">
        {{ searchQuery ? 'Aucun résultat' : 'Aucun aliment' }}
      </h3>
      <p class="text-muted mb-4">
        {{ searchQuery ? 'Essayez avec d\'autres termes' : 'Ajoutez votre premier aliment' }}
      </p>
      <UButton v-if="!searchQuery" to="/foods/new" icon="i-lucide-plus">
        Ajouter un aliment
      </UButton>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="food in foods"
        :key="food.id"
        class="relative group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="font-semibold">{{ food.name }}</h3>
            <p class="text-sm text-muted">{{ food.brand || 'Sans marque' }}</p>
          </div>
          <UDropdownMenu
            :items="[[
              { label: 'Modifier', icon: 'i-lucide-pencil', to: `/foods/${food.id}/edit` },
              { label: 'Supprimer', icon: 'i-lucide-trash-2', click: () => deleteFood(food) }
            ]]"
          >
            <UButton
              icon="i-lucide-more-vertical"
              variant="ghost"
              size="xs"
              class="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </UDropdownMenu>
        </div>

        <USeparator class="my-3" />

        <div class="grid grid-cols-4 gap-2 text-center text-sm">
          <div>
            <p class="font-semibold text-emerald-500">{{ Math.round(Number(food.calories)) }}</p>
            <p class="text-xs text-muted">kcal</p>
          </div>
          <div>
            <p class="font-semibold text-rose-500">{{ Math.round(Number(food.proteins)) }}g</p>
            <p class="text-xs text-muted">Prot.</p>
          </div>
          <div>
            <p class="font-semibold text-amber-500">{{ Math.round(Number(food.carbs)) }}g</p>
            <p class="text-xs text-muted">Gluc.</p>
          </div>
          <div>
            <p class="font-semibold text-sky-500">{{ Math.round(Number(food.fats)) }}g</p>
            <p class="text-xs text-muted">Lip.</p>
          </div>
        </div>

        <p class="text-xs text-muted mt-3 text-center">
          Pour {{ food.servingSize }}{{ food.servingUnit }}
        </p>
      </UCard>
    </div>
  </UContainer>
</template>
