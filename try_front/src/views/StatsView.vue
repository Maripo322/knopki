<template>
  <div>
    <h1>Статистика</h1>

    <div v-if="loadError">
      <p style="color: red;">{{ loadError }}</p>
    </div>

    <div v-else-if="stats">
      <p>Изучено слов: {{ stats.learnedCount }}</p>
      <p>В повторении: {{ stats.repeatCount }}</p>
    </div>

    <div v-else>
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
      stats: null,
      loadError: ''
    }
  },
  async mounted() {
    this.tg_id = localStorage.getItem('tg_id')
    if (!this.tg_id) {
      this.loadError = 'Ошибка: tg_id не найден.'
      return
    }
    try {
      const res = await axios.get(`/api/stats/${this.tg_id}`)
      this.stats = res.data
    } catch (e) {
      this.loadError = 'Не удалось получить статистику.'
      console.error(e)
    }
  }
}
</script>
