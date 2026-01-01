import type { WalletAccount, Network } from './wallet';

const STORAGE_KEY = 'solanagic_wallet';
const NETWORK_KEY = 'solanagic_network';
const AI_KEY = 'solanagic_ai_key';

const isChromeStorageAvailable = typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;

export const saveWallet = async (wallet: WalletAccount): Promise<void> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: wallet }, () => resolve());
        });
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wallet));
        return Promise.resolve();
    }
};

export const loadWallet = async (): Promise<WalletAccount | null> => {
    if (isChromeStorageAvailable) {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                resolve((result[STORAGE_KEY] as WalletAccount) || null);
            });
        });
    } else {
        const item = localStorage.getItem(STORAGE_KEY);
        return Promise.resolve(item ? JSON.parse(item) : null);
    }
};

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
