import { useEffect, useState } from 'react';
import { type WalletAccount, type Network, getBalance, requestAirdrop, sendSol } from '../services/wallet';
import { clearWallet } from '../services/storage';

interface DashboardViewProps {
    wallet: WalletAccount;
    network: Network;
    setNetwork: (n: Network) => void;
    onLogout: () => void;
}

export default function DashboardView({ wallet, network, onLogout }: DashboardViewProps) {
    const [balance, setBalance] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');

    const refreshBalance = async () => {
        const b = await getBalance(wallet.publicKey, network);
        setBalance(b);
    };

    useEffect(() => {
        refreshBalance();
        // Poll balance every 10s
        const interval = setInterval(refreshBalance, 10000);
        return () => clearInterval(interval);
    }, [wallet, network]);


    const handleAirdrop = async () => {
        if (network !== 'devnet' && network !== 'testnet') return;
        setStatus('Requesting Airdrop...');
        try {
            await requestAirdrop(wallet.publicKey);
            setStatus('Airdrop successful!');
            refreshBalance();
        } catch (e: any) {
            // Check if the error is a rate limit error
            if (e.message.includes("429")) {
                setStatus('Airdrop rate limit exceeded for today, please try again tomorrow!');
                return;
            }

            // Log the error
            console.error(e);

            // Set the status to failed
            setStatus('Airdrop failed');
        }
    };

    const handleSend = async () => {
        if (!amount || !recipient) return;
        setStatus('Sending...');
        try {
            const sig = await sendSol(wallet.secretKey, recipient, parseFloat(amount), network);
            setStatus(`Sent!`);
            console.log('Signature:', sig);
            refreshBalance();
            setIsSending(false);
            setAmount('');
            setRecipient('');
        } catch (e) {
            console.error(e);
            setStatus('Transaction Failed');
        }
    };

    const handleLogout = async () => {
        const confirm = window.confirm("Are you sure? Make sure you have your seed phrase saved!");
        if (confirm) {
            await clearWallet();
            onLogout();
        }
    }

    if (isSending) {
        return (
            <div className="view-container dashboard-view">
                <div className="header">
                    <button onClick={() => setIsSending(false)} className="back-btn">← Back</button>
                    <h2>Send SOL</h2>
                </div>
                <div className="send-form">
                    <div className="input-group">
                        <label>Recipient Address</label>
                        <input
                            className="input-field"
                            placeholder="Address"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label>Amount (SOL)</label>
                        <input
                            className="input-field"
                            type="number"
                            placeholder="0.0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <button className="btn-primary" onClick={handleSend}>Confirm Send</button>
                    {status && <p className="status-text">{status}</p>}
                </div>
            </div>
        )
    }

    return (
        <div className="view-container dashboard-view">
            <div className="top-bar" style={{ justifyContent: 'flex-end' }}>
                <button className="logout-btn" onClick={handleLogout}>{'Logout'}</button>
            </div>
            <div className="balance-card">
                <p className="label">Total Balance</p>
                <h1>{balance !== null ? balance.toFixed(4) : '...'} SOL</h1>
                <div className="address-container" onClick={() => {
                    navigator.clipboard.writeText(wallet.publicKey);
                    setStatus('Address copied!');
                    setTimeout(() => setStatus(''), 2000);
                }}>
                    <p className="address">
                        {wallet.publicKey.slice(0, 6)}...{wallet.publicKey.slice(-6)}
                    </p>
                    <span className="copy-icon">
                        (Click to copy)
                    </span>
                </div>
            </div>

            <div className="actions-grid">
                <button className="action-btn" onClick={() => setIsSending(true)}>
                    <div className="icon">↑</div>
                    <span>Send</span>
                </button>
                <button className="action-btn" onClick={() => {
                    navigator.clipboard.writeText(wallet.publicKey);
                    setStatus('Address copied!');
                    setTimeout(() => setStatus(''), 2000);
                }}>
                    <div className="icon">↓</div>
                    <span>Receive</span>
                </button>
                {network === 'devnet' || network === 'testnet' ? (
                    <button className="action-btn" onClick={handleAirdrop}>
                        <div className="icon">+</div>
                        <span>Airdrop</span>
                    </button>
                ) : null}
            </div>

            {status && <p className="status-text">{status}</p>}
        </div>
    );
}
