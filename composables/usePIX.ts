import { ref } from 'vue'
import { useFreighter } from './useFreighter'

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
    // Navigate directly to CPF copy/paste page, skipping receive form
    // Pass wallet address for XLM transfer tracking
    const { address } = useFreighter()
    navigateTo({
      path: '/share-pix',
      query: {
        walletAddress: address.value || ''
      }
    })
  }

  const openPayPix = () => {
    // Navigate to pay page instead of opening modal
    navigateTo('/pay')
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
