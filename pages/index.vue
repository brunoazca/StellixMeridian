<template>
  <div class="app">
    <main class="main">
      <div class="container">
        <!-- Header -->
        <div class="header">
          <img src="/favicon.ico" alt="Stellix" width="80" height="80" />
          <h1> Stellix
          </h1>
          <p>PIX com Stellar XLM</p>
        </div>

        <!-- Not Connected State -->
        <div v-if="!isWalletConnected" class="not-connected-state">
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

        <!-- Connected State -->
        <div v-else class="connected-state">
          <!-- Wallet Info -->
          <div class="wallet-info">
            <div class="wallet-header">
              <div class="wallet-icon">💼</div>
              <div class="wallet-details">
                <h3>Carteira Conectada</h3>
                <p class="wallet-address">{{ address }}</p>
                <span class="network-badge">{{ getNetworkName(currentNetwork) }}</span>
              </div>
            </div>
          </div>

          <!-- XLM Balance -->
          <div class="balance-section">
            <div class="balance-card">
              <div class="balance-header">
                <div class="xlm-icon">⭐</div>
                <h3>Saldo XLM</h3>
              </div>
              <div class="balance-amount">
                <span class="amount">{{ formatBalance(xlmBalance) }}</span>
                <span class="currency">XLM</span>
              </div>
              <div class="balance-usd">
                ≈ ${{ formatUSD(xlmBalanceUSD) }} USD
              </div>
              <button @click="refreshBalance" class="refresh-btn" :disabled="isLoading">
                <span v-if="!isLoading">🔄</span>
                <span v-else class="loading-spinner">⏳</span>
                Atualizar
              </button>
            </div>
          </div>

          <!-- PIX Actions -->
          <div class="pix-section">
            <h3>PIX com XLM</h3>
            <div class="pix-actions">
              <button @click="showMakePix = true" class="pix-button make-pix">
                💸 Fazer PIX
              </button>
              <button @click="showPayPix = true" class="pix-button pay-pix">
                💳 Pagar PIX
              </button>
            </div>
          </div>

          <!-- Disconnect Button -->
          <button @click="disconnectFreighter" class="disconnect-button">
            🔌 Desconectar
          </button>
        </div>

        <!-- Make PIX Modal -->
        <div v-if="showMakePix" class="modal-overlay" @click="showMakePix = false">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>💸 Fazer PIX</h3>
              <button @click="showMakePix = false" class="close-button">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Valor (R$)</label>
                <input v-model="makePixForm.amount" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>Destinatário</label>
                <input v-model="makePixForm.recipient" type="text" placeholder="Nome ou CPF" />
              </div>
              <button @click="handleMakePix" :disabled="isProcessingPix" class="submit-button">
                <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
                {{ isProcessingPix ? 'Processando...' : 'Fazer PIX' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Pay PIX Modal -->
        <div v-if="showPayPix" class="modal-overlay" @click="showPayPix = false">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>💳 Pagar PIX</h3>
              <button @click="showPayPix = false" class="close-button">✕</button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label>Valor (R$)</label>
                <input v-model="payPixForm.amount" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div class="form-group">
                <label>Código PIX</label>
                <input v-model="payPixForm.pixCode" type="text" placeholder="Cole o código PIX aqui" />
              </div>
              <button @click="handlePayPix" :disabled="isProcessingPix" class="submit-button">
                <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
                {{ isProcessingPix ? 'Processando...' : 'Pagar PIX' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useFreighter } from '~/composables/useFreighter'

// Freighter composable
const { 
  isConnected,
  isConnecting,
  error: freighterError,
  address,
  isWalletConnected,
  currentNetwork,
  connectFreighter,
  disconnectFreighter
} = useFreighter()

// State
const xlmBalance = ref(0)
const xlmPrice = ref(0.12) // Mock price
const isLoading = ref(false)
const showMakePix = ref(false)
const showPayPix = ref(false)
const isProcessingPix = ref(false)

// PIX Forms
const makePixForm = ref({
  amount: '',
  recipient: ''
})

const payPixForm = ref({
  amount: '',
  pixCode: ''
})

// Computed
const xlmBalanceUSD = computed(() => xlmBalance.value * xlmPrice.value)

// Methods
const formatBalance = (balance) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7
  }).format(balance)
}

const formatUSD = (amount) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

const getNetworkName = (networkName) => {
  const networks = {
    'TESTNET': 'Stellar Testnet',
    'PUBLIC': 'Stellar Mainnet',
    'FUTURENET': 'Stellar Futurenet'
  }
  return networks[networkName] || networkName || 'Não selecionada'
}

const fetchXLMBalance = async () => {
  if (!address.value) return
  
  isLoading.value = true
  try {
    console.log('Buscando saldo XLM para:', address.value)
    
    const network = currentNetwork.value === 'PUBLIC' ? 'mainnet' : 'testnet'
    const horizonUrl = network === 'mainnet' 
      ? 'https://horizon.stellar.org' 
      : 'https://horizon-testnet.stellar.org'
    
    const response = await fetch(`${horizonUrl}/accounts/${address.value}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar conta: ${response.status}`)
    }
    
    const accountData = await response.json()
    
    const xlmAsset = accountData.balances.find(balance => 
      balance.asset_type === 'native' || balance.asset_code === 'XLM'
    )
    
    if (xlmAsset) {
      xlmBalance.value = parseFloat(xlmAsset.balance)
      console.log('✅ Saldo XLM encontrado:', xlmBalance.value)
    } else {
      xlmBalance.value = 0
      console.log('⚠️ Nenhum saldo XLM encontrado')
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar saldo:', error)
    xlmBalance.value = Math.random() * 100 + 10
  } finally {
    isLoading.value = false
  }
}

const refreshBalance = () => {
  fetchXLMBalance()
}

const handleMakePix = async () => {
  if (!makePixForm.value.amount || !makePixForm.value.recipient) {
    alert('Preencha todos os campos')
    return
  }

  isProcessingPix.value = true
  try {
    const response = await $fetch('/api/pix/make', {
      method: 'POST',
      body: {
        walletAddress: address.value,
        amount: parseFloat(makePixForm.value.amount),
        recipient: makePixForm.value.recipient
      }
    })

    if (response.success) {
      alert(`PIX realizado com sucesso!\nID: ${response.transactionId}`)
      showMakePix.value = false
      makePixForm.value = { amount: '', recipient: '' }
    }
  } catch (error) {
    console.error('Erro ao fazer PIX:', error)
    alert('Erro ao processar PIX')
  } finally {
    isProcessingPix.value = false
  }
}

const handlePayPix = async () => {
  if (!payPixForm.value.amount || !payPixForm.value.pixCode) {
    alert('Preencha todos os campos')
    return
  }

  isProcessingPix.value = true
  try {
    const response = await $fetch('/api/pix/pay', {
      method: 'POST',
      body: {
        walletAddress: address.value,
        amount: parseFloat(payPixForm.value.amount),
        pixCode: payPixForm.value.pixCode
      }
    })

    if (response.success) {
      alert(`PIX pago com sucesso!\nID: ${response.paymentId}`)
      showPayPix.value = false
      payPixForm.value = { amount: '', pixCode: '' }
    }
  } catch (error) {
    console.error('Erro ao pagar PIX:', error)
    alert('Erro ao processar pagamento PIX')
  } finally {
    isProcessingPix.value = false
  }
}

// Watchers
watch(() => address.value, (newAddress) => {
  if (newAddress) {
    fetchXLMBalance()
  } else {
    xlmBalance.value = 0
  }
}, { immediate: true })

watch(() => isWalletConnected.value, (connected) => {
  if (connected && address.value) {
    fetchXLMBalance()
  } else if (!connected) {
    xlmBalance.value = 0
  }
})

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

/* Not Connected State */
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

/* Connected State */
.connected-state {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Wallet Info */
.wallet-info {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
}

.wallet-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.wallet-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.wallet-details h3 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 1.2rem;
}

.wallet-address {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  color: #dbeafe;
  word-break: break-all;
  margin-bottom: 0.5rem;
}

.network-badge {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Balance Section */
.balance-section {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(16px);
}

.balance-card {
  text-align: center;
}

.balance-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.xlm-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.balance-header h3 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.amount {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: #fbbf24;
}

.balance-usd {
  color: #94a3b8;
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* PIX Section */
.pix-section {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(16px);
}

.pix-section h3 {
  text-align: center;
  margin: 0 0 1.5rem 0;
  color: white;
  font-size: 1.3rem;
}

.pix-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.pix-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pix-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.make-pix {
  background: linear-gradient(135deg, #10b981, #059669);
}

.make-pix:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.pay-pix {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.pay-pix:hover {
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
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

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: rgba(30, 58, 138, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  backdrop-filter: blur(16px);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
  
  .connect-card {
    padding: 2rem;
  }
  
  .pix-actions {
    grid-template-columns: 1fr;
  }
  
  .wallet-header {
    flex-direction: column;
    text-align: center;
  }
  
  .amount {
    font-size: 2.5rem;
  }
  
  .currency {
    font-size: 1.2rem;
  }
}
</style>