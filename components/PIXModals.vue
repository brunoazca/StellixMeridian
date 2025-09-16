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
          <label>PIX Key Type</label>
          <select v-model="makePixForm.pixKeyType" class="pix-type-selector">
            <option value="EMAIL">Email</option>
            <option value="CPF">CPF</option>
          </select>
        </div>
        <div class="form-group">
          <label>{{ makePixForm.pixKeyType === 'EMAIL' ? 'Recipient Email' : 'Recipient CPF' }}</label>
          <input 
            v-model="makePixForm.recipientKey" 
            :type="makePixForm.pixKeyType === 'EMAIL' ? 'email' : 'text'"
            :placeholder="makePixForm.pixKeyType === 'EMAIL' ? 'recipient@example.com' : '000.000.000-00'" 
          />
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

  <!-- Pay PIX Modal - Removed: Pay now navigates to /pay page -->
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
  pixKeyType: 'EMAIL',
  recipientKey: '',
  recipientName: ''
})

// payPixForm removed - Pay PIX now handled by /pay page

// Methods
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateCPF = (cpf) => {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '')
  
  // Check if CPF has 11 digits
  if (cpf.length !== 11) return false
  
  // Check for known invalid CPFs
  if (/^(\d)\1{10}$/.test(cpf)) return false
  
  // Validate CPF algorithm
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(9))) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cpf.charAt(10))) return false
  
  return true
}

const formatCPF = (cpf) => {
  // Remove non-numeric characters
  cpf = cpf.replace(/[^\d]/g, '')
  
  // Apply CPF mask
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const handleMakePix = async () => {
  if (!makePixForm.value.amount || !makePixForm.value.recipientKey) {
    alert('Please fill in the amount and recipient key')
    return
  }

  // Validate based on key type
  if (makePixForm.value.pixKeyType === 'EMAIL') {
    if (!validateEmail(makePixForm.value.recipientKey)) {
      alert('Invalid email')
      return
    }
  } else if (makePixForm.value.pixKeyType === 'CPF') {
    if (!validateCPF(makePixForm.value.recipientKey)) {
      alert('Invalid CPF')
      return
    }
  }

  emit('pix-success', 'make', {
    walletAddress: address.value,
    amount: parseFloat(makePixForm.value.amount),
    pixKeyType: makePixForm.value.pixKeyType,
    recipientKey: makePixForm.value.recipientKey,
    recipientName: makePixForm.value.recipientName
  })

  // Reset form
  makePixForm.value = { amount: '', pixKeyType: 'EMAIL', recipientKey: '', recipientName: '' }
}

// handlePayPix removed - Pay PIX functionality moved to /pay page
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

.pix-type-selector {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.pix-type-selector:focus {
  outline: none;
  border-color: var(--pix);
  background: rgba(255, 255, 255, 0.1);
}

.pix-type-selector option {
  background: #17181A;
  color: white;
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
