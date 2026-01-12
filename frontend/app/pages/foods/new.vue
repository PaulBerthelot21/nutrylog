<script setup lang="ts">
const api = useApi()
const toast = useToast()

const form = reactive({
  name: '',
  brand: '',
  calories: 0,
  proteins: 0,
  carbs: 0,
  fats: 0,
  servingSize: 100,
  servingUnit: 'g',
  barcode: ''
})

const loading = ref(false)

const handleSubmit = async () => {
  loading.value = true
  try {
    await api.post('/foods', {
      name: form.name,
      brand: form.brand || undefined,
      calories: form.calories,
      proteins: form.proteins,
      carbs: form.carbs,
      fats: form.fats,
      servingSize: form.servingSize,
      servingUnit: form.servingUnit,
      barcode: form.barcode || undefined
    })
    toast.add({ title: 'Aliment créé !', color: 'success', icon: 'i-lucide-check-circle' })
    navigateTo('/foods')
  } catch (e: any) {
    toast.add({ title: e.message || 'Erreur', color: 'error', icon: 'i-lucide-x-circle' })
  } finally {
    loading.value = false
  }
}

definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <UContainer class="py-8 max-w-xl">
    <div class="mb-8">
      <NuxtLink to="/foods" class="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4">
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Retour au catalogue
      </NuxtLink>
      <h1 class="text-2xl font-bold">Nouvel aliment</h1>
      <p class="text-muted">Ajoutez un aliment à votre catalogue</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <UCard>
        <template #header>
          <h3 class="font-semibold">Informations générales</h3>
        </template>

        <div class="space-y-4">
          <UFormField label="Nom de l'aliment" name="name" required>
            <UInput
              v-model="form.name"
              placeholder="Ex: Poulet grillé"
              icon="i-lucide-utensils"
              required
            />
          </UFormField>

          <UFormField label="Marque (optionnel)" name="brand">
            <UInput
              v-model="form.brand"
              placeholder="Ex: Fleury Michon"
              icon="i-lucide-tag"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField label="Portion" name="servingSize">
              <UInput
                v-model.number="form.servingSize"
                type="number"
                min="1"
              />
            </UFormField>
            <UFormField label="Unité" name="servingUnit">
              <USelectMenu
                v-model="form.servingUnit"
                :items="[
                  { label: 'Grammes (g)', value: 'g' },
                  { label: 'Millilitres (ml)', value: 'ml' },
                  { label: 'Unité', value: 'unité' }
                ]"
                value-key="value"
              />
            </UFormField>
          </div>

          <UFormField label="Code-barres (optionnel)" name="barcode">
            <UInput
              v-model="form.barcode"
              placeholder="Ex: 3017620422003"
              icon="i-lucide-scan-barcode"
            />
          </UFormField>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">Valeurs nutritionnelles</h3>
          <p class="text-sm text-muted">Pour {{ form.servingSize }}{{ form.servingUnit }}</p>
        </template>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Calories (kcal)" name="calories">
            <UInput
              v-model.number="form.calories"
              type="number"
              min="0"
              step="0.1"
              icon="i-lucide-flame"
            />
          </UFormField>

          <UFormField label="Protéines (g)" name="proteins">
            <UInput
              v-model.number="form.proteins"
              type="number"
              min="0"
              step="0.1"
              icon="i-lucide-beef"
            />
          </UFormField>

          <UFormField label="Glucides (g)" name="carbs">
            <UInput
              v-model.number="form.carbs"
              type="number"
              min="0"
              step="0.1"
              icon="i-lucide-wheat"
            />
          </UFormField>

          <UFormField label="Lipides (g)" name="fats">
            <UInput
              v-model.number="form.fats"
              type="number"
              min="0"
              step="0.1"
              icon="i-lucide-droplet"
            />
          </UFormField>
        </div>
      </UCard>

      <div class="flex gap-3">
        <UButton
          to="/foods"
          variant="outline"
          block
        >
          Annuler
        </UButton>
        <UButton
          type="submit"
          block
          :loading="loading"
          icon="i-lucide-check"
        >
          Créer l'aliment
        </UButton>
      </div>
    </form>
  </UContainer>
</template>
