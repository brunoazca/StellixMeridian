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
          <div class="copy-field">
            <span class="pix-code">{{ pixCode }}</span>
            <button @click="copyPixCode" class="copy-button">
              <img src="/images/copy.svg" alt="Copy" class="copy-icon" />
            </button>
          </div>
        </div>

        <!-- Payment Details -->
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Amount</span>
            <span class="detail-value">{{ displayAmount }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Description</span>
            <span class="detail-value">{{ paymentData.description || 'No description' }}</span>
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
import { ref, computed } from 'vue'

// Get payment data from route query
const route = useRoute()
const paymentData = ref({
  amount: route.query.amount || '150,00',
  description: route.query.description || 'Payment for services'
})

// Computed values
const displayAmount = computed(() => {
  const amount = parseFloat(paymentData.value.amount)
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
})

// Mock PIX code (in real app would come from API)
const pixCode = ref('00020126580014br.gov.bcb.pix0114+5511999999999520400005303986540150.005802BR5913Teste Pagamento6008Brasilia62070503***6304')

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
