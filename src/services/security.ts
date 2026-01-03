import CryptoJS from 'crypto-js';
import type { WalletAccount } from './wallet';

/**
 * Encrypts the wallet account data using a PIN.
 * 
 * @param {WalletAccount} wallet - The wallet account to encrypt.
 * @param {string} pin - The PIN to use for encryption.
 * @returns {string} The encrypted string.
 */
export const encryptWallet = (wallet: WalletAccount, pin: string): string => {
    const data = JSON.stringify(wallet);
    return CryptoJS.AES.encrypt(data, pin).toString();
};

/**
 * Decrypts the wallet account data using a PIN.
 * 
 * @param {string} encryptedData - The encrypted wallet data.
 * @param {string} pin - The PIN to use for decryption.
 * @returns {WalletAccount} The decrypted wallet account.
 * @throws {Error} If decryption fails (wrong PIN).
 */
export const decryptWallet = (encryptedData: string, pin: string): WalletAccount => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, pin);
        const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedData) {
            throw new Error('Invalid PIN');
        }
        return JSON.parse(decryptedData) as WalletAccount;
    } catch (e) {
        throw new Error('Invalid PIN or corrupted data');
    }
};
