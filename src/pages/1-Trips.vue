<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <img src="/logo.svg" alt="Logo Itinigo" />
        <ion-buttons slot="end">
          <div class="flex items-center gap-2">
            <div class="font-medium" @click="changeMode('helper')">Édition</div>
            <div class="group relative inline-flex w-11 shrink-0 rounded-full bg-black p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-indigo-600 transition-colors duration-200 ease-in-out has-checked:bg-indigo-600 has-focus-visible:outline-2" @click="changeMode">
              <span class="relative size-5 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5">
                <span class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out" aria-hidden="true">
                  <svg class="size-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                    <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
                <span class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in" aria-hidden="true">
                  <svg class="size-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                  </svg>
                </span>
              </span>
              <input type="checkbox" class="absolute inset-0 appearance-none focus:outline-hidden" aria-label="Use setting" name="setting" :checked="$state.mode === 'user'" />
            </div>
            <div class="font-medium text-gray-500" @click="changeMode('user')">Trajet</div>
          </div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content forceOverscroll="false">
      <list-trip />
    </ion-content>
  </ion-page>
</template>

<script setup>
async function changeMode(mode) {
  if (mode && mode === $state.mode) return
  if ($state.mode === "user" && !(await window.popup("Voulez-vous passer en mode édition ?", { ok: "Oui", ko: "Non" }))) return
  $state.mode = $state.mode === "helper" ? "user" : "helper"
}
</script>
