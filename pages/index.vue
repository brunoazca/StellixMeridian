<template>
  <div class="app">
    <main class="main">
      <div class="container">
        <div class="header">
          <img src="/favicon.ico" alt="StellixMeridian" width="80" height="80" />
          <h1>StellixMeridian</h1>
          <p>AppKit Wagmi Vue Example</p>
        </div>

        <!-- AppKit Button -->
        <div class="appkit-section">
          <appkit-button />
        </div>

        <!-- Action Buttons -->
        <ActionButtons />

        <!-- Project ID Info -->
        <div class="advice">
          <p>
            Este projectId funciona apenas no localhost. <br/>
            Vá para <a href="https://dashboard.reown.com" target="_blank" class="link-button">Reown Dashboard</a> para obter o seu próprio.
          </p>
        </div>

        <!-- Info Display -->
        <InfoDisplay />
      </div>
    </main>
  </div>
</template>

<script setup>
import ActionButtons from '~/components/ActionButtons.vue'
import InfoDisplay from '~/components/InfoDisplay.vue'

// Meta tags
useHead({
  title: 'StellixMeridian - AppKit Wagmi Vue Example',
  meta: [
    { name: 'description', content: 'Exemplo completo do AppKit com Wagmi e Vue.js' }
  ]
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #7c2d12 50%, #312e81 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: white;
}

.main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 1rem;
}

.header img {
  margin-bottom: 1rem;
  border-radius: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 1.2rem;
  color: #dbeafe;
  margin: 0;
}

.appkit-section {
  margin: 1rem 0;
}

.advice {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  max-width: 500px;
}

.advice p {
  margin: 0;
  color: #dbeafe;
  font-size: 0.9rem;
  line-height: 1.5;
}

.link-button {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-button:hover {
  color: #3b82f6;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .header p {
    font-size: 1rem;
  }
  
  .advice {
    max-width: 100%;
  }
}
</style>