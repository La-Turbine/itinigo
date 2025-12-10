<template>
  <div class="h-full w-full">
    <video ref="videoRef" autoplay playsinline muted class="h-full w-full object-cover"></video>
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const videoRef = ref<HTMLVideoElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let stream: MediaStream | null = null

const startCamera = async () => {
  const result = await navigator.permissions.query({ name: "camera" })
  if (result.state === "denied") return console.warn("Camera access denied by user")

  if (!videoRef.value) return
  try {
    // NOTE: specifying width=4096 and height=3072 here will not work on iOS
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 3840 }, height: { ideal: 2160 } },
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

    // Get the display aspect ratio
    const displayAspectRatio = video.clientWidth / video.clientHeight
    const videoAspectRatio = video.videoWidth / video.videoHeight

    let sourceX = 0
    let sourceY = 0
    let sourceWidth = video.videoWidth
    let sourceHeight = video.videoHeight

    // Crop the video to match display aspect ratio (mimicking object-cover)
    if (videoAspectRatio > displayAspectRatio) {
      // Video is wider, crop sides
      sourceWidth = video.videoHeight * displayAspectRatio
      sourceX = (video.videoWidth - sourceWidth) / 2
    } else {
      // Video is taller, crop top/bottom
      sourceHeight = video.videoWidth / displayAspectRatio
      sourceY = (video.videoHeight - sourceHeight) / 2
    }

    // Set canvas to high resolution with correct aspect ratio
    canvas.width = 4096
    canvas.height = 4096 / displayAspectRatio

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(null)
      return
    }

    // Draw the cropped portion of the video onto the canvas
    ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 1.0)
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
