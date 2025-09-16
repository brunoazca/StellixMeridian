import { ref, computed } from 'vue'

// Global state (singleton pattern) to share across all composables
const xlmDelta = ref(0) // Accumulated XLM changes
const meritDelta = ref(0) // Accumulated MERIT changes
const transactionHistory = ref<Array<{
  id: string
  type: 'PIX_RECEIVED' | 'PIX_SENT'
  xlmChange: number
  meritChange: number
  brlAmount: number
  timestamp: string
}>>([])

export const useBalanceTracker = () => {

  // Methods to track changes
  const trackXLMIncrease = (xlmAmount: number, brlAmount: number, source: 'PIX_RECEIVED' = 'PIX_RECEIVED') => {
    xlmDelta.value += xlmAmount
    
    const transaction = {
      id: `TXN_${Date.now()}`,
      type: source,
      xlmChange: xlmAmount,
      meritChange: 0,
      brlAmount: brlAmount,
      timestamp: new Date().toISOString()
    }
    
    transactionHistory.value.unshift(transaction)
    
    console.log('📈 XLM Delta Updated:')
    console.log(`  - Change: +${xlmAmount.toFixed(7)} XLM`)
    console.log(`  - Total delta: ${xlmDelta.value > 0 ? '+' : ''}${xlmDelta.value.toFixed(7)} XLM`)
    
    return transaction
  }

  const trackXLMDecrease = (xlmAmount: number, brlAmount: number, source: 'PIX_SENT' = 'PIX_SENT') => {
    xlmDelta.value -= xlmAmount
    
    const transaction = {
      id: `TXN_${Date.now()}`,
      type: source,
      xlmChange: -xlmAmount,
      meritChange: 0,
      brlAmount: brlAmount,
      timestamp: new Date().toISOString()
    }
    
    transactionHistory.value.unshift(transaction)
    
    console.log('📉 XLM Delta Updated:')
    console.log(`  - Change: -${xlmAmount.toFixed(7)} XLM`)
    console.log(`  - Total delta: ${xlmDelta.value > 0 ? '+' : ''}${xlmDelta.value.toFixed(7)} XLM`)
    
    return transaction
  }

  const trackMeritIncrease = (meritAmount: number, source: 'PIX_RECEIVED' | 'PIX_SENT' = 'PIX_RECEIVED') => {
    meritDelta.value += meritAmount
    
    // Update the last transaction or create new one
    const lastTransaction = transactionHistory.value[0]
    if (lastTransaction && Date.now() - new Date(lastTransaction.timestamp).getTime() < 1000) {
      lastTransaction.meritChange += meritAmount
    }
    
    console.log('📈 MERIT Delta Updated:')
    console.log(`  - Change: +${meritAmount.toFixed(2)} MERIT`)
    console.log(`  - Total delta: ${meritDelta.value > 0 ? '+' : ''}${meritDelta.value.toFixed(2)} MERIT`)
  }

  const trackMeritDecrease = (meritAmount: number, source: 'PIX_SENT' = 'PIX_SENT') => {
    meritDelta.value -= meritAmount
    
    // Update the last transaction or create new one
    const lastTransaction = transactionHistory.value[0]
    if (lastTransaction && Date.now() - new Date(lastTransaction.timestamp).getTime() < 1000) {
      lastTransaction.meritChange -= meritAmount
    }
    
    console.log('📉 MERIT Delta Updated:')
    console.log(`  - Change: -${meritAmount.toFixed(2)} MERIT`)
    console.log(`  - Total delta: ${meritDelta.value > 0 ? '+' : ''}${meritDelta.value.toFixed(2)} MERIT`)
  }

  // Computed values for tracking (not for display)
  const xlmDeltaFormatted = computed(() => {
    if (xlmDelta.value === 0) return ''
    const sign = xlmDelta.value > 0 ? '+' : ''
    return `${sign}${xlmDelta.value.toFixed(7)}`
  })

  const meritDeltaFormatted = computed(() => {
    if (meritDelta.value === 0) return ''
    const sign = meritDelta.value > 0 ? '+' : ''
    return `${sign}${meritDelta.value.toFixed(2)}`
  })

  const hasChanges = computed(() => {
    return xlmDelta.value !== 0 || meritDelta.value !== 0
  })

  // Reset deltas (for new session)
  const resetDeltas = () => {
    xlmDelta.value = 0
    meritDelta.value = 0
    transactionHistory.value = []
    console.log('🔄 Balance deltas reset')
  }

  // Get session summary
  const getSessionSummary = () => {
    const totalTransactions = transactionHistory.value.length
    const pixReceived = transactionHistory.value.filter(t => t.type === 'PIX_RECEIVED').length
    const pixSent = transactionHistory.value.filter(t => t.type === 'PIX_SENT').length
    
    return {
      totalTransactions,
      pixReceived,
      pixSent,
      xlmDelta: xlmDelta.value,
      meritDelta: meritDelta.value,
      history: transactionHistory.value
    }
  }

  return {
    xlmDelta,
    meritDelta,
    xlmDeltaFormatted,
    meritDeltaFormatted,
    hasChanges,
    transactionHistory,
    trackXLMIncrease,
    trackXLMDecrease,
    trackMeritIncrease,
    trackMeritDecrease,
    resetDeltas,
    getSessionSummary
  }
}
