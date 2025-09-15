<template>
  <div class="app">
    <main class="main">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="/favicon.ico" alt="Stellix" width="80" height="80" />
          <h1>Stellix</h1>
          <p>PIX com Stellar XLM</p>
        </div>

        <!-- Not Connected State -->
        <WalletConnect v-if="!isWalletConnected" />

        <!-- Connected State -->
        <div v-else class="connected-state">
          <!-- Wallet Info -->
          <WalletInfo />

          <!-- XLM Balance -->
          <BalanceDisplay />

          <!-- PIX Actions -->
          <PIXActions 
            @make-pix="openMakePix"
            @pay-pix="openPayPix"
          />

          <!-- Disconnect Button -->
          <button @click="disconnectFreighter" class="disconnect-button">
            🔌 Desconectar
          </button>
        </div>

        <!-- PIX Modals -->
        <PIXModals 
          :show-make-pix="showMakePix"
          :show-pay-pix="showPayPix"
          :is-processing-pix="isProcessingPix"
          @close-make-pix="closeMakePix"
          @close-pay-pix="closePayPix"
          @pix-success="handlePIXSuccess"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { useFreighter } from '~/composables/useFreighter'
import { usePIX } from '~/composables/usePIX'
import WalletConnect from '~/components/WalletConnect.vue'
import WalletInfo from '~/components/WalletInfo.vue'
import BalanceDisplay from '~/components/BalanceDisplay.vue'
import PIXActions from '~/components/PIXActions.vue'
import PIXModals from '~/components/PIXModals.vue'

// Composables
const { isWalletConnected, disconnectFreighter } = useFreighter()

// Debug: verificar se isWalletConnected está mudando
watch(isWalletConnected, (newValue) => {
  console.log('🔄 isWalletConnected mudou para:', newValue)
}, { immediate: true })
const { 
  showMakePix, 
  showPayPix, 
  isProcessingPix, 
  openMakePix, 
  openPayPix, 
  closeMakePix, 
  closePayPix,
  handleMakePix,
  handlePayPix
} = usePIX()

// Methods
const handlePIXSuccess = async (type, data) => {
  if (type === 'make') {
    await handleMakePix(data)
  } else if (type === 'pay') {
    await handlePayPix(data)
  }
}

// Meta tags
useHead({
  title: 'Stellix - PIX com Stellar XLM',
  meta: [
    { name: 'description', content: 'Faça PIX usando Stellar XLM com Freighter Wallet' }
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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2rem;
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

/* Connected State */
.connected-state {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Disconnect Button */
.disconnect-button {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.disconnect-button:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-2px);
}

/* Responsive */
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
}
</style>