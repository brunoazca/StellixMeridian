// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  devtools: { enabled: true },
  
  // Configurações para Web3
  ssr: false,
  
  // Runtime config
  runtimeConfig: {
    // Variáveis privadas (apenas no servidor)
    asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com',
    asaasAccessToken: process.env.ASAAS_ACCESS_TOKEN || '$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1',
    asaasPixTransfersEndpoint: process.env.ASAAS_PIX_TRANSFERS_ENDPOINT || '/v3/transfers',
    asaasPixPaymentsEndpoint: process.env.ASAAS_PIX_PAYMENTS_ENDPOINT || '/v3/payments',
    
    public: {
      // Freighter doesn't require a project ID
    }
  }
})