import type { WalletAccount, Network } from './wallet';

const STORAGE_KEY = 'solanagic_wallet';
const NETWORK_KEY = 'solanagic_network';
const AI_KEY = 'solanagic_ai_key';

const isChromeStorageAvailable = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

/**
 * Saves the wallet account to storage.
 * Uses Chrome storage if available, otherwise falls back to localStorage.
 * 
 * @param {WalletAccount} wallet - The wallet account to save.
 * @returns {Promise<void>}
 */
export const saveWallet = async (walletData: string | WalletAccount): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: walletData }, () => resolve());
        });
    } else {
        const dataToSave = typeof walletData === 'string' ? walletData : JSON.stringify(walletData);
        localStorage.setItem(STORAGE_KEY, dataToSave);
        return Promise.resolve();
    }
};

/**
 * Loads the wallet account from storage.
 * 
 * @returns {Promise<string | WalletAccount | null>} The loaded wallet account (if legacy) or encrypted string, or null.
 */
export const loadWallet = async (): Promise<string | WalletAccount | null> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                resolve((result[STORAGE_KEY] as (string | WalletAccount)) || null);
            });
        });
    } else {
        const item = localStorage.getItem(STORAGE_KEY);
        if (!item) return Promise.resolve(null);
        try {
            // Try parsing as JSON (legacy object or stringified object)
            // If it's a simple string (encrypted), JSON.parse might fail or return the string if it was JSON stringified?
            // Actually localStorage stores everything as string.
            // If we stored "U2..." (encrypted) in localStorage, getting it back is "U2...".
            // If we stored JSON.stringify({pk:..}), getting it back is "{pk:..}".
            // We need to differentiate.
            const parsed = JSON.parse(item);
            return Promise.resolve(parsed);
        } catch (e) {
            // likely a plain string that isn't JSON, or just return the item
            return Promise.resolve(item);
        }
    }
};

/**
 * Saves the selected network to storage.
 * 
 * @param {Network} network - The network identifier (e.g., 'devnet', 'mainnet-beta').
 * @returns {Promise<void>}
 */
export const saveNetwork = async (network: Network): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [NETWORK_KEY]: network }, () => resolve());
        });
    } else {
        localStorage.setItem(NETWORK_KEY, network);
        return Promise.resolve();
    }
}

/**
 * Loads the selected network from storage.
 * Defaults to 'devnet' if no network is saved.
 * 
 * @returns {Promise<Network>} The loaded network.
 */
export const loadNetwork = async (): Promise<Network> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.get([NETWORK_KEY], (result) => {
                resolve((result[NETWORK_KEY] as Network) || 'devnet');
            });
        });
    } else {
        const item = localStorage.getItem(NETWORK_KEY);
        return Promise.resolve((item as Network) || 'devnet');
    }
}

/**
 * Saves the AI API key to storage.
 * 
 * @param {string} apiKey - The Gemini API key.
 * @returns {Promise<void>}
 */
export const saveApiKey = async (apiKey: string): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [AI_KEY]: apiKey }, () => resolve());
        });
    } else {
        localStorage.setItem(AI_KEY, apiKey);
        return Promise.resolve();
    }
}

/**
 * Removes the AI API key from storage.
 * 
 * @returns {Promise<void>}
 */
export const clearApiKey = async (): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.remove([AI_KEY], () => resolve());
        });
    } else {
        localStorage.removeItem(AI_KEY);
        return Promise.resolve();
    }
}

/**
 * Loads the AI API key from storage.
 * 
 * @returns {Promise<string | null>} The loaded API key or null if not found.
 */
export const loadApiKey = async (): Promise<string | null> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.get([AI_KEY], (result) => {
                resolve((result[AI_KEY] as string) || null);
            });
        });
    } else {
        return Promise.resolve(localStorage.getItem(AI_KEY));
    }
}

/**
 * Removes the wallet account from storage (logs out).
 * 
 * @returns {Promise<void>}
 */
export const clearWallet = async (): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.remove([STORAGE_KEY], () => resolve());
        });
    } else {
        localStorage.removeItem(STORAGE_KEY);
        return Promise.resolve();
    }
}
