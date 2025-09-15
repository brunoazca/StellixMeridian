export default defineEventHandler(async (event) => {
  console.log('💰 API: /api/prices - Buscando preços do XLM...')
  
  try {
    // Buscar preço do XLM em USD
    const xlmResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd')
    const xlmData = await xlmResponse.json()
    
    // Buscar taxa de conversão USD/BRL
    const brlResponse = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const brlData = await brlResponse.json()
    
    const result = {
      success: true,
      xlm: {
        usd: xlmData.stellar?.usd || 0.12
      },
      exchange: {
        usdToBRL: brlData.rates?.BRL || 5.0
      },
      calculated: {
        xlmBRL: (xlmData.stellar?.usd || 0.12) * (brlData.rates?.BRL || 5.0)
      },
      timestamp: new Date().toISOString()
    }
    
    console.log('✅ Preços obtidos:', {
      xlmUSD: result.xlm.usd,
      usdToBRL: result.exchange.usdToBRL,
      xlmBRL: result.calculated.xlmBRL
    })
    
    return result
    
  } catch (error) {
    console.error('❌ Erro ao buscar preços:', error)
    
    // Retornar valores padrão em caso de erro
    return {
      success: false,
      xlm: {
        usd: 0.12
      },
      exchange: {
        usdToBRL: 5.0
      },
      calculated: {
        xlmBRL: 0.60
      },
      timestamp: new Date().toISOString(),
      error: 'Erro ao buscar preços, usando valores padrão'
    }
  }
})
