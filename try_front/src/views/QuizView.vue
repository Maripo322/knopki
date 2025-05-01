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
      <p v-if="!isSpecialMode"><strong>Повторение:</strong> {{ word.was_in_repeat ? 'Да' : 'Нет' }}</p>

      <!-- Общий блок для вариантов ответов -->
      <div class="options-grid">
        <button
          v-for="(option, index) in currentOptions"
          :key="index"
          :disabled="answered"
          @click="submitAnswer(option)"
          class="option-button"
        >
          {{ optionText(option) }}
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
      currentOptions: [],
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
    optionText(option) {
      return this.isSpecialMode ? option : option.word_rus
    },

    async startQuiz() {
      this.quizStarted = true
      this.loading = true
      this.answered = false
      this.feedback = ''
      this.word = null
      this.currentOptions = []

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
        // Формируем варианты ответов в зависимости от режима
        if (this.isSpecialMode) {
          this.currentOptions = data.options || []
        } else {
          // Для обычного режима создаем массив из правильного ответа и 3 случайных
          const allWords = await this.fetchRandomWords()
          const options = allWords
            .filter(w => w.word_id !== data.word_id)
            .slice(0, 3)
            .map(w => ({ word_rus: w.word_rus, word_id: w.word_id }))
          
          options.push({
            word_rus: data.word_rus,
            word_id: data.word_id
          })
          
          this.currentOptions = this.shuffleArray(options)
        }
      } catch (e) {
        this.loadError = 'Не удалось загрузить вопрос'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async fetchRandomWords() {
      try {
        const response = await axios.get('/api/words')
        return response.data
      } catch (e) {
        console.error('Ошибка загрузки слов:', e)
        return []
      }
    },

    shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5)
    },

    async submitAnswer(selectedOption) {
      this.answered = true
      
      if (this.isSpecialMode) {
        // Логика для специальных режимов
      } else {
        // Логика для обычного режима
        const isCorrect = selectedOption.word_id === this.word.word_id
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