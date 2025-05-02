<template>
  <div class="modes-view">
    <h1>Выберите режим</h1>
    <div class="mode-buttons">
      <button 
        v-for="mode in modes" 
        :key="mode.id"
        @click="selectMode(mode.id)"
      >
        {{ mode.label }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      modes: [
        { id: 'easy', label: 'Легкий' },
        { id: 'medium', label: 'Средний' },
        { id: 'hard', label: 'Сложный' }
      ]
    }
  },
  methods: {
    selectMode(mode) {
      this.$router.push(`/quiz/${mode}`)
    }
  }
}
</script>

<style scoped>
.mode-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.mode-buttons button {
  padding: 15px;
  font-size: 18px;
  border-radius: 8px;
  background: #f0f0f0;
  border: 1px solid #ccc;
}
</style>