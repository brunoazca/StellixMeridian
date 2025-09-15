import { ref, computed } from 'vue'

// Estado global compartilhado
const globalState = {
  isConnecting: ref(false),
  error: ref(''),
  publicKey: ref(''),
  isConnected: ref(false),
  network: ref('TESTNET')
}

export const useFreighter = () => {
  const { isConnecting, error, publicKey, isConnected, network } = globalState

  // Check if Freighter extension is available
  const isFreighterAvailable = computed(() => {
    if (typeof window === 'undefined') return false
    return !!(window.freighterApi)
  })

  // Connect to Freighter using browser API
  const connectFreighter = async () => {
    console.log('🔌 Tentando conectar...')
    console.log('window.freighterApi disponível:', !!window.freighterApi)
    
    if (!window.freighterApi) {
      error.value = 'Extensão Freighter não encontrada'
      console.log('❌ Freighter API não encontrada')
      return false
    }

    try {
      isConnecting.value = true
      error.value = ''

      // Check if extension is connected (browser API)
      const isAppConnected = await window.freighterApi.isConnected()
      console.log('🔍 Extensão de browser encontrada:', isAppConnected.isConnected)
      console.log('🔍 Resultado completo:', isAppConnected)

      if (!isAppConnected.isConnected) {
        error.value = 'Extensão Freighter não está conectada'
        console.log('❌ Extensão não conectada')
        return false
      }

      // Request access to get public key (browser API)
      console.log('🔑 Solicitando acesso...')
      const accessResult = await window.freighterApi.requestAccess()
      console.log('🔑 Resultado do acesso:', accessResult)
      
      if (accessResult.error) {
        error.value = accessResult.error
        console.log('❌ Erro no acesso:', accessResult.error)
        return false
      }

      publicKey.value = accessResult.address
      isConnected.value = true
      console.log('✅ Conectado! Endereço:', publicKey.value)
      
      return true
    } catch (err) {
      console.error('❌ Erro ao conectar:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao conectar'
      return false
    } finally {
      isConnecting.value = false
    }
  }

  // Disconnect from Freighter
  const disconnectFreighter = async () => {
    publicKey.value = ''
    isConnected.value = false
    error.value = ''
    console.log('Desconectado')
  }

  // Switch network
  const switchToNetwork = async (networkName: 'TESTNET' | 'PUBLIC' | 'FUTURENET') => {
    try {
      if (!window.freighterApi) {
        throw new Error('Freighter API não disponível')
      }
      
      // Set allowed for the app (browser API)
      const allowedResult = await window.freighterApi.setAllowed()
      if (allowedResult.isAllowed) {
        network.value = networkName
        error.value = ''
        console.log('Rede alterada para:', networkName)
      } else {
        throw new Error('Falha ao autorizar aplicação')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao trocar rede'
    }
  }

  // Sign message
  const signMessage = async (message: string) => {
    try {
      if (!window.freighterApi) {
        throw new Error('Freighter API não disponível')
      }
      
      if (!isConnected.value) {
        throw new Error('Não conectado')
      }
      
      // Sign message using browser API
      const result = await window.freighterApi.signMessage(message, {
        address: publicKey.value!
      })
      
      if (result.error) {
        throw new Error(result.error as string)
      }
      
      return result.signedMessage
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao assinar mensagem'
      throw err
    }
  }

  // Get account info - using individual refs for better reactivity
  const accountInfo = computed(() => {
    const info = {
      address: publicKey.value,
      isConnected: isConnected.value,
      network: network.value,
      status: isConnected.value ? 'Conectado' : 'Desconectado'
    }
    return info
  })

  // Force reactivity by creating individual computed properties
  const address = computed(() => publicKey.value)
  const isWalletConnected = computed(() => isConnected.value)
  const currentNetwork = computed(() => network.value)

  return {
    isConnected,
    isConnecting,
    error,
    accountInfo,
    isFreighterAvailable,
    publicKey,
    network,
    address,
    isWalletConnected,
    currentNetwork,
    connectFreighter,
    disconnectFreighter,
    switchToNetwork,
    signMessage
  }
}

// Extend Window interface for Freighter Browser API
declare global {
  interface Window {
    freighterApi?: {
      isConnected: () => Promise<{ isConnected: boolean; error?: string }>
      isAllowed: () => Promise<{ isAllowed: boolean; error?: string }>
      setAllowed: () => Promise<{ isAllowed: boolean; error?: string }>
      requestAccess: () => Promise<{ address: string; error?: string }>
      getAddress: () => Promise<{ address: string; error?: string }>
      getNetwork: () => Promise<{ network: string; networkPassphrase: string; error?: string }>
      getNetworkDetails: () => Promise<{ network: string; networkUrl: string; networkPassphrase: string; sorobanRpcUrl?: string; error?: string }>
      signTransaction: (xdr: string, opts?: { network?: string; networkPassphrase?: string; address?: string }) => Promise<{ signedTxXdr: string; signerAddress: string; error?: string }>
      signAuthEntry: (authEntryXdr: string, opts: { address: string }) => Promise<{ signedAuthEntry: any | null; signerAddress: string; error?: string }>
      signMessage: (message: string, opts: { address: string }) => Promise<{ signedMessage: string | null; signerAddress: string; error?: string }>
      addToken: (opts: { contractId: string; networkPassphrase?: string }) => Promise<{ contractId: string; error?: string }>
    }
  }
}
