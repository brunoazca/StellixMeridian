<template>
  <div class="network-selector">
    <h4>Rede Stellar</h4>
    <div class="network-options">
      <button 
        v-for="net in networks" 
        :key="net.value"
        @click="selectNetwork(net.value)"
        :class="['network-button', { active: currentNetwork === net.value }]"
        :disabled="isConnecting"
      >
        <span class="network-icon">{{ net.icon }}</span>
        <div class="network-info">
          <div class="network-name">{{ net.name }}</div>
          <div class="network-desc">{{ net.description }}</div>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useFreighter } from '~/composables/useFreighter'

const { currentNetwork, isConnecting, switchToNetwork } = useFreighter()

const networks = [
  {
    value: 'TESTNET',
    name: 'Testnet',
    description: 'Rede de teste',
    icon: '🧪'
  },
  {
    value: 'PUBLIC',
    name: 'Mainnet',
    description: 'Rede principal',
    icon: '🌐'
  },
  {
    value: 'FUTURENET',
    name: 'Futurenet',
    description: 'Rede experimental',
    icon: '🚀'
  }
]

const selectNetwork = async (networkName) => {
  console.log('🔄 Trocando para rede:', networkName)
  await switchToNetwork(networkName)
}
</script>

<style scoped>
.network-selector {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(16px);
}

.network-selector h4 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.1rem;
  text-align: center;
}

.network-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.network-button {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
}

.network-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.network-button.active {
  background: rgba(34, 197, 94, 0.2);
  border-color: #22c55e;
  box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
}

.network-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.network-icon {
  font-size: 1.5rem;
  min-width: 2rem;
  text-align: center;
}

.network-info {
  flex: 1;
}

.network-name {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.network-desc {
  font-size: 0.8rem;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .network-options {
    gap: 0.5rem;
  }
  
  .network-button {
    padding: 0.75rem;
  }
}
</style>
