export default defineNuxtPlugin(() => {
  // Load Freighter API script as per browser documentation
  if (typeof window !== 'undefined') {
    console.log('📦 Carregando Freighter API...')
    
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/stellar-freighter-api/5.0.0/index.min.js'
    script.async = true
    script.onload = () => {
      console.log('✅ Freighter API carregado')
      console.log('🔍 window.freighterApi disponível:', !!window.freighterApi)
      console.log('🔍 window.freighterApi métodos:', window.freighterApi ? Object.keys(window.freighterApi) : 'N/A')
      
      // Aguardar um pouco para garantir que a API está totalmente carregada
      setTimeout(() => {
        console.log('⏰ Verificação final - window.freighterApi:', !!window.freighterApi)
        if (window.freighterApi) {
          console.log('🎯 Métodos disponíveis:', Object.keys(window.freighterApi))
        }
      }, 1000)
    }
    script.onerror = () => {
      console.error('❌ Erro ao carregar Freighter API')
    }
    document.head.appendChild(script)
  }
})
