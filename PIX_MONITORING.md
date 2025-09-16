# Sistema de Monitoramento de PIX

## Visão Geral

O sistema implementa um monitoramento automático de transações PIX recebidas, verificando a cada 15 segundos se há novos PIX na conta Asaas.

## Componentes Implementados

### 1. Endpoint de Consulta (`/api/pix/transactions`)
- **Arquivo**: `server/api/pix/transactions.get.ts`
- **Método**: GET
- **Funcionalidade**: Consulta transações PIX da API Asaas
- **Parâmetros**:
  - `limit`: Número de transações a retornar (padrão: 50)
  - `offset`: Deslocamento para paginação (padrão: 0)

### 2. Composable de Monitoramento (`usePIXMonitoring`)
- **Arquivo**: `composables/usePIXMonitoring.ts`
- **Funcionalidades**:
  - Monitoramento automático a cada 15 segundos
  - Detecção de novos PIX recebidos
  - Notificações do navegador
  - Gerenciamento de estado do monitoramento

### 3. Interface Visual
- **Localização**: `pages/index.vue`
- **Elementos**:
  - Indicador de status do monitoramento
  - Badge de notificações
  - Mensagens de erro

## Como Funciona

### 1. Inicialização
- O monitoramento inicia automaticamente quando a página é carregada
- Solicita permissão para notificações do navegador

### 2. Verificação Periódica
- A cada 15 segundos, o sistema consulta a API Asaas
- Filtra apenas transações PIX recebidas com status "CONFIRMED"
- Compara com a última transação verificada

### 3. Detecção de Novos PIX
- Identifica transações novas baseado no ID e data
- Adiciona à lista de notificações
- Exibe notificação do navegador ou alert

### 4. Notificações
- **Navegador**: Se permitido, usa a API de notificações
- **Fallback**: Alert do navegador se notificações não permitidas
- **Visual**: Badge com contador de notificações

## Configuração

### Variáveis de Ambiente
```env
ASAAS_API_URL=https://api-sandbox.asaas.com/v3/pix/transactions
ASAAS_ACCESS_TOKEN=seu_token_aqui
```

### Personalização
- **Intervalo**: Modificar o valor `15000` (15 segundos) no composable
- **Filtros**: Ajustar critérios de filtragem de transações
- **Notificações**: Personalizar mensagens e ícones

## API Response

### Endpoint `/api/pix/transactions`
```json
{
  "success": true,
  "data": [
    {
      "id": "transaction-id",
      "value": 100,
      "status": "CONFIRMED",
      "operationType": "PIX",
      "type": "BANK_ACCOUNT",
      "pixAddressKey": "email@example.com",
      "pixAddressKeyType": "EMAIL",
      "ownerName": "Nome do Remetente",
      "cpfCnpj": "***.***.***-**",
      "dateCreated": "2025-09-16 02:32:28",
      "effectiveDate": "2025-09-16 02:32:28",
      "confirmedDate": "2025-09-16 02:32:30"
    }
  ],
  "totalCount": 28,
  "hasMore": true,
  "timestamp": "2025-09-16T07:27:55.770Z",
  "message": "Transações PIX obtidas com sucesso"
}
```

## Estados do Monitoramento

### 1. Inativo
- Indicador cinza
- Texto: "PIX Monitoring Off"
- Sem verificações automáticas

### 2. Ativo
- Indicador verde com animação de pulso
- Texto: "Monitoring PIX"
- Verificações a cada 15 segundos

### 3. Com Notificações
- Badge com contador de PIX recebidos
- Animação de bounce no badge
- Lista de notificações mantida em memória

## Tratamento de Erros

### 1. Erro de API
- Exibe mensagem de erro na interface
- Continua tentando nas próximas verificações
- Log detalhado no console

### 2. Erro de Permissão
- Fallback para alert do navegador
- Não interrompe o monitoramento

### 3. Erro de Rede
- Retry automático na próxima verificação
- Mensagem de erro temporária

## Métodos Disponíveis

### usePIXMonitoring()
```typescript
const {
  isMonitoring,           // Estado do monitoramento
  receivedPIXNotifications, // Lista de notificações
  error,                  // Erro atual
  startMonitoring,        // Iniciar monitoramento
  stopMonitoring,         // Parar monitoramento
  clearNotifications,     // Limpar notificações
  fetchPIXTransactions    // Buscar transações manualmente
} = usePIXMonitoring()
```

## Segurança

- Token Asaas armazenado em variáveis de ambiente
- Validação de dados recebidos da API
- Tratamento seguro de erros
- Não exposição de informações sensíveis

## Performance

- Verificação otimizada (apenas últimas 10 transações)
- Cache de última transação verificada
- Limpeza automática de intervalos
- Debounce para evitar requisições excessivas

## Logs

O sistema gera logs detalhados para debugging:
- Início/parada do monitoramento
- Verificações periódicas
- Novos PIX detectados
- Erros de API
- Status de notificações
