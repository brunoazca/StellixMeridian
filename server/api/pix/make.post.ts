// Função para calcular CRC16 CCITT conforme padrão PIX/BCB
function calculateCRC16(data: string): string {
  let crc = 0xFFFF
  const polynomial = 0x1021
  
  // Converter string para bytes (compatível com Node.js)
  const bytes = new TextEncoder().encode(data)
  
  for (let i = 0; i < bytes.length; i++) {
    crc ^= (bytes[i] << 8)
    
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ polynomial
      } else {
        crc = crc << 1
      }
      crc &= 0xFFFF
    }
  }
  
  // Retornar como 4 dígitos hexadecimais maiúsculos
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

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
    
    // Gerar código PIX minimalista - apenas chave e valor
    const pixKey = SYSTEM_PIX_KEY
    const amount = totalAmount.toFixed(2)
    
    // Função para criar campo EMV
    function createEMVField(tag: string, value: string): string {
      const length = value.length.toString().padStart(2, '0')
      return tag + length + value
    }
    
    // Campo 00: Payload Format Indicator (obrigatório)
    const field00 = createEMVField('00', '01')
    
    // Campo 01: Point of Initiation Method (11 = estático)
    const field01 = createEMVField('01', '11')
    
    // Campo 26: Merchant Account Information - PIX (apenas chave)
    const pixGUI = 'br.gov.bcb.pix'
    const pixSubfield00 = createEMVField('00', pixGUI)
    const pixSubfield01 = createEMVField('01', pixKey)
    const merchantAccountInfo = pixSubfield00 + pixSubfield01
    const field26 = createEMVField('26', merchantAccountInfo)
    
    // Campo 52: Merchant Category Code (obrigatório)
    const field52 = createEMVField('52', '0000')
    
    // Campo 53: Transaction Currency (obrigatório)
    const field53 = createEMVField('53', '986')
    
    // Campo 54: Transaction Amount (obrigatório)
    const field54 = createEMVField('54', amount)
    
    // Campo 58: Country Code (obrigatório)
    const field58 = createEMVField('58', 'BR')
    
    // Montar código PIX minimalista sem campos opcionais
    const pixCodeWithoutCRC = field00 + field01 + field26 + field52 + field53 + field54 + field58 + '6304'
    
    // Calcular CRC16
    const crc16 = calculateCRC16(pixCodeWithoutCRC.slice(0, -4))
    
    // Código PIX final minimalista
    const pixCode = pixCodeWithoutCRC.slice(0, -4) + '63' + '04' + crc16
    
    // Validação adicional
    if (pixCode.length < 100 || pixCode.length > 512) {
      console.warn('⚠️ PIX code length may be invalid:', pixCode.length)
    }
    
    // Verificar se todos os campos mínimos estão presentes
    const requiredFields = ['000201', '26', '5204', '5303', '54', '5802', '6304']
    const missingFields = requiredFields.filter(field => !pixCode.includes(field))
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing required fields:', missingFields)
    } else {
      console.log('✅ Minimal PIX code generated - only key and amount')
    }
    
    console.log('💰 Cálculos realizados (RECEIVE):')
    console.log('  - Valor a receber:', `R$ ${amountToReceive.toFixed(2)}`)
    console.log('  - Taxa base (2.3%):', `R$ ${feeAmountBeforeMerit.toFixed(2)}`)
    console.log('  - MERIT disponível:', `${totalAvailableMerit.toFixed(2)} tokens`)
    console.log('  - MERIT usado:', `${meritTokensUsed.toFixed(2)} tokens`)
    console.log('  - Taxa final:', `R$ ${finalFeeAmount.toFixed(2)}`)
    console.log('  - VALOR TOTAL A PAGAR:', `R$ ${totalAmount.toFixed(2)}`)
    console.log('  - PIX Key:', SYSTEM_PIX_KEY)
    console.log('  - PIX Code gerado (MINIMALISTA - apenas chave e valor)')
    console.log('  - PIX Code length:', pixCode.length)
    console.log('  - PIX Code:', pixCode)
    console.log('  - CRC16 calculado:', crc16)
    
    // Debug: Quebrar o código PIX minimalista
    console.log('🔍 PIX Code breakdown (MINIMAL):')
    console.log('  - Field 00 (Format):', field00)
    console.log('  - Field 01 (Initiation):', field01)
    console.log('  - Field 26 (PIX Key):', field26)
    console.log('    - GUI:', pixSubfield00)
    console.log('    - Key:', pixSubfield01, '(' + pixKey + ')')
    console.log('  - Field 52 (Category):', field52)
    console.log('  - Field 53 (Currency):', field53)
    console.log('  - Field 54 (Amount):', field54, '(R$ ' + amount + ')')
    console.log('  - Field 58 (Country):', field58)
    console.log('  - Field 63 (CRC):', '6304' + crc16)
    console.log('🎯 Minimal PIX: Only key ' + pixKey + ' and amount R$ ' + amount)
    
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
