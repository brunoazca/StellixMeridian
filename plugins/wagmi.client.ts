import { WagmiPlugin } from '@wagmi/vue'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'

export default defineNuxtPlugin((nuxtApp) => {
  console.log('🔧 Plugin Wagmi: Iniciando...')
  
  const { $wagmiAdapter } = nuxtApp
  
  if (!$wagmiAdapter) {
    console.error('❌ WagmiAdapter não encontrado')
    return
  }

  const queryClient = new QueryClient()

  nuxtApp.vueApp
    // @ts-ignore
    .use(WagmiPlugin, { config: $wagmiAdapter.wagmiConfig })
    .use(VueQueryPlugin, { queryClient })

  console.log('✅ Plugin Wagmi: Configurado com sucesso!')
})
