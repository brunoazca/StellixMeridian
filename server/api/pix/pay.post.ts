// Função para detectar o tipo de PIX
function detectPixType(pixCode: string) {
  // Remove espaços e quebras de linha
  const cleanCode = pixCode.trim().replace(/\s/g, '')
  
  // Código PIX Copia e Cola geralmente começa com "000201" e tem mais de 50 caracteres
  if (cleanCode.startsWith('000201') && cleanCode.length > 50) {
    return {
      type: 'BRCODE',
      isCopiaECola: true
    }
  }
  
  // Verifica se é um email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (emailRegex.test(cleanCode)) {
    return {
      type: 'EMAIL',
      isCopiaECola: false
    }
  }
  
  // Verifica se é um CPF (apenas números ou com formatação)
  const cpfRegex = /^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/
  if (cpfRegex.test(cleanCode)) {
    return {
      type: 'CPF',
      isCopiaECola: false
    }
  }
  
  // Verifica se é um CNPJ
  const cnpjRegex = /^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/
  if (cnpjRegex.test(cleanCode)) {
    return {
      type: 'CNPJ',
      isCopiaECola: false
    }
  }
  
  // Verifica se é um telefone
  const phoneRegex = /^(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/
  if (phoneRegex.test(cleanCode)) {
    return {
      type: 'PHONE',
      isCopiaECola: false
    }
  }
  
  // Se não conseguir detectar, assume que é um código PIX Copia e Cola
  return {
    type: 'BRCODE',
    isCopiaECola: true
  }
}

export default defineEventHandler(async (event) => {
  console.log('💰 API: /api/pix/pay - Requisição recebida')
  
  try {
    const body = await readBody(event)
    
    console.log('📋 Dados recebidos para pagar PIX:')
    console.log('  - Carteira:', body.walletAddress)
    console.log('  - Valor:', `R$ ${body.amount}`)
    console.log('  - Código PIX:', body.pixCode)
    console.log('  - Timestamp:', new Date().toISOString())
    
    // Validar dados obrigatórios
    if (!body.amount || !body.pixCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valor e código PIX são obrigatórios'
      })
    }

    // Detectar automaticamente o tipo de PIX
    const pixDetection = detectPixType(body.pixCode)
    console.log('🔍 Detecção automática de PIX:')
    console.log('  - Tipo detectado:', pixDetection.type)
    console.log('  - É Copia e Cola:', pixDetection.isCopiaECola)

    // Configuração da API Asaas
    const config = useRuntimeConfig()
    const asaasBaseUrl = config.asaasBaseUrl || "https://api-sandbox.asaas.com"
    const asaasToken = config.asaasAccessToken || "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1"
    const transfersEndpoint = config.asaasPixTransfersEndpoint || "/v3/transfers"
    const paymentsEndpoint = config.asaasPixPaymentsEndpoint || "/v3/payments"
    
    console.log('⚙️ Configuração da API Asaas:')
    console.log('  - Base URL:', asaasBaseUrl)
    console.log('  - Endpoint Transfers:', transfersEndpoint)
    console.log('  - Endpoint Payments:', paymentsEndpoint)
    
    let asaasUrl, asaasPayload, asaasResponse

    if (pixDetection.isCopiaECola) {
      // Para códigos PIX Copia e Cola, usar endpoint de pagamento via QR Code
      asaasUrl = `${asaasBaseUrl}${paymentsEndpoint}`
      
      asaasPayload = {
        billingType: 'PIX',
        pixAddressKey: body.pixCode, // Código PIX Copia e Cola
        value: parseFloat(body.amount),
        description: `Pagamento PIX via Copia e Cola - ${new Date().toISOString()}`
      }
      
      console.log('🔄 Processando PIX Copia e Cola...')
    } else {
      // Para chaves PIX, usar endpoint de transferência
      asaasUrl = `${asaasBaseUrl}${transfersEndpoint}`
      
      asaasPayload = {
        pixAddressKey: body.pixCode,
        pixAddressKeyType: pixDetection.type,
        value: parseFloat(body.amount)
      }
      
      console.log('🔄 Processando chave PIX...')
    }

    console.log('🔄 Enviando requisição para Asaas API...')
    console.log('  - URL:', asaasUrl)
    console.log('  - Payload:', asaasPayload)

    // Fazer requisição para API Asaas
    asaasResponse = await fetch(asaasUrl, {
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
        asaasData.errors.map((err: any) => err.description || err.message).join(', ') :
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
      pixCode: body.pixCode,
      pixType: pixDetection.type,
      isCopiaECola: pixDetection.isCopiaECola,
      status: asaasData.status || 'PAID',
      timestamp: new Date().toISOString(),
      message: pixDetection.isCopiaECola ? 'PIX Copia e Cola processado com sucesso' : 'Chave PIX processada com sucesso',
      asaasData: asaasData
    }
    
  } catch (error: any) {
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
