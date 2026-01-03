import { useEffect, useState } from 'react';
import { loadWallet, loadNetwork, saveNetwork, clearWallet } from './services/storage';
import type { WalletAccount, Network } from './services/wallet';
import SetupView from './views/SetupView';
import DashboardView from './views/DashboardView';
import UnlockView from './views/UnlockView';

/**
 * The main application component.
 * Manages the wallet state, network selection, and routing between views.
 * 
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [encryptedWallet, setEncryptedWallet] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>('devnet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const w = await loadWallet();
      const n = await loadNetwork();

      if (typeof w === 'string') {
        setEncryptedWallet(w);
      } else {
        setWallet(w);
      }

      setNetwork(n);
      setLoading(false);
    };
    init();
  }, []);

  /**
   * Handles network changes and persists the selection.
   * 
   * @param {Network} n - The selected network.
   */
  const handleNetworkChange = async (n: Network) => {
    setNetwork(n);
    await saveNetwork(n);
  };

  const handleLogout = () => {
    // If encrypted, just lock (clear wallet state, keep encrypted state)
    // If legacy, clear everything (conceptually "Reset" or just "Logout")

    // Note: DashboardView handles the "Clear Storage" for legacy/reset cases before calling this if needed.
    // Except here we want to ensure state is correct.

    // If we have an encrypted wallet string in memory (even if current wallet is null, which shouldn't happen when calling logout),
    // or if we can reload it.

    // Check if we are in encrypted mode
    if (encryptedWallet || typeof loadWallet() === 'string') { // simplified check logic relies on state
      setWallet(null);
      // encryptedWallet should already be set if we are logged in, 
      // but if we are legacy, it is null.
    } else {
      setWallet(null);
    }

    // Re-verify encryption state from storage to be safe
    loadWallet().then(w => {
      if (typeof w === 'string') {
        setEncryptedWallet(w);
        setWallet(null);
      } else {
        // Legacy or empty
        setWallet(null);
        setEncryptedWallet(null);
      }
    });
  };

  const handleReset = async () => {
    await clearWallet();
    setWallet(null);
    setEncryptedWallet(null);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="app-container">
      {wallet ? (
        <DashboardView
          wallet={wallet}
          network={network}
          setNetwork={setNetwork}
          onLogout={handleLogout}
          isEncrypted={!!encryptedWallet}
        />
      ) : encryptedWallet ? (
        <UnlockView
          encryptedWallet={encryptedWallet}
          onUnlock={setWallet}
          onReset={handleReset}
        />
      ) : (
        <SetupView onWalletCreated={async (w) => {
          const res = await loadWallet();
          if (typeof res === 'string') setEncryptedWallet(res);
          setWallet(w);
        }} />
      )}
      <div style={{
        padding: '12px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: "center",
        alignItems: "center",
        gap: '12px'
      }}>
        <div className="network-selector">
          <select value={network} onChange={(e) => handleNetworkChange(e.target.value as Network)}>
            <option value="devnet">Devnet</option>
            <option value="testnet">Testnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#666', opacity: 0.8 }}>
          <a
            href="https://hulmify.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#888', textDecoration: 'none' }}
          >
            Built by Hulmify (Zoeb Chhatriwala)
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
