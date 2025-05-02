<template>
    <div>
      <h1>Режим: {{ modeLabel }}</h1>
      
      <div v-if="!quizStarted">
        <button @click="startQuiz">Начать квиз</button>
      </div>
  
      <div v-if="loading">Загрузка...</div>
      
      <div v-if="currentQuiz">
        <div class="quiz-content">
          <p><strong>Слово:</strong> {{ currentQuiz.word_eng }}</p>
          <div class="options">
            <button
              v-for="(option, index) in currentQuiz.options"
              :key="index"
              @click="submitAnswer(option)"
              :disabled="answered"
            >
              {{ option }}
            </button>
          </div>
          <p v-if="feedback">{{ feedback }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  
  export default {
    data() {
      return {
        tg_id: null,
        mode: null,
        currentQuiz: null,
        quizStarted: false,
        loading: false,
        answered: false,
        feedback: ''
      }
    },
    computed: {
      modeLabel() {
        const labels = {
          easy: 'Легкий',
          medium: 'Средний',
          hard: 'Сложный'
        }
        return labels[this.mode] || ''
      }
    },
    mounted() {
      this.tg_id = localStorage.getItem('tg_id')
      this.mode = this.$route.params.mode
    },
    methods: {
      async startQuiz() {
        this.quizStarted = true
        this.loading = true
        try {
          const response = await axios.get(`/api/quiz/${this.mode}/${this.tg_id}`)
          this.currentQuiz = response.data
        } catch (error) {
          console.error('Ошибка загрузки квиза:', error)
        }
        this.loading = false
      },
  
      async submitAnswer(selectedOption) {
        this.answered = true
        try {
          const response = await axios.post(`/api/quiz/${this.mode}/answer`, {
            tg_id: this.tg_id,
            word_id: this.currentQuiz.word_id,
            selected_option: selectedOption
          })
          
          this.feedback = response.data.correct ? '✅ Правильно!' : '❌ Неправильно'
          
          if (response.data.next) {
            this.currentQuiz = response.data.next
          } else {
            this.quizStarted = false
          }
        } catch (error) {
          console.error('Ошибка отправки ответа:', error)
        }
        this.answered = false
      }
    }
  }
  </script>
  
  <style scoped>
  .options {
    display: grid;
    gap: 10px;
    margin-top: 20px;
  }
  
  .options button {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: white;
  }
  
  .options button:disabled {
    opacity: 0.7;
  }
  </style>