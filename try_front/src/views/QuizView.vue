<template>
  <div>
    <h1>{{ modeTitle }}</h1>

    <!-- Кнопка запуска -->
    <div v-if="!quizStarted">
      <button @click="startQuiz" class="start-button">Начать {{ modeTitle }}</button>
    </div>

    <!-- Ошибка -->
    <div v-if="loadError">
      <p style="color: red;">{{ loadError }}</p>
      <button @click="retryLoading" class="retry-button">Попробовать снова</button>
    </div>

    <!-- Вопрос -->
    <div v-if="word">
      <p class="word-eng"><strong>Английское слово:</strong> {{ word.word_eng }}</p>
      
      <!-- Варианты ответов -->
      <div class="options-grid">
        <button
          v-for="(option, index) in word.options"
          :key="index"
          :disabled="answered"
          @click="submitAnswer(option)"
          :class="{
            'option-button': true,
            'correct-answer': answered && option === correctAnswer,
            'wrong-answer': answered && option !== correctAnswer && option === selectedAnswer
          }"
        >
          {{ option }}
        </button>
      </div>

      <!-- Результат ответа -->
      <div v-if="answered" class="feedback-container">
        <p :class="feedbackClass">{{ feedback }}</p>
        <div v-if="showNextButton" class="next-button-container">
          <button @click="loadNextQuestion" class="next-button">Следующий вопрос</button>
        </div>
      </div>
    </div>

    <!-- Загрузка -->
    <div v-else-if="loading">
      <p class="loading-text">Загрузка...</p>
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
      quizStarted: false,
      selectedAnswer: null,
      correctAnswer: null,
      hasNextQuestion: false
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
    },
    feedbackClass() {
      return {
        'correct-feedback': this.feedback.includes('Правильно'),
        'wrong-feedback': this.feedback.includes('Неправильно')
      }
    },
    showNextButton() {
      return this.isSpecialMode && this.hasNextQuestion
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
      try {
        this.quizStarted = true
        this.loading = true
        this.resetState()
        
        const url = this.isSpecialMode 
          ? `/api/quiz/${this.mode}/${this.tg_id}`
          : `/api/quiz/${this.tg_id}`

        const { data } = await axios.get(url)
        
        if (data.error) {
          this.handleError(data.error)
          return
        }
        
        this.word = this.prepareQuestionData(data)
      } catch (e) {
        this.handleError('Не удалось загрузить вопрос')
        console.error('Ошибка загрузки:', e)
      } finally {
        this.loading = false
      }
    },

    prepareQuestionData(data) {
      if (this.isSpecialMode) {
        return {
          ...data,
          options: data.options || []
        }
      }
      return data
    },

    async submitAnswer(selectedOption) {
      this.selectedAnswer = selectedOption
      this.answered = true

      if (this.isSpecialMode) {
        try {
          const response = await axios.post(`/api/quiz/${this.mode}/answer`, {
            tg_id: this.tg_id,
            word_id: this.word.word_id,
            selected_option: selectedOption
          })

          this.correctAnswer = this.word.options.find(opt => opt === this.word.word_rus)
          this.feedback = response.data.correct ? 'Правильно! 🎉' : 'Неправильно 😕'
          this.hasNextQuestion = !!response.data.next?.word_id

          if (!this.hasNextQuestion) {
            setTimeout(() => this.resetQuiz(), 2000)
          }
        } catch (e) {
          console.error('Ошибка ответа:', e)
          this.handleError('Ошибка при обработке ответа')
        }
      } else {
        // Логика для обычного режима
      }
    },

    async loadNextQuestion() {
      try {
        this.resetState()
        const { data } = await axios.get(`/api/quiz/${this.mode}/${this.tg_id}`)
        
        if (data.error) {
          this.handleError(data.error)
          return
        }
        
        this.word = this.prepareQuestionData(data)
      } catch (e) {
        this.handleError('Ошибка загрузки следующего вопроса')
        console.error(e)
      }
    },

    resetState() {
      this.answered = false
      this.feedback = ''
      this.selectedAnswer = null
      this.correctAnswer = null
      this.hasNextQuestion = false
      this.loadError = ''
    },

    resetQuiz() {
      this.quizStarted = false
      this.word = null
      this.resetState()
    },

    handleError(message) {
      this.loadError = message
      this.quizStarted = false
      this.word = null
      this.resetState()
    },

    retryLoading() {
      this.resetQuiz()
      this.startQuiz()
    }
  }
}
</script>

<style scoped>
.start-button {
  padding: 15px 30px;
  font-size: 18px;
  background: #4CAF50;
  color: white;
  border-radius: 25px;
  cursor: pointer;
  transition: transform 0.2s;
}

.start-button:hover {
  transform: scale(1.05);
  background: #45a049;
}

.options-grid {
  display: grid;
  gap: 15px;
  margin: 30px 0;
}

.option-button {
  padding: 20px;
  border-radius: 12px;
  font-size: 16px;
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  cursor: pointer;
  transition: all 0.2s;
}

.option-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.option-button:hover:not(:disabled) {
  background: #e9ecef;
  transform: translateY(-2px);
}

.correct-answer {
  background: #d4edda !important;
  border-color: #28a745 !important;
}

.wrong-answer {
  background: #f8d7da !important;
  border-color: #dc3545 !important;
}

.feedback-container {
  margin-top: 25px;
  text-align: center;
}

.correct-feedback {
  color: #28a745;
  font-size: 1.2em;
}

.wrong-feedback {
  color: #dc3545;
  font-size: 1.2em;
}

.next-button-container {
  margin-top: 20px;
}

.next-button {
  padding: 12px 25px;
  background: #007bff;
  color: white;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
}

.next-button:hover {
  background: #0056b3;
}

.loading-text {
  font-size: 1.2em;
  color: #6c757d;
  text-align: center;
  margin: 30px 0;
}

.retry-button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #ffc107;
  color: black;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.word-eng {
  font-size: 1.4em;
  color: #2c3e50;
  margin-bottom: 25px;
}
</style>