<template>
    <div class="modes-view">
      <h1>Выберите режим</h1>
      <div class="mode-buttons">
        <button @click="startQuiz('easy')">Легкий</button>
        <button @click="startQuiz('medium')">Средний</button>
        <button @click="startQuiz('hard')">Сложный</button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      startQuiz(mode) {
        this.$router.push(`/quiz/${mode}`)
      }
    }
  }
  </script>
  
  <style scoped>
  .modes-view {
    padding: 20px;
    text-align: center;
  }
  
  .mode-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 300px;
    margin: 20px auto;
  }
  
  .mode-buttons button {
    padding: 15px 20px;
    font-size: 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .mode-buttons button:nth-child(1) {
    background-color: #4CAF50;
    color: white;
  }
  
  .mode-buttons button:nth-child(2) {
    background-color: #FFC107;
    color: black;
  }
  
  .mode-buttons button:nth-child(3) {
    background-color: #F44336;
    color: white;
  }
  
  .mode-buttons button:hover {
    opacity: 0.9;
  }
  </style>