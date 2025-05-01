<template>
  <div>
    <h2>Статистика</h2>
    <p>Выучено слов: {{ stats.learnedCount }}</p>
    <p>В повторении: {{ stats.repeatCount }}</p>
    <button @click="goBack">Назад</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const stats = ref({})
const router = useRouter()
const tgId = window.Telegram.WebApp.initDataUnsafe?.user?.id

onMounted(async () => {
  const res = await fetch(`/api/stats/${tgId}`)
  stats.value = await res.json()
})

const goBack = () => {
  router.push('/')
}
</script>
