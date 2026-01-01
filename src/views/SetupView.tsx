import { useState } from 'react';
import { generateMnemonic, createWalletFromMnemonic, type WalletAccount } from '../services/wallet';
import { saveWallet } from '../services/storage';

interface SetupViewProps {
    onWalletCreated: (wallet: WalletAccount) => void;
}

export default function SetupView({ onWalletCreated }: SetupViewProps) {
    const [step, setStep] = useState<'start' | 'create' | 'import'>('start');
    const [mnemonic, setMnemonic] = useState('');
    const [importMnemonic, setImportMnemonic] = useState('');

    const handleCreate = () => {
        const m = generateMnemonic();
        setMnemonic(m);
        setStep('create');
    };

    const handleConfirmCreate = async () => {
        const wallet = createWalletFromMnemonic(mnemonic);
        await saveWallet(wallet);
        onWalletCreated(wallet);
    };

    const handleImport = async () => {
        try {
            const wallet = createWalletFromMnemonic(importMnemonic.trim());
            await saveWallet(wallet);
            onWalletCreated(wallet);
        } catch (e) {
            alert('Invalid mnemonic');
        }
    };

    return (
        <div className="view-container setup-view">
            <h1 className="logo-text">Solanagic</h1>
            <p className="subtitle">A secure, non-custodial Solana wallet.</p>

            {step === 'start' && (
                <div className="setup-options">
                    <button className="btn-primary" onClick={handleCreate}>Create New Wallet</button>
                    <button className="btn-secondary" onClick={() => setStep('import')}>I have a wallet</button>
                </div>
            )}

            {step === 'create' && (
                <div className="create-wallet-step">
                    <h2>Secret Recovery Phrase</h2>
                    <p className="warning-text">Save these words in a safe place. This is the ONLY way to recover your funds.</p>
                    <div className="mnemonic-box">
                        {mnemonic.split(' ').map((word, i) => (
                            <span key={i} className="mnemonic-word"><span className="num">{i + 1}.</span> {word}</span>
                        ))}
                    </div>
                    <div className="button-group">
                        <button className="btn-secondary" onClick={() => {
                            navigator.clipboard.writeText(mnemonic);
                            alert('The words have been copied to your clipboard, please save them in a safe place.');
                        }}>Copy to clipboard</button>
                        <button className="btn-primary" onClick={handleConfirmCreate}>I saved it</button>
                        <button className="btn-text" onClick={() => setStep('start')}>Back</button>
                    </div>
                </div>
            )}

            {step === 'import' && (
                <div className="import-wallet-step">
                    <h2>Import Wallet</h2>
                    <textarea
                        className="input-area"
                        placeholder="Enter your seed phrase..."
                        value={importMnemonic}
                        onChange={(e) => setImportMnemonic((e.target.value ?? '').trim())}
                    />
                    <div className="button-group">
                        <button className="btn-primary" onClick={handleImport}>Import</button>
                        <button className="btn-text" onClick={() => setStep('start')}>Back</button>
                    </div>
                </div>
            )}
        </div>
    );
}
