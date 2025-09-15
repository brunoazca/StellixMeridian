// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  devtools: { enabled: true },
  
  // Configurações para Web3
  ssr: false,
  
  // Runtime config
  runtimeConfig: {
    public: {
      // Freighter doesn't require a project ID
    }
  }
})