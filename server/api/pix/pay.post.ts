export default defineEventHandler(async (event) => {
  console.log('💰 API: /api/pix/pay - Requisição recebida')
  
  try {
    const body = await readBody(event)
    
    console.log('📋 Dados recebidos para pagar PIX:')
    console.log('  - Carteira:', body.walletAddress)
    console.log('  - Valor:', `R$ ${body.amount}`)
    console.log('  - Tipo de Chave PIX:', body.pixKeyType)
    console.log('  - Código PIX:', body.pixCode)
    console.log('  - Timestamp:', new Date().toISOString())
    
    // Validar dados obrigatórios
    if (!body.amount || !body.pixCode || !body.pixKeyType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valor, tipo de chave PIX e código PIX são obrigatórios'
      })
    }

    // Configuração da API Asaas
    const asaasUrl = process.env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3/transfers"
    const asaasToken = process.env.ASAAS_ACCESS_TOKEN || "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1"
    
    // Preparar payload para Asaas - PIX Payment
    const asaasPayload = {
      pixAddressKey: body.pixCode, // Código PIX (email ou CPF) fornecido pelo usuário
      pixAddressKeyType: body.pixKeyType, // Tipo da chave (EMAIL ou CPF)
      value: parseFloat(body.amount)
    }

    console.log('🔄 Enviando requisição para Asaas API...')
    console.log('  - URL:', asaasUrl)
    console.log('  - Payload:', asaasPayload)

    // Fazer requisição para API Asaas
    const asaasResponse = await fetch(asaasUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'access_token': asaasToken
      },
      body: JSON.stringify(asaasPayload)
    })

    const asaasData = await asaasResponse.json()
    
    if (!asaasResponse.ok) {
      console.error('❌ Erro na API Asaas:', asaasData)
      console.error('❌ Status Code:', asaasResponse.status)
      console.error('❌ Response Headers:', asaasResponse.headers)
      
      const errorMessage = asaasData.errors ? 
        asaasData.errors.map(err => err.description || err.message).join(', ') :
        asaasData.message || 'Erro desconhecido'
      
      throw createError({
        statusCode: asaasResponse.status,
        statusMessage: `Erro na API Asaas: ${errorMessage}`
      })
    }

    console.log('✅ Pagamento PIX processado com sucesso na Asaas!')
    console.log('  - Response:', asaasData)
    
    return {
      success: true,
      paymentId: asaasData.id || `PAY_${Date.now()}`,
      amount: body.amount,
      pixKeyType: body.pixKeyType,
      pixCode: body.pixCode,
      status: asaasData.status || 'PAID',
      timestamp: new Date().toISOString(),
      message: 'PIX pago com sucesso',
      asaasData: asaasData
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar pagamento PIX:', error)
    
    // Se for um erro do createError, re-throw
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor ao processar pagamento PIX'
    })
  }
})
