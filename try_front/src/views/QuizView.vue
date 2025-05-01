<template>
  <div>
    <h1>Вопрос дня</h1>

    <!-- Кнопка запуска -->
    <div v-if="!quizStarted">
      <button @click="startQuiz">Начать</button>
    </div>

    <!-- Ошибка -->
    <div v-if="loadError">
      <p style="color: red;">{{ loadError }}</p>
    </div>

    <!-- Вопрос -->
    <div v-if="word">
      <p><strong>Английское слово:</strong> {{ word.word_eng }}</p>
      <p><strong>Повторение:</strong> {{ word.was_in_repeat ? 'Да' : 'Нет' }}</p>

      <div class="options">
        <button
          v-for="opt in options"
          :key="opt.word_id"
          :disabled="answered"
          @click="submitAnswer(opt)"
        >
          {{ opt.word_rus }}
        </button>
      </div>

      <p v-if="answered"><strong>{{ feedback }}</strong></p>
    </div>

    <!-- Загрузка -->
    <div v-else-if="loading">
      <p>Загрузка...</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      tg_id: null,
      word: null,
      options: [],
      answered: false,
      feedback: '',
      loadError: '',
      loading: false,
      quizStarted: false
    }
  },
  mounted() {
    this.tg_id = localStorage.getItem('tg_id')
    if (!this.tg_id) {
      this.loadError = 'Ошибка: tg_id не найден.'
    }
  },
  methods: {
    async startQuiz() {
      this.quizStarted = true
      this.loading = true
      this.answered = false
      this.feedback = ''
      this.word = null
      this.options = []

      try {
        const { data } = await axios.get(`/api/quiz/${this.tg_id}`)
        if (data.error) {
          this.loadError = data.error
          return
        }
        if (!data.word || !Array.isArray(data.options)) {
          this.loadError = 'Неправильный формат ответа от API.'
          return
        }
        this.word = data.word
        this.options = data.options
      } catch (e) {
        this.loadError = 'Не удалось загрузить вопрос.'
        console.error(e)
      } finally {
        this.loading = false
      }
    },
    async submitAnswer(opt) {
      this.answered = true
      const isCorrect = opt.word_id === this.word.word_id
      this.feedback = isCorrect
        ? 'Правильно! 🎉'
        : `Неправильно 😕. Правильный ответ: ${this.word.word_rus}`

      try {
        await axios.post('/api/answer', {
          tg_id: this.tg_id,
          word_id: this.word.word_id,
          was_in_repeat: this.word.was_in_repeat,
          is_correct: isCorrect
        })
      } catch (e) {
        console.error('Ошибка при отправке ответа:', e)
      }

      setTimeout(() => {
        this.word = null
        this.feedback = ''
        this.answered = false
        this.startQuiz()
      }, 2000)
    }
  }
}
</script>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}
.options button {
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 16px;
}
.options button:disabled {
  opacity: 0.6;
}
button {
  padding: 10px 20px;
  font-size: 18px;
}
</style>
