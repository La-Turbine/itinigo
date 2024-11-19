<script setup lang="ts">
defineProps<{ trip: any }>()
function homework(place: string) {
  if (place.toLowerCase() === $state.home?.toLowerCase()) return "🏠 Maison"
  if (place.toLowerCase() === $state.work?.toLowerCase()) return "🏢 Travail"
  return place
}
</script>

<template>
  <div style="display: flex; max-width: 28rem; min-height: 70px; margin: 20px; padding: 10px; background: #f6f7f7; border-radius: 0.5rem; border: 1px solid rgba(0, 0, 0, 0.15)" v-if="trip">
    <div style="width: 40%; margin: auto; font-weight: 500; text-align: center; text-wrap: balance">{{ homework(trip.from?.text ?? "") }}</div>
    <svg width="20%" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="12" x2="90" y2="12" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M90 4L98 12L90 20" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <div style="width: 40%; margin: auto; font-weight: 500; text-align: center; text-wrap: balance">{{ homework(trip.to?.text ?? "") }}</div>
  </div>
</template>
