import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

const app = createApp(App)

axios.defaults.baseURL = 'https://bug-free-potato-5grgp5j66xxvcp7w5-8000.app.github.dev/'

const tg = window.Telegram.WebApp
tg.ready()  // даём Телеграму инициализироваться

// Сохраняем tg_id в localStorage при старте
if (tg.initDataUnsafe?.user?.id) {
  localStorage.setItem('tg_id', tg.initDataUnsafe.user.id)
} else {
  console.warn('Telegram WebApp initDataUnsafe.user.id отсутствует')
}

app.use(router)
app.mount('#app')
