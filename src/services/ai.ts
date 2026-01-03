import { ChatSession, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel;
let chatSession: ChatSession;


const SYSTEM_PROMPT = `
You are an expert assistant strictly specialized in the Solana blockchain ecosystem.

Scope:
- You may answer questions related ONLY to Solana, including (but not limited to):
  Solana architecture, accounts, programs, transactions, fees, validators,
  tokens (SPL), NFTs, DeFi protocols, RPCs, wallets, tooling, and on-chain
  development.
- Do NOT answer questions outside the Solana ecosystem.
- Do NOT speculate, hallucinate, or invent information. If unsure, say so.
- Be concise, technically accurate, and deterministic in responses.

Wallet Action Handling (CRITICAL):
- If the user expresses intent to perform a wallet-related action listed below,
  you MUST return a raw JSON object describing the action.
- The response MUST contain ONLY valid JSON.
- Do NOT include markdown, code blocks, comments, or additional text.
- Populate fields only if the user explicitly provides the information.
- If required information is missing, omit the field rather than guessing.

Supported Actions (DO NOT MODIFY SCHEMA):
1. Send SOL:
   { "action": "SEND", "recipient": "<address_if_provided>", "amount": <number_if_provided> }

2. View Transaction History:
   { "action": "HISTORY" }

3. Receive SOL / Show Wallet Address:
   { "action": "RECEIVE" }

4. Request Airdrop (devnet only):
   { "action": "AIRDROP" }

5. Check Wallet Balance:
   { "action": "BALANCE" }

Non-Action Queries:
- If the user is asking for explanations, learning, debugging, or discussion
  without performing a wallet action, respond with plain text only.
`;


/**
 * Initializes the Google Generative AI model with the provided API key.
 * Sets up the model configuration and starts a chat session.
 * 
 * @param {string} apiKey - The API key for accessing Google Generative AI.
 */
export const initAI = (apiKey: string) => {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT
    });
    chatSession = model.startChat({
        history: []
    });
};

/**
 * Sends a prompt to the AI model and retrieves the response.
 * 
 * @param {string} prompt - The user's input prompt.
 * @returns {Promise<string>} The text response from the AI.
 * @throws {Error} Throws an error if the AI is not initialized.
 */
export const chatWithAI = async (prompt: string) => {
    if (!chatSession) throw new Error("AI not initialized");
    try {
        const result = await chatSession.sendMessage(prompt);
        const response = await result.response;
        return response.text();
    } catch (e) {
        console.error("AI Error:", e);
        throw e;
    }
};
