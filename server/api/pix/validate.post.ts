export default defineEventHandler(async (event) => {
  console.log('🔍 API: /api/pix/validate - Validando chave PIX')
  
  try {
    const body = await readBody(event)
    
    console.log('📋 Dados recebidos para validação:')
    console.log('  - Chave PIX:', body.pixCode)
    console.log('  - Tipo:', body.pixKeyType)
    
    // Validações básicas
    if (!body.pixCode || !body.pixKeyType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Chave PIX e tipo são obrigatórios'
      })
    }

    let isValid = false
    let recipientInfo = null

    // Validar baseado no tipo
    if (body.pixKeyType === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      isValid = emailRegex.test(body.pixCode)
      
      if (isValid) {
        recipientInfo = {
          name: body.pixCode.split('@')[0], // Nome baseado no email
          type: 'EMAIL',
          key: body.pixCode
        }
      }
    } else if (body.pixKeyType === 'CPF') {
      // Validação de CPF
      const cpf = body.pixCode.replace(/[^\d]/g, '')
      
      if (cpf.length === 11 && !/^(\d)\1{10}$/.test(cpf)) {
        // Validação básica de CPF (algoritmo simplificado)
        isValid = true
        recipientInfo = {
          name: `Usuário ${cpf.substring(0, 3)}.***.**${cpf.substring(9)}`,
          type: 'CPF',
          key: body.pixCode
        }
      }
    } else if (body.pixKeyType === 'PHONE') {
      // Validação de telefone
      const phone = body.pixCode.replace(/[^\d]/g, '')
      isValid = phone.length >= 10 && phone.length <= 11
      
      if (isValid) {
        recipientInfo = {
          name: `Telefone ${body.pixCode}`,
          type: 'PHONE',
          key: body.pixCode
        }
      }
    }

    if (!isValid) {
      console.log('❌ Chave PIX inválida')
      return {
        success: false,
        error: 'Chave PIX inválida para o tipo selecionado'
      }
    }

    console.log('✅ Chave PIX válida:', recipientInfo)
    
    return {
      success: true,
      valid: true,
      recipient: recipientInfo,
      message: 'Chave PIX válida'
    }
    
  } catch (error) {
    console.error('❌ Erro ao validar PIX:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor ao validar PIX'
    })
  }
})
