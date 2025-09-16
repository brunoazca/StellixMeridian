# Stellix

A modern Web3 application built with Nuxt.js and Reown AppKit for wallet connection.

## 🚀 Features

- ✅ Web3 wallet connection via Reown AppKit
- ✅ Multi-network support (Ethereum, Arbitrum, Base)
- ✅ Modern and responsive interface
- ✅ Automatic detection of connected wallets

## 🛠️ Technologies

- **Nuxt.js 4** - Vue.js framework
- **Reown AppKit** - Web3 wallet connection
- **Wagmi** - Library for interacting with Ethereum
- **Viem** - TypeScript Ethereum client

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the Project ID:
   - Copy `env.example` to `.env`
   - Get a Project ID at [Reown Dashboard](https://dashboard.reown.com/)
   - Add the Project ID in the `.env` file

4. Run the project:
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Project ID

To use Reown AppKit, you need a Project ID:

1. Go to [Reown Dashboard](https://dashboard.reown.com/)
2. Create a new project
3. Copy the Project ID
4. Add it to the `.env` file:
   ```
   REOWN_PROJECT_ID=your_project_id_here
   ```

## 📁 Project Structure

```
├── app/
│   └── app.vue              # Main component
├── pages/
│   └── index.vue            # Home page
├── plugins/
│   └── appkit.client.ts     # Reown AppKit plugin
├── components/              # Vue components
├── composables/             # Vue composables
├── layouts/                 # Nuxt layouts
├── middleware/              # Nuxt middleware
├── server/                  # API routes
├── stores/                  # Pinia stores
├── types/                   # TypeScript types
├── utils/                   # Utilities
└── assets/                  # Static assets
```

## 🌐 Supported Networks

- **Ethereum** (Mainnet)
- **Arbitrum** (One)
- **Base** (Mainnet)

## 📚 Documentation

- [Reown AppKit Vue](https://docs.reown.com/appkit/vue/core/installation)
- [Nuxt.js](https://nuxt.com/)
- [Wagmi](https://wagmi.sh/)

## 🤝 Contribution

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is under the MIT license.

<img width="432" height="658" alt="image" src="https://github.com/user-attachments/assets/4ff1c332-908f-494b-9bcf-6e9b1a953a47" />
