export default defineEventHandler(async (event) => {
  console.log('🚀 API: /api/pix/make - Requisição recebida')
  
  try {
    const body = await readBody(event)
    
    console.log('📋 Dados recebidos para gerar PIX:')
    console.log('  - Valor a receber:', `R$ ${body.amount}`)
    console.log('  - Wallet do usuário:', body.walletAddress)
    console.log('  - Usar MERIT:', body.useMerit)
    console.log('  - Saldo MERIT:', body.meritBalance || 0)
    console.log('  - Descrição:', body.description || 'Sem descrição')
    console.log('  - Timestamp:', new Date().toISOString())
    
    // Validar dados obrigatórios
    if (!body.amount || !body.walletAddress) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valor e endereço da wallet são obrigatórios'
      })
    }

    // Constantes para cálculo
    const FEE_RATE = 0.023 // 2.3% taxa
    const MERIT_VALUE_USD = 0.0975
    const USD_TO_BRL_RATE = 5.20
    const MERIT_VALUE_BRL = MERIT_VALUE_USD * USD_TO_BRL_RATE
    const MERIT_EARNINGS_RATE = 0.02 // 2% de MERIT ganho
    
    // Valor que o usuário quer RECEBER
    const amountToReceive = parseFloat(body.amount)
    
    // Calcular MERIT disponível se for usar
    let meritTokensUsed = 0
    let totalAvailableMerit = 0
    
    if (body.useMerit) {
      const currentMeritBalance = body.meritBalance || 0
      
      // Estimativa inicial de MERIT que será ganho (refinado depois)
      const estimatedXlmAmount = amountToReceive * 0.37
      const meritEarnings = estimatedXlmAmount * MERIT_EARNINGS_RATE
      
      totalAvailableMerit = currentMeritBalance + meritEarnings
    }
    
    // Calcular valor que deve ser pago para receber o valor desejado
    // Fórmula: amountToReceive = paymentAmount - fee
    // Fee = paymentAmount * FEE_RATE
    // amountToReceive = paymentAmount - (paymentAmount * FEE_RATE)
    // amountToReceive = paymentAmount * (1 - FEE_RATE)
    // paymentAmount = amountToReceive / (1 - FEE_RATE)
    
    let paymentAmountBeforeMerit = amountToReceive / (1 - FEE_RATE)
    let feeAmountBeforeMerit = paymentAmountBeforeMerit - amountToReceive
    
    // Aplicar desconto MERIT na taxa
    let finalFeeAmount = feeAmountBeforeMerit
    
    if (body.useMerit && totalAvailableMerit > 0) {
      // MERIT necessário para cobrir toda a taxa
      const meritNeededForFullFee = feeAmountBeforeMerit / MERIT_VALUE_BRL
      
      // MERIT que será usado (limitado pelo disponível)
      meritTokensUsed = Math.min(meritNeededForFullFee, totalAvailableMerit)
      
      // Taxa final após desconto MERIT
      finalFeeAmount = Math.max(0, feeAmountBeforeMerit - (meritTokensUsed * MERIT_VALUE_BRL))
    }
    
    // Valor total que deve ser pago (para que o usuário receba o valor desejado)
    const totalAmount = amountToReceive + finalFeeAmount
    
    // Gerar ID da transação
    const transactionId = `PIX_${Date.now()}_${body.walletAddress.slice(-8)}`
    
    // PIX key fixa do sistema
    const SYSTEM_PIX_KEY = '19921785770'
    
    // Gerar código PIX com informações da transação
    // Incluir wallet address e MERIT debit information
    const transactionInfo = `WALLET:${body.walletAddress.slice(-8)}|MERIT:${meritTokensUsed.toFixed(2)}`
    const pixCode = `00020126580014br.gov.bcb.pix0114${SYSTEM_PIX_KEY}520400005303986540${totalAmount.toFixed(2)}5802BR5913Stellix System6008Brasilia62${transactionInfo.length.toString().padStart(2, '0')}05${transactionInfo}6304`
    
    console.log('💰 Cálculos realizados (RECEIVE):')
    console.log('  - Valor a receber:', `R$ ${amountToReceive.toFixed(2)}`)
    console.log('  - Taxa base (2.3%):', `R$ ${feeAmountBeforeMerit.toFixed(2)}`)
    console.log('  - MERIT disponível:', `${totalAvailableMerit.toFixed(2)} tokens`)
    console.log('  - MERIT usado:', `${meritTokensUsed.toFixed(2)} tokens`)
    console.log('  - Taxa final:', `R$ ${finalFeeAmount.toFixed(2)}`)
    console.log('  - VALOR TOTAL A PAGAR:', `R$ ${totalAmount.toFixed(2)}`)
    console.log('  - PIX Key:', SYSTEM_PIX_KEY)
    console.log('  - Wallet (últimos 8):', body.walletAddress.slice(-8))
    console.log('  - Info da transação:', transactionInfo)
    console.log('  - PIX Code gerado com dados da transação')
    
    return {
      success: true,
      transactionId: transactionId,
      amountToReceive: amountToReceive,
      totalAmount: totalAmount,
      feeAmount: feeAmountBeforeMerit,
      finalFeeAmount: finalFeeAmount,
      meritTokensUsed: meritTokensUsed,
      totalAvailableMerit: totalAvailableMerit,
      pixKey: SYSTEM_PIX_KEY,
      pixCode: pixCode,
      walletAddress: body.walletAddress,
      walletAddressShort: body.walletAddress.slice(-8),
      transactionInfo: transactionInfo,
      description: body.description,
      useMerit: body.useMerit,
      timestamp: new Date().toISOString(),
      message: 'PIX gerado com sucesso - inclui wallet e MERIT debit info'
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar PIX:', error)
    
    // Se for um erro do createError, re-throw
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor ao processar PIX'
    })
  }
})
