# 🪄 Solanagic: AI-Powered Solana Wallet

**Solanagic** is a modern, non-custodial crypto wallet for the Solana blockchain, designed for both everyday users and developers. It provides fast, secure, and simple wallet management across Solana networks, with an AI assistant to make common actions easier.

Manage your SOL, view transactions, switch networks, and develop on Solana—all from a clean and intuitive Chrome extension.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A [Google Gemini API Key](https://ai.google.dev/) (free tier available)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Hulmify/Solanagic.git
   cd Solanagic
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

**Zoeb Chhatriwala** - _Lead Developer_

## 📄 License

This project is licensed under the MIT License.
