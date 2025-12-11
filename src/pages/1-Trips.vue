<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="px-5!">
        <img src="/logo.svg" alt="Logo Itinigo" />
        <ion-buttons slot="end">
          <div class="flex items-center gap-2">
            <div class="font-medium" :class="$state.mode === 'helper' ? 'text-black' : 'text-gray-500'" @click="changeMode('helper')">Édition</div>
            <div class="group relative inline-flex w-16 shrink-0 rounded-full bg-black p-0.5 inset-ring inset-ring-gray-900/5 outline-offset-2 outline-(--ion-color-primary) transition-colors duration-200 ease-in-out has-checked:bg-(--ion-color-primary) has-focus-visible:outline-2" @click="changeMode">
              <span class="relative m-1 size-8 rounded-full bg-white shadow-xs ring-1 ring-gray-900/5 transition-transform duration-200 ease-in-out group-has-checked:translate-x-5">
                <span class="absolute inset-0 flex size-full items-center justify-center opacity-100 transition-opacity duration-200 ease-in group-has-checked:opacity-0 group-has-checked:duration-100 group-has-checked:ease-out" aria-hidden="true">
                  <div class="i-lucide/pen-tool size-5 text-black"></div>
                </span>
                <span class="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-has-checked:opacity-100 group-has-checked:duration-200 group-has-checked:ease-in" aria-hidden="true">
                  <div class="i-lucide/map size-5 text-(--ion-color-primary)"></div>
                </span>
              </span>
              <input type="checkbox" class="pointer-events-none absolute inset-0 appearance-none focus:outline-hidden" aria-label="Use setting" name="setting" :checked="$state.mode === 'user'" />
            </div>
            <div class="font-medium" :class="$state.mode === 'user' ? 'text-(--ion-color-primary)' : 'text-gray-500'" @click="changeMode('user')">Trajet</div>
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
