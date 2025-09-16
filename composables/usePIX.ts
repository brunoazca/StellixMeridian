import { ref } from 'vue'

export const usePIX = () => {
  // State
  const showMakePix = ref(false)
  const showPayPix = ref(false)
  const isProcessingPix = ref(false)

  // Methods
  const handleMakePix = async (data: { walletAddress: string; amount: number; recipientEmail: string; recipientName?: string }) => {
    isProcessingPix.value = true
    try {
      const response = await $fetch('/api/pix/make', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        alert(`PIX realizado com sucesso!\nID: ${response.transactionId}\nValor: R$ ${response.amount}\nDestinatário: ${response.recipientEmail}`)
        showMakePix.value = false
        return true
      }
    } catch (error) {
      console.error('Erro ao fazer PIX:', error)
      alert('Erro ao processar PIX')
      return false
    } finally {
      isProcessingPix.value = false
    }
  }

  const handlePayPix = async (data: { walletAddress: string; amount: number; pixCode: string }) => {
    isProcessingPix.value = true
    try {
      const response = await $fetch('/api/pix/pay', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        alert(`PIX pago com sucesso!\nID: ${response.paymentId}`)
        showPayPix.value = false
        return true
      }
    } catch (error) {
      console.error('Erro ao pagar PIX:', error)
      alert('Erro ao processar pagamento PIX')
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
