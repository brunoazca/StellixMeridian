export default defineEventHandler(async (event) => {
  console.log('🚀 API: /api/pix/make - Requisição recebida')
  
  try {
    const body = await readBody(event)
    
    console.log('📋 Dados recebidos para fazer PIX:')
    console.log('  - Carteira:', body.walletAddress)
    console.log('  - Valor:', `R$ ${body.amount}`)
    console.log('  - Email Destinatário:', body.recipientEmail)
    console.log('  - Nome Destinatário:', body.recipientName || 'Não informado')
    console.log('  - Timestamp:', new Date().toISOString())
    
    // Validar dados obrigatórios
    if (!body.amount || !body.recipientEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valor e email do destinatário são obrigatórios'
      })
    }

    // Configuração da API Asaas
    const asaasUrl = process.env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3/transfers"
    const asaasToken = process.env.ASAAS_ACCESS_TOKEN || "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1"
    
    // Preparar payload para Asaas
    const asaasPayload = {
      pixAddressKey: body.recipientEmail, // Email do destinatário fornecido pelo usuário
      pixAddressKeyType: "EMAIL",
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
      throw createError({
        statusCode: asaasResponse.status,
        statusMessage: `Erro na API Asaas: ${asaasData.message || 'Erro desconhecido'}`
      })
    }

    console.log('✅ PIX processado com sucesso na Asaas!')
    console.log('  - Response:', asaasData)
    
    return {
      success: true,
      transactionId: asaasData.id || `PIX_${Date.now()}`,
      amount: body.amount,
      recipientEmail: body.recipientEmail,
      recipientName: body.recipientName,
      status: asaasData.status || 'COMPLETED',
      timestamp: new Date().toISOString(),
      message: 'PIX realizado com sucesso',
      asaasData: asaasData
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar PIX:', error)
    
    // Se for um erro do createError, re-throw
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor ao processar PIX'
    })
  }
})
