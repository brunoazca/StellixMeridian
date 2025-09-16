import { ref, computed, watch } from 'vue'
import { useFreighter } from './useFreighter'
import * as StellarSdk from '@stellar/stellar-sdk'

export const useMeritTokens = () => {
  // Composables
  const { address, isWalletConnected, currentNetwork } = useFreighter()

  // State
  const meritBalance = ref(0)
  const isLoading = ref(false)
  const error = ref('')

  // MERIT Token Contract ID (você pode mover isso para uma variável de ambiente)
  const MERIT_CONTRACT_ID = 'CC5UGDV44Y6IOR6PYRZ7AQFBGOOWOAP6QZRIGXTUQ57PD4LYPMWNOQLM' // Substitua pelo ID real do contrato

  // Soroban RPC Server
  const getSorobanServer = () => {
    const network = 'testnet'
    const serverUrl = 'https://soroban-testnet.stellar.org'
    
    return new StellarSdk.rpc.Server(serverUrl)
  }

  // Horizon Server (for account data)
  const getHorizonServer = () => {
    const network ='testnet'
    const serverUrl = 'https://horizon-testnet.stellar.org'
    
    return new StellarSdk.Horizon.Server(serverUrl)
  }

  // Get network passphrase
  const getNetworkPassphrase = () => {
    return currentNetwork.value === 'PUBLIC' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET
  }

  // Format balance for display
  const formatMeritBalance = (balance: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(balance)
  }

  // Get MERIT token balance from contract
  const fetchMeritBalance = async () => {
    if (!address.value || !isWalletConnected.value) {
      meritBalance.value = 0
      return
    }

    isLoading.value = true
    error.value = ''

    try {
      console.log('🪙 Buscando saldo MERIT para:', address.value)
      
      const sorobanServer = getSorobanServer()
      const horizonServer = getHorizonServer()
      const networkPassphrase = getNetworkPassphrase()

      // Create the contract instance
      const contract = new StellarSdk.Contract(MERIT_CONTRACT_ID)

      // Create the account object (use Horizon for account data)
      const sourceAccount = await horizonServer.loadAccount(address.value)

      // Build the transaction to call the balance function
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase
      })
        .addOperation(
          contract.call(
            'balance',
            StellarSdk.Address.fromString(address.value).toScVal()
          )
        )
        .setTimeout(30)
        .build()

      // Simulate the transaction
      const simulationResult = await sorobanServer.simulateTransaction(transaction)

      if (StellarSdk.rpc.Api.isSimulationError(simulationResult)) {
        throw new Error(`Simulation failed: ${simulationResult.error}`)
      }

      // Parse the result
      if (simulationResult.result && simulationResult.result.retval) {
        // The balance is typically returned as a ScVal that needs to be converted
        const balanceScVal = simulationResult.result.retval
        
        // Convert ScVal to number (assuming the contract returns the balance as an integer)
        let balanceValue = 0
        
        if (balanceScVal.switch() === StellarSdk.xdr.ScValType.scvI128()) {
          // Handle i128 type
          const i128 = balanceScVal.i128()
          balanceValue = Number(StellarSdk.scValToNative(balanceScVal))
        } else if (balanceScVal.switch() === StellarSdk.xdr.ScValType.scvU64()) {
          // Handle u64 type
          balanceValue = Number(StellarSdk.scValToNative(balanceScVal))
        } else if (balanceScVal.switch() === StellarSdk.xdr.ScValType.scvU32()) {
          // Handle u32 type
          balanceValue = Number(StellarSdk.scValToNative(balanceScVal))
        } else {
          // Try generic conversion
          balanceValue = Number(StellarSdk.scValToNative(balanceScVal))
        }

        // Convert from stroops to tokens if needed (assuming 7 decimal places like XLM)
        meritBalance.value = balanceValue / 10000000 // Adjust decimals as needed

        console.log('✅ Saldo MERIT encontrado:', meritBalance.value)
      } else {
        console.log('⚠️ Nenhum resultado retornado do contrato')
        meritBalance.value = 0
      }

    } catch (err) {
      console.error('❌ Erro ao buscar saldo MERIT:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao buscar saldo MERIT'
      
      // Para desenvolvimento, você pode usar um valor mock
      // Em caso de erro, usar um valor mock para teste
      meritBalance.value = 0
      console.log('Não achou o token MERIT:', meritBalance.value)
    } finally {
      isLoading.value = false
    }
  }

  // Refresh balance
  const refreshBalance = () => {
    fetchMeritBalance()
  }

  // Watchers
  watch(() => address.value, (newAddress) => {
    if (newAddress) {
      fetchMeritBalance()
    } else {
      meritBalance.value = 0
    }
  }, { immediate: true })

  watch(() => isWalletConnected.value, (connected) => {
    if (connected && address.value) {
      fetchMeritBalance()
    } else if (!connected) {
      meritBalance.value = 0
    }
  })

  // Watch for network changes
  watch(() => currentNetwork.value, (newNetwork, oldNetwork) => {
    if (newNetwork !== oldNetwork && address.value && isWalletConnected.value) {
      console.log('🌐 Rede mudou de', oldNetwork, 'para', newNetwork, '- atualizando saldo MERIT')
      fetchMeritBalance()
    }
  })

  return {
    meritBalance,
    isLoading,
    error,
    formatMeritBalance,
    refreshBalance,
    fetchMeritBalance
  }
}
