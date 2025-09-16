<template>
  <div class="pay-page">
    <div class="pay-container">
      <!-- Header -->
      <div class="pay-header">
        <button @click="goBack" class="back-button">
          <img src="/images/arrow.svg" alt="Back" class="back-icon" />
          <span class="back-text">Back</span>
        </button>
        <div class="spacer"></div>
      </div>

      <!-- Title -->
      <h1 class="page-title">Pay with PIX</h1>

      <!-- Pay Form -->
      <div class="pay-form">
        <div class="form-group">
          <label>PIX key or BR Code</label>
          <input 
            v-model="payPixForm.pixCode" 
            type="text"
            placeholder="Paste Code or Key"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Amount</label>
          <input 
            v-model="payPixForm.amount" 
            type="text"
            placeholder="R$ 00,00"
            class="form-input"
            @input="formatAmount"
          />
        </div>

        <!-- Merit Card -->
        <div class="merit-card">
          <div class="merit-content">
            <div class="merit-info">
              <h3>Use Merit to reduce fees</h3>
              <p v-if="payPixForm.useMerit" class="estimated-fee">Estimated fee after Merit: R$ {{ estimatedFeeAfterMerit }}</p>
              <p v-else class="estimated-fee">Transaction fee (2.3%): R$ {{ estimatedFeeAfterMerit }}</p>
              <p v-if="estimatedMeritEarnings > 0" class="merit-earnings-info">
                You will earn {{ estimatedMeritEarnings.toFixed(2) }} MERIT tokens (2% of XLM)
              </p>
            </div>
            <label class="toggle-label">
              <input 
                v-model="payPixForm.useMerit" 
                type="checkbox" 
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button 
          @click="handlePayPix" 
          :disabled="isProcessingPix" 
          class="submit-button"
        >
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processing...' : 'Continue' }}
        </button>

        <div v-if="isProcessingPix" class="processing-info">
          Processing PIX payment...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFreighter } from '~/composables/useFreighter'
import { usePIX } from '~/composables/usePIX'
import { useMeritTokens } from '~/composables/useMeritTokens'

// Composables
const { address } = useFreighter()
const { handlePayPix: processPayPix, isProcessingPix } = usePIX()
const { meritBalance } = useMeritTokens()

// Constants
const MERIT_VALUE_USD = 0.0975
const USD_TO_BRL_RATE = 5.20
const MERIT_VALUE_BRL = MERIT_VALUE_USD * USD_TO_BRL_RATE
const FEE_RATE = 0.023 // 2.3% taxa
const MERIT_EARNINGS_RATE = 0.02

// State
const payPixForm = ref({
  amount: '',
  pixCode: '',
  useMerit: false
})

// Computed
const estimatedFeeAfterMerit = computed(() => {
  // Parse amount from formatted string
  const numericAmount = payPixForm.value.amount.replace(/[^\d,]/g, '').replace(',', '.')
  const amount = parseFloat(numericAmount) || 0
  
  if (amount === 0) {
    return '0,00'
  }
  
  // Calculate base fee (2.3% of amount)
  const baseFee = amount * FEE_RATE
  
  if (!payPixForm.value.useMerit) {
    return baseFee.toFixed(2).replace('.', ',')
  }
  
  // Calculate XLM amount (assuming 1 BRL = 0.37 XLM)
  const xlmAmount = amount * 0.37
  
  // Calculate MERIT earnings (2% of XLM)
  const meritEarnings = xlmAmount * MERIT_EARNINGS_RATE
  
  // Total available MERIT
  const totalAvailableMerit = meritBalance.value + meritEarnings
  
  // MERIT needed to cover full fee
  const meritNeededForFullFee = baseFee / MERIT_VALUE_BRL
  
  // Actual MERIT used
  const meritUsed = Math.min(meritNeededForFullFee, totalAvailableMerit)
  
  // Final fee after MERIT reduction
  const finalFee = Math.max(0, baseFee - (meritUsed * MERIT_VALUE_BRL))
  
  return finalFee.toFixed(2).replace('.', ',')
})

const estimatedMeritEarnings = computed(() => {
  if (!payPixForm.value.amount) return 0
  
  // Parse amount from formatted string
  const numericAmount = payPixForm.value.amount.replace(/[^\d,]/g, '').replace(',', '.')
  const amount = parseFloat(numericAmount) || 0
  
  // Calculate XLM amount (assuming 1 BRL = 0.37 XLM)
  const xlmAmount = amount * 0.37
  
  // Calculate MERIT earnings (2% of XLM)
  return xlmAmount * MERIT_EARNINGS_RATE
})

// Methods
const goBack = () => {
  navigateTo('/')
}

const formatAmount = (event) => {
  let value = event.target.value.replace(/\D/g, '') // Remove non-digits
  if (value) {
    // Convert to currency format (R$ 00,00)
    const amount = (parseInt(value) / 100).toFixed(2)
    payPixForm.value.amount = `R$ ${amount.replace('.', ',')}`
  } else {
    payPixForm.value.amount = ''
  }
}

const handlePayPix = async () => {
  if (!payPixForm.value.amount || !payPixForm.value.pixCode) {
    alert('Please fill in the amount and PIX code')
    return
  }

  // Navigate to confirmation page with payment data
  const numericAmount = payPixForm.value.amount.replace(/[^\d,]/g, '').replace(',', '.')
  
  // Extract recipient info from PIX code (mock for now)
  const recipientName = 'João Silva Santos' // In real app, would come from PIX lookup
  const recipientCpf = '123.456.789-00' // In real app, would come from PIX lookup
  
  navigateTo({
    path: '/confirm-payment',
    query: {
      amount: numericAmount,
      pixCode: payPixForm.value.pixCode,
      useMerit: payPixForm.value.useMerit,
      recipientName: recipientName,
      recipientCpf: recipientCpf
    }
  })
}

// Meta tags
useHead({
  title: 'Pay PIX - Stellix',
  meta: [
    { name: 'description', content: 'Pay PIX using Stellar XLM' }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.pay-page {
  min-height: 100vh;
  background: #262626;
  padding: 1rem;
}

.pay-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.pay-header {
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
  width: 100px; /* Adjust for button with text */
}

.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 2rem 0;
  text-align: center;
}

.pay-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
}

.form-input, .form-select {
  background: #17181A;
  border: none;
  border-radius: 14px;
  padding: 0.75rem 1rem;
  color: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus, .form-select:focus {
  outline: none;
  background: #17181A;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.merit-card {
  background: #17181A;
  border-radius: 16px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.merit-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.merit-info h3 {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 0.5rem 0;
}

.estimated-fee {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--light-gray);
  margin: 0 0 0.5rem 0;
}

.merit-earnings-info {
  font-family: 'Inter', sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  color: #10b981;
  margin: 0;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.toggle-input {
  display: none;
}

.toggle-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-input:checked + .toggle-slider {
  background: var(--pix);
}

.toggle-input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.submit-button {
  background: var(--pix);
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  color: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  background: rgba(49, 188, 173, 0.8);
  transform: translateY(-2px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.processing-info {
  text-align: center;
  color: var(--light-gray);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  margin-top: 1rem;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .pay-page {
    padding: 0.5rem;
  }
  
  .pay-container {
    padding-top: 1rem;
  }
  
  .pay-form {
    padding: 1.5rem;
  }
}
</style>
