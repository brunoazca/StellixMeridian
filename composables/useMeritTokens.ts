import { ref, watch } from 'vue'
import { useFreighter } from './useFreighter'

// Estado global para tokens MERIT
const globalMeritState = {
  meritBalance: ref(0),
  isLoading: ref(false),
  lastFetch: ref(0),
  cacheTime: 30000 // 30 segundos cache
}

export const useMeritTokens = () => {
  const { address, isWalletConnected, currentNetwork } = useFreighter()
  const { meritBalance, isLoading, lastFetch, cacheTime } = globalMeritState

  // Contract ID do token MERIT (você precisa fornecer o correto)
  const MERIT_CONTRACT_ID = 'CAWSBSNIP7KKATLMX3GCPVZ7RTUIOYLJG63HBCY22QAXZDVUEOSVTGOI' // Substitua pelo ID real

  const fetchMeritBalance = async (forceRefresh = false) => {
    if (!address.value || !isWalletConnected.value) {
      meritBalance.value = 0
      return
    }

    const now = Date.now()
    
    // Verificar cache
    if (!forceRefresh && (now - lastFetch.value) < cacheTime) {
      console.log('🏅 Usando saldo MERIT em cache')
      return
    }

    isLoading.value = true
    try {
      console.log('🏅 Buscando saldo de tokens MERIT...')
      
      const network = currentNetwork.value === 'PUBLIC' ? 'mainnet' : 'testnet'
      const horizonUrl = network === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org'
      
      const response = await fetch(`${horizonUrl}/accounts/${address.value}`)
      
      if (response.status === 404) {
        meritBalance.value = 0
        console.log('ℹ️ Conta não existe - sem tokens MERIT')
        return
      }
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar conta: ${response.status}`)
      }
      
      const accountData = await response.json()
      
      // Procurar pelo token MERIT nos balances
      const meritAsset = accountData.balances.find((balance: any) => {
        // Procurar por tokens MERIT (pode ser por asset_code ou asset_issuer)
        return (
          balance.asset_code === 'MERIT' ||
          balance.asset_code === 'Merit' ||
          balance.asset_code === 'merit' ||
          (balance.asset_issuer && balance.asset_issuer.includes('MERIT'))
        )
      })
      
      if (meritAsset) {
        meritBalance.value = parseFloat(meritAsset.balance)
        console.log('✅ Tokens MERIT encontrados:', meritBalance.value)
      } else {
        meritBalance.value = 0
        console.log('ℹ️ Nenhum token MERIT encontrado na carteira')
      }
      
      lastFetch.value = now
      
    } catch (error) {
      console.error('❌ Erro ao buscar tokens MERIT:', error)
      meritBalance.value = 0
    } finally {
      isLoading.value = false
    }
  }

  const formatMeritBalance = (balance: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(balance)
  }

  // Watchers para buscar quando conectar ou trocar de rede
  watch(() => address.value, (newAddress) => {
    if (newAddress) {
      fetchMeritBalance()
    } else {
      meritBalance.value = 0
    }
  }, { immediate: true })

  watch(() => isWalletConnected.value, (connected) => {
    if (connected && address.value) {
      fetchMeritBalance()
    } else if (!connected) {
      meritBalance.value = 0
    }
  })

  watch(() => currentNetwork.value, (newNetwork, oldNetwork) => {
    if (newNetwork !== oldNetwork && address.value && isWalletConnected.value) {
      console.log('🌐 Rede mudou - atualizando tokens MERIT')
      fetchMeritBalance()
    }
  })

  return {
    meritBalance,
    isLoading,
    fetchMeritBalance,
    formatMeritBalance
  }
}
