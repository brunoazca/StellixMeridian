<template>
  <div class="info-display">
    <section class="info-section">
      <h3>Informações da Conta</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Endereço:</span>
          <span class="value">{{ accountInfo?.address || 'Não conectado' }}</span>
        </div>
        <div class="info-item">
          <span class="label">CAIP Address:</span>
          <span class="value">{{ accountInfo?.caipAddress || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Conectado:</span>
          <span class="value" :class="{ connected: accountInfo?.isConnected }">
            {{ accountInfo?.isConnected ? 'Sim' : 'Não' }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">Status:</span>
          <span class="value">{{ accountInfo?.status || 'Desconectado' }}</span>
        </div>
        <div class="info-item" v-if="accountInfo?.embeddedWalletInfo?.user?.email">
          <span class="label">Email:</span>
          <span class="value">{{ accountInfo.embeddedWalletInfo.user.email }}</span>
        </div>
      </div>
    </section>

    <section class="info-section">
      <h3>Tema</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Modo:</span>
          <span class="value">{{ kitTheme?.themeMode || 'Não definido' }}</span>
        </div>
      </div>
    </section>

    <section class="info-section">
      <h3>Estado do AppKit</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Modal Aberto:</span>
          <span class="value">{{ state?.open ? 'Sim' : 'Não' }}</span>
        </div>
        <div class="info-item">
          <span class="label">Rede Selecionada:</span>
          <span class="value">{{ getNetworkName(state?.selectedNetworkId) }}</span>
        </div>
      </div>
    </section>

    <section class="info-section">
      <h3>Informações da Carteira</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">Nome:</span>
          <span class="value">{{ walletInfo?.name || 'N/A' }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  useAppKitState,
  useAppKitTheme,
  useAppKitAccount,
  useWalletInfo,
} from "@reown/appkit/vue"

// Composables
const kitTheme = useAppKitTheme()
const state = useAppKitState()
const accountInfo = useAppKitAccount()
const walletInfo = useWalletInfo()

// Network mapping
const getNetworkName = (networkId) => {
  const networks = {
    1: 'Ethereum',
    137: 'Polygon',
    8453: 'Base'
  }
  return networks[networkId] || `Chain ${networkId}` || 'Não selecionada'
}
</script>

<style scoped>
.info-display {
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.info-section h3 {
  color: #3b82f6;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  color: #94a3b8;
  font-weight: 500;
  min-width: 120px;
}

.value {
  color: white;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.9rem;
  text-align: right;
  word-break: break-all;
  max-width: 250px;
}

.value.connected {
  color: #22c55e;
  font-weight: 600;
}

@media (max-width: 768px) {
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .value {
    text-align: left;
    max-width: 100%;
  }
  
  .label {
    min-width: auto;
  }
}
</style>
