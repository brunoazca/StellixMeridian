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
  const MERIT_CONTRACT_ID = 'CC5UGDV44Y6IOR6PYRZ7AQFBGOOWOAP6QZRIGXTUQ57PD4LYPMWNOQLM' // Substitua pelo ID real

  const fetchMeritBalance = async (forceRefresh = false) => {
    console.log('🏅 fetchMeritBalance chamada')
    console.log('🏅 address.value:', address.value)
    console.log('🏅 isWalletConnected.value:', isWalletConnected.value)
    console.log('🏅 currentNetwork.value:', currentNetwork.value)
    
    if (!address.value || !isWalletConnected.value) {
      console.log('❌ Sem endereço ou não conectado')
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
      console.log('🏅 Buscando saldo de tokens MERIT para:', address.value)
      
      const network = currentNetwork.value === 'PUBLIC' ? 'mainnet' : 'testnet'
      const horizonUrl = network === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org'
      
      console.log('🏅 URL Horizon:', horizonUrl)
      
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
      console.log('🏅 Dados da conta recebidos:', accountData)
      console.log('🏅 Balances encontrados:', accountData.balances)
      
      // Procurar pelo token MERIT nos balances
      const meritAsset = accountData.balances.find((balance: any) => {
        console.log('🔍 Verificando balance:', balance)
        // Procurar por tokens MERIT usando o contract ID específico
        return (
          balance.asset_code === 'MERIT' ||
          balance.asset_code === 'Merit' ||
          balance.asset_code === 'merit' ||
          balance.contract_id === MERIT_CONTRACT_ID ||
          (balance.asset_issuer && balance.asset_issuer.includes('MERIT'))
        )
      })
      
      console.log('🏅 MERIT Asset encontrado:', meritAsset)
      
      if (meritAsset) {
        meritBalance.value = parseFloat(meritAsset.balance)
        console.log('✅ Tokens MERIT encontrados:', meritBalance.value)
      } else {
        meritBalance.value = 0
        console.log('ℹ️ Nenhum token MERIT encontrado na carteira')
        console.log('📋 Balances disponíveis:', accountData.balances.map((b: any) => ({ 
          code: b.asset_code, 
          issuer: b.asset_issuer, 
          balance: b.balance 
        })))
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
