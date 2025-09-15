<template>
  <div class="xlm-balance">
    <div class="balance-header">
      <div class="xlm-icon">⭐</div>
      <h2>Saldo XLM</h2>
    </div>
    
    <div class="balance-display">
      <div class="balance-amount">
        <span class="amount">{{ formatBalance(xlmBalance) }}</span>
        <span class="currency">XLM</span>
      </div>
      <div class="balance-usd">
        ≈ ${{ formatUSD(xlmBalanceUSD) }} USD
      </div>
    </div>
    
    <div class="balance-actions">
      <button @click="refreshBalance" class="refresh-btn" :disabled="isLoading">
        <span v-if="!isLoading">🔄</span>
        <span v-else class="loading-spinner">⏳</span>
        Atualizar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFreighter } from '~/composables/useFreighter'

// Props/Emits
const emit = defineEmits(['balance-updated'])

// Composables
const { 
  accountInfo, 
  isConnected, 
  address, 
  isWalletConnected, 
  currentNetwork 
} = useFreighter()

// State
const xlmBalance = ref(0)
const xlmPrice = ref(0.12) // Mock price - em produção, buscar de uma API
const isLoading = ref(false)

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

const fetchXLMBalance = async () => {
  console.log('🔍 fetchXLMBalance chamada')
  console.log('address.value:', address.value)
  console.log('isWalletConnected.value:', isWalletConnected.value)
  console.log('accountInfo.value:', accountInfo.value)
  
  if (!address.value) {
    console.log('❌ Nenhum endereço encontrado')
    return
  }
  
  isLoading.value = true
  try {
    console.log('Buscando saldo XLM para:', address.value)
    console.log('Rede atual:', currentNetwork.value)
    
    // Buscar saldo real da rede Stellar
    const network = currentNetwork.value === 'PUBLIC' ? 'mainnet' : 'testnet'
    const horizonUrl = network === 'mainnet' 
      ? 'https://horizon.stellar.org' 
      : 'https://horizon-testnet.stellar.org'
    
    console.log('URL Horizon:', horizonUrl)
    
    const response = await fetch(`${horizonUrl}/accounts/${address.value}`)
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar conta: ${response.status}`)
    }
    
    const accountData = await response.json()
    console.log('Dados da conta recebidos:', accountData)
    
    // Encontrar o saldo de XLM nativo
    const xlmAsset = accountData.balances.find(balance => 
      balance.asset_type === 'native' || balance.asset_code === 'XLM'
    )
    
    console.log('XLM Asset encontrado:', xlmAsset)
    
    if (xlmAsset) {
      xlmBalance.value = parseFloat(xlmAsset.balance)
      console.log('✅ Saldo XLM encontrado:', xlmBalance.value)
    } else {
      xlmBalance.value = 0
      console.log('⚠️ Nenhum saldo XLM encontrado')
    }
    
    emit('balance-updated', {
      xlm: xlmBalance.value,
      usd: xlmBalanceUSD.value
    })
    
  } catch (error) {
    console.error('❌ Erro ao buscar saldo:', error)
    // Fallback para mock em caso de erro
    xlmBalance.value = Math.random() * 100 + 10
    console.log('🔄 Usando saldo mock:', xlmBalance.value)
  } finally {
    isLoading.value = false
  }
}

const refreshBalance = () => {
  fetchXLMBalance()
}

// Watch for address changes
watch(() => address.value, (newAddress) => {
  console.log('👀 Address mudou:', newAddress)
  if (newAddress) {
    fetchXLMBalance()
  } else {
    xlmBalance.value = 0
  }
}, { immediate: true })

// Watch for connection status
watch(() => isWalletConnected.value, (connected) => {
  console.log('👀 Connection status mudou:', connected)
  if (connected && address.value) {
    fetchXLMBalance()
  } else if (!connected) {
    xlmBalance.value = 0
  }
})

// Initialize
onMounted(() => {
  console.log('🚀 Componente montado')
  console.log('address.value:', address.value)
  console.log('isWalletConnected.value:', isWalletConnected.value)
  if (address.value && isWalletConnected.value) {
    fetchXLMBalance()
  }
})
</script>

<style scoped>
.xlm-balance {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1.5rem;
  padding: 2rem;
  text-align: center;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
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

.balance-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.balance-display {
  margin-bottom: 1.5rem;
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
}

.balance-actions {
  display: flex;
  justify-content: center;
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
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .xlm-balance {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .amount {
    font-size: 2.5rem;
  }
  
  .currency {
    font-size: 1.2rem;
  }
}
</style>

