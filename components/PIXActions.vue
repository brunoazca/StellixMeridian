<template>
  <div class="pix-section">
    <h3>PIX com XLM</h3>
    <div class="pix-actions">
      <button @click="$emit('make-pix')" class="pix-button make-pix">
        💸 Fazer PIX
      </button>
      <button @click="$emit('pay-pix')" class="pix-button pay-pix">
        💳 Pagar PIX
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['make-pix', 'pay-pix'])
</script>

<style scoped>
.pix-section {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  padding: 2rem;
  backdrop-filter: blur(16px);
}

.pix-section h3 {
  text-align: center;
  margin: 0 0 1.5rem 0;
  color: white;
  font-size: 1.3rem;
}

.pix-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.pix-button {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  color: white;
  padding: 1.5rem;
  border-radius: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.pix-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
}

.make-pix {
  background: linear-gradient(135deg, #10b981, #059669);
}

.make-pix:hover {
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.pay-pix {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.pay-pix:hover {
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

@media (max-width: 768px) {
  .pix-actions {
    grid-template-columns: 1fr;
  }
}
</style>