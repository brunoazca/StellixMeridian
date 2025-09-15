<template>
  <div class="wallet-profile" v-if="accountData?.isConnected">
    <div class="profile-content">
      <div class="wallet-info">
        <div class="wallet-icon">👤</div>
        <div class="wallet-details">
          <span class="wallet-address">{{ formatAddress(accountData.address) }}</span>
          <span class="wallet-network">{{ getNetworkName() }}</span>
        </div>
      </div>
      
      <div class="profile-actions">
        <button @click="openWalletModal" class="profile-btn" title="Gerenciar Carteira">
          ⚙️
        </button>
        <button @click="handleDisconnect" class="profile-btn disconnect" title="Desconectar">
          🚪
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAppKitAccount, useAppKit } from "@reown/appkit/vue"
import { useDisconnect } from "@reown/appkit/vue"

// Composables
const accountData = useAppKitAccount()
const { open } = useAppKit()
const { disconnect } = useDisconnect()

// Methods
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const getNetworkName = () => {
  const networks = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base'
  }
  const chainId = accountData.value?.chainId
  return networks[chainId] || `Chain ${chainId}` || 'Desconhecida'
}

const openWalletModal = () => {
  open()
}

const handleDisconnect = async () => {
  try {
    await disconnect()
    console.log('✅ Desconectado com sucesso')
  } catch (error) {
    console.error('❌ Erro ao desconectar:', error)
  }
}
</script>

<style scoped>
.wallet-profile {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wallet-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-details {
  display: flex;
  flex-direction: column;
}

.wallet-address {
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  font-weight: 600;
}

.wallet-network {
  color: #94a3b8;
  font-size: 0.8rem;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
}

.profile-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.profile-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.profile-btn.disconnect:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .wallet-profile {
    position: relative;
    top: auto;
    right: auto;
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .profile-content {
    justify-content: space-between;
  }
}
</style>
