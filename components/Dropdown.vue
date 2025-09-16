<template>
  <div class="dropdown-container">
    <button 
      class="dropdown-button" 
      @click="toggleDropdown"
      :class="{ 'open': isOpen }"
    >
      <span class="arrow">▼</span>
      <span class="selected-option">{{ getSelectedLabel() }}</span>
    </button>
    
    <div v-if="isOpen" class="dropdown-menu">
      <button 
        v-for="option in options" 
        :key="option"
        class="dropdown-item"
        @click="selectOption(option.value)"
        :class="{ 'selected': option.value === selectedOption }"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: 'TESTNET'
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const selectedOption = ref(props.modelValue)

const options = [
  { value: 'TESTNET', label: 'Testnet' },
  { value: 'PUBLIC', label: 'Mainnet' },
  { value: 'FUTURENET', label: 'Futurenet' }
]

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const getSelectedLabel = () => {
  const option = options.find(opt => opt.value === selectedOption.value)
  return option ? option.label : selectedOption.value
}

const selectOption = (optionValue) => {
  selectedOption.value = optionValue
  emit('update:modelValue', optionValue)
  isOpen.value = false
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  selectedOption.value = newValue
})
</script>

<style scoped>
.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-button {
  width: 73px;
  height: 38px;
  background: #1B2A41;
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 10px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.dropdown-button:hover {
  background: #2A3F5F;
}

.dropdown-button.open {
  background: #2A3F5F;
}

.arrow {
  font-size: 8px;
  transition: transform 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
}

.dropdown-button.open .arrow {
  transform: rotate(180deg);
}

.selected-option {
  flex: 1;
  text-align: center;
  font-size: 10px;
  font-weight: 600;
  color: white;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-top: 4px;
  z-index: 1000;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.dropdown-item {
  width: 100%;
  padding: 8px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 10px;
  text-align: center;
  transition: background-color 0.2s ease;
  border-radius: 4px;
  margin: 2px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.dropdown-item.selected {
  background: rgba(96, 165, 250, 0.3);
  color: #60a5fa;
}

.dropdown-item:first-child {
  margin-top: 0;
}

.dropdown-item:last-child {
  margin-bottom: 0;
}
</style>
