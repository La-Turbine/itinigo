<template>
  <div class="flex flex-col gap-4 w-full p-5 bg-white rounded-2xl border border-black/10 shadow-sm hover:shadow-md transition-shadow" v-if="trip">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2 px-3.5 py-2 bg-linear-to-r from-slate-50 to-slate-100 rounded-full border border-slate-200/50">
        <span class="text-lg font-semibold text-slate-700">{{ trip.duration }}</span>
        <span class="text-slate-300">|</span>
        <div class="flex items-center gap-1.5">
          <template v-for="(t, i) in transports" :key="i">
            <span class="text-slate-300 text-sm" v-if="i > 0">•</span>
            <div :class="[icons[t.type], colors[t.type]]" class="text-white rounded-lg p-1.5 size-7 flex items-center justify-center text-sm"></div>
            <span class="text-sm font-medium text-slate-600" v-if="t.line">{{ t.line }}</span>
          </template>
        </div>
      </div>
      <div class="i-ion/trash-outline text-xl text-red-400 hover:text-red-500 cursor-pointer transition-colors p-1" v-if="delete" @click.stop="onDelete"></div>
    </div>
    <div class="flex gap-4 items-stretch">
      <div class="flex flex-col items-center py-1">
        <div class="size-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-100"></div>
        <div class="flex-1 w-0.5 bg-linear-to-b from-emerald-400 to-blue-500 my-1.5 rounded-full"></div>
        <div class="i-ion/arrow-down text-blue-500 text-lg -my-1"></div>
      </div>
      <div class="flex flex-col gap-3 flex-1 min-w-0">
        <div class="text-base text-slate-600 truncate">{{ homework(trip.from?.text ?? "") }}</div>
        <div class="text-lg font-semibold text-slate-800 truncate">{{ homework(trip.to?.text ?? "") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
const { trip } = defineProps<{ trip: any; delete: boolean }>()

const icons: Record<string, string> = { tram: "i-lucide/tram-front", bus: "i-lucide/bus", walk: "i-lucide/footprints" }
const colors: Record<string, string> = { tram: "bg-violet-500", bus: "bg-amber-500", walk: "bg-emerald-500" }

const transports = computed(() => {
  if (!trip.sequences) return []
  const list: { type: string; line?: string }[] = []
  let hasWalk = false
  for (const seq of trip.sequences) {
    if (seq.type) {
      const match = seq.type.match(/(Tram|Bus)\s+(.+)/)
      if (!match) continue
      const type = match[1].toLowerCase()
      const line = match[2]
      if (list.find((t) => t.type === type && t.line === line)) continue
      list.push({ type, line })
    } else if (seq.transport?.includes("marche") && !hasWalk) {
      hasWalk = true
      list.unshift({ type: "walk" })
    }
  }
  if (list.length === 0 && trip.sequences.length > 0) list.push({ type: "walk" })
  return list
})

async function onDelete() {
  const confirmed = await window.popup("Êtes-vous sûr de vouloir supprimer ce trajet ?", { title: "Confirmer la suppression", ok: "Supprimer", ko: "Annuler" })
  if (!confirmed) return
  const index = $state.trips.indexOf(trip)
  if (index === -1) return
  $state.trips.splice(index, 1)
}
</script>
