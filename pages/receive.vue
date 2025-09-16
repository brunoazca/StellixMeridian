<template>
  <div class="receive-page">
    <div class="receive-container">
      <!-- Header -->
      <div class="receive-header">
        <button @click="goBack" class="back-button">
          <img src="/images/arrow.svg" alt="Back" class="back-icon" />
          <span class="back-text">Back</span>
        </button>
        <div class="spacer"></div>
      </div>

      <!-- Title -->
      <h1 class="page-title">Receive with PIX</h1>

      <!-- Receive Form -->
      <div class="receive-form">
        <div class="form-group">
          <label>Amount</label>
          <input 
            v-model="makePixForm.amount" 
            type="text"
            placeholder="R$ 00,00"
            class="form-input"
            @input="formatAmount"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="makePixForm.description" 
            placeholder="Add a note"
            class="form-textarea"
          ></textarea>
        </div>

        <!-- Merit Card -->
        <div class="merit-card">
          <div class="merit-content">
            <div class="merit-info">
              <h3>Use Merit to reduce fees</h3>
              <p class="estimated-fee">Estimated fee after Merit: R$ 2,50</p>
            </div>
            <label class="toggle-label">
              <input 
                v-model="makePixForm.useMerit" 
                type="checkbox" 
                class="toggle-input"
              />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <button 
          @click="handleMakePix" 
          :disabled="isProcessingPix" 
          class="submit-button"
        >
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processing...' : 'Continue' }}
        </button>

        <div v-if="isProcessingPix" class="processing-info">
          Processing PIX request...
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer">
        <div class="info-icon">ℹ️</div>
        <p class="disclaimer-text">
          The generated PIX code will be valid for 24 hours. Share it with the person who will send you the payment.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFreighter } from '~/composables/useFreighter'
import { usePIX } from '~/composables/usePIX'
import { useWalletAuth } from '~/composables/useWalletAuth'

// Composables
const { address } = useFreighter()
const { handleMakePix: processMakePix, isProcessingPix } = usePIX()
const { requireAuth } = useWalletAuth()

// Check wallet connection on mount
onMounted(() => {
  requireAuth()
})

// State
const makePixForm = ref({
  amount: '',
  description: '',
  useMerit: false
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
    makePixForm.value.amount = `R$ ${amount.replace('.', ',')}`
  } else {
    makePixForm.value.amount = ''
  }
}

const handleMakePix = async () => {
  if (!makePixForm.value.amount) {
    alert('Please fill in the amount')
    return
  }

  // Extract numeric value from formatted amount
  const numericAmount = makePixForm.value.amount.replace(/[^\d,]/g, '').replace(',', '.')

  try {
    const success = await processMakePix({
      walletAddress: address.value,
      amount: parseFloat(numericAmount),
      description: makePixForm.value.description,
      useMerit: makePixForm.value.useMerit
    })

    // Navigate to share PIX page regardless of API response
    navigateTo({
      path: '/share-pix',
      query: {
        amount: numericAmount,
        description: makePixForm.value.description
      }
    })
  } catch (error) {
    console.error('PIX creation failed:', error)
    // Still navigate to share page even if API fails
    navigateTo({
      path: '/share-pix',
      query: {
        amount: numericAmount,
        description: makePixForm.value.description
      }
    })
  }
}

// Meta tags
useHead({
  title: 'Receive PIX - Stellix',
  meta: [
    { name: 'description', content: 'Receive PIX using Stellar XLM' }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.receive-page {
  min-height: 100vh;
  background: #262626;
  padding: 1rem;
}

.receive-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.receive-header {
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

.receive-form {
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

.form-textarea {
  background: #17181A;
  border: none;
  border-radius: 14px;
  padding: 0.75rem 1rem;
  color: var(--white);
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  height: 90px;
  resize: none;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  background: #17181A;
}

.form-input::placeholder, .form-textarea::placeholder {
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

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-top: 2rem;
  padding: 1rem;
  background: rgba(48, 104, 191, 0.1);
  border-radius: 12px;
  border-left: 3px solid var(--accent-blue);
}

.info-icon {
  font-size: 1.2rem;
  color: var(--accent-blue);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.disclaimer-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--white);
  line-height: 1.4;
  margin: 0;
}

@media (max-width: 768px) {
  .receive-page {
    padding: 0.5rem;
  }
  
  .receive-container {
    padding-top: 1rem;
  }
  
  .disclaimer {
    margin-top: 1.5rem;
    padding: 0.75rem;
  }
}
</style>
