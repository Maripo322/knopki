<template>
  <div id="app">
    <div class="status-bar">
      <span :class="{ connected: isConnected, disconnected: !isConnected }">
        {{ isConnected ? '🟢 Бэкенд подключен' : '🔴 Нет подключения к API' }}
      </span>
    </div>

    <router-view />

    <nav class="bottom-nav">
      <button @click="goTo('/')">Вопрос</button>
      <button @click="goTo('/stats')">Статистика</button>
      <button @click="goTo('/modes')">Режимы</button>
    </nav>
  </div>
</template>

<script>
import axios from 'axios'
import { useRouter } from 'vue-router'

export default {
  data() {
    return {
      isConnected: false
    }
  },
  mounted() {
    axios.get('/')
      .then(res => this.isConnected = res.status === 200)
      .catch(err => {
        this.isConnected = false
        console.error('Ошибка подключения к API:', err)
      })
  },
  methods: {
    goTo(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  padding-bottom: 60px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #2c3e50;
}

.status-bar {
  margin-bottom: 12px;
  font-weight: bold;
}

.connected {
  color: green;
}

.disconnected {
  color: red;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #f0f0f0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid #ccc;
}

.bottom-nav button {
  flex: 1;
  height: 100%;
  border: none;
  background: none;
  font-size: 16px;
}
</style>