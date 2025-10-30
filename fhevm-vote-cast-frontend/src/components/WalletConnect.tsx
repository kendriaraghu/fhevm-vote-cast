'use client';

import { useState, useEffect } from 'react';
import { useFhevm } from '@/hooks/useFhevm';

export function WalletConnect() {
  const { isConnected, address, chainId, connect, disconnect } = useFhevm();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (chainId: number | null) => {
    if (!chainId) return 'Unknown';
    const chains: Record<number, string> = {
      1: 'Ethereum',
      11155111: 'Sepolia',
      31337: 'Localhost',
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-sm text-slate-400">Connected to</div>
          <div className="font-medium text-white">{getChainName(chainId)}</div>
        </div>
        <div className="glass-card px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm font-mono">{formatAddress(address)}</span>
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          className="glass-button text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="glass-button flex items-center space-x-2 disabled:opacity-50"
    >
      <span>🔗</span>
      <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
    </button>
  );
}
