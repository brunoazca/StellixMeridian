<template>
  <div class="action-buttons">
    <div v-if="accountData?.isConnected" class="connected-actions">
      <button @click="handleDisconnect" class="action-btn disconnect-btn">
        Desconectar
      </button>
      <button @click="switchToNetwork" class="action-btn network-btn">
        Trocar Rede
      </button>
      <button @click="handleSignMessage" class="action-btn sign-btn">
        Assinar Mensagem
      </button>
      <button @click="handleSendTx" class="action-btn tx-btn">
        Enviar Transação
      </button>

      <div v-if="hash" class="tx-hash">
        <strong>Hash da Transação:</strong>
        <code>{{ hash }}</code>
      </div>

      <div v-if="error" class="error-message">
        <strong>Erro:</strong> {{ error }}
      </div>
    </div>
    
    <button v-else @click="openAppKit" class="action-btn connect-btn">
      Abrir AppKit
    </button>
  </div>
</template>

<script setup>
import { useDisconnect, useAppKit, useAppKitNetwork, useAppKitAccount } from "@reown/appkit/vue"
import { useEstimateGas, useSendTransaction, useSignMessage } from '@wagmi/vue'
import { parseGwei } from 'viem'
import { watchEffect, ref } from 'vue'

// Networks
const networks = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 8453, name: 'Base' }
]

// Test transaction
const TEST_TX = {
  to: "0x50200216532355Fa9971074Ca352FA706346c04C", // change to your address
  value: parseGwei('0.00001')
}

// Composables
const { disconnect } = useDisconnect()
const { open } = useAppKit()
const networkData = useAppKitNetwork()
const accountData = useAppKitAccount()
const { data: gas } = useEstimateGas({...TEST_TX})
const { data: hash, sendTransaction, error } = useSendTransaction()
const { signMessageAsync } = useSignMessage()

// Methods
const openAppKit = () => open()

const handleDisconnect = async () => {
  try {
    await disconnect()
    console.log('✅ Desconectado com sucesso')
  } catch (error) {
    console.error("❌ Erro durante desconexão:", error)
  }
}

const switchToNetwork = () => {
  if (networkData.value?.switchNetwork) {
    networkData.value.switchNetwork(networks[1])
  }
}

const handleSignMessage = async () => {
  try {
    console.log("🔏 Assinando mensagem...")
    const msg = "Olá do StellixMeridian!"
    const address = accountData.value?.address
    
    if (!address) {
      console.error("❌ Endereço não encontrado")
      return
    }
    
    const signature = await signMessageAsync({ 
      message: msg, 
      account: address
    })
    
    console.log("✅ Mensagem assinada:", signature)
  } catch (err) {
    console.error("❌ Erro ao assinar mensagem:", err)
  }
}

const handleSendTx = () => {
  try {
    console.log("💸 Enviando transação...")
    
    if (!gas.value) {
      console.error("❌ Gas não estimado")
      return
    }
    
    sendTransaction({
      ...TEST_TX,
      gas: gas.value
    })
  } catch (err) {
    console.log('❌ Erro ao enviar transação:', err)
  }
}

// Watch for transaction hash
watchEffect(() => {
  if (hash.value) {
    console.log("✅ Hash da transação:", hash.value)
  }
})

// Watch for errors
watchEffect(() => {
  if (error.value) {
    console.error("❌ Erro:", error.value)
  }
})
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

.tx-hash {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.5rem;
  width: 100%;
}

.tx-hash code {
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
</style>
