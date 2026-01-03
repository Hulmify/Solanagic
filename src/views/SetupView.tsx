import { useState } from 'react';
import { generateMnemonic, createWalletFromMnemonic, type WalletAccount } from '../services/wallet';
import { saveWallet } from '../services/storage';
import { encryptWallet } from '../services/security';

interface SetupViewProps {
    onWalletCreated: (wallet: WalletAccount) => void;
}

/**
 * The Setup view for creating or importing a wallet.
 * 
 * @param {SetupViewProps} props - The component props.
 * @returns {JSX.Element} The rendered Setup component.
 */
export default function SetupView({ onWalletCreated }: SetupViewProps) {
    const [step, setStep] = useState<'start' | 'create' | 'import' | 'set-pin'>('start');
    const [mnemonic, setMnemonic] = useState('');
    const [importMnemonic, setImportMnemonic] = useState('');
    const [pendingWallet, setPendingWallet] = useState<WalletAccount | null>(null);
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');

    /**
     * Handles the initiation of the wallet creation process.
     * Generates a new mnemonic and moves to the 'create' step.
     */
    const handleCreate = () => {
        const m = generateMnemonic();
        setMnemonic(m);
        setStep('create');
    };

    /**
     * Confirms the wallet creation.
     * Creates the wallet from the mnemonic and moves to PIN setup.
     */
    const handleConfirmSaved = () => {
        const wallet = createWalletFromMnemonic(mnemonic);
        setPendingWallet(wallet);
        setStep('set-pin');
        setPin('');
        setConfirmPin('');
        setError('');
    };

    /**
     * Handles importing an existing wallet using a mnemonic.
     */
    const handleImport = async () => {
        try {
            const wallet = createWalletFromMnemonic(importMnemonic.trim());
            setPendingWallet(wallet);
            setStep('set-pin');
            setPin('');
            setConfirmPin('');
            setError('');
        } catch (e) {
            alert('Invalid mnemonic');
        }
    };

    /**
     * Handles setting the PIN and finalizing wallet creation.
     */
    const handleSetPin = async () => {
        if (pin.length < 4) {
            setError('PIN must be at least 4 characters');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }
        if (!pendingWallet) return;

        try {
            const encrypted = encryptWallet(pendingWallet, pin);
            await saveWallet(encrypted);
            onWalletCreated(pendingWallet);
        } catch (e) {
            setError('Failed to save wallet');
            console.error(e);
        }
    };

    return (
        <div className="view-container setup-view">
            <h1 className="logo-text">Solanagic</h1>
            <p className="subtitle">A secure, non-custodial Solana wallet with a built-in AI Smart Assistant.</p>

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
                        <button className="btn-primary" onClick={handleConfirmSaved}>I saved it</button>
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

            {step === 'set-pin' && (
                <div className="set-pin-step">
                    <h2>Create a PIN</h2>
                    <p className="description-text">Set a PIN to protect your wallet.</p>

                    <div className="pin-form">
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => {
                                setPin(e.target.value);
                                setError('');
                            }}
                        />
                        <input
                            type="password"
                            className="input-field"
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChange={(e) => {
                                setConfirmPin(e.target.value);
                                setError('');
                            }}
                        />
                        {error && <div className="error-message">{error}</div>}
                    </div>

                    <div className="button-group">
                        <button className="btn-primary" onClick={handleSetPin}>Finish</button>
                        <button className="btn-text" onClick={() => setStep('start')}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}
