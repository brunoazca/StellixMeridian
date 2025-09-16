# Proteção de Rotas com Autenticação de Carteira

Este documento descreve como foi implementada a proteção de rotas para garantir que o usuário esteja conectado com a carteira Freighter antes de acessar qualquer página que não seja a index.

## Implementação

### 1. Middleware Global (`middleware/wallet-auth.global.ts`)

O middleware global verifica automaticamente se o usuário está conectado com a carteira Freighter antes de permitir acesso a qualquer rota que não seja a index (`/`).

**Funcionalidades:**
- Verifica se a extensão Freighter está disponível
- Verifica se a carteira está conectada
- Verifica se há um endereço de carteira válido
- Redireciona automaticamente para `/` se alguma verificação falhar

### 2. Composable de Autenticação (`composables/useWalletAuth.ts`)

Composable centralizado para gerenciar a autenticação da carteira.

**Métodos disponíveis:**
- `isAuthenticated()`: Verifica se o usuário está autenticado
- `requireAuth()`: Força autenticação e redireciona se necessário
- `checkAuth()`: Verificação reativa de autenticação

### 3. Proteção nas Páginas

Todas as páginas protegidas (`pay.vue`, `receive.vue`, `confirm-payment.vue`, `share-pix.vue`) incluem:

```javascript
import { useWalletAuth } from '~/composables/useWalletAuth'

const { requireAuth } = useWalletAuth()

onMounted(() => {
  requireAuth()
})
```

## Fluxo de Proteção

1. **Middleware Global**: Intercepta todas as navegações
2. **Verificação de Extensão**: Confirma se Freighter está disponível
3. **Verificação de Conexão**: Confirma se a carteira está conectada
4. **Verificação de Endereço**: Confirma se há um endereço válido
5. **Redirecionamento**: Se qualquer verificação falhar, redireciona para `/`

## Páginas Protegidas

- `/pay` - Página de pagamento PIX
- `/receive` - Página de recebimento PIX
- `/confirm-payment` - Página de confirmação de pagamento
- `/share-pix` - Página de compartilhamento PIX

## Páginas Públicas

- `/` (index) - Página principal (acesso livre)

## Logs de Debug

O sistema inclui logs detalhados para facilitar o debug:

- `🔒 Freighter not available, redirecting to index`
- `🔒 Wallet not connected, redirecting to index`
- `🔒 No wallet address available, redirecting to index`
- `🔒 Authentication required, redirecting to index`

## Considerações Técnicas

- O middleware funciona apenas no lado do cliente (`typeof window !== 'undefined'`)
- As verificações são assíncronas para garantir que a API do Freighter esteja disponível
- O sistema é reativo e responde a mudanças no estado da conexão
- Todas as verificações incluem tratamento de erros robusto
