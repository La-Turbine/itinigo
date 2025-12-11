<template>
  <div class="flex w-full flex-col gap-4 overflow-hidden rounded-3xl border border-black/10 bg-white p-5" v-if="trip">
    <div class="flex w-full items-center justify-between">
      <div class="flex items-center gap-2 overflow-hidden rounded-full border border-slate-200/50 bg-linear-to-r from-slate-50 to-slate-100 px-3.5 py-2">
        <span class="text-lg font-semibold text-slate-700">{{ trip.duration }}</span>
        <span class="text-slate-300">|</span>
        <div class="flex items-center gap-1.5">
          <template v-for="(t, i) in transports" :key="i">
            <span class="text-sm text-slate-300" v-if="i > 0">•</span>
            <div :class="[icons[t.type]]" class="flex size-7 items-center justify-center rounded-lg bg-neutral-500 p-1.5 text-sm text-white"></div>
            <span class="text-sm font-medium text-slate-600" v-if="t.line">{{ t.line }}</span>
          </template>
        </div>
      </div>
      <div class="i-lucide/trash-2 ml-3 shrink-0 cursor-pointer p-1 text-xl text-red-500" v-if="delete" @click.stop="onDelete"></div>
    </div>
    <div class="flex items-stretch gap-4">
      <div class="flex flex-col items-center py-1">
        <div class="size-2.5 rounded-full bg-(--ion-color-primary) ring-2 ring-(--ion-color-primary)/20"></div>
        <div class="w-0.5 flex-1 rounded-full bg-(--ion-color-primary)"></div>
        <div class="i-lucide/arrow-down -my-1 -mt-1.5 text-[22px] text-(--ion-color-primary)"></div>
      </div>
      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="truncate text-base text-slate-600">{{ homework(trip.from?.text ?? "") }}</div>
        <div class="truncate text-lg font-semibold text-slate-800">{{ homework(trip.to?.text ?? "") }}</div>
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
