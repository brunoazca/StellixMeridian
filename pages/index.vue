<template>
  <div class="app">
    <main class="main">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <img src="/images/logo+nome.svg" alt="Stellix" class="logo" />
            
          </div>
          <Dropdown v-if="isWalletConnected" v-model="selectedNetwork" class="network-dropdown" />
        </div>

        <!-- Not Connected State -->
        <WalletConnect v-if="!isWalletConnected" />

        <!-- Connected State -->
        <div v-else class="connected-state">
          <!-- Available Balance Section -->
          <div class="balance-section">
            <h2 class="balance-label">Available Balance</h2>
            <div class="balance-amount">
              <span class="balance-value">{{ formatBalance(xlmBalance) }}</span>
              <span class="balance-currency"> XLM</span>
            </div>
            <div class="balance-fiat">{{ formatBRL(xlmBalanceBRL) }}</div>
            <button class="merit-tokens-button">
              <img src="/images/MERIT.png" alt="MERIT Token" class="merit-icon" />
              {{ formatMeritBalance(meritBalance) }} Merit Tokens
            </button>
          </div>

          <!-- PIX Monitoring Status -->
          <div class="pix-monitoring-section">
            <div class="monitoring-status">
              <div class="status-indicator" :class="{ active: isMonitoring }">
                <span class="status-dot"></span>
                <span class="status-text">
                  {{ isMonitoring ? 'Monitoring PIX' : 'PIX Monitoring Off' }}
                </span>
              </div>
              <div v-if="receivedPIXNotifications.length > 0" class="notifications-badge">
                {{ receivedPIXNotifications.length }}
              </div>
            </div>
            <div v-if="monitoringError" class="monitoring-error">
              ⚠️ {{ monitoringError }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="pay-button" @click="openPayPix">
              <img src="/images/qr-code.svg" alt="QR Code" class="button-icon" />
              Pay
            </button>
            <button class="receive-button" @click="openMakePix">
              <img src="/images/receive.svg" alt="Receive" class="button-icon" />
              Receive
            </button>
          </div>

          <!-- Development Tools -->
          <div class="dev-tools">
            <h3 class="dev-title">Development Tools</h3>
            <button class="dev-button" @click="simulatePixTransaction()">
              🧪 Simulate PIX Transaction
            </button>
            <p class="dev-note">Simulates a PIX transaction with MERIT transfers</p>
          </div>

          <!-- Wallet Info Section -->
          <div class="wallet-info-section">
            <div class="wallet-status">
              <span class="wallet-label">Wallet</span>
              <div class="status-group">
                <span class="status-indicator"></span>
                <span class="status-text">Connected</span>
              </div>
            </div>
            <button class="copy-address-button" @click="copyAddress">
              Copy Address
            </button>
            <button @click="disconnectFreighter" class="disconnect-button">
              Disconnect
            </button>
          </div>
        </div>

        <!-- PIX Modals -->
        <PIXModals 
          :show-make-pix="false"
          :show-pay-pix="false"
          :is-processing-pix="isProcessingPix"
          @close-make-pix="closeMakePix"
          @close-pay-pix="closePayPix"
          @pix-success="handleMakePixSuccess"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'
import { useFreighter } from '~/composables/useFreighter'
import { useXLMBalance } from '~/composables/useXLMBalance'
import { useMeritTokens } from '~/composables/useMeritTokens'
import { usePIX } from '~/composables/usePIX'
import { usePIXMonitoring } from '~/composables/usePIXMonitoring'
import WalletConnect from '~/components/WalletConnect.vue'
import WalletInfo from '~/components/WalletInfo.vue'
import NetworkSelector from '~/components/NetworkSelector.vue'
import BalanceDisplay from '~/components/BalanceDisplay.vue'
import PIXActions from '~/components/PIXActions.vue'
import PIXModals from '~/components/PIXModals.vue'
import Dropdown from '~/components/Dropdown.vue'

// Composables
const { isWalletConnected, disconnectFreighter, address, currentNetwork, switchToNetwork } = useFreighter()
const { xlmBalance, xlmBalanceBRL, formatBalance, formatBRL } = useXLMBalance()
const { meritBalance, formatMeritBalance } = useMeritTokens()

// Network selection
const selectedNetwork = ref(currentNetwork.value || 'TESTNET')

// Debug: verificar se isWalletConnected está mudando
watch(isWalletConnected, (newValue) => {
  console.log('🔄 isWalletConnected mudou para:', newValue)
}, { immediate: true })

// Watch for network changes
watch(currentNetwork, (newNetwork) => {
  selectedNetwork.value = newNetwork
  console.log('🌐 Rede mudou para:', newNetwork)
})

// Watch for dropdown changes
watch(selectedNetwork, async (newNetwork) => {
  if (newNetwork !== currentNetwork.value) {
    console.log('🔄 Trocando rede via dropdown:', newNetwork)
    await switchToNetwork(newNetwork)
  }
})
const { 
  isProcessingPix, 
  openMakePix, 
  openPayPix, 
  closeMakePix, 
  closePayPix,
  handleMakePix
} = usePIX()

// PIX Monitoring
const { 
  isMonitoring, 
  receivedPIXNotifications, 
  error: monitoringError,
  startMonitoring,
  stopMonitoring,
  clearNotifications,
  simulatePixTransaction
} = usePIXMonitoring()

// Methods
const copyAddress = async () => {
  if (address.value) {
    try {
      await navigator.clipboard.writeText(address.value)
      console.log('✅ Endereço copiado:', address.value)
    } catch (error) {
      console.error('❌ Erro ao copiar endereço:', error)
    }
  }
}

const handleMakePixSuccess = async (type, data) => {
  if (type === 'make') {
    await handleMakePix(data)
  }
  // Pay PIX now navigates directly to /pay page, then to confirm-payment
}

// Meta tags
useHead({
  title: 'Stellix - PIX com Stellar XLM',
  meta: [
    { name: 'description', content: 'Faça PIX usando Stellar XLM com Freighter Wallet' }
  ]
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --pix: #31BCAD;
  --dark-blue: #1B2A41;
  --accent-blue: #3068BF;
  --white: #F5F7FA;
  --light-gray: #A0A8B8;
  --dark-gray: #1E1E1E;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  background: #262626;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  background: #262626;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: white;
  margin: 0;
  padding: 0;
}

.main {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 3rem;
}

.container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.logo {
  height: 60px;
  width: auto;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.network-dropdown {
  flex-shrink: 0;
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

/* Balance Section */
.balance-section {
  text-align: center;
  margin-bottom: 2rem;
}

.balance-label {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  color: var(--white);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.balance-amount {
  font-family: 'Inter', sans-serif;
  font-size: 2.5rem;
  color: var(--white);
  margin: 0 0 0.5rem 0;
}

.balance-value {
  font-weight: 600;
}

.balance-currency {
  font-weight: 400;
  font-size: 0.8em;
}

.balance-fiat {
  font-family: 'Inter', sans-serif;
  font-size: 1.2rem;
  color: var(--pix);
  margin: 0 0 1.5rem 0;
  font-weight: 600;
}

.merit-tokens-button {
  background: transparent;
  border: 1px solid var(--pix);
  color: var(--pix);
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  font-size: 0.9rem;
}

.merit-tokens-button:hover {
  background: rgba(49, 188, 173, 0.1);
}

.merit-icon {
  height: 20px;
  width: auto;
  object-fit: contain;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pay-button, .receive-button {
  width: 100%;
  padding: 1.25rem 2rem;
  border-radius: 0.75rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  border: none;
}

.pay-button {
  background: var(--pix);
  color: var(--white);
}

.pay-button:hover {
  background: rgba(49, 188, 173, 0.8);
  transform: translateY(-2px);
}

.receive-button {
  background: var(--white);
  color: var(--accent-blue);
}

.receive-button:hover {
  background: var(--light-gray);
  color: var(--accent-blue);
  transform: translateY(-2px);
}

.button-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* PIX Monitoring Section */
.pix-monitoring-section {
  background: #000000;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1rem;
}

.monitoring-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
  transition: all 0.3s ease;
}

.status-indicator.active .status-dot {
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-text {
  font-family: 'Inter', sans-serif;
  color: var(--white);
  font-weight: 500;
  font-size: 0.9rem;
}

.notifications-badge {
  background: var(--pix);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  animation: bounce 1s infinite;
}

.monitoring-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  font-family: 'Inter', sans-serif;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

/* Wallet Info Section */
.wallet-info-section {
  background: #000000;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wallet-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.wallet-label {
  font-family: 'Inter', sans-serif;
  color: var(--white);
  font-weight: 500;
}

.status-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

.status-text {
  font-family: 'Inter', sans-serif;
  color: var(--white);
  font-weight: 500;
}

.copy-address-button {
  background: rgba(49, 188, 173, 0.5);
  color: #31BCAD;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-align: center;
}

.copy-address-button:hover {
  background: rgba(49, 188, 173, 0.7);
  transform: translateY(-1px);
}

.disconnect-button {
  background: rgba(232, 80, 53, 0.2);
  color: #E85035;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  text-align: center;
}

.disconnect-button:hover {
  background: rgba(232, 80, 53, 0.3);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .main {
    padding: 1rem 1.5rem;
  }
  
  .header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  
  .header-left {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }
  
  .logo {
    height: 50px;
  }
  
  .network-dropdown {
    flex-shrink: 0;
  }
  
  .balance-amount {
    font-size: 2rem;
  }
  
  .balance-fiat {
    font-size: 1rem;
  }
  
  .pay-button, .receive-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

/* Development Tools Styles */
.dev-tools {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
}

.dev-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #8b5cf6;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.dev-button {
  width: 100%;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid #8b5cf6;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 500;
  color: #8b5cf6;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;
}

.dev-button:hover {
  background: rgba(139, 92, 246, 0.3);
  transform: translateY(-1px);
}

.dev-button:active {
  transform: translateY(0);
}

.dev-note {
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: #8b5cf6;
  text-align: center;
  margin: 0;
  opacity: 0.8;
}
</style>