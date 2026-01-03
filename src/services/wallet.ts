import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Buffer } from 'buffer';

// Ensure Buffer is available
if (typeof window !== 'undefined') {
    window.Buffer = Buffer;
}

export type Network = 'devnet' | 'testnet' | 'mainnet-beta';

export interface WalletAccount {
    publicKey: string;
    secretKey: string; // stored as hex
    mnemonic?: string;
}

/**
 * Generates a new 12-word mnemonic phrase.
 * 
 * @returns {string} A 12-word mnemonic string.
 */
export const generateMnemonic = (): string => {
    return bip39.generateMnemonic();
};

/**
 * Creates a wallet account from a given mnemonic phrase.
 * Uses the standard derivation path "m/44'/501'/0'/0'".
 * 
 * @param {string} mnemonic - The 12-word mnemonic phrase.
 * @returns {WalletAccount} The generated wallet account containing public/secret keys.
 */
export const createWalletFromMnemonic = (mnemonic: string): WalletAccount => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const path = "m/44'/501'/0'/0'";
    const derivedSeed = derivePath(path, seed.toString('hex')).key;
    const keypair = Keypair.fromSeed(derivedSeed);

    return {
        publicKey: keypair.publicKey.toBase58(),
        secretKey: Buffer.from(keypair.secretKey).toString('hex'),
        mnemonic
    };
};

/**
 * Gets the balance of a wallet in SOL.
 * 
 * @param {string} publicKeyStr - The public key of the wallet as a string.
 * @param {Network} network - The Solana network to connect to.
 * @returns {Promise<number>} The balance in SOL.
 */
export const getBalance = async (publicKeyStr: string, network: Network): Promise<number | null> => {
    try {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const publicKey = new PublicKey(publicKeyStr);
        const balance = await connection.getBalance(publicKey);
        return balance / LAMPORTS_PER_SOL;
    } catch (e) {
        console.error("Failed to get balance", e);
        return null;
    }
};

/**
 * Requests an airdrop of 1 SOL on devnet.
 * 
 * @param {string} publicKeyStr - The public key to receive the airdrop.
 * @returns {Promise<string>} The transaction signature.
 */
export const requestAirdrop = async (publicKeyStr: string): Promise<string> => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const publicKey = new PublicKey(publicKeyStr);
    const signature = await connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL);

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature
    });
    return signature;
};

/**
 * Sends SOL from one wallet to another.
 * 
 * @param {string} fromSecretKeyHex - The sender's secret key in hex format.
 * @param {string} toPublicKeyStr - The recipient's public key.
 * @param {number} amount - The amount of SOL to send.
 * @param {Network} network - The network to send the transaction on.
 * @returns {Promise<string>} The transaction signature.
 */
export const sendSol = async (
    fromSecretKeyHex: string,
    toPublicKeyStr: string,
    amount: number,
    network: Network
): Promise<string> => {
    const connection = new Connection(clusterApiUrl(network), 'confirmed');
    const fromSecretKey = Buffer.from(fromSecretKeyHex, 'hex');
    const fromKeypair = Keypair.fromSecretKey(fromSecretKey);
    const toPublicKey = new PublicKey(toPublicKeyStr);

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromKeypair.publicKey,
            toPubkey: toPublicKey,
            lamports: amount * LAMPORTS_PER_SOL,
        })
    );

    const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair]
    );
    return signature;
};

export interface TransactionInfo {
    signature: string;
    slot: number;
    err: any;
    memo: string | null;
    blockTime?: number | null;
}

/**
 * Fetches the transaction history for a given wallet address.
 * 
 * @param {string} publicKeyStr - The public key of the wallet.
 * @param {Network} network - The Solana network.
 * @param {number} limit - The maximum number of transactions to fetch (default is 10).
 * @returns {Promise<TransactionInfo[]>} A list of transaction signatures and metadata.
 */
export const getTransactions = async (
    publicKeyStr: string,
    network: Network,
    limit: number = 20
): Promise<TransactionInfo[]> => {
    try {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const publicKey = new PublicKey(publicKeyStr);
        const signatures = await connection.getSignaturesForAddress(publicKey, { limit });

        return signatures.map(sig => ({
            signature: sig.signature,
            slot: sig.slot,
            err: sig.err,
            memo: sig.memo,
            blockTime: sig.blockTime
        }));
    } catch (e) {
        console.error("Failed to fetch transactions", e);
        return [];
    }
};
