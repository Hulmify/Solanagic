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
