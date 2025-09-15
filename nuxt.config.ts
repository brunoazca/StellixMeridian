// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  devtools: { enabled: true },
  
  // Configurações para Web3
  ssr: false,
  
  // Runtime config
  runtimeConfig: {
    public: {
      reownProjectId: process.env.REOWN_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694'
    }
  }
})