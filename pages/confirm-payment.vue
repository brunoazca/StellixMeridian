<template>
  <div class="confirm-page">
    <div class="confirm-container">
      <!-- Header -->
      <div class="confirm-header">
        <button @click="goBack" class="back-button">
          <img src="/images/arrow.svg" alt="Back" class="back-icon" />
          <span class="back-text">Back</span>
        </button>
        <div class="spacer"></div>
      </div>

      <!-- Title -->
      <h1 class="page-title">Confirm Payment</h1>
      <p class="page-subtitle">Review the details before sending</p>

      <!-- Payment Details -->
      <div class="payment-details-card">
        <!-- Recipient -->
        <div class="detail-section">
          <h3 class="section-label">Recipient</h3>
          <div class="detail-content">
            <p class="recipient-name">{{ recipientName }}</p>
            <p class="recipient-cpf">{{ paymentData.pixCode }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Amount -->
        <div class="detail-section">
          <h3 class="section-label">Amount</h3>
          <div class="detail-content">
            <p class="amount-brl">{{ displayAmount }}</p>
            <p class="amount-xlm">≈ {{ xlmAmount }} XLM</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Fees -->
        <div class="detail-section">
          <h3 class="section-label">Fees</h3>
          <div class="detail-content">
            <div class="fee-item">
              <span class="fee-label">Transaction fee</span>
              <span class="fee-value">R$ {{ BASE_FEE_BRL.toFixed(2).replace('.', ',') }}</span>
            </div>
            <div v-if="paymentData.useMerit && meritTokensUsed > 0" class="fee-item merit-applied">
              <span class="fee-label">Merit applied</span>
              <span class="fee-value">- {{ meritTokensUsed.toFixed(2) }} MERIT</span>
            </div>
            <div v-if="meritEarnings > 0" class="fee-item merit-earnings">
              <span class="fee-label">Merit earned (2% of XLM)</span>
              <span class="fee-value">+ {{ meritEarnings.toFixed(2) }} MERIT</span>
            </div>
            <div class="fee-item final-fee">
              <span class="fee-label">Final fee</span>
              <span class="fee-value">R$ {{ finalFee.replace('.', ',') }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- You will pay -->
        <div class="detail-section">
          <h3 class="section-label">You will pay</h3>
          <div class="detail-content">
            <p class="total-brl">R$ {{ totalAmount.replace('.', ',') }}</p>
            <p class="total-xlm">≈ {{ totalXlm }} XLM deducted</p>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Wallet -->
        <div class="detail-section wallet-section">
          <h3 class="section-label">Wallet</h3>
          <div class="detail-content">
            <div class="wallet-info">
              <img src="/images/wallet.svg" alt="Wallet" class="wallet-icon" />
              <span class="wallet-text">From wallet: Freighter</span>
            </div>
            <div class="balance-info">
              <p class="available-balance">Available: {{ availableBalance }} XLM</p>
              <div class="after-payment">
                <span class="after-payment-label">After payment</span>
                <span class="after-payment-value">{{ afterPaymentBalance }} XLM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <button 
        @click="processPayment" 
        :disabled="isProcessing" 
        class="continue-button"
      >
        <span v-if="isProcessing" class="loading-spinner">⏳</span>
        {{ isProcessing ? 'Processing...' : 'Continue' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePIX } from '~/composables/usePIX'
import { useXLMBalance } from '~/composables/useXLMBalance'
import { useMeritTokens } from '~/composables/useMeritTokens'
import { useFreighter } from '~/composables/useFreighter'

// Composables
const { handlePayPix: processPayPix } = usePIX()
const { xlmBalance, xlmBalanceBRL } = useXLMBalance()
const { meritBalance } = useMeritTokens()
const { address, isWalletConnected } = useFreighter()

// Constants
const MERIT_VALUE_USD = 0.0975 // $0.0975 per MERIT token
const BASE_FEE_BRL = 2.50 // R$ 2.50 base transaction fee
const MERIT_EARNINGS_RATE = 0.02 // 2% of XLM amount in MERIT tokens
const USD_TO_BRL_RATE = 5.20 // Approximate USD to BRL rate
const MERIT_VALUE_BRL = MERIT_VALUE_USD * USD_TO_BRL_RATE // MERIT value in BRL

// State
const isProcessing = ref(false)

// Get payment data from route query
const route = useRoute()
const paymentData = ref({
  amount: route.query.amount || '325,00',
  pixCode: route.query.pixCode || 'teste@gmail.com',
  useMerit: route.query.useMerit === 'true',
  recipientName: route.query.recipientName || 'João Silva Santos',
  recipientCpf: route.query.recipientCpf || '123.456.789-00'
})

// Computed values for display
const displayAmount = computed(() => {
  const amount = parseFloat(paymentData.value.amount)
  return `R$ ${amount.toFixed(2).replace('.', ',')}`
})

const xlmAmount = computed(() => {
  const amount = parseFloat(paymentData.value.amount)
  const xlmRate = 0.37 // Example rate: 1 BRL = 0.37 XLM
  return (amount * xlmRate).toFixed(2)
})

// Calculate MERIT tokens that will be earned from this transaction (2% of XLM amount)
const meritEarnings = computed(() => {
  const xlmAmountValue = parseFloat(xlmAmount.value)
  return xlmAmountValue * MERIT_EARNINGS_RATE
})

// Calculate total available MERIT (current balance + earnings from transaction)
const totalAvailableMerit = computed(() => {
  return meritBalance.value + meritEarnings.value
})

// Calculate how much MERIT is needed to cover the full fee
const meritNeededForFullFee = computed(() => {
  return BASE_FEE_BRL / MERIT_VALUE_BRL
})

// Calculate actual MERIT tokens used (limited by available amount)
const meritTokensUsed = computed(() => {
  if (!paymentData.value.useMerit) return 0
  
  // Use the minimum between what's needed and what's available
  return Math.min(meritNeededForFullFee.value, totalAvailableMerit.value)
})

// Calculate the BRL value of MERIT tokens used
const meritValueUsedBRL = computed(() => {
  return meritTokensUsed.value * MERIT_VALUE_BRL
})

const finalFee = computed(() => {
  if (!paymentData.value.useMerit) {
    return BASE_FEE_BRL.toFixed(2)
  }
  
  // Calculate final fee after MERIT reduction
  const feeAfterMeritReduction = Math.max(0, BASE_FEE_BRL - meritValueUsedBRL.value)
  return feeAfterMeritReduction.toFixed(2)
})

const totalAmount = computed(() => {
  const amount = parseFloat(paymentData.value.amount)
  const fee = parseFloat(finalFee.value)
  return (amount + fee).toFixed(2)
})

const totalXlm = computed(() => {
  const total = parseFloat(totalAmount.value)
  const xlmRate = 0.37
  return (total * xlmRate).toFixed(2)
})

// Wallet data
const availableBalance = computed(() => {
  return xlmBalance.value || '0.00'
})

const afterPaymentBalance = computed(() => {
  const current = parseFloat(availableBalance.value)
  const payment = parseFloat(totalXlm.value)
  return (current - payment).toFixed(2)
})

// Recipient data from wallet and payment form
const recipientName = computed(() => {
  // In real app, this would come from wallet or PIX lookup
  // For now, using a mock name based on wallet address
  if (address.value) {
    return `User ${address.value.slice(-4)}` // Last 4 chars of wallet address
  }
  return 'Unknown User'
})

const recipientCpf = computed(() => {
  return paymentData.value.recipientCpf
})

// Methods
const goBack = () => {
  navigateTo('/pay')
}

const processPayment = async () => {
  isProcessing.value = true
  
  try {
    // Process the actual PIX payment
    const success = await processPayPix({
      walletAddress: 'GD05MEIGATLKEQG57JTXAA7PJ5C3BE7Z5I6Y4L5T5VF0IJF4HTHVPREX',
      amount: parseFloat(paymentData.value.amount),
      pixKeyType: 'EMAIL',
      pixCode: paymentData.value.pixCode,
      useMerit: paymentData.value.useMerit
    })

    if (success) {
      navigateTo('/')
    }
  } catch (error) {
    console.error('Payment failed:', error)
    alert('Payment failed. Please try again.')
  } finally {
    isProcessing.value = false
  }
}

// Meta tags
useHead({
  title: 'Confirm Payment - Stellix',
  meta: [
    { name: 'description', content: 'Confirm your PIX payment' }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.confirm-page {
  min-height: 100vh;
  background: #262626;
  padding: 1rem;
}

.confirm-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.confirm-header {
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
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--light-gray);
  margin: 0 0 2rem 0;
  text-align: center;
}

.payment-details-card {
  background: #17181A;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.detail-section {
  padding: 1rem 0;
}

.divider {
  height: 1px;
  background: rgba(160, 168, 184, 0.2);
  margin: 1rem 0;
}

.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--light-gray);
  margin: 0 0 1rem 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recipient-name {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--white);
  margin: 0;
}

.recipient-cpf {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--light-gray);
  margin: 0;
}

.amount-brl {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

.amount-xlm {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--light-gray);
  margin: 0;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}


.fee-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--white);
}

.fee-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
}

.merit-applied .fee-label {
  color: var(--pix);
}

.merit-earnings .fee-label {
  color: #10b981;
}

.merit-earnings .fee-value {
  color: #10b981;
}

.final-fee {
  font-weight: 600;
}


.total-brl {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
}

.total-xlm {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--light-gray);
  margin: 0;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.wallet-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

.wallet-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--white);
}

.balance-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.available-balance {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--light-gray);
  margin: 0;
}

.after-payment {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.after-payment-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--light-gray);
}

.after-payment-value {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--white);
}

.continue-button {
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
  width: 100%;
}

.continue-button:hover:not(:disabled) {
  background: rgba(49, 188, 173, 0.8);
  transform: translateY(-2px);
}

.continue-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .confirm-page {
    padding: 0.5rem;
  }
  
  .confirm-container {
    padding-top: 1rem;
  }
}
</style>
