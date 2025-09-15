<template>
  <div class="action-buttons">
    <div v-if="accountInfo?.isConnected" class="connected-actions">
      <button @click="disconnectFreighter" class="action-btn disconnect-btn">
        Desconectar
      </button>
      <button @click="handleSwitchNetwork" class="action-btn network-btn">
        Trocar Rede
      </button>
      <button @click="handleSignMessage" class="action-btn sign-btn">
        Assinar Mensagem
      </button>
      <button @click="handleSendTx" class="action-btn tx-btn">
        Enviar Transação
      </button>

      <div v-if="signature" class="signature-result">
        <strong>Assinatura:</strong>
        <code>{{ signature }}</code>
      </div>

      <div v-if="error" class="error-message">
        <strong>Erro:</strong> {{ error }}
      </div>
    </div>
    
    <div v-else class="disconnected-actions">
      <button 
        @click="connectFreighter" 
        :disabled="!isFreighterAvailable || isConnecting"
        class="action-btn connect-btn"
      >
        {{ isConnecting ? 'Conectando...' : 'Conectar Freighter' }}
      </button>
      
      <div v-if="!isFreighterAvailable" class="warning-message">
        <strong>Aviso:</strong> Freighter wallet não está instalado. 
        <a href="https://freighter.app" target="_blank" class="link-button">Instalar Freighter</a>
      </div>
      
      <button @click="debugFreighter" class="action-btn debug-btn">
        Debug Freighter
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFreighter } from '~/composables/useFreighter'

// Stellar networks
const networks = [
  { name: 'TESTNET', displayName: 'Testnet' },
  { name: 'PUBLIC', displayName: 'Mainnet' },
  { name: 'FUTURENET', displayName: 'Futurenet' }
]

// Freighter composable
const { 
  accountInfo, 
  isConnecting, 
  error: freighterError, 
  isFreighterAvailable,
  connectFreighter, 
  disconnectFreighter, 
  switchToNetwork,
  signMessage,
  network
} = useFreighter()

// Local state
const signature = ref(null)
const error = computed(() => freighterError.value)

// Methods
const handleSwitchNetwork = () => {
  // Switch to PUBLIC (mainnet)
  switchToNetwork('PUBLIC')
}

const handleSignMessage = async () => {
  try {
    console.log("Assinando mensagem...")
    const msg = "Olá do Stellix!"
    
    if (!accountInfo.value?.address) {
      console.error("Carteira não conectada")
      return
    }
    
    const result = await signMessage(msg)
    signature.value = result
    console.log("Mensagem assinada:", result)
  } catch (err) {
    console.error("Erro ao assinar mensagem:", err)
  }
}

const handleSendTx = () => {
  console.log("💸 Funcionalidade de transação Stellar em desenvolvimento...")
  // TODO: Implementar transações Stellar usando Freighter
}

const debugFreighter = () => {
  console.log('=== DEBUG FREIGHTER ===')
  console.log('window.freighterApi:', window.freighterApi)
  console.log('isFreighterAvailable:', isFreighterAvailable.value)
  console.log('isConnecting:', isConnecting.value)
  console.log('error:', error.value)
  console.log('accountInfo:', accountInfo.value)
  console.log('========================')
}
</script>

<style scoped>
.action-buttons {
  margin: 2rem 0;
}

.connected-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.connect-btn {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.connect-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-2px);
}

.disconnect-btn {
  background: #ef4444;
  color: white;
}

.disconnect-btn:hover {
  background: #dc2626;
}

.network-btn {
  background: #10b981;
  color: white;
}

.network-btn:hover {
  background: #059669;
}

.sign-btn {
  background: #f59e0b;
  color: white;
}

.sign-btn:hover {
  background: #d97706;
}

.tx-btn {
  background: #8b5cf6;
  color: white;
}

.tx-btn:hover {
  background: #7c3aed;
}

.signature-result {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.5rem;
  width: 100%;
}

.signature-result code {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.8rem;
  word-break: break-all;
  color: #22c55e;
}

.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 0.5rem;
  width: 100%;
  color: #ef4444;
}

.disconnected-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.warning-message {
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 0.5rem;
  text-align: center;
  color: #f59e0b;
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

.debug-btn {
  background: #6b7280;
  color: white;
  margin-top: 1rem;
}

.debug-btn:hover {
  background: #4b5563;
}
</style>
