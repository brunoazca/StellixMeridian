# Implementação de Pagamento PIX - Chaves e Códigos Copia e Cola

Este documento descreve a implementação de pagamento PIX que suporta tanto chaves PIX quanto códigos PIX Copia e Cola, seguindo a documentação da Asaas.

## Funcionalidades Implementadas

### 🔍 **Detecção Automática de Tipo PIX**

A API detecta automaticamente o tipo de PIX baseado no código fornecido:

#### **Chaves PIX Suportadas:**
- **📧 Email**: `usuario@email.com`
- **🆔 CPF**: `123.456.789-00` ou `12345678900`
- **🏢 CNPJ**: `12.345.678/0001-90` ou `12345678000190`
- **📱 Telefone**: `+5511999999999` ou `(11) 99999-9999`

#### **Códigos PIX Copia e Cola:**
- **📋 BR Code**: Códigos longos que começam com `000201...` (geralmente > 50 caracteres)

### 🚀 **Processamento Automático**

#### **Para Chaves PIX:**
- **Endpoint**: `/v3/transfers`
- **Método**: Transferência direta para chave PIX
- **Payload**:
  ```json
  {
    "pixAddressKey": "usuario@email.com",
    "pixAddressKeyType": "EMAIL",
    "value": 100.00
  }
  ```

#### **Para Códigos PIX Copia e Cola:**
- **Endpoint**: `/v3/payments`
- **Método**: Pagamento via QR Code
- **Payload**:
  ```json
  {
    "billingType": "PIX",
    "pixAddressKey": "00020126580014br.gov.bcb.pix...",
    "value": 100.00,
    "description": "Pagamento PIX via Copia e Cola"
  }
  ```

## Interface do Usuário

### 📱 **Formulário de Pagamento**

O formulário na página `/pay` foi simplificado para aceitar qualquer tipo de código PIX:

```html
<div class="form-group">
  <label>PIX Key or BR Code</label>
  <input 
    v-model="payPixForm.pixCode" 
    type="text"
    placeholder="Cole aqui a chave PIX (email, CPF, telefone) ou código PIX Copia e Cola"
    class="form-input"
  />
  <div class="input-help">
    <p>💡 Você pode colar:</p>
    <ul>
      <li>📧 Email PIX (ex: usuario@email.com)</li>
      <li>🆔 CPF PIX (ex: 123.456.789-00)</li>
      <li>📱 Telefone PIX (ex: +5511999999999)</li>
      <li>📋 Código PIX Copia e Cola (código longo que começa com 000201...)</li>
    </ul>
  </div>
</div>
```

### 🎨 **Ajuda Visual**

A interface inclui uma seção de ajuda que explica ao usuário quais tipos de códigos PIX são aceitos, com exemplos visuais e emojis para facilitar o entendimento.

## Algoritmo de Detecção

### 🔍 **Função `detectPixType()`**

```typescript
function detectPixType(pixCode: string) {
  const cleanCode = pixCode.trim().replace(/\s/g, '')
  
  // Código PIX Copia e Cola
  if (cleanCode.startsWith('000201') && cleanCode.length > 50) {
    return { type: 'BRCODE', isCopiaECola: true }
  }
  
  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanCode)) {
    return { type: 'EMAIL', isCopiaECola: false }
  }
  
  // CPF
  if (/^(\d{3}\.?\d{3}\.?\d{3}-?\d{2})$/.test(cleanCode)) {
    return { type: 'CPF', isCopiaECola: false }
  }
  
  // CNPJ
  if (/^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})$/.test(cleanCode)) {
    return { type: 'CNPJ', isCopiaECola: false }
  }
  
  // Telefone
  if (/^(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/.test(cleanCode)) {
    return { type: 'PHONE', isCopiaECola: false }
  }
  
  // Fallback para código PIX
  return { type: 'BRCODE', isCopiaECola: true }
}
```

## Resposta da API

### ✅ **Resposta de Sucesso**

```json
{
  "success": true,
  "paymentId": "PAY_1234567890",
  "amount": "100.00",
  "pixCode": "usuario@email.com",
  "pixType": "EMAIL",
  "isCopiaECola": false,
  "status": "PAID",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "message": "Chave PIX processada com sucesso",
  "asaasData": { ... }
}
```

## Logs de Debug

A API inclui logs detalhados para facilitar o debug:

```
💰 API: /api/pix/pay - Requisição recebida
📋 Dados recebidos para pagar PIX:
  - Carteira: GD05MEIGATLKEQG57JTXAA7PJ5C3BE7Z5I6Y4L5T5VF0IJF4HTHVPREX
  - Valor: R$ 100
  - Código PIX: usuario@email.com
🔍 Detecção automática de PIX:
  - Tipo detectado: EMAIL
  - É Copia e Cola: false
🔄 Processando chave PIX...
🔄 Enviando requisição para Asaas API...
✅ Pagamento PIX processado com sucesso na Asaas!
```

## Vantagens da Implementação

1. **🎯 Detecção Automática**: O usuário não precisa especificar o tipo de PIX
2. **🔄 Flexibilidade**: Suporta todos os tipos de chaves PIX e códigos Copia e Cola
3. **📱 UX Simplificada**: Interface única para todos os tipos de PIX
4. **🛡️ Robustez**: Validação e tratamento de erros abrangente
5. **📊 Logs Detalhados**: Facilita debugging e monitoramento
6. **🔧 Manutenibilidade**: Código limpo e bem documentado

## Configuração de Ambiente

### 📋 **Variáveis de Ambiente**

O sistema utiliza as seguintes variáveis de ambiente para configuração:

```bash
# Asaas API Configuration
ASAAS_BASE_URL=https://api-sandbox.asaas.com
ASAAS_ACCESS_TOKEN=$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OjRiN2ZlZDJhLTMyZTQtNDU2MS04MjNhLWIzODI1N2EzNTM2Yjo6JGFhY2hfOTkyOWE3NTEtNzRkMi00OWU5LWI4OTMtYzE1ZDJiZTQxZTE1

# PIX Configuration
ASAAS_PIX_TRANSFERS_ENDPOINT=/v3/transfers
ASAAS_PIX_PAYMENTS_ENDPOINT=/v3/payments

# Environment
NODE_ENV=development
```

### ⚙️ **Configuração no Nuxt**

As variáveis são configuradas no `nuxt.config.ts`:

```typescript
runtimeConfig: {
  // Variáveis privadas (apenas no servidor)
  asaasBaseUrl: process.env.ASAAS_BASE_URL || 'https://api-sandbox.asaas.com',
  asaasAccessToken: process.env.ASAAS_ACCESS_TOKEN || '...',
  asaasPixTransfersEndpoint: process.env.ASAAS_PIX_TRANSFERS_ENDPOINT || '/v3/transfers',
  asaasPixPaymentsEndpoint: process.env.ASAAS_PIX_PAYMENTS_ENDPOINT || '/v3/payments',
}
```

### 🔧 **Flexibilidade de Configuração**

- **Base URL**: Permite alternar entre sandbox e produção
- **Endpoints**: Permite customizar endpoints específicos
- **Token**: Configuração segura do token de acesso
- **Fallbacks**: Valores padrão para desenvolvimento

## Considerações Técnicas

- **Compatibilidade**: Segue a documentação oficial da Asaas
- **Performance**: Detecção rápida via regex otimizada
- **Segurança**: Validação de entrada e tratamento de erros
- **Escalabilidade**: Fácil adição de novos tipos de PIX no futuro
- **Configurabilidade**: Variáveis de ambiente para diferentes ambientes
