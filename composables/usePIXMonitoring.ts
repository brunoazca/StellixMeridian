import { ref, onMounted, onUnmounted } from 'vue'

export const usePIXMonitoring = () => {
  // State
  const isMonitoring = ref(false)
  const lastCheckedTransaction = ref<string | null>(null)
  const receivedPIXNotifications = ref<any[]>([])
  const monitoringInterval = ref<NodeJS.Timeout | null>(null)
  const error = ref<string | null>(null)

  // Methods
  const fetchPIXTransactions = async () => {
    try {
      const response = await $fetch('/api/pix/transactions', {
        method: 'GET',
        query: {
          limit: 10, // Buscar apenas as 10 transações mais recentes
          offset: 0,
          type: 'CREDIT' // Apenas PIX de entrada
        }
      })

      if (response.success && response.data) {
        // Filtrar apenas transações confirmadas (já filtradas por CREDIT no endpoint)
        const receivedTransactions = response.data.filter((transaction: any) => 
          transaction.operationType === 'PIX' && 
          transaction.status === 'CONFIRMED'
        )

        // Verificar se há novas transações
        if (lastCheckedTransaction.value) {
          const newTransactions = receivedTransactions.filter((transaction: any) => 
            transaction.id !== lastCheckedTransaction.value &&
            new Date(transaction.confirmedDate || transaction.effectiveDate) > new Date()
          )

          // Adicionar notificações para novas transações
          newTransactions.forEach((transaction: any) => {
            receivedPIXNotifications.value.unshift({
              id: transaction.id,
              amount: transaction.value,
              sender: transaction.ownerName || 'Desconhecido',
              pixKey: transaction.pixAddressKey,
              pixKeyType: transaction.pixAddressKeyType,
              date: transaction.confirmedDate || transaction.effectiveDate,
              timestamp: new Date().toISOString()
            })

            // Mostrar notificação
            showPIXNotification(transaction)
          })
        }

        // Atualizar última transação verificada
        if (receivedTransactions.length > 0) {
          lastCheckedTransaction.value = receivedTransactions[0].id
        }

        error.value = null
        return receivedTransactions
      }
    } catch (err) {
      console.error('Erro ao buscar transações PIX:', err)
      error.value = 'Erro ao verificar transações PIX'
    }
  }

  const showPIXNotification = (transaction: any) => {
    const amount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(transaction.value)

    const message = `💰 PIX Recebido!\nValor: ${amount}\nDe: ${transaction.ownerName || 'Desconhecido'}\nChave: ${transaction.pixAddressKey}`
    
    // Usar notificação do navegador se disponível
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('PIX Recebido!', {
        body: `Valor: ${amount} - De: ${transaction.ownerName || 'Desconhecido'}`,
        icon: '/favicon.ico'
      })
    } else {
      // Fallback para alert
      alert(message)
    }
  }

  const startMonitoring = () => {
    if (isMonitoring.value) return

    isMonitoring.value = true
    console.log('🔍 Iniciando monitoramento de PIX...')

    // Verificar permissão de notificação
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Fazer primeira verificação
    fetchPIXTransactions()

    // Configurar intervalo de 15 segundos
    monitoringInterval.value = setInterval(() => {
      console.log('⏰ Verificando PIX recebidos...')
      fetchPIXTransactions()
    }, 15000) // 15 segundos
  }

  const stopMonitoring = () => {
    if (!isMonitoring.value) return

    isMonitoring.value = false
    console.log('⏹️ Parando monitoramento de PIX...')

    if (monitoringInterval.value) {
      clearInterval(monitoringInterval.value)
      monitoringInterval.value = null
    }
  }

  const clearNotifications = () => {
    receivedPIXNotifications.value = []
  }

  // Lifecycle
  onMounted(() => {
    // Auto-iniciar monitoramento quando o composable for montado
    startMonitoring()
  })

  onUnmounted(() => {
    // Parar monitoramento quando o composable for desmontado
    stopMonitoring()
  })

  return {
    isMonitoring,
    receivedPIXNotifications,
    error,
    startMonitoring,
    stopMonitoring,
    clearNotifications,
    fetchPIXTransactions
  }
}
