import { useState } from 'react';
import { decryptWallet } from '../services/security';
import type { WalletAccount } from '../services/wallet';

interface UnlockViewProps {
    encryptedWallet: string;
    onUnlock: (wallet: WalletAccount) => void;
    onReset: () => void;
}

export default function UnlockView({ encryptedWallet, onUnlock, onReset }: UnlockViewProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUnlock = async () => {
        if (!pin) return;
        setLoading(true);
        setError('');

        // Small delay to prevent brute force (mock) and give UI feedback
        await new Promise(r => setTimeout(r, 100));

        try {
            const wallet = decryptWallet(encryptedWallet, pin);
            onUnlock(wallet);
        } catch (e) {
            setError('Incorrect PIN');
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleUnlock();
        }
    };

    return (
        <div className="view-container unlock-view">
            <h1 className="logo-text">Solanagic</h1>
            <p className="subtitle">Enter your PIN to unlock</p>

            <div className="unlock-form">
                <div className="pin-input-container">
                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value);
                            setError('');
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter PIN"
                        className="input-field pin-input"
                        autoFocus
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="button-group">
                    <button
                        className="btn-primary"
                        onClick={handleUnlock}
                        disabled={!pin || loading}
                    >
                        {loading ? 'Unlocking...' : 'Unlock'}
                    </button>
                </div>

                <div className="reset-section">
                    <button className="btn-text danger-text" onClick={() => {
                        if (confirm('This will delete your current wallet. Are you sure?')) {
                            onReset();
                        }
                    }}>
                        Reset Wallet
                    </button>
                    <p className="hint-text">If you forgot your PIN, you must reset and restore from seed.</p>
                </div>
            </div>
        </div>
    );
}
