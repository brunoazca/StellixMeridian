# Stellix

Uma aplicação Web3 moderna que integra carteiras Stellar com funcionalidades PIX, permitindo transações entre criptomoedas e o sistema de pagamentos instantâneos brasileiro.

## 🚀 Funcionalidades

### 💳 Integração com Carteiras Stellar
- **Freighter Wallet**: Conexão direta com carteiras Stellar
- **Múltiplas Redes**: Suporte para Testnet e Mainnet
- **Balance em Tempo Real**: Visualização de saldo XLM e conversão para BRL
- **Merit Tokens**: Sistema de tokens de mérito integrado

### 💰 Sistema PIX Completo
- **Envio de PIX**: Transferências via chave PIX (Email ou CPF)
- **Recebimento de PIX**: Geração de códigos PIX para recebimento
- **Integração Asaas**: API completa para processamento de PIX
- **Monitoramento Automático**: Verificação de PIX recebidos a cada 15 segundos
- **Notificações**: Alertas em tempo real para PIX recebidos

### 🎨 Interface Moderna
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Tema Escuro**: Visual moderno e elegante
- **Animações**: Transições suaves e feedback visual

### Contratos Soroban
- **2 Contratos de Regimento do Token e Transações**: pasta ./soroban/ 


## 🛠️ Tecnologias

- **Frontend**: Vue.js 3 + Nuxt 4
- **Styling**: CSS3 com variáveis customizadas
- **Web3**: Stellar SDK + Freighter API
- **Backend**: Nitro (Nuxt Server)
- **PIX**: Integração com API Asaas
- **TypeScript**: Tipagem estática completa

## �� Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Carteira Freighter instalada no navegador

### Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/brunoazca/StellixMeridian.git
cd StellixMeridian
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Asaas API Configuration
ASAAS_API_URL=https://api-sandbox.asaas.com/v3
ASAAS_ACCESS_TOKEN=seu_token_asaas_aqui
```

4. **Execute o projeto**
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 🔧 Configuração da API Asaas

### Sandbox (Desenvolvimento)
- URL: `https://api-sandbox.asaas.com/v3`
- Token: Obtenha no painel de desenvolvedor da Asaas

### Produção
- URL: `https://api.asaas.com/v3`
- Token: Token de produção da Asaas

## �� Como Usar

### 1. Conectar Carteira
- Instale a extensão Freighter no seu navegador
- Clique em "Connect Wallet" na aplicação
- Autorize a conexão

### 2. Enviar PIX
- Clique no botão "Pay"
- Selecione o tipo de chave PIX (Email ou CPF)
- Digite a chave PIX do destinatário
- Informe o valor
- Confirme a transação

### 3. Receber PIX
- Clique no botão "Receive"
- Selecione o tipo de chave PIX
- Digite sua chave PIX
- Informe o valor desejado
- Compartilhe o código PIX gerado

### 4. Monitoramento
- O sistema monitora automaticamente PIX recebidos
- Notificações aparecem quando novos PIX chegam
- Status em tempo real na interface

## 🔒 Segurança

- **Variáveis de Ambiente**: Credenciais sensíveis protegidas
- **Validação**: Validação rigorosa de dados de entrada
- **HTTPS**: Comunicação segura com APIs
- **Sanitização**: Dados sanitizados antes do processamento

## �� Monitoramento

### Logs
- Logs detalhados no console do navegador
- Logs de servidor para debugging
- Rastreamento de transações PIX

### Métricas
- Status de conexão da carteira
- Status do monitoramento PIX
- Contadores de transações

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run generate
# Upload da pasta dist/
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## �� Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## �� Suporte

- **Issues**: [GitHub Issues](https://github.com/brunoazca/StellixMeridian/issues)
- **Documentação**: Veja os arquivos `.md` na raiz do projeto
- **Email**: suporte@stellix.com

## �� Roadmap

- [ ] Suporte a mais tipos de chave PIX
- [ ] Integração com outras carteiras Stellar
- [ ] Histórico de transações
- [ ] Exportação de relatórios
- [ ] App mobile (React Native)
- [ ] Integração com outras criptomoedas

## 📈 Status do Projeto

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

**StellixMeridian** - Conectando o futuro das finanças com o presente dos pagamentos brasileiros. 🌟
