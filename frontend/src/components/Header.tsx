import { ConnectButton } from '@rainbow-me/rainbowkit';
import '../styles/Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="header-left">
            <div>
              <h1 className="header-title">Confidential Miner</h1>
              <p className="header-subtitle">Encrypted compute power. Transparent rewards.</p>
            </div>
            <span className="header-badge">FHE</span>
          </div>
          <ConnectButton chainStatus="name" showBalance={false} />
        </div>
      </div>
    </header>
  );
}
