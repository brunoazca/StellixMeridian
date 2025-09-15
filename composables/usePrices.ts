import { ref, computed } from 'vue'

export const usePrices = () => {
  // State
  const xlmPriceUSD = ref(0.12)
  const xlmPriceBRL = ref(0.60)
  const usdToBRL = ref(5.0)
  const isLoading = ref(false)

  // Computed
  const xlmPriceBRLCalculated = computed(() => xlmPriceUSD.value * usdToBRL.value)

  // Methods
  const fetchXLMPrices = async () => {
    try {
      console.log('💰 Buscando preços do XLM via API...')
      isLoading.value = true
      
      const response = await $fetch('/api/prices')
      
      if (response.success) {
        xlmPriceUSD.value = response.xlm.usd
        usdToBRL.value = response.exchange.usdToBRL
        xlmPriceBRL.value = response.calculated.xlmBRL
        
        console.log('✅ Preços atualizados:', {
          xlmUSD: xlmPriceUSD.value,
          usdToBRL: usdToBRL.value,
          xlmBRL: xlmPriceBRL.value
        })
      } else {
        throw new Error(response.error || 'Erro na API de preços')
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar preços:', error)
      // Usar valores padrão em caso de erro
      xlmPriceUSD.value = 0.12
      xlmPriceBRL.value = 0.60
      usdToBRL.value = 5.0
      console.log('🔄 Usando preços padrão')
    } finally {
      isLoading.value = false
    }
  }

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatBRL = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return {
    xlmPriceUSD,
    xlmPriceBRL,
    usdToBRL,
    isLoading,
    xlmPriceBRLCalculated,
    fetchXLMPrices,
    formatUSD,
    formatBRL
  }
}
