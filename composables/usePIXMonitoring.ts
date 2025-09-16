import { ref, onMounted, onUnmounted } from 'vue'

export const usePIXMonitoring = () => {
  // State
  const isMonitoring = ref(false)
  const lastCheckedTransaction = ref<string | null>(null)
  const receivedPIXNotifications = ref<any[]>([])
  const monitoringInterval = ref<number | null>(null)
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

      if (response.success && Array.isArray((response as any).transactions)) {
        // Filtrar apenas transações confirmadas (já filtradas por CREDIT no endpoint)
        const receivedTransactions = (response as any).transactions.filter((transaction: any) => 
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

            // Mostrar notificação e processar transferências
            showPIXNotification(transaction)
            
            // Process transfers for this transaction
            processPIXTransaction(transaction)
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

  // DEVELOPMENT: Simulate PIX transaction for testing
  const simulatePixTransaction = (walletAddressShort: string = 'A1B2C3D4', meritAmount: number = 4.65, pixAmount: number = 100.00) => {
    console.log('🧪 [DEV] Simulating PIX transaction for testing...')
    
    const mockTransaction = {
      id: `MOCK_PIX_${Date.now()}`,
      value: pixAmount,
      description: `WALLET:${walletAddressShort}|MERIT:${meritAmount.toFixed(2)}`,
      ownerName: 'Test User',
      pixAddressKey: '19921785770',
      pixAddressKeyType: 'CPF',
      confirmedDate: new Date().toISOString(),
      status: 'CONFIRMED',
      operationType: 'PIX'
    }
    
    console.log('📋 Mock transaction created:', mockTransaction)
    
    // Process the mock transaction
    processPIXTransaction(mockTransaction)
    
    // Add to notifications
    receivedPIXNotifications.value.unshift({
      id: mockTransaction.id,
      amount: mockTransaction.value,
      sender: mockTransaction.ownerName,
      pixKey: mockTransaction.pixAddressKey,
      pixKeyType: mockTransaction.pixAddressKeyType,
      date: mockTransaction.confirmedDate,
      timestamp: new Date().toISOString()
    })
    
    return mockTransaction
  }

  // Parse transaction data from PIX code
  const parsePixTransactionData = (pixCode: string) => {
    console.log('⚠️ PIX code no longer contains additional data fields')
    console.log('📋 Transaction data must be obtained from external source')
    
    // Since we removed additional data from PIX code, 
    // transaction data needs to be stored/retrieved differently
    // For now, return null to indicate no embedded data
    return null
  }

  // PROTOTYPE: Transfer MERIT tokens to pool
  const transferMeritToPool = async (walletAddressShort: string, meritAmount: number) => {
    console.log('🔄 [PROTOTYPE] Transferring MERIT to pool...')
    console.log(`  - From wallet (last 8): ${walletAddressShort}`)
    console.log(`  - MERIT amount: ${meritAmount.toFixed(2)} tokens`)
    console.log(`  - Pool address: POOL_WALLET_ADDRESS_HERE`)
    
    // TODO: Implement actual MERIT transfer using Stellar SDK
    // const sourceAccount = await server.loadAccount(fullWalletAddress)
    // const transaction = new TransactionBuilder(sourceAccount, {...})
    //   .addOperation(contract.call('transfer', [fromAddress, poolAddress, amount]))
    //   .build()
    // const result = await server.submitTransaction(transaction)
    
    console.log('✅ [PROTOTYPE] MERIT transfer completed successfully')
    return {
      success: true,
      txHash: `MERIT_TX_${Date.now()}_${walletAddressShort}`,
      amount: meritAmount,
      timestamp: new Date().toISOString()
    }
  }

  // PROTOTYPE: Receive XLM to pool
  const receiveXlmToPool = async (pixTransaction: any, transactionData: any) => {
    console.log('🔄 [PROTOTYPE] Receiving XLM to pool...')
    console.log(`  - PIX amount: R$ ${pixTransaction.value?.toFixed(2) || '0.00'}`)
    console.log(`  - Estimated XLM: ${((pixTransaction.value || 0) * 0.37).toFixed(7)} XLM`) // BRL to XLM conversion
    console.log(`  - From wallet (last 8): ${transactionData.walletAddressShort}`)
    console.log(`  - Pool XLM address: POOL_XLM_ADDRESS_HERE`)
    
    // TODO: Implement actual XLM transfer
    // Calculate XLM amount based on current BRL/XLM rate
    // const xlmAmount = pixTransaction.value * getCurrentBrlToXlmRate()
    // const sourceAccount = await horizonServer.loadAccount(userWalletAddress)
    // const transaction = new TransactionBuilder(sourceAccount, {...})
    //   .addOperation(Operation.payment({
    //     destination: poolAddress,
    //     asset: Asset.native(),
    //     amount: xlmAmount.toString()
    //   }))
    //   .build()
    // const result = await horizonServer.submitTransaction(transaction)
    
    console.log('✅ [PROTOTYPE] XLM transfer to pool completed successfully')
    return {
      success: true,
      txHash: `XLM_TX_${Date.now()}_${transactionData.walletAddressShort}`,
      xlmAmount: (pixTransaction.value || 0) * 0.37,
      brlAmount: pixTransaction.value || 0,
      timestamp: new Date().toISOString()
    }
  }

  // PROTOTYPE: Transfer XLM to user when PIX is received
  const transferXlmToUser = async (pixTransaction: any) => {
    console.log('🔄 [PROTOTYPE] Transferring XLM to user...')
    console.log(`  - PIX amount received: R$ ${pixTransaction.value?.toFixed(2) || '0.00'}`)
    
    // Convert BRL to XLM (approximate rate: 1 BRL = 0.37 XLM)
    const xlmAmount = (pixTransaction.value || 0) * 0.37
    console.log(`  - XLM to transfer: ${xlmAmount.toFixed(7)} XLM`)
    
    // TODO: Get user wallet address from database/session storage
    // For now, using a placeholder
    const userWalletAddress = 'USER_WALLET_ADDRESS_HERE'
    console.log(`  - To wallet: ${userWalletAddress}`)
    
    // TODO: Implement actual XLM transfer using pool's private key
    // const sourceAccount = await horizonServer.loadAccount(poolAddress)
    // const transaction = new TransactionBuilder(sourceAccount, {
    //   fee: StellarSdk.BASE_FEE,
    //   networkPassphrase: Networks.TESTNET
    // })
    // .addOperation(Operation.payment({
    //   destination: userWalletAddress,
    //   asset: Asset.native(),
    //   amount: xlmAmount.toString()
    // }))
    // .setTimeout(30)
    // .build()
    // 
    // transaction.sign(poolKeypair)
    // const result = await horizonServer.submitTransaction(transaction)
    
    console.log('✅ [PROTOTYPE] XLM transfer completed successfully')
    return {
      success: true,
      txHash: `XLM_TRANSFER_${Date.now()}`,
      xlmAmount: xlmAmount,
      brlAmount: pixTransaction.value || 0,
      userWallet: userWalletAddress,
      timestamp: new Date().toISOString()
    }
  }

  // Process PIX transaction and execute XLM transfer
  const processPIXTransaction = async (pixTransaction: any) => {
    console.log('🔍 Processing PIX transaction for XLM transfer...')
    console.log('  - Transaction ID:', pixTransaction.id)
    console.log('  - Amount:', `R$ ${pixTransaction.value?.toFixed(2) || '0.00'}`)
    
    try {
      // Transfer XLM to user automatically when PIX is received
      const transferResult = await transferXlmToUser(pixTransaction)
      
      if (transferResult.success) {
        console.log('🎉 XLM transfer completed successfully!')
        console.log('  - XLM transferred:', transferResult.xlmAmount.toFixed(7), 'XLM')
        console.log('  - Transaction hash:', transferResult.txHash)
        console.log('  - To wallet:', transferResult.userWallet)
        
        return {
          success: true,
          xlmTransfer: transferResult,
          message: 'XLM transferred to user wallet automatically'
        }
      } else {
        console.error('❌ XLM transfer failed')
        return { success: false, reason: 'XLM transfer failed' }
      }
    } catch (error) {
      console.error('❌ Error during XLM transfer:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
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
    fetchPIXTransactions,
    processPIXTransaction,
    transferXlmToUser,
    simulatePixTransaction
  }
}
