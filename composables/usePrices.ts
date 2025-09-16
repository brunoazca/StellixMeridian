import { ref, computed } from 'vue'

// Estado global para cache de preços
const globalPricesState = {
  xlmPriceUSD: ref(0.12),
  xlmPriceBRL: ref(0.60),
  usdToBRL: ref(5.0),
  isLoading: ref(false),
  lastFetch: ref(0), // timestamp da última busca
  cacheTime: 60000, // 1 minuto em ms
  hasValidData: ref(false) // indica se já conseguiu buscar dados válidos alguma vez
}

export const usePrices = () => {
  const { xlmPriceUSD, xlmPriceBRL, usdToBRL, isLoading, lastFetch, cacheTime, hasValidData } = globalPricesState

  // Computed
  const xlmPriceBRLCalculated = computed(() => xlmPriceUSD.value * usdToBRL.value)

  // Methods
  const fetchXLMPrices = async (forceRefresh = false) => {
    const now = Date.now()
    
    // Verificar se precisa buscar novamente
    if (!forceRefresh && (now - lastFetch.value) < cacheTime) {
      console.log('💰 Usando preços em cache (última busca há', Math.round((now - lastFetch.value) / 1000), 'segundos)')
      return
    }
    
    try {
      console.log('💰 Buscando preços do XLM via API...')
      isLoading.value = true
      
      const response = await $fetch('/api/prices')
      
      if (response.success) {
        xlmPriceUSD.value = response.xlm.usd
        usdToBRL.value = response.exchange.usdToBRL
        xlmPriceBRL.value = response.calculated.xlmBRL
        lastFetch.value = now // Atualizar timestamp
        hasValidData.value = true // Marcar que já temos dados válidos
        
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
      
      // Se já temos dados válidos de antes, manter os valores atuais
      if (hasValidData.value) {
        console.log('🔄 Mantendo preços da última busca válida:', {
          xlmUSD: xlmPriceUSD.value,
          usdToBRL: usdToBRL.value,
          xlmBRL: xlmPriceBRL.value
        })
      } else {
        // Só usar valores padrão se nunca conseguiu buscar antes
        xlmPriceUSD.value = 0.12
        xlmPriceBRL.value = 0.60
        usdToBRL.value = 5.0
        console.log('🔄 Usando preços padrão (primeira vez):', {
          xlmUSD: xlmPriceUSD.value,
          usdToBRL: usdToBRL.value,
          xlmBRL: xlmPriceBRL.value
        })
      }
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
