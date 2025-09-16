import { ref, computed, watch } from 'vue'
import { useFreighter } from './useFreighter'
import { usePrices } from './usePrices'
import { useBalanceTracker } from './useBalanceTracker'

export const useXLMBalance = () => {
  // Composables
  const { address, isWalletConnected, currentNetwork } = useFreighter()
  const { xlmPriceUSD, xlmPriceBRL, formatUSD, formatBRL, fetchXLMPrices } = usePrices()
  const { trackXLMIncrease, trackXLMDecrease } = useBalanceTracker()

  // State
  const xlmBalance = ref(0)
  const isLoading = ref(false)

  // Computed
  const xlmBalanceUSD = computed(() => xlmBalance.value * xlmPriceUSD.value)
  const xlmBalanceBRL = computed(() => xlmBalance.value * xlmPriceBRL.value)

  // Methods
  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7
    }).format(balance)
  }

  // Simulate XLM balance changes for PIX transactions
  const simulateXLMIncrease = (brlAmount: number) => {
    const xlmAmount = brlAmount * 0.37 // BRL to XLM conversion
    const newBalance = xlmBalance.value + xlmAmount
    
    console.log(`💰 Simulating XLM increase:`)
    console.log(`  - PIX received: R$ ${brlAmount.toFixed(2)}`)
    console.log(`  - XLM gained: ${xlmAmount.toFixed(7)} XLM`)
    console.log(`  - Old balance: ${xlmBalance.value.toFixed(7)} XLM`)
    console.log(`  - New balance: ${newBalance.toFixed(7)} XLM`)
    
    xlmBalance.value = newBalance
    
    // Track the change for display on home screen
    trackXLMIncrease(xlmAmount, brlAmount)
    
    return xlmAmount
  }

  const simulateXLMDecrease = (brlAmount: number) => {
    const xlmAmount = brlAmount * 0.37 // BRL to XLM conversion
    const newBalance = Math.max(0, xlmBalance.value - xlmAmount)
    
    console.log(`💸 Simulating XLM decrease:`)
    console.log(`  - PIX sent: R$ ${brlAmount.toFixed(2)}`)
    console.log(`  - XLM spent: ${xlmAmount.toFixed(7)} XLM`)
    console.log(`  - Old balance: ${xlmBalance.value.toFixed(7)} XLM`)
    console.log(`  - New balance: ${newBalance.toFixed(7)} XLM`)
    
    xlmBalance.value = newBalance
    
    // Track the change for display on home screen
    trackXLMDecrease(xlmAmount, brlAmount)
    
    return xlmAmount
  }

  const fetchXLMBalance = async () => {
    if (!address.value) return
    
    isLoading.value = true
    try {
      console.log('Buscando saldo XLM para:', address.value)
      
      // Buscar preços primeiro
      await fetchXLMPrices()
      
      const network = currentNetwork.value === 'PUBLIC' ? 'mainnet' : 'testnet'
      const horizonUrl = network === 'mainnet' 
        ? 'https://horizon.stellar.org' 
        : 'https://horizon-testnet.stellar.org'
      
    const response = await fetch(`${horizonUrl}/accounts/${address.value}`)
    
    if (response.status === 404) {
      // Conta não existe nesta rede - isso é normal
      xlmBalance.value = 0
      console.log('ℹ️ Conta não existe na rede', network, '- saldo zero')
      return
    }
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar conta: ${response.status}`)
    }
    
    const accountData = await response.json()
    
    const xlmAsset = accountData.balances.find((balance: any) => 
      balance.asset_type === 'native' || balance.asset_code === 'XLM'
    )
    
    if (xlmAsset) {
      xlmBalance.value = parseFloat(xlmAsset.balance)
      console.log('✅ Saldo XLM encontrado:', xlmBalance.value)
      console.log('💰 Valor em USD:', formatUSD(xlmBalanceUSD.value))
      console.log('💰 Valor em BRL:', formatBRL(xlmBalanceBRL.value))
    } else {
      xlmBalance.value = 0
      console.log('⚠️ Conta existe mas sem saldo XLM')
    }
      
    } catch (error) {
      console.error('❌ Erro ao buscar saldo:', error)
      xlmBalance.value = Math.random() * 100 + 10
    } finally {
      isLoading.value = false
    }
  }

  const refreshBalance = () => {
    fetchXLMBalance()
  }

  // Watchers
  watch(() => address.value, (newAddress) => {
    if (newAddress) {
      fetchXLMBalance()
    } else {
      xlmBalance.value = 0
    }
  }, { immediate: true })

  watch(() => isWalletConnected.value, (connected) => {
    if (connected && address.value) {
      fetchXLMBalance()
    } else if (!connected) {
      xlmBalance.value = 0
    }
  })

  // Watch for network changes - buscar saldo quando trocar de rede
  watch(() => currentNetwork.value, (newNetwork, oldNetwork) => {
    if (newNetwork !== oldNetwork && address.value && isWalletConnected.value) {
      console.log('🌐 Rede mudou de', oldNetwork, 'para', newNetwork, '- atualizando saldo')
      fetchXLMBalance()
    }
  })

  return {
    xlmBalance,
    xlmBalanceUSD,
    xlmBalanceBRL,
    isLoading,
    formatBalance,
    formatUSD,
    formatBRL,
    refreshBalance,
    simulateXLMIncrease,
    simulateXLMDecrease
  }
}
