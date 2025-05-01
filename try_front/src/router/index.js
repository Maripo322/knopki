import { createRouter, createWebHistory } from 'vue-router'
import QuizView from '../views/QuizView.vue'
import StatsView from '../views/StatsView.vue'

const routes = [
  { path: '/', component: QuizView },
  { path: '/stats', component: StatsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
