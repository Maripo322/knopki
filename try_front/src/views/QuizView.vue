<template>
  <div>
    <h2>Вопрос дня</h2>
    <p v-if="quizData">{{ quizData.word_eng }}</p>
    <p v-else>Загрузка...</p>

    <div v-if="quizData">
      <button
        v-for="option in quizData.options"
        :key="option.word_id"
        @click="submitAnswer(option.word_id)"
      >
        {{ option.word_rus }}
      </button>
    </div>

    <button @click="goToStats" class="stats-button">Статистика</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const quizData = ref(null)
const router = useRouter()
const tgId = window.Telegram.WebApp.initDataUnsafe?.user?.id

onMounted(async () => {
  const res = await fetch(`/api/quiz/${tgId}`)
  quizData.value = await res.json()
})

const submitAnswer = async (selectedId) => {
  await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tg_id: tgId,
      word_id: quizData.value.word_id,
      was_in_repeat: quizData.value.was_in_repeat
    })
  })
  // Обновить или показать следующее слово
}

const goToStats = () => {
  router.push('/stats')
}
</script>

<style scoped>
.stats-button {
  margin-top: 20px;
  padding: 10px;
}
</style>
