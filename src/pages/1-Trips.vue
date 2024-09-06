<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Trajets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$state.mode = $state.mode === 'helper' ? 'user' : 'helper'" @dblclick="$state.mode = 'developer'">
            <ion-icon :icon="$state.mode === 'helper' ? accessibility : walk"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="(trip, i) in $state.trips" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)">{{ trip.from }} - {{ trip.to }}</ion-item>
        <ion-item @click="$router.push(`/trip/${$state.trips.length + 1}`)" v-if="$state.mode === 'helper'">
          <ion-icon :icon="add"></ion-icon>
          <ion-label>Ajouter un trajet</ion-label>
        </ion-item>
        <ion-item color="danger" @click="reset" v-if="$state.mode === 'helper'">
          <ion-label>RESET</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    <template v-if="$state.mode === 'developer'">
      <div style="display: flex; height: 100px">
        <input style="width: 100px" type="file" accept="image/*" capture="environment" @change="onChange" />
        <div style="width: 100px">{{ photo.width }} / {{ photo.height }} / {{ photo.type }} {{ tldraw?.clientWidth }} / {{ tldraw?.clientHeight }}</div>
        <img style="height: 100px" :src="photo.src" />
      </div>
      <div style="height: 100%; width: 100%" v-html="html" ref="tldraw"></div>
    </template>
  </ion-page>
</template>

<script setup lang="ts">
import { accessibility, walk, add } from "ionicons/icons"
async function reset() {
  if (!confirm("Are you sure you want to reset?")) return
  await idb.clear()
  location.reload()
}

const canvas = document.createElement("canvas")
canvas.width = 3024
canvas.height = 4032
const ctx = canvas.getContext("2d")
const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
gradient.addColorStop(0, "red")
gradient.addColorStop(0.17, "orange")
gradient.addColorStop(0.33, "yellow")
gradient.addColorStop(0.5, "green")
gradient.addColorStop(0.67, "blue")
gradient.addColorStop(0.83, "indigo")
gradient.addColorStop(1, "violet")
ctx.fillStyle = gradient
ctx.fillRect(0, 0, canvas.width, canvas.height)
const base64 = canvas.toDataURL("image/png")

import { ref, computed } from "vue"
const tldraw = ref(null as HTMLDivElement | null)
const container = ref({ width: window.innerWidth, height: window.innerHeight })
const photo = ref({ src: base64, width: canvas.width, height: canvas.height, type: "image/png" })
const html = computed(() => {
  const screen = container.value
  const image = { ...photo.value }
  const scale = Math.min(screen.width / image.width, screen.height / image.height)
  image.width = image.width * scale
  image.height = image.height * scale
  const attr = { image, "on-done": "onDone" }
  const attrStr = Object.entries(attr)
    .map(([k, v]) => `${k}='${typeof v === "string" ? v : JSON.stringify(v)}'`)
    .join(" ")
  return `<wc-tldraw ${attrStr}></wc-tldraw>`
})
function until(fn: () => boolean) {
  const id = setInterval(() => {
    if (fn()) clearInterval(id)
  }, 100)
}
until(() => {
  if (!tldraw.value || !tldraw.value.clientWidth || !tldraw.value.clientHeight) return false
  container.value = { width: tldraw.value.clientWidth, height: tldraw.value.clientHeight }
  return true
})
function onDone(blob) {
  const reader = new FileReader()
  reader.onloadend = () => (photo.value.src = reader.result)
  reader.readAsDataURL(blob)
}
function onChange(e) {
  const file = e.target.files[0]
  const reader = new FileReader()
  const image = new Image()
  reader.onload = () => {
    image.src = reader.result as string
    image.onload = () => {
      photo.value = { src: image.src, width: image.width, height: image.height, type: file.type }
    }
  }
  reader.readAsDataURL(file)
}
window.onDone = onDone
</script>
