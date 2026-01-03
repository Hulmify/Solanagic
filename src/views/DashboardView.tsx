import { useEffect, useRef, useState } from 'react';
import { type WalletAccount, type Network, getBalance, requestAirdrop, sendSol, getTransactions, type TransactionInfo } from '../services/wallet';
import { clearApiKey, clearWallet, loadApiKey, saveApiKey } from '../services/storage';
import { initAI, chatWithAI, injectContext } from '../services/ai';
import Markdown from 'react-markdown'
import { ArrowLeft, Send, Download, Gift, Sparkles, History, LogOut, Copy, ExternalLink, ArrowUp } from 'lucide-react';


interface DashboardViewProps {
    wallet: WalletAccount;
    network: Network;
    setNetwork: (n: Network) => void;
    onLogout: () => void;
}

const ContextInjector = ({ wallet, network, balance, apiKey }: { wallet: WalletAccount, network: Network, balance: number | null, apiKey: string }) => {
    useEffect(() => {
        if (!apiKey) return;

        const loadContext = async () => {
            const txs = await getTransactions(wallet.publicKey, network, 5);
            const txSummary = txs.map(t =>
                `- Sig: ${t.signature.slice(0, 8)}...${t.signature.slice(-8)}, Slot: ${t.slot}, Status: ${t.err ? 'Failed' : 'Success'}, Time: ${t.blockTime ? new Date(t.blockTime * 1000).toISOString() : 'Unknown'}`
            ).join('\n');

            const context = `
Current Wallet State:
- Address: ${wallet.publicKey}
- Network: ${network}
- Balance: ${balance} SOL
- Recent 5 Transactions:
${txSummary || "No recent transactions found."}
             `;

            injectContext(context);
        };
        loadContext();
    }, [wallet, network, balance, apiKey]);

    return null;
}

/**
 * The main Dashboard view of the wallet.
 * Displays balance, allows sending/receiving SOL, and interacting with the AI assistant.
 * 
 * @param {DashboardViewProps} props - The component props.
 * @returns {JSX.Element} The rendered Dashboard component.
 */
export default function DashboardView({ wallet, network, onLogout }: DashboardViewProps) {
    const [balance, setBalance] = useState<number | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [status, setStatus] = useState('');
    const [isAI, setIsAI] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [aiInput, setAiInput] = useState('');
    const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'model', text: string }[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [apiKeyText, setApiKeyText] = useState('');
    const [isHistory, setIsHistory] = useState(false);
    const [transactions, setTransactions] = useState<TransactionInfo[]>([]);

    // Reference to the interval
    const intervalRef = useRef<NodeJS.Timeout>(null);

    /**
     * Refreshes the wallet balance from the network.
     */
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

    useEffect(() => {
        loadApiKey().then((key) => {
            if (key) {
                setApiKey(key);
                initAI(key);
            }
        });
    }, []);

    // Clear status after 10 seconds
    useEffect(() => {
        // If status is set, clear previous interval and set new interval
        if (status) {
            // Clear previous interval
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Set new interval
            intervalRef.current = setInterval(() => setStatus(''), 10000);
        }

        // Clear interval on unmount
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
    }, [status]);


    /**
     * Handles the airdrop request on devnet.
     */
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
                setStatus('Airdrop rate limit exceeded, please try again in a while!');
                return;
            }

            // Log the error
            console.error(e);

            // Set the status to failed
            setStatus('Airdrop failed');
        }
    };

    /**
     * Handles sending SOL to another address.
     */
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

    /**
     * Handles user logout and clears the wallet from storage.
     */
    const handleLogout = async () => {
        const confirm = window.confirm("Are you sure? Make sure you have your seed phrase saved!");
        if (confirm) {
            await clearWallet();
            onLogout();
        }
    }

    /**
     * Saves the provided API Key to local storage.
     */
    const handleSaveKey = async () => {
        if (!apiKeyText) return;
        await saveApiKey(apiKeyText.trim());
        setApiKey(apiKeyText.trim());
        initAI(apiKeyText.trim());
    };

    /**
     * Clears the API Key from local storage.
     */
    const handleClearApiKey = async () => {
        await clearApiKey();
        setApiKey('');
        initAI('');
    };

    /**
     * Fetches and displays transaction history.
     */
    const handleHistory = async () => {
        setIsHistory(true);
        setStatus('Loading transactions...');
        try {
            const txs = await getTransactions(wallet.publicKey, network);
            setTransactions(txs);
            setStatus('');
        } catch (e) {
            console.error(e);
            setStatus('Failed to load transactions');
        }
    };

    /**
     * Executes actions requested by the AI.
     */
    const handleAIAction = (data: any) => {
        switch (data.action) {
            case 'SEND':
                setIsSending(true);
                if (data.recipient) setRecipient(data.recipient);
                if (data.amount) setAmount(data.amount.toString());
                break;
            case 'HISTORY':
                handleHistory();
                break;
            case 'RECEIVE':
                navigator.clipboard.writeText(wallet.publicKey);
                setAiMessages(prev => [...prev, { role: 'model', text: "✅ Address copied to clipboard!" }]);
                break;
            case 'AIRDROP':
                setIsAI(false);
                handleAirdrop();
                break;
            case 'BALANCE':
                setIsAI(false);
                refreshBalance();
                break;
        }
    }

    /**
     * Handles sending a user prompt to the AI and displaying the response.
     */
    const handleChat = async () => {
        if (!aiInput) return;
        const prompt = aiInput;
        setAiInput('');
        setIsThinking(true);
        setAiMessages(prev => [...prev, { role: 'user', text: prompt }]);
        try {
            const response = await chatWithAI(prompt);

            // Try to parse as JSON for actions
            try {
                const cleanResponse = response.trim();
                // Simple check if it looks like JSON
                if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}')) {
                    const actionData = JSON.parse(cleanResponse);
                    if (actionData.action) {
                        handleAIAction(actionData);
                        setAiMessages(prev => [...prev, { role: 'model', text: `Executing action: ${actionData.action.toLowerCase()}...` }]);
                    } else {
                        setAiMessages(prev => [...prev, { role: 'model', text: response }]);
                    }
                } else {
                    setAiMessages(prev => [...prev, { role: 'model', text: response }]);
                }
            } catch (jsonError) {
                // Determine if natural language response or error
                setAiMessages(prev => [...prev, { role: 'model', text: response }]);
            }
        } catch (e) {
            setAiMessages(prev => [...prev, { role: 'model', text: "Error: Could not get response. Check your API Key." }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (isSending) {
        return (
            <div className="view-container dashboard-view">
                <div className="header">
                    <button onClick={() => setIsSending(false)} className="back-btn">
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h2 style={{ margin: '0' }}>Send SOL</h2>
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

    if (isHistory) {
        return (
            <div className="view-container dashboard-view">
                <div className="header">
                    <button onClick={() => setIsHistory(false)} className="back-btn">
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h2 style={{ margin: '0' }}>History</h2>
                </div>
                <div className="history-list" style={{ flex: 1, overflowY: 'auto', width: '100%', marginTop: '1rem' }}>
                    {transactions.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>
                            {status || 'No transactions found.'}
                        </p>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx.signature} className="tx-item" style={{
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                marginBottom: '8px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{
                                        color: tx.err ? '#ff4d4d' : '#4caf50',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}>
                                        {tx.err ? 'Failed' : 'Success'}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>
                                        {tx.blockTime ? new Date(tx.blockTime * 1000).toLocaleString() : 'Pending'}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: '#ccc',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontFamily: 'monospace'
                                }}>
                                    {tx.signature}
                                </div>
                                <a
                                    href={`https://explorer.solana.com/tx/${tx.signature}?cluster=${network === 'mainnet-beta' ? 'mainnet-beta' : network}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ fontSize: '0.75rem', color: '#9945FF', textDecoration: 'none' }}
                                >
                                    View on Explorer <ExternalLink size={12} style={{ display: 'inline', marginLeft: '4px' }} />
                                </a>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )
    }

    if (isAI) {
        return (
            <div className="view-container dashboard-view">
                <div className="header">
                    <button onClick={() => setIsAI(false)} className="back-btn">
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>
                    <h2 style={{ margin: '0' }}>Smart Assistant</h2>
                </div>
                <div className="ai-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                    {!apiKey ? (
                        <div className="send-form">
                            <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                Enter your Gemini API Key to enable the Smart Assistant.
                            </p>
                            <div className="input-group">
                                <label>Gemini API Key</label>
                                <input
                                    className="input-field"
                                    type="password"
                                    placeholder="API Key"
                                    value={apiKeyText}
                                    onChange={(e) => setApiKeyText(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" onClick={handleSaveKey}>Save Key</button>
                            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                                The key is stored locally on your device.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                                <button
                                    className="back-btn"
                                    onClick={handleClearApiKey}
                                    style={{
                                        fontSize: '0.6rem',
                                        border: `1px solid #fff`,
                                        color: '#fff',
                                        padding: '0.6rem',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    Clear Api Key
                                </button>
                            </div>
                            <ContextInjector
                                wallet={wallet}
                                network={network}
                                balance={balance}
                                apiKey={apiKey}
                            />
                            <div className="chat-history" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                {aiMessages.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
                                        <p>Ask me anything about Solana!</p>
                                    </div>
                                )}
                                {aiMessages.map((msg, i) => (
                                    <div key={i} style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        background: msg.role === 'user' ? '#9945FF' : '#333',
                                        color: '#fff',
                                        padding: '16px 24px',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        ["--text-secondary" as any]: "#fff",
                                    }}>
                                        <Markdown>{msg.text}</Markdown>
                                    </div>
                                ))}
                                {isThinking && <div style={{ color: '#aaa', fontSize: '0.8rem', marginLeft: '10px' }}>Thinking...</div>}
                            </div>
                            <div className="chat-input" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    className="input-field"
                                    placeholder="Ask a question..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                />
                                <button className="action-btn" style={{ width: '40px', height: '40px', borderRadius: '12px' }} onClick={handleChat}>
                                    <ArrowUp size={20} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="view-container dashboard-view">
            <div className="top-bar" style={{ justifyContent: 'flex-end' }}>
                <button className="logout-btn" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span style={{ marginLeft: '4px' }}>Logout</span>
                </button>
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
                        <Copy size={12} />
                    </span>
                </div>
            </div>

            <div className="actions-grid">
                <button className="action-btn" onClick={() => setIsSending(true)}>
                    <div className="icon"><Send size={24} /></div>
                    <span>Send</span>
                </button>
                <button className="action-btn" onClick={() => {
                    navigator.clipboard.writeText(wallet.publicKey);
                    setStatus('Address copied!');
                    setTimeout(() => setStatus(''), 2000);
                }}>
                    <div className="icon"><Download size={24} /></div>
                    <span>Receive</span>
                </button>
                {network === 'devnet' || network === 'testnet' ? (
                    <button className="action-btn" onClick={handleAirdrop}>
                        <div className="icon"><Gift size={24} /></div>
                        <span>Airdrop</span>
                    </button>
                ) : null}
                <button className="action-btn" onClick={() => setIsAI(true)}>
                    <div className="icon"><Sparkles size={24} /></div>
                    <span>Ask AI</span>
                </button>

                <button className="action-btn" onClick={handleHistory}>
                    <div className="icon"><History size={24} /></div>
                    <span>History</span>
                </button>
            </div>

            {status && <p className="status-text">{status}</p>}
        </div>
    );
}
