# StellixMeridian

Uma aplicação Web3 moderna construída com Nuxt.js e Reown AppKit para conexão de carteiras.

## 🚀 Funcionalidades

- ✅ Conexão com carteiras Web3 via Reown AppKit
- ✅ Suporte a múltiplas redes (Ethereum, Arbitrum, Base)
- ✅ Interface moderna e responsiva
- ✅ Detecção automática de carteiras conectadas

## 🛠️ Tecnologias

- **Nuxt.js 4** - Framework Vue.js
- **Reown AppKit** - Conexão de carteiras Web3
- **Wagmi** - Biblioteca para interação com Ethereum
- **Viem** - Cliente Ethereum TypeScript

## 📦 Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o Project ID:
   - Copie `env.example` para `.env`
   - Obtenha um Project ID em [Reown Dashboard](https://dashboard.reown.com/)
   - Adicione o Project ID no arquivo `.env`

4. Execute o projeto:
   ```bash
   npm run dev
   ```

## 🔧 Configuração

### Project ID

Para usar o Reown AppKit, você precisa de um Project ID:

1. Acesse [Reown Dashboard](https://dashboard.reown.com/)
2. Crie um novo projeto
3. Copie o Project ID
4. Adicione no arquivo `.env`:
   ```
   REOWN_PROJECT_ID=seu_project_id_aqui
   ```

## 📁 Estrutura do Projeto

```
├── app/
│   └── app.vue              # Componente principal
├── pages/
│   └── index.vue            # Página inicial
├── plugins/
│   └── appkit.client.ts     # Plugin do Reown AppKit
├── components/              # Componentes Vue
├── composables/             # Composables Vue
├── layouts/                 # Layouts do Nuxt
├── middleware/              # Middleware do Nuxt
├── server/                  # API routes
├── stores/                  # Pinia stores
├── types/                   # Tipos TypeScript
├── utils/                   # Utilitários
└── assets/                  # Assets estáticos
```

## 🌐 Redes Suportadas

- **Ethereum** (Mainnet)
- **Arbitrum** (One)
- **Base** (Mainnet)

## 📚 Documentação

- [Reown AppKit Vue](https://docs.reown.com/appkit/vue/core/installation)
- [Nuxt.js](https://nuxt.com/)
- [Wagmi](https://wagmi.sh/)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
