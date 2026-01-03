import { ChatSession, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel;
let chatSession: ChatSession;


const SYSTEM_PROMPT =
    "You are an expert assistant specialized strictly in the Solana blockchain ecosystem. " +
    "You may answer questions about Solana concepts, programs, accounts, transactions, tooling, " +
    "validators, tokens, NFTs, DeFi, RPCs, and related development topics. " +
    "Do not speculate or invent information. " +
    "Be concise, technically accurate. " +
    "IMPORTANT: If the user indicates they want to perform an action available in the wallet, " +
    "you MUST return a JSON object with the action details. Do not wrap it in markdown block. " +
    "Supported Actions: " +
    "1. Send SOL: { \"action\": \"SEND\", \"recipient\": \"<address_if_provided>\", \"amount\": <number_if_provided> } " +
    "2. View History/Transactions: { \"action\": \"HISTORY\" } " +
    "3. Receive SOL/Show Address: { \"action\": \"RECEIVE\" } " +
    "4. Request Airdrop (devnet only): { \"action\": \"AIRDROP\" } " +
    "5. Check Balance: { \"action\": \"BALANCE\" } " +
    "If the user just wants to chat, return plain text.";


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
