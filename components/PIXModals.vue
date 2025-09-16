<template>
  <!-- Make PIX Modal -->
  <div v-if="showMakePix" class="modal-overlay" @click="$emit('close-make-pix')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>💸 Fazer PIX</h3>
        <button @click="$emit('close-make-pix')" class="close-button">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input v-model="makePixForm.amount" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Email do Destinatário</label>
          <input v-model="makePixForm.recipientEmail" type="email" placeholder="destinatario@exemplo.com" />
        </div>
        <div class="form-group">
          <label>Nome do Destinatário (opcional)</label>
          <input v-model="makePixForm.recipientName" type="text" placeholder="Nome completo" />
        </div>
        <button @click="handleMakePix" :disabled="isProcessingPix" class="submit-button">
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processando...' : 'Fazer PIX' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Pay PIX Modal -->
  <div v-if="showPayPix" class="modal-overlay" @click="$emit('close-pay-pix')">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h3>💳 Pagar PIX</h3>
        <button @click="$emit('close-pay-pix')" class="close-button">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Valor (R$)</label>
          <input v-model="payPixForm.amount" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label>Código PIX</label>
          <input v-model="payPixForm.pixCode" type="text" placeholder="Cole o código PIX aqui" />
        </div>
        <button @click="handlePayPix" :disabled="isProcessingPix" class="submit-button">
          <span v-if="isProcessingPix" class="loading-spinner">⏳</span>
          {{ isProcessingPix ? 'Processando...' : 'Pagar PIX' }}
        </button>
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
    alert('Preencha o valor e o email do destinatário')
    return
  }

  if (!validateEmail(makePixForm.value.recipientEmail)) {
    alert('Email inválido')
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
    alert('Preencha todos os campos')
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
  background: rgba(30, 58, 138, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  backdrop-filter: blur(16px);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
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
  font-size: 1.3rem;
}

.close-button {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.1);
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
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.form-group input::placeholder {
  color: #94a3b8;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
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
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.submit-button:disabled {
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
</style>
