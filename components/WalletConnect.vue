<template>
  <div class="not-connected-state">
    <div class="connect-card">
      <div class="connect-icon">
        <img src="/images/wallet.svg" alt="Wallet" class="wallet-icon" />
      </div>
      <h2>Connect your Wallet</h2>
      <p>Connect your Freighter wallet to start using PIX with XLM.</p>
      
      <button 
        @click="connectFreighter" 
        :disabled="isConnecting"
        class="connect-button"
      >
        <span v-if="isConnecting" class="loading-spinner">⏳</span>
        <img v-else src="/images/chain.svg" alt="Chain" class="button-icon" />
        {{ isConnecting ? 'Conectando...' : 'Connect Freighter' }}
      </button>

      <div class="install-hint">
        <a href="https://freighter.app" target="_blank" class="install-link">
          <img src="/images/receive.svg" alt="Install" class="button-icon" />
          Need a Freighter? Install now
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
.not-connected-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.connect-card {
  background: #17181A;
  border: none;
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  max-width: 400px;
}

.connect-icon {
  background: rgba(49, 188, 173, 0.1);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.wallet-icon {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.connect-card h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  color: white;
}

.connect-card p {
  font-family: 'Montserrat', sans-serif;
  color: #A0A8B8;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.connect-button {
  background: var(--pix);
  border: none;
  color: white;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 400;
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

.button-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.connect-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.install-hint {
  margin-top: 1rem;
}

.install-link {
  background: rgba(48, 104, 191, 0.1);
  border: none;
  color: var(--accent-blue);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-size: 0.9rem;
}

.install-link:hover {
  background: rgba(48, 104, 191, 0.2);
  transform: translateY(-1px);
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
