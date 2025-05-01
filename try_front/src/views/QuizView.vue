<template>
  <div>
    <h1>{{ modeTitle }}</h1>

    <!-- Кнопка запуска -->
    <div v-if="!quizStarted">
      <button @click="startQuiz">Начать {{ modeTitle }}</button>
    </div>

    <!-- Ошибка -->
    <div v-if="loadError">
      <p style="color: red;">{{ loadError }}</p>
    </div>

    <!-- Вопрос -->
    <div v-if="word">
      <p><strong>Английское слово:</strong> {{ word.word_eng }}</p>

      <div v-if="isSpecialMode" class="options-grid">
        <button
          v-for="(option, index) in word.options"
          :key="index"
          :disabled="answered"
          @click="submitAnswer(option)"
          class="option-button"
        >
          {{ option }}
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
  props: {
    mode: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      tg_id: null,
      word: null,
      answered: false,
      feedback: '',
      loadError: '',
      loading: false,
      quizStarted: false
    }
  },
  computed: {
    isSpecialMode() {
      return ['easy', 'medium', 'hard'].includes(this.mode)
    },
    modeTitle() {
      const titles = {
        easy: 'Легкий режим',
        medium: 'Средний режим',
        hard: 'Сложный режим'
      }
      return titles[this.mode] || 'Вопрос дня'
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

      try {
        const url = this.isSpecialMode 
          ? `/api/quiz/${this.mode}/${this.tg_id}`
          : `/api/quiz/${this.tg_id}`

        const { data } = await axios.get(url)
        
        if (data.error) {
          this.loadError = data.error
          return
        }
        
        this.word = data
      } catch (e) {
        this.loadError = 'Не удалось загрузить вопрос'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async submitAnswer(selectedOption) {
      this.answered = true
      
      if (this.isSpecialMode) {
        try {
          const response = await axios.post(`/api/quiz/${this.mode}/answer`, {
            tg_id: this.tg_id,
            word_id: this.word.word_id,
            selected_option: selectedOption
          })

          this.feedback = response.data.correct 
            ? 'Правильно! 🎉' 
            : 'Неправильно 😕'

          if (response.data.next && Object.keys(response.data.next).length > 0) {
            setTimeout(() => {
              this.word = response.data.next
              this.answered = false
            }, 1500)
          } else {
            setTimeout(() => {
              this.quizStarted = false
              this.word = null
            }, 2000)
          }
        } catch (e) {
          console.error('Ошибка ответа:', e)
        }
      } else {
        // Старая логика для обычного режима
        const isCorrect = selectedOption === this.word.word_rus
        this.feedback = isCorrect
          ? 'Правильно! 🎉'
          : `Неправильно 😕. Правильный ответ: ${this.word.word_rus}`

        try {
          await axios.post('/api/answer', {
            tg_id: this.tg_id,
            word_id: this.word.word_id,
            was_in_repeat: this.word.was_in_repeat
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
}
</script>

<style scoped>
.options-grid {
  display: grid;
  gap: 12px;
  margin: 20px 0;
}

.option-button {
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ddd;
  background-color: #f8f9fa;
  font-size: 16px;
  transition: all 0.2s;
}

.option-button:disabled {
  opacity: 0.7;
}

.option-button:not(:disabled):hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

button {
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 8px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #0056b3;
}
</style>