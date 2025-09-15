<template>
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
      <div v-if="xlmBalance > 0" class="balance-usd">
        ≈ ${{ formatUSD(xlmBalanceUSD) }} USD
      </div>
      <div v-if="xlmBalance > 0" class="balance-brl">
        ≈ {{ formatBRL(xlmBalanceBRL) }}
      </div>
      <div v-else class="balance-info">
        <p>💡 Conta não existe nesta rede ou saldo zero</p>
        <p class="balance-hint">Para ativar uma conta Stellar, é necessário um depósito mínimo de XLM</p>
      </div>
      <button @click="refreshBalance" class="refresh-btn" :disabled="isLoading">
        <span v-if="!isLoading">🔄</span>
        <span v-else class="loading-spinner">⏳</span>
        Atualizar
      </button>
    </div>
  </div>
</template>

<script setup>
import { useXLMBalance } from '~/composables/useXLMBalance'

const {
  xlmBalance,
  xlmBalanceUSD,
  xlmBalanceBRL,
  isLoading,
  formatBalance,
  formatUSD,
  formatBRL,
  refreshBalance
} = useXLMBalance()
</script>

<style scoped>
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
  margin-bottom: 0.5rem;
}

.balance-brl {
  color: #22c55e;
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.balance-info {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.75rem;
}

.balance-info p {
  margin: 0 0 0.5rem 0;
  color: #dbeafe;
}

.balance-hint {
  font-size: 0.9rem;
  color: #94a3b8;
  font-style: italic;
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

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .amount {
    font-size: 2.5rem;
  }
  
  .currency {
    font-size: 1.2rem;
  }
}
</style>
