<template>
  <div class="share-pix-page">
    <div class="share-pix-container">
      <div class="share-pix-content">
        <!-- Header -->
        <div class="header">
          <div class="header-left">
            <button @click="cancelRequest" class="back-button">
              <img src="/images/arrow.svg" alt="Back" class="back-icon" />
              <span class="back-text">Back</span>
            </button>
          </div>
          <div class="header-center">
            <div class="logo-container">
              <img src="/images/logo.svg" alt="Stellix" class="logo" />
            </div>
          </div>
        </div>

        <!-- Page Title -->
        <div class="page-title">
          <h2>Receive with PIX</h2>
          <p class="subtitle">Use the CPF below to receive payments</p>
        </div>

        <!-- Copy and Paste Section -->
        <div class="copy-section">
          <h3 class="copy-label">PIX Key (CPF)</h3>
          <div class="copy-field">
            <span class="pix-key">19921785770</span>
            <button @click="copyCPF" class="copy-button">
              <img src="/images/copy.svg" alt="Copy" class="copy-icon" />
            </button>
          </div>
          <p class="copy-instruction">Copy this CPF and use it as PIX key in your bank app</p>
        </div>

        <!-- Simple Instructions -->
        <div class="instructions">
          <h3 class="instructions-title">How to send PIX</h3>
          <ol class="instructions-list">
            <li>Open your bank app</li>
            <li>Select PIX transfer</li>
            <li>Use the CPF above as PIX key</li>
            <li>Enter the amount you want to send</li>
            <li>Confirm the transfer</li>
          </ol>
          <p class="note">XLM will be transferred to your wallet automatically after PIX confirmation</p>
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
// Get wallet address from route query for XLM transfer tracking
const route = useRoute()
const walletAddress = route.query.walletAddress || ''

// Simple CPF for PIX transfers
const pixCPF = '19921785770'

// Copy CPF to clipboard
const copyCPF = async () => {
  try {
    await navigator.clipboard.writeText(pixCPF)
    console.log('✅ CPF copied to clipboard:', pixCPF)
  } catch (error) {
    console.error('❌ Failed to copy CPF:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = pixCPF
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Cancel and go back
const cancelRequest = () => {
  navigateTo('/')
}

// Store wallet address for monitoring (when PIX is received, XLM will be transferred to this address)
console.log('📋 Wallet for XLM transfer:', walletAddress)

// Meta tags
useHead({
  title: 'Receive with PIX - Stellix',
  meta: [
    { name: 'description', content: 'Receive payments with PIX' }
  ]
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.share-pix-page {
  min-height: 100vh;
  background: #262626;
  padding: 1rem;
}

.share-pix-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 2rem;
}

.share-pix-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.header-left {
  flex: 1;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.back-button {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--white);
  transition: opacity 0.3s ease;
}

.back-button:hover {
  opacity: 0.7;
}

.back-icon {
  width: 20px;
  height: 20px;
}

.back-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
}

.logo {
  height: 40px;
}

/* Page Title */
.page-title {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 0.5rem 0;
}

.subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--light-gray);
  margin: 0;
}

/* Copy Section */
.copy-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.copy-label {
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 1rem 0;
}

.copy-field {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.pix-key {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.copy-button {
  background: #10b981;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copy-button:hover {
  background: #059669;
  transform: translateY(-1px);
}

.copy-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.copy-instruction {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: var(--light-gray);
  margin: 0;
}

/* Instructions */
.instructions {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
}

.instructions-title {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--white);
  margin: 0 0 1rem 0;
}

.instructions-list {
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  color: var(--light-gray);
  margin: 0 0 1rem 0;
  padding-left: 1.2rem;
}

.instructions-list li {
  margin-bottom: 0.5rem;
}

.note {
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  color: #10b981;
  font-weight: 500;
  margin: 0;
  padding: 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* Cancel Button */
.cancel-button {
  background: #E85035;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.cancel-button:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* CSS Variables */
:root {
  --white: #ffffff;
  --light-gray: #9ca3af;
}
</style>