# 🪄 Solanagic: AI-Powered Wallet

**Solanagic** is a next-generation Chrome Extension wallet for the Solana blockchain, supercharged with Artificial Intelligence. Manage your assets, view transaction history, and interact with the blockchain using natural language commands powered by Google's Gemini AI.

## ✨ Features

- **🤖 Smart AI Assistant**: 
  - Chat with your wallet! Ask questions about Solana, check your balance, or analyze transactions.
  - **Action-Oriented**: Instruct the AI to "Send SOL", "Show History", or "Get an Airdrop" and it will execute the action for you.
  - **Context-Aware**: The AI knows your wallet address, balance, and recent transaction history for smarter responses.
- **💼 Full Wallet Management**:
  - **Create & Import**: Generate new wallets or import existing ones via seed phrase.
  - **Send & Receive**: Easily send SOL and copy your address via QR code (future) or clipboard.
  - **Transaction History**: View detailed logs of your recent transactions with links to Solana Explorer.
- **🌍 Multi-Network Support**: Seamlessly switch between **Mainnet Beta**, **Devnet**, and **Testnet**.
- **💧 Devnet Airdrop**: One-click airdrop request for testing purposes.
- **🔒 Secure**: private keys and API keys are stored locally and encrypted. You explicitly manage your Gemini API Key.
- **🎨 Modern UI**: a sleek, dark-themed interface built with React and beautiful icons.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A [Google Gemini API Key](https://ai.google.dev/) (free tier available)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/ext.solanagic.git
   cd ext.solanagic
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   # or
   yarn build
   ```
   This will create a `dist` folder containing the compiled extension.

4. **Load into Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right).
   - Click **Load unpacked**.
   - Select the `dist` folder generated in the previous step.

## 📖 Usage Guides

### 🤖 Using the AI Assistant
1. Click the **"Ask AI"** button (Sparkles icon).
2. On first use, enter your **Gemini API Key**. It is saved locally.
3. Try commands like:
   - "How much SOL do I have?"
   - "Send 0.1 SOL to [Address]"
   - "What was my last transaction?"
   - "Explain how Proof of History works"

### 💸 Sending SOL
1. Click the **Send** button or ask the AI to "Send SOL".
2. Enter the recipient's public key and the amount.
3. Confirm the transaction.

### 📜 Viewing History
1. Click the **History** button or ask AI "Show my transactions".
2. See a list of recent transactions with status (Success/Fail) and timestamps.
3. Click "View on Explorer" for full details.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Blockchain**: @solana/web3.js
- **AI**: Google Generative AI (Gemini Flash model)
- **Styling**: Vanilla CSS (Custom properties & responsive design)
- **Icons**: Lucide React
- **Markdown**: react-markdown

## 🔒 Security Note
This wallet stores your mnemonic phrase and private key in your browser's local storage. While suitable for development and testing, please exercise caution with large amounts of funds on Mainnet. Always keep your seed phrase safe!

## ✍️ Author
**Zoeb Chhatriwala** - *Lead Developer*

## 📄 License
This project is licensed under the MIT License.
