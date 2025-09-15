import { createAppKit } from '@reown/appkit/vue'
import { mainnet, polygon, base, type AppKitNetwork } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

export default defineNuxtPlugin(() => {
  console.log('🔧 Plugin AppKit: Iniciando...')
  
  const config = useRuntimeConfig()
  const projectId = config.public.reownProjectId || 'b56e18d47c72ab683b10814fe9495694'
  
  console.log('🔧 Plugin AppKit: Project ID:', projectId)

  // Networks
  const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, polygon, base]

  // Wagmi Adapter
  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId
  })


  const featuredWalletIds = [
    'aef3112adf415ec870529e96b4d7b434f13961a079d1ee42c9738217d8adeb91', // Freighter
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0'  // Trust Wallet
  ]
  try {
    console.log('🔧 Plugin AppKit: Criando AppKit...')
    // Create AppKit - seguindo exemplo oficial
    const appKit = createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      themeMode: 'light',
      features: {
        connectMethodsOrder: ['wallet'],
        analytics: true
      },
      metadata: {
        name: 'StellixMeridian',
        description: 'Web3 Wallet Connection with AppKit',
        url: 'https://stellixmeridian.com',
        icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
      },
      themeVariables: {
        '--w3m-accent': '#3b82f6',
      },
      featuredWalletIds
    })

    console.log('✅ Plugin AppKit: Criado com sucesso!')

    return {
      provide: {
        appKit,
        wagmiAdapter
      }
    }
  } catch (error) {
    console.error('❌ Plugin AppKit: Erro ao criar:', error)
    throw error
  }
})