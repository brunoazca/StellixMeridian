<template>
  <div class="not-connected-state">
    <div class="connect-card">
      <div class="connect-icon">🔗</div>
      <h2>Conecte sua Carteira</h2>
      <p>Conecte sua carteira Freighter para começar a usar PIX com XLM</p>
      
      <button 
        @click="connectFreighter" 
        :disabled="isConnecting"
        class="connect-button"
      >
        <span v-if="isConnecting" class="loading-spinner">⏳</span>
        <span v-else>🔗</span>
        {{ isConnecting ? 'Conectando...' : 'Conectar Freighter' }}
      </button>

      <div class="install-hint">
        <p>Não tem o Freighter?</p>
        <a href="https://freighter.app" target="_blank" class="install-link">
          📥 Instalar Freighter
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFreighter } from '~/composables/useFreighter'

const { isConnecting, connectFreighter } = useFreighter()
</script>

<style scoped>
.not-connected-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.connect-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
}

.connect-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.connect-card h2 {
  font-size: 1.8rem;
  margin: 0 0 1rem 0;
  color: white;
}

.connect-card p {
  color: #dbeafe;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.connect-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto 1.5rem;
}

.connect-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.install-hint {
  color: #94a3b8;
  font-size: 0.9rem;
}

.install-link {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.install-link:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .connect-card {
    padding: 2rem;
  }
}
</style>
