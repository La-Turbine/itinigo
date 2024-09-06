<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Trajets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$state.mode = $state.mode === 'helper' ? 'user' : 'helper'">
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
    <!-- <div style="display: flex; height: 100px">
      <input style="width: 100px" type="file" @change="onChange" />
      <div style="width: 100px">{{ photo.width }} / {{ photo.height }} / {{ photo.type }} {{ screen.width }} / {{ screen.height }}</div>
      <img style="height: 100px" :src="photo.src" />
    </div>
    <div style="height: 100%; width: 100%" v-html="html"></div> -->
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
canvas.width = 100
canvas.height = 1000
const ctx = canvas.getContext("2d")
ctx.fillStyle = "pink"
ctx.fillRect(0, 0, 100, 1000)
const base64 = canvas.toDataURL("image/png")
const svg = `<svg width="100" height="1000" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,0 100,500 50,1000 0,500" fill="red" />
</svg>`

import { ref, computed } from "vue"
const screen = { width: window.innerWidth, height: window.innerHeight }
const photo = ref({ src: base64, width: 100, height: 1000, type: "image/png" })
const html = computed(() => {
  const attr = { image: photo.value, "on-done": "onDone" }
  const attrStr = Object.entries(attr)
    .map(([k, v]) => `${k}='${typeof v === "string" ? v : JSON.stringify(v)}'`)
    .join(" ")
  return `<wc-tldraw ${attrStr}></wc-tldraw>`
})
function onDone(blob) {
  const reader = new FileReader()
  reader.onloadend = () => {
    photo.value.src = reader.result
  }
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
