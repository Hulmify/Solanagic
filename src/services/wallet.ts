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

export const generateMnemonic = (): string => {
    return bip39.generateMnemonic();
};

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

export const getBalance = async (publicKeyStr: string, network: Network): Promise<number> => {
    try {
        const connection = new Connection(clusterApiUrl(network), 'confirmed');
        const publicKey = new PublicKey(publicKeyStr);
        const balance = await connection.getBalance(publicKey);
        return balance / LAMPORTS_PER_SOL;
    } catch (e) {
        console.error("Failed to get balance", e);
        return 0;
    }
};

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
