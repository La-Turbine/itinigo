<template>
  <div class="w-full h-full">
    <video ref="videoRef" autoplay playsinline muted class="w-full h-full object-cover"></video>
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let stream: MediaStream | null = null

const startCamera = async () => {
  if (!videoRef.value) return
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: videoRef.value.clientWidth }, height: { ideal: videoRef.value.clientHeight } },
      audio: false,
    })
    videoRef.value.srcObject = stream
  } catch (err) {
    console.error("Error accessing camera:", err)
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
}

const capturePhoto = (): Promise<Blob | null> => {
  return new Promise((resolve) => {
    if (!videoRef.value || !canvasRef.value) {
      resolve(null)
      return
    }

    const video = videoRef.value
    const canvas = canvasRef.value

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(null)
      return
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(
      (blob) => {
        resolve(blob)
      },
      "image/jpeg",
      0.95,
    )
  })
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
})

defineExpose({
  capturePhoto,
})
</script>
