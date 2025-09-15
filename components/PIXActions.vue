<template>
  <div class="pix-actions">
    <div class="actions-header">
      <h3>💳 Ações PIX</h3>
      <p>Faça pagamentos e receba PIX usando sua carteira XLM</p>
    </div>
    
    <div class="actions-grid">
      <div class="action-card">
        <div class="action-icon send">📤</div>
        <h4>Fazer PIX</h4>
        <p>Envie dinheiro via PIX usando seus XLM</p>
        <button @click="handleMakePix" class="action-btn send-btn" :disabled="isLoading">
          <span v-if="!isLoading">Fazer PIX</span>
          <span v-else>Processando...</span>
        </button>
      </div>
      
      <div class="action-card">
        <div class="action-icon receive">📥</div>
        <h4>Pagar PIX</h4>
        <p>Pague um PIX recebido convertendo XLM</p>
        <button @click="handlePayPix" class="action-btn receive-btn" :disabled="isLoading">
          <span v-if="!isLoading">Pagar PIX</span>
          <span v-else>Processando...</span>
        </button>
      </div>
    </div>
    
    <div v-if="lastTransaction" class="last-transaction">
      <div class="transaction-header">
        <span class="transaction-icon">✅</span>
        <span>Última transação</span>
      </div>
      <div class="transaction-details">
        <span class="transaction-type">{{ lastTransaction.type }}</span>
        <span class="transaction-amount">{{ lastTransaction.amount }}</span>
        <span class="transaction-time">{{ formatTime(lastTransaction.timestamp) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAppKitAccount } from "@reown/appkit/vue"

// Composables
const accountData = useAppKitAccount()

// State
const isLoading = ref(false)
const lastTransaction = ref(null)

// Methods
const handleMakePix = async () => {
  if (!accountData.value?.address) {
    alert('Conecte sua carteira primeiro!')
    return
  }
  
  isLoading.value = true
  
  try {
    console.log('🚀 Iniciando processo de fazer PIX...')
    console.log('👤 Carteira conectada:', accountData.value.address)
    
    // Simular chamada para o servidor
    const response = await $fetch('/api/pix/make', {
      method: 'POST',
      body: {
        walletAddress: accountData.value.address,
        amount: 100, // Valor mockado
        recipient: 'usuario@exemplo.com'
      }
    })
    
    console.log('✅ PIX realizado com sucesso:', response)
    
    // Atualizar última transação
    lastTransaction.value = {
      type: 'PIX Enviado',
      amount: 'R$ 100,00',
      timestamp: new Date()
    }
    
    alert('PIX realizado com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao fazer PIX:', error)
    alert('Erro ao realizar PIX. Verifique o console.')
  } finally {
    isLoading.value = false
  }
}

const handlePayPix = async () => {
  if (!accountData.value?.address) {
    alert('Conecte sua carteira primeiro!')
    return
  }
  
  isLoading.value = true
  
  try {
    console.log('💰 Iniciando processo de pagar PIX...')
    console.log('👤 Carteira conectada:', accountData.value.address)
    
    // Simular chamada para o servidor
    const response = await $fetch('/api/pix/pay', {
      method: 'POST',
      body: {
        walletAddress: accountData.value.address,
        amount: 50, // Valor mockado
        pixCode: 'PIX123456789'
      }
    })
    
    console.log('✅ PIX pago com sucesso:', response)
    
    // Atualizar última transação
    lastTransaction.value = {
      type: 'PIX Pago',
      amount: 'R$ 50,00',
      timestamp: new Date()
    }
    
    alert('PIX pago com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao pagar PIX:', error)
    alert('Erro ao pagar PIX. Verifique o console.')
  } finally {
    isLoading.value = false
  }
}

const formatTime = (timestamp) => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(timestamp)
}
</script>

<style scoped>
.pix-actions {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1.5rem;
  padding: 2rem;
  backdrop-filter: blur(16px);
}

.actions-header {
  text-align: center;
  margin-bottom: 2rem;
}

.actions-header h3 {
  color: white;
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.actions-header p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  padding: 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2.5rem;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
}

.action-icon.send {
  background: linear-gradient(135deg, #10b981, #059669);
}

.action-icon.receive {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.action-card h4 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.action-card p {
  color: #94a3b8;
  margin: 0 0 1.5rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.action-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.send-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
}

.receive-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.receive-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.last-transaction {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1rem;
}

.transaction-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #22c55e;
  font-weight: 600;
  font-size: 0.9rem;
}

.transaction-icon {
  font-size: 1rem;
}

.transaction-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.transaction-type {
  color: white;
  font-weight: 600;
}

.transaction-amount {
  color: #22c55e;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
}

.transaction-time {
  color: #94a3b8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .pix-actions {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .transaction-details {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
