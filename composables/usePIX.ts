import { ref } from 'vue'

export const usePIX = () => {
  // State
  const showMakePix = ref(false)
  const showPayPix = ref(false)
  const isProcessingPix = ref(false)

  // Methods
  const handleMakePix = async (data: { walletAddress: string; amount: number; pixKeyType: string; recipientKey: string; recipientName?: string }) => {
    isProcessingPix.value = true
    try {
      const response = await $fetch('/api/pix/make', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        alert(`PIX completed successfully!\nID: ${response.transactionId}\nAmount: R$ ${response.amount}\nRecipient: ${response.recipientKey} (${response.pixKeyType})`)
        showMakePix.value = false
        return true
      }
    } catch (error) {
      console.error('Error making PIX:', error)
      alert('Error processing PIX')
      return false
    } finally {
      isProcessingPix.value = false
    }
  }

  const handlePayPix = async (data: { walletAddress: string; amount: number; pixKeyType: string; pixCode: string }) => {
    isProcessingPix.value = true
    try {
      const response = await $fetch('/api/pix/pay', {
        method: 'POST',
        body: data
      })

      if (response.success) {
        alert(`PIX paid successfully!\nID: ${response.paymentId}\nAmount: R$ ${response.amount}\nRecipient: ${response.pixCode} (${response.pixKeyType})\nStatus: ${response.status}`)
        showPayPix.value = false
        return true
      } else {
        alert('PIX payment failed')
        return false
      }
    } catch (error) {
      console.error('Error paying PIX:', error)
      alert('Error processing PIX payment')
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
