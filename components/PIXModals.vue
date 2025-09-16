<template>
  <!-- Make PIX Modal -->
  <div v-if="showMakePix" class="modal-overlay" @click="$emit('close-make-pix')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>💸 Receive PIX</h3>
        <button @click="$emit('close-make-pix')" class="close-button">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Amount (R$)</label>
          <input v-model="makePixForm.amount" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Recipient Email</label>
          <input v-model="makePixForm.recipientEmail" type="email" placeholder="recipient@example.com" />
        </div>
        <div class="form-group">
          <label>Recipient Name (optional)</label>
          <input v-model="makePixForm.recipientName" type="text" placeholder="Full name" />
        </div>
        <button @click="handleMakePix" :disabled="isProcessingPix" class="submit-button">
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processing...' : 'Receive PIX' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Pay PIX Modal -->
  <div v-if="showPayPix" class="modal-overlay" @click="$emit('close-pay-pix')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>💳 Pay PIX</h3>
        <button @click="$emit('close-pay-pix')" class="close-button">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Amount (R$)</label>
          <input v-model="payPixForm.amount" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>PIX Email</label>
          <input v-model="payPixForm.pixCode" type="text" placeholder="Enter PIX email here" />
        </div>
        <button @click="handlePayPix" :disabled="isProcessingPix" class="submit-button">
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processing...' : 'Pay PIX' }}
        </button>
        <div v-if="isProcessingPix" class="processing-info">
          Processing PIX payment...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFreighter } from '~/composables/useFreighter'

// Props
const props = defineProps({
  showMakePix: Boolean,
  showPayPix: Boolean,
  isProcessingPix: Boolean
})

// Emits
const emit = defineEmits(['close-make-pix', 'close-pay-pix', 'pix-success'])

// Composables
const { address } = useFreighter()

// State
const makePixForm = ref({
  amount: '',
  recipientEmail: '',
  recipientName: ''
})

const payPixForm = ref({
  amount: '',
  pixCode: ''
})

// Methods
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const handleMakePix = async () => {
  if (!makePixForm.value.amount || !makePixForm.value.recipientEmail) {
    alert('Please fill in the amount and recipient email')
    return
  }

  if (!validateEmail(makePixForm.value.recipientEmail)) {
    alert('Invalid email')
    return
  }

  emit('pix-success', 'make', {
    walletAddress: address.value,
    amount: parseFloat(makePixForm.value.amount),
    recipientEmail: makePixForm.value.recipientEmail,
    recipientName: makePixForm.value.recipientName
  })

  // Reset form
  makePixForm.value = { amount: '', recipientEmail: '', recipientName: '' }
}

const handlePayPix = async () => {
  if (!payPixForm.value.amount || !payPixForm.value.pixCode) {
    alert('Please fill in all fields')
    return
  }

  emit('pix-success', 'pay', {
    walletAddress: address.value,
    amount: parseFloat(payPixForm.value.amount),
    pixCode: payPixForm.value.pixCode
  })

  // Reset form
  payPixForm.value = { amount: '', pixCode: '' }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: #17181A;
  border: none;
  border-radius: 1.5rem;
  backdrop-filter: blur(16px);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #A0A8B8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: white;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--pix);
  background: rgba(255, 255, 255, 0.1);
}

.form-group input::placeholder {
  color: #A0A8B8;
}

.submit-button {
  width: 100%;
  background: var(--pix);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  font-family: 'Inter', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-button:hover:not(:disabled) {
  background: rgba(49, 188, 173, 0.8);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(49, 188, 173, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.processing-info {
  text-align: center;
  color: var(--pix);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  margin-top: 1rem;
  padding: 0.5rem;
  background: rgba(49, 188, 173, 0.1);
  border-radius: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .modal {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
  
  .modal-header, .modal-body {
    padding: 1rem;
  }
}
</style>
