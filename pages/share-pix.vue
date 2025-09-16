<template>
  <div class="share-page">
    <div class="share-container">
      <!-- Header -->
      <div class="share-header">
        <button @click="goBack" class="back-button">
          <img src="/images/arrow.svg" alt="Back" class="back-icon" />
          <span class="back-text">Back</span>
        </button>
        <div class="spacer"></div>
      </div>

      <!-- Title -->
      <h1 class="page-title">Share this PIX</h1>

      <!-- Main Content -->
      <div class="share-content">
        <!-- QR Code -->
        <div class="qr-section">
          <div class="qr-code">
            <div class="qr-placeholder">
              <div class="qr-grid">
                <div v-for="i in 64" :key="i" class="qr-dot"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Copy and Paste Section -->
        <div class="copy-section">
          <h3 class="copy-label">Copia e Cola</h3>
          <div v-if="isGeneratingPix" class="loading-state">
            <span class="loading-spinner">⏳</span>
            <span class="loading-text">Generating PIX code...</span>
          </div>
          <div v-else-if="pixError" class="error-state">
            <span class="error-text">{{ pixError }}</span>
            <button @click="generatePixCode" class="retry-button">Retry</button>
          </div>
          <div v-else class="copy-field">
            <span class="pix-code">{{ pixCode }}</span>
            <button @click="copyPixCode" class="copy-button" :disabled="!pixCode">
              <img src="/images/copy.svg" alt="Copy" class="copy-icon" />
            </button>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Amount to pay</span>
            <span class="detail-value">{{ displayAmount }}</span>
          </div>
          <div v-if="totalPaymentAmount.value > parseFloat(paymentData.amount)" class="detail-row receive-info">
            <span class="detail-label">You will receive</span>
            <span class="detail-value">R$ {{ parseFloat(paymentData.amount).toFixed(2).replace('.', ',') }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">{{ paymentData.description || 'No description' }}</span>
          </div>
        </div>

        <!-- Fee Breakdown (only show after PIX is generated) -->
        <div v-if="!isGeneratingPix && pixCode && feeBreakdown.originalFee > 0" class="fee-breakdown">
          <h3 class="fee-breakdown-title">Fee Breakdown</h3>
          
          <div class="fee-item">
            <span class="fee-label">Transaction fee (2.3%)</span>
            <span class="fee-value">R$ {{ feeBreakdown.originalFee.toFixed(2).replace('.', ',') }}</span>
          </div>
          
          <div v-if="paymentData.useMerit && feeBreakdown.meritUsed > 0" class="fee-item merit-applied">
            <span class="fee-label">Merit applied</span>
            <span class="fee-value">-{{ feeBreakdown.meritUsed.toFixed(2) }} tokens (R$ {{ (feeBreakdown.originalFee - feeBreakdown.finalFee).toFixed(2).replace('.', ',') }})</span>
          </div>
          
          <div class="fee-item final-fee">
            <span class="fee-label">Final fee</span>
            <span class="fee-value">R$ {{ feeBreakdown.finalFee.toFixed(2).replace('.', ',') }}</span>
          </div>
        </div>

        <!-- Cancel Button -->
        <button @click="cancelRequest" class="cancel-button">
          Cancel request
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Get payment data from route query
const route = useRoute()
const paymentData = ref({
  amount: route.query.amount || '150,00',
  description: route.query.description || 'Payment for services',
  walletAddress: route.query.walletAddress || '',
  useMerit: route.query.useMerit === 'true',
  meritBalance: parseFloat(route.query.meritBalance) || 0
})

// PIX code state
const pixCode = ref('')
const isGeneratingPix = ref(false)
const pixError = ref('')
const totalPaymentAmount = ref(0)

// Fee breakdown data
const feeBreakdown = ref({
  originalFee: 0,
  meritUsed: 0,
  finalFee: 0,
  totalAvailableMerit: 0
})

// Transaction data embedded in PIX code
const transactionData = ref({
  walletAddressShort: '',
  transactionInfo: '',
  meritDebit: 0
})

// Computed values
const displayAmount = computed(() => {
  // Show the total amount that needs to be paid (after API calculation)
  if (totalPaymentAmount.value > 0) {
    return `R$ ${totalPaymentAmount.value.toFixed(2).replace('.', ',')}`
  }
  // Fallback to requested amount while loading
  const amount = parseFloat(paymentData.value.amount)
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
})

// Generate PIX code using API
const generatePixCode = async () => {
  isGeneratingPix.value = true
  pixError.value = ''
  
  try {
    const response = await $fetch('/api/pix/make', {
      method: 'POST',
      body: {
        amount: parseFloat(paymentData.value.amount),
        walletAddress: paymentData.value.walletAddress,
        description: paymentData.value.description,
        useMerit: paymentData.value.useMerit,
        meritBalance: paymentData.value.meritBalance
      }
    })

    if (response.success) {
      // Store the total payment amount calculated by the API
      totalPaymentAmount.value = response.totalAmount || parseFloat(paymentData.value.amount)
      
      // Store fee breakdown data
      feeBreakdown.value = {
        originalFee: response.feeAmount || 0,
        meritUsed: response.meritTokensUsed || 0,
        finalFee: response.finalFeeAmount || 0,
        totalAvailableMerit: response.totalAvailableMerit || 0
      }
      
      // Store transaction data embedded in PIX code
      transactionData.value = {
        walletAddressShort: response.walletAddressShort || '',
        transactionInfo: response.transactionInfo || '',
        meritDebit: response.meritTokensUsed || 0
      }
      
      // Use the PIX code from the API
      if (response.pixCode) {
        pixCode.value = response.pixCode
        console.log('✅ PIX code generated:', response.pixCode)
      } else {
        // Fallback to mock code
        pixCode.value = generateMockPixCode()
        console.log('✅ Using mock PIX code')
      }
      console.log('✅ PIX payment created successfully:', response)
      console.log('💰 Total amount to be paid:', totalPaymentAmount.value)
      console.log('💎 Fee breakdown:', feeBreakdown.value)
    } else {
      throw new Error('Failed to generate PIX code')
    }
  } catch (error) {
    console.error('❌ Error generating PIX code:', error)
    pixError.value = 'Failed to generate PIX code. Please try again.'
    // Generate a mock code as fallback
    pixCode.value = generateMockPixCode()
  } finally {
    isGeneratingPix.value = false
  }
}

// Generate mock PIX code for demonstration
const generateMockPixCode = () => {
  const amount = parseFloat(paymentData.value.amount).toFixed(2)
  const recipientKey = paymentData.value.recipientKey
  const recipientName = paymentData.value.recipientName
  
  // This is a simplified mock PIX code format
  return `00020126580014br.gov.bcb.pix0114${recipientKey}520400005303986540${amount}5802BR5913${recipientName.substring(0, 25)}6008Brasilia62070503***6304`
}

// Methods
const goBack = () => {
  navigateTo('/receive')
}

const copyPixCode = async () => {
  try {
    await navigator.clipboard.writeText(pixCode.value)
    alert('PIX code copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
    alert('Failed to copy PIX code')
  }
}

const cancelRequest = () => {
  if (confirm('Are you sure you want to cancel this PIX request?')) {
    navigateTo('/')
  }
}

// Generate PIX code when component mounts
onMounted(() => {
  generatePixCode()
})

// Meta tags
useHead({
  title: 'Share PIX - Stellix',
  meta: [
    { name: 'description', content: 'Share your PIX payment request' }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.share-page {
  min-height: 100vh;
  background: #262626;
  padding: 1rem;
}

.share-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.share-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.back-button {
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.back-button:hover {
  opacity: 0.7;
}

.back-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.back-text {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--white);
}

.spacer {
  width: 100px;
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 2rem 0;
  text-align: center;
}

.share-content {
  background: #17181A;
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.qr-section {
  display: flex;
  justify-content: center;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: white;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  width: 100%;
  height: 100%;
}

.qr-dot {
  background: #000;
  border-radius: 1px;
}

.qr-dot:nth-child(odd) {
  background: #000;
}

.qr-dot:nth-child(even) {
  background: #fff;
}

.copy-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.copy-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--light-gray);
  margin: 0;
}

.copy-field {
  background: #1B2A41;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.pix-code {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--white);
  word-break: break-all;
  flex: 1;
}

.copy-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.copy-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.copy-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.loading-state {
  background: #1B2A41;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.loading-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--white);
}

.error-state {
  background: rgba(232, 80, 53, 0.1);
  border: 1px solid rgba(232, 80, 53, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.error-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: #E85035;
  text-align: center;
}

.retry-button {
  background: #E85035;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background: rgba(232, 80, 53, 0.8);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.payment-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--light-gray);
}

.detail-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
}

.receive-info .detail-label {
  color: #10b981;
}

.receive-info .detail-value {
  color: #10b981;
  font-weight: 600;
}

/* Fee Breakdown Styles */
.fee-breakdown {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.fee-breakdown-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--light-gray);
}

.fee-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
}

.merit-applied .fee-label {
  color: #10b981;
}

.merit-applied .fee-value {
  color: #10b981;
  font-weight: 600;
}

.final-fee .fee-label {
  font-weight: 600;
  color: var(--white);
}

.final-fee .fee-value {
  font-weight: 600;
  color: var(--white);
  font-size: 1rem;
}

/* Transaction Data Styles */
.transaction-data {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.transaction-data-title {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: #8b5cf6;
  margin: 0 0 0.75rem 0;
  text-align: center;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--light-gray);
}

.transaction-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--white);
}

.merit-debit .transaction-label {
  color: #f59e0b;
}

.merit-debit .transaction-value {
  color: #f59e0b;
  font-weight: 600;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.cancel-button {
  background: #E85035;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  color: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.cancel-button:hover {
  background: rgba(232, 80, 53, 0.8);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .share-page {
    padding: 0.5rem;
  }
  
  .share-container {
    padding-top: 1rem;
  }
  
  .qr-code {
    width: 180px;
    height: 180px;
  }
}
</style>
