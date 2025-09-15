<template>
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
</template>

<script setup>
import { useFreighter } from '~/composables/useFreighter'

const { address, currentNetwork } = useFreighter()

const getNetworkName = (networkName) => {
  const networks = {
    'TESTNET': 'Stellar Testnet',
    'PUBLIC': 'Stellar Mainnet',
    'FUTURENET': 'Stellar Futurenet'
  }
  return networks[networkName] || networkName || 'Não selecionada'
}
</script>

<style scoped>
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

@media (max-width: 768px) {
  .wallet-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
