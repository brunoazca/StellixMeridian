import { ref } from 'vue'

// Tipos para as respostas da API
interface PIXMakeResponse {
  success: boolean
  transactionId?: string
  amount?: number
  recipientKey?: string
  pixKeyType?: string
  timestamp: string
  message: string
}

interface PIXPayResponse {
  success: boolean
  paymentId?: string
  amount?: string
  pixCode?: string
  pixType?: string
  isCopiaECola?: boolean
  status?: string
  timestamp: string
  message: string
}

export const usePIX = () => {
  // State
  const showMakePix = ref(false)
  const showPayPix = ref(false)
  const isProcessingPix = ref(false)

  // Methods
  const handleMakePix = async (data: { walletAddress: string; amount: number; pixKeyType: string; recipientKey: string; recipientName?: string }) => {
    isProcessingPix.value = true
    try {
      const response = await $fetch<PIXMakeResponse>('/api/pix/make', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        const message = `PIX criado com sucesso!\n\n` +
          `💰 Valor: R$ ${response.amount || 'N/A'}\n` +
          `🆔 ID: ${response.transactionId || 'N/A'}\n` +
          `📋 Tipo: ${response.pixKeyType || 'N/A'}\n` +
          `📄 Destinatário: ${response.recipientKey || 'N/A'}\n` +
          `⏰ Data: ${new Date(response.timestamp).toLocaleString('pt-BR')}`
        
        alert(message)
        showMakePix.value = false
        return true
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar PIX:', error)
      
      let errorMessage = 'Erro ao processar PIX'
      if (error.data?.statusMessage) {
        errorMessage = error.data.statusMessage
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`❌ ${errorMessage}`)
      return false
    } finally {
      isProcessingPix.value = false
    }
  }

  const handlePayPix = async (data: { walletAddress: string; amount: number; pixCode: string; useMerit?: boolean }) => {
    isProcessingPix.value = true
    try {
      console.log('🔄 Iniciando pagamento PIX:', data)
      
      const response = await $fetch<PIXPayResponse>('/api/pix/pay', {
        method: 'POST',
        body: {
          walletAddress: data.walletAddress,
          amount: data.amount,
          pixCode: data.pixCode,
          useMerit: data.useMerit || false
        }
      })

      if (response.success) {
        const pixTypeLabel = response.isCopiaECola ? 'PIX Copia e Cola' : `Chave PIX (${response.pixType})`
        const message = `PIX pago com sucesso!\n\n` +
          `💰 Valor: R$ ${response.amount}\n` +
          `🆔 ID: ${response.paymentId}\n` +
          `📋 Tipo: ${pixTypeLabel}\n` +
          `📄 Código: ${response.pixCode}\n` +
          `✅ Status: ${response.status}\n` +
          `⏰ Data: ${new Date(response.timestamp).toLocaleString('pt-BR')}`
        
        alert(message)
        showPayPix.value = false
        return true
      } else {
        alert('PIX payment failed')
        return false
      }
    } catch (error: any) {
      console.error('❌ Erro ao pagar PIX:', error)
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro ao processar pagamento PIX'
      
      if (error.data?.statusMessage) {
        errorMessage = error.data.statusMessage
      } else if (error.message) {
        errorMessage = error.message
      }
      
      alert(`❌ ${errorMessage}`)
      return false
    } finally {
      isProcessingPix.value = false
    }
  }

  const openMakePix = () => {
    showMakePix.value = true
  }

  const openPayPix = () => {
    showPayPix.value = true
  }

  const closeMakePix = () => {
    showMakePix.value = false
  }

  const closePayPix = () => {
    showPayPix.value = false
  }

  return {
    showMakePix,
    showPayPix,
    isProcessingPix,
    handleMakePix,
    handlePayPix,
    openMakePix,
    openPayPix,
    closeMakePix,
    closePayPix
  }
}
