import { useEffect, useState } from 'react';
import { loadWallet, loadNetwork, saveNetwork } from './services/storage';
import type { WalletAccount, Network } from './services/wallet';
import SetupView from './views/SetupView';
import DashboardView from './views/DashboardView';

/**
 * The main application component.
 * Manages the wallet state, network selection, and routing between SetupView and DashboardView.
 * 
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const [wallet, setWallet] = useState<WalletAccount | null>(null);
  const [network, setNetwork] = useState<Network>('devnet');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const w = await loadWallet();
      const n = await loadNetwork();
      setWallet(w);
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


  if (loading) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="app-container">
      {wallet ? (
        <DashboardView wallet={wallet} network={network} setNetwork={setNetwork} onLogout={() => setWallet(null)} />
      ) : (
        <SetupView onWalletCreated={setWallet} />
      )}
      <div style={{
        padding: 24,
        display: 'flex',
        justifyContent: "center",
        alignItems: "center",
      }}>
        <div className="network-selector">
          <select value={network} onChange={(e) => handleNetworkChange(e.target.value as Network)}>
            <option value="devnet">Devnet</option>
            <option value="testnet">Testnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default App;
