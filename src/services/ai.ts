import { ChatSession, GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel;
let chatSession: ChatSession;


const SYSTEM_PROMPT =
    "You are an expert assistant specialized strictly in the Solana blockchain ecosystem. " +
    "You may answer questions about Solana concepts, programs, accounts, transactions, tooling, " +
    "validators, tokens, NFTs, DeFi, RPCs, and related development topics. " +
    "Do not speculate or invent information. " +
    "Be concise, technically accurate";


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
