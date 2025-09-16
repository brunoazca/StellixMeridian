export default defineEventHandler(async (event) => {
  console.log('📊 API: /api/pix/transactions - Consultando transações PIX')
  
  try {
    // Configuração da API Asaas
    const asaasUrl = process.env.ASAAS_API_URL || "https://api-sandbox.asaas.com/v3/pix/transactions"
    const asaasToken = process.env.ASAAS_ACCESS_TOKEN || "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1"
    
    // Obter parâmetros de query (opcional)
    const query = getQuery(event)
    const limit = query.limit || 50
    const offset = query.offset || 0
    const type = query.type || 'CREDIT' // Por padrão, buscar apenas PIX de entrada
    
    console.log('🔄 Consultando transações PIX na Asaas...')
    console.log('  - URL:', asaasUrl)
    console.log('  - Limit:', limit)
    console.log('  - Offset:', offset)
    console.log('  - Type:', type)

    // Fazer requisição para API Asaas
    const asaasResponse = await fetch(`${asaasUrl}?limit=${limit}&offset=${offset}&type=${type}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'access_token': asaasToken
      }
    })

    const asaasData = await asaasResponse.json()
    
    if (!asaasResponse.ok) {
      console.error('❌ Erro na API Asaas:', asaasData)
      throw createError({
        statusCode: asaasResponse.status,
        statusMessage: `Erro na API Asaas: ${asaasData.message || 'Erro desconhecido'}`
      })
    }

    console.log('✅ Transações PIX obtidas com sucesso!')
    console.log('  - Total de transações:', asaasData.data?.length || 0)
    
    // Processar e filtrar transações
    const transactions = asaasData.data || []
    const processedTransactions = transactions.map((transaction: any) => ({
      id: transaction.id,
      value: transaction.value,
      netValue: transaction.netValue,
      transferFee: transaction.transferFee,
      dateCreated: transaction.dateCreated,
      status: transaction.status,
      effectiveDate: transaction.effectiveDate,
      confirmedDate: transaction.confirmedDate,
      endToEndIdentifier: transaction.endToEndIdentifier,
      operationType: transaction.operationType,
      failReason: transaction.failReason,
      description: transaction.description,
      externalReference: transaction.externalReference,
      authorized: transaction.authorized,
      scheduleDate: transaction.scheduleDate,
      type: transaction.type,
      bankAccount: transaction.bankAccount,
      canBeCancelled: transaction.canBeCancelled,
      // Adicionar informações específicas do PIX
      pixAddressKey: transaction.bankAccount?.pixAddressKey,
      pixAddressKeyType: transaction.bankAccount?.pixAddressKeyType,
      ownerName: transaction.bankAccount?.ownerName,
      cpfCnpj: transaction.bankAccount?.cpfCnpj
    }))
    
    return {
      success: true,
      data: processedTransactions,
      totalCount: asaasData.totalCount || processedTransactions.length,
      hasMore: asaasData.hasMore || false,
      timestamp: new Date().toISOString(),
      message: 'Transações PIX obtidas com sucesso'
    }
    
  } catch (error) {
    console.error('❌ Erro ao consultar transações PIX:', error)
    
    // Se for um erro do createError, re-throw
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor ao consultar transações PIX'
    })
  }
})
