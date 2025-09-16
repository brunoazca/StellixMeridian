import { ref, computed } from 'vue'

export interface PixTypeInfo {
  type: 'EMAIL' | 'CPF' | 'CNPJ' | 'PHONE' | 'BRCODE' | 'UNKNOWN'
  isCopiaECola: boolean
  displayTitle: string
  icon: string
}

export const usePixDetection = () => {
  /**
   * Detecta o tipo de PIX baseado no código fornecido
   * @param pixCode - Código PIX a ser analisado
   * @returns Objeto com informações do tipo de PIX
   */
  const detectPixType = (pixCode: string): PixTypeInfo => {
    if (!pixCode) {
      return {
        type: 'UNKNOWN',
        isCopiaECola: false,
        displayTitle: 'Tipo não detectado',
        icon: '🔍'
      }
    }
    
    const cleanCode = pixCode.trim().replace(/\s/g, '')
    
    // Código PIX Copia e Cola
    if (cleanCode.startsWith('000201') && cleanCode.length > 50) {
      return {
        type: 'BRCODE',
        isCopiaECola: true,
        displayTitle: 'PIX Copia e Cola',
        icon: '📋'
      }
    }
    
    // Email
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCode)) {
      return {
        type: 'EMAIL',
        isCopiaECola: false,
        displayTitle: 'Chave PIX (Email)',
        icon: '📧'
      }
    }
    
    // CPF
    if (/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(cleanCode)) {
      return {
        type: 'CPF',
        isCopiaECola: false,
        displayTitle: 'Chave PIX (CPF)',
        icon: '🆔'
      }
    }
    
    // CNPJ
    if (/^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/.test(cleanCode)) {
      return {
        type: 'CNPJ',
        isCopiaECola: false,
        displayTitle: 'Chave PIX (CNPJ)',
        icon: '🏢'
      }
    }
    
    // Telefone
    if (/^(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/.test(cleanCode)) {
      return {
        type: 'PHONE',
        isCopiaECola: false,
        displayTitle: 'Chave PIX (Telefone)',
        icon: '📱'
      }
    }
    
    // Fallback para código PIX
    return {
      type: 'BRCODE',
      isCopiaECola: true,
      displayTitle: 'PIX Copia e Cola',
      icon: '📋'
    }
  }

  /**
   * Hook reativo para detectar tipo PIX
   * @param pixCode - Código PIX reativo
   * @returns Computed com informações do tipo de PIX
   */
  const usePixTypeDetection = (pixCode: Ref<string>) => {
    return computed(() => detectPixType(pixCode.value))
  }

  /**
   * Valida se o código PIX tem formato válido
   * @param pixCode - Código PIX a ser validado
   * @returns true se o formato for válido
   */
  const isValidPixFormat = (pixCode: string): boolean => {
    const pixInfo = detectPixType(pixCode)
    return pixInfo.type !== 'UNKNOWN'
  }

  /**
   * Obtém exemplos de cada tipo de PIX
   * @returns Array com exemplos de cada tipo
   */
  const getPixExamples = () => {
    return [
      {
        type: 'EMAIL',
        example: 'usuario@email.com',
        description: 'Email PIX'
      },
      {
        type: 'CPF',
        example: '123.456.789-00',
        description: 'CPF PIX'
      },
      {
        type: 'CNPJ',
        example: '12.345.678/0001-90',
        description: 'CNPJ PIX'
      },
      {
        type: 'PHONE',
        example: '+5511999999999',
        description: 'Telefone PIX'
      },
      {
        type: 'BRCODE',
        example: '00020126580014br.gov.bcb.pix...',
        description: 'PIX Copia e Cola'
      }
    ]
  }

  return {
    detectPixType,
    usePixTypeDetection,
    isValidPixFormat,
    getPixExamples
  }
}
